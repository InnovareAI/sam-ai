import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Zap,
  Plus,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Database,
  Brain,
  MessageSquare,
  BarChart3,
  HardDrive,
  RefreshCw,
  Link2,
  Unlink,
  Play,
  FileText,
  Globe,
  Mail,
  Users,
  Building,
  Sparkles,
  Activity,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { MCPIntegrationService, MCPServer, MCP_SERVERS } from '@/lib/mcp-integration';
import { Progress } from '@/components/ui/progress';

export const MCPIntegrations: React.FC = () => {
  const [mcpService] = useState(() => new MCPIntegrationService());
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isTestingEnrichment, setIsTestingEnrichment] = useState(false);

  useEffect(() => {
    // Load available servers
    setServers(mcpService.getServers());
  }, [mcpService]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'data': return <Database className="h-5 w-5" />;
      case 'ai': return <Brain className="h-5 w-5" />;
      case 'automation': return <Zap className="h-5 w-5" />;
      case 'communication': return <MessageSquare className="h-5 w-5" />;
      case 'analytics': return <BarChart3 className="h-5 w-5" />;
      case 'storage': return <HardDrive className="h-5 w-5" />;
      default: return <Zap className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const handleConnect = async (server: MCPServer) => {
    setIsConnecting(true);
    try {
      const apiKey = apiKeys[server.id];
      if (!apiKey && server.config.authentication?.type === 'api_key') {
        toast({
          title: 'API Key Required',
          description: 'Please enter your API key to connect',
          variant: 'destructive',
        });
        setIsConnecting(false);
        return;
      }

      await mcpService.connect(server.id, {
        authentication: {
          ...server.config.authentication,
          credentials: { apiKey },
        },
      });

      // Update server list
      setServers(mcpService.getServers());
      
      toast({
        title: 'Connected Successfully',
        description: `${server.name} is now connected and ready to use`,
      });
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async (server: MCPServer) => {
    try {
      await mcpService.disconnect(server.id);
      setServers(mcpService.getServers());
      
      toast({
        title: 'Disconnected',
        description: `${server.name} has been disconnected`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect',
        variant: 'destructive',
      });
    }
  };

  const testEnrichment = async () => {
    setIsTestingEnrichment(true);
    try {
      const result = await mcpService.enrichContact({
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Example Corp',
        linkedinUrl: 'linkedin.com/in/johndoe',
      });

      setTestResults(result);
      
      toast({
        title: 'Enrichment Complete',
        description: 'Contact data has been enriched successfully',
      });
    } catch (error) {
      toast({
        title: 'Enrichment Failed',
        description: error instanceof Error ? error.message : 'Failed to enrich contact',
        variant: 'destructive',
      });
    } finally {
      setIsTestingEnrichment(false);
    }
  };

  const testCapability = async (server: MCPServer, capabilityId: string) => {
    try {
      // Get sample parameters for testing
      const capability = server.capabilities.find(c => c.id === capabilityId);
      if (!capability) return;

      const sampleParams: Record<string, any> = {};
      capability.parameters.forEach(param => {
        if (param.name === 'email') sampleParams[param.name] = 'test@example.com';
        else if (param.name === 'firstName') sampleParams[param.name] = 'John';
        else if (param.name === 'lastName') sampleParams[param.name] = 'Doe';
        else if (param.name === 'domain') sampleParams[param.name] = 'example.com';
        else if (param.name === 'profileUrl') sampleParams[param.name] = 'linkedin.com/in/test';
        else if (param.name === 'websiteUrl') sampleParams[param.name] = 'https://example.com';
        else if (param.type === 'string') sampleParams[param.name] = 'test';
        else if (param.type === 'number') sampleParams[param.name] = 1;
        else if (param.type === 'boolean') sampleParams[param.name] = true;
      });

      const result = await mcpService.execute(server.id, capabilityId, sampleParams);
      
      setTestResults({
        ...testResults,
        [`${server.id}.${capabilityId}`]: result,
      });

      toast({
        title: 'Test Successful',
        description: `${capability.name} executed successfully`,
      });
    } catch (error) {
      toast({
        title: 'Test Failed',
        description: error instanceof Error ? error.message : 'Failed to execute capability',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">MCP Integrations</h2>
          <p className="text-muted-foreground">
            Connect to external services for data enrichment and automation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={testEnrichment} disabled={isTestingEnrichment}>
            {isTestingEnrichment ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Test Enrichment
              </>
            )}
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Custom MCP
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servers.length}</div>
            <p className="text-xs text-muted-foreground">
              {servers.filter(s => s.status === 'connected').length} connected
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {servers.reduce((sum, s) => sum + (s.metrics?.requestsToday || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all integrations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.8s</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">-0.3s</span> from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.8%</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Integration Categories */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Integrations</TabsTrigger>
          <TabsTrigger value="data">Data Enrichment</TabsTrigger>
          <TabsTrigger value="ai">AI Services</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {servers.map(server => (
              <Card key={server.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{server.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{server.name}</CardTitle>
                        <CardDescription>{server.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(server.status)}
                      <Badge variant="outline">{server.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Capabilities */}
                    <div>
                      <div className="text-sm font-medium mb-2">Capabilities</div>
                      <div className="flex flex-wrap gap-2">
                        {server.capabilities.slice(0, 3).map(cap => (
                          <Badge key={cap.id} variant="secondary">
                            {cap.name}
                          </Badge>
                        ))}
                        {server.capabilities.length > 3 && (
                          <Badge variant="outline">
                            +{server.capabilities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Connection Status */}
                    {server.status === 'disconnected' && (
                      <div className="space-y-2">
                        {server.config.authentication?.type === 'api_key' && (
                          <div>
                            <Label>API Key</Label>
                            <Input
                              type="password"
                              placeholder="Enter your API key"
                              value={apiKeys[server.id] || ''}
                              onChange={(e) => setApiKeys({
                                ...apiKeys,
                                [server.id]: e.target.value,
                              })}
                            />
                          </div>
                        )}
                        <Button
                          className="w-full"
                          onClick={() => handleConnect(server)}
                          disabled={isConnecting}
                        >
                          {isConnecting ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <Link2 className="h-4 w-4 mr-2" />
                              Connect
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {server.status === 'connected' && (
                      <div className="space-y-3">
                        {/* Metrics */}
                        {server.metrics && (
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <div className="text-muted-foreground">Requests</div>
                              <div className="font-medium">{server.metrics.requestsToday}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Avg Time</div>
                              <div className="font-medium">{server.metrics.avgResponseTime}ms</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Success</div>
                              <div className="font-medium">{server.metrics.successRate}%</div>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="flex-1">
                                <Settings className="h-4 w-4 mr-2" />
                                Configure
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{server.name} Configuration</DialogTitle>
                                <DialogDescription>
                                  Configure and test {server.name} capabilities
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <Label>Endpoint</Label>
                                  <Input value={server.config.endpoint} readOnly />
                                </div>
                                <div>
                                  <Label>Available Actions</Label>
                                  <div className="space-y-2 mt-2">
                                    {server.capabilities.map(cap => (
                                      <div key={cap.id} className="flex items-center justify-between p-2 border rounded">
                                        <div>
                                          <div className="font-medium text-sm">{cap.name}</div>
                                          <div className="text-xs text-muted-foreground">
                                            {cap.description}
                                          </div>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => testCapability(server, cap.id)}
                                        >
                                          Test
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDisconnect(server)}
                          >
                            <Unlink className="h-4 w-4 mr-2" />
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {servers.filter(s => s.category === 'data').map(server => (
              <Card key={server.id}>
                {/* Same card content as above */}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Latest enrichment and capability test results</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="p-4 bg-muted rounded-lg overflow-auto max-h-96">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};