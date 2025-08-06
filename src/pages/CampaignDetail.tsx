import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Edit, Play, Pause, Copy, Trash2, Users, Mail, Linkedin, TrendingUp, Calendar, Target } from "lucide-react";

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isConversational, setIsConversational] = useState(false);

  // Mock campaign data - will be replaced with actual data from useCampaigns hook
  const campaign = {
    id: id,
    name: "Q1 Enterprise Outreach",
    description: "Targeting enterprise accounts for Q1 growth with personalized LinkedIn and email sequences",
    status: "Active",
    type: "Multi-channel",
    contacts: 156,
    sent: 134,
    opened: 89,
    replied: 23,
    connected: 12,
    responseRate: 17.2,
    channels: ["email", "linkedin"],
    startDate: "2024-01-15",
    endDate: "2024-03-31",
    progress: 78,
    created: "2024-01-10",
    lastActivity: "2 hours ago"
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "default";
      case "Paused": return "secondary";
      case "Completed": return "outline";
      case "Draft": return "destructive";
      default: return "outline";
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
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" onClick={() => navigate('/campaigns')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Campaigns
                </Button>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
                    <Badge variant={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                    <Badge variant="outline">{campaign.type}</Badge>
                  </div>
                  <p className="text-gray-600">{campaign.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                  {campaign.status === "Active" ? (
                    <Button variant="outline">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button>
                      <Play className="h-4 w-4 mr-2" />
                      Start Campaign
                    </Button>
                  )}
                </div>
              </div>

              {/* Campaign Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Contacts</CardTitle>
                    <Users className="h-4 w-4 text-premium-purple" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{campaign.contacts}</div>
                    <p className="text-xs text-gray-600 mt-1">Added to campaign</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Messages Sent</CardTitle>
                    <Mail className="h-4 w-4 text-premium-cyan" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{campaign.sent}</div>
                    <p className="text-xs text-gray-600 mt-1">Across all channels</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Replies</CardTitle>
                    <TrendingUp className="h-4 w-4 text-premium-orange" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-premium-cyan">{campaign.replied}</div>
                    <p className="text-xs text-gray-600 mt-1">{campaign.responseRate}% response rate</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Connections</CardTitle>
                    <Linkedin className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{campaign.connected}</div>
                    <p className="text-xs text-gray-600 mt-1">LinkedIn connections</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Progress</CardTitle>
                    <Target className="h-4 w-4 text-premium-purple" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{campaign.progress}%</div>
                    <Progress value={campaign.progress} className="h-2 mt-2" />
                  </CardContent>
                </Card>
              </div>

              {/* Campaign Details and Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Campaign Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Information</CardTitle>
                    <CardDescription>Details and settings for this campaign</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Campaign Type</label>
                        <p className="text-sm text-gray-900">{campaign.type}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Status</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Start Date</label>
                        <p className="text-sm text-gray-900">{new Date(campaign.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">End Date</label>
                        <p className="text-sm text-gray-900">{new Date(campaign.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Channels</label>
                      <div className="flex gap-2 mt-2">
                        {campaign.channels.map((channel, index) => (
                          <Badge key={index} variant="outline" className="capitalize">
                            {channel === 'linkedin' ? <Linkedin className="h-3 w-3 mr-1" /> : <Mail className="h-3 w-3 mr-1" />}
                            {channel}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Description</label>
                      <p className="text-sm text-gray-900 mt-1">{campaign.description}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Analytics</CardTitle>
                    <CardDescription>Campaign metrics and engagement data</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Open Rate</span>
                        <span className="text-sm font-medium">{Math.round((campaign.opened / campaign.sent) * 100)}%</span>
                      </div>
                      <Progress value={(campaign.opened / campaign.sent) * 100} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Response Rate</span>
                        <span className="text-sm font-medium">{campaign.responseRate}%</span>
                      </div>
                      <Progress value={campaign.responseRate} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Connection Rate</span>
                        <span className="text-sm font-medium">{Math.round((campaign.connected / campaign.contacts) * 100)}%</span>
                      </div>
                      <Progress value={(campaign.connected / campaign.contacts) * 100} className="h-2" />
                    </div>

                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Created</span>
                          <p className="font-medium">{new Date(campaign.created).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Activity</span>
                          <p className="font-medium">{campaign.lastActivity}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end gap-4">
                <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Campaign
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}