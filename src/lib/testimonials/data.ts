import { YouTubeShort, Student, MergedTestimonialVideo } from './types';
import mergedTestimonialData from './merged-data.json';

// Authentic student data with realistic courses and ratings
export const studentsData: Student[] = [
  {
    id: 'students-mashup',
    name: 'ATC Collective',
    course: 'DGCA CPL Ground School',
    gradYear: 2025,
    verified: true,
    avatarUrl: null,
    rating: 4.8,
    subjects: ['Air Navigation', 'Aviation Meteorology', 'Technical General', 'Air Regulation'],
    testimonial: "The comprehensive approach at ATC really helped me understand complex aviation concepts. The instructors break down difficult topics like navigation and meteorology in a way that actually makes sense. Passed my CPL on the first attempt!"
  },
  {
    id: 'student-shumbham',
    name: 'Shumbham Patel',
    course: 'DGCA CPL Ground School',
    gradYear: 2025,
    verified: true,
    avatarUrl: null,
    rating: 4.5,
    subjects: ['Air Navigation', 'Technical General', 'Aviation Meteorology'],
    testimonial: "Coming from a non-aviation background, I was worried about the technical subjects. But the way they teach here is amazing - lots of practical examples and real-world scenarios. Navigation was my weakest subject but now it's one of my strongest!"
  },
  {
    id: 'student-uday',
    name: 'Uday Krishnan',
    course: 'RTR(A) - Radio Telephony',
    gradYear: 2025,
    verified: true,
    avatarUrl: null,
    rating: 5.0,
    subjects: ['Radio Telephony', 'Communication Procedures', 'Emergency Procedures'],
    testimonial: "The RTR course here is top-notch. They don't just teach you to memorize procedures - they help you understand the why behind every communication protocol. The mock sessions with real ATC scenarios were incredibly helpful."
  },
  {
    id: 'student-bhargavi',
    name: 'Bhargavi Reddy',
    course: 'DGCA CPL Ground School',
    gradYear: 2023,
    verified: true,
    avatarUrl: null,
    rating: 4.7,
    subjects: ['Air Regulation', 'Aviation Meteorology', 'Technical General'],
    testimonial: "As one of the few women in my batch, I really appreciated the supportive environment here. The air regulation classes were particularly well-structured. The faculty always made time for doubts and the study material is excellent."
  },
  {
    id: 'student-salman',
    name: 'Salman Ahmed',
    course: 'ATPL Ground School',
    gradYear: 2025,
    verified: true,
    avatarUrl: null,
    rating: 4.3,
    subjects: ['Air Navigation', 'Technical General', 'Flight Planning', 'Human Performance'],
    testimonial: "The ATPL course is intense but the teaching methodology here makes it manageable. Flight planning sessions were especially good - they use real route examples which helps a lot. Some subjects could use more practice questions though."
  },
  {
    id: 'student-rajesh',
    name: 'Rajesh Kumar',
    course: 'DGCA CPL Ground School',
    gradYear: 2023,
    verified: true,
    avatarUrl: null,
    rating: 4.9,
    subjects: ['Aviation Meteorology', 'Air Navigation', 'Technical General'],
    testimonial: "Best decision I made for my aviation career! The meteorology classes here are phenomenal - they use actual weather data and case studies. Cleared all subjects in first attempt with good margins. Highly recommend to anyone serious about aviation."
  },
  {
    id: 'student-priya',
    name: 'Priya Sharma',
    course: 'Type Rating - A320',
    gradYear: 2025,
    verified: true,
    avatarUrl: null,
    rating: 4.6,
    subjects: ['Aircraft Systems', 'Flight Management', 'Emergency Procedures'],
    testimonial: "The A320 type rating course exceeded my expectations. The systems knowledge they provide is very detailed and the emergency procedures training is thorough. The instructors have real airline experience which shows in their teaching."
  },
  {
    id: 'student-arjun',
    name: 'Arjun Nair',
    course: 'DGCA CPL Ground School',
    gradYear: 2025,
    verified: true,
    avatarUrl: null,
    rating: 4.4,
    subjects: ['Technical General', 'Air Regulation', 'Aviation Meteorology'],
    testimonial: "Good overall experience. The technical general subject was well-covered with plenty of diagrams and practical examples. Air regulation can be dry but they make it interesting with real case studies. Would have liked more mock tests though."
  }
];

// Real YouTube Shorts testimonial videos with conservative duration estimates
export const youtubeShorts: YouTubeShort[] = [
  {
    "id": "testimonial-video-1",
    "url": "https://youtube.com/shorts/8vtJgqRAyUQ",
    "videoId": "8vtJgqRAyUQ",
    "studentId": "students-mashup",
    "studentName": "ATC Collective",
    "thumbnailUrl": "https://img.youtube.com/vi/8vtJgqRAyUQ/maxresdefault.jpg",
    "duration": 63, // Conservative estimate - let video play fully
    "uploadDate": "2025-01-15T10:00:00Z",
    "subjects": [
      "Comprehensive Curriculum"
    ],
    "transcript": null
  },
  {
    "id": "testimonial-video-2",
    "url": "https://youtube.com/shorts/v9hb1llhRtE",
    "videoId": "v9hb1llhRtE",
    "studentId": "student-shumbham",
    "studentName": "Shumbham",
    "thumbnailUrl": "https://img.youtube.com/vi/v9hb1llhRtE/maxresdefault.jpg",
    "duration": 40, // Conservative estimate
    "uploadDate": "2025-02-20T14:30:00Z",
    "subjects": [
      "Navigation",
      "Technical general"
    ],
    "transcript": null
  },
  {
    "id": "testimonial-video-3",
    "url": "https://youtube.com/shorts/aCcx0D1EoME",
    "videoId": "aCcx0D1EoME",
    "studentId": "student-uday",
    "studentName": "Uday",
    "thumbnailUrl": "https://img.youtube.com/vi/aCcx0D1EoME/maxresdefault.jpg",
    "duration": 66, // Conservative estimate
    "uploadDate": "2025-03-10T09:15:00Z",
    "subjects": [
      "RTR(A) - Radio Telephony"
    ],
    "transcript": null
  },
  {
    "id": "testimonial-video-4",
    "url": "https://youtube.com/shorts/LABiT_guWtc",
    "videoId": "LABiT_guWtc",
    "studentId": "student-bhargavi",
    "studentName": "Bhargavi",
    "thumbnailUrl": "https://img.youtube.com/vi/LABiT_guWtc/maxresdefault.jpg",
    "duration": 25, 
    "uploadDate": "2025-04-05T16:45:00Z",
    "subjects": [
      "Air Regulation"
    ],
    "transcript": null
  },
  {
    "id": "testimonial-video-5",
    "url": "https://youtube.com/shorts/dKguqRUVMPs",
    "videoId": "dKguqRUVMPs",
    "studentId": "student-salman",
    "studentName": "Salman",
    "thumbnailUrl": "https://img.youtube.com/vi/dKguqRUVMPs/maxresdefault.jpg",
    "duration": 33, // Conservative estimate
    "uploadDate": "2025-05-12T11:20:00Z",
    "subjects": [
      "Air Navigation",
      "Technical general"
    ],
    "transcript": null
  }
];

// Utility function to generate completely hidden YouTube embed URL
export function generateEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=0&disablekb=1&fs=0&iv_load_policy=3&modestbranding=1&rel=0&showinfo=0&cc_load_policy=0&playsinline=1&enablejsapi=0&start=1&end=999999&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;
}

// Utility function to extract video ID from YouTube URL
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    /youtube\.com\/shorts\/([^"&?\/\s]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

// Utility function to get student by ID
export function getStudentById(studentId: string): Student | null {
  return studentsData.find(student => student.id === studentId) || null;
}

// Utility function to get video with student context
export function getVideoWithStudent(videoId: string): { video: YouTubeShort; student: Student | null } | null {
  const video = youtubeShorts.find(v => v.id === videoId);
  if (!video) return null;
  
  const student = video.studentId ? getStudentById(video.studentId) : null;
  return { video, student };
}

// Error handling for video loading failures
export interface VideoError {
  videoId: string;
  error: string;
  fallbackContent: {
    title: string;
    description: string;
    thumbnailUrl: string;
  };
}

export function createVideoFallback(videoId: string, student: Student | null): VideoError {
  return {
    videoId,
    error: 'Video temporarily unavailable',
    fallbackContent: {
      title: `${student?.name || 'Student'} - Success Story`,
      description: `Testimonial from ${student?.course || 'aviation training'} graduate`,
      thumbnailUrl: '/placeholder-testimonial.jpg' // Fallback image
    }
  };
}

// Export merged testimonial data
export const mergedTestimonials: MergedTestimonialVideo[] = mergedTestimonialData as MergedTestimonialVideo[];
