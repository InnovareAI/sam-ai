/**
 * Sam AI Orchestration Service
 * Connects React frontend to n8n workflow orchestration system
 * Handles conversation routing, status updates, and real-time responses
 */

import { supabase } from '@/lib/supabase';

// n8n webhook endpoints
const N8N_BASE_URL = 'http://116.203.116.16:5678/webhook';
const SAM_CHAT_WEBHOOK = `${N8N_BASE_URL}/sam-chat`;

// Message types for type safety
export interface SamMessage {
  conversation_id: string;
  user_id: string;
  organization_id: string;
  content: string;
  message_type: 'text' | 'voice' | 'file';
  metadata?: Record<string, any>;
}

export interface SamResponse {
  conversation_id: string;
  processing_id: string;
  response: {
    content: string;
    sender: 'sam';
    message_type: string;
    metadata: Record<string, any>;
  };
  status: 'completed' | 'processing' | 'failed';
  timestamp: string;
}

export interface SamStatusUpdate {
  conversation_id: string;
  processing_id: string;
  status: 'processing' | 'delegating' | 'coordinating' | 'completed' | 'failed';
  message: string;
  estimated_time?: number;
  agents_assigned?: string[];
}

/**
 * Send message to Sam AI orchestration system
 */
export const sendMessageToSam = async (messageData: SamMessage): Promise<{ success: boolean; processing_id?: string; error?: string }> => {
  try {
    console.log('Sending message to Sam orchestrator:', messageData);
    
    const response = await fetch(SAM_CHAT_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        body: messageData // n8n expects data in body property
      })
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      processing_id: result.processing_id
    };

  } catch (error) {
    console.error('Error sending message to Sam:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Subscribe to Sam AI responses and status updates
 */
export class SamConversationManager {
  private conversationId: string;
  private userId: string;
  private organizationId: string;
  private statusUpdateCallback?: (update: SamStatusUpdate) => void;
  private responseCallback?: (response: SamResponse) => void;
  private supabaseSubscription?: any;

  constructor(
    conversationId: string, 
    userId: string, 
    organizationId: string,
    callbacks: {
      onStatusUpdate?: (update: SamStatusUpdate) => void;
      onResponse?: (response: SamResponse) => void;
    }
  ) {
    this.conversationId = conversationId;
    this.userId = userId;
    this.organizationId = organizationId;
    this.statusUpdateCallback = callbacks.onStatusUpdate;
    this.responseCallback = callbacks.onResponse;
    
    this.setupRealtimeSubscription();
  }

  /**
   * Setup real-time subscription to conversation updates
   */
  private setupRealtimeSubscription() {
    // Subscribe to new messages in this conversation
    this.supabaseSubscription = supabase
      .channel(`conversation:${this.conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${this.conversationId}`
      }, (payload) => {
        // Handle new Sam responses
        if (payload.new.role === 'assistant' && this.responseCallback) {
          const response: SamResponse = {
            conversation_id: this.conversationId,
            processing_id: payload.new.metadata?.processing_id || 'unknown',
            response: {
              content: payload.new.content,
              sender: 'sam',
              message_type: payload.new.message_type || 'text',
              metadata: payload.new.metadata || {}
            },
            status: 'completed',
            timestamp: payload.new.created_at
          };
          this.responseCallback(response);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public', 
        table: 'ai_conversation_context',
        filter: `conversation_id=eq.${this.conversationId}`
      }, (payload) => {
        // Handle processing status updates
        if (payload.new.processing_status && this.statusUpdateCallback) {
          const contextData = JSON.parse(payload.new.context_data || '{}');
          const update: SamStatusUpdate = {
            conversation_id: this.conversationId,
            processing_id: contextData.processing_id || 'unknown',
            status: payload.new.processing_status,
            message: this.getStatusMessage(payload.new.processing_status),
            estimated_time: contextData.estimated_time,
            agents_assigned: contextData.required_agents
          };
          this.statusUpdateCallback(update);
        }
      })
      .subscribe();
  }

  /**
   * Send message through orchestration system
   */
  async sendMessage(content: string, messageType: 'text' | 'voice' | 'file' = 'text', metadata?: Record<string, any>) {
    const messageData: SamMessage = {
      conversation_id: this.conversationId,
      user_id: this.userId,
      organization_id: this.organizationId,
      content,
      message_type: messageType,
      metadata
    };

    return sendMessageToSam(messageData);
  }

  /**
   * Generate user-friendly status messages
   */
  private getStatusMessage(status: string): string {
    switch (status) {
      case 'processing':
        return 'Sam is analyzing your request...';
      case 'delegating':
        return 'Sam is routing your request to the right specialist...';
      case 'coordinating':
        return 'Sam is coordinating multiple AI agents to help you...';
      case 'completed':
        return 'Sam has completed processing your request.';
      case 'failed':
        return 'Sam encountered an issue. Please try again.';
      default:
        return 'Sam is working on your request...';
    }
  }

  /**
   * Get conversation history from database
   */
  async getConversationHistory() {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', this.conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }

    return data.map(msg => ({
      id: msg.id,
      content: msg.content,
      sender: msg.role === 'user' ? 'user' : 'sam',
      timestamp: new Date(msg.created_at),
      metadata: msg.metadata
    }));
  }

  /**
   * Get current processing status
   */
  async getProcessingStatus() {
    const { data, error } = await supabase
      .from('ai_conversation_context')
      .select('*')
      .eq('conversation_id', this.conversationId)
      .eq('context_type', 'intent_analysis')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return null;
    }

    const context = data[0];
    const contextData = JSON.parse(context.context_data || '{}');
    
    return {
      status: context.processing_status,
      agents_assigned: JSON.parse(context.agent_assignments || '[]'),
      estimated_time: contextData.estimated_time,
      processing_started: context.created_at
    };
  }

  /**
   * Cleanup subscriptions
   */
  cleanup() {
    if (this.supabaseSubscription) {
      this.supabaseSubscription.unsubscribe();
    }
  }
}

/**
 * Create conversation manager instance
 */
export const createSamConversation = (
  conversationId: string,
  userId: string, 
  organizationId: string,
  callbacks: {
    onStatusUpdate?: (update: SamStatusUpdate) => void;
    onResponse?: (response: SamResponse) => void;
  }
) => {
  return new SamConversationManager(conversationId, userId, organizationId, callbacks);
};

/**
 * Utility function to generate conversation ID
 */
export const generateConversationId = (): string => {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Test function to verify orchestration connection
 */
export const testSamOrchestration = async (): Promise<boolean> => {
  try {
    const testMessage: SamMessage = {
      conversation_id: 'test_conv_health_check',
      user_id: 'test_user',
      organization_id: 'test_org',
      content: 'Health check - please respond with a simple greeting',
      message_type: 'text',
      metadata: { test: true }
    };

    const result = await sendMessageToSam(testMessage);
    return result.success;
  } catch (error) {
    console.error('Sam orchestration health check failed:', error);
    return false;
  }
};

export default {
  sendMessageToSam,
  SamConversationManager,
  createSamConversation,
  generateConversationId,
  testSamOrchestration
};