// RAG Integration for Sam AI Campaign Generation
// This connects the user's business context to campaign generation

import { UserBusinessContext } from './user-context';
import { supabase } from '@/integrations/supabase/client';

export interface RAGContext {
  userId: string;
  businessContext: UserBusinessContext;
  conversationHistory: ConversationEntry[];
  campaignHistory: CampaignResult[];
}

export interface ConversationEntry {
  id: string;
  timestamp: Date;
  topic: string;
  content: string;
  insights: string[];
}

export interface CampaignResult {
  id: string;
  name: string;
  performance: {
    responseRate: number;
    meetings: number;
    conversions: number;
  };
  bestPerformingMessage: string;
  learnings: string[];
}

export class RAGIntegration {
  private context: RAGContext | null = null;

  /**
   * Load user's complete business context from onboarding
   */
  async loadBusinessContext(userId: string): Promise<UserBusinessContext> {
    const { data, error } = await supabase
      .from('user_business_context')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.error('Error loading business context:', error);
      // Return example context as fallback
      return this.getExampleContext();
    }

    return data.context as UserBusinessContext;
  }

  /**
   * Generate personalized campaign using RAG context
   */
  async generateSmartCampaign(
    userId: string,
    targetDescription: string,
    prospects: any[]
  ): Promise<{
    messages: Array<{
      day: number;
      channel: 'linkedin' | 'email';
      subject?: string;
      content: string;
      reasoning: string;
      contextUsed: string[];
    }>;
    strategy: string;
    expectedOutcome: string;
  }> {
    const context = await this.loadBusinessContext(userId);
    
    // Analyze prospect characteristics
    const prospectAnalysis = this.analyzeProspects(prospects, context);
    
    // Select best case studies and proof points
    const relevantCaseStudies = this.selectRelevantCaseStudies(prospects, context);
    const keyDifferentiators = this.selectKeyDifferentiators(prospectAnalysis, context);
    
    // Generate personalized sequence
    const messages = this.generateMessageSequence(
      context,
      prospectAnalysis,
      relevantCaseStudies,
      keyDifferentiators
    );

    // Calculate expected outcome based on historical data
    const expectedOutcome = this.calculateExpectedOutcome(
      prospectAnalysis,
      context.campaignPreferences
    );

    return {
      messages,
      strategy: this.generateStrategy(prospectAnalysis, context),
      expectedOutcome
    };
  }

  /**
   * Analyze prospects to understand common characteristics
   */
  private analyzeProspects(prospects: any[], context: UserBusinessContext) {
    const industries = new Set(prospects.map(p => p.industry));
    const titles = new Set(prospects.map(p => p.title));
    const companySizes = prospects.map(p => p.employees);
    const avgSize = companySizes.reduce((a, b) => a + b, 0) / companySizes.length;
    
    const triggers = prospects
      .map(p => p.recentActivity)
      .filter(activity => 
        context.icp.triggers.some(trigger => 
          activity?.toLowerCase().includes(trigger.toLowerCase())
        )
      );

    return {
      industries: Array.from(industries),
      titles: Array.from(titles),
      avgCompanySize: avgSize,
      identifiedTriggers: triggers,
      matchScore: this.calculateICPMatch(prospects, context)
    };
  }

  /**
   * Select most relevant case studies based on prospect characteristics
   */
  private selectRelevantCaseStudies(prospects: any[], context: UserBusinessContext) {
    return context.socialProof.caseStudies
      .map(cs => ({
        ...cs,
        relevanceScore: this.calculateRelevance(cs, prospects)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 2);
  }

  /**
   * Select key differentiators that matter most to these prospects
   */
  private selectKeyDifferentiators(analysis: any, context: UserBusinessContext) {
    // Match differentiators to identified pain points
    const painPointKeywords = context.painPoints.symptoms.join(' ').toLowerCase();
    
    return context.uvp.differentiators
      .filter(diff => {
        const diffLower = diff.toLowerCase();
        return context.painPoints.symptoms.some(symptom => 
          diffLower.includes(symptom.toLowerCase()) ||
          symptom.toLowerCase().includes(diffLower)
        );
      })
      .slice(0, 3);
  }

  /**
   * Generate personalized message sequence
   */
  private generateMessageSequence(
    context: UserBusinessContext,
    analysis: any,
    caseStudies: any[],
    differentiators: string[]
  ) {
    const messages = [];
    
    // Day 0: Initial outreach with trigger event
    messages.push({
      day: 0,
      channel: 'linkedin' as const,
      content: this.generateInitialOutreach(context, analysis),
      reasoning: `Using trigger event and relevant pain point to grab attention`,
      contextUsed: ['ICP triggers', 'Primary pain point', 'Company stage']
    });

    // Day 3: Follow-up with value
    messages.push({
      day: 3,
      channel: 'linkedin' as const,
      content: this.generateValueFollowUp(context, caseStudies[0]),
      reasoning: `Sharing relevant case study that matches prospect's industry`,
      contextUsed: ['Case study', 'Similar company metrics', 'UVP']
    });

    // Day 7: Email with detailed proof
    messages.push({
      day: 7,
      channel: 'email' as const,
      subject: this.generateEmailSubject(context, analysis),
      content: this.generateDetailedEmail(context, caseStudies, differentiators),
      reasoning: `Providing detailed proof points and clear next steps`,
      contextUsed: ['Multiple case studies', 'Key differentiators', 'ROI metrics']
    });

    // Day 12: Final touch
    messages.push({
      day: 12,
      channel: 'email' as const,
      subject: `Quick question about {{company}}`,
      content: this.generateFinalTouch(context),
      reasoning: `Soft close with valuable resource, respecting their time`,
      contextUsed: ['Resources', 'Ideal next step', 'Value props']
    });

    return messages;
  }

  /**
   * Generate initial outreach message
   */
  private generateInitialOutreach(context: UserBusinessContext, analysis: any): string {
    const trigger = analysis.identifiedTriggers[0] || '{{recent_achievement}}';
    const painPoint = context.painPoints.primary;
    const caseStudy = context.socialProof.caseStudies[0];
    
    return `Hi {{firstName}},

I noticed {{company}} ${trigger} - congratulations!

This typically means ${painPoint.toLowerCase()} becomes even more critical.

We just helped ${caseStudy.client} ${caseStudy.result} by addressing exactly this challenge.

Worth connecting to share how we did it?

Best,
{{senderName}}`;
  }

  /**
   * Generate value-focused follow-up
   */
  private generateValueFollowUp(context: UserBusinessContext, caseStudy: any): string {
    return `Thanks for connecting, {{firstName}}!

Quick question - are you experiencing ${context.painPoints.symptoms[0]}?

I ask because ${caseStudy.client} had the same issue before we helped them ${caseStudy.metrics}.

No pitch - genuinely curious if this is affecting {{company}} too.`;
  }

  /**
   * Generate detailed email
   */
  private generateDetailedEmail(
    context: UserBusinessContext,
    caseStudies: any[],
    differentiators: string[]
  ): string {
    const proof = context.uvp.proofPoints[0];
    
    return `Hi {{firstName}},

Following up from LinkedIn with the specifics I mentioned.

Here's how ${caseStudies[0].client} achieved ${caseStudies[0].metrics}:

${differentiators.map((d, i) => `${i + 1}. ${d}`).join('\n')}

The key metric that convinced them: ${proof.metric} - ${proof.value} (${proof.context}).

I've prepared a customized analysis showing how {{company}} could achieve similar results.

Worth a 15-minute call to review it?

[Calendar link]

Best,
{{senderName}}

P.S. - Here's our ROI calculator if you want to run your own numbers: ${context.resources.calculators[0]?.url || '[link]'}`;
  }

  /**
   * Generate final touch message
   */
  private generateFinalTouch(context: UserBusinessContext): string {
    return `Hi {{firstName}},

I'll close your file for now - I know {{company}} has other priorities.

If ${context.painPoints.primary.toLowerCase()} becomes urgent, here's a resource that might help: ${context.resources.whitepapers[0]?.url || '[resource link]'}

Always happy to reconnect when the timing is better.

Best,
{{senderName}}`;
  }

  /**
   * Generate email subject line
   */
  private generateEmailSubject(context: UserBusinessContext, analysis: any): string {
    const company = '{{company}}';
    const benefit = context.uvp.proofPoints[0]?.value || 'significant improvement';
    
    return `${company} + ${benefit} in ${context.product.implementation.timeframe}`;
  }

  /**
   * Generate campaign strategy description
   */
  private generateStrategy(analysis: any, context: UserBusinessContext): string {
    const approach = analysis.matchScore > 80 ? 'High-touch personalized' : 'Balanced outreach';
    const focus = analysis.identifiedTriggers.length > 0 ? 'trigger-based' : 'pain-point focused';
    
    return `${approach} ${focus} campaign leveraging ${context.socialProof.caseStudies.length} case studies and proven ${context.product.category} success metrics`;
  }

  /**
   * Calculate expected outcome based on historical data
   */
  private calculateExpectedOutcome(analysis: any, preferences: any): string {
    const baseRate = 15; // Base response rate
    const matchBonus = (analysis.matchScore / 100) * 10; // Up to 10% bonus for good match
    const triggerBonus = analysis.identifiedTriggers.length * 3; // 3% per trigger
    
    const expectedRate = Math.min(baseRate + matchBonus + triggerBonus, 35);
    
    return `${expectedRate.toFixed(0)}-${(expectedRate + 5).toFixed(0)}% response rate`;
  }

  /**
   * Calculate ICP match score
   */
  private calculateICPMatch(prospects: any[], context: UserBusinessContext): number {
    let score = 0;
    let factors = 0;
    
    prospects.forEach(prospect => {
      // Industry match
      if (context.icp.industries.includes(prospect.industry)) {
        score += 20;
        factors++;
      }
      
      // Title match
      if (context.icp.titles.some(t => prospect.title?.includes(t))) {
        score += 30;
        factors++;
      }
      
      // Company size match
      const size = prospect.employees || 0;
      if (size >= context.icp.companySize.min && size <= context.icp.companySize.max) {
        score += 20;
        factors++;
      }
      
      // Trigger event present
      if (prospect.recentActivity && 
          context.icp.triggers.some(t => 
            prospect.recentActivity.toLowerCase().includes(t.toLowerCase())
          )) {
        score += 30;
        factors++;
      }
    });
    
    return factors > 0 ? Math.round(score / factors) : 50;
  }

  /**
   * Calculate relevance score for case studies
   */
  private calculateRelevance(caseStudy: any, prospects: any[]): number {
    let score = 0;
    
    prospects.forEach(prospect => {
      if (caseStudy.industry === prospect.industry) score += 50;
      if (caseStudy.client.includes(prospect.company)) score += 20;
    });
    
    return score / prospects.length;
  }

  /**
   * Get example context for development
   */
  private getExampleContext(): UserBusinessContext {
    // This would return the EXAMPLE_USER_CONTEXT from user-context.ts
    return {
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
        titles: ["VP Engineering", "CTO", "Director of Engineering"],
        departments: ["Engineering", "Data", "IT"],
        technologies: ["AWS", "PostgreSQL", "Snowflake"],
        triggers: ["Recent funding round", "Hiring data engineers"],
        characteristics: ["Multiple data sources", "Real-time requirements"]
      },
      painPoints: {
        primary: "Data silos preventing real-time insights",
        secondary: ["Manual data synchronization", "Data quality issues"],
        symptoms: ["Delayed reporting", "Inconsistent data across systems"],
        impact: "Lost revenue from delayed decisions"
      },
      uvp: {
        elevator: "DataSync Pro eliminates data silos...",
        oneLinePitch: "Real-time data sync in 5 minutes",
        differentiators: ["No-code setup", "Real-time sync", "SOC 2 compliant"],
        competitiveAdvantages: ["10x faster than Zapier"],
        proofPoints: [
          {
            metric: "Implementation Time",
            value: "5 minutes",
            context: "vs 3 weeks industry average"
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
        testimonials: [],
        logos: ["TechCorp"],
        awards: ["G2 Leader 2024"]
      },
      messaging: {
        tone: "technical",
        keywords: ["real-time", "sync", "integration"],
        avoidWords: ["cheap", "easy"],
        valueProps: ["Save engineering time"],
        objectionHandling: {}
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
        competitors: ["Zapier", "Fivetran"]
      },
      salesProcess: {
        averageSalesCycle: 30,
        decisionMakers: ["VP Engineering", "CTO"],
        typicalObjections: ["We built this in-house"],
        qualificationCriteria: ["Multiple data sources"],
        idealNextStep: "Technical demo"
      },
      resources: {
        whitepapers: [],
        caseStudies: [],
        demos: [],
        webinars: [],
        calculators: []
      },
      campaignPreferences: {
        aggressiveness: "moderate",
        followUpCount: 4,
        channelPreference: "balanced",
        personalizationLevel: "high",
        complianceRequirements: ["GDPR", "CCPA"]
      }
    };
  }
}

// Export singleton instance
export const ragIntegration = new RAGIntegration();