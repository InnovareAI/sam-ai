// User Context from Agent Onboarding Interview
// This data is collected during the onboarding process and used throughout the platform

export interface UserBusinessContext {
  // Company Information
  company: {
    name: string;
    website: string;
    industry: string;
    size: 'startup' | 'smb' | 'mid-market' | 'enterprise';
    stage?: 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c' | 'growth' | 'public';
  };

  // Ideal Customer Profile (ICP)
  icp: {
    industries: string[];
    companySize: {
      min: number;
      max: number;
    };
    geography: string[];
    titles: string[];
    departments: string[];
    technologies?: string[];
    triggers: string[]; // Events that indicate buying intent
    characteristics: string[]; // Other qualifying factors
  };

  // Pain Points & Solutions
  painPoints: {
    primary: string;
    secondary: string[];
    symptoms: string[]; // How these pains manifest
    impact: string; // Business impact if not solved
  };

  // Unique Value Proposition (UVP)
  uvp: {
    elevator: string; // 30-second pitch
    oneLinePitch: string; // Single sentence
    differentiators: string[];
    competitiveAdvantages: string[];
    proofPoints: Array<{
      metric: string;
      value: string;
      context: string;
    }>;
  };

  // Case Studies & Social Proof
  socialProof: {
    caseStudies: Array<{
      client: string;
      industry: string;
      problem: string;
      solution: string;
      result: string;
      metrics: string;
    }>;
    testimonials: Array<{
      name: string;
      title: string;
      company: string;
      quote: string;
    }>;
    logos: string[];
    awards: string[];
  };

  // Messaging & Tone
  messaging: {
    tone: 'professional' | 'casual' | 'technical' | 'friendly' | 'executive';
    keywords: string[]; // Important terms to use
    avoidWords: string[]; // Terms to avoid
    valueProps: string[]; // Key benefits to emphasize
    objectionHandling: Record<string, string>; // Common objections and responses
  };

  // Product/Service Details
  product: {
    name: string;
    category: string;
    pricing: {
      model: 'subscription' | 'one-time' | 'usage-based' | 'enterprise';
      startingPrice?: string;
      averageDealSize?: string;
    };
    implementation: {
      timeframe: string;
      complexity: 'simple' | 'moderate' | 'complex';
      requiresIntegration: boolean;
    };
    competitors: string[];
  };

  // Sales Process
  salesProcess: {
    averageSalesCycle: number; // days
    decisionMakers: string[]; // Titles involved in decision
    typicalObjections: string[];
    qualificationCriteria: string[]; // BANT, MEDDIC, etc.
    idealNextStep: string; // Demo, trial, consultation, etc.
  };

  // Content & Resources
  resources: {
    whitepapers: Array<{ title: string; url: string; topic: string }>;
    caseStudies: Array<{ title: string; url: string; industry: string }>;
    demos: Array<{ title: string; url: string; type: string }>;
    webinars: Array<{ title: string; url: string; date: string }>;
    calculators: Array<{ title: string; url: string; purpose: string }>;
  };

  // Campaign Preferences
  campaignPreferences: {
    aggressiveness: 'conservative' | 'moderate' | 'aggressive';
    followUpCount: number;
    channelPreference: 'linkedin-heavy' | 'email-heavy' | 'balanced';
    personalizationLevel: 'low' | 'medium' | 'high';
    complianceRequirements: string[]; // GDPR, CCPA, etc.
  };
}

// Example of populated context (from onboarding)
export const EXAMPLE_USER_CONTEXT: UserBusinessContext = {
  company: {
    name: "DataSync Pro",
    website: "https://datasyncpro.com",
    industry: "SaaS",
    size: "smb",
    stage: "series-a"
  },
  icp: {
    industries: ["SaaS", "E-commerce", "FinTech"],
    companySize: { min: 50, max: 500 },
    geography: ["North America", "Western Europe"],
    titles: ["VP Engineering", "CTO", "Director of Engineering", "Head of Data"],
    departments: ["Engineering", "Data", "IT"],
    technologies: ["AWS", "PostgreSQL", "Snowflake"],
    triggers: [
      "Recent funding round",
      "Hiring data engineers",
      "Data breach news",
      "New CTO/VP Engineering"
    ],
    characteristics: [
      "Multiple data sources",
      "Real-time requirements",
      "Compliance needs"
    ]
  },
  painPoints: {
    primary: "Data silos preventing real-time insights",
    secondary: [
      "Manual data synchronization",
      "Data quality issues",
      "Compliance challenges"
    ],
    symptoms: [
      "Delayed reporting",
      "Inconsistent data across systems",
      "Manual CSV exports"
    ],
    impact: "Lost revenue from delayed decisions, compliance risks"
  },
  uvp: {
    elevator: "DataSync Pro eliminates data silos by providing real-time, bi-directional sync across all your business systems with zero engineering effort.",
    oneLinePitch: "Real-time data sync across all your tools in 5 minutes",
    differentiators: [
      "No-code setup",
      "Real-time sync (not batch)",
      "Bi-directional updates",
      "SOC 2 compliant"
    ],
    competitiveAdvantages: [
      "10x faster than Zapier",
      "Half the cost of Fivetran",
      "No engineering required unlike Airbyte"
    ],
    proofPoints: [
      {
        metric: "Implementation Time",
        value: "5 minutes",
        context: "vs 3 weeks industry average"
      },
      {
        metric: "Data Freshness",
        value: "< 1 second",
        context: "Real-time sync"
      },
      {
        metric: "ROI",
        value: "300%",
        context: "Average in first 6 months"
      }
    ]
  },
  socialProof: {
    caseStudies: [
      {
        client: "TechCorp",
        industry: "SaaS",
        problem: "6-hour delay in sales data",
        solution: "Real-time Salesforce-Snowflake sync",
        result: "Instant sales visibility",
        metrics: "25% faster deal closure"
      }
    ],
    testimonials: [
      {
        name: "Sarah Chen",
        title: "VP Engineering",
        company: "FastGrow SaaS",
        quote: "DataSync Pro saved our engineering team 40 hours per week"
      }
    ],
    logos: ["TechCorp", "FastGrow", "DataFirst Inc"],
    awards: ["G2 Leader 2024", "Product Hunt #1"]
  },
  messaging: {
    tone: "technical",
    keywords: ["real-time", "sync", "integration", "API", "webhooks"],
    avoidWords: ["cheap", "easy", "simple"],
    valueProps: [
      "Save engineering time",
      "Real-time insights",
      "Data consistency",
      "Compliance ready"
    ],
    objectionHandling: {
      "We built this in-house": "In-house solutions cost 10x more to maintain",
      "Too expensive": "ROI in 2 months, costs less than one engineer hour/week",
      "Security concerns": "SOC 2 Type II certified, encrypted at rest and in transit"
    }
  },
  product: {
    name: "DataSync Pro",
    category: "Data Integration Platform",
    pricing: {
      model: "subscription",
      startingPrice: "$500/month",
      averageDealSize: "$15,000/year"
    },
    implementation: {
      timeframe: "5 minutes",
      complexity: "simple",
      requiresIntegration: true
    },
    competitors: ["Zapier", "Fivetran", "Airbyte", "Stitch"]
  },
  salesProcess: {
    averageSalesCycle: 30,
    decisionMakers: ["VP Engineering", "CTO", "CFO"],
    typicalObjections: [
      "We have an in-house solution",
      "Security concerns",
      "Budget constraints"
    ],
    qualificationCriteria: [
      "Multiple data sources",
      "50+ employees",
      "Real-time requirements"
    ],
    idealNextStep: "Technical demo with engineering team"
  },
  resources: {
    whitepapers: [
      {
        title: "Real-time Data Sync Best Practices",
        url: "https://datasyncpro.com/whitepaper",
        topic: "Architecture"
      }
    ],
    caseStudies: [
      {
        title: "How TechCorp Achieved Real-time Analytics",
        url: "https://datasyncpro.com/techcorp",
        industry: "SaaS"
      }
    ],
    demos: [
      {
        title: "5-Minute Setup Demo",
        url: "https://datasyncpro.com/demo",
        type: "Interactive"
      }
    ],
    webinars: [],
    calculators: [
      {
        title: "ROI Calculator",
        url: "https://datasyncpro.com/roi",
        purpose: "Show cost savings"
      }
    ]
  },
  campaignPreferences: {
    aggressiveness: "moderate",
    followUpCount: 4,
    channelPreference: "balanced",
    personalizationLevel: "high",
    complianceRequirements: ["GDPR", "CCPA"]
  }
};

// Helper class to use context in campaign generation
export class ContextAwareCampaignGenerator {
  constructor(private context: UserBusinessContext) {}

  generatePersonalizedMessage(template: string, prospect: any): string {
    // Replace context-aware variables
    let message = template;
    
    // Company context
    message = message.replace('{{ourCompany}}', this.context.company.name);
    message = message.replace('{{ourProduct}}', this.context.product.name);
    message = message.replace('{{uvp}}', this.context.uvp.oneLinePitch);
    message = message.replace('{{primaryPainPoint}}', this.context.painPoints.primary);
    
    // Social proof
    const caseStudy = this.context.socialProof.caseStudies[0];
    if (caseStudy) {
      message = message.replace('{{similarCompany}}', caseStudy.client);
      message = message.replace('{{caseStudyResult}}', caseStudy.result);
      message = message.replace('{{caseStudyMetric}}', caseStudy.metrics);
    }
    
    // Value props
    const valueProp = this.context.uvp.differentiators[0];
    message = message.replace('{{keyDifferentiator}}', valueProp);
    
    // Proof points
    const proof = this.context.uvp.proofPoints[0];
    if (proof) {
      message = message.replace('{{proofMetric}}', `${proof.metric}: ${proof.value}`);
    }
    
    // Resources
    const resource = this.context.resources.caseStudies[0];
    if (resource) {
      message = message.replace('{{resourceLink}}', resource.url);
      message = message.replace('{{resourceTitle}}', resource.title);
    }
    
    // Prospect-specific
    message = message.replace('{{firstName}}', prospect.firstName);
    message = message.replace('{{company}}', prospect.company);
    message = message.replace('{{title}}', prospect.title);
    
    return message;
  }

  selectBestCaseStudy(prospect: any): any {
    // Match case study to prospect's industry
    return this.context.socialProof.caseStudies.find(
      cs => cs.industry === prospect.industry
    ) || this.context.socialProof.caseStudies[0];
  }

  determineIdealTiming(): { followUpDays: number[]; bestSendTime: string } {
    // Based on sales cycle and preferences
    const cycleLength = this.context.salesProcess.averageSalesCycle;
    const touchpoints = this.context.campaignPreferences.followUpCount;
    
    // Distribute touchpoints across sales cycle
    const interval = Math.floor(cycleLength / (touchpoints + 1));
    const followUpDays = [];
    for (let i = 1; i <= touchpoints; i++) {
      followUpDays.push(interval * i);
    }
    
    // Best time based on ICP
    const isExecutive = this.context.icp.titles.some(t => 
      t.includes('VP') || t.includes('Chief') || t.includes('Director')
    );
    
    return {
      followUpDays,
      bestSendTime: isExecutive ? '7:00 AM' : '10:00 AM'
    };
  }

  generateSubjectLines(campaignGoal: string): string[] {
    const company = '{{company}}';
    const painPoint = this.context.painPoints.primary;
    
    return [
      `Quick question about ${company}'s ${painPoint}`,
      `${this.context.uvp.proofPoints[0]?.metric} improvement for ${company}`,
      `${this.context.socialProof.caseStudies[0]?.client} achieved ${this.context.socialProof.caseStudies[0]?.metrics}`,
      `Is ${painPoint} still a priority for ${company}?`,
      `${company} + ${this.context.product.name} = ${this.context.uvp.proofPoints[0]?.value}`
    ];
  }
}