/**
 * Internal Linking System
 * Manages strategic internal links from existing website pages to blog content
 */

export interface InternalLink {
  id: string;
  sourcePage: string;
  sourceSection: string;
  targetBlogPost: string;
  anchorText: string;
  linkType: 'contextual' | 'resource' | 'related' | 'cta';
  position: 'header' | 'content' | 'sidebar' | 'footer';
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'inactive' | 'pending';
  metrics: {
    clicks: number;
    impressions: number;
    ctr: number;
  };
}

export interface LinkingStrategy {
  sourcePage: string;
  targetBlogPosts: string[];
  strategy: string;
  implementation: InternalLink[];
  expectedImpact: {
    trafficIncrease: number;
    seoValue: number;
    userExperience: number;
  };
}

export class InternalLinkingManager {
  private links: Map<string, InternalLink> = new Map();
  private strategies: Map<string, LinkingStrategy> = new Map();

  /**
   * Generate comprehensive internal linking strategy
   */
  generateLinkingStrategy(): LinkingStrategy[] {
    const strategies: LinkingStrategy[] = [
      {
        sourcePage: '/courses',
        targetBlogPosts: [
          'dgca-cpl-complete-guide-2024',
          'atpl-vs-cpl-pilot-license-comparison-guide',
          'dgca-ground-school-technical-general-vs-specific',
          'type-rating-a320-vs-b737-career-impact-analysis',
          'rtr-license-complete-guide-radio-telephony-pilots',
        ],
        strategy: 'Link from course descriptions to detailed blog guides for enhanced learning',
        implementation: [],
        expectedImpact: {
          trafficIncrease: 35,
          seoValue: 8,
          userExperience: 9,
        },
      },
      {
        sourcePage: '/',
        targetBlogPosts: [
          'pilot-salary-india-2024-career-earnings-guide',
          'airline-industry-career-opportunities-beyond-pilot-jobs',
          'dgca-cpl-complete-guide-2024',
          'aviation-technology-trends-future-flying-2024',
        ],
        strategy: 'Add contextual links in hero section and feature highlights',
        implementation: [],
        expectedImpact: {
          trafficIncrease: 50,
          seoValue: 9,
          userExperience: 8,
        },
      },
      {
        sourcePage: '/about',
        targetBlogPosts: [
          'dgca-medical-examination-tips-aspiring-pilots',
          'airline-pilot-interview-questions-expert-answers',
          'pilot-training-cost-india-complete-financial-guide',
        ],
        strategy: 'Link from instructor credentials and success stories to relevant guides',
        implementation: [],
        expectedImpact: {
          trafficIncrease: 25,
          seoValue: 7,
          userExperience: 8,
        },
      },
      {
        sourcePage: '/contact',
        targetBlogPosts: [
          'dgca-exam-preparation-study-plan-success-strategies',
          'aviation-english-proficiency-icao-level-4-requirements',
          'airline-recruitment-process-application-to-cockpit',
        ],
        strategy: 'Add resource links in contact form confirmation and FAQ sections',
        implementation: [],
        expectedImpact: {
          trafficIncrease: 20,
          seoValue: 6,
          userExperience: 7,
        },
      },
    ];

    // Generate specific link implementations for each strategy
    strategies.forEach(strategy => {
      strategy.implementation = this.generateLinksForPage(strategy.sourcePage, strategy.targetBlogPosts);
      this.strategies.set(strategy.sourcePage, strategy);
    });

    return strategies;
  }

  /**
   * Generate specific internal links for a page
   */
  private generateLinksForPage(sourcePage: string, targetBlogPosts: string[]): InternalLink[] {
    const links: InternalLink[] = [];

    switch (sourcePage) {
      case '/courses':
        links.push(
          ...this.generateCoursePageLinks(targetBlogPosts)
        );
        break;
      case '/':
        links.push(
          ...this.generateHomePageLinks(targetBlogPosts)
        );
        break;
      case '/about':
        links.push(
          ...this.generateAboutPageLinks(targetBlogPosts)
        );
        break;
      case '/contact':
        links.push(
          ...this.generateContactPageLinks(targetBlogPosts)
        );
        break;
    }

    // Store links in the manager
    links.forEach(link => {
      this.links.set(link.id, link);
    });

    return links;
  }

  /**
   * Generate links for courses page
   */
  private generateCoursePageLinks(targetBlogPosts: string[]): InternalLink[] {
    return [
      {
        id: this.generateLinkId(),
        sourcePage: '/courses',
        sourceSection: 'CPL Ground Training',
        targetBlogPost: 'dgca-cpl-complete-guide-2024',
        anchorText: 'Complete DGCA CPL Guide',
        linkType: 'resource',
        position: 'content',
        priority: 'high',
        status: 'active',
        metrics: { clicks: 0, impressions: 0, ctr: 0 },
      },
      {
        id: this.generateLinkId(),
        sourcePage: '/courses',
        sourceSection: 'ATPL Training',
        targetBlogPost: 'atpl-vs-cpl-pilot-license-comparison-guide',
        anchorText: 'ATPL vs CPL: Which to Choose?',
        linkType: 'contextual',
        position: 'content',
        priority: 'high',
        status: 'active',
        metrics: { clicks: 0, impressions: 0, ctr: 0 },
      },
      {
        id: this.generateLinkId(),
        sourcePage: '/courses',
        sourceSection: 'Technical Subjects',
        targetBlogPost: 'dgca-ground-school-technical-general-vs-specific',
        anchorText: 'Technical General vs Specific Guide',
        linkType: 'resource',
        position: 'content',
        priority: 'medium',
        status: 'active',
        metrics: { clicks: 0, impressions: 0, ctr: 0 },
      },
      {
        id: this.generateLinkId(),
        sourcePage: '/courses',
        sourceSection: 'Type Rating Prep',
        targetBlogPost: 'type-rating-a320-vs-b737-career-impact-analysis',
        anchorText: 'A320 vs B737 Career Impact Analysis',
        linkType: 'contextual',
        position: 'content',
        priority: 'high',
        status: 'active',
        metrics: { clicks: 0, impressions: 0, ctr: 0 },
      },
      {
        id: this.generateLinkId(),
        sourcePage: '/courses',
        sourceSection: 'RTR Training',
        targetBlogPost: 'rtr-license-complete-guide-radio-telephony-pilots',
        anchorText: 'Complete RTR License Guide',
        linkType: 'resource',
        position: 'content',
        priority: 'medium',
        status: 'active',
        metrics: { clicks: 0, impressions: 0, ctr: 0 },
      },
    ];
  }

  /**
   * Generate links for home page
   */
  private generateHomePageLinks(targetBlogPosts: string[]): InternalLink[] {
    return [
      {
        id: this.generateLinkId(),
        sourcePage: '/',
        sourceSection: 'Hero Section',
        targetBlogPost: 'pilot-salary-india-2024-career-earnings-guide',
        anchorText: 'Discover Pilot Salary Potential',
        linkType: 'cta',
        position: 'header',
        priority: 'high',
        status: 'active',
        metrics: { clicks: 0, impressions: 0, ctr: 0 },
      },
      {
        id: this.generateLinkId(),
        sourcePage: '/',
        sourceSection: 'Why Choose Us',
        targetBlogPost: 'dgca-cpl-complete-guide-2024',
        anchorText: 'Learn about DGCA CPL requirements',
        linkType: 'contextual',
        position: 'content',
        priority: 'high',
        status: 'active',
        metrics: { clicks: 0, impressions: 0, ctr: 0 },
      },
      {
        id: this.generateLinkId(),
        sourcePage: '/',
        sourceSection: 'Career Opportunities',
        targetBlogPost: 'airline-industry-career-opportunities-beyond-pilot-jobs',
        anchorText: 'Explore Aviation Career Paths',
        linkType: 'related',
        position: 'content',
        priority: 'medium',
        status: 'active',
        metrics: { clicks: 0, impressions: 0, ctr: 0 },
      },
      {
        id: this.generateLinkId(),
        sourcePage: '/',
        sourceSection: 'Industry Insights',
        targetBlogPost: 'aviation-technology-trends-future-flying-2024',
        anchorText: 'Future of Aviation Technology',
        linkType: 'related',
        position: 'content',
        priority: 'medium',
        status: 'active',
        metrics: { clicks: 0, impressions: 0, ctr: 0 },
      },
    ];
  }

  /**
   * Generate links for about page
   */
  private generateAboutPageLinks(targetBlogPosts: string[]): InternalLink[] {
    return [
      {
        id: this.generateLinkId(),
        sourcePage: '/about',
        sourceSection: 'Our Expertise',
        targetBlogPost: 'dgca-medical-examination-tips-aspiring-pilots',
        anchorText: 'DGCA Medical Examination Guide',
        linkType: 'resource',
        position: 'content',
        priority: 'medium',
        status: 'active',
        metrics: { clicks: 0, impressions: 0, ctr: 0 },
      },
      {
        id: this.generateLinkId(),
        sourcePage: '/about',
        sourceSection: 'Success Stories',
        targetBlogPost: 'airline-pilot-interview-questions-expert-answers',
        anchorText: 'Ace Your Pilot Interview',
        linkType: 'contextual',
        position: 'content',
        priority: 'high',
        status: 'active',
        metrics: { clicks: 0, impressions: 0, ctr: 0 },
      },
      {
        id: this.generateLinkId(),
        sourcePage: '/about',
        sourceSection: 'Training Approach',
        targetBlogPost: 'pilot-training-cost-india-complete-financial-guide',
        anchorText: 'Understanding Training Costs',
        linkType: 'resource',
        position: 'content',
        priority: 'medium',
        status: 'active',
        metrics: { clicks: 0, impressions: 0, ctr: 0 },
      },
    ];
  }

  /**
   * Generate links for contact page
   */
  private generateContactPageLinks(targetBlogPosts: string[]): InternalLink[] {
    return [
      {
        id: this.generateLinkId(),
        sourcePage: '/contact',
        sourceSection: 'FAQ Section',
        targetBlogPost: 'dgca-exam-preparation-study-plan-success-strategies',
        anchorText: 'DGCA Exam Preparation Strategies',
        linkType: 'resource',
        position: 'content',
        priority: 'medium',
        status: 'active',
        metrics: { clicks: 0, impressions: 0, ctr: 0 },
      },
      {
        id: this.generateLinkId(),
        sourcePage: '/contact',
        sourceSection: 'Course Inquiry Form',
        targetBlogPost: 'aviation-english-proficiency-icao-level-4-requirements',
        anchorText: 'Aviation English Requirements',
        linkType: 'contextual',
        position: 'content',
        priority: 'medium',
        status: 'active',
        metrics: { clicks: 0, impressions: 0, ctr: 0 },
      },
      {
        id: this.generateLinkId(),
        sourcePage: '/contact',
        sourceSection: 'Career Guidance',
        targetBlogPost: 'airline-recruitment-process-application-to-cockpit',
        anchorText: 'Airline Recruitment Process Guide',
        linkType: 'resource',
        position: 'content',
        priority: 'high',
        status: 'active',
        metrics: { clicks: 0, impressions: 0, ctr: 0 },
      },
    ];
  }

  /**
   * Generate React components for internal links
   */
  generateLinkComponents(): Record<string, string> {
    const components: Record<string, string> = {};

    // Home page link components
    components['HomePage_HeroSection'] = `
      <div className="mt-8 text-center">
        <Link 
          href="/blog/pilot-salary-india-2024-career-earnings-guide"
          className="inline-flex items-center px-6 py-3 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors duration-200"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Discover Pilot Salary Potential
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    `;

    components['HomePage_WhyChooseUs'] = `
      <p className="text-muted-foreground">
        Our comprehensive training programs cover all aspects of aviation education. 
        <Link 
          href="/blog/dgca-cpl-complete-guide-2024"
          className="text-teal-600 hover:text-teal-700 underline font-medium ml-1"
        >
          Learn about DGCA CPL requirements
        </Link> 
        and discover why thousands of students choose ATC for their aviation career.
      </p>
    `;

    // Courses page link components
    components['CoursesPage_CPLSection'] = `
      <div className="mt-4 p-4 bg-teal-50 rounded-lg border-l-4 border-teal-500">
        <h4 className="font-semibold text-teal-800 mb-2">📚 Comprehensive Study Guide</h4>
        <p className="text-sm text-teal-700 mb-3">
          Get detailed insights into DGCA CPL requirements, exam patterns, and preparation strategies.
        </p>
        <Link 
          href="/blog/dgca-cpl-complete-guide-2024"
          className="inline-flex items-center text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          Complete DGCA CPL Guide
          <ExternalLink className="w-3 h-3 ml-1" />
        </Link>
      </div>
    `;

    components['CoursesPage_TypeRatingSection'] = `
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
        <h4 className="font-semibold text-blue-800 mb-2">✈️ Career Impact Analysis</h4>
        <p className="text-sm text-blue-700 mb-3">
          Understand which type rating offers better career prospects and earning potential.
        </p>
        <Link 
          href="/blog/type-rating-a320-vs-b737-career-impact-analysis"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          A320 vs B737 Career Impact Analysis
          <ExternalLink className="w-3 h-3 ml-1" />
        </Link>
      </div>
    `;

    // About page link components
    components['AboutPage_SuccessStories'] = `
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <h4 className="font-semibold text-green-800 mb-2">🎯 Interview Success Tips</h4>
        <p className="text-sm text-green-700 mb-3">
          Learn from our experts how to excel in airline pilot interviews with proven strategies.
        </p>
        <Link 
          href="/blog/airline-pilot-interview-questions-expert-answers"
          className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700"
        >
          Ace Your Pilot Interview
          <ArrowRight className="w-3 h-3 ml-1" />
        </Link>
      </div>
    `;

    return components;
  }

  /**
   * Get linking performance analytics
   */
  getLinkingAnalytics(): {
    totalLinks: number;
    activeLinks: number;
    totalClicks: number;
    averageCTR: number;
    topPerformingLinks: InternalLink[];
    pagePerformance: Record<string, {
      links: number;
      clicks: number;
      ctr: number;
    }>;
  } {
    const allLinks = Array.from(this.links.values());
    const activeLinks = allLinks.filter(link => link.status === 'active');
    const totalClicks = allLinks.reduce((sum, link) => sum + link.metrics.clicks, 0);
    const totalImpressions = allLinks.reduce((sum, link) => sum + link.metrics.impressions, 0);
    const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    const topPerformingLinks = allLinks
      .sort((a, b) => b.metrics.ctr - a.metrics.ctr)
      .slice(0, 5);

    const pagePerformance: Record<string, any> = {};
    const pageGroups = this.groupLinksByPage(allLinks);
    
    Object.entries(pageGroups).forEach(([page, links]) => {
      const pageClicks = links.reduce((sum, link) => sum + link.metrics.clicks, 0);
      const pageImpressions = links.reduce((sum, link) => sum + link.metrics.impressions, 0);
      const pageCTR = pageImpressions > 0 ? (pageClicks / pageImpressions) * 100 : 0;

      pagePerformance[page] = {
        links: links.length,
        clicks: pageClicks,
        ctr: pageCTR,
      };
    });

    return {
      totalLinks: allLinks.length,
      activeLinks: activeLinks.length,
      totalClicks,
      averageCTR,
      topPerformingLinks,
      pagePerformance,
    };
  }

  /**
   * Update link metrics
   */
  updateLinkMetrics(linkId: string, metrics: Partial<InternalLink['metrics']>): void {
    const link = this.links.get(linkId);
    if (link) {
      link.metrics = { ...link.metrics, ...metrics };
      // Recalculate CTR
      if (link.metrics.impressions > 0) {
        link.metrics.ctr = (link.metrics.clicks / link.metrics.impressions) * 100;
      }
      this.links.set(linkId, link);
    }
  }

  private groupLinksByPage(links: InternalLink[]): Record<string, InternalLink[]> {
    return links.reduce((groups, link) => {
      const page = link.sourcePage;
      if (!groups[page]) {
        groups[page] = [];
      }
      groups[page].push(link);
      return groups;
    }, {} as Record<string, InternalLink[]>);
  }

  private generateLinkId(): string {
    return `internal_link_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
  }
}

// Export singleton instance
export const internalLinkingManager = new InternalLinkingManager();
