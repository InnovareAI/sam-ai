import { useState } from "react";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AutomationWorkflows } from "@/components/automation/AutomationWorkflows";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Settings, 
  Activity, 
  TrendingUp,
  Users,
  Mail,
  Linkedin,
  Clock,
  CheckCircle,
  AlertCircle,
  PlayCircle
} from "lucide-react";

export default function Automation() {
  const [isConversational, setIsConversational] = useState(false);
  
  // Mock automation stats
  const stats = {
    totalWorkflows: 8,
    activeWorkflows: 5,
    executionsToday: 127,
    successRate: 94.5,
    savedHours: 32,
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
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Automation Hub</h1>
                <p className="text-gray-600">
                  Streamline your sales processes with intelligent automation powered by n8n
                </p>
              </div>
              
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalWorkflows}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.activeWorkflows} active
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Executions Today</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.executionsToday}</div>
                    <p className="text-xs text-muted-foreground">
                      +23% from yesterday
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.successRate}%</div>
                    <p className="text-xs text-muted-foreground">
                      Last 24 hours
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.savedHours}h</div>
                    <p className="text-xs text-muted-foreground">
                      This week
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                    <PlayCircle className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeWorkflows}</div>
                    <p className="text-xs text-muted-foreground">
                      Running workflows
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Main Content Tabs */}
              <Tabs defaultValue="workflows" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="workflows">Workflows</TabsTrigger>
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                  <TabsTrigger value="triggers">Triggers</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="workflows" className="space-y-4">
                  <AutomationWorkflows />
                </TabsContent>
                
                <TabsContent value="templates" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Email Campaign Template */}
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Mail className="h-5 w-5 text-blue-500" />
                          <CardTitle className="text-lg">Email Campaign</CardTitle>
                        </div>
                        <CardDescription>
                          Automated email sequences with follow-ups
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Personalized templates</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>A/B testing support</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Analytics tracking</span>
                          </div>
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                    
                    {/* LinkedIn Outreach Template */}
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Linkedin className="h-5 w-5 text-blue-600" />
                          <CardTitle className="text-lg">LinkedIn Outreach</CardTitle>
                        </div>
                        <CardDescription>
                          Connect and engage on LinkedIn automatically
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Connection requests</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Message sequences</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Profile visits tracking</span>
                          </div>
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                    
                    {/* Lead Scoring Template */}
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          <CardTitle className="text-lg">Lead Scoring</CardTitle>
                        </div>
                        <CardDescription>
                          Automatically score and prioritize leads
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Behavior tracking</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Engagement scoring</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Auto-prioritization</span>
                          </div>
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="triggers" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Workflow Triggers</CardTitle>
                      <CardDescription>
                        Configure when and how your automations should run
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Time-based Triggers</p>
                              <p className="text-sm text-muted-foreground">
                                Run workflows on schedule (daily, weekly, monthly)
                              </p>
                            </div>
                          </div>
                          <Badge>5 active</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Contact Triggers</p>
                              <p className="text-sm text-muted-foreground">
                                Trigger when contacts meet certain criteria
                              </p>
                            </div>
                          </div>
                          <Badge>3 active</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Activity className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Event Triggers</p>
                              <p className="text-sm text-muted-foreground">
                                React to specific events in your campaigns
                              </p>
                            </div>
                          </div>
                          <Badge>7 active</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Automation Settings</CardTitle>
                      <CardDescription>
                        Configure your n8n integration and workflow preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-medium mb-2">N8N Connection</h3>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm">Connected to n8n instance</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            API endpoint: http://localhost:5678
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-2">Default Settings</h3>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2">
                              <input type="checkbox" defaultChecked className="rounded" />
                              <span className="text-sm">Auto-retry failed executions</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="checkbox" defaultChecked className="rounded" />
                              <span className="text-sm">Send notifications on errors</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="checkbox" className="rounded" />
                              <span className="text-sm">Enable debug mode</span>
                            </label>
                          </div>
                        </div>
                        
                        <Button>Save Settings</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}