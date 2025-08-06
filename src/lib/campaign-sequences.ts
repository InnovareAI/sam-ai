// Native Campaign Sequence System - No n8n Required
// Simple, powerful campaign automation that just works

export interface CampaignSequence {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  steps: SequenceStep[];
  triggers: SequenceTrigger[];
  stats?: {
    totalContacts: number;
    completed: number;
    inProgress: number;
    responseRate: number;
  };
}

export interface SequenceStep {
  id: string;
  type: 'email' | 'linkedin' | 'sms' | 'call' | 'task' | 'wait' | 'condition';
  name: string;
  config: StepConfig;
  timing: StepTiming;
  conditions?: StepCondition[];
  stats?: {
    sent: number;
    opened: number;
    replied: number;
    clicked: number;
  };
}

export interface StepConfig {
  // For email/linkedin/sms
  templateId?: string;
  subject?: string;
  content?: string;
  personalization?: boolean;
  
  // For tasks
  taskTitle?: string;
  taskDescription?: string;
  assignTo?: string;
  
  // For conditions
  conditionType?: 'replied' | 'opened' | 'clicked' | 'custom';
  conditionValue?: any;
}

export interface StepTiming {
  delay: number;
  unit: 'minutes' | 'hours' | 'days' | 'weeks';
  businessHours?: boolean;
  timezone?: string;
}

export interface StepCondition {
  type: 'if_replied' | 'if_not_replied' | 'if_opened' | 'if_not_opened' | 'if_clicked' | 'if_not_clicked';
  action: 'continue' | 'stop' | 'jump_to';
  targetStepId?: string;
}

export interface SequenceTrigger {
  type: 'manual' | 'tag_added' | 'form_submitted' | 'list_added' | 'campaign_completed';
  config: Record<string, any>;
}

// Pre-built sequence templates
export const SEQUENCE_TEMPLATES: CampaignSequence[] = [
  {
    id: 'cold-outreach-basic',
    name: 'Cold Outreach + 3 Follow-ups',
    description: 'Initial email with 3 automated follow-ups over 2 weeks',
    status: 'draft',
    triggers: [
      {
        type: 'manual',
        config: {},
      },
    ],
    steps: [
      {
        id: 'step-1',
        type: 'email',
        name: 'Initial Outreach',
        config: {
          subject: 'Quick question about {{company}}',
          content: `Hi {{firstName}},

I noticed {{company}} is {{trigger_event}}. 

{{value_proposition}}

Worth a quick chat?

Best,
{{sender_name}}`,
          personalization: true,
        },
        timing: {
          delay: 0,
          unit: 'minutes',
          businessHours: true,
        },
        conditions: [
          {
            type: 'if_replied',
            action: 'stop',
          },
        ],
      },
      {
        id: 'step-2',
        type: 'wait',
        name: 'Wait 3 days',
        config: {},
        timing: {
          delay: 3,
          unit: 'days',
        },
      },
      {
        id: 'step-3',
        type: 'email',
        name: 'Follow-up 1',
        config: {
          subject: 'Re: Quick question about {{company}}',
          content: `Hi {{firstName}},

Just following up on my previous email. 

{{follow_up_hook}}

Is this something you're exploring?

{{sender_name}}`,
          personalization: true,
        },
        timing: {
          delay: 0,
          unit: 'minutes',
        },
        conditions: [
          {
            type: 'if_replied',
            action: 'stop',
          },
        ],
      },
      {
        id: 'step-4',
        type: 'wait',
        name: 'Wait 4 days',
        config: {},
        timing: {
          delay: 4,
          unit: 'days',
        },
      },
      {
        id: 'step-5',
        type: 'email',
        name: 'Follow-up 2',
        config: {
          subject: 'Re: {{company}} - Last check',
          content: `{{firstName}},

I know you're busy. Would it make sense to connect for 10 minutes next week?

If not, I'll stop reaching out.

{{sender_name}}`,
          personalization: true,
        },
        timing: {
          delay: 0,
          unit: 'minutes',
        },
        conditions: [
          {
            type: 'if_replied',
            action: 'stop',
          },
        ],
      },
      {
        id: 'step-6',
        type: 'wait',
        name: 'Wait 7 days',
        config: {},
        timing: {
          delay: 7,
          unit: 'days',
        },
      },
      {
        id: 'step-7',
        type: 'email',
        name: 'Break-up Email',
        config: {
          subject: 'Should I close your file?',
          content: `Hi {{firstName}},

I haven't heard back, so I'm assuming this isn't a priority right now.

I'll close your file for now, but feel free to reach out if things change.

Best,
{{sender_name}}`,
          personalization: true,
        },
        timing: {
          delay: 0,
          unit: 'minutes',
        },
      },
    ],
  },
  {
    id: 'linkedin-outreach',
    name: 'LinkedIn Connection + Message Sequence',
    description: 'Connect on LinkedIn, then send personalized messages',
    status: 'draft',
    triggers: [
      {
        type: 'manual',
        config: {},
      },
    ],
    steps: [
      {
        id: 'step-1',
        type: 'linkedin',
        name: 'Send Connection Request',
        config: {
          content: `Hi {{firstName}}, I see we're both in {{industry}}. Would love to connect and share insights about {{common_interest}}.`,
          personalization: true,
        },
        timing: {
          delay: 0,
          unit: 'minutes',
        },
      },
      {
        id: 'step-2',
        type: 'wait',
        name: 'Wait for acceptance',
        config: {},
        timing: {
          delay: 2,
          unit: 'days',
        },
      },
      {
        id: 'step-3',
        type: 'condition',
        name: 'Check if connected',
        config: {
          conditionType: 'custom',
          conditionValue: 'linkedin_connected',
        },
        timing: {
          delay: 0,
          unit: 'minutes',
        },
        conditions: [
          {
            type: 'if_not_replied',
            action: 'stop',
          },
        ],
      },
      {
        id: 'step-4',
        type: 'linkedin',
        name: 'Send Welcome Message',
        config: {
          content: `Thanks for connecting, {{firstName}}!

I noticed {{observation_about_profile}}.

{{value_proposition}}

Would you be open to a brief conversation about how we might help?`,
          personalization: true,
        },
        timing: {
          delay: 1,
          unit: 'hours',
        },
      },
      {
        id: 'step-5',
        type: 'wait',
        name: 'Wait 3 days',
        config: {},
        timing: {
          delay: 3,
          unit: 'days',
        },
      },
      {
        id: 'step-6',
        type: 'linkedin',
        name: 'Follow-up Message',
        config: {
          content: `Hi {{firstName}}, 

Quick follow-up - {{specific_value_prop_for_company}}.

Worth a quick call this week?`,
          personalization: true,
        },
        timing: {
          delay: 0,
          unit: 'minutes',
        },
      },
    ],
  },
  {
    id: 'multi-channel',
    name: 'Multi-Channel Outreach',
    description: 'Email + LinkedIn + Phone touchpoints',
    status: 'draft',
    triggers: [
      {
        type: 'manual',
        config: {},
      },
    ],
    steps: [
      {
        id: 'step-1',
        type: 'email',
        name: 'Initial Email',
        config: {
          subject: 'Quick question {{firstName}}',
          personalization: true,
        },
        timing: {
          delay: 0,
          unit: 'minutes',
        },
      },
      {
        id: 'step-2',
        type: 'wait',
        name: 'Wait 2 days',
        config: {},
        timing: {
          delay: 2,
          unit: 'days',
        },
      },
      {
        id: 'step-3',
        type: 'linkedin',
        name: 'LinkedIn Connection',
        config: {
          content: 'Sent you an email about {{topic}} - connecting here as well.',
        },
        timing: {
          delay: 0,
          unit: 'minutes',
        },
      },
      {
        id: 'step-4',
        type: 'wait',
        name: 'Wait 2 days',
        config: {},
        timing: {
          delay: 2,
          unit: 'days',
        },
      },
      {
        id: 'step-5',
        type: 'task',
        name: 'Phone Call Task',
        config: {
          taskTitle: 'Call {{firstName}} at {{company}}',
          taskDescription: 'Follow up on email and LinkedIn outreach',
          assignTo: 'sales_rep',
        },
        timing: {
          delay: 0,
          unit: 'minutes',
        },
      },
      {
        id: 'step-6',
        type: 'wait',
        name: 'Wait 1 day',
        config: {},
        timing: {
          delay: 1,
          unit: 'days',
        },
      },
      {
        id: 'step-7',
        type: 'email',
        name: 'Post-call Follow-up',
        config: {
          subject: 'Following up on our call',
          personalization: true,
        },
        timing: {
          delay: 0,
          unit: 'minutes',
        },
      },
    ],
  },
  {
    id: 'webinar-nurture',
    name: 'Webinar Follow-up Sequence',
    description: 'Nurture sequence for webinar attendees',
    status: 'draft',
    triggers: [
      {
        type: 'tag_added',
        config: {
          tag: 'webinar_attended',
        },
      },
    ],
    steps: [
      {
        id: 'step-1',
        type: 'email',
        name: 'Thank You Email',
        config: {
          subject: 'Thanks for attending! Here are the slides',
          content: 'Webinar recap and resources...',
        },
        timing: {
          delay: 1,
          unit: 'hours',
        },
      },
      {
        id: 'step-2',
        type: 'wait',
        name: 'Wait 1 day',
        config: {},
        timing: {
          delay: 1,
          unit: 'days',
        },
      },
      {
        id: 'step-3',
        type: 'email',
        name: 'Case Study Email',
        config: {
          subject: 'How {{similar_company}} achieved {{result}}',
          personalization: true,
        },
        timing: {
          delay: 0,
          unit: 'minutes',
        },
      },
      {
        id: 'step-4',
        type: 'wait',
        name: 'Wait 3 days',
        config: {},
        timing: {
          delay: 3,
          unit: 'days',
        },
      },
      {
        id: 'step-5',
        type: 'email',
        name: 'Book a Demo',
        config: {
          subject: 'Ready to see it in action?',
          content: 'Personalized demo invitation...',
        },
        timing: {
          delay: 0,
          unit: 'minutes',
        },
      },
    ],
  },
];

// Sequence Execution Engine
export class SequenceExecutionEngine {
  private activeSequences: Map<string, any> = new Map();

  async startSequence(
    sequenceId: string,
    contacts: any[],
    variables?: Record<string, any>
  ): Promise<void> {
    const sequence = this.getSequence(sequenceId);
    if (!sequence) throw new Error('Sequence not found');

    for (const contact of contacts) {
      this.executeSequenceForContact(sequence, contact, variables);
    }
  }

  private async executeSequenceForContact(
    sequence: CampaignSequence,
    contact: any,
    variables?: Record<string, any>
  ): Promise<void> {
    for (const step of sequence.steps) {
      // Check conditions
      if (step.conditions) {
        const shouldContinue = await this.evaluateConditions(step.conditions, contact);
        if (!shouldContinue) break;
      }

      // Wait if needed
      if (step.timing.delay > 0) {
        await this.wait(step.timing);
      }

      // Execute step
      await this.executeStep(step, contact, variables);

      // Update stats
      await this.updateStepStats(step.id);
    }
  }

  private async executeStep(
    step: SequenceStep,
    contact: any,
    variables?: Record<string, any>
  ): Promise<void> {
    switch (step.type) {
      case 'email':
        await this.sendEmail(step, contact, variables);
        break;
      case 'linkedin':
        await this.sendLinkedInMessage(step, contact, variables);
        break;
      case 'sms':
        await this.sendSMS(step, contact, variables);
        break;
      case 'task':
        await this.createTask(step, contact, variables);
        break;
      case 'wait':
        // Already handled in executeSequenceForContact
        break;
      case 'condition':
        // Conditions are evaluated before execution
        break;
    }
  }

  private async sendEmail(
    step: SequenceStep,
    contact: any,
    variables?: Record<string, any>
  ): Promise<void> {
    // Personalize content
    const personalizedContent = this.personalizeContent(
      step.config.content || '',
      contact,
      variables
    );

    // Send via email service
    console.log(`Sending email to ${contact.email}:`, personalizedContent);
  }

  private async sendLinkedInMessage(
    step: SequenceStep,
    contact: any,
    variables?: Record<string, any>
  ): Promise<void> {
    const personalizedContent = this.personalizeContent(
      step.config.content || '',
      contact,
      variables
    );

    console.log(`Sending LinkedIn message to ${contact.linkedinUrl}:`, personalizedContent);
  }

  private async sendSMS(
    step: SequenceStep,
    contact: any,
    variables?: Record<string, any>
  ): Promise<void> {
    console.log(`Sending SMS to ${contact.phone}`);
  }

  private async createTask(
    step: SequenceStep,
    contact: any,
    variables?: Record<string, any>
  ): Promise<void> {
    console.log(`Creating task: ${step.config.taskTitle} for ${contact.name}`);
  }

  private personalizeContent(
    content: string,
    contact: any,
    variables?: Record<string, any>
  ): string {
    let personalized = content;
    
    // Replace contact variables
    Object.keys(contact).forEach(key => {
      personalized = personalized.replace(
        new RegExp(`{{${key}}}`, 'g'),
        contact[key]
      );
    });

    // Replace custom variables
    if (variables) {
      Object.keys(variables).forEach(key => {
        personalized = personalized.replace(
          new RegExp(`{{${key}}}`, 'g'),
          variables[key]
        );
      });
    }

    return personalized;
  }

  private async evaluateConditions(
    conditions: StepCondition[],
    contact: any
  ): Promise<boolean> {
    for (const condition of conditions) {
      // Check interaction history
      switch (condition.type) {
        case 'if_replied':
          if (contact.hasReplied) {
            return condition.action === 'continue';
          }
          break;
        case 'if_not_replied':
          if (!contact.hasReplied) {
            return condition.action === 'continue';
          }
          break;
        case 'if_opened':
          if (contact.hasOpened) {
            return condition.action === 'continue';
          }
          break;
        // Add more conditions as needed
      }
    }
    return true;
  }

  private async wait(timing: StepTiming): Promise<void> {
    const milliseconds = this.convertToMilliseconds(timing.delay, timing.unit);
    await new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  private convertToMilliseconds(delay: number, unit: string): number {
    switch (unit) {
      case 'minutes': return delay * 60 * 1000;
      case 'hours': return delay * 60 * 60 * 1000;
      case 'days': return delay * 24 * 60 * 60 * 1000;
      case 'weeks': return delay * 7 * 24 * 60 * 60 * 1000;
      default: return delay * 1000;
    }
  }

  private getSequence(sequenceId: string): CampaignSequence | undefined {
    return SEQUENCE_TEMPLATES.find(s => s.id === sequenceId);
  }

  private async updateStepStats(stepId: string): Promise<void> {
    // Update step statistics in database
    console.log(`Updating stats for step ${stepId}`);
  }
}