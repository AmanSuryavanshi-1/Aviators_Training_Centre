// Lead Generation Tools Types

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'single-choice' | 'multiple-choice' | 'scale' | 'text';
  options?: QuizOption[];
  required: boolean;
  category: 'experience' | 'goals' | 'preferences' | 'background';
}

export interface QuizOption {
  id: string;
  text: string;
  value: string | number;
  weight?: number;
}

export interface QuizResponse {
  questionId: string;
  answer: string | string[] | number;
}

export interface CourseRecommendation {
  courseId: string;
  courseName: string;
  description: string;
  matchScore: number;
  reasons: string[];
  duration: string;
  cost: string;
  nextSteps: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface QuizResult {
  userId?: string;
  responses: QuizResponse[];
  recommendations: CourseRecommendation[];
  personalizedMessage: string;
  nextSteps: string[];
  completedAt: Date;
}

// Career Assessment Types
export interface CareerAssessmentQuestion {
  id: string;
  question: string;
  type: 'rating' | 'choice' | 'ranking' | 'text';
  options?: string[];
  category: 'skills' | 'interests' | 'values' | 'personality';
  weight: number;
}

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  averageSalary: string;
  growthProspects: string;
  timeToAchieve: string;
  matchScore: number;
  pros: string[];
  cons: string[];
}

export interface CareerAssessmentResult {
  userId?: string;
  topCareerPaths: CareerPath[];
  skillGaps: string[];
  recommendations: string[];
  actionPlan: string[];
  completedAt: Date;
}

// Cost Calculator Types
export interface TrainingCostInput {
  courseType: 'CPL' | 'ATPL' | 'Type Rating' | 'RTR' | 'Interview Prep';
  location: 'Delhi' | 'Mumbai' | 'Bangalore' | 'Other';
  accommodationType: 'hostel' | 'pg' | 'rental' | 'home';
  mealPlan: 'included' | 'self' | 'canteen';
  studyMaterials: 'basic' | 'premium' | 'digital';
  examAttempts: number;
  additionalServices: string[];
}

export interface CostBreakdown {
  category: string;
  amount: number;
  description: string;
  isOptional: boolean;
}

export interface FinancingOption {
  id: string;
  name: string;
  type: 'loan' | 'emi' | 'scholarship' | 'installment';
  description: string;
  eligibility: string[];
  interestRate?: number;
  tenure?: number;
  monthlyPayment?: number;
  totalAmount?: number;
  provider: string;
  applicationLink?: string;
}

export interface CostCalculatorResult {
  totalCost: number;
  breakdown: CostBreakdown[];
  financingOptions: FinancingOption[];
  recommendations: string[];
  savings: string[];
  timeline: string;
}

// Eligibility Checker Types
export interface EligibilityRequirement {
  id: string;
  category: 'education' | 'age' | 'medical' | 'experience' | 'language';
  requirement: string;
  description: string;
  isMandatory: boolean;
  alternatives?: string[];
}

export interface UserProfile {
  age: number;
  education: string;
  experience: string;
  medicalStatus: 'fit' | 'pending' | 'issues';
  englishProficiency: 'basic' | 'intermediate' | 'advanced';
  previousTraining?: string[];
  location: string;
}

export interface EligibilityResult {
  courseId: string;
  courseName: string;
  isEligible: boolean;
  eligibilityScore: number;
  metRequirements: EligibilityRequirement[];
  missingRequirements: EligibilityRequirement[];
  recommendations: string[];
  nextSteps: string[];
  estimatedTimeToEligibility?: string;
}

export interface EligibilityCheckResult {
  userId?: string;
  userProfile: UserProfile;
  results: EligibilityResult[];
  overallRecommendation: string;
  priorityActions: string[];
  completedAt: Date;
}

// Lead Generation Analytics
export interface LeadGenerationEvent {
  id: string;
  userId?: string;
  toolType: 'quiz' | 'assessment' | 'calculator' | 'eligibility';
  eventType: 'started' | 'completed' | 'abandoned' | 'converted';
  data: any;
  timestamp: Date;
  source: string;
  sessionId: string;
}

export interface LeadGenerationMetrics {
  toolType: string;
  totalStarts: number;
  totalCompletions: number;
  completionRate: number;
  conversionRate: number;
  averageTimeToComplete: number;
  topRecommendations: string[];
  userSegments: Record<string, number>;
}