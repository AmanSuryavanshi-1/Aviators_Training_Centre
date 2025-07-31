import { CTATemplateCreateInput } from '@/lib/types/cta';

// Pre-built high-converting CTA templates for aviation training
export const ctaTemplateLibrary: CTATemplateCreateInput[] = [
  // Course Enrollment CTAs
  {
    name: 'DGCA CPL Enrollment - Urgent',
    category: 'course-enrollment',
    ctaType: 'course-promo',
    style: 'card',
    title: 'Ready to Start Your DGCA CPL Journey?',
    description: 'Join 500+ successful pilots who started their career with our comprehensive DGCA CPL training program. 95% first-attempt pass rate guaranteed.',
    primaryButton: {
      text: 'Enroll Now - Limited Seats',
      action: 'course-page',
      style: 'urgent',
      targetUrl: '/courses/cpl-ground-school',
    },
    secondaryButton: {
      text: 'Download Syllabus',
      action: 'download',
      style: 'secondary',
      targetUrl: '/downloads/cpl-syllabus.pdf',
    },
    urgencyElements: {
      limitedOffer: 'Early Bird Discount - Save ₹50,000',
      socialProof: 'Trusted by 1000+ aspiring pilots',
      urgencyMessage: 'Next batch starts in 15 days',
      enableCountdown: true,
      countdownDuration: 360, // 15 days in hours
    },
    targetAudience: ['aspiring-pilots', 'career-changers'],
    keywords: ['dgca', 'cpl', 'commercial pilot license', 'ground school'],
    conversionGoal: 'enrollment',
    priority: 90,
    positioning: {
      allowedPositions: ['top', 'middle', 'bottom'],
      preferredPosition: 'bottom',
    },
    displayRules: {
      deviceTypes: ['desktop', 'tablet', 'mobile'],
    },
  },

  {
    name: 'ATPL Ground School - Premium',
    category: 'course-enrollment',
    ctaType: 'course-promo',
    style: 'gradient',
    title: 'Advance to ATPL - Captain Level Training',
    description: 'Take the next step in your aviation career with our comprehensive ATPL ground school. Designed for serious pilots aiming for airline careers.',
    primaryButton: {
      text: 'Start ATPL Training',
      action: 'course-page',
      style: 'primary',
      targetUrl: '/courses/atpl-ground-school',
    },
    secondaryButton: {
      text: 'Compare with CPL',
      action: 'external-link',
      style: 'outline',
      targetUrl: '/blog/atpl-vs-cpl-comparison',
    },
    urgencyElements: {
      socialProof: 'Preferred by 200+ airline pilots',
      urgencyMessage: 'Limited seats for premium batch',
    },
    targetAudience: ['licensed-pilots', 'student-pilots'],
    keywords: ['atpl', 'airline transport pilot', 'captain training', 'advanced'],
    conversionGoal: 'enrollment',
    priority: 85,
    positioning: {
      allowedPositions: ['middle', 'bottom'],
      preferredPosition: 'bottom',
    },
    displayRules: {
      deviceTypes: ['desktop', 'tablet', 'mobile'],
    },
  },

  {
    name: 'Type Rating A320/B737 - High Converting',
    category: 'course-enrollment',
    ctaType: 'course-promo',
    style: 'testimonial',
    title: 'Master A320 & B737 Type Ratings',
    description: 'Get certified on the most in-demand aircraft types. Our type rating preparation has helped 300+ pilots secure airline positions.',
    primaryButton: {
      text: 'Book Type Rating Prep',
      action: 'demo-booking',
      style: 'success',
      targetUrl: '/contact?service=type-rating',
    },
    secondaryButton: {
      text: 'View Success Stories',
      action: 'external-link',
      style: 'link',
      targetUrl: '/testimonials',
    },
    urgencyElements: {
      socialProof: '300+ pilots certified',
      urgencyMessage: 'IndiGo hiring season starts soon',
    },
    targetAudience: ['licensed-pilots', 'student-pilots'],
    keywords: ['type rating', 'a320', 'b737', 'airline', 'indigo'],
    conversionGoal: 'demo',
    priority: 80,
    positioning: {
      allowedPositions: ['middle', 'bottom', 'sidebar'],
      preferredPosition: 'middle',
    },
    displayRules: {
      deviceTypes: ['desktop', 'tablet', 'mobile'],
    },
  },

  // Free Consultation CTAs
  {
    name: 'Free Career Consultation - Expert Guidance',
    category: 'consultation',
    ctaType: 'lead-gen',
    style: 'banner',
    title: 'Get Expert Aviation Career Guidance',
    description: 'Book a free 30-minute consultation with our aviation career experts. Get personalized advice on your pilot training journey.',
    primaryButton: {
      text: 'Book Free Consultation',
      action: 'contact-form',
      style: 'primary',
      targetUrl: '/contact?type=consultation',
    },
    secondaryButton: {
      text: 'Call Now',
      action: 'phone-call',
      style: 'secondary',
      targetUrl: 'tel:+919876543210',
    },
    urgencyElements: {
      socialProof: 'Trusted by 1000+ aspiring pilots',
      urgencyMessage: 'Limited consultation slots available',
    },
    targetAudience: ['aspiring-pilots', 'career-changers', 'fresh-graduates'],
    keywords: ['career guidance', 'consultation', 'expert advice', 'pilot career'],
    conversionGoal: 'consultation',
    priority: 75,
    positioning: {
      allowedPositions: ['top', 'middle', 'floating'],
      preferredPosition: 'top',
    },
    displayRules: {
      deviceTypes: ['desktop', 'tablet', 'mobile'],
    },
  },

  {
    name: 'Financial Planning Consultation',
    category: 'consultation',
    ctaType: 'lead-gen',
    style: 'card',
    title: 'Plan Your Pilot Training Investment',
    description: 'Understand the complete cost of pilot training and explore financing options. Get expert guidance on budgeting for your aviation career.',
    primaryButton: {
      text: 'Get Financial Guidance',
      action: 'contact-form',
      style: 'primary',
      targetUrl: '/contact?type=financial-planning',
    },
    urgencyElements: {
      socialProof: 'Helped 500+ students plan their training',
    },
    targetAudience: ['aspiring-pilots', 'working-professionals'],
    keywords: ['cost', 'fees', 'financing', 'budget', 'investment'],
    conversionGoal: 'consultation',
    priority: 70,
    positioning: {
      allowedPositions: ['middle', 'bottom'],
      preferredPosition: 'middle',
    },
    displayRules: {
      deviceTypes: ['desktop', 'tablet', 'mobile'],
    },
  },

  // Demo Booking CTAs
  {
    name: 'Free Demo Class - Experience Excellence',
    category: 'demo-booking',
    ctaType: 'lead-gen',
    style: 'gradient',
    title: 'Experience Our Teaching Excellence',
    description: 'Attend a free demo class and see why 95% of our students pass DGCA exams on their first attempt. Limited demo slots available.',
    primaryButton: {
      text: 'Book Demo Class',
      action: 'demo-booking',
      style: 'urgent',
      targetUrl: '/contact?type=demo-booking',
    },
    secondaryButton: {
      text: 'Watch Sample Video',
      action: 'external-link',
      style: 'outline',
      targetUrl: '/videos/sample-class',
    },
    urgencyElements: {
      limitedOffer: 'Free demo class worth ₹2,000',
      socialProof: '95% first-attempt pass rate',
      urgencyMessage: 'Only 10 demo slots left this month',
    },
    targetAudience: ['aspiring-pilots', 'student-pilots'],
    keywords: ['demo', 'free class', 'trial', 'experience'],
    conversionGoal: 'demo',
    priority: 85,
    positioning: {
      allowedPositions: ['top', 'middle', 'bottom'],
      preferredPosition: 'middle',
    },
    displayRules: {
      deviceTypes: ['desktop', 'tablet', 'mobile'],
    },
  },

  {
    name: 'RTR License Demo - Specialized',
    category: 'demo-booking',
    ctaType: 'course-promo',
    style: 'inline',
    title: 'Master Radio Telephony Communication',
    description: 'Join our specialized RTR(A) training program. Experience our unique teaching methodology in a free demo session.',
    primaryButton: {
      text: 'Book RTR Demo',
      action: 'demo-booking',
      style: 'primary',
      targetUrl: '/contact?service=rtr&type=demo',
    },
    urgencyElements: {
      socialProof: '100% RTR exam pass rate',
    },
    targetAudience: ['student-pilots', 'licensed-pilots'],
    keywords: ['rtr', 'radio telephony', 'communication', 'license'],
    conversionGoal: 'demo',
    priority: 65,
    positioning: {
      allowedPositions: ['middle', 'bottom'],
      preferredPosition: 'middle',
    },
    displayRules: {
      deviceTypes: ['desktop', 'tablet', 'mobile'],
    },
  },

  // Contact Form CTAs
  {
    name: 'Quick Contact - General Inquiry',
    category: 'contact-form',
    ctaType: 'direct-contact',
    style: 'minimal',
    title: 'Have Questions? We\'re Here to Help',
    description: 'Get instant answers to your aviation training questions. Our experts respond within 2 hours.',
    primaryButton: {
      text: 'Contact Us',
      action: 'contact-form',
      style: 'primary',
      targetUrl: '/contact',
    },
    secondaryButton: {
      text: 'WhatsApp',
      action: 'whatsapp',
      style: 'secondary',
      targetUrl: 'https://wa.me/919876543210',
    },
    urgencyElements: {
      socialProof: 'Response within 2 hours',
    },
    targetAudience: ['aspiring-pilots', 'student-pilots', 'working-professionals'],
    keywords: ['contact', 'help', 'questions', 'support'],
    conversionGoal: 'contact',
    priority: 60,
    positioning: {
      allowedPositions: ['sidebar', 'floating'],
      preferredPosition: 'sidebar',
    },
    displayRules: {
      deviceTypes: ['desktop', 'tablet', 'mobile'],
    },
  },

  {
    name: 'Interview Preparation Contact',
    category: 'contact-form',
    ctaType: 'course-promo',
    style: 'card',
    title: 'Ace Your Airline Interview',
    description: 'Get personalized interview preparation coaching from experienced airline pilots. Boost your confidence and success rate.',
    primaryButton: {
      text: 'Get Interview Coaching',
      action: 'contact-form',
      style: 'success',
      targetUrl: '/contact?service=interview-prep',
    },
    urgencyElements: {
      socialProof: '90% interview success rate',
      urgencyMessage: 'Airline hiring season is active',
    },
    targetAudience: ['licensed-pilots', 'student-pilots'],
    keywords: ['interview', 'airline', 'preparation', 'coaching'],
    conversionGoal: 'contact',
    priority: 75,
    positioning: {
      allowedPositions: ['middle', 'bottom'],
      preferredPosition: 'bottom',
    },
    displayRules: {
      deviceTypes: ['desktop', 'tablet', 'mobile'],
    },
  },

  // Resource Download CTAs
  {
    name: 'DGCA Exam Guide Download',
    category: 'resource-download',
    ctaType: 'resource-access',
    style: 'banner',
    title: 'Free DGCA Exam Preparation Guide',
    description: 'Download our comprehensive 50-page DGCA exam preparation guide. Includes study plan, tips, and practice questions.',
    primaryButton: {
      text: 'Download Free Guide',
      action: 'download',
      style: 'primary',
      targetUrl: '/downloads/dgca-exam-guide.pdf',
    },
    urgencyElements: {
      socialProof: 'Downloaded by 5000+ students',
      limitedOffer: 'Free for limited time',
    },
    targetAudience: ['aspiring-pilots', 'student-pilots'],
    keywords: ['dgca', 'exam', 'guide', 'preparation', 'study'],
    conversionGoal: 'download',
    priority: 70,
    positioning: {
      allowedPositions: ['top', 'middle'],
      preferredPosition: 'top',
    },
    displayRules: {
      deviceTypes: ['desktop', 'tablet', 'mobile'],
    },
  },

  {
    name: 'Aviation Career Roadmap',
    category: 'resource-download',
    ctaType: 'resource-access',
    style: 'card',
    title: 'Your Complete Aviation Career Roadmap',
    description: 'Get our detailed career roadmap showing every step from zero to airline pilot. Includes timeline, costs, and requirements.',
    primaryButton: {
      text: 'Get Career Roadmap',
      action: 'download',
      style: 'primary',
      targetUrl: '/downloads/aviation-career-roadmap.pdf',
    },
    urgencyElements: {
      socialProof: 'Trusted by 3000+ career changers',
    },
    targetAudience: ['aspiring-pilots', 'career-changers', 'fresh-graduates'],
    keywords: ['career', 'roadmap', 'pilot', 'timeline', 'requirements'],
    conversionGoal: 'download',
    priority: 65,
    positioning: {
      allowedPositions: ['middle', 'bottom'],
      preferredPosition: 'middle',
    },
    displayRules: {
      deviceTypes: ['desktop', 'tablet', 'mobile'],
    },
  },

  // Callback Request CTAs
  {
    name: 'Urgent Callback Request',
    category: 'callback',
    ctaType: 'direct-contact',
    style: 'floating',
    title: 'Need Immediate Assistance?',
    description: 'Request a callback and our aviation experts will call you within 30 minutes during business hours.',
    primaryButton: {
      text: 'Request Callback',
      action: 'contact-form',
      style: 'urgent',
      targetUrl: '/contact?type=callback',
    },
    urgencyElements: {
      urgencyMessage: 'Callback within 30 minutes',
      socialProof: 'Available 9 AM - 9 PM',
    },
    targetAudience: ['aspiring-pilots', 'working-professionals'],
    keywords: ['callback', 'urgent', 'immediate', 'assistance'],
    conversionGoal: 'call',
    priority: 80,
    positioning: {
      allowedPositions: ['floating', 'sidebar'],
      preferredPosition: 'floating',
    },
    displayRules: {
      deviceTypes: ['desktop', 'tablet', 'mobile'],
      timeOfDay: {
        enabled: true,
        startTime: '09:00',
        endTime: '21:00',
      },
    },
  },

  // Emergency Contact CTA
  {
    name: 'Emergency Support Contact',
    category: 'emergency',
    ctaType: 'direct-contact',
    style: 'minimal',
    title: 'Need Urgent Help?',
    description: 'For urgent training or exam-related queries, contact our emergency support line.',
    primaryButton: {
      text: 'Emergency Contact',
      action: 'phone-call',
      style: 'urgent',
      targetUrl: 'tel:+919876543210',
    },
    urgencyElements: {
      urgencyMessage: '24/7 emergency support',
    },
    targetAudience: ['student-pilots', 'licensed-pilots'],
    keywords: ['emergency', 'urgent', 'help', 'support'],
    conversionGoal: 'call',
    priority: 95,
    positioning: {
      allowedPositions: ['floating', 'sidebar'],
      preferredPosition: 'floating',
    },
    displayRules: {
      deviceTypes: ['desktop', 'tablet', 'mobile'],
      userBehavior: {
        exitIntent: true,
      },
    },
  },
];

// Helper function to get templates by category
export function getTemplatesByCategory(category: string) {
  return ctaTemplateLibrary.filter(template => template.category === category);
}

// Helper function to get templates by conversion goal
export function getTemplatesByGoal(goal: string) {
  return ctaTemplateLibrary.filter(template => template.conversionGoal === goal);
}

// Helper function to get high-priority templates
export function getHighPriorityTemplates(minPriority: number = 80) {
  return ctaTemplateLibrary
    .filter(template => (template.priority || 0) >= minPriority)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

// Helper function to get templates for specific audience
export function getTemplatesForAudience(audience: string) {
  return ctaTemplateLibrary.filter(template => 
    template.targetAudience?.includes(audience as any)
  );
}

// Helper function to get templates matching keywords
export function getTemplatesByKeywords(keywords: string[]) {
  return ctaTemplateLibrary.filter(template =>
    template.keywords?.some(keyword =>
      keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
    )
  );
}

// Export default template for fallback
export const defaultCTATemplate: CTATemplateCreateInput = {
  name: 'Default Aviation Training CTA',
  category: 'course-enrollment',
  ctaType: 'course-promo',
  style: 'card',
  title: 'Start Your Aviation Career Today',
  description: 'Join thousands of successful pilots who started their journey with our comprehensive training programs.',
  primaryButton: {
    text: 'Explore Courses',
    action: 'course-page',
    style: 'primary',
    targetUrl: '/courses',
  },
  secondaryButton: {
    text: 'Contact Us',
    action: 'contact-form',
    style: 'secondary',
    targetUrl: '/contact',
  },
  urgencyElements: {
    socialProof: 'Trusted by 1000+ aspiring pilots',
  },
  targetAudience: ['aspiring-pilots'],
  keywords: ['aviation', 'training', 'pilot', 'course'],
  conversionGoal: 'enrollment',
  priority: 50,
  positioning: {
    allowedPositions: ['top', 'middle', 'bottom'],
    preferredPosition: 'bottom',
  },
  displayRules: {
    deviceTypes: ['desktop', 'tablet', 'mobile'],
  },
};
