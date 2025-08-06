import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Play, 
  Pause, 
  Settings, 
  Activity, 
  Zap, 
  Mail, 
  Linkedin, 
  Target,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { N8NIntegrationService, N8NWorkflow, N8NExecution } from "@/lib/n8n-integration";
import { toast } from "@/components/ui/use-toast";

export function AutomationWorkflows() {
  const [workflows, setWorkflows] = useState<N8NWorkflow[]>([]);
  const [executions, setExecutions] = useState<N8NExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [n8nService] = useState(() => new N8NIntegrationService());
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  
  useEffect(() => {
    loadWorkflows();
    loadExecutions();
  }, []);
  
  const loadWorkflows = async () => {
    setIsLoading(true);
    try {
      const isConnected = await n8nService.initialize();
      
      if (!isConnected) {
        toast({
          title: "N8N Connection Failed",
          description: "Unable to connect to n8n automation service. Please check your configuration.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const workflowList = await n8nService.listWorkflows();
      setWorkflows(workflowList);
      
      // If no workflows exist, offer to create defaults
      if (workflowList.length === 0) {
        toast({
          title: "No Workflows Found",
          description: "Would you like to create default automation workflows?",
          action: (
            <Button size="sm" onClick={createDefaultWorkflows}>
              Create Defaults
            </Button>
          ),
        });
      }
    } catch (error) {
      console.error("Error loading workflows:", error);
      toast({
        title: "Error",
        description: "Failed to load automation workflows",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadExecutions = async () => {
    try {
      const executionList = await n8nService.getExecutions();
      setExecutions(executionList.slice(0, 10)); // Show last 10 executions
    } catch (error) {
      console.error("Error loading executions:", error);
    }
  };
  
  const createDefaultWorkflows = async () => {
    try {
      const created = await n8nService.setupDefaultWorkflows();
      setWorkflows(created);
      toast({
        title: "Success",
        description: `Created ${created.length} default workflows`,
      });
    } catch (error) {
      console.error("Error creating workflows:", error);
      toast({
        title: "Error",
        description: "Failed to create default workflows",
        variant: "destructive",
      });
    }
  };
  
  const toggleWorkflow = async (workflow: N8NWorkflow) => {
    try {
      const success = await n8nService.toggleWorkflow(workflow.id, !workflow.active);
      
      if (success) {
        // Update local state
        setWorkflows(prev => 
          prev.map(w => 
            w.id === workflow.id ? { ...w, active: !w.active } : w
          )
        );
        
        toast({
          title: workflow.active ? "Workflow Paused" : "Workflow Activated",
          description: `${workflow.name} is now ${workflow.active ? 'paused' : 'active'}`,
        });
      }
    } catch (error) {
      console.error("Error toggling workflow:", error);
      toast({
        title: "Error",
        description: "Failed to toggle workflow status",
        variant: "destructive",
      });
    }
  };
  
  const getWorkflowIcon = (name: string) => {
    if (name.toLowerCase().includes('email')) return <Mail className="h-5 w-5" />;
    if (name.toLowerCase().includes('linkedin')) return <Linkedin className="h-5 w-5" />;
    if (name.toLowerCase().includes('lead')) return <Target className="h-5 w-5" />;
    return <Zap className="h-5 w-5" />;
  };
  
  const getExecutionStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Automation Workflows</h2>
          <p className="text-muted-foreground">
            Manage your n8n automation workflows and monitor executions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadWorkflows}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </div>
      
      {/* Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getWorkflowIcon(workflow.name)}
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                </div>
                <Switch
                  checked={workflow.active}
                  onCheckedChange={() => toggleWorkflow(workflow)}
                />
              </div>
              <CardDescription>{workflow.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant={workflow.active ? "default" : "secondary"}>
                  {workflow.active ? "Active" : "Inactive"}
                </Badge>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedWorkflow(workflow.id)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled={!workflow.active}
                  >
                    {workflow.active ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Workflow Stats */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Nodes</span>
                  <span className="font-medium">{workflow.nodes?.length || 0}</span>
                </div>
                {workflow.tags && workflow.tags.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {workflow.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Add Workflow Card */}
        {workflows.length === 0 && (
          <Card className="border-dashed hover:shadow-lg transition-shadow cursor-pointer" onClick={createDefaultWorkflows}>
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
              <Plus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold">Create Default Workflows</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Set up pre-configured automation workflows for campaigns, lead scoring, and more
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Recent Executions */}
      {executions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Executions</CardTitle>
            <CardDescription>Monitor your workflow execution history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {executions.map((execution) => (
                <div 
                  key={execution.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getExecutionStatusIcon(execution.status)}
                    <div>
                      <p className="font-medium text-sm">
                        Workflow #{execution.workflowId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(execution.startedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      execution.status === 'success' ? 'default' :
                      execution.status === 'error' ? 'destructive' :
                      'secondary'
                    }
                  >
                    {execution.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}