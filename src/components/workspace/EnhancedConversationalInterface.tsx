import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Zap, Target, Users, MessageSquare, BookOpen, TrendingUp, Plus, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SamStatusIndicator } from "./SamStatusIndicator";
import { MessageFormatter } from "./MessageFormatter";
import { VoiceInterface } from "./VoiceInterface";
import { ChatHistory } from "./ChatHistory";
import { ContextMemory } from "./ContextMemory";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useVoice } from "@/hooks/useVoice";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { ChatSkeleton } from "@/components/ui/skeleton";
import { createSamConversation, generateConversationId, SamStatusUpdate, SamResponse } from "@/services/samOrchestrator";
import { getCurrentUserContext } from "@/lib/supabase";

interface Message {
  id: string;
  content: string;
  sender: "user" | "sam";
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface QuickAction {
  title: string;
  description: string;
  prompt: string;
  icon: any;
  color: string;
}

interface ProcessingStatus {
  isProcessing: boolean;
  message: string;
  estimatedTime?: number;
  agentsAssigned?: string[];
  processingId?: string;
}

const quickActions: QuickAction[] = [
  {
    title: "Research leads in my industry",
    description: "Find potential prospects and company information",
    prompt: "Help me research leads in the tech industry. I'm looking for companies with 50-500 employees that might need sales automation tools.",
    icon: Users,
    color: "from-green-500 to-teal-600"
  },
  {
    title: "Create outreach content", 
    description: "Generate email templates and LinkedIn messages",
    prompt: "Create personalized outreach content for B2B sales. I need email templates, LinkedIn connection requests, and follow-up messages for SaaS prospects.",
    icon: MessageSquare,
    color: "from-purple-500 to-pink-600"
  },
  {
    title: "Plan a campaign strategy",
    description: "Design multi-touch campaign sequences",
    prompt: "Help me plan a comprehensive outreach campaign strategy. Include email sequences, LinkedIn touchpoints, and timing recommendations for maximum engagement.",
    icon: Target,
    color: "from-cyan-500 to-blue-600"
  },
  {
    title: "Analyze campaign performance",
    description: "Get insights on metrics and optimization",
    prompt: "Analyze my campaign performance data and provide recommendations for improving open rates, response rates, and conversions. What should I optimize?",
    icon: TrendingUp,
    color: "from-orange-500 to-red-600"
  },
  {
    title: "Train Sam on my offer",
    description: "Help Sam understand your product/service",
    prompt: "I want to train you on my offer. Help me create a comprehensive description of what I'm selling, including key benefits, pricing, and unique selling points.",
    icon: BookOpen,
    color: "from-blue-500 to-purple-600"
  },
  {
    title: "Optimize my processes",
    description: "Get suggestions for workflow improvements",
    prompt: "Help me optimize my sales processes and workflows. Identify bottlenecks, suggest automation opportunities, and recommend best practices.",
    icon: Zap,
    color: "from-yellow-500 to-orange-600"
  }
];

export function EnhancedConversationalInterface() {
  const { 
    sessions, 
    currentSessionId, 
    createNewSession, 
    addMessageToSession, 
    loadSession,
    getCurrentSession 
  } = useChatHistory();
  
  const { speakText } = useVoice();
  useKeyboardShortcuts();
  
  // Core state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hi! I'm Sam, your AI sales assistant. I can help you research leads, create compelling outreach content, plan campaign strategies, and analyze performance. I use specialized AI agents to provide you with comprehensive, actionable insights. What would you like to work on today?",
      sender: "sam",
      timestamp: new Date(),
    },
  ]);
  
  const [input, setInput] = useState("");
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    isProcessing: false,
    message: ""
  });
  
  // User context and conversation management
  const [userContext, setUserContext] = useState<{
    user_id: string;
    organization_id: string;
  } | null>(null);
  
  const [conversationId] = useState(() => generateConversationId());
  const [samConversation, setSamConversation] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize user context and conversation manager
  useEffect(() => {
    const initializeConversation = async () => {
      try {
        const context = await getCurrentUserContext();
        
        if (context.user && context.organization) {
          const contextData = {
            user_id: context.user.id,
            organization_id: context.organization.id
          };
          
          setUserContext(contextData);
          
          // Create Sam conversation manager
          const conversation = createSamConversation(
            conversationId,
            contextData.user_id,
            contextData.organization_id,
            {
              onStatusUpdate: handleStatusUpdate,
              onResponse: handleSamResponse
            }
          );
          
          setSamConversation(conversation);
          
          // Load conversation history if it exists
          const history = await conversation.getConversationHistory();
          if (history.length > 1) { // More than just welcome message
            setMessages(prev => [...prev, ...history.slice(1)]); // Skip duplicate welcome
          }
        }
      } catch (error) {
        console.error('Failed to initialize conversation:', error);
      }
    };

    initializeConversation();
    
    return () => {
      samConversation?.cleanup();
    };
  }, [conversationId]);

  // Handle status updates from orchestration system
  const handleStatusUpdate = useCallback((update: SamStatusUpdate) => {
    setProcessingStatus({
      isProcessing: update.status === 'processing' || update.status === 'delegating' || update.status === 'coordinating',
      message: update.message,
      estimatedTime: update.estimated_time,
      agentsAssigned: update.agents_assigned,
      processingId: update.processing_id
    });
  }, []);

  // Handle responses from Sam AI system
  const handleSamResponse = useCallback((response: SamResponse) => {
    const newMessage: Message = {
      id: response.processing_id || Date.now().toString(),
      content: response.response.content,
      sender: "sam",
      timestamp: new Date(response.timestamp),
      metadata: response.response.metadata
    };
    
    setMessages(prev => [...prev, newMessage]);
    setProcessingStatus({ isProcessing: false, message: "" });
    
    // Add to chat history
    addMessageToSession(currentSessionId, newMessage.content, "sam");
    
    // Optional: Read response aloud
    if (response.response.content) {
      speakText(response.response.content);
    }
  }, [addMessageToSession, currentSessionId, speakText]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, processingStatus.isProcessing]);

  // Send message to Sam AI orchestration system
  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content || !samConversation || !userContext) return;

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user", 
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    // Add to chat history
    addMessageToSession(currentSessionId, content, "user");
    
    // Set initial processing status
    setProcessingStatus({
      isProcessing: true,
      message: "Sam is analyzing your request..."
    });
    
    // Send to orchestration system
    try {
      const result = await samConversation.sendMessage(content, 'text');
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to send message');
      }
      
      // Update status with processing ID
      setProcessingStatus(prev => ({
        ...prev,
        processingId: result.processing_id
      }));
      
    } catch (error) {
      console.error('Error sending message to Sam:', error);
      
      // Show error message
      const errorMessage: Message = {
        id: 'error_' + Date.now(),
        content: "I'm sorry, I'm experiencing some technical difficulties. Please try again in a moment.",
        sender: "sam",
        timestamp: new Date(),
        metadata: { error: true }
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setProcessingStatus({ isProcessing: false, message: "" });
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getAgentBadgeColor = (agent: string) => {
    switch (agent) {
      case 'lead_research': return 'bg-green-100 text-green-800';
      case 'content_creation': return 'bg-purple-100 text-purple-800';
      case 'campaign_planning': return 'bg-blue-100 text-blue-800';
      case 'data_analysis': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAgentName = (agent: string) => {
    return agent.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4 space-y-4">
      {/* Header with Sam Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot className="w-8 h-8 text-primary" />
            <SamStatusIndicator samIsActive={!processingStatus.isProcessing} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Sam AI Assistant</h2>
            <p className="text-sm text-muted-foreground">
              {processingStatus.isProcessing ? processingStatus.message : "Ready to help"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <VoiceInterface />
          <ChatHistory sessions={sessions} onLoadSession={loadSession} />
          <ContextMemory />
        </div>
      </div>

      {/* Processing Status Display */}
      {processingStatus.isProcessing && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="text-sm font-medium text-blue-900">
                {processingStatus.message}
              </span>
            </div>
            {processingStatus.estimatedTime && (
              <span className="text-xs text-blue-700">
                (~{processingStatus.estimatedTime}s)
              </span>
            )}
          </div>
          
          {processingStatus.agentsAssigned && processingStatus.agentsAssigned.length > 0 && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {processingStatus.agentsAssigned.map((agent, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary" 
                  className={getAgentBadgeColor(agent)}
                >
                  {formatAgentName(agent)}
                </Badge>
              ))}
            </div>
          )}
          
          <Progress value={33} className="mt-2" />
        </Card>
      )}

      {/* Quick Actions */}
      {messages.length === 1 && !processingStatus.isProcessing && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card
                key={index}
                className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-primary/50"
                onClick={() => handleQuickAction(action)}
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-2">{action.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {action.description}
                </p>
              </Card>
            );
          })}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.sender === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary"
              }`}
            >
              {message.sender === "user" ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>
            <div
              className={`max-w-[80%] p-4 rounded-lg ${
                message.sender === "user"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : "bg-muted"
              }`}
            >
              <MessageFormatter content={message.content} />
              {message.metadata && (
                <div className="mt-2 text-xs opacity-70">
                  {message.metadata.intent && (
                    <span>Intent: {message.metadata.intent}</span>
                  )}
                  {message.metadata.agents_used && (
                    <div className="flex gap-1 mt-1">
                      {message.metadata.agents_used.map((agent: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {formatAgentName(agent)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {processingStatus.isProcessing && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <ChatSkeleton />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              processingStatus.isProcessing 
                ? "Sam is working on your request..." 
                : "Ask Sam anything about sales, lead research, content creation, or campaign optimization..."
            }
            disabled={processingStatus.isProcessing}
            className="resize-none"
          />
        </div>
        <Button
          onClick={() => handleSendMessage()}
          disabled={!input.trim() || processingStatus.isProcessing}
          size="default"
          className="shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Connection Status */}
      <div className="text-xs text-center text-muted-foreground">
        {userContext ? (
          <span className="text-green-600">
            Connected to Sam AI Orchestration System
          </span>
        ) : (
          <span className="text-yellow-600">
            Connecting to Sam AI...
          </span>
        )}
      </div>
    </div>
  );
}