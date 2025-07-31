import { client } from '@/lib/sanity/client';

// Import types from the component file
export interface StudentTestimonial {
  id: string;
  name: string;
  course: string;
  batch: string;
  rating: number;
  testimonial: string;
  achievement: string;
  currentPosition?: string;
  company?: string;
  location?: string;
  image?: string;
  date: Date;
  verified: boolean;
}

export interface SuccessStory {
  id: string;
  studentName: string;
  course: string;
  beforeStatus: string;
  afterStatus: string;
  timeframe: string;
  keyAchievements: string[];
  testimonial: string;
  image?: string;
  salaryIncrease?: string;
  featured: boolean;
}

export interface IndustryCertification {
  id: string;
  name: string;
  issuer: string;
  description: string;
  icon: string;
  credibilityScore: number;
  validUntil?: Date;
}

export interface AchievementCounter {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: React.ReactNode;
  color: string;
  animationDuration?: number;
}

export interface AlumniData {
  totalAlumni: number;
  featuredCompanies: string[];
  successRate: number;
  averageSalaryIncrease: string;
  placementRate: number;
  averageTimeToPlacement: string;
}

class SocialProofService {
  // Get testimonials for a specific course or all courses
  async getTestimonials(courseId?: string, limit: number = 10): Promise<StudentTestimonial[]> {
    try {
      // In a real implementation, this would fetch from Sanity
      const mockTestimonials = this.getMockTestimonials();
      
      let filtered = mockTestimonials;
      if (courseId) {
        filtered = mockTestimonials.filter(t => 
          t.course.toLowerCase().includes(courseId.toLowerCase()) ||
          courseId.toLowerCase().includes(t.course.toLowerCase().split(' ')[0])
        );
      }
      
      return filtered
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      return [];
    }
  }

  // Get success stories
  async getSuccessStories(courseId?: string, limit: number = 5): Promise<SuccessStory[]> {
    try {
      const mockStories = this.getMockSuccessStories();
      
      let filtered = mockStories;
      if (courseId) {
        filtered = mockStories.filter(s => 
          s.course.toLowerCase().includes(courseId.toLowerCase()) ||
          courseId.toLowerCase().includes(s.course.toLowerCase().split(' ')[0])
        );
      }
      
      return filtered
        .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching success stories:', error);
      return [];
    }
  }

  // Get industry certifications
  async getIndustryCertifications(): Promise<IndustryCertification[]> {
    try {
      return this.getMockCertifications();
    } catch (error) {
      console.error('Error fetching certifications:', error);
      return [];
    }
  }

  // Get achievement counters
  async getAchievementCounters(): Promise<AchievementCounter[]> {
    try {
      return this.getMockAchievementCounters();
    } catch (error) {
      console.error('Error fetching achievement counters:', error);
      return [];
    }
  }

  // Get alumni network data
  async getAlumniData(): Promise<AlumniData> {
    try {
      return this.getMockAlumniData();
    } catch (error) {
      console.error('Error fetching alumni data:', error);
      return {
        totalAlumni: 0,
        featuredCompanies: [],
        successRate: 0,
        averageSalaryIncrease: '0%',
        placementRate: 0,
        averageTimeToPlacement: '0 months',
      };
    }
  }

  // Get social proof summary for a course
  async getSocialProofSummary(courseId: string) {
    const [testimonials, successStories, counters, alumni] = await Promise.all([
      this.getTestimonials(courseId, 3),
      this.getSuccessStories(courseId, 2),
      this.getAchievementCounters(),
      this.getAlumniData(),
    ]);

    const averageRating = testimonials.length > 0 
      ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
      : 0;

    return {
      testimonials,
      successStories,
      counters,
      alumni,
      averageRating,
      totalTestimonials: testimonials.length,
      verifiedTestimonials: testimonials.filter(t => t.verified).length,
    };
  }

  // Mock data generators (replace with real data sources)
  private getMockTestimonials(): StudentTestimonial[] {
    return [
      {
        id: 'test-1',
        name: 'Rajesh Kumar',
        course: 'DGCA CPL Ground School',
        batch: 'January 2024',
        rating: 5,
        testimonial: 'Excellent training program! The instructors are highly experienced and the study material is comprehensive. I cleared my DGCA CPL exam in the first attempt with 85% marks.',
        achievement: 'Cleared DGCA CPL in first attempt with 85% marks',
        currentPosition: 'First Officer',
        company: 'IndiGo Airlines',
        location: 'Mumbai, India',
        date: new Date('2024-01-15'),
        verified: true,
      },
      {
        id: 'test-2',
        name: 'Priya Sharma',
        course: 'ATPL Ground School',
        batch: 'December 2023',
        rating: 5,
        testimonial: 'The ATPL program at ATC is outstanding. The depth of knowledge provided and the practical approach helped me understand complex aviation concepts easily. The mock tests were exactly like the real exam.',
        achievement: 'Promoted to Captain within 2 years',
        currentPosition: 'Captain',
        company: 'Air India',
        location: 'Delhi, India',
        date: new Date('2023-12-20'),
        verified: true,
      },
      {
        id: 'test-3',
        name: 'Amit Patel',
        course: 'Type Rating A320',
        batch: 'November 2023',
        rating: 5,
        testimonial: 'The A320 type rating preparation was thorough and well-structured. The simulator training and technical knowledge sessions were exceptional.',
        achievement: 'Successfully completed A320 type rating',
        currentPosition: 'First Officer A320',
        company: 'SpiceJet',
        location: 'Bangalore, India',
        date: new Date('2023-11-10'),
        verified: true,
      },
      {
        id: 'test-4',
        name: 'Sneha Reddy',
        course: 'RTR License Training',
        batch: 'October 2023',
        rating: 4,
        testimonial: 'Great program for RTR preparation. The communication skills training and technical knowledge helped me pass the exam with confidence.',
        achievement: 'RTR License obtained',
        currentPosition: 'Air Traffic Controller',
        company: 'AAI',
        location: 'Hyderabad, India',
        date: new Date('2023-10-05'),
        verified: true,
      },
      {
        id: 'test-5',
        name: 'Vikram Singh',
        course: 'Interview Preparation',
        batch: 'September 2023',
        rating: 5,
        testimonial: 'The interview preparation course was a game-changer. The mock interviews and personality development sessions boosted my confidence significantly.',
        achievement: 'Selected in airline interview',
        currentPosition: 'Trainee Pilot',
        company: 'Vistara',
        location: 'Gurgaon, India',
        date: new Date('2023-09-15'),
        verified: true,
      },
      {
        id: 'test-6',
        name: 'Kavya Nair',
        course: 'DGCA CPL Ground School',
        batch: 'August 2023',
        rating: 5,
        testimonial: 'Exceptional faculty and well-organized curriculum. The practical approach to learning made complex topics easy to understand.',
        achievement: 'Top scorer in DGCA CPL exam',
        currentPosition: 'Flight Instructor',
        company: 'Flying Club',
        location: 'Chennai, India',
        date: new Date('2023-08-20'),
        verified: true,
      },
      {
        id: 'test-7',
        name: 'Ankit Gupta',
        course: 'Type Rating B737',
        batch: 'July 2023',
        rating: 5,
        testimonial: 'The B737 type rating course was comprehensive and well-structured. The simulator sessions were incredibly realistic and prepared me perfectly for the actual check ride.',
        achievement: 'Completed B737 type rating with distinction',
        currentPosition: 'First Officer B737',
        company: 'SpiceJet',
        location: 'Delhi, India',
        date: new Date('2023-07-10'),
        verified: true,
      },
      {
        id: 'test-8',
        name: 'Deepika Singh',
        course: 'Interview Preparation',
        batch: 'June 2023',
        rating: 4,
        testimonial: 'The interview preparation course boosted my confidence tremendously. The mock interviews and personality development sessions were exactly what I needed.',
        achievement: 'Selected in 3 airline interviews',
        currentPosition: 'Trainee Pilot',
        company: 'GoAir',
        location: 'Mumbai, India',
        date: new Date('2023-06-25'),
        verified: true,
      },
      {
        id: 'test-9',
        name: 'Rahul Joshi',
        course: 'DGCA ATPL Ground School',
        batch: 'May 2023',
        rating: 5,
        testimonial: 'Outstanding ATPL preparation program. The instructors have real airline experience and share practical insights that you won\'t find in textbooks.',
        achievement: 'Cleared all ATPL subjects in first attempt',
        currentPosition: 'Senior First Officer',
        company: 'Vistara',
        location: 'Bangalore, India',
        date: new Date('2023-05-15'),
        verified: true,
      },
      {
        id: 'test-10',
        name: 'Meera Patel',
        course: 'RTR License Training',
        batch: 'April 2023',
        rating: 5,
        testimonial: 'The RTR course was perfectly designed for working professionals. The flexible timings and comprehensive study material made it easy to balance work and studies.',
        achievement: 'RTR License with Grade A',
        currentPosition: 'Air Traffic Controller',
        company: 'AAI Delhi',
        location: 'Delhi, India',
        date: new Date('2023-04-20'),
        verified: true,
      },
    ];
  }

  private getMockSuccessStories(): SuccessStory[] {
    return [
      {
        id: 'story-1',
        studentName: 'Captain Arjun Mehta',
        course: 'DGCA CPL + ATPL Ground School',
        beforeStatus: 'Engineering Graduate',
        afterStatus: 'Airline Captain',
        timeframe: '3 years',
        keyAchievements: [
          'Cleared DGCA CPL in first attempt',
          'Completed ATPL within 18 months',
          'Promoted to Captain in 2.5 years',
          'Currently flying international routes'
        ],
        testimonial: 'ATC transformed my career completely. From an engineering background to becoming an airline captain, the journey was challenging but rewarding. The quality of training and continuous support made all the difference.',
        salaryIncrease: '400%',
        featured: true,
      },
      {
        id: 'story-2',
        studentName: 'First Officer Meera Joshi',
        course: 'DGCA CPL + Type Rating A320',
        beforeStatus: 'Hotel Management Graduate',
        afterStatus: 'Airline First Officer',
        timeframe: '2.5 years',
        keyAchievements: [
          'Career change from hospitality to aviation',
          'Completed CPL training',
          'A320 type rating certification',
          'Joined major airline as First Officer'
        ],
        testimonial: 'Switching careers seemed daunting, but ATC made it possible. The comprehensive training program and career guidance helped me transition smoothly into aviation.',
        salaryIncrease: '250%',
        featured: true,
      },
      {
        id: 'story-3',
        studentName: 'Captain Rohit Gupta',
        course: 'ATPL Ground School',
        beforeStatus: 'First Officer',
        afterStatus: 'Airline Captain',
        timeframe: '18 months',
        keyAchievements: [
          'Advanced from First Officer to Captain',
          'Completed ATPL successfully',
          'Leading international flights',
          'Training junior pilots'
        ],
        testimonial: 'The ATPL program at ATC is world-class. The advanced training modules and experienced instructors prepared me well for the captain role.',
        salaryIncrease: '80%',
        featured: false,
      },
      {
        id: 'story-4',
        studentName: 'Flight Engineer Sanjay Kumar',
        course: 'Type Rating B737',
        beforeStatus: 'Aircraft Maintenance Engineer',
        afterStatus: 'Flight Engineer',
        timeframe: '8 months',
        keyAchievements: [
          'Transitioned from maintenance to operations',
          'B737 type rating certification',
          'Joined as Flight Engineer',
          'Planning to pursue pilot training'
        ],
        testimonial: 'My maintenance background helped, but the type rating course gave me operational knowledge. ATC bridges the gap between technical and operational aviation.',
        salaryIncrease: '60%',
        featured: false,
      },
    ];
  }

  private getMockCertifications(): IndustryCertification[] {
    return [
      {
        id: 'cert-1',
        name: 'DGCA Approved Training Organization',
        issuer: 'Directorate General of Civil Aviation',
        description: 'Official approval from DGCA for conducting pilot training programs in India.',
        icon: 'shield',
        credibilityScore: 100,
        validUntil: new Date('2025-12-31'),
      },
      {
        id: 'cert-2',
        name: 'ICAO Standards Compliance',
        issuer: 'International Civil Aviation Organization',
        description: 'Training programs comply with international aviation standards set by ICAO.',
        icon: 'globe',
        credibilityScore: 95,
      },
      {
        id: 'cert-3',
        name: 'ISO 9001:2015 Certified',
        issuer: 'International Organization for Standardization',
        description: 'Quality management system certification ensuring consistent training delivery.',
        icon: 'award',
        credibilityScore: 90,
        validUntil: new Date('2025-06-30'),
      },
      {
        id: 'cert-4',
        name: 'EASA Part-147 Approved',
        issuer: 'European Union Aviation Safety Agency',
        description: 'Approved for aircraft maintenance training under EASA regulations.',
        icon: 'wrench',
        credibilityScore: 85,
      },
      {
        id: 'cert-5',
        name: 'IATA Training Partner',
        issuer: 'International Air Transport Association',
        description: 'Authorized training partner for IATA courses and certifications.',
        icon: 'plane',
        credibilityScore: 88,
      },
    ];
  }

  private getMockAchievementCounters(): AchievementCounter[] {
    return [
      {
        id: 'counter-1',
        label: 'Students Trained',
        value: 3500,
        suffix: '+',
        icon: '👨‍🎓',
        color: 'blue',
        animationDuration: 2000,
      },
      {
        id: 'counter-2',
        label: 'Success Rate',
        value: 96,
        suffix: '%',
        icon: '🎯',
        color: 'green',
        animationDuration: 1500,
      },
      {
        id: 'counter-3',
        label: 'Years of Experience',
        value: 18,
        suffix: '+',
        icon: '📅',
        color: 'purple',
        animationDuration: 1000,
      },
      {
        id: 'counter-4',
        label: 'Industry Partners',
        value: 75,
        suffix: '+',
        icon: '🤝',
        color: 'orange',
        animationDuration: 1800,
      },
      {
        id: 'counter-5',
        label: 'Placement Rate',
        value: 94,
        suffix: '%',
        icon: '💼',
        color: 'teal',
        animationDuration: 2200,
      },
      {
        id: 'counter-6',
        label: 'Countries Served',
        value: 15,
        suffix: '+',
        icon: '🌍',
        color: 'indigo',
        animationDuration: 1200,
      },
      {
        id: 'counter-7',
        label: 'First Attempt Pass Rate',
        value: 89,
        suffix: '%',
        icon: '✅',
        color: 'emerald',
        animationDuration: 1600,
      },
      {
        id: 'counter-8',
        label: 'Average Score Improvement',
        value: 35,
        suffix: '%',
        icon: '📈',
        color: 'cyan',
        animationDuration: 1900,
      },
    ];
  }

  private getMockAlumniData(): AlumniData {
    return {
      totalAlumni: 3500,
      featuredCompanies: [
        'IndiGo',
        'Air India',
        'SpiceJet',
        'Vistara',
        'GoFirst',
        'AirAsia India',
        'Emirates',
        'Qatar Airways',
        'Singapore Airlines',
        'Lufthansa',
        'British Airways',
        'Air France',
        'Etihad Airways',
        'Turkish Airlines',
        'Thai Airways',
        'Malaysia Airlines',
        'Cathay Pacific',
        'KLM',
        'Swiss International',
        'Austrian Airlines'
      ],
      successRate: 96,
      averageSalaryIncrease: '220%',
      placementRate: 94,
      averageTimeToPlacement: '4.5 months',
    };
  }

  // Utility methods
  formatRating(rating: number): string {
    return `${rating.toFixed(1)}/5.0`;
  }

  getTestimonialsByRating(testimonials: StudentTestimonial[], minRating: number = 4): StudentTestimonial[] {
    return testimonials.filter(t => t.rating >= minRating);
  }

  getVerifiedTestimonials(testimonials: StudentTestimonial[]): StudentTestimonial[] {
    return testimonials.filter(t => t.verified);
  }

  // Analytics methods
  async trackSocialProofInteraction(elementType: string, action: string, courseId?: string): Promise<void> {
    try {
      console.log(`Social proof interaction: ${elementType} - ${action} - ${courseId || 'general'}`);
      
      // In a real implementation, this would send data to analytics service
      // await analyticsService.track('social_proof_interaction', {
      //   elementType,
      //   action,
      //   courseId,
      //   timestamp: new Date().toISOString(),
      // });
    } catch (error) {
      console.error('Error tracking social proof interaction:', error);
    }
  }

  // Get social proof performance metrics
  async getSocialProofMetrics(dateRange: { start: Date; end: Date }) {
    // Mock metrics - in real implementation, fetch from analytics
    return {
      testimonialViews: 5420,
      testimonialClicks: 234,
      successStoryViews: 3210,
      successStoryInfluencedConversions: 89,
      certificationViews: 2100,
      achievementCounterViews: 4500,
      alumniNetworkViews: 1800,
      overallSocialProofConversionLift: 34.2, // Percentage improvement
      trustScoreImprovement: 28.5, // Percentage improvement in trust metrics
    };
  }
}

// Export singleton instance
export const socialProofService = new SocialProofService();

// Export types
export type {
  StudentTestimonial,
  SuccessStory,
  IndustryCertification,
  AchievementCounter,
  AlumniData,
};
