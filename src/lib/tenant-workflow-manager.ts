// Tenant Workflow Manager - Each tenant gets their own n8n workflows
// This ensures isolation, customization, and scalability

export interface TenantWorkflowConfig {
  tenantId: string;
  n8nInstanceUrl: string;  // Could be shared or dedicated
  n8nApiKey: string;
  unipileAccountId: string;
  workflowPrefix: string;  // e.g., "tenant-123-"
  limits: {
    maxWorkflows: number;
    maxExecutionsPerDay: number;
    maxContactsPerCampaign: number;
  };
}

export interface TenantWorkflow {
  id: string;
  tenantId: string;
  n8nWorkflowId: string;
  name: string;
  type: 'cr_sequence' | 'messenger_sequence' | 'group_sequence' | 'custom';
  status: 'active' | 'paused' | 'draft';
  created: Date;
  lastModified: Date;
  executions: number;
  config: any;
}

export class TenantWorkflowManager {
  private tenantConfig: TenantWorkflowConfig;
  
  constructor(tenantConfig: TenantWorkflowConfig) {
    this.tenantConfig = tenantConfig;
  }

  /**
   * Creates a campaign workflow in the tenant's n8n space
   */
  async createTenantWorkflow(
    campaignType: 'cr' | 'messenger' | 'group',
    campaignConfig: any
  ): Promise<TenantWorkflow> {
    // Generate unique workflow name for this tenant
    const workflowName = `${this.tenantConfig.workflowPrefix}${campaignType}-${Date.now()}`;
    
    // Build the n8n workflow JSON
    const n8nWorkflow = this.buildN8NWorkflow(campaignType, campaignConfig);
    
    // Add tenant-specific configurations
    n8nWorkflow.name = workflowName;
    n8nWorkflow.settings = {
      ...n8nWorkflow.settings,
      executionOrder: 'v1',
      saveDataSuccessExecution: 'all',
      saveExecutionProgress: true,
      // Tenant-specific webhook path
      webhookPath: `${this.tenantConfig.tenantId}/${campaignConfig.id}`,
    };

    // Deploy to n8n
    const response = await fetch(`${this.tenantConfig.n8nInstanceUrl}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': this.tenantConfig.n8nApiKey,
      },
      body: JSON.stringify(n8nWorkflow),
    });

    const n8nResult = await response.json();

    // Save workflow reference in database
    const tenantWorkflow: TenantWorkflow = {
      id: `tw-${Date.now()}`,
      tenantId: this.tenantConfig.tenantId,
      n8nWorkflowId: n8nResult.id,
      name: campaignConfig.name,
      type: `${campaignType}_sequence`,
      status: 'draft',
      created: new Date(),
      lastModified: new Date(),
      executions: 0,
      config: campaignConfig,
    };

    // Store in database (Supabase)
    await this.saveWorkflowToDatabase(tenantWorkflow);

    return tenantWorkflow;
  }

  /**
   * Builds n8n workflow with tenant-specific settings
   */
  private buildN8NWorkflow(type: string, config: any): any {
    const nodes: any[] = [];
    const connections: any = {};

    // 1. Webhook trigger - unique per tenant
    const webhookNode = {
      id: '1',
      name: 'Webhook',
      type: 'n8n-nodes-base.webhook',
      position: [250, 300],
      parameters: {
        path: `=${$credentials.webhookPath}`, // Tenant-specific path
        responseMode: 'onReceived',
        responseData: 'allEntries',
      },
    };
    nodes.push(webhookNode);

    // 2. Get tenant configuration
    const getTenantConfigNode = {
      id: '2',
      name: 'Get Tenant Config',
      type: 'n8n-nodes-base.httpRequest',
      position: [450, 300],
      parameters: {
        method: 'GET',
        url: `={{$env["SAM_AI_API"]}}/tenants/${this.tenantConfig.tenantId}/config`,
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'samAiApi',
      },
    };
    nodes.push(getTenantConfigNode);

    // 3. Unipile authentication - using tenant's account
    const unipileAuthNode = {
      id: '3',
      name: 'Set Unipile Context',
      type: 'n8n-nodes-base.set',
      position: [650, 300],
      parameters: {
        values: {
          string: [
            {
              name: 'unipileAccountId',
              value: this.tenantConfig.unipileAccountId,
            },
          ],
        },
      },
    };
    nodes.push(unipileAuthNode);

    // 4. Campaign-specific nodes based on type
    if (type === 'cr') {
      nodes.push(...this.buildConnectionRequestNodes());
    } else if (type === 'messenger') {
      nodes.push(...this.buildMessengerNodes());
    } else if (type === 'group') {
      nodes.push(...this.buildGroupCampaignNodes());
    }

    // 5. Update campaign stats in tenant's database
    const updateStatsNode = {
      id: '99',
      name: 'Update Campaign Stats',
      type: 'n8n-nodes-base.httpRequest',
      position: [1250, 300],
      parameters: {
        method: 'POST',
        url: `={{$env["SAM_AI_API"]}}/tenants/${this.tenantConfig.tenantId}/campaigns/{{$json["campaignId"]}}/stats`,
        sendBody: true,
        bodyParameters: {
          parameters: [
            { name: 'sent', value: '={{$json["sent"]}}' },
            { name: 'opened', value: '={{$json["opened"]}}' },
            { name: 'replied', value: '={{$json["replied"]}}' },
          ],
        },
      },
    };
    nodes.push(updateStatsNode);

    // Build connections
    connections['1'] = { main: [[{ node: 'Get Tenant Config', type: 'main', index: 0 }]] };
    connections['2'] = { main: [[{ node: 'Set Unipile Context', type: 'main', index: 0 }]] };
    // ... more connections

    return {
      name: config.name,
      nodes,
      connections,
      settings: {},
      staticData: {
        tenantId: this.tenantConfig.tenantId,
      },
    };
  }

  /**
   * Connection Request specific nodes
   */
  private buildConnectionRequestNodes(): any[] {
    return [
      {
        id: '10',
        name: 'Send Connection Request',
        type: 'n8n-nodes-base.httpRequest',
        position: [850, 300],
        parameters: {
          method: 'POST',
          url: 'https://api.unipile.com/v1/linkedin/invitations',
          sendHeaders: true,
          headerParameters: {
            parameters: [
              {
                name: 'X-Account-ID',
                value: '={{$node["Set Unipile Context"].json["unipileAccountId"]}}',
              },
            ],
          },
          sendBody: true,
          bodyParameters: {
            parameters: [
              { name: 'profile_url', value: '={{$json["linkedinUrl"]}}' },
              { name: 'message', value: '={{$json["connectionMessage"]}}' },
            ],
          },
        },
      },
      {
        id: '11',
        name: 'Wait 2 Days',
        type: 'n8n-nodes-base.wait',
        position: [1050, 300],
        parameters: {
          resume: 'timeInterval',
          amount: 2,
          unit: 'days',
        },
      },
      {
        id: '12',
        name: 'Check If Accepted',
        type: 'n8n-nodes-base.httpRequest',
        position: [1250, 300],
        parameters: {
          method: 'GET',
          url: 'https://api.unipile.com/v1/linkedin/connections/{{$json["profileId"]}}',
        },
      },
      {
        id: '13',
        name: 'Send Welcome Message',
        type: 'n8n-nodes-base.httpRequest',
        position: [1450, 300],
        parameters: {
          method: 'POST',
          url: 'https://api.unipile.com/v1/messages/send',
          sendBody: true,
          bodyParameters: {
            parameters: [
              { name: 'platform', value: 'linkedin' },
              { name: 'recipient_id', value: '={{$json["profileId"]}}' },
              { name: 'message', value: '={{$json["welcomeMessage"]}}' },
            ],
          },
        },
      },
    ];
  }

  /**
   * Messenger campaign specific nodes
   */
  private buildMessengerNodes(): any[] {
    return [
      {
        id: '20',
        name: 'Send Message',
        type: 'n8n-nodes-base.httpRequest',
        position: [850, 300],
        parameters: {
          method: 'POST',
          url: 'https://api.unipile.com/v1/messages/send',
          sendHeaders: true,
          headerParameters: {
            parameters: [
              {
                name: 'X-Account-ID',
                value: '={{$node["Set Unipile Context"].json["unipileAccountId"]}}',
              },
            ],
          },
          sendBody: true,
          bodyParameters: {
            parameters: [
              { name: 'platform', value: '={{$json["platform"]}}' }, // whatsapp, messenger, etc
              { name: 'recipient_id', value: '={{$json["recipientId"]}}' },
              { name: 'message', value: '={{$json["message"]}}' },
            ],
          },
        },
      },
      {
        id: '21',
        name: 'Wait 1 Day',
        type: 'n8n-nodes-base.wait',
        position: [1050, 300],
        parameters: {
          resume: 'timeInterval',
          amount: 1,
          unit: 'days',
        },
      },
      {
        id: '22',
        name: 'Check Reply',
        type: 'n8n-nodes-base.httpRequest',
        position: [1250, 300],
        parameters: {
          method: 'GET',
          url: 'https://api.unipile.com/v1/conversations?platform={{$json["platform"]}}&participant_id={{$json["recipientId"]}}',
        },
      },
    ];
  }

  /**
   * Group campaign specific nodes
   */
  private buildGroupCampaignNodes(): any[] {
    return [
      {
        id: '30',
        name: 'Get Group Members',
        type: 'n8n-nodes-base.httpRequest',
        position: [850, 300],
        parameters: {
          method: 'GET',
          url: 'https://api.unipile.com/v1/linkedin/groups/{{$json["groupId"]}}/members',
        },
      },
      {
        id: '31',
        name: 'Loop Through Members',
        type: 'n8n-nodes-base.splitInBatches',
        position: [1050, 300],
        parameters: {
          batchSize: 10, // Process 10 at a time
        },
      },
      {
        id: '32',
        name: 'Send Group Message',
        type: 'n8n-nodes-base.httpRequest',
        position: [1250, 300],
        parameters: {
          method: 'POST',
          url: 'https://api.unipile.com/v1/messages/send',
          sendBody: true,
          bodyParameters: {
            parameters: [
              { name: 'platform', value: 'linkedin' },
              { name: 'recipient_id', value: '={{$json["memberId"]}}' },
              { name: 'message', value: '={{$json["groupMessage"]}}' },
            ],
          },
        },
      },
    ];
  }

  /**
   * Activate workflow for tenant
   */
  async activateWorkflow(workflowId: string): Promise<void> {
    await fetch(`${this.tenantConfig.n8nInstanceUrl}/api/v1/workflows/${workflowId}/activate`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': this.tenantConfig.n8nApiKey,
      },
    });

    // Update status in database
    await this.updateWorkflowStatus(workflowId, 'active');
  }

  /**
   * Execute workflow for specific contacts
   */
  async executeWorkflow(
    workflowId: string,
    contacts: any[],
    campaignData: any
  ): Promise<void> {
    const webhook = `${this.tenantConfig.n8nInstanceUrl}/webhook/${this.tenantConfig.tenantId}/${campaignData.id}`;
    
    for (const contact of contacts) {
      await fetch(webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId: this.tenantConfig.tenantId,
          campaignId: campaignData.id,
          contact: contact,
          campaignConfig: campaignData,
        }),
      });

      // Respect rate limits
      await this.enforceRateLimit();
    }
  }

  /**
   * Get workflow executions for tenant
   */
  async getWorkflowExecutions(workflowId: string): Promise<any[]> {
    const response = await fetch(
      `${this.tenantConfig.n8nInstanceUrl}/api/v1/executions?workflowId=${workflowId}`,
      {
        method: 'GET',
        headers: {
          'X-N8N-API-KEY': this.tenantConfig.n8nApiKey,
        },
      }
    );

    const executions = await response.json();
    
    // Filter to only this tenant's executions
    return executions.filter((e: any) => 
      e.data?.staticData?.tenantId === this.tenantConfig.tenantId
    );
  }

  /**
   * Delete workflow (cleanup)
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    await fetch(`${this.tenantConfig.n8nInstanceUrl}/api/v1/workflows/${workflowId}`, {
      method: 'DELETE',
      headers: {
        'X-N8N-API-KEY': this.tenantConfig.n8nApiKey,
      },
    });

    await this.removeWorkflowFromDatabase(workflowId);
  }

  /**
   * Rate limiting per tenant
   */
  private async enforceRateLimit(): Promise<void> {
    // Check tenant's limits
    const usage = await this.getTenantUsage();
    
    if (usage.dailyExecutions >= this.tenantConfig.limits.maxExecutionsPerDay) {
      throw new Error('Daily execution limit reached');
    }

    // Add delay based on platform limits
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
  }

  private async getTenantUsage(): Promise<any> {
    // Get from database
    return {
      dailyExecutions: 0,
      totalWorkflows: 0,
    };
  }

  private async saveWorkflowToDatabase(workflow: TenantWorkflow): Promise<void> {
    // Save to Supabase
    console.log('Saving workflow to database:', workflow);
  }

  private async updateWorkflowStatus(workflowId: string, status: string): Promise<void> {
    // Update in Supabase
    console.log('Updating workflow status:', workflowId, status);
  }

  private async removeWorkflowFromDatabase(workflowId: string): Promise<void> {
    // Remove from Supabase
    console.log('Removing workflow from database:', workflowId);
  }
}

// Usage example:
/*
// Each tenant gets their own manager instance
const tenantConfig: TenantWorkflowConfig = {
  tenantId: 'tenant-123',
  n8nInstanceUrl: 'https://n8n.sam-ai.com', // Could be shared or dedicated
  n8nApiKey: 'tenant-specific-api-key',
  unipileAccountId: 'unipile-account-123',
  workflowPrefix: 'tenant-123-',
  limits: {
    maxWorkflows: 10,
    maxExecutionsPerDay: 1000,
    maxContactsPerCampaign: 500,
  },
};

const manager = new TenantWorkflowManager(tenantConfig);

// Create a campaign workflow in tenant's space
const workflow = await manager.createTenantWorkflow('cr', {
  name: 'Q1 Sales Outreach',
  id: 'campaign-456',
  // ... campaign config
});

// Execute for contacts
await manager.executeWorkflow(workflow.n8nWorkflowId, contacts, campaignData);
*/