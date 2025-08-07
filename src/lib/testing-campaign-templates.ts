// Testing Campaign Templates for Sam AI
// This provides Sam with knowledge about different types of testing campaigns

export interface TestingCampaignTemplate {
  id: string;
  name: string;
  category: 'messaging' | 'timing' | 'channel' | 'audience' | 'offer' | 'personalization';
  description: string;
  hypothesis: string;
  whatToTest: string[];
  metrics: string[];
  minimumSampleSize: number;
  expectedDuration: string;
  bestFor: string[];
  variants: TestVariant[];
  tips: string[];
}

export interface TestVariant {
  name: string;
  description: string;
  changes: string[];
  example?: string;
}

export const TESTING_CAMPAIGN_TEMPLATES: TestingCampaignTemplate[] = [
  // MESSAGING TESTS
  {
    id: 'subject-line-test',
    name: 'Subject Line A/B Test',
    category: 'messaging',
    description: 'Test different email subject lines to maximize open rates',
    hypothesis: 'More personalized or urgent subject lines will increase open rates',
    whatToTest: [
      'Personalization level (name, company, trigger event)',
      'Length (short vs long)',
      'Tone (professional vs casual)',
      'Urgency indicators',
      'Questions vs statements',
      'Emojis vs no emojis'
    ],
    metrics: ['Open rate', 'Click rate', 'Reply rate'],
    minimumSampleSize: 200,
    expectedDuration: '1-2 weeks',
    bestFor: ['Email campaigns', 'Cold outreach', 'Re-engagement'],
    variants: [
      {
        name: 'Control - Professional',
        description: 'Standard professional subject',
        changes: ['No personalization', 'Formal tone'],
        example: 'Partnership Opportunity for {{company}}'
      },
      {
        name: 'Variant A - Personalized',
        description: 'Include recipient name and trigger',
        changes: ['First name', 'Recent event mention'],
        example: '{{firstName}}, congrats on {{funding_round}}'
      },
      {
        name: 'Variant B - Question',
        description: 'Pose a relevant question',
        changes: ['Question format', 'Pain point focus'],
        example: 'Is {{pain_point}} affecting {{company}}?'
      },
      {
        name: 'Variant C - Urgency',
        description: 'Create time sensitivity',
        changes: ['Time limit', 'Scarcity'],
        example: 'Quick question (2 min) about {{topic}}'
      }
    ],
    tips: [
      'Test one element at a time for clear results',
      'Ensure subject lines are mobile-friendly (30-50 chars)',
      'Match subject line tone with message body',
      'Track not just opens but downstream metrics'
    ]
  },

  {
    id: 'message-length-test',
    name: 'Message Length Test',
    category: 'messaging',
    description: 'Compare short vs long messages for engagement',
    hypothesis: 'Shorter messages will have higher response rates due to easier consumption',
    whatToTest: [
      'Ultra-short (2-3 lines)',
      'Short (4-5 lines)',
      'Medium (6-10 lines)',
      'Long (10+ lines with details)'
    ],
    metrics: ['Read time', 'Reply rate', 'Click rate', 'Meeting bookings'],
    minimumSampleSize: 300,
    expectedDuration: '2-3 weeks',
    bestFor: ['LinkedIn outreach', 'Email campaigns', 'Follow-ups'],
    variants: [
      {
        name: 'Ultra-Short',
        description: 'Get to the point immediately',
        changes: ['2-3 sentences max', 'Single CTA'],
        example: 'Hi {{name}}, Noticed {{trigger}}. We help similar companies {{benefit}}. Worth a quick chat?'
      },
      {
        name: 'Short with Context',
        description: 'Brief but with some context',
        changes: ['4-5 sentences', 'One proof point'],
        example: 'Hi {{name}}, Noticed {{trigger}}. We recently helped {{similar_company}} achieve {{result}}. Worth exploring for {{company}}? 15-min call?'
      },
      {
        name: 'Detailed',
        description: 'Full context and value prop',
        changes: ['Multiple paragraphs', 'Case study', 'Multiple proof points'],
        example: 'Full email with problem, solution, case study, and clear CTA'
      }
    ],
    tips: [
      'LinkedIn messages should generally be shorter',
      'Test readability on mobile devices',
      'Consider industry norms (tech = shorter, enterprise = longer)',
      'Track engagement depth, not just response'
    ]
  },

  {
    id: 'cta-test',
    name: 'Call-to-Action Test',
    category: 'messaging',
    description: 'Optimize your CTA for maximum conversions',
    hypothesis: 'Lower commitment CTAs will increase initial engagement',
    whatToTest: [
      'Hard sell vs soft sell',
      'Meeting request vs resource share',
      'Time commitment specified vs open-ended',
      'Single CTA vs multiple options',
      'Question vs statement'
    ],
    metrics: ['CTA click rate', 'Meeting acceptance rate', 'Response rate'],
    minimumSampleSize: 250,
    expectedDuration: '2 weeks',
    bestFor: ['Sales outreach', 'Demo requests', 'Content promotion'],
    variants: [
      {
        name: 'Direct Meeting Request',
        description: 'Ask for meeting directly',
        changes: ['Clear time ask', 'Calendar link'],
        example: 'Do you have 15 minutes this week for a quick call?'
      },
      {
        name: 'Soft Interest Check',
        description: 'Gauge interest first',
        changes: ['Low commitment', 'Information gathering'],
        example: 'Is this something you're exploring for {{company}}?'
      },
      {
        name: 'Value First',
        description: 'Lead with resource',
        changes: ['Give before ask', 'Educational'],
        example: 'I have a case study on how {{similar}} solved this - interested?'
      },
      {
        name: 'Multiple Options',
        description: 'Give choices',
        changes: ['2-3 options', 'Different commitment levels'],
        example: 'Would you prefer a quick call, email exchange, or should I send resources?'
      }
    ],
    tips: [
      'Match CTA to prospect stage in funnel',
      'Test CTA placement (beginning vs end)',
      'Consider prospect seniority level',
      'Track quality of responses, not just quantity'
    ]
  },

  // TIMING TESTS
  {
    id: 'send-time-test',
    name: 'Send Time Optimization',
    category: 'timing',
    description: 'Find the optimal time to send messages',
    hypothesis: 'Messages sent at specific times will have higher engagement',
    whatToTest: [
      'Early morning (7-9 AM)',
      'Mid-morning (10-11 AM)',
      'Lunch time (12-1 PM)',
      'Afternoon (2-4 PM)',
      'End of day (4-6 PM)',
      'Evening (6-8 PM)'
    ],
    metrics: ['Open rate', 'Response time', 'Reply rate'],
    minimumSampleSize: 500,
    expectedDuration: '2-4 weeks',
    bestFor: ['Email campaigns', 'LinkedIn outreach', 'Follow-ups'],
    variants: [
      {
        name: 'Early Bird',
        description: 'Catch them at start of day',
        changes: ['7-8 AM send time', 'Top of inbox'],
        example: 'Send at 7:30 AM local time'
      },
      {
        name: 'Mid-Morning',
        description: 'After morning rush',
        changes: ['10-11 AM', 'Post-meeting block'],
        example: 'Send at 10:30 AM local time'
      },
      {
        name: 'Lunch Break',
        description: 'When checking personal items',
        changes: ['12-1 PM', 'Casual browsing time'],
        example: 'Send at 12:15 PM local time'
      },
      {
        name: 'End of Day',
        description: 'Planning tomorrow',
        changes: ['4-5 PM', 'Wrap-up time'],
        example: 'Send at 4:30 PM local time'
      }
    ],
    tips: [
      'Consider time zones carefully',
      'Test day of week separately',
      'Industry matters (finance = early, tech = flexible)',
      'Track response time, not just open rate'
    ]
  },

  {
    id: 'follow-up-timing',
    name: 'Follow-up Sequence Timing',
    category: 'timing',
    description: 'Optimize the spacing between follow-ups',
    hypothesis: 'Optimal spacing between messages increases overall response rate',
    whatToTest: [
      'Aggressive (2-3 day gaps)',
      'Moderate (4-5 day gaps)',
      'Patient (7-10 day gaps)',
      'Mixed (short then longer gaps)'
    ],
    metrics: ['Cumulative response rate', 'Unsubscribe rate', 'Meeting bookings'],
    minimumSampleSize: 400,
    expectedDuration: '4-6 weeks',
    bestFor: ['Multi-touch campaigns', 'Nurture sequences', 'Sales outreach'],
    variants: [
      {
        name: 'Aggressive',
        description: 'Quick succession',
        changes: ['Day 0, 2, 5, 8, 12'],
        example: '5 touches in 12 days'
      },
      {
        name: 'Moderate',
        description: 'Standard spacing',
        changes: ['Day 0, 4, 9, 15, 22'],
        example: '5 touches in 22 days'
      },
      {
        name: 'Patient',
        description: 'Long-term nurture',
        changes: ['Day 0, 7, 16, 28, 42'],
        example: '5 touches in 6 weeks'
      },
      {
        name: 'Front-loaded',
        description: 'Start fast, then slow',
        changes: ['Day 0, 2, 5, 12, 25'],
        example: 'Quick start, patient finish'
      }
    ],
    tips: [
      'Consider sales cycle length',
      'Monitor fatigue indicators',
      'Adjust based on engagement signals',
      'Different for inbound vs outbound'
    ]
  },

  // CHANNEL TESTS
  {
    id: 'channel-preference',
    name: 'Channel Preference Test',
    category: 'channel',
    description: 'Determine which channel works best for your audience',
    hypothesis: 'Different channels will have varying effectiveness for different segments',
    whatToTest: [
      'LinkedIn only',
      'Email only',
      'LinkedIn first, then email',
      'Email first, then LinkedIn',
      'Parallel (both simultaneously)'
    ],
    metrics: ['Response rate', 'Engagement quality', 'Meeting conversion', 'Cost per reply'],
    minimumSampleSize: 500,
    expectedDuration: '3-4 weeks',
    bestFor: ['New market entry', 'ICP validation', 'Campaign optimization'],
    variants: [
      {
        name: 'LinkedIn Pure',
        description: 'All touchpoints via LinkedIn',
        changes: ['Connection + InMails', 'Professional context'],
        example: 'Connect → Message → Follow-up → Final'
      },
      {
        name: 'Email Pure',
        description: 'All touchpoints via email',
        changes: ['Cold email sequence', 'More detailed content'],
        example: 'Intro → Value → Case Study → CTA'
      },
      {
        name: 'LinkedIn-Email Hybrid',
        description: 'Start LinkedIn, continue email',
        changes: ['Warm up on LinkedIn', 'Details via email'],
        example: 'Connect → LinkedIn msg → Email follow-up'
      },
      {
        name: 'Omnichannel',
        description: 'Use both in parallel',
        changes: ['Multiple touchpoints', 'Channel redundancy'],
        example: 'Email + LinkedIn connection same day'
      }
    ],
    tips: [
      'Consider platform limits',
      'Track cross-channel attribution',
      'Segment by persona/industry',
      'Monitor channel fatigue'
    ]
  },

  // PERSONALIZATION TESTS
  {
    id: 'personalization-depth',
    name: 'Personalization Level Test',
    category: 'personalization',
    description: 'Find the optimal level of personalization',
    hypothesis: 'Higher personalization increases response but may not scale',
    whatToTest: [
      'No personalization (template only)',
      'Basic (name, company)',
      'Moderate (+ role, industry)',
      'Deep (+ triggers, research)',
      'Hyper-personalized (+ personal details)'
    ],
    metrics: ['Response rate', 'Positive sentiment', 'Time to create', 'ROI'],
    minimumSampleSize: 300,
    expectedDuration: '3-4 weeks',
    bestFor: ['High-value prospects', 'Enterprise sales', 'Account-based marketing'],
    variants: [
      {
        name: 'Template',
        description: 'Generic message',
        changes: ['No personalization', 'Scalable'],
        example: 'Hi there, I help companies like yours...'
      },
      {
        name: 'Basic',
        description: 'Name and company only',
        changes: ['{{firstName}}', '{{company}}'],
        example: 'Hi John, I noticed Acme Corp is growing...'
      },
      {
        name: 'Contextual',
        description: 'Add business context',
        changes: ['Industry reference', 'Role acknowledgment'],
        example: 'Hi John, As VP Sales in SaaS, you likely face...'
      },
      {
        name: 'Triggered',
        description: 'Include trigger events',
        changes: ['Recent news', 'Company changes'],
        example: 'Hi John, Congrats on the Series B! This usually means...'
      },
      {
        name: 'Deep Research',
        description: 'Highly researched',
        changes: ['Personal interests', 'Specific challenges', 'Mutual connections'],
        example: 'Hi John, Saw your post about X. Given your background in Y...'
      }
    ],
    tips: [
      'Balance personalization with scalability',
      'Test perception of "creepiness"',
      'Measure time investment vs return',
      'Use AI to scale personalization'
    ]
  },

  // AUDIENCE TESTS
  {
    id: 'persona-response',
    name: 'Persona Response Test',
    category: 'audience',
    description: 'Test which personas respond best',
    hypothesis: 'Different job titles/levels will have different response patterns',
    whatToTest: [
      'C-Level executives',
      'VP/Director level',
      'Manager level',
      'Individual contributors',
      'Technical vs non-technical'
    ],
    metrics: ['Response rate by persona', 'Meeting quality', 'Deal velocity', 'Close rate'],
    minimumSampleSize: 100,
    expectedDuration: '4-6 weeks',
    bestFor: ['ICP refinement', 'Message-market fit', 'Sales strategy'],
    variants: [
      {
        name: 'Executive',
        description: 'Target C-suite',
        changes: ['Strategic focus', 'ROI emphasis', 'Brief messages'],
        example: 'Focus on business impact and competitive advantage'
      },
      {
        name: 'VP/Director',
        description: 'Target middle management',
        changes: ['Tactical benefits', 'Team productivity', 'Process improvement'],
        example: 'How to make their team more effective'
      },
      {
        name: 'Manager',
        description: 'Target line managers',
        changes: ['Day-to-day pain points', 'Quick wins', 'Ease of implementation'],
        example: 'Solve immediate problems they face'
      },
      {
        name: 'IC/Technical',
        description: 'Target practitioners',
        changes: ['Technical details', 'Features', 'Integration'],
        example: 'How it actually works and integrates'
      }
    ],
    tips: [
      'Adjust message complexity by level',
      'Consider decision-making authority',
      'Track influence vs decision power',
      'Different channels may work better for different levels'
    ]
  },

  {
    id: 'industry-messaging',
    name: 'Industry-Specific Messaging',
    category: 'audience',
    description: 'Test messaging variations across industries',
    hypothesis: 'Industry-specific language and examples increase relevance',
    whatToTest: [
      'Generic cross-industry',
      'Industry-specific terminology',
      'Industry case studies',
      'Industry pain points',
      'Compliance/regulation focus'
    ],
    metrics: ['Industry response rates', 'Engagement depth', 'Qualification rate'],
    minimumSampleSize: 150,
    expectedDuration: '3-4 weeks',
    bestFor: ['Multi-industry products', 'Market expansion', 'Vertical targeting'],
    variants: [
      {
        name: 'Generic',
        description: 'One size fits all',
        changes: ['Broad language', 'General benefits'],
        example: 'We help companies improve efficiency'
      },
      {
        name: 'Healthcare-specific',
        description: 'Healthcare terminology',
        changes: ['HIPAA mention', 'Patient outcomes', 'Clinical efficiency'],
        example: 'Improve patient outcomes while maintaining HIPAA compliance'
      },
      {
        name: 'FinServ-specific',
        description: 'Financial services focus',
        changes: ['Compliance', 'Risk management', 'Transaction speed'],
        example: 'Reduce risk while accelerating transaction processing'
      },
      {
        name: 'SaaS-specific',
        description: 'SaaS terminology',
        changes: ['MRR/ARR', 'Churn', 'Product-led growth'],
        example: 'Reduce churn and accelerate your PLG motion'
      }
    ],
    tips: [
      'Research industry-specific terminology',
      'Use relevant compliance/regulations',
      'Reference known industry challenges',
      'Include industry-specific social proof'
    ]
  },

  // OFFER TESTS
  {
    id: 'lead-magnet-test',
    name: 'Lead Magnet Effectiveness',
    category: 'offer',
    description: 'Test different offers to generate interest',
    hypothesis: 'Different value propositions will attract different response rates',
    whatToTest: [
      'Free consultation/audit',
      'Educational content (whitepaper/guide)',
      'Tool/calculator',
      'Webinar/workshop',
      'Free trial/demo',
      'Case study'
    ],
    metrics: ['Acceptance rate', 'Lead quality', 'Conversion to opportunity', 'Time to close'],
    minimumSampleSize: 200,
    expectedDuration: '3-4 weeks',
    bestFor: ['Lead generation', 'Top of funnel', 'Content marketing'],
    variants: [
      {
        name: 'Free Audit',
        description: 'Personalized assessment',
        changes: ['High perceived value', 'Consultative'],
        example: 'Free 30-minute audit of your current {{process}}'
      },
      {
        name: 'Educational Resource',
        description: 'Valuable content',
        changes: ['Low commitment', 'Educational'],
        example: 'The 2024 Guide to {{industry}} {{challenge}}'
      },
      {
        name: 'Interactive Tool',
        description: 'Calculator or assessment',
        changes: ['Self-serve', 'Immediate value'],
        example: 'Calculate your potential ROI in 2 minutes'
      },
      {
        name: 'Demo/Trial',
        description: 'Product experience',
        changes: ['Product-led', 'Hands-on'],
        example: '14-day free trial, no credit card required'
      }
    ],
    tips: [
      'Match offer to buyer stage',
      'Consider resource creation cost',
      'Track downstream conversion',
      'Test offer positioning, not just offer type'
    ]
  }
];

// Helper class for Sam to select appropriate tests
export class TestingCampaignSelector {
  /**
   * Get recommended tests based on campaign goals
   */
  static getRecommendedTests(
    goal: 'awareness' | 'engagement' | 'conversion' | 'optimization',
    currentMetrics?: {
      openRate?: number;
      replyRate?: number;
      meetingRate?: number;
    }
  ): TestingCampaignTemplate[] {
    const recommendations: TestingCampaignTemplate[] = [];
    
    if (goal === 'awareness') {
      // Focus on reach and initial engagement
      recommendations.push(
        TESTING_CAMPAIGN_TEMPLATES.find(t => t.id === 'subject-line-test')!,
        TESTING_CAMPAIGN_TEMPLATES.find(t => t.id === 'send-time-test')!,
        TESTING_CAMPAIGN_TEMPLATES.find(t => t.id === 'channel-preference')!
      );
    } else if (goal === 'engagement') {
      // Focus on getting responses
      recommendations.push(
        TESTING_CAMPAIGN_TEMPLATES.find(t => t.id === 'message-length-test')!,
        TESTING_CAMPAIGN_TEMPLATES.find(t => t.id === 'personalization-depth')!,
        TESTING_CAMPAIGN_TEMPLATES.find(t => t.id === 'cta-test')!
      );
    } else if (goal === 'conversion') {
      // Focus on meetings and deals
      recommendations.push(
        TESTING_CAMPAIGN_TEMPLATES.find(t => t.id === 'lead-magnet-test')!,
        TESTING_CAMPAIGN_TEMPLATES.find(t => t.id === 'follow-up-timing')!,
        TESTING_CAMPAIGN_TEMPLATES.find(t => t.id === 'persona-response')!
      );
    } else if (goal === 'optimization') {
      // Refine based on current performance
      if (currentMetrics) {
        if (currentMetrics.openRate && currentMetrics.openRate < 30) {
          recommendations.push(TESTING_CAMPAIGN_TEMPLATES.find(t => t.id === 'subject-line-test')!);
        }
        if (currentMetrics.replyRate && currentMetrics.replyRate < 10) {
          recommendations.push(TESTING_CAMPAIGN_TEMPLATES.find(t => t.id === 'cta-test')!);
        }
        if (currentMetrics.meetingRate && currentMetrics.meetingRate < 5) {
          recommendations.push(TESTING_CAMPAIGN_TEMPLATES.find(t => t.id === 'lead-magnet-test')!);
        }
      }
    }
    
    return recommendations.filter(Boolean);
  }

  /**
   * Generate test hypothesis based on current performance
   */
  static generateHypothesis(
    currentMetric: string,
    currentValue: number,
    targetImprovement: number
  ): string {
    const improvementPercent = ((targetImprovement - currentValue) / currentValue * 100).toFixed(0);
    
    return `By optimizing ${currentMetric}, we can improve from ${currentValue}% to ${targetImprovement}% (${improvementPercent}% improvement)`;
  }

  /**
   * Calculate required sample size for statistical significance
   */
  static calculateSampleSize(
    baselineConversion: number,
    minimumDetectableEffect: number,
    confidenceLevel: number = 95,
    statisticalPower: number = 80
  ): number {
    // Simplified sample size calculation
    const p1 = baselineConversion / 100;
    const p2 = (baselineConversion + minimumDetectableEffect) / 100;
    const pooledP = (p1 + p2) / 2;
    const pooledQ = 1 - pooledP;
    
    // Z-scores for confidence and power
    const zAlpha = confidenceLevel === 95 ? 1.96 : 2.58;
    const zBeta = statisticalPower === 80 ? 0.84 : 1.28;
    
    const sampleSize = Math.ceil(
      2 * pooledP * pooledQ * Math.pow(zAlpha + zBeta, 2) / Math.pow(p2 - p1, 2)
    );
    
    return sampleSize;
  }

  /**
   * Get test recommendations based on industry
   */
  static getIndustrySpecificTests(industry: string): TestingCampaignTemplate[] {
    const industryTests: Record<string, string[]> = {
      'saas': ['message-length-test', 'cta-test', 'lead-magnet-test'],
      'healthcare': ['personalization-depth', 'channel-preference', 'industry-messaging'],
      'finance': ['send-time-test', 'persona-response', 'subject-line-test'],
      'ecommerce': ['follow-up-timing', 'lead-magnet-test', 'channel-preference'],
      'enterprise': ['persona-response', 'personalization-depth', 'industry-messaging']
    };
    
    const testIds = industryTests[industry.toLowerCase()] || ['subject-line-test', 'cta-test'];
    
    return testIds
      .map(id => TESTING_CAMPAIGN_TEMPLATES.find(t => t.id === id))
      .filter(Boolean) as TestingCampaignTemplate[];
  }
}