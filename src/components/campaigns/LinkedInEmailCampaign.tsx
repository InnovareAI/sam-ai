import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Linkedin, Mail, Plus, Trash2, Play, Pause, 
  Clock, Target, Users, CheckCircle, X,
  AlertTriangle, Info, Zap, ArrowRight, 
  Calendar, BarChart3, Eye, Copy
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface CampaignStep {
  id: string;
  day: number;
  channel: 'linkedin' | 'email';
  action: string;
  subject?: string;
  content: string;
  enabled: boolean;
}

interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  strategy: string;
  steps: CampaignStep[];
  metrics: {
    expectedResponseRate: string;
    timeToComplete: string;
    touchpoints: number;
  };
}

const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: 'linkedin-first',
    name: 'LinkedIn-First Approach',
    description: 'Build relationship on LinkedIn, then move to email',
    strategy: 'Best for high-value targets where relationship matters',
    steps: [
      {
        id: '1',
        day: 0,
        channel: 'linkedin',
        action: 'Connection Request',
        content: `Hi {{firstName}},

I noticed {{commonality}} and was impressed by {{achievement}}.

I work with {{targetRole}} professionals in {{industry}} to help them {{benefit}}.

Would love to connect and share insights.

Best,
{{senderName}}`,
        enabled: true
      },
      {
        id: '2',
        day: 3,
        channel: 'linkedin',
        action: 'Welcome Message',
        content: `Hi {{firstName}},

Thanks for connecting! 

Quick question - what's your biggest challenge with {{painPoint}} right now?

No pitch, just curious about your experience.

{{senderName}}`,
        enabled: true
      },
      {
        id: '3',
        day: 7,
        channel: 'email',
        action: 'Value Email',
        subject: 'Thought you might find this useful, {{firstName}}',
        content: `Hi {{firstName}},

Following up from LinkedIn - I mentioned I work with {{targetRole}} professionals.

I recently helped {{similarCompany}} achieve {{result}}.

Here's the strategy we used: {{resourceLink}}

Would this be relevant for {{company}}?

Best,
{{senderName}}`,
        enabled: true
      },
      {
        id: '4',
        day: 12,
        channel: 'linkedin',
        action: 'Soft Check-in',
        content: `{{firstName}}, did you get a chance to review the strategy I shared?

Happy to answer any questions or discuss how it might apply to {{company}}'s situation.

Worth a quick call?`,
        enabled: true
      },
      {
        id: '5',
        day: 18,
        channel: 'email',
        action: 'Case Study',
        subject: '{{company}} + {{benefit}} = ?',
        content: `Hi {{firstName}},

Last message - I wanted to share how {{competitorOrSimilar}} increased {{metric}} by {{percentage}}% in {{timeframe}}.

[Link to case study]

If this isn't a priority right now, no worries. Feel free to reach out when the timing is better.

Best,
{{senderName}}`,
        enabled: true
      }
    ],
    metrics: {
      expectedResponseRate: '15-25%',
      timeToComplete: '18 days',
      touchpoints: 5
    }
  },
  {
    id: 'email-first',
    name: 'Email-First Approach',
    description: 'Start with email for scale, LinkedIn for non-responders',
    strategy: 'Best for larger volume campaigns with good email data',
    steps: [
      {
        id: '1',
        day: 0,
        channel: 'email',
        action: 'Initial Outreach',
        subject: 'Quick question about {{company}}',
        content: `Hi {{firstName}},

I noticed {{trigger}} and wanted to reach out.

We help companies like {{similarCompany}} {{benefit}}.

The reason I'm reaching out is {{specificReason}}.

Worth a quick 15-minute call to discuss?

Best,
{{senderName}}`,
        enabled: true
      },
      {
        id: '2',
        day: 3,
        channel: 'email',
        action: 'Follow-up 1',
        subject: 'Re: Quick question about {{company}}',
        content: `Hi {{firstName}},

Just wanted to bump this up in case it got buried.

{{additionalValue}}

Are you the right person to speak with about this?

{{senderName}}`,
        enabled: true
      },
      {
        id: '3',
        day: 7,
        channel: 'linkedin',
        action: 'LinkedIn Touch',
        content: `Hi {{firstName}},

I sent you a couple of emails about {{topic}} but haven't heard back.

Thought I'd try reaching out here instead.

Is this something you're exploring for {{company}}?`,
        enabled: true
      },
      {
        id: '4',
        day: 10,
        channel: 'email',
        action: 'Value Add',
        subject: '{{firstName}} - sharing this resource',
        content: `Hi {{firstName}},

Whether we work together or not, thought you'd find this valuable:

[Resource about {{painPoint}}]

BTW - still happy to discuss how we helped {{similarCompany}} with this.

{{senderName}}`,
        enabled: true
      },
      {
        id: '5',
        day: 15,
        channel: 'email',
        action: 'Break-up Email',
        subject: 'Should I close your file?',
        content: `Hi {{firstName}},

I've reached out a few times about helping {{company}} with {{benefit}}.

Haven't heard back, so I'll assume this isn't a priority right now.

If things change, feel free to reach out.

All the best,
{{senderName}}`,
        enabled: true
      }
    ],
    metrics: {
      expectedResponseRate: '8-15%',
      timeToComplete: '15 days',
      touchpoints: 5
    }
  },
  {
    id: 'parallel',
    name: 'Parallel Approach',
    description: 'LinkedIn and Email simultaneously for maximum impact',
    strategy: 'Best for high-priority accounts with urgent timeline',
    steps: [
      {
        id: '1',
        day: 0,
        channel: 'linkedin',
        action: 'Connection Request',
        content: `Hi {{firstName}}, I'm reaching out because {{reason}}. Would love to connect!`,
        enabled: true
      },
      {
        id: '2',
        day: 1,
        channel: 'email',
        action: 'Initial Email',
        subject: 'Connecting from LinkedIn - {{topic}}',
        content: `Hi {{firstName}},

Just sent you a LinkedIn request - wanted to make sure this reaches you.

{{mainMessage}}

Do you have 15 minutes this week?

{{senderName}}`,
        enabled: true
      },
      {
        id: '3',
        day: 4,
        channel: 'linkedin',
        action: 'LinkedIn Message',
        content: `Thanks for connecting! Did you see my email about {{topic}}?`,
        enabled: true
      },
      {
        id: '4',
        day: 7,
        channel: 'email',
        action: 'Follow-up',
        subject: 'Re: {{topic}}',
        content: `Following up on both email and LinkedIn. This must be important enough to {{benefit}}, right? 😊`,
        enabled: true
      }
    ],
    metrics: {
      expectedResponseRate: '20-30%',
      timeToComplete: '7 days',
      touchpoints: 4
    }
  }
];

export const LinkedInEmailCampaign: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate>(CAMPAIGN_TEMPLATES[0]);
  const [campaignName, setCampaignName] = useState('');
  const [dailyLimit, setDailyLimit] = useState({ linkedin: 20, email: 50 });
  const [steps, setSteps] = useState<CampaignStep[]>(CAMPAIGN_TEMPLATES[0].steps);
  const [variables, setVariables] = useState({
    firstName: 'John',
    company: 'Acme Corp',
    targetRole: 'VP Sales',
    industry: 'SaaS',
    painPoint: 'lead generation',
    benefit: 'increase qualified leads by 40%',
    senderName: 'Your Name'
  });

  const handleTemplateSelect = (template: CampaignTemplate) => {
    setSelectedTemplate(template);
    setSteps([...template.steps]);
  };

  const toggleStep = (stepId: string) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, enabled: !step.enabled } : step
    ));
  };

  const updateStepContent = (stepId: string, content: string) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, content } : step
    ));
  };

  const addStep = () => {
    const lastStep = steps[steps.length - 1];
    const newStep: CampaignStep = {
      id: Date.now().toString(),
      day: lastStep ? lastStep.day + 3 : 0,
      channel: 'email',
      action: 'Follow-up',
      content: 'Write your message here...',
      enabled: true
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
  };

  const previewMessage = (content: string) => {
    let preview = content;
    Object.entries(variables).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return preview;
  };

  const calculateMetrics = () => {
    const linkedinSteps = steps.filter(s => s.channel === 'linkedin' && s.enabled).length;
    const emailSteps = steps.filter(s => s.channel === 'email' && s.enabled).length;
    const totalDays = Math.max(...steps.map(s => s.day));
    
    return {
      linkedinTouches: linkedinSteps,
      emailTouches: emailSteps,
      totalTouches: linkedinSteps + emailSteps,
      campaignDuration: totalDays,
      estimatedContacts: Math.min(dailyLimit.linkedin, dailyLimit.email) * totalDays
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">LinkedIn + Email Campaign Builder</h2>
          <p className="text-muted-foreground">The most effective B2B outreach combination</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <Linkedin className="mr-1 h-3 w-3" />
            LinkedIn Ready
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Mail className="mr-1 h-3 w-3" />
            Email Ready
          </Badge>
        </div>
      </div>

      {/* Template Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Choose Your Strategy</h3>
        <div className="grid grid-cols-3 gap-4">
          {CAMPAIGN_TEMPLATES.map(template => (
            <Card 
              key={template.id}
              className={`cursor-pointer transition-all ${
                selectedTemplate.id === template.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader>
                <CardTitle className="text-base">{template.name}</CardTitle>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">{template.strategy}</p>
                <div className="flex justify-between text-xs">
                  <span>{template.metrics.touchpoints} touches</span>
                  <span>{template.metrics.expectedResponseRate}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Campaign Configuration */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campaign Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Campaign Name</Label>
              <Input 
                placeholder="Q1 Enterprise Outreach"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>
            
            <div>
              <Label>Daily Limits</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </span>
                  <Input 
                    type="number" 
                    value={dailyLimit.linkedin}
                    onChange={(e) => setDailyLimit({...dailyLimit, linkedin: parseInt(e.target.value)})}
                    className="w-20"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </span>
                  <Input 
                    type="number" 
                    value={dailyLimit.email}
                    onChange={(e) => setDailyLimit({...dailyLimit, email: parseInt(e.target.value)})}
                    className="w-20"
                  />
                </div>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                LinkedIn: 20-50/day safe
                <br />
                Email: 50-200/day with warmup
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Middle: Sequence */}
        <Card className="col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Campaign Sequence</CardTitle>
              <Button size="sm" variant="outline" onClick={addStep}>
                <Plus className="h-4 w-4 mr-1" />
                Add Step
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div 
                  key={step.id} 
                  className={`border rounded-lg p-3 ${!step.enabled ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={step.enabled}
                        onChange={() => toggleStep(step.id)}
                        className="rounded"
                      />
                      <Badge variant="outline">Day {step.day}</Badge>
                      {step.channel === 'linkedin' ? (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Linkedin className="h-3 w-3 mr-1" />
                          LinkedIn
                        </Badge>
                      ) : (
                        <Badge className="bg-purple-100 text-purple-800">
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </Badge>
                      )}
                      <span className="text-sm font-medium">{step.action}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStep(step.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {step.channel === 'email' && step.subject && (
                    <Input
                      placeholder="Email subject..."
                      value={step.subject}
                      onChange={(e) => updateStepContent(step.id, step.content)}
                      className="mb-2 text-sm"
                    />
                  )}
                  
                  <Textarea
                    value={step.content}
                    onChange={(e) => updateStepContent(step.id, e.target.value)}
                    rows={3}
                    className="text-sm font-mono"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics & Preview */}
      <div className="grid grid-cols-2 gap-6">
        {/* Campaign Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campaign Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">LinkedIn Touches</p>
                <p className="text-2xl font-semibold">{metrics.linkedinTouches}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email Touches</p>
                <p className="text-2xl font-semibold">{metrics.emailTouches}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Campaign Duration</p>
                <p className="text-2xl font-semibold">{metrics.campaignDuration} days</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Est. Contacts</p>
                <p className="text-2xl font-semibold">{metrics.estimatedContacts}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Expected Response Rate</span>
                <Badge variant="outline">{selectedTemplate.metrics.expectedResponseRate}</Badge>
              </div>
              <Progress value={parseInt(selectedTemplate.metrics.expectedResponseRate)} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Variable Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personalization Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(variables).slice(0, 5).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{`{{${key}}}`}</span>
                  <Input
                    value={value}
                    onChange={(e) => setVariables({...variables, [key]: e.target.value})}
                    className="w-32 h-7 text-sm"
                  />
                </div>
              ))}
            </div>
            
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Variables will be auto-populated from your CRM data
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview Campaign
          </Button>
          <Button variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Save as Draft</Button>
          <Button>
            <Play className="h-4 w-4 mr-2" />
            Launch Campaign
          </Button>
        </div>
      </div>
    </div>
  );
};