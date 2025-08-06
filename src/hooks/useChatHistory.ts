import { useState, useEffect, useCallback } from 'react';
import { useConversations } from './useConversations';

interface Message {
  id: string;
  content: string;
  sender: "user" | "sam";
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  lastUpdated: Date;
}

export function useChatHistory() {
  const { conversations, createConversation, sendMessage, deleteConversation, isLoading } = useConversations();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Transform Supabase conversations to match the expected interface
  const sessions: ChatSession[] = conversations.map(conv => ({
    id: conv.id,
    title: conv.title,
    messages: conv.messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      sender: msg.role === 'user' ? 'user' : 'sam',
      timestamp: new Date(msg.created_at),
    })),
    createdAt: new Date(conv.created_at),
    lastUpdated: new Date(conv.updated_at),
  }));

  const createNewSession = useCallback((initialMessage?: Message) => {
    const title = initialMessage?.content.slice(0, 50) + (initialMessage?.content.length > 50 ? '...' : '') || 'New Chat';
    
    // Create conversation in Supabase
    createConversation({ title });
    
    // Note: The actual session ID will be set when the conversation is created
    // We'll need to wait for the conversations to update
    return 'pending'; // Return a placeholder ID
  }, [createConversation]);

  const addMessageToSession = useCallback((sessionId: string, message: Message) => {
    // Send message to Supabase
    sendMessage({
      conversation_id: sessionId,
      role: message.sender === 'user' ? 'user' : 'assistant',
      content: message.content,
    });
  }, [sendMessage]);

  const loadSession = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      return session.messages;
    }
    return [];
  }, [sessions]);

  const deleteSession = useCallback((sessionId: string) => {
    deleteConversation(sessionId);
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  }, [deleteConversation, currentSessionId]);

  const clearAllHistory = useCallback(() => {
    // Delete all conversations
    conversations.forEach(conv => deleteConversation(conv.id));
    setCurrentSessionId(null);
  }, [conversations, deleteConversation]);

  const getCurrentSession = useCallback(() => {
    if (!currentSessionId) return null;
    return sessions.find(s => s.id === currentSessionId) || null;
  }, [sessions, currentSessionId]);

  return {
    sessions,
    currentSessionId,
    createNewSession,
    addMessageToSession,
    loadSession,
    deleteSession,
    clearAllHistory,
    getCurrentSession,
    isLoading
  };
}