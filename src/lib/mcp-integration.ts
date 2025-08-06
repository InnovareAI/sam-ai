// MCP (Model Context Protocol) Integration System
// Connects Sam AI to external services via MCP servers

export interface MCPServer {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'data' | 'ai' | 'automation' | 'communication' | 'analytics' | 'storage';
  status: 'connected' | 'disconnected' | 'error';
  config: MCPConfig;
  capabilities: MCPCapability[];
  metrics?: {
    requestsToday: number;
    avgResponseTime: number;
    successRate: number;
  };
}

export interface MCPConfig {
  endpoint: string;
  apiKey?: string;
  authentication?: {
    type: 'oauth' | 'api_key' | 'basic' | 'custom';
    credentials?: Record<string, any>;
  };
  rateLimit?: {
    requests: number;
    period: 'second' | 'minute' | 'hour';
  };
}

export interface MCPCapability {
  id: string;
  name: string;
  description: string;
  method: string;
  parameters: MCPParameter[];
  returns: MCPReturn;
  examples?: MCPExample[];
}

export interface MCPParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: any;
}

export interface MCPReturn {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  schema?: any;
}

export interface MCPExample {
  name: string;
  request: Record<string, any>;
  response: any;
}

// Pre-configured MCP Server Integrations
export const MCP_SERVERS: MCPServer[] = [
  {
    id: 'apify',
    name: 'Apify',
    description: 'Web scraping and automation platform',
    icon: '🕷️',
    category: 'data',
    status: 'disconnected',
    config: {
      endpoint: 'https://api.apify.com/v2',
      authentication: {
        type: 'api_key',
      },
    },
    capabilities: [
      {
        id: 'scrape_linkedin',
        name: 'Scrape LinkedIn Profile',
        description: 'Extract comprehensive data from LinkedIn profiles',
        method: 'apify.actor.run',
        parameters: [
          {
            name: 'profileUrl',
            type: 'string',
            description: 'LinkedIn profile URL',
            required: true,
          },
          {
            name: 'includeCompany',
            type: 'boolean',
            description: 'Include company information',
            required: false,
            default: true,
          },
        ],
        returns: {
          type: 'object',
          description: 'Structured LinkedIn profile data',
          schema: {
            name: 'string',
            title: 'string',
            company: 'string',
            email: 'string',
            phone: 'string',
            skills: 'array',
            experience: 'array',
          },
        },
      },
      {
        id: 'scrape_company',
        name: 'Scrape Company Website',
        description: 'Extract company information from website',
        method: 'apify.actor.run',
        parameters: [
          {
            name: 'websiteUrl',
            type: 'string',
            description: 'Company website URL',
            required: true,
          },
          {
            name: 'depth',
            type: 'number',
            description: 'Crawl depth',
            required: false,
            default: 2,
          },
        ],
        returns: {
          type: 'object',
          description: 'Company data including contact info, employees, etc.',
        },
      },
      {
        id: 'monitor_competitors',
        name: 'Monitor Competitor Activity',
        description: 'Track competitor updates and changes',
        method: 'apify.actor.run',
        parameters: [
          {
            name: 'competitors',
            type: 'array',
            description: 'List of competitor domains',
            required: true,
          },
          {
            name: 'frequency',
            type: 'string',
            description: 'Monitoring frequency',
            required: false,
            default: 'daily',
          },
        ],
        returns: {
          type: 'array',
          description: 'List of detected changes and updates',
        },
      },
    ],
    metrics: {
      requestsToday: 156,
      avgResponseTime: 3200,
      successRate: 94.5,
    },
  },
  {
    id: 'clearbit',
    name: 'Clearbit',
    description: 'B2B data enrichment and intelligence',
    icon: '🎯',
    category: 'data',
    status: 'disconnected',
    config: {
      endpoint: 'https://api.clearbit.com',
      authentication: {
        type: 'api_key',
      },
    },
    capabilities: [
      {
        id: 'enrich_person',
        name: 'Enrich Person',
        description: 'Get detailed information about a person from email',
        method: 'clearbit.person.find',
        parameters: [
          {
            name: 'email',
            type: 'string',
            description: 'Email address',
            required: true,
          },
        ],
        returns: {
          type: 'object',
          description: 'Person profile with social, employment, and bio data',
        },
      },
      {
        id: 'enrich_company',
        name: 'Enrich Company',
        description: 'Get company data from domain',
        method: 'clearbit.company.find',
        parameters: [
          {
            name: 'domain',
            type: 'string',
            description: 'Company domain',
            required: true,
          },
        ],
        returns: {
          type: 'object',
          description: 'Company profile with industry, size, location, etc.',
        },
      },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Advanced AI models for text generation and analysis',
    icon: '🤖',
    category: 'ai',
    status: 'connected',
    config: {
      endpoint: 'https://api.openai.com/v1',
      authentication: {
        type: 'api_key',
      },
    },
    capabilities: [
      {
        id: 'generate_email',
        name: 'Generate Personalized Email',
        description: 'Create AI-powered personalized emails',
        method: 'openai.completions.create',
        parameters: [
          {
            name: 'context',
            type: 'object',
            description: 'Contact and campaign context',
            required: true,
          },
          {
            name: 'tone',
            type: 'string',
            description: 'Email tone',
            required: false,
            default: 'professional',
          },
        ],
        returns: {
          type: 'string',
          description: 'Generated email content',
        },
      },
      {
        id: 'analyze_sentiment',
        name: 'Analyze Reply Sentiment',
        description: 'Analyze sentiment of email replies',
        method: 'openai.completions.create',
        parameters: [
          {
            name: 'text',
            type: 'string',
            description: 'Email content to analyze',
            required: true,
          },
        ],
        returns: {
          type: 'object',
          description: 'Sentiment analysis with score and recommendations',
        },
      },
    ],
    metrics: {
      requestsToday: 892,
      avgResponseTime: 1200,
      successRate: 99.2,
    },
  },
  {
    id: 'hunter',
    name: 'Hunter.io',
    description: 'Email finder and verification',
    icon: '📧',
    category: 'data',
    status: 'disconnected',
    config: {
      endpoint: 'https://api.hunter.io/v2',
      authentication: {
        type: 'api_key',
      },
    },
    capabilities: [
      {
        id: 'find_email',
        name: 'Find Email',
        description: 'Find email address from name and domain',
        method: 'hunter.email.find',
        parameters: [
          {
            name: 'firstName',
            type: 'string',
            description: 'First name',
            required: true,
          },
          {
            name: 'lastName',
            type: 'string',
            description: 'Last name',
            required: true,
          },
          {
            name: 'domain',
            type: 'string',
            description: 'Company domain',
            required: true,
          },
        ],
        returns: {
          type: 'object',
          description: 'Email address with confidence score',
        },
      },
      {
        id: 'verify_email',
        name: 'Verify Email',
        description: 'Check if email address is valid',
        method: 'hunter.email.verify',
        parameters: [
          {
            name: 'email',
            type: 'string',
            description: 'Email to verify',
            required: true,
          },
        ],
        returns: {
          type: 'object',
          description: 'Verification status and deliverability score',
        },
      },
    ],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and notifications',
    icon: '💬',
    category: 'communication',
    status: 'connected',
    config: {
      endpoint: 'https://slack.com/api',
      authentication: {
        type: 'oauth',
      },
    },
    capabilities: [
      {
        id: 'send_notification',
        name: 'Send Notification',
        description: 'Send message to Slack channel',
        method: 'slack.chat.postMessage',
        parameters: [
          {
            name: 'channel',
            type: 'string',
            description: 'Channel ID or name',
            required: true,
          },
          {
            name: 'message',
            type: 'string',
            description: 'Message content',
            required: true,
          },
        ],
        returns: {
          type: 'object',
          description: 'Message delivery confirmation',
        },
      },
    ],
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect to 5000+ apps',
    icon: '⚡',
    category: 'automation',
    status: 'disconnected',
    config: {
      endpoint: 'https://hooks.zapier.com',
      authentication: {
        type: 'api_key',
      },
    },
    capabilities: [
      {
        id: 'trigger_zap',
        name: 'Trigger Zap',
        description: 'Trigger a Zapier workflow',
        method: 'zapier.webhook.trigger',
        parameters: [
          {
            name: 'zapId',
            type: 'string',
            description: 'Zap webhook ID',
            required: true,
          },
          {
            name: 'data',
            type: 'object',
            description: 'Data to send to Zap',
            required: true,
          },
        ],
        returns: {
          type: 'object',
          description: 'Zap execution status',
        },
      },
    ],
  },
];

// MCP Integration Service
export class MCPIntegrationService {
  private servers: Map<string, MCPServer> = new Map();
  private connections: Map<string, WebSocket> = new Map();

  constructor() {
    // Initialize with pre-configured servers
    MCP_SERVERS.forEach(server => {
      this.servers.set(server.id, server);
    });
  }

  // Connect to an MCP server
  async connect(serverId: string, config: Partial<MCPConfig>): Promise<boolean> {
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`Server ${serverId} not found`);
    }

    try {
      // Update server config
      server.config = { ...server.config, ...config };
      
      // In production, establish WebSocket connection
      // For now, simulate connection
      console.log(`Connecting to ${server.name}...`, server.config);
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      server.status = 'connected';
      this.servers.set(serverId, server);
      
      return true;
    } catch (error) {
      server.status = 'error';
      throw error;
    }
  }

  // Execute an MCP capability
  async execute(
    serverId: string,
    capabilityId: string,
    parameters: Record<string, any>
  ): Promise<any> {
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`Server ${serverId} not found`);
    }

    if (server.status !== 'connected') {
      throw new Error(`Server ${server.name} is not connected`);
    }

    const capability = server.capabilities.find(c => c.id === capabilityId);
    if (!capability) {
      throw new Error(`Capability ${capabilityId} not found`);
    }

    // Validate parameters
    for (const param of capability.parameters) {
      if (param.required && !(param.name in parameters)) {
        throw new Error(`Missing required parameter: ${param.name}`);
      }
    }

    // In production, send request to MCP server
    // For now, return mock data based on capability
    console.log(`Executing ${server.name}.${capability.name}`, parameters);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return mock data based on capability
    return this.getMockResponse(serverId, capabilityId, parameters);
  }

  // Get mock response for demo
  private getMockResponse(serverId: string, capabilityId: string, parameters: any): any {
    const mockResponses: Record<string, any> = {
      'apify.scrape_linkedin': {
        name: 'John Smith',
        title: 'VP of Sales',
        company: 'TechCorp Inc',
        email: 'john.smith@techcorp.com',
        phone: '+1 555-0123',
        location: 'San Francisco, CA',
        skills: ['Sales', 'SaaS', 'Enterprise Software', 'Team Leadership'],
        experience: [
          {
            title: 'VP of Sales',
            company: 'TechCorp Inc',
            duration: '2020 - Present',
          },
          {
            title: 'Director of Sales',
            company: 'SalesForce',
            duration: '2018 - 2020',
          },
        ],
      },
      'apify.scrape_company': {
        name: 'TechCorp Inc',
        domain: 'techcorp.com',
        industry: 'Software',
        size: '500-1000 employees',
        founded: 2015,
        revenue: '$50-100M',
        technologies: ['React', 'Node.js', 'AWS', 'PostgreSQL'],
        socialProfiles: {
          linkedin: 'linkedin.com/company/techcorp',
          twitter: '@techcorp',
        },
      },
      'clearbit.enrich_person': {
        id: '123456',
        name: {
          fullName: 'John Smith',
          givenName: 'John',
          familyName: 'Smith',
        },
        email: 'john.smith@techcorp.com',
        location: 'San Francisco, CA',
        bio: 'Sales leader with 10+ years experience',
        employment: {
          domain: 'techcorp.com',
          name: 'TechCorp Inc',
          title: 'VP of Sales',
          role: 'sales',
          seniority: 'vp',
        },
        linkedin: {
          handle: 'john-smith',
        },
      },
      'openai.generate_email': `Subject: Quick question about your sales process

Hi ${parameters.context?.firstName || 'there'},

I noticed ${parameters.context?.company || 'your company'} has been growing rapidly, and I wanted to reach out because we've helped similar companies streamline their sales operations.

Our AI-powered CRM has helped teams like yours:
• Increase conversion rates by 35%
• Reduce time spent on admin tasks by 50%
• Improve forecast accuracy to 92%

Would you be open to a brief 15-minute call next week to see if we could help ${parameters.context?.company || 'your team'} achieve similar results?

Best regards,
Sarah`,
      'hunter.find_email': {
        email: `${parameters.firstName?.toLowerCase()}.${parameters.lastName?.toLowerCase()}@${parameters.domain}`,
        confidence: 95,
        sources: [
          {
            domain: parameters.domain,
            uri: `https://${parameters.domain}/team`,
            extracted_on: new Date().toISOString(),
          },
        ],
      },
    };

    const key = `${serverId}.${capabilityId}`;
    return mockResponses[key] || { success: true, data: 'Mock response' };
  }

  // Get all available servers
  getServers(): MCPServer[] {
    return Array.from(this.servers.values());
  }

  // Get server by ID
  getServer(serverId: string): MCPServer | undefined {
    return this.servers.get(serverId);
  }

  // Disconnect from server
  async disconnect(serverId: string): Promise<void> {
    const server = this.servers.get(serverId);
    if (server) {
      server.status = 'disconnected';
      this.servers.set(serverId, server);
      
      // Close WebSocket if exists
      const connection = this.connections.get(serverId);
      if (connection) {
        connection.close();
        this.connections.delete(serverId);
      }
    }
  }

  // Data enrichment workflow
  async enrichContact(contact: {
    email?: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    linkedinUrl?: string;
  }): Promise<any> {
    const enrichedData: any = { ...contact };

    // Try multiple enrichment sources
    const enrichmentTasks = [];

    // Clearbit enrichment
    if (contact.email && this.servers.get('clearbit')?.status === 'connected') {
      enrichmentTasks.push(
        this.execute('clearbit', 'enrich_person', { email: contact.email })
          .then(data => ({ source: 'clearbit', data }))
          .catch(err => ({ source: 'clearbit', error: err.message }))
      );
    }

    // LinkedIn scraping via Apify
    if (contact.linkedinUrl && this.servers.get('apify')?.status === 'connected') {
      enrichmentTasks.push(
        this.execute('apify', 'scrape_linkedin', { profileUrl: contact.linkedinUrl })
          .then(data => ({ source: 'apify', data }))
          .catch(err => ({ source: 'apify', error: err.message }))
      );
    }

    // Hunter.io email finding
    if (!contact.email && contact.firstName && contact.lastName && contact.company) {
      const domain = contact.company.toLowerCase().replace(/\s+/g, '') + '.com';
      enrichmentTasks.push(
        this.execute('hunter', 'find_email', {
          firstName: contact.firstName,
          lastName: contact.lastName,
          domain,
        })
          .then(data => ({ source: 'hunter', data }))
          .catch(err => ({ source: 'hunter', error: err.message }))
      );
    }

    // Execute all enrichment tasks in parallel
    const results = await Promise.all(enrichmentTasks);

    // Merge enriched data
    results.forEach(result => {
      if (result.data && !result.error) {
        enrichedData[result.source] = result.data;
      }
    });

    return enrichedData;
  }
}