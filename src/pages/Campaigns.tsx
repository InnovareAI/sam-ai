import { useState } from "react";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import { ConversationalInterface } from "@/components/workspace/ConversationalInterface";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useCampaigns, useCampaignStats } from "@/hooks/useCampaigns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Mail, 
  Linkedin, 
  Users, 
  Play,
  Pause,
  MoreHorizontal,
  Calendar,
  TrendingUp,
  Eye,
  Edit,
  Copy,
  Trash2,
  Plus,
  X,
  Save
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Campaigns() {
  const [isConversational, setIsConversational] = useState(false);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [newCampaignData, setNewCampaignData] = useState({
    name: '',
    description: '',
    type: 'Multi-channel',
    start_date: '',
    end_date: '',
    channels: ['email']
  });
  const { campaigns, isLoading, createCampaign, updateCampaign, deleteCampaign, pauseCampaign, resumeCampaign, duplicateCampaign } = useCampaigns();
  const { stats } = useCampaignStats();

  const handleCreateCampaign = () => {
    if (!newCampaignData.name.trim()) {
      alert('Campaign name is required');
      return;
    }
    
    createCampaign({
      name: newCampaignData.name,
      description: newCampaignData.description,
      type: newCampaignData.type,
      start_date: newCampaignData.start_date,
      end_date: newCampaignData.end_date,
      settings: {
        channels: newCampaignData.channels
      }
    });
    
    setShowCreateCampaign(false);
    setNewCampaignData({
      name: '',
      description: '',
      type: 'Multi-channel',
      start_date: '',
      end_date: '',
      channels: ['email']
    });
  };

  if (isConversational) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <WorkspaceSidebar isConversational={isConversational} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <WorkspaceHeader 
              isConversational={isConversational}
              onToggleMode={setIsConversational}
            />
            <div className="flex-1 overflow-auto">
              <ConversationalInterface />
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Fallback mock data for empty state or loading
  const mockCampaigns = [
    {
      id: 1,
      name: "Q1 Enterprise Outreach",
      description: "Targeting enterprise accounts for Q1 growth",
      status: "Active",
      type: "Multi-channel",
      contacts: 156,
      sent: 134,
      opened: 89,
      replied: 23,
      responseRate: 17.2,
      channels: ["email", "linkedin"],
      startDate: "2024-01-15",
      endDate: "2024-03-31",
      progress: 78
    },
    {
      id: 2,
      name: "LinkedIn Lead Generation",
      description: "Connect with decision makers on LinkedIn",
      status: "Active",
      type: "LinkedIn Only",
      contacts: 89,
      sent: 89,
      opened: 67,
      replied: 18,
      responseRate: 20.2,
      channels: ["linkedin"],
      startDate: "2024-02-01",
      endDate: "2024-04-15",
      progress: 65
    },
    {
      id: 3,
      name: "Product Demo Follow-up",
      description: "Follow up with demo attendees",
      status: "Paused",
      type: "Email Only",
      contacts: 67,
      sent: 45,
      opened: 32,
      replied: 12,
      responseRate: 26.7,
      channels: ["email"],
      startDate: "2024-01-20",
      endDate: "2024-02-28",
      progress: 45
    },
    {
      id: 4,
      name: "Holiday Campaign 2024",
      description: "End of year outreach campaign",
      status: "Completed",
      type: "Multi-channel",
      contacts: 234,
      sent: 234,
      opened: 187,
      replied: 34,
      responseRate: 14.5,
      channels: ["email", "linkedin"],
      startDate: "2023-12-01",
      endDate: "2023-12-31",
      progress: 100
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "default";
      case "Paused": return "secondary";
      case "Completed": return "outline";
      case "Draft": return "destructive";
      default: return "outline";
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email": return <Mail className="h-3 w-3" />;
      case "linkedin": return <Linkedin className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <WorkspaceSidebar isConversational={isConversational} />
        <div className="flex-1 flex flex-col">
          <WorkspaceHeader isConversational={isConversational} onToggleMode={setIsConversational} />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600 mt-1">Manage your outreach campaigns across channels</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => setShowCreateCampaign(true)}
        >
          <Target className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Create Campaign Dialog */}
      <Dialog open={showCreateCampaign} onOpenChange={setShowCreateCampaign}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Set up a new outreach campaign to connect with your prospects.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name *</Label>
              <Input
                id="campaign-name"
                value={newCampaignData.name}
                onChange={(e) => setNewCampaignData({...newCampaignData, name: e.target.value})}
                placeholder="Enter campaign name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-description">Description</Label>
              <Textarea
                id="campaign-description"
                value={newCampaignData.description}
                onChange={(e) => setNewCampaignData({...newCampaignData, description: e.target.value})}
                placeholder="Describe your campaign goals and target audience"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-type">Campaign Type</Label>
                <Select value={newCampaignData.type} onValueChange={(value) => setNewCampaignData({...newCampaignData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Multi-channel">Multi-channel</SelectItem>
                    <SelectItem value="Email Only">Email Only</SelectItem>
                    <SelectItem value="LinkedIn Only">LinkedIn Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Channels</Label>
                <div className="flex gap-2">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={newCampaignData.channels.includes('email')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewCampaignData({
                            ...newCampaignData, 
                            channels: [...newCampaignData.channels, 'email']
                          });
                        } else {
                          setNewCampaignData({
                            ...newCampaignData, 
                            channels: newCampaignData.channels.filter(c => c !== 'email')
                          });
                        }
                      }}
                    />
                    <span className="text-sm">Email</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={newCampaignData.channels.includes('linkedin')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewCampaignData({
                            ...newCampaignData, 
                            channels: [...newCampaignData.channels, 'linkedin']
                          });
                        } else {
                          setNewCampaignData({
                            ...newCampaignData, 
                            channels: newCampaignData.channels.filter(c => c !== 'linkedin')
                          });
                        }
                      }}
                    />
                    <span className="text-sm">LinkedIn</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={newCampaignData.start_date}
                  onChange={(e) => setNewCampaignData({...newCampaignData, start_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={newCampaignData.end_date}
                  onChange={(e) => setNewCampaignData({...newCampaignData, end_date: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => {
                setShowCreateCampaign(false);
                setNewCampaignData({
                  name: '',
                  description: '',
                  type: 'Multi-channel',
                  start_date: '',
                  end_date: '',
                  channels: ['email']
                });
              }}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleCreateCampaign}>
                <Save className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Campaigns</CardTitle>
            <Target className="h-4 w-4 text-premium-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <p className="text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              {stats.total > 0 ? 'Active workspace' : 'Get started'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Campaigns</CardTitle>
            <Play className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.paused} paused, {stats.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-premium-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.averageResponseRate.toFixed(1)}%</div>
            <p className="text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Across all campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-premium-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalContacts}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats.totalSent} messages sent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search campaigns..."
              className="w-80 px-4 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
            <option>All Status</option>
            <option>Active</option>
            <option>Paused</option>
            <option>Completed</option>
            <option>Draft</option>
          </select>
        </div>
        <Button variant="outline" size="sm">
          More Filters
        </Button>
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-gray-500 bg-white">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading campaigns...
            </div>
          </div>
        ) : campaigns.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first outreach campaign.</p>
              <Button onClick={() => createCampaign({ name: "My First Campaign" })}>
                <Target className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </CardContent>
          </Card>
        ) : (
          campaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{campaign.name}</h3>
                    <Badge variant={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                    <Badge variant="outline">{campaign.type || 'Multi-channel'}</Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{campaign.description}</p>
                  
                  {/* Channels */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-gray-600">Channels:</span>
                    {campaign.channels.map((channel, index) => (
                      <div key={index} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md">
                        {getChannelIcon(channel)}
                        <span className="text-xs capitalize">{channel}</span>
                      </div>
                    ))}
                  </div>

                  {/* Date Range */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'No start date'} - {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'No end date'}
                    </span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      // Navigate to campaign detail page
                      window.location.href = `/campaigns/${campaign.id}`;
                    }}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Campaign
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => duplicateCampaign(campaign)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {campaign.status === "active" ? (
                      <DropdownMenuItem onClick={() => pauseCampaign(campaign.id)}>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause Campaign
                      </DropdownMenuItem>
                    ) : campaign.status === "paused" ? (
                      <DropdownMenuItem onClick={() => resumeCampaign(campaign.id)}>
                        <Play className="h-4 w-4 mr-2" />
                        Resume Campaign
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600" 
                      onClick={() => deleteCampaign(campaign.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Campaign Progress</span>
                  <span className="text-sm font-medium">{campaign.progress}%</span>
                </div>
                <Progress value={campaign.progress} className="h-2" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{campaign.contactCount}</div>
                  <div className="text-xs text-gray-600">Contacts</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{campaign.sent}</div>
                  <div className="text-xs text-gray-600">Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{campaign.opened}</div>
                  <div className="text-xs text-gray-600">Opened</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-premium-cyan">{campaign.replied}</div>
                  <div className="text-xs text-gray-600">Replied</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-premium-purple">{campaign.responseRate.toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">Response Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>
      </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}