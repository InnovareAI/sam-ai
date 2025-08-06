// Unipile Campaign System - Three core campaign types
// Leverages Unipile's unified messaging API for multi-channel outreach

export interface UnipileCampaign {
  id: string;
  type: 'connection_request' | 'messenger' | 'group';
  name: string;
  platform: 'linkedin' | 'whatsapp' | 'messenger' | 'telegram' | 'email';
  status: 'draft' | 'active' | 'paused' | 'completed';
  sequence: CampaignStep[];
  targeting: TargetingCriteria;
  limits: CampaignLimits;
  stats: CampaignStats;
}

export interface CampaignStep {
  id: string;
  type: 'connection_request' | 'message' | 'follow_up' | 'wait' | 'condition';
  delay: {
    value: number;
    unit: 'hours' | 'days';
  };
  content: {
    template: string;
    personalization: boolean;
    variants?: string[]; // For A/B testing
  };
  conditions?: {
    skipIf: 'accepted' | 'replied' | 'opened' | 'clicked';
    moveToStep?: string;
  };
}

export interface TargetingCriteria {
  // For CR campaigns
  linkedinSearch?: {
    keywords?: string[];
    titles?: string[];
    companies?: string[];
    locations?: string[];
    industries?: string[];
  };
  // For messenger campaigns
  existingConnections?: boolean;
  tags?: string[];
  lists?: string[];
  // For group campaigns
  groupIds?: string[];
  groupMembers?: boolean;
}

export interface CampaignLimits {
  dailyLimit: number;
  totalLimit?: number;
  timeWindow?: {
    start: string; // "09:00"
    end: string;   // "17:00"
    timezone: string;
    weekdaysOnly: boolean;
  };
}

export interface CampaignStats {
  sent: number;
  accepted: number;
  replied: number;
  opened: number;
  clicked: number;
  conversionRate: number;
}

// Pre-built campaign templates for the three main types
export const CAMPAIGN_TEMPLATES = {
  // 1. CONNECTION REQUEST + FOLLOW-UPS
  connectionRequest: {
    basic: {
      id: 'cr-basic',
      type: 'connection_request' as const,
      name: 'LinkedIn Connection + 3 Follow-ups',
      platform: 'linkedin' as const,
      status: 'draft' as const,
      sequence: [
        {
          id: 'step-1',
          type: 'connection_request' as const,
          delay: { value: 0, unit: 'hours' as const },
          content: {
            template: `Hi {{firstName}},

I came across your profile and noticed {{commonality}}. I'm connecting with {{targetRole}} professionals in {{industry}} to share insights about {{valueProposition}}.

Would love to connect!

{{senderName}}`,
            personalization: true,
          },
        },
        {
          id: 'step-2',
          type: 'wait' as const,
          delay: { value: 2, unit: 'days' as const },
          content: {
            template: '',
            personalization: false,
          },
          conditions: {
            skipIf: 'accepted',
          },
        },
        {
          id: 'step-3',
          type: 'message' as const,
          delay: { value: 1, unit: 'hours' as const },
          content: {
            template: `Hi {{firstName}},

Thanks for connecting! 

I noticed {{specificDetail}} about {{company}}. 

{{contextualQuestion}}

Would you be open to a brief chat about how we're helping companies like yours {{benefit}}?

Best,
{{senderName}}`,
            personalization: true,
          },
          conditions: {
            skipIf: 'replied',
          },
        },
        {
          id: 'step-4',
          type: 'follow_up' as const,
          delay: { value: 3, unit: 'days' as const },
          content: {
            template: `Hi {{firstName}},

Just following up on my previous message.

{{additionalValue}}

Worth a quick 15-minute call this week?

{{senderName}}`,
            personalization: true,
          },
          conditions: {
            skipIf: 'replied',
          },
        },
        {
          id: 'step-5',
          type: 'follow_up' as const,
          delay: { value: 5, unit: 'days' as const },
          content: {
            template: `{{firstName}},

Last message - I know you're busy.

If this isn't a priority right now, no worries. Feel free to reach out if things change.

All the best,
{{senderName}}`,
            personalization: true,
          },
        },
      ],
      targeting: {
        linkedinSearch: {
          titles: ['VP Sales', 'Head of Sales', 'Sales Director'],
          companies: [],
          locations: ['United States'],
        },
      },
      limits: {
        dailyLimit: 20, // LinkedIn safe limit
        timeWindow: {
          start: '09:00',
          end: '17:00',
          timezone: 'America/New_York',
          weekdaysOnly: true,
        },
      },
      stats: {
        sent: 0,
        accepted: 0,
        replied: 0,
        opened: 0,
        clicked: 0,
        conversionRate: 0,
      },
    },
  },

  // 2. MESSENGER CAMPAIGNS
  messenger: {
    whatsapp: {
      id: 'msg-whatsapp',
      type: 'messenger' as const,
      name: 'WhatsApp Outreach Sequence',
      platform: 'whatsapp' as const,
      status: 'draft' as const,
      sequence: [
        {
          id: 'step-1',
          type: 'message' as const,
          delay: { value: 0, unit: 'hours' as const },
          content: {
            template: `Hi {{firstName}}! 👋

I'm {{senderName}} from {{company}}. 

{{personalizedHook}}

Mind if I share something that might help with {{painPoint}}?`,
            personalization: true,
            variants: [
              'Quick question about {{topic}}...',
              'Saw your post about {{topic}}...',
              'Following up from {{event}}...',
            ],
          },
        },
        {
          id: 'step-2',
          type: 'follow_up' as const,
          delay: { value: 1, unit: 'days' as const },
          content: {
            template: `Hey {{firstName}},

Just wanted to share this quick resource about {{topic}}: {{resourceLink}}

Thought it might be helpful for {{company}}.

Any questions, let me know!`,
            personalization: true,
          },
          conditions: {
            skipIf: 'replied',
          },
        },
        {
          id: 'step-3',
          type: 'follow_up' as const,
          delay: { value: 3, unit: 'days' as const },
          content: {
            template: `Hi {{firstName}},

Hope you had a chance to check out the resource.

Would you be interested in a quick 10-min call to discuss how this could work for {{company}}?

I have some time {{availability}}.`,
            personalization: true,
          },
          conditions: {
            skipIf: 'replied',
          },
        },
      ],
      targeting: {
        existingConnections: true,
        tags: ['warm-leads', 'webinar-attendees'],
      },
      limits: {
        dailyLimit: 50,
        timeWindow: {
          start: '10:00',
          end: '18:00',
          timezone: 'America/New_York',
          weekdaysOnly: true,
        },
      },
      stats: {
        sent: 0,
        accepted: 0,
        replied: 0,
        opened: 0,
        clicked: 0,
        conversionRate: 0,
      },
    },
    messenger: {
      id: 'msg-facebook',
      type: 'messenger' as const,
      name: 'Facebook Messenger Campaign',
      platform: 'messenger' as const,
      status: 'draft' as const,
      sequence: [
        {
          id: 'step-1',
          type: 'message' as const,
          delay: { value: 0, unit: 'hours' as const },
          content: {
            template: `Hey {{firstName}}! 

Saw you're part of {{groupName}}. 

Quick question - {{engagingQuestion}}?`,
            personalization: true,
          },
        },
        {
          id: 'step-2',
          type: 'follow_up' as const,
          delay: { value: 2, unit: 'days' as const },
          content: {
            template: `Hi again {{firstName}},

Based on what you mentioned about {{topic}}, thought this might help: {{resourceLink}}

Let me know if you'd like to learn more!`,
            personalization: true,
          },
          conditions: {
            skipIf: 'replied',
          },
        },
      ],
      targeting: {
        groupIds: [],
        existingConnections: false,
      },
      limits: {
        dailyLimit: 30,
        timeWindow: {
          start: '11:00',
          end: '19:00',
          timezone: 'America/New_York',
          weekdaysOnly: false,
        },
      },
      stats: {
        sent: 0,
        accepted: 0,
        replied: 0,
        opened: 0,
        clicked: 0,
        conversionRate: 0,
      },
    },
  },

  // 3. GROUP CAMPAIGNS
  group: {
    linkedinGroup: {
      id: 'group-linkedin',
      type: 'group' as const,
      name: 'LinkedIn Group Outreach',
      platform: 'linkedin' as const,
      status: 'draft' as const,
      sequence: [
        {
          id: 'step-1',
          type: 'message' as const,
          delay: { value: 0, unit: 'hours' as const },
          content: {
            template: `Hi {{firstName}},

I see we're both members of {{groupName}}. 

I noticed your post/comment about {{topic}} and wanted to share {{value}}.

Would you be interested in {{callToAction}}?

Best,
{{senderName}}`,
            personalization: true,
          },
        },
        {
          id: 'step-2',
          type: 'follow_up' as const,
          delay: { value: 4, unit: 'days' as const },
          content: {
            template: `Hey {{firstName}},

Following up on my previous message about {{topic}}.

We've helped {{similarCompany}} achieve {{result}}.

Open to a quick chat?`,
            personalization: true,
          },
          conditions: {
            skipIf: 'replied',
          },
        },
      ],
      targeting: {
        groupIds: [],
        groupMembers: true,
      },
      limits: {
        dailyLimit: 15, // Conservative for group outreach
        timeWindow: {
          start: '09:00',
          end: '17:00',
          timezone: 'America/New_York',
          weekdaysOnly: true,
        },
      },
      stats: {
        sent: 0,
        accepted: 0,
        replied: 0,
        opened: 0,
        clicked: 0,
        conversionRate: 0,
      },
    },
  },
};

// Unipile API Integration Service
export class UnipileService {
  private apiKey: string;
  private baseUrl: string = 'https://api.unipile.com/v1';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Send LinkedIn connection request via Unipile
   */
  async sendConnectionRequest(
    profileUrl: string,
    message: string,
    accountId: string
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/linkedin/invitations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Account-ID': accountId,
      },
      body: JSON.stringify({
        profile_url: profileUrl,
        message: message,
      }),
    });
    
    return response.json();
  }

  /**
   * Send message via Unipile (works for LinkedIn, WhatsApp, Messenger, etc.)
   */
  async sendMessage(
    platform: string,
    recipientId: string,
    message: string,
    accountId: string
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/messages/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Account-ID': accountId,
      },
      body: JSON.stringify({
        platform: platform,
        recipient_id: recipientId,
        message: message,
      }),
    });
    
    return response.json();
  }

  /**
   * Search LinkedIn profiles
   */
  async searchLinkedInProfiles(
    criteria: any,
    accountId: string,
    limit: number = 100
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/linkedin/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Account-ID': accountId,
      },
      body: JSON.stringify({
        ...criteria,
        limit: limit,
      }),
    });
    
    return response.json();
  }

  /**
   * Get conversation history
   */
  async getConversations(
    platform: string,
    accountId: string
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/conversations?platform=${platform}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Account-ID': accountId,
      },
    });
    
    return response.json();
  }

  /**
   * Check message status (opened, replied, etc.)
   */
  async getMessageStatus(
    messageId: string,
    accountId: string
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/messages/${messageId}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Account-ID': accountId,
      },
    });
    
    return response.json();
  }

  /**
   * Execute a campaign sequence
   */
  async executeCampaign(
    campaign: UnipileCampaign,
    contacts: any[],
    accountId: string
  ): Promise<void> {
    for (const contact of contacts) {
      for (const step of campaign.sequence) {
        // Wait if needed
        if (step.delay.value > 0) {
          await this.wait(step.delay.value, step.delay.unit);
        }

        // Check conditions
        if (step.conditions) {
          const shouldSkip = await this.checkCondition(
            step.conditions.skipIf,
            contact,
            accountId
          );
          if (shouldSkip) continue;
        }

        // Execute step
        switch (step.type) {
          case 'connection_request':
            await this.sendConnectionRequest(
              contact.linkedinUrl,
              this.personalizeMessage(step.content.template, contact),
              accountId
            );
            break;
          
          case 'message':
          case 'follow_up':
            await this.sendMessage(
              campaign.platform,
              contact.id,
              this.personalizeMessage(step.content.template, contact),
              accountId
            );
            break;
        }

        // Update stats
        await this.updateCampaignStats(campaign.id, step.id);
      }
    }
  }

  private personalizeMessage(template: string, contact: any): string {
    let message = template;
    Object.keys(contact).forEach(key => {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), contact[key] || '');
    });
    return message;
  }

  private async wait(value: number, unit: 'hours' | 'days'): Promise<void> {
    const ms = unit === 'hours' ? value * 3600000 : value * 86400000;
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  private async checkCondition(
    condition: string,
    contact: any,
    accountId: string
  ): Promise<boolean> {
    // Check if contact has replied, accepted, etc.
    const conversations = await this.getConversations(contact.platform, accountId);
    
    switch (condition) {
      case 'replied':
        return conversations.some((c: any) => 
          c.participant_id === contact.id && c.last_message_from === 'them'
        );
      case 'accepted':
        // Check if connection request was accepted
        return contact.connectionStatus === 'connected';
      default:
        return false;
    }
  }

  private async updateCampaignStats(campaignId: string, stepId: string): Promise<void> {
    // Update campaign statistics in database
    console.log(`Updating stats for campaign ${campaignId}, step ${stepId}`);
  }
}