import { supabase } from "@/integrations/supabase/client";

export interface AgentConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  contextWindow: number;
}

export interface AgentMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AgentResponse {
  content: string;
  metadata?: {
    model: string;
    tokensUsed: number;
    processingTime: number;
  };
}

// Default AI Agent Configuration
export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  model: "gpt-4-turbo-preview",
  temperature: 0.7,
  maxTokens: 2000,
  contextWindow: 8000,
  systemPrompt: `You are Sam, an expert AI sales assistant specializing in B2B sales automation and outreach optimization. Your role is to help users:

1. Create and optimize sales campaigns across email, LinkedIn, and other channels
2. Craft compelling sales copy and messaging
3. Analyze campaign performance and provide actionable insights
4. Build effective outreach sequences
5. Define and understand target audiences
6. Improve response rates and conversion metrics

Key behaviors:
- Be conversational, friendly, and professional
- Provide specific, actionable advice
- Use data and best practices to support recommendations
- Ask clarifying questions when needed
- Break complex tasks into manageable steps
- Celebrate wins and encourage continuous improvement

Remember: You have access to the user's campaign data, contact lists, and performance metrics. Use this context to provide personalized recommendations.`
};

// Agent service for managing AI interactions
export class AgentService {
  private config: AgentConfig;
  private conversationHistory: AgentMessage[] = [];
  
  constructor(config: AgentConfig = DEFAULT_AGENT_CONFIG) {
    this.config = config;
    this.initializeConversation();
  }
  
  private initializeConversation() {
    this.conversationHistory = [
      {
        role: "system",
        content: this.config.systemPrompt
      }
    ];
  }
  
  // Add user context from database
  async addUserContext(userId: string) {
    try {
      // Fetch user's campaigns
      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("name, type, status, stats")
        .limit(5);
      
      // Fetch recent contacts
      const { data: contacts } = await supabase
        .from("contacts")
        .select("company, role, status")
        .limit(10);
      
      // Build context message
      let contextMessage = "Current user context:\n";
      
      if (campaigns && campaigns.length > 0) {
        contextMessage += `\nActive Campaigns: ${campaigns.map(c => c.name).join(", ")}`;
        
        // Calculate aggregate stats
        const totalContacts = campaigns.reduce((sum, c) => sum + (c.stats?.contacts || 0), 0);
        const totalReplies = campaigns.reduce((sum, c) => sum + (c.stats?.replied || 0), 0);
        
        contextMessage += `\nTotal contacts reached: ${totalContacts}`;
        contextMessage += `\nTotal replies: ${totalReplies}`;
      }
      
      if (contacts && contacts.length > 0) {
        const companies = [...new Set(contacts.map(c => c.company).filter(Boolean))];
        contextMessage += `\nRecent companies engaged: ${companies.slice(0, 5).join(", ")}`;
      }
      
      this.conversationHistory.push({
        role: "system",
        content: contextMessage
      });
    } catch (error) {
      console.error("Error loading user context:", error);
    }
  }
  
  // Process a message and get AI response
  async processMessage(userMessage: string): Promise<AgentResponse> {
    // Add user message to history
    this.conversationHistory.push({
      role: "user",
      content: userMessage
    });
    
    // Trim conversation history if it exceeds context window
    this.trimConversationHistory();
    
    try {
      // For now, use Supabase Edge Function for AI processing
      const { data, error } = await supabase.functions.invoke('ai-agent', {
        body: {
          messages: this.conversationHistory,
          config: this.config
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Add assistant response to history
      this.conversationHistory.push({
        role: "assistant",
        content: data.content
      });
      
      return {
        content: data.content,
        metadata: data.metadata
      };
    } catch (error) {
      console.error("Error processing AI message:", error);
      
      // Fallback response
      return {
        content: "I'm having trouble processing your request right now. Please try again or rephrase your question.",
        metadata: {
          model: "fallback",
          tokensUsed: 0,
          processingTime: 0
        }
      };
    }
  }
  
  // Trim conversation history to fit within context window
  private trimConversationHistory() {
    // Keep system prompt and last N messages
    const maxMessages = 20;
    
    if (this.conversationHistory.length > maxMessages) {
      const systemMessages = this.conversationHistory.filter(m => m.role === "system").slice(0, 2);
      const recentMessages = this.conversationHistory.slice(-maxMessages + systemMessages.length);
      this.conversationHistory = [...systemMessages, ...recentMessages];
    }
  }
  
  // Get conversation summary
  getConversationSummary(): string {
    const userMessages = this.conversationHistory.filter(m => m.role === "user");
    const topics = this.extractTopics(userMessages.map(m => m.content).join(" "));
    return `Topics discussed: ${topics.join(", ")}`;
  }
  
  // Extract main topics from text
  private extractTopics(text: string): string[] {
    const keywords = [
      "campaign", "email", "linkedin", "outreach", "audience",
      "copy", "subject", "response", "rate", "conversion",
      "target", "persona", "sequence", "follow-up", "metrics"
    ];
    
    const topics = new Set<string>();
    const lowerText = text.toLowerCase();
    
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        topics.add(keyword);
      }
    });
    
    return Array.from(topics).slice(0, 5);
  }
  
  // Reset conversation
  reset() {
    this.initializeConversation();
  }
  
  // Export conversation
  exportConversation(): AgentMessage[] {
    return [...this.conversationHistory];
  }
  
  // Import conversation
  importConversation(messages: AgentMessage[]) {
    this.conversationHistory = messages;
  }
}