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
  text: string;
  short: string;
  detail?: string | null;
  sourceVideoId?: string | null;
  confidenceScore: number; // 0-1
  needsReview?: boolean;
  generatedAt: string; // ISO
}

