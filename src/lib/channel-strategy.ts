// Channel Strategy - Clear separation between outbound and inbound channels
// LinkedIn + Email for outbound, Meta platforms for inbound customer service

export interface ChannelStrategy {
  type: 'outbound' | 'inbound';
  platform: string;
  purpose: string;
  limits: ChannelLimits;
  bestPractices: string[];
}

export interface ChannelLimits {
  daily: number;
  hourly?: number;
  perContact?: number;
  requiresOptIn: boolean;
  windowRestriction?: string;
}

// OUTBOUND CHANNELS - For prospecting and cold outreach
export const OUTBOUND_CHANNELS: ChannelStrategy[] = [
  {
    type: 'outbound',
    platform: 'linkedin',
    purpose: 'B2B prospecting and professional networking',
    limits: {
      daily: 50, // Connection requests + messages combined
      hourly: 10,
      perContact: 1, // One touchpoint per day per contact
      requiresOptIn: false,
      windowRestriction: 'Business hours recommended'
    },
    bestPractices: [
      'Personalize every connection request',
      'Research prospect before reaching out',
      'Wait 24-48 hours after connection to message',
      'Use professional tone and clear value proposition',
      'Limit to 3-4 follow-ups maximum'
    ]
  },
  {
    type: 'outbound',
    platform: 'email',
    purpose: 'Scalable outreach and detailed communication',
    limits: {
      daily: 200, // Conservative for good deliverability
      hourly: 50,
      perContact: 1,
      requiresOptIn: false, // But must comply with CAN-SPAM/GDPR
      windowRestriction: 'Business hours for better open rates'
    },
    bestPractices: [
      'Use verified email addresses only',
      'Include unsubscribe link',
      'Warm up new domains gradually',
      'Monitor bounce rates (<2%)',
      'Personalize subject lines and content',
      'A/B test for better performance'
    ]
  },
  {
    type: 'outbound',
    platform: 'twitter',
    purpose: 'Public engagement and thought leadership outreach',
    limits: {
      daily: 500, // Follows per day
      hourly: 50, // DMs per hour (if they follow you back)
      perContact: 1,
      requiresOptIn: false, // But DMs require follow-back or open DMs
      windowRestriction: 'Active hours vary by audience'
    },
    bestPractices: [
      'Engage publicly first (like, retweet, comment)',
      'Build relationship before DMing',
      'Keep initial messages short (280 char mindset)',
      'Use for B2C and tech-savvy B2B',
      'Monitor for brand mentions and jump in',
      'Best for: SaaS, crypto, tech, media, consumer brands'
    ]
  }
];

// HYBRID CHANNELS - Can be used for both outbound and inbound
export const HYBRID_CHANNELS: ChannelStrategy[] = [
  {
    type: 'outbound', // Can be both
    platform: 'telegram',
    purpose: 'Community building and customer communication',
    limits: {
      daily: 200, // Groups have higher limits
      hourly: 30,
      perContact: 1,
      requiresOptIn: false, // For groups; DMs need user to start conversation
      windowRestriction: 'None - 24/7 platform'
    },
    bestPractices: [
      'Great for crypto, tech, and international audiences',
      'Build community in groups first',
      'Use channels for broadcast messages',
      'Bots can automate responses',
      'Less strict than WhatsApp',
      'Popular in: Eastern Europe, Asia, crypto community'
    ]
  }
];

// INBOUND CHANNELS - For customer service and support
export const INBOUND_CHANNELS: ChannelStrategy[] = [
  {
    type: 'inbound',
    platform: 'whatsapp',
    purpose: 'Customer support and order updates',
    limits: {
      daily: 1000, // For responding to customer messages
      requiresOptIn: true,
      windowRestriction: '24-hour response window after customer message'
    },
    bestPractices: [
      'Respond quickly to customer inquiries',
      'Use for order confirmations and updates',
      'Provide support documentation',
      'Enable automated responses for common questions',
      'Never use for cold outreach'
    ]
  },
  {
    type: 'inbound',
    platform: 'messenger',
    purpose: 'Facebook page customer service',
    limits: {
      daily: 500,
      requiresOptIn: true,
      windowRestriction: '24-hour response window'
    },
    bestPractices: [
      'Set up auto-responses for off-hours',
      'Use for customer inquiries from Facebook',
      'Quick responses improve page rating',
      'Link to help documentation'
    ]
  },
  {
    type: 'inbound',
    platform: 'instagram',
    purpose: 'Respond to DMs and comments',
    limits: {
      daily: 500,
      requiresOptIn: true,
      windowRestriction: '24-hour response window'
    },
    bestPractices: [
      'Respond to story mentions',
      'Answer product questions',
      'Handle customer complaints privately',
      'Convert interested followers to customers'
    ]
  }
];

// Campaign Type Definitions
export interface CampaignType {
  id: string;
  name: string;
  description: string;
  channels: string[];
  workflow: CampaignStep[];
  recommendedFor: string[];
  notRecommendedFor: string[];
}

export interface CampaignStep {
  day: number;
  channel: string;
  action: string;
  template: string;
  condition?: string;
}

// RECOMMENDED CAMPAIGN TYPES
export const CAMPAIGN_TYPES: CampaignType[] = [
  {
    id: 'b2b-outreach',
    name: 'B2B Sales Outreach',
    description: 'LinkedIn connection + Email follow-up sequence',
    channels: ['linkedin', 'email'],
    workflow: [
      {
        day: 0,
        channel: 'linkedin',
        action: 'connection_request',
        template: 'Personalized connection request mentioning common ground'
      },
      {
        day: 2,
        channel: 'linkedin',
        action: 'message',
        template: 'Thank you for connecting + soft introduction',
        condition: 'if_connection_accepted'
      },
      {
        day: 5,
        channel: 'email',
        action: 'value_email',
        template: 'Share valuable resource or insight',
        condition: 'if_email_available'
      },
      {
        day: 8,
        channel: 'linkedin',
        action: 'follow_up',
        template: 'Check if they received email + offer call'
      },
      {
        day: 12,
        channel: 'email',
        action: 'case_study',
        template: 'Share relevant case study'
      },
      {
        day: 16,
        channel: 'email',
        action: 'final_follow_up',
        template: 'Final check-in with clear CTA'
      }
    ],
    recommendedFor: [
      'B2B sales',
      'Enterprise sales',
      'Consulting services',
      'SaaS products'
    ],
    notRecommendedFor: [
      'B2C products',
      'Mass market',
      'Impulse purchases'
    ]
  },
  {
    id: 'linkedin-only',
    name: 'LinkedIn Professional Networking',
    description: 'Pure LinkedIn campaign for building professional relationships',
    channels: ['linkedin'],
    workflow: [
      {
        day: 0,
        channel: 'linkedin',
        action: 'connection_request',
        template: 'Thoughtful, personalized connection request'
      },
      {
        day: 3,
        channel: 'linkedin',
        action: 'welcome_message',
        template: 'Thank you + ask about their challenges',
        condition: 'if_connection_accepted'
      },
      {
        day: 7,
        channel: 'linkedin',
        action: 'value_share',
        template: 'Share relevant article or resource'
      },
      {
        day: 14,
        channel: 'linkedin',
        action: 'soft_pitch',
        template: 'Mention how you might help'
      },
      {
        day: 21,
        channel: 'linkedin',
        action: 'meeting_request',
        template: 'Suggest brief call or coffee'
      }
    ],
    recommendedFor: [
      'Recruitment',
      'Partnership building',
      'Thought leadership',
      'High-touch sales'
    ],
    notRecommendedFor: [
      'High-volume sales',
      'Transactional products'
    ]
  },
  {
    id: 'email-nurture',
    name: 'Email Nurture Sequence',
    description: 'Email-only campaign for list nurturing',
    channels: ['email'],
    workflow: [
      {
        day: 0,
        channel: 'email',
        action: 'welcome',
        template: 'Welcome email with value proposition'
      },
      {
        day: 3,
        channel: 'email',
        action: 'education',
        template: 'Educational content about problem'
      },
      {
        day: 7,
        channel: 'email',
        action: 'case_study',
        template: 'Success story from similar company'
      },
      {
        day: 10,
        channel: 'email',
        action: 'soft_pitch',
        template: 'How we can help + social proof'
      },
      {
        day: 14,
        channel: 'email',
        action: 'urgency',
        template: 'Limited time offer or calendar link'
      },
      {
        day: 21,
        channel: 'email',
        action: 'breakup',
        template: 'Final email - staying in touch'
      }
    ],
    recommendedFor: [
      'Lead nurturing',
      'Event follow-up',
      'Content marketing',
      'Newsletter subscribers'
    ],
    notRecommendedFor: [
      'Cold prospects',
      'No email permission'
    ]
  }
];

// Inbound Response Templates
export const INBOUND_RESPONSE_TEMPLATES = {
  whatsapp: {
    welcome: "Hi! Thanks for reaching out. How can I help you today?",
    outOfHours: "Thanks for your message! Our team is currently offline. We'll respond within 24 hours.",
    orderStatus: "Let me check your order status. Can you please provide your order number?",
    support: "I understand your concern. Let me connect you with our support team."
  },
  messenger: {
    welcome: "Hey there! Thanks for messaging us. What can we help you with?",
    productInfo: "I'd be happy to help you learn more about our products!",
    pricing: "Our pricing information is available at [link]. Would you like me to explain any specific plan?",
    support: "Sorry to hear you're having issues. Let me get that sorted for you."
  },
  instagram: {
    dmResponse: "Thanks for your DM! We love hearing from our community 💜",
    productInquiry: "Great question about our products! Here's the info...",
    collaboration: "Thanks for your interest in collaboration. Please email partnerships@company.com",
    complaint: "We're sorry to hear about your experience. Let's resolve this - can you share more details?"
  }
};

// Channel Integration Helper
export class ChannelIntegrationHelper {
  /**
   * Determine if a channel should be used for outbound
   */
  static isOutboundChannel(channel: string): boolean {
    return OUTBOUND_CHANNELS.some(c => c.platform === channel);
  }

  /**
   * Determine if a channel should be used for inbound
   */
  static isInboundChannel(channel: string): boolean {
    return INBOUND_CHANNELS.some(c => c.platform === channel);
  }

  /**
   * Get recommended channels for a business type
   */
  static getRecommendedChannels(businessType: 'b2b' | 'b2c' | 'ecommerce' | 'saas'): {
    outbound: string[];
    inbound: string[];
  } {
    switch (businessType) {
      case 'b2b':
      case 'saas':
        return {
          outbound: ['linkedin', 'email'],
          inbound: ['email', 'linkedin'] // LinkedIn can be inbound too for B2B
        };
      
      case 'b2c':
      case 'ecommerce':
        return {
          outbound: ['email'],
          inbound: ['whatsapp', 'messenger', 'instagram', 'email']
        };
      
      default:
        return {
          outbound: ['email'],
          inbound: ['email']
        };
    }
  }

  /**
   * Validate campaign configuration
   */
  static validateCampaign(
    channels: string[],
    campaignType: 'cold_outreach' | 'warm_outreach' | 'customer_service'
  ): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for invalid channel usage
    channels.forEach(channel => {
      if (campaignType === 'cold_outreach') {
        if (this.isInboundChannel(channel) && !this.isOutboundChannel(channel)) {
          errors.push(`${channel} cannot be used for cold outreach - it's for customer service only`);
        }
      }
    });

    // Check for mixed strategies
    const hasOutbound = channels.some(c => this.isOutboundChannel(c));
    const hasInboundOnly = channels.some(c => 
      this.isInboundChannel(c) && !this.isOutboundChannel(c)
    );

    if (hasOutbound && hasInboundOnly) {
      warnings.push('Mixing outbound (LinkedIn/Email) with inbound-only channels (WhatsApp/Messenger) is not recommended');
    }

    // Specific warnings
    if (channels.includes('whatsapp') && campaignType !== 'customer_service') {
      errors.push('WhatsApp can only be used for customer service, not outreach');
    }

    if (channels.includes('instagram') && campaignType === 'cold_outreach') {
      errors.push('Instagram DMs cannot be used for cold outreach');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}