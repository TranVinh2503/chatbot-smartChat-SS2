import classNames from 'classnames/bind';
import styles from './Chat.module.scss';
import icons from '~/assets/icons/icons';
import UserBox from '~/components/UserBox';
import Bubble from '~/components/Bubble';
import { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AppContext } from '~/Context/AppContext';
const cx = classNames.bind(styles);

function Chat() {
    const { user } = useContext(AppContext);
    const [conversations, setConversations] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const [image, setImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState();
    const [previewUrl, setPreviewUrl] = useState(null);

    const socket = useRef();
    const scrollRef = useRef();
    useEffect(() => {
        socket.current = io('ws://localhost:8000');
        socket.current.on('getMessage', (data) => {
            setArrivalMessage({
                sender: data.senderId,
                text: data.text,
                createAt: Date.now(),
            });
        });
    }, []);

    useEffect(() => {
        arrivalMessage &&
            currentChat?.senderId === arrivalMessage?.sender &&
            setMessages((prev) => [...prev, arrivalMessage]);
    }, [arrivalMessage, currentChat]);

    useEffect(() => {
        socket.current.emit('addUser', user?.id);
        socket.current.on('getUsers', (users) => {
            console.log(users);
        });
    }, [user]);

    useEffect(() => {
        const getConversations = async () => {
            try {
                const res = await axios.get('http://localhost:8000/conversation/' + user.id);
                setConversations(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        getConversations();
    }, [user?.id]);

    useEffect(() => {
        const getMessages = async () => {
            try {
                const res = await axios.get('http://localhost:8000/message/' + currentChat?.id);
                setMessages(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        getMessages();
    }, [currentChat]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const message = {
            sender: user.id,
            text: newMessage.trim(),
            conversationId: currentChat.id,
        };

        if (message.text.trim() !== '') {
            // Check if the message is not empty or just whitespace
            socket.current.emit('sendMessage', {
                senderId: user.id,
                receiverId: user.id === currentChat.senderId ? currentChat.receiverId : currentChat.senderId,
                text: newMessage,
            });
            try {
                const res = await axios.post('http://localhost:8000/message', message);
                setMessages([...messages, res.data]);
                setNewMessage('');
            } catch (err) {
                console.log(err);
            }
        } else {
            // Handle the case where the user is trying to send an empty message
            console.log('Cannot send empty message');
        }
    };

    const handleSubmitImage = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const fileUrl = URL.createObjectURL(selectedFile);
            setPreviewUrl(fileUrl);
            setSelectedFile(selectedFile);
        }
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('grid')}>
                <div className={cx('search-container')}>
                    <div className={cx('search')}>
                        <img src={icons.search} alt="" className={cx('logo')}></img>
                        <input type="text" className={cx('input')} placeholder="Tìm kiếm người dùng"></input>
                    </div>
                </div>
                <div className={cx('chat-container')}>
                    <div className={cx('chat-list')}>
                        {conversations.map((c, index) => (
                            <div>
                                <input className={cx('chat-box')} type="radio" name="chat-box" id={index}></input>
                                <label
                                    className={cx('user-box')}
                                    htmlFor={index}
                                    onClick={() => setCurrentChat(c)}
                                    key={index}
                                >
                                    <UserBox
                                        chatbox
                                        key={index}
                                        avatarId={'mono'}
                                        idUser={user.id === c.senderId ? c.receiverId : c.senderId}
                                        content={'nhấn vào để xem'}
                                    ></UserBox>
                                </label>
                            </div>
                        ))}
                    </div>
                    <div className={cx('chat-room')}>
                        <div className={cx('chat-screen')}>
                            {currentChat ? (
                                <>
                                    {messages.map((m, index) => (
                                        <div key={index} ref={scrollRef}>
                                            <Bubble key={index} own={m.sender === user.id} content={m.text}></Bubble>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <span className={cx('no-conversations-chat')}>Vui lòng nhấn vào một hộp thoại</span>
                            )}
                        </div>
                        <div className={cx('chat-send')}>
                            <form>
                                <input
                                    type="file"
                                    name="file"
                                    id="file"
                                    className={cx('file')}
                                    onChange={handleSubmitImage}
                                ></input>
                                <label htmlFor="file">
                                    <img src={icons.picture} alt="" className={cx('icon')}></img>
                                </label>

                                <div className={cx('message-input')}>
                                    {previewUrl && (
                                        <div style={{ height: 50, width: 50 }}>
                                            <img
                                                className="avatar"
                                                src={previewUrl}
                                                style={{ height: 50, width: 50 }}
                                                alt="Avatar Preview"
                                            />
                                        </div>
                                    )}
                                    <input
                                        type="text"
                                        name="message"
                                        id="message"
                                        className={cx('input')}
                                        placeholder="Aa..."
                                        accept="image/*"
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                        }}
                                        value={newMessage}
                                    ></input>
                                </div>

                                <input
                                    type="submit"
                                    name="send"
                                    id="send"
                                    className={cx('send')}
                                    onClick={handleSubmit}
                                ></input>
                                <label htmlFor="send">
                                    <img src={icons.send} alt="" className={cx('icon')}></img>
                                </label>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Chat;
