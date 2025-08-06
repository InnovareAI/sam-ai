// Shared Workflow Orchestrator - ONE workflow serves ALL tenants
// Multi-tenant execution with proper isolation

export interface SharedWorkflowConfig {
  workflowId: string;
  type: 'cr_sequence' | 'messenger_sequence' | 'group_sequence';
  webhookPath: string;
  version: string;
}

// These are the ONLY workflows in n8n - shared by all tenants
export const SHARED_WORKFLOWS: SharedWorkflowConfig[] = [
  {
    workflowId: 'shared-cr-workflow-v1',
    type: 'cr_sequence',
    webhookPath: '/webhook/shared/cr',
    version: '1.0.0',
  },
  {
    workflowId: 'shared-messenger-workflow-v1',
    type: 'messenger_sequence',
    webhookPath: '/webhook/shared/messenger',
    version: '1.0.0',
  },
  {
    workflowId: 'shared-group-workflow-v1',
    type: 'group_sequence',
    webhookPath: '/webhook/shared/group',
    version: '1.0.0',
  },
];

export class SharedWorkflowOrchestrator {
  private n8nUrl: string;
  private n8nApiKey: string;

  constructor(n8nUrl: string, n8nApiKey: string) {
    this.n8nUrl = n8nUrl;
    this.n8nApiKey = n8nApiKey;
  }

  /**
   * Deploy the THREE shared workflows (one-time setup)
   */
  async deploySharedWorkflows(): Promise<void> {
    // 1. Connection Request Workflow
    await this.deployWorkflow(this.buildSharedCRWorkflow());
    
    // 2. Messenger Workflow
    await this.deployWorkflow(this.buildSharedMessengerWorkflow());
    
    // 3. Group Campaign Workflow
    await this.deployWorkflow(this.buildSharedGroupWorkflow());
  }

  /**
   * Build the SINGLE shared Connection Request workflow
   */
  private buildSharedCRWorkflow(): any {
    const nodes: any[] = [];
    const connections: any = {};

    // 1. Webhook receives ALL tenant requests
    nodes.push({
      id: '1',
      name: 'Webhook',
      type: 'n8n-nodes-base.webhook',
      position: [250, 300],
      parameters: {
        path: '/webhook/shared/cr',
        responseMode: 'onReceived',
        responseData: 'allEntries',
      },
    });

    // 2. Extract tenant context from payload
    nodes.push({
      id: '2',
      name: 'Extract Tenant Context',
      type: 'n8n-nodes-base.set',
      position: [450, 300],
      parameters: {
        values: {
          string: [
            { name: 'tenantId', value: '={{$json["tenantId"]}}' },
            { name: 'campaignId', value: '={{$json["campaignId"]}}' },
            { name: 'contactId', value: '={{$json["contactId"]}}' },
            { name: 'unipileAccountId', value: '={{$json["unipileAccountId"]}}' },
            { name: 'step', value: '={{$json["step"]}}' },
          ],
        },
      },
    });

    // 3. Get tenant's configuration from database
    nodes.push({
      id: '3',
      name: 'Get Tenant Config',
      type: 'n8n-nodes-base.httpRequest',
      position: [650, 300],
      parameters: {
        method: 'GET',
        url: '={{$env["SAM_AI_API"]}}/api/tenants/{{$json["tenantId"]}}/config',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'samAiApi',
      },
    });

    // 4. Route based on step
    nodes.push({
      id: '4',
      name: 'Step Router',
      type: 'n8n-nodes-base.switch',
      position: [850, 300],
      parameters: {
        dataPropertyName: 'step',
        rules: [
          { value: 'connection_request' },
          { value: 'wait_for_accept' },
          { value: 'send_welcome' },
          { value: 'follow_up_1' },
          { value: 'follow_up_2' },
          { value: 'follow_up_3' },
        ],
      },
    });

    // 5. Connection Request branch
    nodes.push({
      id: '5',
      name: 'Send Connection Request',
      type: 'n8n-nodes-base.httpRequest',
      position: [1050, 200],
      parameters: {
        method: 'POST',
        url: 'https://api.unipile.com/v1/linkedin/invitations',
        sendHeaders: true,
        headerParameters: {
          parameters: [
            {
              name: 'X-Account-ID',
              value: '={{$node["Extract Tenant Context"].json["unipileAccountId"]}}',
            },
          ],
        },
        sendBody: true,
        bodyParameters: {
          parameters: [
            { name: 'profile_url', value: '={{$json["contact"]["linkedinUrl"]}}' },
            { name: 'message', value: '={{$json["message"]}}' },
          ],
        },
      },
    });

    // 6. Schedule next step
    nodes.push({
      id: '6',
      name: 'Schedule Next Step',
      type: 'n8n-nodes-base.httpRequest',
      position: [1250, 300],
      parameters: {
        method: 'POST',
        url: '={{$env["SAM_AI_API"]}}/api/scheduler/add',
        sendBody: true,
        bodyParameters: {
          parameters: [
            { name: 'tenantId', value: '={{$json["tenantId"]}}' },
            { name: 'campaignId', value: '={{$json["campaignId"]}}' },
            { name: 'contactId', value: '={{$json["contactId"]}}' },
            { name: 'nextStep', value: '={{$json["nextStep"]}}' },
            { name: 'executeAt', value: '={{$json["executeAt"]}}' },
            { name: 'workflowType', value: 'cr_sequence' },
          ],
        },
      },
    });

    // 7. Update campaign stats (for this tenant only)
    nodes.push({
      id: '7',
      name: 'Update Stats',
      type: 'n8n-nodes-base.httpRequest',
      position: [1450, 300],
      parameters: {
        method: 'POST',
        url: '={{$env["SAM_AI_API"]}}/api/tenants/{{$json["tenantId"]}}/campaigns/{{$json["campaignId"]}}/stats',
        sendBody: true,
        bodyParameters: {
          parameters: [
            { name: 'step', value: '={{$json["step"]}}' },
            { name: 'contactId', value: '={{$json["contactId"]}}' },
            { name: 'status', value: '={{$json["status"]}}' },
            { name: 'timestamp', value: '={{$now}}' },
          ],
        },
      },
    });

    // Build connections
    connections['1'] = { main: [[{ node: 'Extract Tenant Context', type: 'main', index: 0 }]] };
    connections['2'] = { main: [[{ node: 'Get Tenant Config', type: 'main', index: 0 }]] };
    connections['3'] = { main: [[{ node: 'Step Router', type: 'main', index: 0 }]] };
    connections['4'] = {
      main: [
        [{ node: 'Send Connection Request', type: 'main', index: 0 }], // connection_request
        [{ node: 'Check If Accepted', type: 'main', index: 0 }],      // wait_for_accept
        [{ node: 'Send Welcome Message', type: 'main', index: 0 }],   // send_welcome
        [{ node: 'Send Follow-up 1', type: 'main', index: 0 }],       // follow_up_1
        [{ node: 'Send Follow-up 2', type: 'main', index: 0 }],       // follow_up_2
        [{ node: 'Send Follow-up 3', type: 'main', index: 0 }],       // follow_up_3
      ],
    };
    connections['5'] = { main: [[{ node: 'Schedule Next Step', type: 'main', index: 0 }]] };
    connections['6'] = { main: [[{ node: 'Update Stats', type: 'main', index: 0 }]] };

    return {
      id: 'shared-cr-workflow-v1',
      name: 'Shared Connection Request Workflow',
      nodes,
      connections,
      settings: {
        executionOrder: 'v1',
        saveDataSuccessExecution: 'all',
        saveExecutionProgress: true,
      },
    };
  }

  /**
   * Build the SINGLE shared Messenger workflow
   */
  private buildSharedMessengerWorkflow(): any {
    // Similar structure but for WhatsApp/Messenger/Telegram
    return {
      id: 'shared-messenger-workflow-v1',
      name: 'Shared Messenger Workflow',
      nodes: [
        // Similar nodes but for messenger platforms
      ],
      connections: {},
      settings: {},
    };
  }

  /**
   * Build the SINGLE shared Group workflow
   */
  private buildSharedGroupWorkflow(): any {
    // Similar structure but for group campaigns
    return {
      id: 'shared-group-workflow-v1',
      name: 'Shared Group Campaign Workflow',
      nodes: [
        // Similar nodes but for group campaigns
      ],
      connections: {},
      settings: {},
    };
  }

  /**
   * Deploy a workflow to n8n (one-time)
   */
  private async deployWorkflow(workflow: any): Promise<void> {
    const response = await fetch(`${this.n8nUrl}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': this.n8nApiKey,
      },
      body: JSON.stringify(workflow),
    });

    if (response.ok) {
      const result = await response.json();
      // Activate the workflow
      await fetch(`${this.n8nUrl}/api/v1/workflows/${result.id}/activate`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': this.n8nApiKey,
        },
      });
    }
  }
}

/**
 * Campaign Execution Service - How tenants use the shared workflows
 */
export class CampaignExecutionService {
  private orchestrator: SharedWorkflowOrchestrator;
  private schedulerUrl: string;

  constructor(orchestrator: SharedWorkflowOrchestrator, schedulerUrl: string) {
    this.orchestrator = orchestrator;
    this.schedulerUrl = schedulerUrl;
  }

  /**
   * Start a campaign for a tenant
   */
  async startCampaign(
    tenantId: string,
    campaignType: 'cr' | 'messenger' | 'group',
    campaignId: string,
    contacts: any[],
    config: any
  ): Promise<void> {
    // Find the shared workflow for this campaign type
    const sharedWorkflow = SHARED_WORKFLOWS.find(w => 
      w.type === `${campaignType}_sequence`
    );

    if (!sharedWorkflow) {
      throw new Error(`No shared workflow for campaign type: ${campaignType}`);
    }

    // Schedule execution for each contact
    for (const contact of contacts) {
      await this.scheduleExecution({
        tenantId,
        campaignId,
        contactId: contact.id,
        workflowType: sharedWorkflow.type,
        step: 'connection_request', // or 'initial_message'
        executeAt: new Date(), // immediate
        payload: {
          contact,
          config,
          unipileAccountId: config.unipileAccountId,
          message: this.personalizeMessage(config.templates[0], contact),
        },
      });
    }
  }

  /**
   * Schedule an execution (stored in database, cron job picks it up)
   */
  private async scheduleExecution(execution: any): Promise<void> {
    await fetch(`${this.schedulerUrl}/api/scheduler/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(execution),
    });
  }

  private personalizeMessage(template: string, contact: any): string {
    let message = template;
    Object.keys(contact).forEach(key => {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), contact[key] || '');
    });
    return message;
  }
}

/**
 * Scheduler Service - Runs as a cron job
 */
export class SchedulerService {
  private orchestrator: SharedWorkflowOrchestrator;
  private n8nUrl: string;

  constructor(orchestrator: SharedWorkflowOrchestrator, n8nUrl: string) {
    this.orchestrator = orchestrator;
    this.n8nUrl = n8nUrl;
  }

  /**
   * Run every minute to check for scheduled executions
   */
  async processScheduledExecutions(): Promise<void> {
    // Get all executions due now
    const executions = await this.getDueExecutions();

    for (const execution of executions) {
      // Find the right shared workflow
      const workflow = SHARED_WORKFLOWS.find(w => w.type === execution.workflowType);
      
      if (workflow) {
        // Trigger the shared workflow with tenant context
        await fetch(`${this.n8nUrl}${workflow.webhookPath}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tenantId: execution.tenantId,
            campaignId: execution.campaignId,
            contactId: execution.contactId,
            step: execution.step,
            unipileAccountId: execution.payload.unipileAccountId,
            ...execution.payload,
          }),
        });

        // Mark as executed
        await this.markAsExecuted(execution.id);
      }
    }
  }

  private async getDueExecutions(): Promise<any[]> {
    // Query database for executions where executeAt <= now
    return [];
  }

  private async markAsExecuted(executionId: string): Promise<void> {
    // Update database
  }
}

// Usage:
/*
// ONE TIME SETUP - Deploy the 3 shared workflows
const orchestrator = new SharedWorkflowOrchestrator('http://n8n.sam-ai.com', 'api-key');
await orchestrator.deploySharedWorkflows();

// TENANT USAGE - Start a campaign using shared workflow
const campaignService = new CampaignExecutionService(orchestrator, 'http://api.sam-ai.com');
await campaignService.startCampaign(
  'tenant-123',
  'cr',
  'campaign-456',
  contacts,
  {
    unipileAccountId: 'tenant-123-unipile',
    templates: ['Hi {{firstName}}...'],
  }
);

// CRON JOB - Process scheduled executions
const scheduler = new SchedulerService(orchestrator, 'http://n8n.sam-ai.com');
// Run every minute
setInterval(() => scheduler.processScheduledExecutions(), 60000);
*/