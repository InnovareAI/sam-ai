import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Sparkles, Brain, Zap, Target, CheckCircle, 
  Linkedin, Mail, Database, RefreshCw, Play,
  Info, TrendingUp, Users, Building
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface SmartCampaign {
  messages: Array<{
    day: number;
    channel: 'linkedin' | 'email';
    subject?: string;
    content: string;
    reasoning: string;
  }>;
  strategy: string;
  expectedOutcome: string;
}

export const SamSmartCampaign: React.FC = () => {
  const [targetDescription, setTargetDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaign, setCampaign] = useState<SmartCampaign | null>(null);
  const [selectedProspects, setSelectedProspects] = useState<any[]>([]);

  // Mock prospects for demo
  const mockProspects = [
    { 
      name: 'John Smith', 
      title: 'VP Engineering', 
      company: 'TechCorp', 
      industry: 'SaaS',
      employees: 200,
      recentActivity: 'Posted about data pipeline challenges'
    },
    { 
      name: 'Sarah Chen', 
      title: 'CTO', 
      company: 'FastScale', 
      industry: 'E-commerce',
      employees: 150,
      recentActivity: 'Company raised Series B'
    },
    { 
      name: 'Mike Johnson', 
      title: 'Director of Data', 
      company: 'FinanceFlow', 
      industry: 'FinTech',
      employees: 300,
      recentActivity: 'Hiring data engineers'
    }
  ];

  const generateSmartCampaign = () => {
    setIsGenerating(true);
    
    // Simulate Sam accessing RAG and generating campaign
    setTimeout(() => {
      const smartCampaign: SmartCampaign = {
        strategy: "LinkedIn-first approach with technical proof points, transitioning to email for detailed case studies",
        expectedOutcome: "25-30% response rate based on ICP match and trigger events",
        messages: [
          {
            day: 0,
            channel: 'linkedin',
            content: `Hi {{firstName}},

I noticed {{company}} is {{trigger_event}} - congrats! This usually means data synchronization becomes critical.

At DataSync Pro, we just helped TechCorp reduce their data pipeline complexity by 75% while achieving real-time sync across 12 systems.

Given your role leading engineering at {{company}}, I thought our approach might be relevant.

Worth connecting?

Best,
Alex`,
            reasoning: "Leveraging trigger event (Series B) and social proof from similar company (TechCorp). Technical tone for engineering leader."
          },
          {
            day: 3,
            channel: 'linkedin',
            content: `Thanks for connecting, {{firstName}}!

Quick question - are you still using batch processing for your Salesforce-to-warehouse sync, or have you moved to real-time?

We've found that companies at your stage typically lose 4-6 hours daily on data lag. Curious what your experience has been?

No pitch - genuinely interested in how {{company}} handles this.`,
            reasoning: "Pain point discovery using specific technical language. Non-salesy approach builds trust with technical buyers."
          },
          {
            day: 7,
            channel: 'email',
            subject: '{{company}} data architecture - quick thought',
            content: `Hi {{firstName}},

Following up from LinkedIn - I pulled together a quick architecture diagram showing how TechCorp eliminated their 6-hour data lag.

[Link to technical architecture diagram]

Key improvements they saw:
• Real-time customer data in Snowflake (< 1 second latency)
• 40 engineering hours/week saved on data pipeline maintenance  
• Zero data inconsistencies across systems

The implementation took their team 5 minutes (seriously).

Worth a 15-min technical deep-dive to see if this could work for {{company}}?

Best,
Alex

P.S. - Here's our ROI calculator if you want to run your own numbers: [link]`,
            reasoning: "Transitioning to email for detailed technical content. Leading with architecture (appeals to engineers) and specific metrics."
          },
          {
            day: 12,
            channel: 'email',
            subject: 'Re: {{company}} data architecture',
            content: `Hi {{firstName}},

Last email - I know you're busy scaling {{company}}.

If real-time data sync becomes a priority, here's a 5-minute demo showing the actual setup process: [link]

Otherwise, best of luck with the Series B growth! 

Alex`,
            reasoning: "Breakup email with valuable resource. Acknowledges their situation (Series B) and provides easy next step."
          }
        ]
      };
      
      setCampaign(smartCampaign);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with RAG Context Indicator */}
      <div className="text-center">
        <div className="flex justify-center items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <Database className="mr-1 h-3 w-3" />
            RAG-Powered with Your Business Context
          </Badge>
        </div>
        <h1 className="text-3xl font-bold mb-2">Sam's Smart Campaign Generator</h1>
        <p className="text-muted-foreground">
          Sam knows your ICP, pain points, UVP, and case studies - every message is perfectly crafted
        </p>
      </div>

      {/* Context Summary Card */}
      <Card className="border-purple-200 bg-purple-50/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            Sam's Knowledge About Your Business
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Your ICP</p>
              <p className="font-medium">VP Eng/CTO at Series A-B SaaS</p>
            </div>
            <div>
              <p className="text-muted-foreground">Main Pain Point</p>
              <p className="font-medium">Data silos & sync delays</p>
            </div>
            <div>
              <p className="text-muted-foreground">Your UVP</p>
              <p className="font-medium">Real-time sync in 5 minutes</p>
            </div>
            <div>
              <p className="text-muted-foreground">Best Case Study</p>
              <p className="font-medium">TechCorp - 25% faster deals</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Campaign Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Who do you want to reach?</CardTitle>
          <CardDescription>
            Just describe your target or select from your CRM
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="e.g., Series B SaaS companies that are hiring data engineers"
              value={targetDescription}
              onChange={(e) => setTargetDescription(e.target.value)}
              className="flex-1"
            />
            <Button onClick={generateSmartCampaign} disabled={isGenerating}>
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>

          {/* Smart Prospect Suggestions */}
          <div>
            <p className="text-sm font-medium mb-2">Sam found these matching prospects:</p>
            <div className="space-y-2">
              {mockProspects.map((prospect, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    if (selectedProspects.includes(prospect)) {
                      setSelectedProspects(selectedProspects.filter(p => p !== prospect));
                    } else {
                      setSelectedProspects([...selectedProspects, prospect]);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={selectedProspects.includes(prospect)}
                      onChange={() => {}}
                      className="rounded"
                    />
                    <div>
                      <p className="font-medium">{prospect.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {prospect.title} at {prospect.company}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">
                      <Building className="mr-1 h-3 w-3" />
                      {prospect.industry}
                    </Badge>
                    <p className="text-xs text-green-600">
                      🎯 {prospect.recentActivity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Campaign */}
      {campaign && (
        <Card className="border-green-200">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Smart Campaign Ready
                </CardTitle>
                <CardDescription>{campaign.strategy}</CardDescription>
              </div>
              <Badge variant="default">
                <TrendingUp className="mr-1 h-3 w-3" />
                {campaign.expectedOutcome}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Message Sequence */}
            <div className="space-y-4">
              {campaign.messages.map((msg, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Day {msg.day}</Badge>
                      {msg.channel === 'linkedin' ? (
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
                    </div>
                  </div>
                  
                  {msg.subject && (
                    <p className="text-sm font-medium mb-2">Subject: {msg.subject}</p>
                  )}
                  
                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <pre className="text-sm whitespace-pre-wrap font-sans">{msg.content}</pre>
                  </div>
                  
                  <Alert>
                    <Brain className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>Sam's reasoning:</strong> {msg.reasoning}
                    </AlertDescription>
                  </Alert>
                </div>
              ))}
            </div>

            {/* What Sam Used From RAG */}
            <Card className="mt-6 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-sm">How Sam Personalized This Campaign</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Used TechCorp case study (matches prospect's industry)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Referenced "data pipeline complexity" (your primary pain point)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Mentioned "5-minute setup" (your key differentiator)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Included ROI calculator link (your resource)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Technical tone for engineering audience (your ICP)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Launch Button */}
            <div className="flex gap-3 mt-6">
              <Button className="flex-1" size="lg">
                <Play className="mr-2 h-4 w-4" />
                Launch Campaign for {selectedProspects.length} Prospects
              </Button>
              <Button variant="outline" size="lg">
                Edit Messages
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};