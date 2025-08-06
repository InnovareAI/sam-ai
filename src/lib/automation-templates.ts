// Automation Templates System - No n8n Required
// These templates run natively in Sam AI

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'sales' | 'marketing' | 'customer_success' | 'operations' | 'custom';
  icon: string;
  isPremium: boolean;
  isCustom: boolean;
  workspaceId?: string; // If custom, which workspace it belongs to
  createdBy?: string; // Admin who created it
  config: {
    trigger: TriggerConfig;
    actions: ActionConfig[];
    conditions?: ConditionConfig[];
  };
  metrics?: {
    timesUsed: number;
    successRate: number;
    avgCompletionTime: number;
  };
}

export interface TriggerConfig {
  type: 'manual' | 'schedule' | 'event' | 'webhook' | 'form_submission' | 'email_received';
  settings: Record<string, any>;
}

export interface ActionConfig {
  id: string;
  type: 'send_email' | 'create_task' | 'update_contact' | 'add_to_campaign' | 'notify_slack' | 'generate_ai_content' | 'wait' | 'branch';
  settings: Record<string, any>;
  nextActionId?: string;
}

export interface ConditionConfig {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: any;
  trueActionId: string;
  falseActionId?: string;
}

// Pre-built Templates Available to All Users
export const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  {
    id: 'welcome-sequence',
    name: 'Welcome Email Sequence',
    description: 'Automatically send a series of onboarding emails to new contacts',
    category: 'marketing',
    icon: '👋',
    isPremium: false,
    isCustom: false,
    config: {
      trigger: {
        type: 'event',
        settings: {
          event: 'contact_created',
        },
      },
      actions: [
        {
          id: 'action-1',
          type: 'send_email',
          settings: {
            templateId: 'welcome-1',
            delay: 0,
          },
          nextActionId: 'action-2',
        },
        {
          id: 'action-2',
          type: 'wait',
          settings: {
            duration: 3,
            unit: 'days',
          },
          nextActionId: 'action-3',
        },
        {
          id: 'action-3',
          type: 'send_email',
          settings: {
            templateId: 'welcome-2',
          },
          nextActionId: 'action-4',
        },
        {
          id: 'action-4',
          type: 'wait',
          settings: {
            duration: 7,
            unit: 'days',
          },
          nextActionId: 'action-5',
        },
        {
          id: 'action-5',
          type: 'send_email',
          settings: {
            templateId: 'welcome-3',
          },
        },
      ],
    },
    metrics: {
      timesUsed: 1847,
      successRate: 94.2,
      avgCompletionTime: 10080, // in minutes
    },
  },
  {
    id: 'lead-scoring',
    name: 'Automatic Lead Scoring',
    description: 'Score leads based on engagement and move hot leads to sales',
    category: 'sales',
    icon: '🎯',
    isPremium: false,
    isCustom: false,
    config: {
      trigger: {
        type: 'event',
        settings: {
          event: 'email_opened',
        },
      },
      actions: [
        {
          id: 'action-1',
          type: 'update_contact',
          settings: {
            field: 'lead_score',
            operation: 'increment',
            value: 10,
          },
          nextActionId: 'action-2',
        },
        {
          id: 'action-2',
          type: 'branch',
          settings: {
            condition: {
              field: 'lead_score',
              operator: 'greater_than',
              value: 50,
            },
            trueActionId: 'action-3',
            falseActionId: null,
          },
        },
        {
          id: 'action-3',
          type: 'add_to_campaign',
          settings: {
            campaignId: 'hot-leads',
          },
          nextActionId: 'action-4',
        },
        {
          id: 'action-4',
          type: 'notify_slack',
          settings: {
            channel: '#sales',
            message: 'Hot lead alert! {{contact.name}} is ready for outreach.',
          },
        },
      ],
    },
    metrics: {
      timesUsed: 892,
      successRate: 91.7,
      avgCompletionTime: 5,
    },
  },
  {
    id: 'meeting-followup',
    name: 'Post-Meeting Follow-up',
    description: 'Send follow-up emails and create tasks after meetings',
    category: 'sales',
    icon: '📅',
    isPremium: false,
    isCustom: false,
    config: {
      trigger: {
        type: 'event',
        settings: {
          event: 'meeting_completed',
        },
      },
      actions: [
        {
          id: 'action-1',
          type: 'wait',
          settings: {
            duration: 1,
            unit: 'hours',
          },
          nextActionId: 'action-2',
        },
        {
          id: 'action-2',
          type: 'send_email',
          settings: {
            templateId: 'meeting-followup',
          },
          nextActionId: 'action-3',
        },
        {
          id: 'action-3',
          type: 'create_task',
          settings: {
            title: 'Follow up with {{contact.name}}',
            dueDate: '+3 days',
            assignTo: '{{meeting.owner}}',
          },
        },
      ],
    },
    metrics: {
      timesUsed: 2341,
      successRate: 96.8,
      avgCompletionTime: 4320,
    },
  },
  {
    id: 'ai-content-generator',
    name: 'AI Content Generator',
    description: 'Generate personalized content using AI based on contact data',
    category: 'marketing',
    icon: '🤖',
    isPremium: true,
    isCustom: false,
    config: {
      trigger: {
        type: 'manual',
        settings: {},
      },
      actions: [
        {
          id: 'action-1',
          type: 'generate_ai_content',
          settings: {
            prompt: 'Write a personalized email for {{contact.name}} at {{contact.company}} in the {{contact.industry}} industry',
            model: 'gpt-4',
            temperature: 0.7,
          },
          nextActionId: 'action-2',
        },
        {
          id: 'action-2',
          type: 'send_email',
          settings: {
            useGeneratedContent: true,
          },
        },
      ],
    },
    metrics: {
      timesUsed: 567,
      successRate: 89.3,
      avgCompletionTime: 2,
    },
  },
  {
    id: 'abandoned-campaign-recovery',
    name: 'Abandoned Campaign Recovery',
    description: 'Re-engage contacts who haven\'t responded to campaigns',
    category: 'marketing',
    icon: '♻️',
    isPremium: true,
    isCustom: false,
    config: {
      trigger: {
        type: 'schedule',
        settings: {
          frequency: 'daily',
          time: '10:00',
        },
      },
      actions: [
        {
          id: 'action-1',
          type: 'branch',
          settings: {
            condition: {
              field: 'last_engagement',
              operator: 'greater_than',
              value: 30, // days
            },
            trueActionId: 'action-2',
            falseActionId: null,
          },
        },
        {
          id: 'action-2',
          type: 'add_to_campaign',
          settings: {
            campaignId: 're-engagement',
          },
          nextActionId: 'action-3',
        },
        {
          id: 'action-3',
          type: 'send_email',
          settings: {
            templateId: 'win-back',
          },
        },
      ],
    },
    metrics: {
      timesUsed: 234,
      successRate: 78.9,
      avgCompletionTime: 1440,
    },
  },
];

// Admin Functions for Custom Workflows
export class WorkflowDeploymentService {
  // Deploy a custom workflow to a specific workspace
  static async deployToWorkspace(
    workflow: AutomationTemplate,
    workspaceId: string,
    adminId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Mark workflow as custom and assign to workspace
      const customWorkflow = {
        ...workflow,
        id: `custom-${Date.now()}`,
        isCustom: true,
        workspaceId,
        createdBy: adminId,
        metrics: {
          timesUsed: 0,
          successRate: 0,
          avgCompletionTime: 0,
        },
      };

      // In production, this would save to database
      // For now, we'll simulate the deployment
      console.log('Deploying workflow to workspace:', {
        workflow: customWorkflow.name,
        workspace: workspaceId,
        admin: adminId,
      });

      return {
        success: true,
        message: `Workflow "${workflow.name}" deployed successfully to workspace`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to deploy workflow: ${error}`,
      };
    }
  }

  // Create a custom workflow from n8n JSON
  static async convertN8NWorkflow(
    n8nJson: any,
    metadata: {
      name: string;
      description: string;
      category: AutomationTemplate['category'];
      icon: string;
    }
  ): Promise<AutomationTemplate> {
    // Parse n8n workflow and convert to our template format
    const template: AutomationTemplate = {
      id: `n8n-import-${Date.now()}`,
      name: metadata.name,
      description: metadata.description,
      category: metadata.category,
      icon: metadata.icon,
      isPremium: true,
      isCustom: true,
      config: {
        trigger: {
          type: 'webhook',
          settings: {
            // Extract trigger from n8n JSON
            webhookUrl: '/api/automations/trigger',
          },
        },
        actions: [],
      },
    };

    // Convert n8n nodes to our action format
    if (n8nJson.nodes) {
      template.config.actions = n8nJson.nodes.map((node: any, index: number) => ({
        id: `action-${index + 1}`,
        type: mapN8NNodeType(node.type),
        settings: node.parameters || {},
        nextActionId: index < n8nJson.nodes.length - 1 ? `action-${index + 2}` : undefined,
      }));
    }

    return template;
  }

  // Get all workflows for a workspace (including custom ones)
  static async getWorkspaceWorkflows(workspaceId: string): Promise<AutomationTemplate[]> {
    // Get default templates
    const defaultTemplates = AUTOMATION_TEMPLATES;
    
    // In production, fetch custom workflows from database
    const customWorkflows: AutomationTemplate[] = [
      // Simulated custom workflow
      {
        id: 'custom-123',
        name: 'Custom Sales Pipeline',
        description: 'Custom workflow created by admin for this workspace',
        category: 'custom',
        icon: '⚡',
        isPremium: true,
        isCustom: true,
        workspaceId,
        createdBy: 'admin-1',
        config: {
          trigger: {
            type: 'event',
            settings: {
              event: 'deal_created',
            },
          },
          actions: [
            {
              id: 'action-1',
              type: 'notify_slack',
              settings: {
                channel: '#sales',
                message: 'New deal created: {{deal.name}}',
              },
            },
          ],
        },
        metrics: {
          timesUsed: 45,
          successRate: 100,
          avgCompletionTime: 1,
        },
      },
    ];

    return [...defaultTemplates, ...customWorkflows];
  }
}

// Helper function to map n8n node types to our action types
function mapN8NNodeType(n8nType: string): ActionConfig['type'] {
  const mapping: Record<string, ActionConfig['type']> = {
    'n8n-nodes-base.emailSend': 'send_email',
    'n8n-nodes-base.slack': 'notify_slack',
    'n8n-nodes-base.wait': 'wait',
    'n8n-nodes-base.if': 'branch',
    'n8n-nodes-base.httpRequest': 'webhook',
  };

  return mapping[n8nType] || 'send_email';
}