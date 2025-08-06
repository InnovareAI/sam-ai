import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, Users, Globe, Plus, Trash2, Edit, Play, Pause, BarChart3, 
  Linkedin, MessageCircle, Send, Clock, Target, Zap, PlusCircle, X, 
  ChevronUp, ChevronDown, Copy, Settings, AlertTriangle, Shield, Info
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PLATFORM_LIMITS, SmartLimitCalculator, CampaignMixValidator } from '@/lib/platform-limits';

interface CampaignStep {
  id: string;
  type: 'connection_request' | 'message' | 'follow_up' | 'wait';
  content: string;
  delay: {
    value: number;
    unit: 'hours' | 'days';
  };
  condition?: 'if_accepted' | 'if_replied' | 'if_not_replied';
}

interface Campaign {
  id: string;
  name: string;
  type: 'cr' | 'messenger' | 'group';
  platform: 'linkedin' | 'whatsapp' | 'messenger' | 'telegram';
  steps: CampaignStep[];
  dailyLimit?: number;
  totalLimit?: number;
  timeWindow?: {
    start: string;
    end: string;
  };
  status: 'draft' | 'active' | 'paused';
}

export const CampaignBuilder: React.FC = () => {
  const [campaignType, setCampaignType] = useState<'linkedin' | 'email' | 'whatsapp' | 'multi'>('linkedin');
  const [campaignName, setCampaignName] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['linkedin']);
  const [steps, setSteps] = useState<CampaignStep[]>([]);
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);
  const [followUpCount, setFollowUpCount] = useState(3);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(20);
  const [accountAge, setAccountAge] = useState(90); // days
  const [showLimitWarnings, setShowLimitWarnings] = useState(true);
  const [platformLimits, setPlatformLimits] = useState(PLATFORM_LIMITS.linkedin);
  const [showWhatsAppWarning, setShowWhatsAppWarning] = useState(false);

  // Update platform limits when channels change
  useEffect(() => {
    const primaryPlatform = selectedChannels[0] || 'linkedin';
    
    const limits = SmartLimitCalculator.calculateSafeLimits(
      primaryPlatform,
      accountAge,
      0,
      accountAge > 30
    );
    
    setPlatformLimits(limits);
    
    // Set safe daily limit based on primary platform
    if (primaryPlatform === 'linkedin') {
      setDailyLimit(limits.daily.connectionRequests || 20);
    } else if (primaryPlatform === 'whatsapp') {
      setDailyLimit(Math.min(limits.daily.messages || 50, 100)); // Cap WhatsApp at 100/day for safety
    } else {
      setDailyLimit(limits.daily.messages || 100);
    }
    
    // Show WhatsApp warning if selected
    if (selectedChannels.includes('whatsapp')) {
      setShowWhatsAppWarning(true);
    }
  }, [selectedChannels, accountAge]);

  // Initialize campaign with default steps
  const initializeCampaign = (type: string, numFollowUps: number) => {
    const newSteps: CampaignStep[] = [];
    
    if (type === 'linkedin' || (type === 'multi' && selectedChannels.includes('linkedin'))) {
      // Connection request
      newSteps.push({
        id: `step-${Date.now()}`,
        type: 'connection_request',
        content: `Hi {{firstName}},

I noticed {{commonality}} and thought it would be valuable to connect.

I help {{targetRole}} professionals {{valueProposition}}.

Looking forward to connecting!

Best,
{{senderName}}`,
        delay: { value: 0, unit: 'hours' }
      });

      // Wait for acceptance
      newSteps.push({
        id: `step-${Date.now() + 1}`,
        type: 'wait',
        content: '',
        delay: { value: 2, unit: 'days' },
        condition: 'if_accepted'
      });

      // Welcome message
      newSteps.push({
        id: `step-${Date.now() + 2}`,
        type: 'message',
        content: `Hi {{firstName}},

Thanks for connecting! 

I noticed {{specificDetail}} about {{company}}.

{{contextualQuestion}}

Would you be open to a brief chat about how we're helping companies like yours {{benefit}}?

Best,
{{senderName}}`,
        delay: { value: 1, unit: 'hours' }
      });

      // Add follow-ups
      for (let i = 0; i < numFollowUps; i++) {
        newSteps.push({
          id: `step-${Date.now() + 3 + i}`,
          type: 'follow_up',
          content: i === numFollowUps - 1 
            ? `Hi {{firstName}},

I haven't heard back, so I'm assuming this isn't a priority right now.

I'll close your file for now, but feel free to reach out if things change.

All the best,
{{senderName}}`
            : `Hi {{firstName}},

Just following up on my previous message.

{{additionalValue}}

Worth a quick 15-minute call this week?

{{senderName}}`,
          delay: { value: i === 0 ? 3 : i === 1 ? 4 : 7, unit: 'days' },
          condition: 'if_not_replied'
        });
      }
    } else if (type === 'email' || (type === 'multi' && selectedChannels.includes('email'))) {
      // Email campaign
      newSteps.push({
        id: `step-${Date.now()}`,
        type: 'message',
        content: `Subject: {{firstName}}, quick question about {{company}}

Hi {{firstName}},

I noticed {{observation}} and wanted to reach out.

{{value_proposition}}

Would you be open to a brief call this week?

Best,
{{senderName}}`,
        delay: { value: 0, unit: 'hours' }
      });

      // Add email follow-ups
      for (let i = 0; i < numFollowUps; i++) {
        newSteps.push({
          id: `step-${Date.now() + 1 + i}`,
          type: 'follow_up',
          content: i === numFollowUps - 1
            ? `Subject: Re: {{company}} - closing the loop

Hi {{firstName}},

I haven't heard back, so I'll assume this isn't a priority right now.

If things change, feel free to reach out.

Best,
{{senderName}}`
            : `Subject: Re: {{company}}

Hi {{firstName}},

Just following up on my previous email.

{{additional_value}}

Worth a quick chat?

{{senderName}}`,
          delay: { value: i === 0 ? 3 : i === 1 ? 4 : 7, unit: 'days' },
          condition: 'if_not_replied'
        });
      }
    } else if (type === 'whatsapp') {
      // Initial message
      newSteps.push({
        id: `step-${Date.now()}`,
        type: 'message',
        content: `Hi {{firstName}}! 👋

I'm {{senderName}} from {{company}}.

{{personalizedHook}}

Mind if I share something that might help with {{painPoint}}?`,
        delay: { value: 0, unit: 'hours' }
      });

      // Add follow-ups
      for (let i = 0; i < numFollowUps; i++) {
        newSteps.push({
          id: `step-${Date.now() + 1 + i}`,
          type: 'follow_up',
          content: i === 0 
            ? `Hey {{firstName}},

Just wanted to share this quick resource about {{topic}}: {{resourceLink}}

Thought it might be helpful for {{company}}.

Any questions, let me know!`
            : `Hi {{firstName}},

Hope you had a chance to check out the resource.

Would you be interested in a quick 10-min call to discuss how this could work for {{company}}?

I have some time {{availability}}.`,
          delay: { value: i === 0 ? 1 : 3, unit: 'days' },
          condition: 'if_not_replied'
        });
      }
    } else if (type === 'multi') {
      // Multi-channel campaign - LinkedIn first, then email
      newSteps.push({
        id: `step-${Date.now()}`,
        type: 'connection_request',
        content: `Hi {{firstName}},

I noticed {{commonality}} and thought it would be valuable to connect.

Looking forward to connecting!

Best,
{{senderName}}`,
        delay: { value: 0, unit: 'hours' }
      });

      newSteps.push({
        id: `step-${Date.now() + 1}`,
        type: 'wait',
        content: '',
        delay: { value: 2, unit: 'days' },
        condition: 'if_accepted'
      });

      newSteps.push({
        id: `step-${Date.now() + 2}`,
        type: 'message',
        content: `Hi {{firstName}},

Thanks for connecting! 

{{contextualQuestion}}

Best,
{{senderName}}`,
        delay: { value: 1, unit: 'hours' }
      });

      // Switch to email for follow-ups
      for (let i = 0; i < numFollowUps; i++) {
        newSteps.push({
          id: `step-${Date.now() + 3 + i}`,
          type: 'follow_up',
          content: `[Email] Subject: Following up from LinkedIn

{{followUpMessage}}`,
          delay: { value: i === 0 ? 5 : 7, unit: 'days' },
          condition: 'if_not_replied'
        });
      }
      newSteps.push({
        id: `step-${Date.now()}`,
        type: 'message',
        content: `Hi {{firstName}},

I see we're both members of {{groupName}}.

I noticed your post/comment about {{topic}} and wanted to share {{value}}.

Would you be interested in {{callToAction}}?

Best,
{{senderName}}`,
        delay: { value: 0, unit: 'hours' }
      });

      // Add follow-ups
      for (let i = 0; i < Math.min(numFollowUps, 2); i++) { // Limit group follow-ups
        newSteps.push({
          id: `step-${Date.now() + 1 + i}`,
          type: 'follow_up',
          content: `Hey {{firstName}},

Following up on my previous message about {{topic}}.

We've helped {{similarCompany}} achieve {{result}}.

Open to a quick chat?`,
          delay: { value: 4, unit: 'days' },
          condition: 'if_not_replied'
        });
      }
    }

    setSteps(newSteps);
  };

  const addStep = (afterIndex: number) => {
    const newStep: CampaignStep = {
      id: `step-${Date.now()}`,
      type: 'follow_up',
      content: 'Write your message here...',
      delay: { value: 3, unit: 'days' },
      condition: 'if_not_replied'
    };
    
    const newSteps = [...steps];
    newSteps.splice(afterIndex + 1, 0, newStep);
    setSteps(newSteps);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...steps];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < steps.length) {
      [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
      setSteps(newSteps);
    }
  };

  const duplicateStep = (index: number) => {
    const stepToDuplicate = steps[index];
    const newStep = {
      ...stepToDuplicate,
      id: `step-${Date.now()}`
    };
    
    const newSteps = [...steps];
    newSteps.splice(index + 1, 0, newStep);
    setSteps(newSteps);
  };

  const handleSaveCampaign = async () => {
    if (!campaignName || steps.length === 0) {
      toast({
        title: "Error",
        description: "Please complete campaign configuration",
        variant: "destructive",
      });
      return;
    }

    const campaign: Campaign = {
      id: `campaign-${Date.now()}`,
      name: campaignName,
      type: campaignType,
      platform: selectedPlatform,
      steps: steps,
      status: 'active'
    };

    setActiveCampaigns([...activeCampaigns, campaign]);
    setCampaignName('');
    setSteps([]);

    toast({
      title: "Campaign Created",
      description: `${campaign.name} is now active with ${steps.length} steps`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Campaign Builder</h2>
          <p className="text-muted-foreground">Create flexible multi-step outreach campaigns</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <Zap className="mr-1 h-3 w-3" />
            Self-hosted n8n - No limits!
          </Badge>
          <Button 
            onClick={handleSaveCampaign} 
            disabled={steps.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" />
            Save & Deploy
          </Button>
        </div>
      </div>

      {/* WhatsApp Warning */}
      {showWhatsAppWarning && selectedChannels.includes('whatsapp') && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-sm">
            <div className="flex justify-between items-start">
              <div>
                <strong>WhatsApp Business Requirements</strong>
                <ul className="mt-2 space-y-1">
                  <li>• Only message users who have opted in</li>
                  <li>• Requires WhatsApp Business API account</li>
                  <li>• 24-hour messaging window after user contact</li>
                  <li>• High risk of ban for unsolicited messages</li>
                </ul>
                <p className="mt-2 font-semibold">Recommended: Use WhatsApp only for existing customers</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowWhatsAppWarning(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Platform Limits Warning */}
      {showLimitWarnings && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-sm">
            <div className="flex justify-between items-start">
              <div>
                <strong>Platform Safety Limits Active</strong>
                {selectedChannels.includes('linkedin') && (
                  <p className="mt-1">LinkedIn: {platformLimits.daily.connectionRequests || 20} connections/day, {platformLimits.daily.messages || 50} messages/day</p>
                )}
                {selectedChannels.includes('email') && (
                  <p className="mt-1">Email: 200-500 emails/day (depending on warmup)</p>
                )}
                {selectedChannels.includes('whatsapp') && (
                  <p className="mt-1">WhatsApp: 100 messages/day (with opt-in only)</p>
                )}
                <p className="text-xs mt-1 text-gray-600">Limits based on {accountAge} day old account.</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowLimitWarnings(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Campaign Type Selection - Professional Channels */}
      <div className="grid grid-cols-4 gap-4">
        <Card 
          className={`cursor-pointer transition-all ${campaignType === 'linkedin' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => {
            setCampaignType('linkedin');
            setSelectedChannels(['linkedin']);
            setSteps([]);
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Linkedin className="h-5 w-5 text-blue-600" />
              LinkedIn Only
            </CardTitle>
            <CardDescription>
              Connection + Messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="outline" className="bg-green-50">
                <Shield className="h-3 w-3 mr-1" />
                Best for B2B
              </Badge>
              <p className="text-xs text-muted-foreground">
                Professional outreach
              </p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${campaignType === 'email' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => {
            setCampaignType('email');
            setSelectedChannels(['email']);
            setSteps([]);
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              Email Only
            </CardTitle>
            <CardDescription>
              Email sequences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="outline" className="bg-purple-50">
                <Send className="h-3 w-3 mr-1" />
                Scalable
              </Badge>
              <p className="text-xs text-muted-foreground">
                Higher volume
              </p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${campaignType === 'whatsapp' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => {
            setCampaignType('whatsapp');
            setSelectedChannels(['whatsapp']);
            setSteps([]);
            setShowWhatsAppWarning(true);
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              WhatsApp
            </CardTitle>
            <CardDescription>
              Customer messaging
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="outline" className="bg-red-50">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Opt-in Required
              </Badge>
              <p className="text-xs text-muted-foreground">
                Existing customers only
              </p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${campaignType === 'multi' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => {
            setCampaignType('multi');
            setSelectedChannels(['linkedin', 'email']);
            setSteps([]);
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              Multi-Channel
            </CardTitle>
            <CardDescription>
              LinkedIn + Email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="outline" className="bg-orange-50">
                <Target className="h-3 w-3 mr-1" />
                Most Effective
              </Badge>
              <p className="text-xs text-muted-foreground">
                Best results
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Setup</CardTitle>
          <CardDescription>
            Configure your {campaignType} campaign
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                placeholder="e.g., Q1 Sales Outreach"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>

            {campaignType === 'multi' && (
              <div className="space-y-2">
                <Label>Active Channels</Label>
                <div className="flex gap-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedChannels.includes('linkedin')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedChannels([...selectedChannels, 'linkedin']);
                        } else {
                          setSelectedChannels(selectedChannels.filter(c => c !== 'linkedin'));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">LinkedIn</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedChannels.includes('email')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedChannels([...selectedChannels, 'email']);
                        } else {
                          setSelectedChannels(selectedChannels.filter(c => c !== 'email'));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Email</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedChannels.includes('whatsapp')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedChannels([...selectedChannels, 'whatsapp']);
                          setShowWhatsAppWarning(true);
                        } else {
                          setSelectedChannels(selectedChannels.filter(c => c !== 'whatsapp'));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">WhatsApp</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Follow-up Configuration with Safety Limits */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex justify-between items-center">
              <div>
                <Label>Number of Follow-up Messages</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  LinkedIn best practice: 2-4 follow-ups
                </p>
              </div>
              <Badge variant="outline">{followUpCount} follow-ups</Badge>
            </div>
            <Slider 
              value={[followUpCount]} 
              onValueChange={([value]) => setFollowUpCount(value)}
              min={0}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>No follow-ups</span>
              <span>10 follow-ups</span>
            </div>
            {followUpCount > 5 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  More than 5 follow-ups may be seen as aggressive. Consider quality over quantity.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Daily Limits Configuration */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <Label>Daily Sending Limit</Label>
              <Badge variant={dailyLimit > platformLimits.daily.connectionRequests ? 'destructive' : 'outline'}>
                {dailyLimit} per day
              </Badge>
            </div>
            <Slider 
              value={[dailyLimit]} 
              onValueChange={([value]) => setDailyLimit(value)}
              min={5}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <Badge variant="outline" className="bg-green-50">
                  Conservative
                </Badge>
                <p className="mt-1">5-20/day</p>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="bg-yellow-50">
                  Moderate
                </Badge>
                <p className="mt-1">20-50/day</p>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="bg-red-50">
                  Aggressive
                </Badge>
                <p className="mt-1">50+/day</p>
              </div>
            </div>
            {dailyLimit > (platformLimits.daily.connectionRequests || 20) && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Exceeding {platformLimits.daily.connectionRequests} connections/day risks LinkedIn restrictions!
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => initializeCampaign(campaignType, followUpCount)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Generate Template
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAdvancedMode(!isAdvancedMode)}
              >
                <Settings className="mr-2 h-4 w-4" />
                {isAdvancedMode ? 'Simple' : 'Advanced'} Mode
              </Button>
            </div>
            <Button 
              onClick={() => {
                if (steps.length === 0) {
                  initializeCampaign(campaignType, followUpCount);
                }
              }}
              disabled={campaignName === ''}
            >
              <Play className="mr-2 h-4 w-4" />
              {steps.length > 0 ? 'Edit Sequence' : 'Create Sequence'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Platform Best Practices */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4" />
            LinkedIn Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Personalize every connection request - generic messages get flagged</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Wait 24-48 hours after connection before first message</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Spread actions throughout business hours (9 AM - 5 PM)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Use different templates to avoid pattern detection</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600">⚠</span>
              <span>New accounts: Start with 5-10 connections/day for first week</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Message Sequence Editor */}
      {steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Message Sequence</span>
              <Badge>{steps.length} steps</Badge>
            </CardTitle>
            <CardDescription>
              Customize each step of your campaign
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Step {index + 1}</Badge>
                      <Select 
                        value={step.type} 
                        onValueChange={(value: any) => {
                          const newSteps = [...steps];
                          newSteps[index] = { ...step, type: value };
                          setSteps(newSteps);
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {index === 0 && campaignType === 'cr' && (
                            <SelectItem value="connection_request">Connection Request</SelectItem>
                          )}
                          <SelectItem value="message">Message</SelectItem>
                          <SelectItem value="follow_up">Follow-up</SelectItem>
                          <SelectItem value="wait">Wait</SelectItem>
                        </SelectContent>
                      </Select>
                      {step.delay.value > 0 && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <Input
                            type="number"
                            value={step.delay.value}
                            onChange={(e) => {
                              const newSteps = [...steps];
                              newSteps[index] = {
                                ...step,
                                delay: { ...step.delay, value: parseInt(e.target.value) || 0 }
                              };
                              setSteps(newSteps);
                            }}
                            className="w-16 h-8"
                          />
                          <Select
                            value={step.delay.unit}
                            onValueChange={(value: any) => {
                              const newSteps = [...steps];
                              newSteps[index] = {
                                ...step,
                                delay: { ...step.delay, unit: value }
                              };
                              setSteps(newSteps);
                            }}
                          >
                            <SelectTrigger className="w-24 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hours">hours</SelectItem>
                              <SelectItem value="days">days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => moveStep(index, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => moveStep(index, 'down')}
                        disabled={index === steps.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => duplicateStep(index)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => addStep(index)}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeStep(index)}
                        disabled={steps.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {step.type !== 'wait' && (
                    <Textarea
                      value={step.content}
                      onChange={(e) => {
                        const newSteps = [...steps];
                        newSteps[index] = { ...step, content: e.target.value };
                        setSteps(newSteps);
                      }}
                      rows={6}
                      className="font-mono text-sm"
                      placeholder="Enter your message..."
                    />
                  )}

                  {isAdvancedMode && step.type !== 'connection_request' && (
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Condition:</Label>
                      <Select
                        value={step.condition}
                        onValueChange={(value: any) => {
                          const newSteps = [...steps];
                          newSteps[index] = { ...step, condition: value };
                          setSteps(newSteps);
                        }}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="No condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No condition</SelectItem>
                          <SelectItem value="if_replied">Skip if replied</SelectItem>
                          <SelectItem value="if_not_replied">Only if not replied</SelectItem>
                          {campaignType === 'cr' && (
                            <SelectItem value="if_accepted">Only if accepted</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ))}

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => addStep(steps.length - 1)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Step
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Campaigns */}
      {activeCampaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Campaigns</CardTitle>
            <CardDescription>
              Monitor your running campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {campaign.platform === 'linkedin' ? (
                        <Linkedin className="h-5 w-5 text-primary" />
                      ) : campaign.platform === 'whatsapp' ? (
                        <MessageCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Users className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {campaign.steps.length} steps • {campaign.type === 'cr' ? 'Connection Request' : campaign.type === 'messenger' ? 'Messenger' : 'Group'} Campaign
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                      {campaign.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      {campaign.status === 'active' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
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