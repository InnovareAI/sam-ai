// Platform API Limits and Best Practices
// Helps users stay within safe limits to avoid account restrictions

export interface PlatformLimits {
  platform: string;
  daily: {
    connectionRequests?: number;
    messages?: number;
    profileViews?: number;
    groupMessages?: number;
  };
  weekly: {
    connectionRequests?: number;
    messages?: number;
  };
  cooldown: {
    betweenActions: number; // minutes
    afterAcceptance: number; // hours before first message
  };
  bestPractices: string[];
  warnings: string[];
}

export const PLATFORM_LIMITS: Record<string, PlatformLimits> = {
  linkedin: {
    platform: 'LinkedIn',
    daily: {
      connectionRequests: 20, // Conservative limit (LinkedIn allows ~100/week)
      messages: 50, // Direct messages to connections
      profileViews: 150,
      groupMessages: 15, // Very conservative for group outreach
    },
    weekly: {
      connectionRequests: 100,
      messages: 250,
    },
    cooldown: {
      betweenActions: 2, // 2 minutes between actions
      afterAcceptance: 1, // Wait 1 hour after connection accepted
    },
    bestPractices: [
      'Personalize every connection request',
      'Wait 24-48 hours after connection before first message',
      'Spread actions throughout business hours',
      'Avoid sending on weekends for B2B',
      'Use different message templates to avoid detection',
    ],
    warnings: [
      'Exceeding 100 connection requests/week risks restrictions',
      'Automated behavior patterns can trigger LinkedIn detection',
      'Account warm-up needed for new LinkedIn accounts (start with 5-10/day)',
    ],
  },
  
  whatsapp: {
    platform: 'WhatsApp Business',
    daily: {
      messages: 256, // WhatsApp Business API tier 1 limit
    },
    weekly: {
      messages: 1000,
    },
    cooldown: {
      betweenActions: 1,
      afterAcceptance: 0,
    },
    bestPractices: [
      'Only message users who have opted in',
      'Include unsubscribe option in campaigns',
      'Avoid promotional content without consent',
      'Use official WhatsApp Business API',
    ],
    warnings: [
      'WhatsApp bans accounts for spam behavior',
      'Requires phone number verification',
      'Messages to non-contacts may not deliver',
    ],
  },

  messenger: {
    platform: 'Facebook Messenger',
    daily: {
      messages: 100, // Conservative for Messenger
    },
    weekly: {
      messages: 500,
    },
    cooldown: {
      betweenActions: 1,
      afterAcceptance: 0,
    },
    bestPractices: [
      'Follow 24-hour messaging window rules',
      'Use message tags appropriately',
      'Respect user preferences',
    ],
    warnings: [
      'Facebook monitors for spam patterns',
      'Requires Facebook Page for business messaging',
    ],
  },

  telegram: {
    platform: 'Telegram',
    daily: {
      messages: 200,
      groupMessages: 20,
    },
    weekly: {
      messages: 1000,
    },
    cooldown: {
      betweenActions: 0.5,
      afterAcceptance: 0,
    },
    bestPractices: [
      'Use Telegram Bot API for automation',
      'Respect group rules and admins',
      'Avoid mass messaging to prevent spam reports',
    ],
    warnings: [
      'Telegram can limit accounts for spam',
      'Bot messages require user to start conversation first',
    ],
  },

  email: {
    platform: 'Email',
    daily: {
      messages: 500, // Depends on email provider
    },
    weekly: {
      messages: 2500,
    },
    cooldown: {
      betweenActions: 0.1,
      afterAcceptance: 0,
    },
    bestPractices: [
      'Warm up new domains/IPs gradually',
      'Use SPF, DKIM, and DMARC authentication',
      'Monitor bounce rates and spam complaints',
      'Clean email lists regularly',
    ],
    warnings: [
      'High bounce rates damage sender reputation',
      'Spam complaints can blacklist your domain',
      'ISPs monitor sending patterns',
    ],
  },
};

// Smart limit calculator based on account age and history
export class SmartLimitCalculator {
  /**
   * Calculate safe daily limits based on account factors
   */
  static calculateSafeLimits(
    platform: string,
    accountAge: number, // days
    previousViolations: number = 0,
    isWarmedUp: boolean = false
  ): PlatformLimits {
    const baseLimits = PLATFORM_LIMITS[platform];
    if (!baseLimits) return PLATFORM_LIMITS.linkedin; // default

    // Copy base limits
    const adjustedLimits = JSON.parse(JSON.stringify(baseLimits));

    // Adjust based on account age
    let multiplier = 1;
    
    if (accountAge < 7) {
      multiplier = 0.2; // 20% for brand new accounts
    } else if (accountAge < 30) {
      multiplier = 0.5; // 50% for accounts < 1 month
    } else if (accountAge < 90) {
      multiplier = 0.75; // 75% for accounts < 3 months
    } else {
      multiplier = 1; // Full limits for mature accounts
    }

    // Further reduce if there were violations
    if (previousViolations > 0) {
      multiplier *= Math.max(0.3, 1 - (previousViolations * 0.2));
    }

    // Apply warm-up boost if applicable
    if (isWarmedUp && accountAge > 30) {
      multiplier = Math.min(1.2, multiplier * 1.1); // 10% boost for warmed accounts
    }

    // Apply multiplier to limits
    if (adjustedLimits.daily.connectionRequests) {
      adjustedLimits.daily.connectionRequests = Math.floor(
        adjustedLimits.daily.connectionRequests * multiplier
      );
    }
    if (adjustedLimits.daily.messages) {
      adjustedLimits.daily.messages = Math.floor(
        adjustedLimits.daily.messages * multiplier
      );
    }

    return adjustedLimits;
  }

  /**
   * Check if action would exceed limits
   */
  static wouldExceedLimit(
    platform: string,
    actionType: 'connectionRequest' | 'message' | 'groupMessage',
    currentDayCount: number,
    currentWeekCount: number
  ): { exceeded: boolean; message?: string } {
    const limits = PLATFORM_LIMITS[platform];
    if (!limits) return { exceeded: false };

    // Map action types to limit keys
    const limitKey = actionType === 'connectionRequest' ? 'connectionRequests' : 
                     actionType === 'groupMessage' ? 'groupMessages' : 'messages';

    // Check daily limit
    const dailyLimit = limits.daily[limitKey];
    if (dailyLimit && currentDayCount >= dailyLimit) {
      return {
        exceeded: true,
        message: `Daily limit of ${dailyLimit} ${actionType}s reached for ${platform}`,
      };
    }

    // Check weekly limit
    const weeklyLimit = limits.weekly[limitKey];
    if (weeklyLimit && currentWeekCount >= weeklyLimit) {
      return {
        exceeded: true,
        message: `Weekly limit of ${weeklyLimit} ${actionType}s reached for ${platform}`,
      };
    }

    return { exceeded: false };
  }

  /**
   * Get recommended campaign schedule
   */
  static getRecommendedSchedule(
    platform: string,
    totalContacts: number,
    campaignDuration: number // days
  ): {
    contactsPerDay: number;
    estimatedCompletion: number; // days
    schedule: Array<{ hour: number; count: number }>;
    warning?: string;
  } {
    const limits = PLATFORM_LIMITS[platform];
    if (!limits) {
      return {
        contactsPerDay: 10,
        estimatedCompletion: totalContacts / 10,
        schedule: [{ hour: 10, count: 10 }],
      };
    }

    // Use the most restrictive limit
    const dailyLimit = Math.min(
      limits.daily.connectionRequests || 1000,
      limits.daily.messages || 1000
    );

    // Calculate optimal contacts per day
    const contactsPerDay = Math.min(
      dailyLimit,
      Math.ceil(totalContacts / campaignDuration)
    );

    const estimatedCompletion = Math.ceil(totalContacts / contactsPerDay);

    // Distribute throughout business hours (9 AM - 5 PM)
    const businessHours = [9, 10, 11, 12, 14, 15, 16, 17];
    const contactsPerHour = Math.max(1, Math.floor(contactsPerDay / businessHours.length));
    const schedule = businessHours.map(hour => ({
      hour,
      count: contactsPerHour,
    }));

    // Add remainder to first slot
    const remainder = contactsPerDay - (contactsPerHour * businessHours.length);
    if (remainder > 0) {
      schedule[0].count += remainder;
    }

    let warning;
    if (estimatedCompletion > campaignDuration) {
      warning = `Campaign will take ${estimatedCompletion} days to complete safely (longer than planned ${campaignDuration} days)`;
    }

    return {
      contactsPerDay,
      estimatedCompletion,
      schedule,
      warning,
    };
  }
}

// Campaign mixing validator
export class CampaignMixValidator {
  /**
   * Validate if channels can be mixed in same campaign
   */
  static canMixChannels(
    channels: string[]
  ): { 
    valid: boolean; 
    warnings: string[];
    recommendation?: string;
  } {
    const warnings: string[] = [];
    
    // Check for risky combinations
    if (channels.includes('linkedin') && channels.includes('email')) {
      warnings.push(
        'LinkedIn + Email: Ensure you have email addresses from outside LinkedIn'
      );
    }

    if (channels.includes('whatsapp') && !channels.includes('email')) {
      warnings.push(
        'WhatsApp requires phone numbers - ensure you have consent to message'
      );
    }

    if (channels.length > 2) {
      warnings.push(
        'Multi-channel campaigns are complex - consider separate campaigns per channel'
      );
    }

    // Platform-specific checks
    const hasMessaging = channels.some(c => 
      ['whatsapp', 'messenger', 'telegram'].includes(c)
    );
    const hasProfessional = channels.includes('linkedin') || channels.includes('email');

    if (hasMessaging && hasProfessional) {
      warnings.push(
        'Mixing professional (LinkedIn/Email) with messaging apps may seem unprofessional'
      );
    }

    const recommendation = channels.length === 1 
      ? `Single-channel campaign is safest for ${channels[0]}`
      : 'Consider running separate campaigns per channel for better control';

    return {
      valid: true, // Always allow, but warn
      warnings,
      recommendation,
    };
  }

  /**
   * Get optimal channel sequence
   */
  static getOptimalSequence(
    channels: string[],
    campaignGoal: 'awareness' | 'engagement' | 'conversion'
  ): Array<{ channel: string; delay: number; reason: string }> {
    const sequence: Array<{ channel: string; delay: number; reason: string }> = [];

    if (campaignGoal === 'awareness') {
      // Start with least intrusive
      if (channels.includes('linkedin')) {
        sequence.push({
          channel: 'linkedin',
          delay: 0,
          reason: 'Profile view and connection request for soft introduction',
        });
      }
      if (channels.includes('email')) {
        sequence.push({
          channel: 'email',
          delay: 3,
          reason: 'Follow up with valuable content via email',
        });
      }
    } else if (campaignGoal === 'engagement') {
      // Start with most engaging
      if (channels.includes('linkedin')) {
        sequence.push({
          channel: 'linkedin',
          delay: 0,
          reason: 'Direct professional engagement',
        });
      }
      if (channels.includes('whatsapp')) {
        sequence.push({
          channel: 'whatsapp',
          delay: 7,
          reason: 'More personal follow-up for engaged prospects',
        });
      }
    } else {
      // Conversion - be more aggressive
      if (channels.includes('email')) {
        sequence.push({
          channel: 'email',
          delay: 0,
          reason: 'Professional introduction with clear value prop',
        });
      }
      if (channels.includes('linkedin')) {
        sequence.push({
          channel: 'linkedin',
          delay: 2,
          reason: 'LinkedIn for social proof and connection',
        });
      }
      if (channels.includes('whatsapp')) {
        sequence.push({
          channel: 'whatsapp',
          delay: 5,
          reason: 'Quick close via instant messaging',
        });
      }
    }

    return sequence;
  }
}