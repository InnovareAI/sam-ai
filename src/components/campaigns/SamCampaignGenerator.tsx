import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, Send, Linkedin, Mail, Zap, ChevronRight,
  Target, Users, Clock, TrendingUp, RefreshCw,
  MessageSquare, Wand2, CheckCircle, Edit
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface GeneratedCampaign {
  name: string;
  strategy: string;
  sequence: Array<{
    day: number;
    channel: 'linkedin' | 'email';
    type: string;
    subject?: string;
    message: string;
  }>;
  estimatedResponseRate: string;
  reasoning: string;
}

export const SamCampaignGenerator: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCampaign, setGeneratedCampaign] = useState<GeneratedCampaign | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'sam', content: string}>>([]);
  const [showEditor, setShowEditor] = useState(false);

  // Example prompts for inspiration
  const examplePrompts = [
    "I need to reach VPs of Sales at SaaS companies about our sales intelligence tool",
    "Help me create a campaign for recruiting senior developers in fintech",
    "I want to book meetings with CMOs about our marketing analytics platform",
    "Create outreach for founders of Series A startups about our CRM solution"
  ];

  const handleGenerateCampaign = async () => {
    if (!userInput.trim()) return;

    setIsGenerating(true);
    setChatHistory([...chatHistory, { role: 'user', content: userInput }]);

    // Simulate Sam AI processing
    setTimeout(() => {
      const campaign = generateCampaignFromInput(userInput);
      setGeneratedCampaign(campaign);
      setChatHistory(prev => [...prev, { 
        role: 'sam', 
        content: `I've created a ${campaign.strategy} campaign for you. This approach should give you ${campaign.estimatedResponseRate} response rate based on similar campaigns.`
      }]);
      setIsGenerating(false);
      setUserInput('');
    }, 2000);
  };

  const generateCampaignFromInput = (input: string): GeneratedCampaign => {
    // Sam's AI logic would go here - this is a mock
    const isRecruiting = input.toLowerCase().includes('recruit') || input.toLowerCase().includes('developer');
    const isEnterprise = input.toLowerCase().includes('vp') || input.toLowerCase().includes('cmo') || input.toLowerCase().includes('enterprise');
    const isSales = input.toLowerCase().includes('sales') || input.toLowerCase().includes('meeting') || input.toLowerCase().includes('demo');

    if (isRecruiting) {
      return {
        name: "Developer Recruitment Campaign",
        strategy: "LinkedIn-first technical recruitment",
        sequence: [
          {
            day: 0,
            channel: 'linkedin',
            type: 'Connection Request',
            message: `Hi {{firstName}},

I noticed your impressive work with {{technology}} at {{company}}. Your recent project on {{achievement}} caught my attention.

I'm building a world-class engineering team and would love to connect to share an exciting opportunity that aligns with your expertise.

Best,
{{senderName}}`
          },
          {
            day: 2,
            channel: 'linkedin',
            type: 'Welcome Message',
            message: `Thanks for connecting, {{firstName}}!

I'm reaching out because we're looking for a senior {{role}} to lead our {{project}}. 

Given your experience with {{skills}}, you'd be perfect for this role.

The position offers:
• Competitive salary ({{salaryRange}})
• Full remote flexibility
• Cutting-edge tech stack

Interested in learning more?`
          },
          {
            day: 5,
            channel: 'email',
            type: 'Detailed Opportunity',
            subject: '{{firstName}} - Exciting {{role}} opportunity',
            message: `Following up from LinkedIn with more details about the role...`
          }
        ],
        estimatedResponseRate: "25-35%",
        reasoning: "Developers respond well to specific technical details and clear compensation info. LinkedIn-first approach builds trust."
      };
    } else if (isEnterprise && isSales) {
      return {
        name: "Enterprise Sales Campaign",
        strategy: "Multi-touch executive outreach",
        sequence: [
          {
            day: 0,
            channel: 'email',
            type: 'Initial Outreach',
            subject: 'Quick question about {{company}}\'s {{department}} goals',
            message: `Hi {{firstName}},

I noticed {{company}} is {{trigger_event}}. 

We recently helped {{similar_company}} achieve {{specific_result}} in just {{timeframe}}.

Worth a brief 15-minute call to discuss how this might apply to {{company}}?

Best,
{{senderName}}`
          },
          {
            day: 3,
            channel: 'linkedin',
            type: 'LinkedIn Touch',
            message: `Hi {{firstName}}, I sent you an email about {{topic}} but wanted to connect here as well. 

Have you had a chance to review it?`
          },
          {
            day: 7,
            channel: 'email',
            type: 'Value Add',
            subject: 'Sharing {{industry}} benchmark report',
            message: `Hi {{firstName}},

Whether we work together or not, thought you'd find value in this {{industry}} report showing how top performers are handling {{challenge}}.

[Link to report]

Still happy to discuss how we can help {{company}} achieve similar results.`
          },
          {
            day: 12,
            channel: 'email',
            type: 'Final Follow-up',
            subject: 'Last check-in',
            message: `Hi {{firstName}},

I'll close your file for now, but if {{challenge}} becomes a priority, I'm here to help.

Best,
{{senderName}}`
          }
        ],
        estimatedResponseRate: "15-20%",
        reasoning: "Executives respond to ROI-focused messages with clear value props. Email-first allows for detailed case studies."
      };
    } else {
      // Default balanced approach
      return {
        name: "Balanced Outreach Campaign",
        strategy: "LinkedIn relationship-building with email nurture",
        sequence: [
          {
            day: 0,
            channel: 'linkedin',
            type: 'Connection Request',
            message: `Hi {{firstName}},

I noticed {{commonality}} and was impressed by {{achievement}}.

I help {{target_role}} professionals in {{industry}} achieve {{benefit}}.

Would love to connect and share insights.

Best,
{{senderName}}`
          },
          {
            day: 3,
            channel: 'linkedin',
            type: 'Welcome Message',
            message: `Thanks for connecting, {{firstName}}!

Quick question - what's your biggest challenge with {{pain_point}} right now?

No pitch, just curious about your experience at {{company}}.`
          },
          {
            day: 7,
            channel: 'email',
            type: 'Value Email',
            subject: 'Thought you might find this useful, {{firstName}}',
            message: `Hi {{firstName}},

Following up from LinkedIn - I recently helped {{similar_company}} solve a similar challenge.

Here's the approach we used: [resource link]

Would this be relevant for {{company}}?

Best,
{{senderName}}`
          },
          {
            day: 14,
            channel: 'email',
            type: 'Check-in',
            subject: 'Quick question for you',
            message: `Hi {{firstName}},

Did you get a chance to review the resource I shared?

Happy to answer any questions or discuss how it might apply to {{company}}.

Worth a quick call?

{{senderName}}`
          }
        ],
        estimatedResponseRate: "12-18%",
        reasoning: "A balanced approach works well for most B2B scenarios. Building relationship on LinkedIn first, then nurturing via email."
      };
    }
  };

  const handleRefineRequest = (refinement: string) => {
    setUserInput(userInput + ' ' + refinement);
    handleGenerateCampaign();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Sam's Campaign Generator</h1>
        <p className="text-muted-foreground">Just tell Sam what you need - I'll create the perfect campaign</p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            What kind of campaign do you need?
          </CardTitle>
          <CardDescription>
            Describe your target audience, product, and goals in plain English
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Example: I need to book meetings with VPs of Engineering at Series B SaaS companies about our DevOps platform..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              rows={3}
              className="resize-none"
            />
            
            {/* Example Prompts */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Try one of these:</p>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((prompt, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => setUserInput(prompt)}
                    className="text-xs"
                  >
                    {prompt.substring(0, 50)}...
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleGenerateCampaign} 
              disabled={!userInput.trim() || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sam is thinking...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Campaign
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Campaign */}
      {generatedCampaign && (
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  {generatedCampaign.name}
                </CardTitle>
                <CardDescription>{generatedCampaign.strategy}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {generatedCampaign.estimatedResponseRate}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditor(!showEditor)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Sam's Reasoning */}
            <Alert className="mb-4">
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                <strong>Sam's thinking:</strong> {generatedCampaign.reasoning}
              </AlertDescription>
            </Alert>

            {/* Campaign Timeline */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Campaign Sequence
              </h4>
              
              {generatedCampaign.sequence.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold">
                      D{step.day}
                    </div>
                    {index < generatedCampaign.sequence.length - 1 && (
                      <div className="w-0.5 h-20 bg-gray-200 mt-2" />
                    )}
                  </div>
                  
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-2 mb-2">
                      {step.channel === 'linkedin' ? (
                        <Badge className="bg-blue-100 text-blue-700">
                          <Linkedin className="mr-1 h-3 w-3" />
                          LinkedIn
                        </Badge>
                      ) : (
                        <Badge className="bg-purple-100 text-purple-700">
                          <Mail className="mr-1 h-3 w-3" />
                          Email
                        </Badge>
                      )}
                      <span className="font-medium">{step.type}</span>
                    </div>
                    
                    {step.subject && (
                      <div className="mb-2">
                        <span className="text-sm text-muted-foreground">Subject: </span>
                        <span className="text-sm">{step.subject}</span>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <pre className="text-sm whitespace-pre-wrap font-sans">{step.message}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <Button className="flex-1">
                <Zap className="mr-2 h-4 w-4" />
                Use This Campaign
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => {
                setGeneratedCampaign(null);
                setUserInput('');
              }}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Start Over
              </Button>
            </div>

            {/* Refinement Options */}
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Want to adjust?</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRefineRequest("Make it more aggressive")}
                >
                  More aggressive
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRefineRequest("Make it softer")}
                >
                  Softer approach
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRefineRequest("Add more touchpoints")}
                >
                  More touchpoints
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRefineRequest("Make it shorter")}
                >
                  Fewer touchpoints
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat History */}
      {chatHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversation with Sam</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'sam' ? 'ml-8' : ''}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'sam' 
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                      : 'bg-gray-200'
                  }`}>
                    {msg.role === 'sam' ? (
                      <Sparkles className="h-4 w-4 text-white" />
                    ) : (
                      <Users className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};