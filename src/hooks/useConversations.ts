import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Conversation, Message, subscribeToTable } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
  lastMessage?: Message;
  messageCount: number;
  unreadCount: number;
}

export interface CreateConversationData {
  title?: string;
  contact_id?: string;
  context?: any;
  metadata?: any;
}

export interface CreateMessageData {
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  message_type?: string;
  metadata?: any;
  tool_calls?: any;
}

export const useConversations = () => {
  const { organization, user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch conversations
  const {
    data: conversations = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['conversations', organization?.id],
    queryFn: async (): Promise<ConversationWithMessages[]> => {
      if (!organization?.id) return [];

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          messages(
            id,
            role,
            content,
            message_type,
            metadata,
            created_at
          ),
          contacts(
            full_name,
            email,
            company
          )
        `)
        .eq('organization_id', organization.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        throw error;
      }

      return data.map((conv): ConversationWithMessages => {
        const messages = (conv.messages || []).sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        const lastMessage = messages[messages.length - 1];
        const unreadCount = messages.filter(
          m => m.role === 'assistant' && 
          (!m.metadata || !(m.metadata as any).read)
        ).length;

        return {
          ...conv,
          messages,
          lastMessage,
          messageCount: messages.length,
          unreadCount,
        };
      });
    },
    enabled: !!organization?.id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (conversationData: CreateConversationData): Promise<Conversation> => {
      if (!organization?.id || !user?.id) {
        throw new Error('No organization or user context');
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          organization_id: organization.id,
          user_id: user.id,
          title: conversationData.title || 'New Conversation',
          contact_id: conversationData.contact_id,
          context: conversationData.context || {},
          metadata: conversationData.metadata || {},
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', organization?.id] });
      toast({
        title: 'Conversation Started',
        description: 'A new conversation has been created.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Creating Conversation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Add message mutation
  const addMessageMutation = useMutation({
    mutationFn: async (messageData: CreateMessageData): Promise<Message> => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: messageData.conversation_id,
          role: messageData.role,
          content: messageData.content,
          message_type: messageData.message_type || 'text',
          metadata: messageData.metadata || {},
          tool_calls: messageData.tool_calls,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding message:', error);
        throw error;
      }

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', messageData.conversation_id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', organization?.id] });
    },
    onError: (error) => {
      toast({
        title: 'Error Sending Message',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async ({ conversationId, messageIds }: { conversationId: string; messageIds: string[] }): Promise<void> => {
      const { error } = await supabase
        .from('messages')
        .update({
          metadata: { read: true, read_at: new Date().toISOString() }
        })
        .in('id', messageIds)
        .eq('conversation_id', conversationId);

      if (error) {
        console.error('Error marking messages as read:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', organization?.id] });
    },
  });

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string): Promise<void> => {
      // Delete messages first (due to foreign key constraint)
      await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      // Then delete conversation
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)
        .eq('organization_id', organization?.id);

      if (error) {
        console.error('Error deleting conversation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', organization?.id] });
      toast({
        title: 'Conversation Deleted',
        description: 'The conversation has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Deleting Conversation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Real-time subscriptions
  useEffect(() => {
    if (!organization?.id) return;

    const conversationsChannel = subscribeToTable('conversations', (payload) => {
      console.log('Conversation update:', payload);
      queryClient.invalidateQueries({ queryKey: ['conversations', organization.id] });
    });

    const messagesChannel = subscribeToTable('messages', (payload) => {
      console.log('Message update:', payload);
      queryClient.invalidateQueries({ queryKey: ['conversations', organization.id] });
    });

    return () => {
      conversationsChannel.unsubscribe();
      messagesChannel.unsubscribe();
    };
  }, [organization?.id, queryClient]);

  // Helper functions
  const createConversation = (data: CreateConversationData) => {
    createConversationMutation.mutate(data);
  };

  const sendMessage = (data: CreateMessageData) => {
    addMessageMutation.mutate(data);
  };

  const markConversationAsRead = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      const unreadMessageIds = conversation.messages
        .filter(m => m.role === 'assistant' && (!m.metadata || !(m.metadata as any).read))
        .map(m => m.id);
      
      if (unreadMessageIds.length > 0) {
        markAsReadMutation.mutate({ conversationId, messageIds: unreadMessageIds });
      }
    }
  };

  const deleteConversation = (conversationId: string) => {
    deleteConversationMutation.mutate(conversationId);
  };

  return {
    conversations,
    isLoading: isLoading || createConversationMutation.isPending || addMessageMutation.isPending,
    error,
    refetch,
    createConversation,
    sendMessage,
    markConversationAsRead,
    deleteConversation,
    isCreatingConversation: createConversationMutation.isPending,
    isSendingMessage: addMessageMutation.isPending,
    isDeleting: deleteConversationMutation.isPending,
  };
};

// Hook for a specific conversation
export const useConversation = (conversationId: string) => {
  const { conversations, sendMessage, markConversationAsRead } = useConversations();
  
  const conversation = conversations.find(c => c.id === conversationId);

  return {
    conversation,
    messages: conversation?.messages || [],
    sendMessage: (role: 'user' | 'assistant', content: string, metadata?: any) => {
      sendMessage({
        conversation_id: conversationId,
        role,
        content,
        metadata,
      });
    },
    markAsRead: () => markConversationAsRead(conversationId),
  };
};

// Hook for conversation statistics
export const useConversationStats = () => {
  const { conversations, isLoading } = useConversations();
  
  const stats = {
    total: conversations.length,
    active: conversations.filter(c => c.status === 'active').length,
    archived: conversations.filter(c => c.status === 'archived').length,
    totalMessages: conversations.reduce((sum, c) => sum + c.messageCount, 0),
    unreadMessages: conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    withContacts: conversations.filter(c => c.contact_id).length,
  };

  return { stats, isLoading };
};