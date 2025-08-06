import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageCircle, Mail, Linkedin, Send, Search, Filter, 
  Clock, CheckCheck, AlertCircle, Star, Archive, 
  MoreVertical, Phone, User, ShoppingBag, Package,
  Instagram, Facebook, MessageSquare, Inbox, Bot,
  Zap, TrendingUp, Users, BarChart3
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  channel: 'whatsapp' | 'messenger' | 'instagram' | 'email' | 'linkedin';
  from: {
    name: string;
    id: string;
    avatar?: string;
    phone?: string;
    email?: string;
  };
  content: string;
  timestamp: Date;
  read: boolean;
  replied: boolean;
  starred: boolean;
  labels: string[];
  conversationId: string;
  metadata?: {
    orderId?: string;
    productId?: string;
    ticketId?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
    intent?: 'support' | 'sales' | 'complaint' | 'question';
  };
}

interface QuickReply {
  id: string;
  title: string;
  content: string;
  category: string;
}

export const UnifiedInbox: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'whatsapp' | 'messenger' | 'instagram' | 'email' | 'linkedin'>('all');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'starred' | 'urgent'>('all');
  const [isAutoReplyEnabled, setIsAutoReplyEnabled] = useState(true);

  // Mock messages for demo
  const [messages] = useState<Message[]>([
    {
      id: '1',
      channel: 'whatsapp',
      from: {
        name: 'Sarah Johnson',
        id: 'wa-1',
        phone: '+1234567890'
      },
      content: 'Hi! I placed an order yesterday but haven\'t received a confirmation. Order #12345',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
      read: false,
      replied: false,
      starred: false,
      labels: ['order-inquiry'],
      conversationId: 'conv-1',
      metadata: {
        orderId: '12345',
        sentiment: 'neutral',
        intent: 'support'
      }
    },
    {
      id: '2',
      channel: 'instagram',
      from: {
        name: '@fashion_lover',
        id: 'ig-1',
        avatar: '👗'
      },
      content: 'Love your new collection! 😍 Is the blue dress available in size M?',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      read: true,
      replied: false,
      starred: true,
      labels: ['product-inquiry', 'high-intent'],
      conversationId: 'conv-2',
      metadata: {
        productId: 'dress-001',
        sentiment: 'positive',
        intent: 'sales'
      }
    },
    {
      id: '3',
      channel: 'messenger',
      from: {
        name: 'Mike Chen',
        id: 'fb-1',
        avatar: '👤'
      },
      content: 'My package was supposed to arrive today but it hasn\'t. Can you check?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: true,
      replied: true,
      starred: false,
      labels: ['shipping'],
      conversationId: 'conv-3',
      metadata: {
        orderId: '12344',
        sentiment: 'negative',
        intent: 'complaint'
      }
    },
    {
      id: '4',
      channel: 'whatsapp',
      from: {
        name: 'Emma Wilson',
        id: 'wa-2',
        phone: '+1234567891'
      },
      content: 'Can I return an item I bought last week?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      read: false,
      replied: false,
      starred: false,
      labels: ['returns'],
      conversationId: 'conv-4',
      metadata: {
        sentiment: 'neutral',
        intent: 'support'
      }
    }
  ]);

  const quickReplies: QuickReply[] = [
    {
      id: '1',
      title: 'Order Status',
      content: 'I\'ll check your order status right away. Can you please provide your order number?',
      category: 'support'
    },
    {
      id: '2',
      title: 'Product Availability',
      content: 'Let me check if that\'s available in your size. One moment please!',
      category: 'sales'
    },
    {
      id: '3',
      title: 'Shipping Update',
      content: 'I\'m looking into your shipping status now. You should receive an update within the next hour.',
      category: 'shipping'
    },
    {
      id: '4',
      title: 'Return Policy',
      content: 'Our return policy allows returns within 30 days of purchase. Would you like me to start a return for you?',
      category: 'returns'
    }
  ];

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return <MessageCircle className="h-4 w-4 text-green-600" />;
      case 'messenger': return <Facebook className="h-4 w-4 text-blue-600" />;
      case 'instagram': return <Instagram className="h-4 w-4 text-pink-600" />;
      case 'email': return <Mail className="h-4 w-4 text-gray-600" />;
      case 'linkedin': return <Linkedin className="h-4 w-4 text-blue-700" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return 'bg-green-100 text-green-800';
      case 'messenger': return 'bg-blue-100 text-blue-800';
      case 'instagram': return 'bg-pink-100 text-pink-800';
      case 'email': return 'bg-gray-100 text-gray-800';
      case 'linkedin': return 'bg-blue-100 text-blue-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (selectedChannel !== 'all' && msg.channel !== selectedChannel) return false;
    if (filterStatus === 'unread' && msg.read) return false;
    if (filterStatus === 'starred' && !msg.starred) return false;
    if (filterStatus === 'urgent' && msg.metadata?.intent !== 'complaint') return false;
    if (searchQuery && !msg.content.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !msg.from.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: messages.length,
    unread: messages.filter(m => !m.read).length,
    urgent: messages.filter(m => m.metadata?.intent === 'complaint').length,
    avgResponseTime: '8 mins',
    satisfactionRate: '94%'
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    
    toast({
      title: "Message sent",
      description: "Your reply has been sent successfully",
    });
    
    setReplyText('');
  };

  const handleQuickReply = (reply: QuickReply) => {
    setReplyText(reply.content);
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      {/* Left Sidebar - Conversation List */}
      <div className="w-96 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center mb-3">
              <CardTitle>Unified Inbox</CardTitle>
              <Badge variant="default">{stats.unread} unread</Badge>
            </div>
            
            {/* Channel Filters */}
            <div className="flex gap-2 mb-3">
              <Button 
                size="sm" 
                variant={selectedChannel === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedChannel('all')}
              >
                All
              </Button>
              <Button 
                size="sm" 
                variant={selectedChannel === 'whatsapp' ? 'default' : 'outline'}
                onClick={() => setSelectedChannel('whatsapp')}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                WhatsApp
              </Button>
              <Button 
                size="sm" 
                variant={selectedChannel === 'instagram' ? 'default' : 'outline'}
                onClick={() => setSelectedChannel('instagram')}
              >
                <Instagram className="h-3 w-3 mr-1" />
                Instagram
              </Button>
              <Button 
                size="sm" 
                variant={selectedChannel === 'messenger' ? 'default' : 'outline'}
                onClick={() => setSelectedChannel('messenger')}
              >
                <Facebook className="h-3 w-3 mr-1" />
                Messenger
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search messages..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    !message.read ? 'bg-blue-50/50' : ''
                  } ${selectedConversation === message.conversationId ? 'bg-gray-100' : ''}`}
                  onClick={() => setSelectedConversation(message.conversationId)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{message.from.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{message.from.name}</span>
                          {getChannelIcon(message.channel)}
                          {message.starred && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{message.content}</p>
                      <div className="flex gap-2 mt-2">
                        {message.labels.map(label => (
                          <Badge key={label} variant="secondary" className="text-xs">
                            {label}
                          </Badge>
                        ))}
                        {message.metadata?.sentiment && (
                          <span className={`text-xs ${getSentimentColor(message.metadata.sentiment)}`}>
                            • {message.metadata.sentiment}
                          </span>
                        )}
                      </div>
                    </div>
                    {message.replied && <CheckCheck className="h-4 w-4 text-green-600" />}
                    {!message.read && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Avg Response</p>
                <p className="font-semibold">{stats.avgResponseTime}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Satisfaction</p>
                <p className="font-semibold text-green-600">{stats.satisfactionRate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Conversation View */}
      <div className="flex-1 flex flex-col gap-4">
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {messages.find(m => m.conversationId === selectedConversation)?.from.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {messages.find(m => m.conversationId === selectedConversation)?.from.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {getChannelIcon(messages.find(m => m.conversationId === selectedConversation)?.channel || '')}
                        <span>Active now</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-1" />
                      View Profile
                    </Button>
                    <Button variant="outline" size="sm">
                      <ShoppingBag className="h-4 w-4 mr-1" />
                      Order History
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Star className="h-4 w-4 mr-2" />
                          Star conversation
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Zap className="h-4 w-4 mr-2" />
                          Create ticket
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Messages */}
            <Card className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages
                    .filter(m => m.conversationId === selectedConversation)
                    .map(message => (
                      <div key={message.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{message.from.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-gray-100 rounded-lg p-3">
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  
                  {/* Auto-reply suggestion */}
                  {isAutoReplyEnabled && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <Bot className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">AI suggests: "I'll check your order status right away."</span>
                          <Button size="sm" variant="ghost" onClick={() => setReplyText("I'll check your order status right away.")}>
                            Use
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </ScrollArea>

              {/* Quick Replies */}
              <div className="p-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">Quick replies:</p>
                <div className="flex gap-2 flex-wrap">
                  {quickReplies.map(reply => (
                    <Button
                      key={reply.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickReply(reply)}
                    >
                      {reply.title}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Reply Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-[60px]"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                  />
                  <Button onClick={handleSendReply}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </>
        ) : (
          <Card className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a message from the inbox to start replying</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};