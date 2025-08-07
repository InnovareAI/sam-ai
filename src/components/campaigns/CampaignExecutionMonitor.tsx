import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  Activity, CheckCircle, XCircle, Clock, Send, 
  Mail, Linkedin, Users, TrendingUp, Pause, Play,
  RefreshCw, AlertTriangle, Zap, BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ExecutionStep {
  id: string;
  timestamp: Date;
  action: string;
  channel: 'email' | 'linkedin';
  recipient: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'failed';
  message?: string;
  error?: string;
}

interface CampaignExecution {
  campaignId: string;
  campaignName: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  startedAt: Date;
  progress: number;
  stats: {
    totalContacts: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    replied: number;
    failed: number;
  };
  currentStep: string;
  nextExecutionTime?: Date;
  executionLog: ExecutionStep[];
}

export const CampaignExecutionMonitor: React.FC<{ campaignId: string }> = ({ campaignId }) => {
  const [execution, setExecution] = useState<CampaignExecution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [realtimeUpdates, setRealtimeUpdates] = useState<ExecutionStep[]>([]);

  useEffect(() => {
    // Load initial execution data
    loadExecutionData();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`campaign-execution-${campaignId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'campaign_executions',
        filter: `campaign_id=eq.${campaignId}`
      }, (payload) => {
        handleRealtimeUpdate(payload);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [campaignId]);

  const loadExecutionData = async () => {
    setIsLoading(true);
    
    // Simulate loading execution data
    setTimeout(() => {
      setExecution({
        campaignId,
        campaignName: 'Q1 Enterprise Outreach',
        status: 'running',
        startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        progress: 35,
        stats: {
          totalContacts: 150,
          sent: 52,
          delivered: 50,
          opened: 38,
          clicked: 12,
          replied: 8,
          failed: 2
        },
        currentStep: 'Sending LinkedIn connection requests (Day 3)',
        nextExecutionTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        executionLog: generateMockExecutionLog()
      });
      setIsLoading(false);
    }, 1000);
  };

  const generateMockExecutionLog = (): ExecutionStep[] => {
    const log: ExecutionStep[] = [];
    const now = Date.now();
    
    // Generate some mock execution steps
    for (let i = 0; i < 10; i++) {
      const statuses: ExecutionStep['status'][] = ['sent', 'delivered', 'opened', 'clicked', 'replied'];
      const channels: ExecutionStep['channel'][] = ['linkedin', 'email'];
      
      log.push({
        id: `step-${i}`,
        timestamp: new Date(now - (10 - i) * 60 * 60 * 1000), // Spread over last 10 hours
        action: i % 2 === 0 ? 'Connection Request' : 'Follow-up Email',
        channel: channels[i % 2],
        recipient: `prospect${i + 1}@company.com`,
        status: statuses[Math.min(i, statuses.length - 1)],
        message: 'Message sent successfully'
      });
    }
    
    return log.reverse(); // Most recent first
  };

  const handleRealtimeUpdate = (payload: any) => {
    console.log('Real-time update:', payload);
    
    // Add to real-time updates
    const newStep: ExecutionStep = {
      id: `rt-${Date.now()}`,
      timestamp: new Date(),
      action: 'New Activity',
      channel: 'linkedin',
      recipient: 'new@prospect.com',
      status: 'sent',
      message: 'Real-time update received'
    };
    
    setRealtimeUpdates(prev => [newStep, ...prev].slice(0, 5)); // Keep last 5
  };

  const pauseCampaign = () => {
    if (execution) {
      setExecution({ ...execution, status: 'paused' });
    }
  };

  const resumeCampaign = () => {
    if (execution) {
      setExecution({ ...execution, status: 'running' });
    }
  };

  const getStatusColor = (status: ExecutionStep['status']) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'opened': return 'bg-purple-100 text-purple-800';
      case 'clicked': return 'bg-indigo-100 text-indigo-800';
      case 'replied': return 'bg-emerald-100 text-emerald-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChannelIcon = (channel: ExecutionStep['channel']) => {
    return channel === 'linkedin' ? 
      <Linkedin className="h-3 w-3" /> : 
      <Mail className="h-3 w-3" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading execution data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!execution) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No execution data available for this campaign.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Campaign Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {execution.campaignName}
              </CardTitle>
              <CardDescription>
                Started {execution.startedAt.toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={execution.status === 'running' ? 'default' : 'secondary'}
                className="px-3 py-1"
              >
                {execution.status === 'running' && <Activity className="mr-1 h-3 w-3" />}
                {execution.status === 'paused' && <Pause className="mr-1 h-3 w-3" />}
                {execution.status.toUpperCase()}
              </Badge>
              {execution.status === 'running' ? (
                <Button size="sm" variant="outline" onClick={pauseCampaign}>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={resumeCampaign}>
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Campaign Progress</span>
              <span className="font-medium">{execution.progress}%</span>
            </div>
            <Progress value={execution.progress} className="h-2" />
          </div>

          {/* Current Activity */}
          <Alert className="mb-4">
            <Zap className="h-4 w-4" />
            <AlertDescription>
              <strong>Current Step:</strong> {execution.currentStep}
              {execution.nextExecutionTime && (
                <div className="mt-1 text-xs text-gray-600">
                  Next execution: {execution.nextExecutionTime.toLocaleTimeString()}
                </div>
              )}
            </AlertDescription>
          </Alert>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{execution.stats.totalContacts}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{execution.stats.sent}</div>
              <div className="text-xs text-gray-600">Sent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{execution.stats.delivered}</div>
              <div className="text-xs text-gray-600">Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{execution.stats.opened}</div>
              <div className="text-xs text-gray-600">Opened</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{execution.stats.clicked}</div>
              <div className="text-xs text-gray-600">Clicked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{execution.stats.replied}</div>
              <div className="text-xs text-gray-600">Replied</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Updates */}
      {realtimeUpdates.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              Real-time Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {realtimeUpdates.map(update => (
                <div key={update.id} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="bg-white">NEW</Badge>
                  <span>{update.action} to {update.recipient}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Execution Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Execution Log</CardTitle>
          <CardDescription>Recent campaign activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {execution.executionLog.map((step, index) => (
              <div key={step.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                <div className="mt-1">
                  {step.status === 'replied' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : step.status === 'failed' ? (
                    <XCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getStatusColor(step.status)} variant="secondary">
                      {step.status}
                    </Badge>
                    <Badge variant="outline" className="px-2 py-0">
                      {getChannelIcon(step.channel)}
                      <span className="ml-1 text-xs">{step.channel}</span>
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {step.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{step.action}</p>
                  <p className="text-xs text-gray-600">To: {step.recipient}</p>
                  {step.message && (
                    <p className="text-xs text-gray-500 mt-1">{step.message}</p>
                  )}
                  {step.error && (
                    <p className="text-xs text-red-600 mt-1">{step.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Open Rate</p>
              <p className="text-2xl font-bold">
                {execution.stats.sent > 0 
                  ? ((execution.stats.opened / execution.stats.sent) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Reply Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {execution.stats.sent > 0 
                  ? ((execution.stats.replied / execution.stats.sent) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Click Rate</p>
              <p className="text-2xl font-bold">
                {execution.stats.opened > 0 
                  ? ((execution.stats.clicked / execution.stats.opened) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Failure Rate</p>
              <p className="text-2xl font-bold text-red-600">
                {execution.stats.sent > 0 
                  ? ((execution.stats.failed / execution.stats.sent) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};