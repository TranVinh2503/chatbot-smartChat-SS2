import { createContext, useState } from "react";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const [conversationId, setConversationId] = useState(null);

  return (
    <ChatContext.Provider value={{ conversationId, setConversationId }}>
      {children}
    </ChatContext.Provider>
  );
};
