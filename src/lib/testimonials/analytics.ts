// Testimonials-specific analytics utilities
// This provides a safe wrapper around analytics calls to prevent errors

export const testimonialsAnalytics = {
  // Track page view
  trackPageView: () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: 'Testimonials Page',
        page_location: window.location.href,
        event_category: 'testimonials'
      });
    }
  },

  // Track search interactions
  trackSearch: (query: string, resultsCount: number) => {
    if (typeof window !== 'undefined' && window.gtag && query.length > 2) {
      window.gtag('event', 'search', {
        event_category: 'testimonials',
        search_term: query,
        results_count: resultsCount,
        source: 'testimonials_page'
      });
    }
  },

  // Track filter interactions
  trackFilter: (filters: {
    courses: string[];
    years: number[];
    verifiedOnly: boolean;
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'testimonials_filter', {
        event_category: 'testimonials',
        courses: filters.courses.join(',') || 'none',
        years: filters.years.join(',') || 'none',
        verified_only: filters.verifiedOnly,
        source: 'testimonials_page'
      });
    }
  },

  // Track sort interactions
  trackSort: (sortOption: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'testimonials_sort', {
        event_category: 'testimonials',
        sort_by: sortOption,
        source: 'testimonials_page'
      });
    }
  },

  // Track video play events
  trackVideoPlay: (videoId: string, studentName?: string, course?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'video_play', {
        event_category: 'testimonials',
        video_id: videoId,
        student_name: studentName || 'Unknown',
        course: course || 'Unknown',
        source: 'testimonials_page'
      });
    }
  },

  // Track CTA clicks from testimonials page
  trackCTAClick: (ctaType: 'demo' | 'courses' | 'contact', location: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'cta_click', {
        event_category: 'testimonials',
        cta_type: ctaType,
        cta_location: location,
        source: 'testimonials_page'
      });
    }
  },

  // Track testimonial interactions
  trackTestimonialInteraction: (action: 'view' | 'expand' | 'share', testimonialId: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'testimonial_interaction', {
        event_category: 'testimonials',
        action: action,
        testimonial_id: testimonialId,
        source: 'testimonials_page'
      });
    }
  }
};

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}