import React, { useState } from 'react';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ReportBuilder } from '@/components/reports/ReportBuilder';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  Users,
  Mail,
  DollarSign,
  Target,
  Calendar,
  Download,
  Share2,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  FileText,
  PieChart,
  LineChart,
  Sparkles,
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

export default function Reports() {
  const [isConversational, setIsConversational] = useState(false);

  // Sample data for executive dashboard
  const monthlyRevenue = [
    { month: 'Jan', revenue: 45000, target: 50000 },
    { month: 'Feb', revenue: 52000, target: 50000 },
    { month: 'Mar', revenue: 48000, target: 55000 },
    { month: 'Apr', revenue: 61000, target: 55000 },
    { month: 'May', revenue: 55000, target: 60000 },
    { month: 'Jun', revenue: 67000, target: 60000 },
  ];

  const teamPerformance = [
    { name: 'Sarah J.', deals: 45, revenue: 320000, winRate: 68 },
    { name: 'Mike D.', deals: 38, revenue: 280000, winRate: 71 },
    { name: 'Lisa K.', deals: 42, revenue: 310000, winRate: 65 },
    { name: 'Tom R.', deals: 35, revenue: 250000, winRate: 74 },
    { name: 'Amy S.', deals: 40, revenue: 290000, winRate: 69 },
  ];

  const pipelineStages = [
    { stage: 'Prospecting', count: 120, value: 450000 },
    { stage: 'Qualification', count: 85, value: 380000 },
    { stage: 'Proposal', count: 45, value: 320000 },
    { stage: 'Negotiation', count: 28, value: 280000 },
    { stage: 'Closed Won', count: 15, value: 180000 },
  ];

  const activityMetrics = [
    { activity: 'Emails', value: 85 },
    { activity: 'Calls', value: 72 },
    { activity: 'Meetings', value: 90 },
    { activity: 'LinkedIn', value: 65 },
    { activity: 'Follow-ups', value: 78 },
    { activity: 'Proposals', value: 88 },
  ];

  const conversionRates = [
    { name: 'Lead → Opportunity', value: 28, color: '#3b82f6' },
    { name: 'Opportunity → Proposal', value: 45, color: '#8b5cf6' },
    { name: 'Proposal → Close', value: 32, color: '#10b981' },
  ];

  const prebuiltReports = [
    {
      id: '1',
      name: 'Sales Performance Dashboard',
      description: 'Complete overview of sales metrics and KPIs',
      category: 'Sales',
      lastUpdated: '2 hours ago',
      shared: 12,
      icon: TrendingUp,
    },
    {
      id: '2',
      name: 'Marketing Campaign Analysis',
      description: 'Campaign performance and ROI tracking',
      category: 'Marketing',
      lastUpdated: '1 day ago',
      shared: 8,
      icon: Mail,
    },
    {
      id: '3',
      name: 'Customer Success Metrics',
      description: 'Customer satisfaction and retention analysis',
      category: 'Success',
      lastUpdated: '3 days ago',
      shared: 5,
      icon: Users,
    },
    {
      id: '4',
      name: 'Revenue Forecasting',
      description: 'Predictive analytics and revenue projections',
      category: 'Finance',
      lastUpdated: '1 week ago',
      shared: 15,
      icon: DollarSign,
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <WorkspaceSidebar isConversational={isConversational} />
        <div className="flex-1 flex flex-col">
          <WorkspaceHeader isConversational={isConversational} onToggleMode={setIsConversational} />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
                <p className="text-gray-600">
                  Comprehensive insights and custom reporting for data-driven decisions
                </p>
              </div>

              <Tabs defaultValue="executive" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="executive">Executive Dashboard</TabsTrigger>
                  <TabsTrigger value="reports">Reports Library</TabsTrigger>
                  <TabsTrigger value="builder">Report Builder</TabsTrigger>
                  <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
                </TabsList>

                {/* Executive Dashboard */}
                <TabsContent value="executive" className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">$328,000</div>
                        <p className="text-xs text-muted-foreground">
                          <span className="text-green-500">+20.1%</span> from last month
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Deals Closed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">45</div>
                        <p className="text-xs text-muted-foreground">
                          <span className="text-green-500">+12%</span> from last month
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">68.5%</div>
                        <p className="text-xs text-muted-foreground">
                          <span className="text-green-500">+5.3%</span> improvement
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">$1.2M</div>
                        <p className="text-xs text-muted-foreground">
                          <span className="text-green-500">+18%</span> growth
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts Row 1 */}
                  <div className="grid grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Revenue vs Target</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={monthlyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                            <Area type="monotone" dataKey="target" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Sales Pipeline</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={pipelineStages}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="stage" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts Row 2 */}
                  <div className="grid grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Activity Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <RadarChart data={activityMetrics}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="activity" />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} />
                            <Radar name="Score" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Conversion Rates</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <RechartsPieChart>
                            <Pie
                              data={conversionRates}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${value}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {conversionRates.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Top Performers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {teamPerformance.slice(0, 4).map((rep, index) => (
                            <div key={rep.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                  index === 1 ? 'bg-gray-100 text-gray-700' :
                                  index === 2 ? 'bg-orange-100 text-orange-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {index + 1}
                                </div>
                                <span className="text-sm font-medium">{rep.name}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold">${(rep.revenue / 1000).toFixed(0)}K</div>
                                <div className="text-xs text-muted-foreground">{rep.winRate}% win</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Reports Library */}
                <TabsContent value="reports" className="space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">Reports Library</h2>
                      <p className="text-muted-foreground">Pre-built reports and templates</p>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Report
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {prebuiltReports.map(report => (
                      <Card key={report.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <report.icon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{report.name}</CardTitle>
                                <CardDescription>{report.description}</CardDescription>
                              </div>
                            </div>
                            <Badge variant="outline">{report.category}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Updated {report.lastUpdated}</span>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {report.shared} shared
                              </div>
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Report Builder */}
                <TabsContent value="builder" className="space-y-6">
                  <ReportBuilder />
                </TabsContent>

                {/* Scheduled Reports */}
                <TabsContent value="scheduled" className="space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">Scheduled Reports</h2>
                      <p className="text-muted-foreground">Automated report delivery</p>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Report
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Weekly Sales Summary</CardTitle>
                            <CardDescription>Every Monday at 9:00 AM</CardDescription>
                          </div>
                          <Badge variant="default">Active</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>team@company.com</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Next: Mon, Dec 18</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>PDF Format</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Monthly Performance Review</CardTitle>
                            <CardDescription>First day of each month at 8:00 AM</CardDescription>
                          </div>
                          <Badge variant="default">Active</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>executives@company.com</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Next: Jan 1, 2024</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>Excel Format</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Daily Activity Digest</CardTitle>
                            <CardDescription>Every weekday at 6:00 PM</CardDescription>
                          </div>
                          <Badge variant="secondary">Paused</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>sales-team@company.com</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            <span>Paused since Dec 10</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>Email Summary</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}