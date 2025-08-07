// Conversion Optimization Engine for Sam AI
// Automatically tests and optimizes every campaign element for maximum conversion

import { TestingCampaignTemplate } from './testing-campaign-templates';

export interface ConversionElement {
  id: string;
  type: 'subject' | 'opening' | 'body' | 'cta' | 'ps' | 'timing' | 'channel';
  name: string;
  currentValue: string;
  variants: ElementVariant[];
  impact: 'high' | 'medium' | 'low';
  metrics: ElementMetrics;
}

export interface ElementVariant {
  id: string;
  value: string;
  rationale: string;
  performance: VariantPerformance;
  status: 'testing' | 'winner' | 'loser' | 'pending';
}

export interface VariantPerformance {
  impressions: number;
  conversions: number;
  conversionRate: number;
  confidence: number;
  uplift?: number; // Percentage improvement over control
}

export interface ElementMetrics {
  primaryMetric: string;
  secondaryMetrics: string[];
  minimumSampleSize: number;
  currentSampleSize: number;
  statisticalSignificance: number;
}

export interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  elements: ConversionElement[];
  currentConversionRate: number;
  targetConversionRate: number;
  estimatedTimeToTarget: string;
  prioritization: 'impact' | 'confidence' | 'speed' | 'balanced';
}

export class ConversionOptimizationEngine {
  /**
   * Create a comprehensive optimization strategy for a campaign
   */
  static createOptimizationStrategy(
    campaignType: 'cold_outreach' | 'warm_leads' | 'nurture' | 'reactivation',
    currentPerformance: {
      openRate: number;
      clickRate: number;
      replyRate: number;
      meetingRate: number;
    },
    businessContext: {
      industry: string;
      targetPersona: string;
      averageDealSize: number;
      salesCycle: number; // in days
    }
  ): OptimizationStrategy {
    const elements = this.identifyOptimizationOpportunities(currentPerformance);
    const targetConversion = this.calculateTargetConversionRate(campaignType, businessContext);
    
    return {
      id: `opt-${Date.now()}`,
      name: `${campaignType} Optimization Strategy`,
      description: `Systematic testing to improve conversion from ${currentPerformance.replyRate}% to ${targetConversion}%`,
      elements,
      currentConversionRate: currentPerformance.replyRate,
      targetConversionRate: targetConversion,
      estimatedTimeToTarget: this.estimateOptimizationTimeline(elements),
      prioritization: 'impact' // Start with highest impact elements
    };
  }

  /**
   * Identify which elements need optimization based on current performance
   */
  static identifyOptimizationOpportunities(
    performance: {
      openRate: number;
      clickRate: number;
      replyRate: number;
      meetingRate: number;
    }
  ): ConversionElement[] {
    const elements: ConversionElement[] = [];
    
    // Subject line optimization if open rate is low
    if (performance.openRate < 40) {
      elements.push(this.createSubjectLineElement());
    }
    
    // Opening line optimization if click/read rate is low
    if (performance.clickRate < 20) {
      elements.push(this.createOpeningLineElement());
    }
    
    // CTA optimization if reply rate is low
    if (performance.replyRate < 15) {
      elements.push(this.createCTAElement());
    }
    
    // Body content optimization for engagement
    elements.push(this.createBodyContentElement());
    
    // Timing optimization is always valuable
    elements.push(this.createTimingElement());
    
    return elements;
  }

  /**
   * Create subject line testing element
   */
  static createSubjectLineElement(): ConversionElement {
    return {
      id: 'subject-optimization',
      type: 'subject',
      name: 'Email Subject Line',
      currentValue: 'Quick question about {{company}}',
      variants: [
        {
          id: 'subj-control',
          value: 'Quick question about {{company}}',
          rationale: 'Control - professional and direct',
          performance: {
            impressions: 0,
            conversions: 0,
            conversionRate: 0,
            confidence: 0
          },
          status: 'testing'
        },
        {
          id: 'subj-personalized',
          value: '{{firstName}}, saw {{trigger_event}} - quick thought',
          rationale: 'Hyper-personalized with trigger event for relevance',
          performance: {
            impressions: 0,
            conversions: 0,
            conversionRate: 0,
            confidence: 0
          },
          status: 'testing'
        },
        {
          id: 'subj-benefit',
          value: 'How {{similar_company}} increased revenue 40% in 3 months',
          rationale: 'Lead with specific benefit and social proof',
          performance: {
            impressions: 0,
            conversions: 0,
            conversionRate: 0,
            confidence: 0
          },
          status: 'testing'
        },
        {
          id: 'subj-question',
          value: 'Is {{pain_point}} still a priority for {{company}}?',
          rationale: 'Direct question about known pain point',
          performance: {
            impressions: 0,
            conversions: 0,
            conversionRate: 0,
            confidence: 0
          },
          status: 'testing'
        },
        {
          id: 'subj-urgency',
          value: '{{firstName}} - 2 min request (time-sensitive)',
          rationale: 'Create urgency with time constraint',
          performance: {
            impressions: 0,
            conversions: 0,
            conversionRate: 0,
            confidence: 0
          },
          status: 'testing'
        }
      ],
      impact: 'high',
      metrics: {
        primaryMetric: 'Open Rate',
        secondaryMetrics: ['Click Rate', 'Reply Rate'],
        minimumSampleSize: 200,
        currentSampleSize: 0,
        statisticalSignificance: 0
      }
    };
  }

  /**
   * Create opening line testing element
   */
  static createOpeningLineElement(): ConversionElement {
    return {
      id: 'opening-optimization',
      type: 'opening',
      name: 'Opening Line',
      currentValue: 'I noticed {{company}} is {{observation}}.',
      variants: [
        {
          id: 'open-observation',
          value: 'I noticed {{company}} is {{observation}}.',
          rationale: 'Start with relevant observation',
          performance: { impressions: 0, conversions: 0, conversionRate: 0, confidence: 0 },
          status: 'testing'
        },
        {
          id: 'open-congrats',
          value: 'Congrats on {{recent_achievement}}! This usually means {{implication}}.',
          rationale: 'Positive opening with business insight',
          performance: { impressions: 0, conversions: 0, conversionRate: 0, confidence: 0 },
          status: 'testing'
        },
        {
          id: 'open-question',
          value: 'Quick question - are you still using {{current_solution}} for {{process}}?',
          rationale: 'Direct question to engage immediately',
          performance: { impressions: 0, conversions: 0, conversionRate: 0, confidence: 0 },
          status: 'testing'
        },
        {
          id: 'open-peer',
          value: 'Just helped {{similar_company}} solve {{exact_same_challenge}}.',
          rationale: 'Lead with relevant social proof',
          performance: { impressions: 0, conversions: 0, conversionRate: 0, confidence: 0 },
          status: 'testing'
        },
        {
          id: 'open-data',
          value: '87% of {{industry}} companies struggle with {{pain_point}} - is {{company}} experiencing this too?',
          rationale: 'Data-driven opening with relevance check',
          performance: { impressions: 0, conversions: 0, conversionRate: 0, confidence: 0 },
          status: 'testing'
        }
      ],
      impact: 'high',
      metrics: {
        primaryMetric: 'Read Completion Rate',
        secondaryMetrics: ['Reply Rate', 'Click Rate'],
        minimumSampleSize: 150,
        currentSampleSize: 0,
        statisticalSignificance: 0
      }
    };
  }

  /**
   * Create CTA testing element
   */
  static createCTAElement(): ConversionElement {
    return {
      id: 'cta-optimization',
      type: 'cta',
      name: 'Call to Action',
      currentValue: 'Do you have 15 minutes this week for a quick call?',
      variants: [
        {
          id: 'cta-meeting',
          value: 'Do you have 15 minutes this week for a quick call?',
          rationale: 'Direct meeting request with specific time',
          performance: { impressions: 0, conversions: 0, conversionRate: 0, confidence: 0 },
          status: 'testing'
        },
        {
          id: 'cta-interest',
          value: 'Is this something worth exploring for {{company}}?',
          rationale: 'Low commitment interest check',
          performance: { impressions: 0, conversions: 0, conversionRate: 0, confidence: 0 },
          status: 'testing'
        },
        {
          id: 'cta-resource',
          value: 'I have a 2-page case study showing exactly how we did this - interested?',
          rationale: 'Value-first approach with resource',
          performance: { impressions: 0, conversions: 0, conversionRate: 0, confidence: 0 },
          status: 'testing'
        },
        {
          id: 'cta-specific',
          value: 'Can I send you a 3-minute video showing how this would work for {{company}}?',
          rationale: 'Specific, personalized next step',
          performance: { impressions: 0, conversions: 0, conversionRate: 0, confidence: 0 },
          status: 'testing'
        },
        {
          id: 'cta-calendar',
          value: 'Here\'s my calendar if you want to chat: [calendar_link] - or just reply with questions',
          rationale: 'Give control to prospect with options',
          performance: { impressions: 0, conversions: 0, conversionRate: 0, confidence: 0 },
          status: 'testing'
        }
      ],
      impact: 'high',
      metrics: {
        primaryMetric: 'Reply Rate',
        secondaryMetrics: ['Meeting Booking Rate', 'Positive Response Rate'],
        minimumSampleSize: 200,
        currentSampleSize: 0,
        statisticalSignificance: 0
      }
    };
  }

  /**
   * Create body content testing element
   */
  static createBodyContentElement(): ConversionElement {
    return {
      id: 'body-optimization',
      type: 'body',
      name: 'Message Body',
      currentValue: 'Standard value proposition with one case study',
      variants: [
        {
          id: 'body-brief',
          value: '2-3 sentences, single value prop, one proof point',
          rationale: 'Ultra-brief for busy executives',
          performance: { impressions: 0, conversions: 0, conversionRate: 0, confidence: 0 },
          status: 'testing'
        },
        {
          id: 'body-story',
          value: 'Customer success story format with problem-solution-result',
          rationale: 'Narrative format for engagement',
          performance: { impressions: 0, conversions: 0, conversionRate: 0, confidence: 0 },
          status: 'testing'
        },
        {
          id: 'body-data',
          value: 'Data-heavy with 3-4 specific metrics and ROI calculation',
          rationale: 'Appeal to analytical buyers',
          performance: { impressions: 0, conversions: 0, conversionRate: 0, confidence: 0 },
          status: 'testing'
        },
        {
          id: 'body-bullets',
          value: 'Bullet points with 3 key benefits',
          rationale: 'Scannable format for quick reading',
          performance: { impressions: 0, conversions: 0, conversionRate: 0, confidence: 0 },
          status: 'testing'
        }
      ],
      impact: 'medium',
      metrics: {
        primaryMetric: 'Engagement Rate',
        secondaryMetrics: ['Reply Rate', 'Link Click Rate'],
        minimumSampleSize: 250,
        currentSampleSize: 0,
        statisticalSignificance: 0
      }
    };
  }

  /**
   * Create timing testing element
   */
  static createTimingElement(): ConversionElement {
    return {
      id: 'timing-optimization',
      type: 'timing',
      name: 'Send Timing',
      currentValue: '10:00 AM recipient time',
      variants: [
        {
          id: 'time-early',
          value: '7:30 AM - Start of day',
          rationale: 'Catch them planning their day',
          performance: { impressions: 0, conversions: 0, conversionRate: 0, confidence: 0 },
          status: 'testing'
        },
        {
          id: 'time-mid-morning',
          value: '10:30 AM - Post morning meetings',
          rationale: 'After morning rush, before lunch',
          performance: { impressions: 0, conversions: 0, conversionRate: 0, confidence: 0 },
          status: 'testing'
        },
        {
          id: 'time-lunch',
          value: '12:30 PM - Lunch break',
          rationale: 'Casual browsing time',
          performance: { impressions: 0, conversions: 0, conversionRate: 0, confidence: 0 },
          status: 'testing'
        },
        {
          id: 'time-afternoon',
          value: '2:30 PM - Afternoon lull',
          rationale: 'Post-lunch productivity dip',
          performance: { impressions: 0, conversions: 0, conversionRate: 0, confidence: 0 },
          status: 'testing'
        },
        {
          id: 'time-end-day',
          value: '4:30 PM - End of day',
          rationale: 'Planning tomorrow, clearing inbox',
          performance: { impressions: 0, conversions: 0, conversionRate: 0, confidence: 0 },
          status: 'testing'
        }
      ],
      impact: 'medium',
      metrics: {
        primaryMetric: 'Open Rate',
        secondaryMetrics: ['Response Time', 'Reply Rate'],
        minimumSampleSize: 300,
        currentSampleSize: 0,
        statisticalSignificance: 0
      }
    };
  }

  /**
   * Calculate target conversion rate based on industry benchmarks
   */
  static calculateTargetConversionRate(
    campaignType: string,
    businessContext: { industry: string; targetPersona: string; averageDealSize: number }
  ): number {
    // Industry benchmarks for reply rates
    const industryBenchmarks: Record<string, number> = {
      'saas': 15,
      'healthcare': 12,
      'finance': 10,
      'ecommerce': 18,
      'enterprise': 8,
      'default': 12
    };
    
    const baseBenchmark = industryBenchmarks[businessContext.industry.toLowerCase()] || industryBenchmarks.default;
    
    // Adjust based on campaign type
    const campaignMultipliers: Record<string, number> = {
      'cold_outreach': 1.0,
      'warm_leads': 2.5,
      'nurture': 1.8,
      'reactivation': 1.3
    };
    
    const multiplier = campaignMultipliers[campaignType] || 1.0;
    
    // Adjust based on deal size (higher value = lower volume but higher quality)
    const dealSizeAdjustment = businessContext.averageDealSize > 50000 ? 0.7 : 1.0;
    
    return Math.round(baseBenchmark * multiplier * dealSizeAdjustment);
  }

  /**
   * Estimate timeline to reach optimization target
   */
  static estimateOptimizationTimeline(elements: ConversionElement[]): string {
    const totalSampleSizeNeeded = elements.reduce(
      (sum, el) => sum + el.metrics.minimumSampleSize, 
      0
    );
    
    // Assume 50 tests per day average
    const daysNeeded = Math.ceil(totalSampleSizeNeeded / 50);
    
    if (daysNeeded < 14) return '1-2 weeks';
    if (daysNeeded < 30) return '3-4 weeks';
    if (daysNeeded < 60) return '1-2 months';
    return '2-3 months';
  }

  /**
   * Generate optimization recommendations based on current test results
   */
  static generateOptimizationRecommendations(
    elements: ConversionElement[]
  ): Array<{
    element: string;
    recommendation: string;
    expectedImpact: string;
    confidence: number;
  }> {
    const recommendations = [];
    
    for (const element of elements) {
      // Find winning variant
      const winner = element.variants.reduce((best, current) => 
        current.performance.conversionRate > best.performance.conversionRate ? current : best
      );
      
      if (winner.performance.confidence > 90) {
        recommendations.push({
          element: element.name,
          recommendation: `Use "${winner.value}" - ${winner.rationale}`,
          expectedImpact: `+${winner.performance.uplift || 0}% conversion rate`,
          confidence: winner.performance.confidence
        });
      }
    }
    
    // Sort by expected impact
    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Multi-armed bandit algorithm for dynamic traffic allocation
   */
  static calculateTrafficAllocation(variants: ElementVariant[]): Record<string, number> {
    const allocations: Record<string, number> = {};
    
    // Thompson Sampling approach
    const scores = variants.map(v => {
      const alpha = v.performance.conversions + 1;
      const beta = v.performance.impressions - v.performance.conversions + 1;
      // Simplified beta distribution sampling
      return Math.random() * (alpha / (alpha + beta));
    });
    
    const totalScore = scores.reduce((a, b) => a + b, 0);
    
    variants.forEach((v, i) => {
      allocations[v.id] = Math.round((scores[i] / totalScore) * 100);
    });
    
    return allocations;
  }

  /**
   * Predict conversion rate improvement over time
   */
  static predictConversionImprovement(
    currentRate: number,
    optimizationStrategy: OptimizationStrategy,
    daysInFuture: number
  ): {
    predictedRate: number;
    confidenceInterval: { lower: number; upper: number };
    elementsOptimized: number;
  } {
    // Calculate improvement rate based on strategy
    const dailyImprovement = (optimizationStrategy.targetConversionRate - currentRate) / 90; // 90 days to target
    const predictedRate = Math.min(
      currentRate + (dailyImprovement * daysInFuture),
      optimizationStrategy.targetConversionRate
    );
    
    // Elements optimized over time
    const elementsOptimized = Math.floor(
      (daysInFuture / 90) * optimizationStrategy.elements.length
    );
    
    // Confidence interval widens with time
    const uncertainty = 0.1 + (daysInFuture / 365) * 0.2;
    
    return {
      predictedRate,
      confidenceInterval: {
        lower: predictedRate * (1 - uncertainty),
        upper: predictedRate * (1 + uncertainty)
      },
      elementsOptimized
    };
  }
}

// Export for use in campaign components
export const conversionOptimizer = new ConversionOptimizationEngine();