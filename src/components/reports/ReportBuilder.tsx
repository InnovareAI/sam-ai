import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  LineChart,
  PieChart,
  Download,
  FileText,
  Calendar,
  Filter,
  Plus,
  Save,
  Share2,
  TrendingUp,
  Users,
  Mail,
  DollarSign,
  Target,
  Activity,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { toast } from '@/hooks/use-toast';
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
} from 'recharts';

interface ReportWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'funnel';
  title: string;
  dataSource: string;
  visualization: 'line' | 'bar' | 'pie' | 'area' | 'number' | 'table' | 'funnel';
  metrics: string[];
  dimensions: string[];
  filters: any[];
  size: 'small' | 'medium' | 'large' | 'full';
}

export const ReportBuilder: React.FC = () => {
  const [reportName, setReportName] = useState('Q4 Sales Performance Report');
  const [widgets, setWidgets] = useState<ReportWidget[]>([
    {
      id: '1',
      type: 'metric',
      title: 'Total Revenue',
      dataSource: 'campaigns',
      visualization: 'number',
      metrics: ['revenue'],
      dimensions: [],
      filters: [],
      size: 'small',
    },
    {
      id: '2',
      type: 'chart',
      title: 'Revenue Trend',
      dataSource: 'campaigns',
      visualization: 'area',
      metrics: ['revenue'],
      dimensions: ['date'],
      filters: [],
      size: 'large',
    },
  ]);

  const [selectedWidget, setSelectedWidget] = useState<ReportWidget | null>(null);
  const [isAddingWidget, setIsAddingWidget] = useState(false);

  // Sample data for visualizations
  const revenueData = [
    { month: 'Jan', revenue: 45000, deals: 12, winRate: 67 },
    { month: 'Feb', revenue: 52000, deals: 15, winRate: 73 },
    { month: 'Mar', revenue: 48000, deals: 14, winRate: 64 },
    { month: 'Apr', revenue: 61000, deals: 18, winRate: 72 },
    { month: 'May', revenue: 55000, deals: 16, winRate: 69 },
    { month: 'Jun', revenue: 67000, deals: 20, winRate: 75 },
    { month: 'Jul', revenue: 72000, deals: 22, winRate: 77 },
    { month: 'Aug', revenue: 69000, deals: 21, winRate: 71 },
    { month: 'Sep', revenue: 75000, deals: 24, winRate: 79 },
    { month: 'Oct', revenue: 82000, deals: 26, winRate: 81 },
    { month: 'Nov', revenue: 79000, deals: 25, winRate: 76 },
    { month: 'Dec', revenue: 91000, deals: 28, winRate: 82 },
  ];

  const channelData = [
    { name: 'Email', value: 35, color: '#8b5cf6' },
    { name: 'LinkedIn', value: 28, color: '#3b82f6' },
    { name: 'Cold Call', value: 20, color: '#10b981' },
    { name: 'Referral', value: 12, color: '#f59e0b' },
    { name: 'Website', value: 5, color: '#ef4444' },
  ];

  const funnelData = [
    { stage: 'Leads', value: 1000, conversion: 100 },
    { stage: 'Qualified', value: 450, conversion: 45 },
    { stage: 'Proposal', value: 200, conversion: 44 },
    { stage: 'Negotiation', value: 120, conversion: 60 },
    { stage: 'Closed Won', value: 45, conversion: 37.5 },
  ];

  const addWidget = (type: ReportWidget['type']) => {
    const newWidget: ReportWidget = {
      id: Date.now().toString(),
      type,
      title: 'New Widget',
      dataSource: 'campaigns',
      visualization: type === 'chart' ? 'line' : type === 'metric' ? 'number' : 'table',
      metrics: [],
      dimensions: [],
      filters: [],
      size: 'medium',
    };
    setWidgets([...widgets, newWidget]);
    setSelectedWidget(newWidget);
    setIsAddingWidget(false);
  };

  const updateWidget = (widgetId: string, updates: Partial<ReportWidget>) => {
    setWidgets(widgets.map(w => w.id === widgetId ? { ...w, ...updates } : w));
  };

  const removeWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
    setSelectedWidget(null);
  };

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    toast({
      title: 'Exporting Report',
      description: `Your report is being exported as ${format.toUpperCase()}...`,
    });
  };

  const shareReport = () => {
    toast({
      title: 'Share Report',
      description: 'Report sharing link has been copied to clipboard!',
    });
  };

  const renderWidget = (widget: ReportWidget) => {
    switch (widget.visualization) {
      case 'number':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-4xl font-bold">$746K</div>
            <div className="text-sm text-muted-foreground mt-2">+23% from last period</div>
          </div>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="deals" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={channelData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {channelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        );
      
      case 'funnel':
        return (
          <div className="space-y-2">
            {funnelData.map((stage, index) => (
              <div key={stage.stage} className="relative">
                <div
                  className="h-12 bg-gradient-to-r from-primary to-primary/60 rounded flex items-center justify-between px-4 text-white"
                  style={{ width: `${100 - index * 15}%` }}
                >
                  <span className="font-medium">{stage.stage}</span>
                  <span>{stage.value}</span>
                </div>
                {index < funnelData.length - 1 && (
                  <div className="absolute -bottom-1 right-0 text-xs text-muted-foreground">
                    {stage.conversion}% →
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      
      default:
        return <div>Widget visualization not implemented</div>;
    }
  };

  const getWidgetSize = (size: ReportWidget['size']) => {
    switch (size) {
      case 'small': return 'col-span-3 h-48';
      case 'medium': return 'col-span-6 h-64';
      case 'large': return 'col-span-9 h-80';
      case 'full': return 'col-span-12 h-96';
      default: return 'col-span-6 h-64';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Input
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            className="text-2xl font-bold border-none px-0 focus:ring-0"
          />
          <p className="text-muted-foreground">
            Customize your report with widgets and filters
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={shareReport}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Select onValueChange={(value) => exportReport(value as any)}>
            <SelectTrigger className="w-32">
              <Download className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">Export as PDF</SelectItem>
              <SelectItem value="excel">Export as Excel</SelectItem>
              <SelectItem value="csv">Export as CSV</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Report
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select defaultValue="last30">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last7">Last 7 days</SelectItem>
                  <SelectItem value="last30">Last 30 days</SelectItem>
                  <SelectItem value="last90">Last 90 days</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  <SelectItem value="q4-push">Q4 Sales Push</SelectItem>
                  <SelectItem value="black-friday">Black Friday</SelectItem>
                  <SelectItem value="enterprise">Enterprise Outreach</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" size="sm" className="ml-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Canvas */}
      <div className="grid grid-cols-12 gap-4">
        {widgets.map(widget => (
          <Card
            key={widget.id}
            className={`${getWidgetSize(widget.size)} cursor-pointer hover:shadow-lg transition-shadow`}
            onClick={() => setSelectedWidget(widget)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">{widget.title}</CardTitle>
                <Badge variant="outline">{widget.type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              {renderWidget(widget)}
            </CardContent>
          </Card>
        ))}

        {/* Add Widget Button */}
        <Card
          className="col-span-3 h-48 border-dashed cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setIsAddingWidget(true)}
        >
          <CardContent className="h-full flex flex-col items-center justify-center">
            <Plus className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Add Widget</span>
          </CardContent>
        </Card>
      </div>

      {/* Widget Configuration Panel */}
      {selectedWidget && (
        <Card>
          <CardHeader>
            <CardTitle>Configure Widget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Widget Title</Label>
                <Input
                  value={selectedWidget.title}
                  onChange={(e) => updateWidget(selectedWidget.id, { title: e.target.value })}
                />
              </div>
              <div>
                <Label>Data Source</Label>
                <Select
                  value={selectedWidget.dataSource}
                  onValueChange={(value) => updateWidget(selectedWidget.id, { dataSource: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="campaigns">Campaigns</SelectItem>
                    <SelectItem value="contacts">Contacts</SelectItem>
                    <SelectItem value="deals">Deals</SelectItem>
                    <SelectItem value="activities">Activities</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Visualization</Label>
                <Select
                  value={selectedWidget.visualization}
                  onValueChange={(value: any) => updateWidget(selectedWidget.id, { visualization: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="funnel">Funnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Size</Label>
                <Select
                  value={selectedWidget.size}
                  onValueChange={(value: any) => updateWidget(selectedWidget.id, { size: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="full">Full Width</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => removeWidget(selectedWidget.id)}
              >
                Remove Widget
              </Button>
              <Button onClick={() => setSelectedWidget(null)}>
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Widget Dialog */}
      {isAddingWidget && (
        <Card className="fixed inset-0 m-auto w-96 h-fit z-50">
          <CardHeader>
            <CardTitle>Add Widget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-24 flex-col"
                onClick={() => addWidget('metric')}
              >
                <TrendingUp className="h-8 w-8 mb-2" />
                Metric
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col"
                onClick={() => addWidget('chart')}
              >
                <BarChart3 className="h-8 w-8 mb-2" />
                Chart
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col"
                onClick={() => addWidget('table')}
              >
                <FileText className="h-8 w-8 mb-2" />
                Table
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col"
                onClick={() => addWidget('funnel')}
              >
                <Target className="h-8 w-8 mb-2" />
                Funnel
              </Button>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4"
              onClick={() => setIsAddingWidget(false)}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};