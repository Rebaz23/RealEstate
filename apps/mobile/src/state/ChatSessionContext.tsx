import React, { createContext, useContext, useState } from "react";

interface ChatSessionValue {
  conversationId: string | null;
  setConversationId: (id: string) => void;
}

const ChatSessionContext = createContext<ChatSessionValue | undefined>(undefined);

export function ChatSessionProvider({ children }: { children: React.ReactNode }) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  return (
    <ChatSessionContext.Provider value={{ conversationId, setConversationId }}>
      {children}
    </ChatSessionContext.Provider>
  );
}

export function useChatSession(): ChatSessionValue {
  const ctx = useContext(ChatSessionContext);
  if (!ctx) throw new Error("useChatSession must be used within ChatSessionProvider");
  return ctx;
}
