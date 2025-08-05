// Bot Detection and Automated Traffic Filtering System

export interface BotDetectionResult {
  isBot: boolean;
  botScore: number; // 0-100, higher means more likely to be a bot
  confidence: number; // 0-100, confidence in the detection
  detectionMethods: string[];
  flags: string[];
  classification: 'human' | 'good_bot' | 'bad_bot' | 'suspicious';
  details: {
    userAgent: UserAgentAnalysis;
    behavioral: BehavioralAnalysis;
    network: NetworkAnalysis;
    timing: TimingAnalysis;
  };
}

export interface UserAgentAnalysis {
  isKnownBot: boolean;
  botType?: string;
  browserInfo: {
    name: string;
    version: string;
    isValid: boolean;
  };
  osInfo: {
    name: string;
    version: string;
    isValid: boolean;
  };
  suspiciousPatterns: string[];
}

export interface BehavioralAnalysis {
  requestPattern: 'human' | 'automated' | 'suspicious';
  interactionRate: number;
  scrollBehavior: 'natural' | 'unnatural' | 'none';
  clickPattern: 'human' | 'automated';
  sessionDuration: number;
  pageViewSequence: 'natural' | 'systematic' | 'random';
}

export interface NetworkAnalysis {
  ipReputation: 'good' | 'suspicious' | 'bad';
  isDataCenter: boolean;
  isVPN: boolean;
  isProxy: boolean;
  geolocationConsistency: boolean;
  requestFrequency: number;
}

export interface TimingAnalysis {
  requestInterval: number;
  responseTime: number;
  isConsistentTiming: boolean;
  humanLikeVariation: boolean;
}

export interface BotPattern {
  name: string;
  type: 'good_bot' | 'bad_bot';
  patterns: {
    userAgent: RegExp[];
    ipRanges?: string[];
    behaviorSignatures?: string[];
  };
  score: number;
}

export class BotDetection {
  private knownBotPatterns: BotPattern[];
  private suspiciousPatterns: RegExp[];
  private goodBotPatterns: BotPattern[];
  private requestHistory: Map<string, Array<{ timestamp: number; path: string }>>;

  constructor() {
    this.requestHistory = new Map();
    this.initializeBotPatterns();
    this.initializeSuspiciousPatterns();
    this.initializeGoodBotPatterns();
  }

  /**
   * Analyze request for bot characteristics
   */
  async analyzeRequest(requestData: {
    userAgent: string;
    ipAddress: string;
    path: string;
    timestamp: number;
    referrer?: string;
    headers: Record<string, string>;
    sessionId?: string;
    userId?: string;
    behaviorData?: {
      scrollDepth?: number;
      timeOnPage?: number;
      interactions?: number;
      clickCoordinates?: Array<{ x: number; y: number; timestamp: number }>;
    };
  }): Promise<BotDetectionResult> {
    const detectionMethods: string[] = [];
    const flags: string[] = [];
    let botScore = 0;
    let confidence = 50;

    // 1. User Agent Analysis
    const userAgentAnalysis = this.analyzeUserAgent(requestData.userAgent);
    if (userAgentAnalysis.isKnownBot) {
      botScore += 80;
      detectionMethods.push('user_agent_pattern');
      flags.push(`known_bot: ${userAgentAnalysis.botType}`);
    }

    if (userAgentAnalysis.suspiciousPatterns.length > 0) {
      botScore += 30;
      detectionMethods.push('suspicious_user_agent');
      flags.push(...userAgentAnalysis.suspiciousPatterns);
    }

    // 2. Behavioral Analysis
    const behavioralAnalysis = this.analyzeBehavior(requestData);
    if (behavioralAnalysis.requestPattern === 'automated') {
      botScore += 60;
      detectionMethods.push('automated_pattern');
      flags.push('automated_request_pattern');
    }

    if (behavioralAnalysis.scrollBehavior === 'none' && requestData.behaviorData?.timeOnPage && requestData.behaviorData.timeOnPage > 5000) {
      botScore += 40;
      detectionMethods.push('no_scroll_behavior');
      flags.push('no_scroll_long_duration');
    }

    // 3. Network Analysis
    const networkAnalysis = await this.analyzeNetwork(requestData.ipAddress);
    if (networkAnalysis.isDataCenter) {
      botScore += 50;
      detectionMethods.push('datacenter_ip');
      flags.push('datacenter_origin');
    }

    if (networkAnalysis.ipReputation === 'bad') {
      botScore += 70;
      detectionMethods.push('bad_ip_reputation');
      flags.push('malicious_ip');
    }

    // 4. Timing Analysis
    const timingAnalysis = this.analyzeTiming(requestData);
    if (timingAnalysis.isConsistentTiming && !timingAnalysis.humanLikeVariation) {
      botScore += 45;
      detectionMethods.push('consistent_timing');
      flags.push('robotic_timing_pattern');
    }

    // 5. Request Pattern Analysis
    const requestPatternScore = this.analyzeRequestPattern(requestData.ipAddress, requestData.path, requestData.timestamp);
    botScore += requestPatternScore;
    if (requestPatternScore > 30) {
      detectionMethods.push('suspicious_request_pattern');
      flags.push('high_frequency_requests');
    }

    // 6. Header Analysis
    const headerScore = this.analyzeHeaders(requestData.headers);
    botScore += headerScore;
    if (headerScore > 20) {
      detectionMethods.push('suspicious_headers');
      flags.push('missing_or_invalid_headers');
    }

    // Calculate final confidence
    confidence = Math.min(95, 50 + (detectionMethods.length * 10));

    // Determine classification
    let classification: BotDetectionResult['classification'] = 'human';
    const isBot = botScore > 50;

    if (isBot) {
      // Check if it's a good bot
      const isGoodBot = this.isGoodBot(userAgentAnalysis, networkAnalysis);
      if (isGoodBot) {
        classification = 'good_bot';
        botScore = Math.min(botScore, 70); // Good bots get lower scores
      } else if (botScore > 80) {
        classification = 'bad_bot';
      } else {
        classification = 'suspicious';
      }
    }

    return {
      isBot,
      botScore: Math.min(100, Math.max(0, botScore)),
      confidence,
      detectionMethods,
      flags,
      classification,
      details: {
        userAgent: userAgentAnalysis,
        behavioral: behavioralAnalysis,
        network: networkAnalysis,
        timing: timingAnalysis
      }
    };
  }

  /**
   * Real-time bot filtering for incoming events
   */
  async filterIncomingEvent(eventData: {
    userAgent: string;
    ipAddress: string;
    path: string;
    timestamp: number;
    headers: Record<string, string>;
    sessionData?: any;
  }): Promise<{
    shouldBlock: boolean;
    shouldFlag: boolean;
    reason: string;
    botDetection: BotDetectionResult;
  }> {
    const botDetection = await this.analyzeRequest(eventData);

    let shouldBlock = false;
    let shouldFlag = false;
    let reason = '';

    // Blocking criteria
    if (botDetection.classification === 'bad_bot') {
      shouldBlock = true;
      reason = 'Identified as malicious bot';
    } else if (botDetection.botScore > 90) {
      shouldBlock = true;
      reason = 'High bot score - likely automated traffic';
    } else if (botDetection.flags.includes('malicious_ip')) {
      shouldBlock = true;
      reason = 'Request from known malicious IP';
    }

    // Flagging criteria
    if (!shouldBlock && (botDetection.botScore > 60 || botDetection.classification === 'suspicious')) {
      shouldFlag = true;
      reason = 'Suspicious activity detected';
    }

    return {
      shouldBlock,
      shouldFlag,
      reason,
      botDetection
    };
  }

  /**
   * Analyze user agent string
   */
  private analyzeUserAgent(userAgent: string): UserAgentAnalysis {
    const suspiciousPatterns: string[] = [];
    let isKnownBot = false;
    let botType: string | undefined;

    // Check against known bot patterns
    for (const pattern of this.knownBotPatterns) {
      if (pattern.patterns.userAgent.some(regex => regex.test(userAgent))) {
        isKnownBot = true;
        botType = pattern.name;
        break;
      }
    }

    // Check for suspicious patterns
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(userAgent)) {
        suspiciousPatterns.push(pattern.source);
      }
    }

    // Parse browser and OS info
    const browserInfo = this.parseBrowserInfo(userAgent);
    const osInfo = this.parseOSInfo(userAgent);

    return {
      isKnownBot,
      botType,
      browserInfo,
      osInfo,
      suspiciousPatterns
    };
  }

  /**
   * Analyze behavioral patterns
   */
  private analyzeBehavior(requestData: any): BehavioralAnalysis {
    const behaviorData = requestData.behaviorData || {};
    
    // Analyze request pattern
    let requestPattern: BehavioralAnalysis['requestPattern'] = 'human';
    const requestHistory = this.requestHistory.get(requestData.ipAddress) || [];
    
    if (requestHistory.length > 10) {
      const intervals = requestHistory.slice(-10).map((req, i, arr) => 
        i > 0 ? req.timestamp - arr[i-1].timestamp : 0
      ).filter(interval => interval > 0);
      
      const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
      const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
      
      if (variance < 1000 && avgInterval < 5000) { // Very consistent, fast requests
        requestPattern = 'automated';
      } else if (variance > 100000) { // Very random timing
        requestPattern = 'suspicious';
      }
    }

    // Analyze scroll behavior
    let scrollBehavior: BehavioralAnalysis['scrollBehavior'] = 'none';
    if (behaviorData.scrollDepth !== undefined) {
      if (behaviorData.scrollDepth > 0) {
        scrollBehavior = 'natural'; // Could be enhanced with more sophisticated analysis
      }
    }

    // Analyze click pattern
    let clickPattern: BehavioralAnalysis['clickPattern'] = 'human';
    if (behaviorData.clickCoordinates && behaviorData.clickCoordinates.length > 0) {
      // Check for perfectly straight lines or repeated coordinates
      const coords = behaviorData.clickCoordinates;
      const repeatedCoords = coords.filter((coord, i, arr) => 
        arr.findIndex(c => c.x === coord.x && c.y === coord.y) !== i
      );
      
      if (repeatedCoords.length > coords.length * 0.5) {
        clickPattern = 'automated';
      }
    }

    return {
      requestPattern,
      interactionRate: behaviorData.interactions || 0,
      scrollBehavior,
      clickPattern,
      sessionDuration: behaviorData.timeOnPage || 0,
      pageViewSequence: 'natural' // Would need more data to determine
    };
  }

  /**
   * Analyze network characteristics
   */
  private async analyzeNetwork(ipAddress: string): Promise<NetworkAnalysis> {
    // This would typically integrate with IP reputation services
    // For now, we'll provide a mock implementation
    
    const isPrivateIP = this.isPrivateIP(ipAddress);
    const isDataCenter = await this.checkDataCenterIP(ipAddress);
    const ipReputation = await this.checkIPReputation(ipAddress);
    
    return {
      ipReputation: ipReputation as NetworkAnalysis['ipReputation'],
      isDataCenter,
      isVPN: false, // Would need VPN detection service
      isProxy: false, // Would need proxy detection service
      geolocationConsistency: true, // Would need geolocation tracking
      requestFrequency: this.calculateRequestFrequency(ipAddress)
    };
  }

  /**
   * Analyze timing patterns
   */
  private analyzeTiming(requestData: any): TimingAnalysis {
    const requestHistory = this.requestHistory.get(requestData.ipAddress) || [];
    
    if (requestHistory.length < 2) {
      return {
        requestInterval: 0,
        responseTime: 0,
        isConsistentTiming: false,
        humanLikeVariation: true
      };
    }

    const intervals = requestHistory.slice(-10).map((req, i, arr) => 
      i > 0 ? req.timestamp - arr[i-1].timestamp : 0
    ).filter(interval => interval > 0);

    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    const standardDeviation = Math.sqrt(variance);

    const isConsistentTiming = standardDeviation < avgInterval * 0.1; // Less than 10% variation
    const humanLikeVariation = standardDeviation > avgInterval * 0.2; // More than 20% variation

    return {
      requestInterval: avgInterval,
      responseTime: 0, // Would need response time tracking
      isConsistentTiming,
      humanLikeVariation
    };
  }

  /**
   * Analyze request patterns
   */
  private analyzeRequestPattern(ipAddress: string, path: string, timestamp: number): number {
    let score = 0;
    
    // Update request history
    const history = this.requestHistory.get(ipAddress) || [];
    history.push({ timestamp, path });
    
    // Keep only last 100 requests
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    this.requestHistory.set(ipAddress, history);

    // Check request frequency
    const recentRequests = history.filter(req => timestamp - req.timestamp < 60000); // Last minute
    if (recentRequests.length > 30) {
      score += 40; // Very high frequency
    } else if (recentRequests.length > 15) {
      score += 20; // High frequency
    }

    // Check for systematic path traversal
    const uniquePaths = new Set(history.slice(-20).map(req => req.path));
    if (uniquePaths.size === history.slice(-20).length && history.length > 10) {
      score += 30; // Systematic exploration
    }

    return score;
  }

  /**
   * Analyze HTTP headers
   */
  private analyzeHeaders(headers: Record<string, string>): number {
    let score = 0;

    // Check for missing common headers
    const commonHeaders = ['accept', 'accept-language', 'accept-encoding'];
    const missingHeaders = commonHeaders.filter(header => !headers[header.toLowerCase()]);
    score += missingHeaders.length * 10;

    // Check for suspicious header values
    if (headers['accept'] === '*/*') {
      score += 15; // Very generic accept header
    }

    if (!headers['accept-language']) {
      score += 20; // Missing language header
    }

    // Check for automation tools in headers
    const automationHeaders = ['selenium', 'phantomjs', 'headless', 'automation'];
    for (const [key, value] of Object.entries(headers)) {
      if (automationHeaders.some(tool => value.toLowerCase().includes(tool))) {
        score += 50;
        break;
      }
    }

    return score;
  }

  /**
   * Check if it's a good bot (search engines, etc.)
   */
  private isGoodBot(userAgentAnalysis: UserAgentAnalysis, networkAnalysis: NetworkAnalysis): boolean {
    if (userAgentAnalysis.isKnownBot) {
      return this.goodBotPatterns.some(pattern => 
        pattern.name === userAgentAnalysis.botType
      );
    }
    return false;
  }

  /**
   * Parse browser information from user agent
   */
  private parseBrowserInfo(userAgent: string): UserAgentAnalysis['browserInfo'] {
    // Simplified browser detection
    const browsers = [
      { name: 'Chrome', pattern: /Chrome\/(\d+)/ },
      { name: 'Firefox', pattern: /Firefox\/(\d+)/ },
      { name: 'Safari', pattern: /Safari\/(\d+)/ },
      { name: 'Edge', pattern: /Edge\/(\d+)/ }
    ];

    for (const browser of browsers) {
      const match = userAgent.match(browser.pattern);
      if (match) {
        return {
          name: browser.name,
          version: match[1],
          isValid: true
        };
      }
    }

    return {
      name: 'Unknown',
      version: '',
      isValid: false
    };
  }

  /**
   * Parse OS information from user agent
   */
  private parseOSInfo(userAgent: string): UserAgentAnalysis['osInfo'] {
    const osPatterns = [
      { name: 'Windows', pattern: /Windows NT (\d+\.\d+)/ },
      { name: 'macOS', pattern: /Mac OS X (\d+[._]\d+)/ },
      { name: 'Linux', pattern: /Linux/ },
      { name: 'Android', pattern: /Android (\d+)/ },
      { name: 'iOS', pattern: /OS (\d+_\d+)/ }
    ];

    for (const os of osPatterns) {
      const match = userAgent.match(os.pattern);
      if (match) {
        return {
          name: os.name,
          version: match[1] || '',
          isValid: true
        };
      }
    }

    return {
      name: 'Unknown',
      version: '',
      isValid: false
    };
  }

  /**
   * Check if IP is private/internal
   */
  private isPrivateIP(ip: string): boolean {
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./,
      /^::1$/,
      /^fc00:/,
      /^fe80:/
    ];

    return privateRanges.some(range => range.test(ip));
  }

  /**
   * Check if IP belongs to a data center
   */
  private async checkDataCenterIP(ipAddress: string): Promise<boolean> {
    // This would typically query an IP intelligence service
    // For now, return false
    return false;
  }

  /**
   * Check IP reputation
   */
  private async checkIPReputation(ipAddress: string): Promise<string> {
    // This would typically query threat intelligence services
    // For now, return 'good'
    return 'good';
  }

  /**
   * Calculate request frequency for IP
   */
  private calculateRequestFrequency(ipAddress: string): number {
    const history = this.requestHistory.get(ipAddress) || [];
    const now = Date.now();
    const recentRequests = history.filter(req => now - req.timestamp < 300000); // Last 5 minutes
    return recentRequests.length;
  }

  /**
   * Initialize known bot patterns
   */
  private initializeBotPatterns(): void {
    this.knownBotPatterns = [
      {
        name: 'Googlebot',
        type: 'good_bot',
        patterns: {
          userAgent: [/Googlebot/i, /Google-InspectionTool/i]
        },
        score: 90
      },
      {
        name: 'Bingbot',
        type: 'good_bot',
        patterns: {
          userAgent: [/bingbot/i, /BingPreview/i]
        },
        score: 90
      },
      {
        name: 'FacebookBot',
        type: 'good_bot',
        patterns: {
          userAgent: [/facebookexternalhit/i, /Facebot/i]
        },
        score: 85
      },
      {
        name: 'TwitterBot',
        type: 'good_bot',
        patterns: {
          userAgent: [/Twitterbot/i]
        },
        score: 85
      },
      {
        name: 'LinkedInBot',
        type: 'good_bot',
        patterns: {
          userAgent: [/LinkedInBot/i]
        },
        score: 85
      },
      {
        name: 'Scrapy',
        type: 'bad_bot',
        patterns: {
          userAgent: [/Scrapy/i]
        },
        score: 95
      },
      {
        name: 'Selenium',
        type: 'bad_bot',
        patterns: {
          userAgent: [/selenium/i, /webdriver/i]
        },
        score: 95
      },
      {
        name: 'PhantomJS',
        type: 'bad_bot',
        patterns: {
          userAgent: [/PhantomJS/i]
        },
        score: 95
      }
    ];
  }

  /**
   * Initialize suspicious patterns
   */
  private initializeSuspiciousPatterns(): void {
    this.suspiciousPatterns = [
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
      /perl/i,
      /ruby/i,
      /^$/,  // Empty user agent
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /harvest/i,
      /extract/i,
      /libwww/i,
      /winhttp/i,
      /httpclient/i
    ];
  }

  /**
   * Initialize good bot patterns
   */
  private initializeGoodBotPatterns(): void {
    this.goodBotPatterns = this.knownBotPatterns.filter(pattern => pattern.type === 'good_bot');
  }

  /**
   * Get bot detection statistics
   */
  getDetectionStats(): {
    totalRequests: number;
    botsDetected: number;
    goodBots: number;
    badBots: number;
    suspiciousRequests: number;
    topBotTypes: Array<{ name: string; count: number }>;
  } {
    // This would typically query stored detection results
    // For now, return mock data
    return {
      totalRequests: 0,
      botsDetected: 0,
      goodBots: 0,
      badBots: 0,
      suspiciousRequests: 0,
      topBotTypes: []
    };
  }

  /**
   * Update bot patterns (for machine learning improvements)
   */
  updateBotPatterns(newPatterns: BotPattern[]): void {
    // This would update the bot detection patterns based on new data
    this.knownBotPatterns.push(...newPatterns);
  }

  /**
   * Clear old request history to prevent memory leaks
   */
  cleanupRequestHistory(maxAge: number = 3600000): void { // 1 hour
    const now = Date.now();
    
    for (const [ip, history] of this.requestHistory.entries()) {
      const filteredHistory = history.filter(req => now - req.timestamp < maxAge);
      
      if (filteredHistory.length === 0) {
        this.requestHistory.delete(ip);
      } else {
        this.requestHistory.set(ip, filteredHistory);
      }
    }
  }
}