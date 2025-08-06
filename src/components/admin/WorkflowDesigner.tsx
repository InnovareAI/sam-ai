import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Plus,
  Save,
  Send,
  Upload,
  Download,
  Play,
  Pause,
  Settings,
  Trash2,
  Copy,
  GitBranch,
  Zap,
  Mail,
  Clock,
  Users,
  Building,
  Sparkles,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AutomationTemplate, WorkflowDeploymentService, ActionConfig, TriggerConfig } from '@/lib/automation-templates';

interface WorkspaceInfo {
  id: string;
  name: string;
  plan: string;
  userCount: number;
}

export const WorkflowDesigner: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([
    { id: 'ws-1', name: 'Acme Corp', plan: 'enterprise', userCount: 45 },
    { id: 'ws-2', name: 'TechStart Inc', plan: 'growth', userCount: 12 },
    { id: 'ws-3', name: 'Sales Masters', plan: 'enterprise', userCount: 78 },
  ]);

  const [currentWorkflow, setCurrentWorkflow] = useState<AutomationTemplate>({
    id: 'new-workflow',
    name: 'New Custom Workflow',
    description: 'Custom workflow for specific client needs',
    category: 'custom',
    icon: '⚡',
    isPremium: true,
    isCustom: true,
    config: {
      trigger: {
        type: 'manual',
        settings: {},
      },
      actions: [],
    },
  });

  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [showDeployDialog, setShowDeployDialog] = useState(false);

  const addAction = (type: ActionConfig['type']) => {
    const newAction: ActionConfig = {
      id: `action-${Date.now()}`,
      type,
      settings: {},
    };

    setCurrentWorkflow(prev => ({
      ...prev,
      config: {
        ...prev.config,
        actions: [...prev.config.actions, newAction],
      },
    }));
  };

  const removeAction = (actionId: string) => {
    setCurrentWorkflow(prev => ({
      ...prev,
      config: {
        ...prev.config,
        actions: prev.config.actions.filter(a => a.id !== actionId),
      },
    }));
  };

  const handleDeploy = async () => {
    if (!selectedWorkspace) {
      toast({
        title: 'Select a workspace',
        description: 'Please select a workspace to deploy the workflow to.',
        variant: 'destructive',
      });
      return;
    }

    setIsDeploying(true);
    
    // Simulate deployment
    const result = await WorkflowDeploymentService.deployToWorkspace(
      currentWorkflow,
      selectedWorkspace,
      'admin-current'
    );

    setTimeout(() => {
      setIsDeploying(false);
      setShowDeployDialog(false);
      
      toast({
        title: result.success ? 'Workflow Deployed' : 'Deployment Failed',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
    }, 2000);
  };

  const handleImportN8N = () => {
    // In production, this would open a file picker or accept JSON input
    toast({
      title: 'Import from n8n',
      description: 'n8n workflow import dialog would open here',
    });
  };

  const handleExport = () => {
    const json = JSON.stringify(currentWorkflow, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentWorkflow.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Workflow Designer</h2>
          <p className="text-muted-foreground">
            Build custom workflows and deploy to client workspaces
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImportN8N}>
            <Upload className="h-4 w-4 mr-2" />
            Import n8n
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
            <DialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Deploy to Workspace
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deploy Workflow to Workspace</DialogTitle>
                <DialogDescription>
                  Select a workspace to deploy this custom workflow
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Select Workspace</Label>
                  <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a workspace" />
                    </SelectTrigger>
                    <SelectContent>
                      {workspaces.map(ws => (
                        <SelectItem key={ws.id} value={ws.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{ws.name}</span>
                            <div className="flex gap-2 ml-4">
                              <Badge variant="outline">{ws.plan}</Badge>
                              <Badge variant="secondary">
                                <Users className="h-3 w-3 mr-1" />
                                {ws.userCount}
                              </Badge>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium">Workflow Summary</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Name: {currentWorkflow.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Actions: {currentWorkflow.config.actions.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Trigger: {currentWorkflow.config.trigger.type}
                  </div>
                </div>
                <Button 
                  onClick={handleDeploy} 
                  className="w-full"
                  disabled={isDeploying || !selectedWorkspace}
                >
                  {isDeploying ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Deploy Workflow
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Workflow Canvas */}
        <div className="col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>
                <Input
                  value={currentWorkflow.name}
                  onChange={(e) => setCurrentWorkflow(prev => ({ ...prev, name: e.target.value }))}
                  className="text-lg font-semibold"
                />
              </CardTitle>
              <Textarea
                value={currentWorkflow.description}
                onChange={(e) => setCurrentWorkflow(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Workflow description..."
                rows={2}
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Trigger */}
                <div className="p-4 border-2 border-dashed rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      <span className="font-medium">Trigger</span>
                    </div>
                    <Settings className="h-4 w-4 text-muted-foreground cursor-pointer" />
                  </div>
                  <Select
                    value={currentWorkflow.config.trigger.type}
                    onValueChange={(value: TriggerConfig['type']) => 
                      setCurrentWorkflow(prev => ({
                        ...prev,
                        config: {
                          ...prev.config,
                          trigger: { type: value, settings: {} },
                        },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual Trigger</SelectItem>
                      <SelectItem value="schedule">Schedule</SelectItem>
                      <SelectItem value="event">Event Based</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                      <SelectItem value="form_submission">Form Submission</SelectItem>
                      <SelectItem value="email_received">Email Received</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions */}
                {currentWorkflow.config.actions.map((action, index) => (
                  <div key={action.id} className="relative">
                    {index > 0 && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="h-4 w-0.5 bg-border" />
                      </div>
                    )}
                    <div className="p-4 border rounded-lg bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {action.type === 'send_email' && <Mail className="h-5 w-5 text-blue-500" />}
                          {action.type === 'wait' && <Clock className="h-5 w-5 text-orange-500" />}
                          {action.type === 'branch' && <GitBranch className="h-5 w-5 text-purple-500" />}
                          {action.type === 'generate_ai_content' && <Sparkles className="h-5 w-5 text-pink-500" />}
                          <span className="font-medium capitalize">
                            {action.type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeAction(action.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Action-specific settings */}
                      {action.type === 'send_email' && (
                        <div className="space-y-2">
                          <Input placeholder="Email template ID" />
                        </div>
                      )}
                      {action.type === 'wait' && (
                        <div className="flex gap-2">
                          <Input type="number" placeholder="Duration" className="w-24" />
                          <Select>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="minutes">Minutes</SelectItem>
                              <SelectItem value="hours">Hours</SelectItem>
                              <SelectItem value="days">Days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add Action Button */}
                <div className="pt-4">
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addAction('send_email')}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addAction('wait')}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Wait
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addAction('branch')}
                    >
                      <GitBranch className="h-4 w-4 mr-1" />
                      Branch
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addAction('generate_ai_content')}
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      AI
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="col-span-4 space-y-4">
          {/* Workflow Info */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={currentWorkflow.category}
                  onValueChange={(value: AutomationTemplate['category']) =>
                    setCurrentWorkflow(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="customer_success">Customer Success</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Icon</Label>
                <Input
                  value={currentWorkflow.icon}
                  onChange={(e) => setCurrentWorkflow(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="Enter emoji or icon"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Premium Workflow</Label>
                <Badge variant={currentWorkflow.isPremium ? 'default' : 'secondary'}>
                  {currentWorkflow.isPremium ? 'Premium' : 'Free'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Deployments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Deployments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-2 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Lead Scoring v2</div>
                    <Badge variant="outline" className="text-xs">2h ago</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Deployed to Acme Corp
                  </div>
                </div>
                <div className="p-2 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Custom Pipeline</div>
                    <Badge variant="outline" className="text-xs">1d ago</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Deployed to TechStart Inc
                  </div>
                </div>
                <div className="p-2 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Email Nurture</div>
                    <Badge variant="outline" className="text-xs">3d ago</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Deployed to Sales Masters
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Run */}
          <Card>
            <CardHeader>
              <CardTitle>Test Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Run Test
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Test the workflow with sample data before deployment
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};