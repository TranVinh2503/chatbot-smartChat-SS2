from flask import Flask, jsonify, request
import nltk
import json
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet
from nltk import pos_tag
from nltk.tokenize import word_tokenize
from pymongo import MongoClient
from bson import ObjectId
from flask_bcrypt import Bcrypt
from bson.json_util import dumps
from werkzeug.security import generate_password_hash, check_password_hash

import jwt
from datetime import datetime, timedelta
from flask import current_app
from bson import json_util
from bson import errors


from flask_cors import CORS, cross_origin

def create_token(user_id):
    """
    Create a JWT token for the user with the given user ID.
    """
    # Define the token's payload
    payload = {
        'sub': str(user_id),
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(days=1)
    }

    # Create the token using the app's secret key
    key = str(current_app.config['SECRET_KEY'])
    token = jwt.encode(payload, key, algorithm='HS256')

    # Return the token as a string
    return token

bcrypt = Bcrypt()

app = Flask(__name__)

cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
# Key to sign the JWT token
app.config['SECRET_KEY'] = 'your_secret_key_here'


client = MongoClient('mongodb://localhost:27017/')
db = client['chatbotDatabase']
messages = db['messages']
conversations = db['conversations']

# Load the data from the file
with open('data.txt') as f:
    data = json.load(f)

# Check if the data is a list of intents
if not isinstance(data, list):
    raise ValueError('Data must be a list of intents.')

# Preprocess the data by lemmatizing and tokenizing the text
lemmatizer = WordNetLemmatizer()
preprocessed_data = []
for intent in data:
    examples = []
    for example in intent['examples']:
        tokens = word_tokenize(example.lower())
        pos_tags = pos_tag(tokens)
        lemmatized_tokens = []
        for token, pos in pos_tags:
            if pos.startswith('NN'):
                pos = wordnet.NOUN
            elif pos.startswith('VB'):
                pos = wordnet.VERB
            elif pos.startswith('JJ'):
                pos = wordnet.ADJ
            elif pos.startswith('R'):
                pos = wordnet.ADV
            else:
                pos = wordnet.NOUN
            lemmatized_token = lemmatizer.lemmatize(token, pos=pos)
            lemmatized_tokens.append(lemmatized_token)
        examples.append((lemmatized_tokens, intent['intent']))
    preprocessed_data.extend(examples)
# Define the features for the chatbot
def get_features(text):
    features = {}
    for word in text:
        features[word] = True
    return features

# Extract the features from the preprocessed data
featuresets = [(get_features(text), intent) for (text, intent) in preprocessed_data]

# Train the chatbot using a NaiveBayes classifier
classifier = nltk.NaiveBayesClassifier.train(featuresets)

@app.route('/conversation',methods = ['POST'])
@cross_origin()
def conversation():
    data = request.json
    userId = data['userId']
    name = data['name']
    conversation_data = {
        'userId': userId,
        'name': name
    }

    # Insert the new conversation into the database
    result = db.conversations.insert_one(conversation_data)
    conversationID = str(result.inserted_id)

    # Return the conversation data and ID
    return jsonify({'id': conversationID, 'userId': userId, 'name': name}), 201

def is_valid_topic(topic):
    for intent in data:
        if intent['intent'] == topic:
            return True
    return False
@app.route('/get_conversations/<string:user_id>', methods=['GET'])
@cross_origin()
def get_conversations_by_user_id(user_id):
    conversations = list(db.conversations.find({'userId': user_id}))
    for conv in conversations:
        conv['_id'] = str(conv['_id'])
    return json.loads(json_util.dumps({'conversations': conversations}))


@app.route('/delete_conversations/<conversation_id>', methods=['DELETE'])
def delete_conversation(conversation_id):
    try:
        result = conversations.delete_one({'_id': ObjectId(conversation_id)})
        if result.deleted_count == 1:
            return jsonify({'success': True}), 200
        else:
            return jsonify({'success': False, 'message': 'Conversation not found'}), 404
    except errors.InvalidId:
        return jsonify({'success': False, 'message': 'Invalid conversation ID'}), 400
    except:
        return jsonify({'success': False, 'message': 'Internal server error'}), 500
def is_greeting_question(text):
    """
    Kiểm tra xem câu nhập vào có phải là câu chào hỏi hay không.
    """
    greetings = ['xin chào', 'chào', 'hi', 'hello', 'hey']
    tokens = word_tokenize(text.lower())
    for token in tokens:
        if token in greetings:
            return True
    return False
def is_endChatbot(text):
    endChatBots = ["bye", "bye bye"]
    tokens = word_tokenize(text.lower())
    for token in tokens:
        if token in endChatBots:
            return True
    return False
@app.route('/chatbot', methods=['POST'])
@cross_origin()
def chatbot():
    conversationID = request.json['conversation_id']
    input_text = request.json['input_text']
    if is_greeting_question(input_text):
        response = "Hello! I am a chatbot, I can help you with chatbot related questions."
        message = {'conversation_id':conversationID,'text': input_text, 'response': response}
        messages.insert_one(message)
        return jsonify({'response': response})
    elif is_endChatbot(input_text):
        response = "Bye!"
        message = {'conversation_id':conversationID,'text': input_text, 'response': response}
        messages.insert_one(message)
        return jsonify({'response': response})
    elif len(input_text) <= 10:
        response = "Sorry, I don't understand your question. Please enter a specific question with the most predefined topic!"
        message = {'conversation_id':conversationID,'text': input_text, 'response': response}
        messages.insert_one(message)
        return jsonify({'response': response})
    else: 
        tokens = word_tokenize(input_text.lower())
        pos_tags = pos_tag(tokens)
        lemmatized_tokens = []
        for token, pos in pos_tags:
            if pos.startswith('NN'):
                pos = wordnet.NOUN
            elif pos.startswith('VB'):
                pos = wordnet.VERB
            elif pos.startswith('JJ'):
                pos = wordnet.ADJ
            elif pos.startswith('R'):
                pos = wordnet.ADV
            else:
                pos = wordnet.NOUN
            lemmatized_token = lemmatizer.lemmatize(token, pos=pos)
            lemmatized_tokens.append(lemmatized_token)
        features = get_features(lemmatized_tokens)
        predicted_intent = classifier.classify(features)

        if is_valid_topic(predicted_intent):
            response = [intent['response'] for intent in data if intent['intent'] == predicted_intent][0]
        else:
            response = "Xin lỗi, tôi không hiểu câu hỏi của bạn. Vui lòng thử lại với một chủ đề khác."

        message = {'conversation_id':conversationID,'text': input_text, 'response': response}
        messages.insert_one(message)

        return jsonify({'response': response})
    

@app.route('/get_messages/<string:conversation_id>', methods=['GET'])
@cross_origin()
def get_messages_by_conversation_id(conversation_id):
    messages = list(db.messages.find({'conversation_id': conversation_id}))
    for conv in messages:
        conv['_id'] = str(conv['_id'])
    return json.loads(json_util.dumps({'messages': messages}))

@app.route('/register', methods=['POST'])
@cross_origin()
def register():
    # Get the user data from the request
    data = request.json
    name = data['name']
    password = data['password']
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # Check if the email is already registered
    if db.users.find_one({'name': name}):
        return jsonify({'error': 'Name already registered.'}), 400

    # Insert the new user into the database
    result = db.users.insert_one({'name': name, 'password': hashed_password})
    user_id = str(result.inserted_id)

    # Return the user data and ID
    return jsonify({'_id': user_id, 'name': name}), 201


def check_password(db_password, form_password):
    return check_password_hash(db_password, form_password)

# Define the endpoint for user login
@app.route('/login', methods=['POST'])
@cross_origin()
def login():
    # Get the username and password from the request
    username = request.json['name']
    password = request.json['password']

    # Search for the user in the database
    user = db.users.find_one({'name': username})

    # If the user is not found, return an error message
    if user is None:
        return jsonify({'error': 'Invalid username or password.'})

    # If the user is found, check the password
    if bcrypt.check_password_hash(user['password'], password):
        # If the password is correct, return a success message
        token_data = {
            'id': str(user['_id']),
            'username': user['name'],
            'exp': datetime.utcnow() + timedelta(days=1)
        }
        token = jwt.encode(token_data, str(app.config['SECRET_KEY']), algorithm='HS256')
        response = {'message':'true', 'token': token}
        return response, 200
    else:
        # If the password is incorrect, return an error message
        return jsonify({'error': 'Invalid username or password.'})


if __name__ == '__main__':
    app.run(debug=True)
