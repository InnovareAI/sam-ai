import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, Trash2, GitBranch, Clock, Play, 
  Mail, Linkedin, MessageSquare, Users,
  ArrowRight, Settings, Zap, Target,
  CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';

interface SequenceNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'wait' | 'end';
  channel?: 'email' | 'linkedin' | 'sms';
  action?: string;
  content?: string;
  condition?: string;
  waitTime?: number;
  waitUnit?: 'hours' | 'days';
  position: { x: number; y: number };
  connections: string[];
}

export const CampaignSequenceBuilder: React.FC = () => {
  const [nodes, setNodes] = useState<SequenceNode[]>([
    {
      id: 'trigger-1',
      type: 'trigger',
      action: 'Campaign Start',
      position: { x: 50, y: 50 },
      connections: ['action-1']
    },
    {
      id: 'action-1',
      type: 'action',
      channel: 'linkedin',
      action: 'Send Connection Request',
      content: 'Hi {{firstName}}, I noticed...',
      position: { x: 50, y: 150 },
      connections: ['wait-1']
    },
    {
      id: 'wait-1',
      type: 'wait',
      waitTime: 2,
      waitUnit: 'days',
      position: { x: 50, y: 250 },
      connections: ['condition-1']
    },
    {
      id: 'condition-1',
      type: 'condition',
      condition: 'Connection Accepted?',
      position: { x: 50, y: 350 },
      connections: ['action-2', 'action-3']
    },
    {
      id: 'action-2',
      type: 'action',
      channel: 'linkedin',
      action: 'Send Welcome Message',
      content: 'Thanks for connecting!',
      position: { x: -100, y: 450 },
      connections: ['end-1']
    },
    {
      id: 'action-3',
      type: 'action',
      channel: 'email',
      action: 'Send Email',
      content: 'Following up on my LinkedIn request...',
      position: { x: 200, y: 450 },
      connections: ['end-1']
    },
    {
      id: 'end-1',
      type: 'end',
      action: 'Campaign Complete',
      position: { x: 50, y: 550 },
      connections: []
    }
  ]);

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'trigger': return 'bg-green-100 border-green-300';
      case 'action': return 'bg-blue-100 border-blue-300';
      case 'condition': return 'bg-yellow-100 border-yellow-300';
      case 'wait': return 'bg-gray-100 border-gray-300';
      case 'end': return 'bg-red-100 border-red-300';
      default: return 'bg-white border-gray-300';
    }
  };

  const getNodeIcon = (node: SequenceNode) => {
    if (node.type === 'trigger') return <Play className="h-4 w-4" />;
    if (node.type === 'condition') return <GitBranch className="h-4 w-4" />;
    if (node.type === 'wait') return <Clock className="h-4 w-4" />;
    if (node.type === 'end') return <CheckCircle className="h-4 w-4" />;
    
    if (node.channel === 'linkedin') return <Linkedin className="h-4 w-4" />;
    if (node.channel === 'email') return <Mail className="h-4 w-4" />;
    if (node.channel === 'sms') return <MessageSquare className="h-4 w-4" />;
    
    return <Zap className="h-4 w-4" />;
  };

  const addNode = (type: SequenceNode['type']) => {
    const newNode: SequenceNode = {
      id: `${type}-${Date.now()}`,
      type,
      action: type === 'trigger' ? 'New Trigger' : 
              type === 'condition' ? 'New Condition' :
              type === 'wait' ? 'Wait' :
              type === 'end' ? 'End' : 'New Action',
      position: { x: 300, y: 200 },
      connections: [],
      ...(type === 'action' && { channel: 'email', content: 'Write your message...' }),
      ...(type === 'wait' && { waitTime: 1, waitUnit: 'days' })
    };
    setNodes([...nodes, newNode]);
  };

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    // Remove connections to this node
    setNodes(nodes.map(n => ({
      ...n,
      connections: n.connections.filter(c => c !== nodeId)
    })));
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sequence Builder</CardTitle>
          <CardDescription>
            Drag and drop to build your campaign flow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode('action')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Action
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode('condition')}
            >
              <GitBranch className="h-4 w-4 mr-1" />
              Condition
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addNode('wait')}
            >
              <Clock className="h-4 w-4 mr-1" />
              Wait
            </Button>
            <div className="ml-auto flex gap-2">
              <Button
                variant={isRunning ? "destructive" : "default"}
                size="sm"
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? (
                  <>
                    <XCircle className="h-4 w-4 mr-1" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Test Run
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <div className="relative bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg" style={{ height: '600px' }}>
        {/* Render connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {nodes.map(node => 
            node.connections.map(targetId => {
              const targetNode = nodes.find(n => n.id === targetId);
              if (!targetNode) return null;
              
              return (
                <line
                  key={`${node.id}-${targetId}`}
                  x1={node.position.x + 100}
                  y1={node.position.y + 40}
                  x2={targetNode.position.x + 100}
                  y2={targetNode.position.y}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              );
            })
          )}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3, 0 6"
                fill="#94a3b8"
              />
            </marker>
          </defs>
        </svg>

        {/* Render nodes */}
        {nodes.map(node => (
          <div
            key={node.id}
            className={`absolute p-3 rounded-lg border-2 cursor-move transition-all ${
              getNodeColor(node.type)
            } ${selectedNode === node.id ? 'ring-2 ring-primary shadow-lg' : 'shadow'}`}
            style={{
              left: `${node.position.x}px`,
              top: `${node.position.y}px`,
              width: '200px'
            }}
            onClick={() => setSelectedNode(node.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getNodeIcon(node)}
                <span className="font-medium text-sm">{node.action}</span>
              </div>
              {node.type !== 'trigger' && node.type !== 'end' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNode(node.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {node.type === 'wait' && (
              <div className="text-xs text-gray-600">
                Wait {node.waitTime} {node.waitUnit}
              </div>
            )}
            
            {node.type === 'condition' && (
              <div className="text-xs text-gray-600">
                {node.condition}
              </div>
            )}
            
            {node.type === 'action' && (
              <div className="text-xs text-gray-600 truncate">
                {node.content}
              </div>
            )}

            {node.connections.length > 0 && (
              <div className="mt-2 flex justify-end">
                <ArrowRight className="h-3 w-3 text-gray-400" />
              </div>
            )}
          </div>
        ))}

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Start building your sequence</p>
              <p className="text-sm text-gray-500">Add nodes from the toolbar above</p>
            </div>
          </div>
        )}
      </div>

      {/* Properties Panel */}
      {selectedNode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Node Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Node ID</label>
                <p className="text-sm text-gray-600">{selectedNode}</p>
              </div>
              {nodes.find(n => n.id === selectedNode)?.type === 'action' && (
                <>
                  <div>
                    <label className="text-sm font-medium">Channel</label>
                    <select className="w-full mt-1 px-3 py-2 border rounded-md">
                      <option>LinkedIn</option>
                      <option>Email</option>
                      <option>SMS</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <textarea 
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      rows={3}
                      placeholder="Enter your message..."
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Visual Sequence Builder:</strong> Click and drag nodes to reposition them. 
          Connect nodes by clicking the output of one and the input of another. 
          This visual builder helps you design complex multi-step campaigns with branching logic.
        </AlertDescription>
      </Alert>
    </div>
  );
};