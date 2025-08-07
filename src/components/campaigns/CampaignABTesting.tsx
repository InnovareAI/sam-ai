import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FlaskConical, Copy, Zap, BarChart3, TrendingUp,
  CheckCircle, XCircle, AlertTriangle, Plus, Trash2,
  Play, Pause, RefreshCw, Target, Users, Mail, Linkedin
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  allocation: number; // Percentage of traffic
  message: {
    subject?: string;
    content: string;
    channel: 'email' | 'linkedin';
  };
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
    meetings: number;
  };
  performance: {
    openRate: number;
    clickRate: number;
    replyRate: number;
    meetingRate: number;
    confidence: number; // Statistical confidence
  };
}

interface ABTest {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  hypothesis: string;
  startDate?: Date;
  endDate?: Date;
  variants: ABTestVariant[];
  winner?: string; // Variant ID
  minSampleSize: number;
  currentSampleSize: number;
  statisticalSignificance: number;
}

export const CampaignABTesting: React.FC<{ campaignId: string }> = ({ campaignId }) => {
  const [activeTest, setActiveTest] = useState<ABTest>({
    id: 'test-1',
    name: 'Subject Line Test',
    status: 'running',
    hypothesis: 'A more personalized subject line will increase open rates by 15%',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    variants: [
      {
        id: 'variant-a',
        name: 'Control',
        description: 'Standard professional subject',
        allocation: 50,
        message: {
          subject: 'Quick question about {{company}}',
          content: 'Hi {{firstName}}, I noticed...',
          channel: 'email'
        },
        stats: {
          sent: 125,
          opened: 87,
          clicked: 28,
          replied: 12,
          meetings: 3
        },
        performance: {
          openRate: 69.6,
          clickRate: 32.2,
          replyRate: 9.6,
          meetingRate: 2.4,
          confidence: 85
        }
      },
      {
        id: 'variant-b',
        name: 'Personalized',
        description: 'Include specific trigger event',
        allocation: 50,
        message: {
          subject: '{{firstName}}, congrats on {{trigger_event}}',
          content: 'Hi {{firstName}}, I saw that...',
          channel: 'email'
        },
        stats: {
          sent: 125,
          opened: 102,
          clicked: 38,
          replied: 18,
          meetings: 5
        },
        performance: {
          openRate: 81.6,
          clickRate: 37.3,
          replyRate: 14.4,
          meetingRate: 4.0,
          confidence: 92
        }
      }
    ],
    winner: 'variant-b',
    minSampleSize: 200,
    currentSampleSize: 250,
    statisticalSignificance: 95
  });

  const [newVariant, setNewVariant] = useState({
    name: '',
    description: '',
    subject: '',
    content: ''
  });

  const [showCreateTest, setShowCreateTest] = useState(false);

  const calculateStatisticalSignificance = (variantA: ABTestVariant, variantB: ABTestVariant) => {
    // Simplified statistical significance calculation
    const conversionA = variantA.performance.replyRate / 100;
    const conversionB = variantB.performance.replyRate / 100;
    const pooledProbability = 
      (variantA.stats.replied + variantB.stats.replied) / 
      (variantA.stats.sent + variantB.stats.sent);
    
    const standardError = Math.sqrt(
      pooledProbability * (1 - pooledProbability) * 
      (1/variantA.stats.sent + 1/variantB.stats.sent)
    );
    
    const zScore = Math.abs(conversionA - conversionB) / standardError;
    const significance = (1 - 2 * (1 - normalCDF(zScore))) * 100;
    
    return Math.min(Math.max(significance, 0), 100);
  };

  const normalCDF = (x: number) => {
    // Approximation of normal cumulative distribution function
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - probability : probability;
  };

  const getWinnerBadge = (variant: ABTestVariant) => {
    if (activeTest.winner === variant.id) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Winner
        </Badge>
      );
    }
    return null;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return 'text-green-600';
    if (confidence >= 90) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const startTest = () => {
    setActiveTest({ ...activeTest, status: 'running' });
    toast({
      title: "A/B Test Started",
      description: "Your test is now running. Results will update in real-time.",
    });
  };

  const pauseTest = () => {
    setActiveTest({ ...activeTest, status: 'paused' });
    toast({
      title: "A/B Test Paused",
      description: "Test has been paused. You can resume at any time.",
    });
  };

  const addVariant = () => {
    if (!newVariant.name || !newVariant.content) {
      toast({
        title: "Missing Information",
        description: "Please provide variant name and content",
        variant: "destructive"
      });
      return;
    }

    const variant: ABTestVariant = {
      id: `variant-${Date.now()}`,
      name: newVariant.name,
      description: newVariant.description,
      allocation: Math.floor(100 / (activeTest.variants.length + 1)),
      message: {
        subject: newVariant.subject,
        content: newVariant.content,
        channel: 'email'
      },
      stats: {
        sent: 0,
        opened: 0,
        clicked: 0,
        replied: 0,
        meetings: 0
      },
      performance: {
        openRate: 0,
        clickRate: 0,
        replyRate: 0,
        meetingRate: 0,
        confidence: 0
      }
    };

    setActiveTest({
      ...activeTest,
      variants: [...activeTest.variants, variant]
    });

    setNewVariant({ name: '', description: '', subject: '', content: '' });
    toast({
      title: "Variant Added",
      description: `"${variant.name}" has been added to the test`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FlaskConical className="h-6 w-6 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold">A/B Testing</h2>
            <p className="text-gray-600">Optimize your campaigns with data-driven testing</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateTest(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Test
        </Button>
      </div>

      {/* Active Test Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{activeTest.name}</CardTitle>
              <CardDescription>{activeTest.hypothesis}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={activeTest.status === 'running' ? 'default' : 'secondary'}>
                {activeTest.status.toUpperCase()}
              </Badge>
              {activeTest.status === 'running' ? (
                <Button size="sm" variant="outline" onClick={pauseTest}>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
              ) : activeTest.status === 'paused' ? (
                <Button size="sm" variant="outline" onClick={startTest}>
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={startTest}>
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Sample Size Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Sample Size Progress</span>
              <span className="font-medium">
                {activeTest.currentSampleSize} / {activeTest.minSampleSize}
              </span>
            </div>
            <Progress 
              value={(activeTest.currentSampleSize / activeTest.minSampleSize) * 100} 
              className="h-2"
            />
            <p className="text-xs text-gray-600 mt-1">
              Minimum sample size needed for statistical significance
            </p>
          </div>

          {/* Statistical Significance */}
          <Alert className="mb-6">
            <BarChart3 className="h-4 w-4" />
            <AlertDescription>
              <strong>Statistical Significance:</strong>{' '}
              <span className={getConfidenceColor(activeTest.statisticalSignificance)}>
                {activeTest.statisticalSignificance}%
              </span>
              {activeTest.statisticalSignificance >= 95 ? (
                <span className="ml-2 text-green-600">✓ Test is conclusive</span>
              ) : (
                <span className="ml-2 text-gray-600">Need more data</span>
              )}
            </AlertDescription>
          </Alert>

          {/* Variants Comparison */}
          <div className="space-y-4">
            {activeTest.variants.map((variant, index) => (
              <Card key={variant.id} className={activeTest.winner === variant.id ? 'ring-2 ring-green-500' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {String.fromCharCode(65 + index)}
                      </Badge>
                      <span className="font-medium">{variant.name}</span>
                      {getWinnerBadge(variant)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {variant.allocation}% traffic
                      </Badge>
                      <Button size="icon" variant="ghost">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{variant.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Message Preview */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    {variant.message.subject && (
                      <p className="text-sm font-medium mb-1">Subject: {variant.message.subject}</p>
                    )}
                    <p className="text-sm text-gray-600 line-clamp-2">{variant.message.content}</p>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-5 gap-3 text-center">
                    <div>
                      <p className="text-2xl font-bold">{variant.stats.sent}</p>
                      <p className="text-xs text-gray-600">Sent</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{variant.performance.openRate.toFixed(1)}%</p>
                      <p className="text-xs text-gray-600">Open Rate</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{variant.performance.clickRate.toFixed(1)}%</p>
                      <p className="text-xs text-gray-600">Click Rate</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {variant.performance.replyRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-600">Reply Rate</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{variant.stats.meetings}</p>
                      <p className="text-xs text-gray-600">Meetings</p>
                    </div>
                  </div>

                  {/* Confidence Level */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Confidence Level</span>
                      <div className="flex items-center gap-2">
                        <Progress value={variant.performance.confidence} className="w-24 h-2" />
                        <span className={`text-sm font-medium ${getConfidenceColor(variant.performance.confidence)}`}>
                          {variant.performance.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add New Variant */}
          {activeTest.status === 'draft' && (
            <Card className="mt-4 border-dashed">
              <CardHeader>
                <CardTitle className="text-base">Add New Variant</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Variant Name</Label>
                    <Input 
                      placeholder="e.g., Urgent CTA"
                      value={newVariant.name}
                      onChange={(e) => setNewVariant({...newVariant, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input 
                      placeholder="What's different?"
                      value={newVariant.description}
                      onChange={(e) => setNewVariant({...newVariant, description: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label>Subject Line (Email)</Label>
                  <Input 
                    placeholder="Email subject..."
                    value={newVariant.subject}
                    onChange={(e) => setNewVariant({...newVariant, subject: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Message Content</Label>
                  <Textarea 
                    placeholder="Write your message variant..."
                    rows={3}
                    value={newVariant.content}
                    onChange={(e) => setNewVariant({...newVariant, content: e.target.value})}
                  />
                </div>
                <Button onClick={addVariant}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variant
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Test History */}
      <Card>
        <CardHeader>
          <CardTitle>Previous Tests</CardTitle>
          <CardDescription>Learn from past experiments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                name: 'CTA Button Color',
                winner: 'Green CTA',
                improvement: '+23% CTR',
                date: '2 weeks ago'
              },
              {
                name: 'Message Length Test',
                winner: 'Shorter Message',
                improvement: '+15% Reply Rate',
                date: '1 month ago'
              },
              {
                name: 'Personalization Level',
                winner: 'High Personalization',
                improvement: '+31% Open Rate',
                date: '2 months ago'
              }
            ].map((test, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{test.name}</p>
                  <p className="text-sm text-gray-600">Winner: {test.winner}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-green-600">
                    {test.improvement}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">{test.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};