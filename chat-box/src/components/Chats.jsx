import React, { useContext, useEffect, useState } from "react";
import jwtDecode from "jwt-decode";
import { ChatContext } from "../context/ChatContext";

export const Chats = () => {
  const { setConversationId, conversationId } = useContext(ChatContext);
  const [conversations, setConversations] = useState([]);
  const [isAddingNewChat, setIsAddingNewChat] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [userName, setUserName] = useState("");
  const [id, setID] = useState();
  const [numConversations, setNumConversations] = useState(0); // New state variable

  function getUserFromToken(token) {
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken;
    } catch (error) {
      if (error.name === "InvalidTokenError") {
        console.log("Invalid token specified");
      } else {
        console.log("Error decoding token:", error.message);
      }
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    const result = getUserFromToken(token);
    setID(result.id);
    setUserName(result.username);
  }, []);

  useEffect(() => {
    if (id != null || id != undefined) {
      const fetchData = async () => {
        const response = await fetch(
          `http://localhost:5000/get_conversations/${id}`
        );
        const data = await response.json();
        console.log(data.conversations);
        setConversations(data.conversations.reverse());
      };
      fetchData();
    }
  }, [id, numConversations]); // Include numConversations in the dependency array

  const handleNewChatNameChange = (event) => {
    setNewChatName(event.target.value);
  };
  const handleAddNewChat = async () => {
    if (!newChatName) return;

    const response = await fetch("http://localhost:5000/conversation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: id, name: newChatName }),
    });

    if (response.status === 201) {
      const data = await response.json();
      setConversations([data, ...conversations]);
      setNewChatName("");
      setIsAddingNewChat(false);
      setNumConversations((prevNumConversations) => prevNumConversations + 1); // Increment numConversations
      window.location.reload(false);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    const response = await fetch(
      `http://localhost:5000/delete_conversations/${conversationId}`,
      {
        method: "DELETE",
      }
    );

    if (response.status === 200) {
      setConversations(
        conversations.filter(
          (conversation) => conversation._id !== conversationId
        )
      );
    } else {
      console.log("Failed to delete conversation.");
    }
  };

  const handleGetMessages = (e) => {
    const conversationId = e;
    setConversationId(conversationId);
  };

  return (
    <div className="chats">
      <div className="search">
        <div className="searchForm">
          {isAddingNewChat ? (
            <div
              className="addNewChatForm"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                placeholder="Enter Name Chat"
                value={newChatName}
                onChange={handleNewChatNameChange}
                style={{
                  backgroundColor: "#2f2d52",
                  border: "1px",
                  color: "white",
                  outline: "none",
                  width: "310px",
                  height: "60px",
                  borderRadius: "10px",
                }}
              />
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <button
                  onClick={() => setIsAddingNewChat(false)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#700b10",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "16px",
                    cursor: "pointer",
                    width: "100px",
                    height: "35px",
                    marginTop: "10px",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNewChat}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#536399",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "16px",
                    cursor: "pointer",
                    width: "100px",
                    height: "35px",
                    marginTop: "10px",
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setIsAddingNewChat(true)}>
              Add new chat
            </button>
          )}
        </div>
      </div>
      {conversations.map((value, index) => {
        return (
          <span key={index} onClick={() => handleGetMessages(value._id)}>
            <div
              className="userChat"
              key={index}
              style={{
                backgroundColor:
                  conversationId === value._id ? "#5d5b8d" : "transparent",
              }}
            >
              <div className="userChatInfor">
                <i className="fa-solid fa-message fa-xl"></i>
                <span
                  style={{
                    fontWeight:
                      conversationId === value._id ? "bold" : "normal",
                  }}
                >
                  {value.name}
                </span>
              </div>
              <button
                onClick={() => handleDeleteConversation(value._id)}
                className="btnIcon"
              >
                <i className="fa-regular fa-trash-can fa-xl"></i>
              </button>
            </div>
          </span>
        );
      })}
    </div>
  );
};
