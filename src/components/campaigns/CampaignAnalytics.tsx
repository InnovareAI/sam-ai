import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, TrendingUp, TrendingDown, Users, Mail, 
  Linkedin, Clock, Target, DollarSign, Calendar,
  ArrowUp, ArrowDown, Minus, Filter, Download,
  ChevronUp, ChevronDown, MessageSquare, MousePointer
} from 'lucide-react';

interface CampaignMetrics {
  campaignId: string;
  campaignName: string;
  dateRange: { start: Date; end: Date };
  overview: {
    totalContacts: number;
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    totalReplied: number;
    totalMeetingsBooked: number;
    totalRevenue: number;
  };
  performance: {
    openRate: number;
    clickRate: number;
    replyRate: number;
    meetingRate: number;
    conversionRate: number;
    avgResponseTime: number; // in hours
  };
  channelBreakdown: {
    linkedin: {
      sent: number;
      accepted: number;
      messaged: number;
      replied: number;
    };
    email: {
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
      replied: number;
    };
  };
  dailyMetrics: Array<{
    date: Date;
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
  }>;
  topPerformers: Array<{
    message: string;
    channel: 'linkedin' | 'email';
    replyRate: number;
    opens: number;
    replies: number;
  }>;
  prospectEngagement: Array<{
    name: string;
    company: string;
    engagementScore: number;
    lastActivity: string;
    status: 'hot' | 'warm' | 'cold';
  }>;
}

export const CampaignAnalytics: React.FC<{ campaignId: string }> = ({ campaignId }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'linkedin' | 'email'>('all');
  
  // Mock data - in production, this would come from your backend
  const metrics: CampaignMetrics = useMemo(() => ({
    campaignId,
    campaignName: 'Q1 Enterprise Outreach',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    overview: {
      totalContacts: 250,
      totalSent: 450, // Multiple messages per contact
      totalOpened: 312,
      totalClicked: 89,
      totalReplied: 42,
      totalMeetingsBooked: 12,
      totalRevenue: 125000
    },
    performance: {
      openRate: 69.3,
      clickRate: 28.5,
      replyRate: 16.8,
      meetingRate: 4.8,
      conversionRate: 2.4,
      avgResponseTime: 18.5
    },
    channelBreakdown: {
      linkedin: {
        sent: 150,
        accepted: 98,
        messaged: 98,
        replied: 28
      },
      email: {
        sent: 300,
        delivered: 285,
        opened: 214,
        clicked: 89,
        replied: 14
      }
    },
    dailyMetrics: generateDailyMetrics(),
    topPerformers: [
      {
        message: 'Initial LinkedIn Connection Request',
        channel: 'linkedin',
        replyRate: 28.6,
        opens: 98,
        replies: 28
      },
      {
        message: 'Follow-up Email with Case Study',
        channel: 'email',
        replyRate: 12.3,
        opens: 89,
        replies: 11
      },
      {
        message: 'Value-Add Email with Resource',
        channel: 'email',
        replyRate: 8.9,
        opens: 67,
        replies: 6
      }
    ],
    prospectEngagement: [
      {
        name: 'John Smith',
        company: 'TechCorp',
        engagementScore: 92,
        lastActivity: 'Replied to email',
        status: 'hot'
      },
      {
        name: 'Sarah Chen',
        company: 'FastScale',
        engagementScore: 78,
        lastActivity: 'Clicked link',
        status: 'warm'
      },
      {
        name: 'Mike Johnson',
        company: 'DataFirst',
        engagementScore: 45,
        lastActivity: 'Opened email',
        status: 'cold'
      }
    ]
  }), [campaignId, timeRange]);

  function generateDailyMetrics() {
    const metrics = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      metrics.push({
        date,
        sent: Math.floor(Math.random() * 20) + 5,
        opened: Math.floor(Math.random() * 15) + 3,
        clicked: Math.floor(Math.random() * 5) + 1,
        replied: Math.floor(Math.random() * 3)
      });
    }
    return metrics;
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="h-3 w-3 text-green-600" />;
    if (value < 0) return <ArrowDown className="h-3 w-3 text-red-600" />;
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  const getEngagementColor = (status: string) => {
    switch (status) {
      case 'hot': return 'text-red-600 bg-red-100';
      case 'warm': return 'text-orange-600 bg-orange-100';
      case 'cold': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Campaign Analytics</h2>
          <p className="text-gray-600">{metrics.campaignName}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['7d', '30d', '90d', 'all'] as const).map(range => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range === 'all' ? 'All Time' : `Last ${range}`}
          </Button>
        ))}
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overview.totalContacts}</div>
            <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
              {getTrendIcon(12)}
              <span>12% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Reply Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.performance.replyRate}%
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
              {getTrendIcon(3.2)}
              <span>3.2% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Meetings Booked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {metrics.overview.totalMeetingsBooked}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
              {getTrendIcon(2)}
              <span>+2 from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pipeline Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${(metrics.overview.totalRevenue / 1000).toFixed(0)}k
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
              {getTrendIcon(45)}
              <span>45% from last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Different Views */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="prospects">Prospects</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Funnel</CardTitle>
              <CardDescription>Contact journey through your campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Sent</span>
                    <span className="text-sm font-medium">{metrics.overview.totalSent}</span>
                  </div>
                  <Progress value={100} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Opened</span>
                    <span className="text-sm font-medium">
                      {metrics.overview.totalOpened} ({metrics.performance.openRate}%)
                    </span>
                  </div>
                  <Progress value={metrics.performance.openRate} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Clicked</span>
                    <span className="text-sm font-medium">
                      {metrics.overview.totalClicked} ({metrics.performance.clickRate}%)
                    </span>
                  </div>
                  <Progress value={metrics.performance.clickRate} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Replied</span>
                    <span className="text-sm font-medium">
                      {metrics.overview.totalReplied} ({metrics.performance.replyRate}%)
                    </span>
                  </div>
                  <Progress value={metrics.performance.replyRate} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Meetings</span>
                    <span className="text-sm font-medium">
                      {metrics.overview.totalMeetingsBooked} ({metrics.performance.meetingRate}%)
                    </span>
                  </div>
                  <Progress value={metrics.performance.meetingRate} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Trend Chart (Simplified) */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Activity</CardTitle>
              <CardDescription>Campaign engagement over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end gap-1">
                {metrics.dailyMetrics.slice(-14).map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col gap-1">
                    <div 
                      className="bg-blue-500 rounded-t"
                      style={{ height: `${day.sent * 3}px` }}
                      title={`Sent: ${day.sent}`}
                    />
                    <div 
                      className="bg-green-500"
                      style={{ height: `${day.opened * 3}px` }}
                      title={`Opened: ${day.opened}`}
                    />
                    <div 
                      className="bg-purple-500 rounded-b"
                      style={{ height: `${day.replied * 10}px` }}
                      title={`Replied: ${day.replied}`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span className="text-xs">Sent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span className="text-xs">Opened</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded" />
                  <span className="text-xs">Replied</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Linkedin className="h-5 w-5 text-blue-600" />
                  LinkedIn Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Connection Requests</span>
                  <span className="font-medium">{metrics.channelBreakdown.linkedin.sent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Accepted</span>
                  <span className="font-medium">{metrics.channelBreakdown.linkedin.accepted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Messages Sent</span>
                  <span className="font-medium">{metrics.channelBreakdown.linkedin.messaged}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Replies</span>
                  <span className="font-medium text-green-600">
                    {metrics.channelBreakdown.linkedin.replied}
                  </span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Reply Rate</span>
                    <span className="font-bold text-green-600">
                      {((metrics.channelBreakdown.linkedin.replied / metrics.channelBreakdown.linkedin.messaged) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-purple-600" />
                  Email Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Emails Sent</span>
                  <span className="font-medium">{metrics.channelBreakdown.email.sent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Delivered</span>
                  <span className="font-medium">{metrics.channelBreakdown.email.delivered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Opened</span>
                  <span className="font-medium">{metrics.channelBreakdown.email.opened}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Clicked</span>
                  <span className="font-medium">{metrics.channelBreakdown.email.clicked}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Replies</span>
                  <span className="font-medium text-green-600">
                    {metrics.channelBreakdown.email.replied}
                  </span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Reply Rate</span>
                    <span className="font-bold text-green-600">
                      {((metrics.channelBreakdown.email.replied / metrics.channelBreakdown.email.sent) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Messages</CardTitle>
              <CardDescription>Messages with highest engagement rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topPerformers.map((message, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {message.channel === 'linkedin' ? (
                            <Linkedin className="h-3 w-3 mr-1" />
                          ) : (
                            <Mail className="h-3 w-3 mr-1" />
                          )}
                          {message.channel}
                        </Badge>
                        <Badge variant="default">
                          {message.replyRate}% Reply Rate
                        </Badge>
                      </div>
                      <Badge variant="outline">#{i + 1}</Badge>
                    </div>
                    <p className="font-medium mb-2">{message.message}</p>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>{message.opens} opens</span>
                      <span>{message.replies} replies</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prospects Tab */}
        <TabsContent value="prospects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prospect Engagement</CardTitle>
              <CardDescription>Most engaged prospects in your campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.prospectEngagement.map((prospect, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{prospect.name}</p>
                        <p className="text-sm text-gray-600">{prospect.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{prospect.lastActivity}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={prospect.engagementScore} className="w-20 h-2" />
                          <span className="text-xs font-medium">{prospect.engagementScore}%</span>
                        </div>
                      </div>
                      <Badge className={getEngagementColor(prospect.status)} variant="secondary">
                        {prospect.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};