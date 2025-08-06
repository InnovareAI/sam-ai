// N8N Sequence Adapter - Converts simple sequences to n8n workflows
// Users create simple sequences, we handle the n8n complexity

import { CampaignSequence, SequenceStep } from './campaign-sequences';

export class N8NSequenceAdapter {
  private n8nUrl: string;
  private apiKey: string;

  constructor(n8nUrl: string = 'http://localhost:5678', apiKey: string = '') {
    this.n8nUrl = n8nUrl;
    this.apiKey = apiKey;
  }

  /**
   * Converts our simple sequence format to n8n workflow JSON
   * This is where we hide all the n8n complexity
   */
  convertSequenceToN8NWorkflow(sequence: CampaignSequence): any {
    const nodes: any[] = [];
    const connections: any = {};
    let nodeId = 0;
    let yPosition = 0;

    // Add webhook trigger node (always starts with webhook)
    const triggerNode = {
      id: `${nodeId}`,
      name: 'Webhook Trigger',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 1,
      position: [250, yPosition],
      parameters: {
        path: `sequence-${sequence.id}`,
        responseMode: 'onReceived',
        responseData: 'allEntries',
        options: {}
      }
    };
    nodes.push(triggerNode);
    const triggerId = `${nodeId}`;
    nodeId++;
    yPosition += 150;

    // Convert each step to n8n nodes
    let previousNodeId = triggerId;
    
    for (const step of sequence.steps) {
      const stepNodes = this.convertStepToNodes(step, nodeId, yPosition);
      
      // Add nodes
      stepNodes.forEach(node => {
        nodes.push(node);
        
        // Connect to previous node
        if (!connections[previousNodeId]) {
          connections[previousNodeId] = { main: [[]] };
        }
        connections[previousNodeId].main[0].push({
          node: node.name,
          type: 'main',
          index: 0
        });
        
        previousNodeId = node.name;
        nodeId++;
        yPosition += 150;
      });
    }

    return {
      name: sequence.name,
      nodes,
      connections,
      settings: {
        executionOrder: 'v1'
      },
      staticData: null,
      tags: [],
      triggerCount: 0,
      updatedAt: new Date().toISOString(),
      versionId: null
    };
  }

  /**
   * Converts a single sequence step to n8n node(s)
   */
  private convertStepToNodes(step: SequenceStep, nodeId: number, yPosition: number): any[] {
    const nodes: any[] = [];

    switch (step.type) {
      case 'email':
        nodes.push(this.createEmailNode(step, nodeId, yPosition));
        break;
      
      case 'linkedin':
        nodes.push(this.createLinkedInNode(step, nodeId, yPosition));
        break;
      
      case 'wait':
        nodes.push(this.createWaitNode(step, nodeId, yPosition));
        break;
      
      case 'condition':
        nodes.push(...this.createConditionNodes(step, nodeId, yPosition));
        break;
      
      case 'task':
        nodes.push(this.createTaskNode(step, nodeId, yPosition));
        break;
      
      case 'sms':
        nodes.push(this.createSMSNode(step, nodeId, yPosition));
        break;
    }

    // Add wait node if step has delay
    if (step.timing.delay > 0 && step.type !== 'wait') {
      nodes.unshift(this.createWaitNode(step, nodeId - 1, yPosition - 75));
    }

    return nodes;
  }

  private createEmailNode(step: SequenceStep, nodeId: number, yPosition: number): any {
    return {
      id: `${nodeId}`,
      name: step.name || `Email ${nodeId}`,
      type: 'n8n-nodes-base.emailSend',
      typeVersion: 2.1,
      position: [450, yPosition],
      parameters: {
        fromEmail: '={{$json["sender_email"]}}',
        toEmail: '={{$json["contact_email"]}}',
        subject: step.config.subject || 'Email from Sam AI',
        emailType: 'html',
        htmlBody: this.convertToN8NTemplate(step.config.content || ''),
        options: {
          appendAttribution: false,
          trackOpens: true,
          trackClicks: true
        }
      }
    };
  }

  private createLinkedInNode(step: SequenceStep, nodeId: number, yPosition: number): any {
    // Since n8n doesn't have native LinkedIn, we use HTTP Request
    return {
      id: `${nodeId}`,
      name: step.name || `LinkedIn ${nodeId}`,
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [450, yPosition],
      parameters: {
        method: 'POST',
        url: '={{$env["LINKEDIN_WEBHOOK_URL"]}}',
        sendBody: true,
        bodyParameters: {
          parameters: [
            {
              name: 'action',
              value: 'send_message'
            },
            {
              name: 'profileUrl',
              value: '={{$json["linkedin_url"]}}'
            },
            {
              name: 'message',
              value: this.convertToN8NTemplate(step.config.content || '')
            }
          ]
        },
        options: {}
      }
    };
  }

  private createWaitNode(step: SequenceStep, nodeId: number, yPosition: number): any {
    const seconds = this.convertToSeconds(step.timing.delay, step.timing.unit);
    
    return {
      id: `${nodeId}`,
      name: step.name || `Wait ${nodeId}`,
      type: 'n8n-nodes-base.wait',
      typeVersion: 1,
      position: [450, yPosition],
      parameters: {
        resume: 'timeInterval',
        amount: step.timing.delay,
        unit: step.timing.unit === 'minutes' ? 'minutes' : 
              step.timing.unit === 'hours' ? 'hours' : 
              step.timing.unit === 'days' ? 'days' : 'seconds'
      }
    };
  }

  private createConditionNodes(step: SequenceStep, nodeId: number, yPosition: number): any[] {
    const nodes: any[] = [];
    
    // IF node to check condition
    nodes.push({
      id: `${nodeId}`,
      name: step.name || `Check Condition ${nodeId}`,
      type: 'n8n-nodes-base.if',
      typeVersion: 1,
      position: [450, yPosition],
      parameters: {
        conditions: {
          boolean: [],
          string: [
            {
              value1: '={{$json["contact_status"]}}',
              operation: 'equals',
              value2: step.config.conditionValue || 'replied'
            }
          ]
        }
      }
    });

    return nodes;
  }

  private createTaskNode(step: SequenceStep, nodeId: number, yPosition: number): any {
    // Create task in CRM via HTTP request
    return {
      id: `${nodeId}`,
      name: step.name || `Create Task ${nodeId}`,
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [450, yPosition],
      parameters: {
        method: 'POST',
        url: '={{$env["SAM_AI_API_URL"]}}/tasks',
        sendBody: true,
        bodyParameters: {
          parameters: [
            {
              name: 'title',
              value: step.config.taskTitle || 'Follow-up task'
            },
            {
              name: 'description',
              value: step.config.taskDescription || ''
            },
            {
              name: 'assignTo',
              value: step.config.assignTo || '={{$json["owner_id"]}}'
            },
            {
              name: 'contactId',
              value: '={{$json["contact_id"]}}'
            }
          ]
        },
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        options: {}
      }
    };
  }

  private createSMSNode(step: SequenceStep, nodeId: number, yPosition: number): any {
    return {
      id: `${nodeId}`,
      name: step.name || `Send SMS ${nodeId}`,
      type: 'n8n-nodes-base.twilio',
      typeVersion: 1,
      position: [450, yPosition],
      parameters: {
        operation: 'send',
        from: '={{$env["TWILIO_PHONE_NUMBER"]}}',
        to: '={{$json["phone"]}}',
        message: this.convertToN8NTemplate(step.config.content || ''),
        options: {}
      }
    };
  }

  /**
   * Converts our template syntax to n8n expression syntax
   * {{firstName}} becomes {{$json["firstName"]}}
   */
  private convertToN8NTemplate(content: string): string {
    return content.replace(/{{(\w+)}}/g, '{{$json["$1"]}}');
  }

  private convertToSeconds(delay: number, unit: string): number {
    switch (unit) {
      case 'minutes': return delay * 60;
      case 'hours': return delay * 3600;
      case 'days': return delay * 86400;
      case 'weeks': return delay * 604800;
      default: return delay;
    }
  }

  /**
   * Deploy sequence to n8n instance
   */
  async deploySequence(sequence: CampaignSequence): Promise<{ success: boolean; workflowId?: string; error?: string }> {
    try {
      const workflow = this.convertSequenceToN8NWorkflow(sequence);
      
      const response = await fetch(`${this.n8nUrl}/api/v1/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': this.apiKey
        },
        body: JSON.stringify(workflow)
      });

      if (!response.ok) {
        throw new Error(`Failed to deploy: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Activate the workflow
      await this.activateWorkflow(result.id);
      
      return {
        success: true,
        workflowId: result.id
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Deployment failed'
      };
    }
  }

  /**
   * Activate a workflow in n8n
   */
  private async activateWorkflow(workflowId: string): Promise<void> {
    await fetch(`${this.n8nUrl}/api/v1/workflows/${workflowId}/activate`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': this.apiKey
      }
    });
  }

  /**
   * Execute sequence for a batch of contacts
   */
  async executeSequence(
    sequenceId: string,
    workflowId: string,
    contacts: any[]
  ): Promise<void> {
    // Execute via webhook for each contact
    for (const contact of contacts) {
      await fetch(`${this.n8nUrl}/webhook/sequence-${sequenceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contact_id: contact.id,
          contact_email: contact.email,
          contact_name: contact.name,
          firstName: contact.firstName,
          lastName: contact.lastName,
          company: contact.company,
          linkedin_url: contact.linkedinUrl,
          phone: contact.phone,
          owner_id: contact.ownerId,
          // Add any other data the sequence might need
          ...contact
        })
      });
    }
  }

  /**
   * Get execution status from n8n
   */
  async getSequenceStatus(workflowId: string): Promise<any> {
    const response = await fetch(`${this.n8nUrl}/api/v1/executions?workflowId=${workflowId}`, {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': this.apiKey
      }
    });

    return response.json();
  }
}

// Example usage:
/*
const adapter = new N8NSequenceAdapter('http://n8n.company.com', 'api-key');
const sequence = SEQUENCE_TEMPLATES[0]; // Get a sequence

// Deploy to n8n (happens once)
const deployment = await adapter.deploySequence(sequence);

// Execute for contacts (happens many times)
await adapter.executeSequence(
  sequence.id,
  deployment.workflowId,
  contacts
);
*/