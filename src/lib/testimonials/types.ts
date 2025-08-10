export interface Student {
  id: string;
  name?: string | null;
  course?: string | null;
  gradYear?: number | null;
  verified?: boolean;
  avatarUrl?: string | null;
  rating?: number;
  subjects?: string[];
  testimonial?: string;
  location?: string;
  specificFeedback?: string;
}

export interface YouTubeShort {
  id: string;
  url: string;
  videoId: string;
  studentId?: string | null;
  studentName: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
  uploadDate?: string | null;
  subjects: string[];
  gradYear: number;
  verified: boolean;
  seoKeywords: string[];
  transcript?: string | null;
}

export interface TextTestimonial {
  id: string;
  studentName: string;
  location: string;
  course: string;
  subjects: string[];
  rating: number;
  gradYear: number;
  verified: boolean;
  testimonial: string;
  specificFeedback?: string;
  seoKeywords: string[];
  createdAt: string;
}

