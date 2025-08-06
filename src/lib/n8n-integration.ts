import { supabase } from "@/integrations/supabase/client";

export interface N8NWorkflow {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  nodes: any[];
  connections: any;
  settings?: any;
  tags?: string[];
}

export interface N8NExecution {
  id: string;
  workflowId: string;
  status: "success" | "error" | "running" | "waiting";
  startedAt: string;
  stoppedAt?: string;
  data?: any;
  error?: string;
}

export interface N8NWebhookData {
  workflowId: string;
  data: any;
  headers?: Record<string, string>;
}

export class N8NIntegrationService {
  private baseUrl: string;
  private apiKey: string;
  
  constructor() {
    // These would come from environment variables in production
    this.baseUrl = import.meta.env.VITE_N8N_BASE_URL || 'http://localhost:5678';
    this.apiKey = import.meta.env.VITE_N8N_API_KEY || '';
  }
  
  // Initialize n8n connection
  async initialize(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': this.apiKey,
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to connect to n8n:', error);
      return false;
    }
  }
  
  // List all workflows
  async listWorkflows(): Promise<N8NWorkflow[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': this.apiKey,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch workflows');
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching workflows:', error);
      return [];
    }
  }
  
  // Get specific workflow
  async getWorkflow(id: string): Promise<N8NWorkflow | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/workflows/${id}`, {
        headers: {
          'X-N8N-API-KEY': this.apiKey,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch workflow');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching workflow:', error);
      return null;
    }
  }
  
  // Create a new workflow
  async createWorkflow(workflow: Partial<N8NWorkflow>): Promise<N8NWorkflow | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/workflows`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflow),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create workflow');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating workflow:', error);
      return null;
    }
  }
  
  // Activate/deactivate workflow
  async toggleWorkflow(id: string, active: boolean): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/workflows/${id}`, {
        method: 'PATCH',
        headers: {
          'X-N8N-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error toggling workflow:', error);
      return false;
    }
  }
  
  // Execute workflow via webhook
  async executeWebhook(webhookUrl: string, data: any): Promise<any> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Webhook execution failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error executing webhook:', error);
      return null;
    }
  }
  
  // Get workflow executions
  async getExecutions(workflowId?: string): Promise<N8NExecution[]> {
    try {
      let url = `${this.baseUrl}/api/v1/executions`;
      if (workflowId) {
        url += `?workflowId=${workflowId}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'X-N8N-API-KEY': this.apiKey,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch executions');
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching executions:', error);
      return [];
    }
  }
  
  // Pre-built workflow templates for Sam AI
  getWorkflowTemplates() {
    return {
      // Email Campaign Automation
      emailCampaign: {
        name: "Email Campaign Automation",
        description: "Automated email campaign with follow-ups",
        nodes: [
          {
            id: "webhook",
            type: "n8n-nodes-base.webhook",
            position: [250, 300],
            parameters: {
              path: "/email-campaign",
              httpMethod: "POST",
            },
          },
          {
            id: "sendEmail",
            type: "n8n-nodes-base.emailSend",
            position: [450, 300],
            parameters: {
              subject: "={{$json.subject}}",
              text: "={{$json.body}}",
              toEmail: "={{$json.to}}",
            },
          },
          {
            id: "updateSupabase",
            type: "n8n-nodes-base.supabase",
            position: [650, 300],
            parameters: {
              operation: "update",
              table: "campaigns",
              id: "={{$json.campaignId}}",
              updateFields: {
                status: "sent",
              },
            },
          },
        ],
        connections: {
          webhook: {
            main: [[{ node: "sendEmail", type: "main", index: 0 }]],
          },
          sendEmail: {
            main: [[{ node: "updateSupabase", type: "main", index: 0 }]],
          },
        },
      },
      
      // LinkedIn Automation
      linkedinOutreach: {
        name: "LinkedIn Outreach Automation",
        description: "Automated LinkedIn connection and message workflow",
        nodes: [
          {
            id: "trigger",
            type: "n8n-nodes-base.cron",
            position: [250, 300],
            parameters: {
              cronExpression: "0 9 * * 1-5", // 9 AM weekdays
            },
          },
          {
            id: "getContacts",
            type: "n8n-nodes-base.supabase",
            position: [450, 300],
            parameters: {
              operation: "getAll",
              table: "contacts",
              filterRules: {
                conditions: [
                  {
                    field: "status",
                    value: "New Contact",
                  },
                ],
              },
            },
          },
          {
            id: "sendLinkedIn",
            type: "n8n-nodes-base.http",
            position: [650, 300],
            parameters: {
              method: "POST",
              url: "={{$env.LINKEDIN_API_URL}}/connections",
              body: {
                profileUrl: "={{$json.linkedin}}",
                message: "={{$json.connectionMessage}}",
              },
            },
          },
        ],
        connections: {
          trigger: {
            main: [[{ node: "getContacts", type: "main", index: 0 }]],
          },
          getContacts: {
            main: [[{ node: "sendLinkedIn", type: "main", index: 0 }]],
          },
        },
      },
      
      // Lead Scoring Automation
      leadScoring: {
        name: "Lead Scoring Automation",
        description: "Automatically score and prioritize leads",
        nodes: [
          {
            id: "webhook",
            type: "n8n-nodes-base.webhook",
            position: [250, 300],
            parameters: {
              path: "/score-lead",
              httpMethod: "POST",
            },
          },
          {
            id: "calculateScore",
            type: "n8n-nodes-base.function",
            position: [450, 300],
            parameters: {
              functionCode: `
                const lead = items[0].json;
                let score = 0;
                
                // Company size scoring
                if (lead.companySize > 1000) score += 30;
                else if (lead.companySize > 100) score += 20;
                else score += 10;
                
                // Engagement scoring
                if (lead.emailOpened) score += 10;
                if (lead.linkClicked) score += 20;
                if (lead.replied) score += 30;
                
                // Title scoring
                if (lead.title.includes('VP') || lead.title.includes('Director')) score += 20;
                if (lead.title.includes('C-level') || lead.title.includes('CEO')) score += 30;
                
                return [{
                  json: {
                    ...lead,
                    score: score,
                    priority: score > 70 ? 'High' : score > 40 ? 'Medium' : 'Low'
                  }
                }];
              `,
            },
          },
          {
            id: "updateLead",
            type: "n8n-nodes-base.supabase",
            position: [650, 300],
            parameters: {
              operation: "update",
              table: "contacts",
              id: "={{$json.id}}",
              updateFields: {
                score: "={{$json.score}}",
                priority: "={{$json.priority}}",
              },
            },
          },
        ],
        connections: {
          webhook: {
            main: [[{ node: "calculateScore", type: "main", index: 0 }]],
          },
          calculateScore: {
            main: [[{ node: "updateLead", type: "main", index: 0 }]],
          },
        },
      },
    };
  }
  
  // Create default workflows for Sam AI
  async setupDefaultWorkflows() {
    const templates = this.getWorkflowTemplates();
    const createdWorkflows = [];
    
    for (const [key, template] of Object.entries(templates)) {
      const workflow = await this.createWorkflow(template as any);
      if (workflow) {
        createdWorkflows.push(workflow);
        
        // Store workflow reference in Supabase
        await supabase
          .from('n8n_workflows')
          .insert({
            workflow_id: workflow.id,
            name: workflow.name,
            type: key,
            active: false,
          });
      }
    }
    
    return createdWorkflows;
  }
  
  // Monitor workflow execution status
  async monitorExecution(executionId: string): Promise<N8NExecution | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/executions/${executionId}`, {
        headers: {
          'X-N8N-API-KEY': this.apiKey,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch execution');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error monitoring execution:', error);
      return null;
    }
  }
}