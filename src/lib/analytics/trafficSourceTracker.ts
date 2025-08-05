// Traffic Source Detection and AI Assistant Identification System

import { TrafficSource, UTMParameters } from '../firebase/types';

export interface TrafficSourceDetectionResult {
  source: TrafficSource;
  confidence: number;
  detectionMethod: string;
  rawData: {
    referrer: string;
    userAgent: string;
    utm: UTMParameters;
    url: string;
  };
}

export interface AIAssistantPattern {
  name: string;
  category: 'ai_assistant';
  patterns: {
    referrer: RegExp[];
    userAgent: RegExp[];
    urlParams: RegExp[];
  };
  confidence: number;
}

// AI Assistant Detection Patterns
const AI_ASSISTANT_PATTERNS: AIAssistantPattern[] = [
  {
    name: 'ChatGPT',
    category: 'ai_assistant',
    patterns: {
      referrer: [
        /chat\.openai\.com/i,
        /chatgpt\.com/i,
        /openai\.com\/chat/i
      ],
      userAgent: [
        /ChatGPT/i,
        /OpenAI/i,
        /GPTBot/i
      ],
      urlParams: [
        /utm_source=chatgpt/i,
        /utm_source=openai/i,
        /ref=chatgpt/i
      ]
    },
    confidence: 95
  },
  {
    name: 'Claude',
    category: 'ai_assistant',
    patterns: {
      referrer: [
        /claude\.ai/i,
        /anthropic\.com/i,
        /console\.anthropic\.com/i
      ],
      userAgent: [
        /Claude/i,
        /Anthropic/i,
        /ClaudeBot/i
      ],
      urlParams: [
        /utm_source=claude/i,
        /utm_source=anthropic/i,
        /ref=claude/i
      ]
    },
    confidence: 95
  },
  {
    name: 'Perplexity',
    category: 'ai_assistant',
    patterns: {
      referrer: [
        /perplexity\.ai/i,
        /www\.perplexity\.ai/i
      ],
      userAgent: [
        /Perplexity/i,
        /PerplexityBot/i
      ],
      urlParams: [
        /utm_source=perplexity/i,
        /ref=perplexity/i
      ]
    },
    confidence: 95
  },
  {
    name: 'Google Bard',
    category: 'ai_assistant',
    patterns: {
      referrer: [
        /bard\.google\.com/i,
        /gemini\.google\.com/i
      ],
      userAgent: [
        /Bard/i,
        /Gemini/i,
        /GoogleBot-AI/i
      ],
      urlParams: [
        /utm_source=bard/i,
        /utm_source=gemini/i,
        /ref=bard/i
      ]
    },
    confidence: 95
  },
  {
    name: 'Microsoft Copilot',
    category: 'ai_assistant',
    patterns: {
      referrer: [
        /copilot\.microsoft\.com/i,
        /bing\.com\/chat/i,
        /edge\.microsoft\.com\/chat/i
      ],
      userAgent: [
        /Copilot/i,
        /BingBot/i,
        /EdgeBot/i
      ],
      urlParams: [
        /utm_source=copilot/i,
        /utm_source=bing_chat/i,
        /ref=copilot/i
      ]
    },
    confidence: 95
  },
  {
    name: 'You.com',
    category: 'ai_assistant',
    patterns: {
      referrer: [
        /you\.com/i,
        /chat\.you\.com/i
      ],
      userAgent: [
        /YouBot/i,
        /You\.com/i
      ],
      urlParams: [
        /utm_source=you/i,
        /ref=you\.com/i
      ]
    },
    confidence: 90
  },
  {
    name: 'Character.AI',
    category: 'ai_assistant',
    patterns: {
      referrer: [
        /character\.ai/i,
        /beta\.character\.ai/i
      ],
      userAgent: [
        /Character\.AI/i,
        /CharacterBot/i
      ],
      urlParams: [
        /utm_source=character/i,
        /ref=character\.ai/i
      ]
    },
    confidence: 90
  }
];

// Search Engine Patterns
const SEARCH_ENGINE_PATTERNS = [
  {
    name: 'Google',
    category: 'organic',
    patterns: {
      referrer: [
        /google\./i,
        /www\.google\./i,
        /search\.google\./i
      ],
      userAgent: [
        /Googlebot/i
      ]
    },
    confidence: 98
  },
  {
    name: 'Bing',
    category: 'organic',
    patterns: {
      referrer: [
        /bing\.com/i,
        /www\.bing\.com/i
      ],
      userAgent: [
        /bingbot/i
      ]
    },
    confidence: 95
  },
  {
    name: 'Yahoo',
    category: 'organic',
    patterns: {
      referrer: [
        /yahoo\.com/i,
        /search\.yahoo\.com/i
      ],
      userAgent: [
        /Slurp/i
      ]
    },
    confidence: 95
  },
  {
    name: 'DuckDuckGo',
    category: 'organic',
    patterns: {
      referrer: [
        /duckduckgo\.com/i
      ],
      userAgent: [
        /DuckDuckBot/i
      ]
    },
    confidence: 95
  }
];

// Social Media Patterns
const SOCIAL_MEDIA_PATTERNS = [
  {
    name: 'Facebook',
    category: 'social',
    patterns: {
      referrer: [
        /facebook\.com/i,
        /fb\.com/i,
        /m\.facebook\.com/i
      ],
      userAgent: [
        /facebookexternalhit/i
      ]
    },
    confidence: 98
  },
  {
    name: 'Instagram',
    category: 'social',
    patterns: {
      referrer: [
        /instagram\.com/i,
        /www\.instagram\.com/i
      ],
      userAgent: [
        /Instagram/i
      ]
    },
    confidence: 98
  },
  {
    name: 'Twitter',
    category: 'social',
    patterns: {
      referrer: [
        /twitter\.com/i,
        /t\.co/i,
        /x\.com/i
      ],
      userAgent: [
        /Twitterbot/i
      ]
    },
    confidence: 98
  },
  {
    name: 'LinkedIn',
    category: 'social',
    patterns: {
      referrer: [
        /linkedin\.com/i,
        /lnkd\.in/i
      ],
      userAgent: [
        /LinkedInBot/i
      ]
    },
    confidence: 98
  },
  {
    name: 'YouTube',
    category: 'social',
    patterns: {
      referrer: [
        /youtube\.com/i,
        /youtu\.be/i
      ],
      userAgent: [
        /YoutubeBot/i
      ]
    },
    confidence: 98
  }
];

export class TrafficSourceTracker {
  private allPatterns: any[];

  constructor() {
    this.allPatterns = [
      ...AI_ASSISTANT_PATTERNS,
      ...SEARCH_ENGINE_PATTERNS,
      ...SOCIAL_MEDIA_PATTERNS
    ];
  }

  /**
   * Detect traffic source from request data
   */
  detectTrafficSource(
    referrer: string = '',
    userAgent: string = '',
    url: string = '',
    utmParams: UTMParameters = {}
  ): TrafficSourceDetectionResult {
    const rawData = { referrer, userAgent, utm: utmParams, url };

    // 1. Check UTM parameters first (highest priority)
    const utmResult = this.detectFromUTM(utmParams);
    if (utmResult) {
      return {
        source: utmResult,
        confidence: 100,
        detectionMethod: 'utm_parameters',
        rawData
      };
    }

    // 2. Check AI Assistant patterns
    const aiResult = this.detectAIAssistant(referrer, userAgent, url);
    if (aiResult) {
      return {
        source: aiResult.source,
        confidence: aiResult.confidence,
        detectionMethod: 'ai_assistant_pattern',
        rawData
      };
    }

    // 3. Check search engines
    const searchResult = this.detectSearchEngine(referrer, userAgent);
    if (searchResult) {
      return {
        source: searchResult.source,
        confidence: searchResult.confidence,
        detectionMethod: 'search_engine_pattern',
        rawData
      };
    }

    // 4. Check social media
    const socialResult = this.detectSocialMedia(referrer, userAgent);
    if (socialResult) {
      return {
        source: socialResult.source,
        confidence: socialResult.confidence,
        detectionMethod: 'social_media_pattern',
        rawData
      };
    }

    // 5. Check for email referrers
    const emailResult = this.detectEmail(referrer);
    if (emailResult) {
      return {
        source: emailResult,
        confidence: 90,
        detectionMethod: 'email_pattern',
        rawData
      };
    }

    // 6. Check for paid advertising
    const paidResult = this.detectPaidAdvertising(referrer, utmParams);
    if (paidResult) {
      return {
        source: paidResult,
        confidence: 95,
        detectionMethod: 'paid_advertising',
        rawData
      };
    }

    // 7. Default to direct traffic
    return {
      source: this.createDirectTrafficSource(),
      confidence: referrer ? 60 : 95, // Lower confidence if there's an unrecognized referrer
      detectionMethod: 'default_direct',
      rawData
    };
  }

  /**
   * Detect traffic source from UTM parameters
   */
  private detectFromUTM(utm: UTMParameters): TrafficSource | null {
    if (!utm.source) return null;

    const source = utm.source.toLowerCase();
    const medium = utm.medium?.toLowerCase() || 'unknown';
    const campaign = utm.campaign || undefined;

    // Determine category based on source and medium
    let category: TrafficSource['category'] = 'referral';

    if (medium === 'organic' || source.includes('google') || source.includes('bing')) {
      category = 'organic';
    } else if (medium === 'social' || ['facebook', 'instagram', 'twitter', 'linkedin'].includes(source)) {
      category = 'social';
    } else if (medium === 'email' || source.includes('email')) {
      category = 'email';
    } else if (medium === 'cpc' || medium === 'paid' || medium === 'ppc') {
      category = 'paid';
    } else if (['chatgpt', 'claude', 'perplexity', 'bard', 'copilot'].includes(source)) {
      category = 'ai_assistant';
    }

    return {
      id: `utm_${source}_${medium}_${Date.now()}`,
      category,
      source: utm.source,
      medium: utm.medium || 'unknown',
      campaign,
      content: utm.content,
      term: utm.term,
      isAuthentic: true,
      confidence: 100,
      detectedAt: new Date()
    };
  }

  /**
   * Detect AI Assistant traffic
   */
  private detectAIAssistant(referrer: string, userAgent: string, url: string): { source: TrafficSource; confidence: number } | null {
    for (const pattern of AI_ASSISTANT_PATTERNS) {
      let matches = 0;
      let totalChecks = 0;

      // Check referrer patterns
      if (referrer) {
        totalChecks++;
        if (pattern.patterns.referrer.some(regex => regex.test(referrer))) {
          matches++;
        }
      }

      // Check user agent patterns
      if (userAgent) {
        totalChecks++;
        if (pattern.patterns.userAgent.some(regex => regex.test(userAgent))) {
          matches++;
        }
      }

      // Check URL parameters
      if (url) {
        totalChecks++;
        if (pattern.patterns.urlParams.some(regex => regex.test(url))) {
          matches++;
        }
      }

      // If we have matches, calculate confidence
      if (matches > 0 && totalChecks > 0) {
        const matchRatio = matches / totalChecks;
        const confidence = Math.round(pattern.confidence * matchRatio);

        if (confidence >= 70) { // Minimum confidence threshold
          return {
            source: {
              id: `ai_${pattern.name.toLowerCase()}_${Date.now()}`,
              category: 'ai_assistant',
              source: pattern.name,
              medium: 'ai_assistant',
              isAuthentic: true,
              confidence,
              detectedAt: new Date()
            },
            confidence
          };
        }
      }
    }

    return null;
  }

  /**
   * Detect search engine traffic
   */
  private detectSearchEngine(referrer: string, userAgent: string): { source: TrafficSource; confidence: number } | null {
    for (const pattern of SEARCH_ENGINE_PATTERNS) {
      let isMatch = false;

      // Check referrer patterns
      if (referrer && pattern.patterns.referrer.some(regex => regex.test(referrer))) {
        isMatch = true;
      }

      // Check user agent patterns
      if (userAgent && pattern.patterns.userAgent?.some(regex => regex.test(userAgent))) {
        isMatch = true;
      }

      if (isMatch) {
        return {
          source: {
            id: `search_${pattern.name.toLowerCase()}_${Date.now()}`,
            category: 'organic',
            source: pattern.name,
            medium: 'organic',
            isAuthentic: true,
            confidence: pattern.confidence,
            detectedAt: new Date()
          },
          confidence: pattern.confidence
        };
      }
    }

    return null;
  }

  /**
   * Detect social media traffic
   */
  private detectSocialMedia(referrer: string, userAgent: string): { source: TrafficSource; confidence: number } | null {
    for (const pattern of SOCIAL_MEDIA_PATTERNS) {
      let isMatch = false;

      // Check referrer patterns
      if (referrer && pattern.patterns.referrer.some(regex => regex.test(referrer))) {
        isMatch = true;
      }

      // Check user agent patterns
      if (userAgent && pattern.patterns.userAgent?.some(regex => regex.test(userAgent))) {
        isMatch = true;
      }

      if (isMatch) {
        return {
          source: {
            id: `social_${pattern.name.toLowerCase()}_${Date.now()}`,
            category: 'social',
            source: pattern.name,
            medium: 'social',
            isAuthentic: true,
            confidence: pattern.confidence,
            detectedAt: new Date()
          },
          confidence: pattern.confidence
        };
      }
    }

    return null;
  }

  /**
   * Detect email traffic
   */
  private detectEmail(referrer: string): TrafficSource | null {
    const emailPatterns = [
      /mail\./i,
      /email/i,
      /newsletter/i,
      /campaign/i,
      /mailchimp/i,
      /constantcontact/i,
      /sendgrid/i,
      /mailgun/i
    ];

    if (referrer && emailPatterns.some(pattern => pattern.test(referrer))) {
      return {
        id: `email_${Date.now()}`,
        category: 'email',
        source: 'email',
        medium: 'email',
        isAuthentic: true,
        confidence: 90,
        detectedAt: new Date()
      };
    }

    return null;
  }

  /**
   * Detect paid advertising traffic
   */
  private detectPaidAdvertising(referrer: string, utm: UTMParameters): TrafficSource | null {
    const paidMediums = ['cpc', 'ppc', 'paid', 'display', 'banner', 'affiliate'];
    const paidSources = ['googleads', 'facebook-ads', 'instagram-ads', 'linkedin-ads', 'twitter-ads'];

    if (utm.medium && paidMediums.includes(utm.medium.toLowerCase())) {
      return {
        id: `paid_${utm.source || 'unknown'}_${Date.now()}`,
        category: 'paid',
        source: utm.source || 'unknown',
        medium: utm.medium,
        campaign: utm.campaign,
        isAuthentic: true,
        confidence: 95,
        detectedAt: new Date()
      };
    }

    if (utm.source && paidSources.some(source => utm.source!.toLowerCase().includes(source))) {
      return {
        id: `paid_${utm.source}_${Date.now()}`,
        category: 'paid',
        source: utm.source,
        medium: utm.medium || 'paid',
        campaign: utm.campaign,
        isAuthentic: true,
        confidence: 95,
        detectedAt: new Date()
      };
    }

    return null;
  }

  /**
   * Create direct traffic source
   */
  private createDirectTrafficSource(): TrafficSource {
    return {
      id: `direct_${Date.now()}`,
      category: 'direct',
      source: 'direct',
      medium: 'none',
      isAuthentic: true,
      confidence: 95,
      detectedAt: new Date()
    };
  }

  /**
   * Parse UTM parameters from URL
   */
  parseUTMParameters(url: string): UTMParameters {
    try {
      const urlObj = new URL(url);
      const params = urlObj.searchParams;

      return {
        source: params.get('utm_source') || undefined,
        medium: params.get('utm_medium') || undefined,
        campaign: params.get('utm_campaign') || undefined,
        content: params.get('utm_content') || undefined,
        term: params.get('utm_term') || undefined
      };
    } catch (error) {
      return {};
    }
  }

  /**
   * Validate source authenticity
   */
  validateSourceAuthenticity(
    detectionResult: TrafficSourceDetectionResult,
    additionalChecks: {
      ipAddress?: string;
      timestamp?: Date;
      sessionData?: any;
    } = {}
  ): { isAuthentic: boolean; confidence: number; flags: string[] } {
    const flags: string[] = [];
    let confidence = detectionResult.confidence;
    let isAuthentic = true;

    // Check for suspicious patterns
    if (detectionResult.rawData.userAgent) {
      const ua = detectionResult.rawData.userAgent.toLowerCase();
      
      // Check for bot patterns
      if (ua.includes('bot') || ua.includes('crawler') || ua.includes('spider')) {
        flags.push('bot_user_agent');
        confidence = Math.max(confidence - 30, 10);
      }

      // Check for suspicious user agents
      if (ua.length < 10 || ua.includes('curl') || ua.includes('wget')) {
        flags.push('suspicious_user_agent');
        confidence = Math.max(confidence - 20, 10);
        isAuthentic = false;
      }
    }

    // Check referrer consistency
    if (detectionResult.source.category === 'ai_assistant' && !detectionResult.rawData.referrer) {
      flags.push('missing_expected_referrer');
      confidence = Math.max(confidence - 15, 10);
    }

    // Check for UTM parameter manipulation
    if (detectionResult.detectionMethod === 'utm_parameters') {
      const utm = detectionResult.rawData.utm;
      if (utm.source && utm.source.length > 100) {
        flags.push('suspicious_utm_length');
        confidence = Math.max(confidence - 10, 10);
      }
    }

    // Final authenticity determination
    if (confidence < 50 || flags.length > 2) {
      isAuthentic = false;
    }

    return {
      isAuthentic,
      confidence: Math.round(confidence),
      flags
    };
  }

  /**
   * Get AI assistant detection statistics
   */
  getAIAssistantStats(): { name: string; patterns: number; confidence: number }[] {
    return AI_ASSISTANT_PATTERNS.map(pattern => ({
      name: pattern.name,
      patterns: pattern.patterns.referrer.length + 
               pattern.patterns.userAgent.length + 
               pattern.patterns.urlParams.length,
      confidence: pattern.confidence
    }));
  }

  /**
   * Test traffic source detection with sample data
   */
  testDetection(testCases: Array<{
    referrer: string;
    userAgent: string;
    url: string;
    expected: string;
  }>): Array<{ test: any; result: TrafficSourceDetectionResult; passed: boolean }> {
    return testCases.map(testCase => {
      const utm = this.parseUTMParameters(testCase.url);
      const result = this.detectTrafficSource(
        testCase.referrer,
        testCase.userAgent,
        testCase.url,
        utm
      );
      
      const passed = result.source.source.toLowerCase().includes(testCase.expected.toLowerCase()) ||
                    result.source.category === testCase.expected.toLowerCase();

      return {
        test: testCase,
        result,
        passed
      };
    });
  }
}