import React, { useContext, useEffect, useRef, useState } from "react";
import { Message } from "./Message";
import { BotMessage } from "./BotMessage";
import { ChatContext } from "../context/ChatContext";

export const Messages = () => {
  const { conversationId } = useContext(ChatContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchData = async () => {
    const response = await fetch(
      `http://localhost:5000/get_messages/${conversationId}`
    );
    const data = await response.json();
    console.log(data);
    return data.messages;
  };

  useEffect(() => {
    if (conversationId) {
      fetchData().then((fetchedMessages) => {
        setMessages(fetchedMessages);
      });
    }
  }, [conversationId]);
  
  const handleAddNewChat = async () => {
    if (conversationId && newMessage !== "") {
      setSending(true);
      setNewMessage("");
      console.log("ready");
      try {
        const response = await fetch("http://localhost:5000/chatbot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversation_id: conversationId,
            input_text: newMessage,
          }),
        });

        if (response.status === 200) {
          const data = await response.json();
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: newMessage, response: data.response },
          ]);
          console.log(messages);
        } else {
          console.log("Error sending message:", response.status);
      }
      } catch (error) {
        console.log("Error sending message:", error);
      } finally {
        setSending(false);
      }
    }
  };

  return (
    <>
      <div className="messages">
        {messages.length > 0 &&
          messages.map((value, index) => {
            return (
              <div key={index}>
                <Message text={value.text} />
                <BotMessage text={value.response} />
              </div>
            );
          })}
        <div ref={scrollRef}></div>
      </div>
      <div className="input">
        <input
          type="text"
          placeholder="Type something ..."
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleAddNewChat();
            }
          }}
        />
        <div className="send">
          <button onClick={handleAddNewChat} disabled={sending}>
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </>
  );
};
