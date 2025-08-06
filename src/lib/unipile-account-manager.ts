// Unipile Account Manager - Simple LinkedIn & Email Integration
// Focus on safety and professional outreach

export interface UnipileAccount {
  id: string;
  userId: string;
  accountType: 'LINKEDIN' | 'GMAIL' | 'OUTLOOK' | 'IMAP';
  accountId: string;
  status: 'OK' | 'CREDENTIALS_REQUIRED' | 'DISCONNECTED' | 'ERROR';
  email?: string;
  name?: string;
  profileUrl?: string;
  lastUpdate: Date;
  createdOn: Date;
  limits?: AccountLimits;
}

export interface AccountLimits {
  daily: {
    connectionsRemaining: number;
    messagesRemaining: number;
    emailsRemaining: number;
  };
  resetAt: Date;
}

export class UnipileAccountManager {
  private apiKey: string;
  private baseUrl: string = 'https://api.unipile.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generate hosted auth link for connecting accounts
   * This is the safest and simplest method
   */
  async createHostedAuthLink(
    accountType: 'LINKEDIN' | 'GMAIL' | 'OUTLOOK',
    userId: string,
    redirectUrl: string
  ): Promise<{ authUrl: string; sessionId: string }> {
    const response = await fetch(`${this.baseUrl}/hosted-auth/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: accountType,
        user_id: userId,
        redirect_url: redirectUrl,
        features: {
          // LinkedIn specific features
          ...(accountType === 'LINKEDIN' && {
            messaging: true,
            invitations: true,
            profile_visits: true,
            posts: false, // We don't need posting
            comments: false, // We don't need commenting
          }),
          // Email specific features
          ...((accountType === 'GMAIL' || accountType === 'OUTLOOK') && {
            send: true,
            receive: true,
            folders: true,
            attachments: true,
            tracking: true,
          }),
        },
      }),
    });

    const data = await response.json();
    return {
      authUrl: data.auth_url,
      sessionId: data.session_id,
    };
  }

  /**
   * Get connected accounts for a user
   */
  async getConnectedAccounts(userId: string): Promise<UnipileAccount[]> {
    const response = await fetch(`${this.baseUrl}/accounts?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    const accounts = await response.json();
    
    return accounts.map((account: any) => ({
      id: account.id,
      userId: userId,
      accountType: account.type,
      accountId: account.account_id,
      status: account.status,
      email: account.email,
      name: account.name,
      profileUrl: account.profile_url,
      lastUpdate: new Date(account.last_update),
      createdOn: new Date(account.created_on),
      limits: this.calculateDailyLimits(account),
    }));
  }

  /**
   * Check account health and limits
   */
  async checkAccountHealth(accountId: string): Promise<{
    healthy: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const response = await fetch(`${this.baseUrl}/accounts/${accountId}/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Account-ID': accountId,
      },
    });

    const health = await response.json();
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check connection status
    if (health.status !== 'OK') {
      issues.push(`Account status: ${health.status}`);
      if (health.status === 'CREDENTIALS_REQUIRED') {
        recommendations.push('Re-authenticate the account');
      }
    }

    // Check rate limits
    if (health.rate_limit_exceeded) {
      issues.push('Rate limits exceeded');
      recommendations.push('Reduce daily sending volume');
    }

    // Check for restrictions
    if (health.restrictions) {
      issues.push(`Account restrictions: ${health.restrictions.join(', ')}`);
      recommendations.push('Follow platform best practices and reduce activity');
    }

    return {
      healthy: issues.length === 0,
      issues,
      recommendations,
    };
  }

  /**
   * Calculate remaining daily limits for an account
   */
  private calculateDailyLimits(account: any): AccountLimits {
    const now = new Date();
    const resetTime = new Date();
    resetTime.setHours(24, 0, 0, 0); // Reset at midnight

    // LinkedIn limits based on account type and age
    let connectionLimit = 20; // Conservative default
    let messageLimit = 50;
    let emailLimit = 100;

    if (account.type === 'LINKEDIN') {
      // Adjust based on account premium status
      if (account.premium) {
        connectionLimit = 30;
        messageLimit = 75;
      }
      
      // Adjust based on account age
      const accountAge = Math.floor((now.getTime() - new Date(account.created_on).getTime()) / (1000 * 60 * 60 * 24));
      if (accountAge > 90) {
        connectionLimit = Math.min(connectionLimit * 1.5, 50);
        messageLimit = Math.min(messageLimit * 1.5, 100);
      }
    } else if (account.type === 'GMAIL' || account.type === 'OUTLOOK') {
      emailLimit = 500; // Email has higher limits
    }

    // Subtract today's usage
    const connectionsUsed = account.daily_connections_sent || 0;
    const messagesUsed = account.daily_messages_sent || 0;
    const emailsUsed = account.daily_emails_sent || 0;

    return {
      daily: {
        connectionsRemaining: Math.max(0, connectionLimit - connectionsUsed),
        messagesRemaining: Math.max(0, messageLimit - messagesUsed),
        emailsRemaining: Math.max(0, emailLimit - emailsUsed),
      },
      resetAt: resetTime,
    };
  }

  /**
   * Disconnect an account
   */
  async disconnectAccount(accountId: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/accounts/${accountId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    return response.ok;
  }

  /**
   * Get account usage statistics
   */
  async getAccountStats(accountId: string, period: 'day' | 'week' | 'month' = 'day'): Promise<{
    connections: { sent: number; accepted: number; rate: number };
    messages: { sent: number; replied: number; rate: number };
    emails: { sent: number; opened: number; replied: number };
  }> {
    const response = await fetch(`${this.baseUrl}/accounts/${accountId}/stats?period=${period}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Account-ID': accountId,
      },
    });

    const stats = await response.json();
    
    return {
      connections: {
        sent: stats.connections_sent || 0,
        accepted: stats.connections_accepted || 0,
        rate: stats.connections_sent > 0 
          ? (stats.connections_accepted / stats.connections_sent) * 100 
          : 0,
      },
      messages: {
        sent: stats.messages_sent || 0,
        replied: stats.messages_replied || 0,
        rate: stats.messages_sent > 0 
          ? (stats.messages_replied / stats.messages_sent) * 100 
          : 0,
      },
      emails: {
        sent: stats.emails_sent || 0,
        opened: stats.emails_opened || 0,
        replied: stats.emails_replied || 0,
      },
    };
  }
}

// Campaign Channel Validator - LinkedIn + Email focus
export class CampaignChannelValidator {
  /**
   * Validate campaign channel combination
   */
  static validateChannels(
    channels: Array<'linkedin' | 'email'>,
    accounts: UnipileAccount[]
  ): {
    valid: boolean;
    errors: string[];
    warnings: string[];
    recommendations: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check if accounts exist for selected channels
    if (channels.includes('linkedin')) {
      const linkedinAccount = accounts.find(a => a.accountType === 'LINKEDIN' && a.status === 'OK');
      if (!linkedinAccount) {
        errors.push('No active LinkedIn account connected');
      } else {
        // Check LinkedIn limits
        if (linkedinAccount.limits?.daily.connectionsRemaining === 0) {
          warnings.push('LinkedIn daily connection limit reached');
        }
        if (linkedinAccount.limits?.daily.messagesRemaining < 10) {
          warnings.push('LinkedIn message limit nearly reached');
        }
      }
    }

    if (channels.includes('email')) {
      const emailAccount = accounts.find(a => 
        ['GMAIL', 'OUTLOOK', 'IMAP'].includes(a.accountType) && a.status === 'OK'
      );
      if (!emailAccount) {
        errors.push('No active email account connected');
      }
    }

    // Channel combination recommendations
    if (channels.includes('linkedin') && channels.includes('email')) {
      recommendations.push(
        'LinkedIn + Email is a powerful combination',
        'Use LinkedIn for initial connection, email for follow-ups',
        'Ensure email addresses are obtained ethically (not scraped from LinkedIn)'
      );
    } else if (channels.includes('linkedin') && !channels.includes('email')) {
      recommendations.push(
        'Consider adding email for better reach',
        'Email allows for longer, more detailed messages'
      );
    } else if (!channels.includes('linkedin') && channels.includes('email')) {
      recommendations.push(
        'Consider adding LinkedIn for warmer outreach',
        'LinkedIn provides social proof and context'
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      recommendations,
    };
  }

  /**
   * Get optimal campaign sequence for LinkedIn + Email
   */
  static getOptimalSequence(): Array<{
    step: number;
    channel: 'linkedin' | 'email';
    action: string;
    delay: string;
    template: string;
  }> {
    return [
      {
        step: 1,
        channel: 'linkedin',
        action: 'connection_request',
        delay: '0 days',
        template: 'Personalized connection request with context',
      },
      {
        step: 2,
        channel: 'linkedin',
        action: 'profile_view',
        delay: '1 day',
        template: 'View profile to show interest',
      },
      {
        step: 3,
        channel: 'linkedin',
        action: 'welcome_message',
        delay: '2 days (after acceptance)',
        template: 'Thank you for connecting + soft value proposition',
      },
      {
        step: 4,
        channel: 'email',
        action: 'value_email',
        delay: '5 days',
        template: 'Valuable content related to their industry/role',
      },
      {
        step: 5,
        channel: 'linkedin',
        action: 'follow_up',
        delay: '7 days',
        template: 'Check if they received the email + offer help',
      },
      {
        step: 6,
        channel: 'email',
        action: 'case_study',
        delay: '10 days',
        template: 'Share relevant case study or success story',
      },
      {
        step: 7,
        channel: 'linkedin',
        action: 'final_message',
        delay: '14 days',
        template: 'Final check-in with clear CTA',
      },
    ];
  }
}