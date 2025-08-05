'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  QuizQuestion, 
  QuizResponse, 
  QuizResult, 
  CourseRecommendation 
} from '@/lib/types/lead-generation';
import { Plane, Award, Clock, DollarSign, ArrowRight, Star } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'experience_level',
    question: 'What is your current aviation experience level?',
    type: 'single-choice',
    category: 'experience',
    required: true,
    options: [
      { id: 'beginner', text: 'Complete beginner - No aviation experience', value: 'beginner', weight: 1 },
      { id: 'some_knowledge', text: 'Some knowledge - Read about aviation/taken intro courses', value: 'some_knowledge', weight: 2 },
      { id: 'student_pilot', text: 'Student pilot - Currently in training', value: 'student_pilot', weight: 3 },
      { id: 'private_pilot', text: 'Private pilot - Have PPL or equivalent', value: 'private_pilot', weight: 4 },
      { id: 'experienced', text: 'Experienced - Commercial or airline background', value: 'experienced', weight: 5 }
    ]
  },
  {
    id: 'career_goal',
    question: 'What is your primary aviation career goal?',
    type: 'single-choice',
    category: 'goals',
    required: true,
    options: [
      { id: 'airline_pilot', text: 'Airline Pilot - Fly for commercial airlines', value: 'airline_pilot', weight: 5 },
      { id: 'charter_pilot', text: 'Charter Pilot - Private/corporate flying', value: 'charter_pilot', weight: 4 },
      { id: 'flight_instructor', text: 'Flight Instructor - Teach others to fly', value: 'flight_instructor', weight: 3 },
      { id: 'cargo_pilot', text: 'Cargo Pilot - Freight and logistics', value: 'cargo_pilot', weight: 4 },
      { id: 'exploring', text: 'Still exploring - Want to learn about options', value: 'exploring', weight: 2 }
    ]
  },
  {
    id: 'timeline',
    question: 'When do you want to start your aviation training?',
    type: 'single-choice',
    category: 'preferences',
    required: true,
    options: [
      { id: 'immediately', text: 'Immediately - Ready to start now', value: 'immediately', weight: 5 },
      { id: 'within_3_months', text: 'Within 3 months', value: 'within_3_months', weight: 4 },
      { id: 'within_6_months', text: 'Within 6 months', value: 'within_6_months', weight: 3 },
      { id: 'within_year', text: 'Within a year', value: 'within_year', weight: 2 },
      { id: 'just_researching', text: 'Just researching for now', value: 'just_researching', weight: 1 }
    ]
  },
  {
    id: 'budget_range',
    question: 'What is your approximate budget for aviation training?',
    type: 'single-choice',
    category: 'preferences',
    required: true,
    options: [
      { id: 'under_10_lakh', text: 'Under ₹10 lakhs', value: 'under_10_lakh', weight: 1 },
      { id: '10_25_lakh', text: '₹10-25 lakhs', value: '10_25_lakh', weight: 2 },
      { id: '25_50_lakh', text: '₹25-50 lakhs', value: '25_50_lakh', weight: 3 },
      { id: 'above_50_lakh', text: 'Above ₹50 lakhs', value: 'above_50_lakh', weight: 4 },
      { id: 'flexible', text: 'Flexible - Depends on career prospects', value: 'flexible', weight: 3 }
    ]
  },
  {
    id: 'education_background',
    question: 'What is your educational background?',
    type: 'single-choice',
    category: 'background',
    required: true,
    options: [
      { id: 'high_school', text: '12th Grade/High School', value: 'high_school', weight: 2 },
      { id: 'graduation', text: 'Graduate (Any stream)', value: 'graduation', weight: 3 },
      { id: 'engineering', text: 'Engineering/Technical degree', value: 'engineering', weight: 4 },
      { id: 'aviation_degree', text: 'Aviation-related degree', value: 'aviation_degree', weight: 5 },
      { id: 'other', text: 'Other professional qualification', value: 'other', weight: 3 }
    ]
  },
  {
    id: 'training_preferences',
    question: 'What training aspects are most important to you? (Select all that apply)',
    type: 'multiple-choice',
    category: 'preferences',
    required: false,
    options: [
      { id: 'experienced_instructors', text: 'Experienced instructors', value: 'experienced_instructors' },
      { id: 'modern_aircraft', text: 'Modern aircraft and simulators', value: 'modern_aircraft' },
      { id: 'job_placement', text: 'Job placement assistance', value: 'job_placement' },
      { id: 'flexible_schedule', text: 'Flexible scheduling', value: 'flexible_schedule' },
      { id: 'comprehensive_support', text: 'Comprehensive student support', value: 'comprehensive_support' },
      { id: 'industry_connections', text: 'Industry connections and networking', value: 'industry_connections' }
    ]
  },
  {
    id: 'concerns',
    question: 'What are your main concerns about aviation training?',
    type: 'multiple-choice',
    category: 'preferences',
    required: false,
    options: [
      { id: 'cost', text: 'Training cost and financing', value: 'cost' },
      { id: 'job_prospects', text: 'Job prospects after training', value: 'job_prospects' },
      { id: 'training_quality', text: 'Quality of training', value: 'training_quality' },
      { id: 'time_commitment', text: 'Time commitment required', value: 'time_commitment' },
      { id: 'medical_requirements', text: 'Medical requirements', value: 'medical_requirements' },
      { id: 'competition', text: 'Competition in the industry', value: 'competition' }
    ]
  }
];

interface CourseRecommendationQuizProps {
  onComplete: (result: QuizResult) => void;
  onLeadCapture?: (leadData: any) => void;
}

export default function CourseRecommendationQuiz({ 
  onComplete, 
  onLeadCapture 
}: CourseRecommendationQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;

  const handleResponse = (questionId: string, answer: string | string[]) => {
    const newResponse: QuizResponse = { questionId, answer };
    const updatedResponses = responses.filter(r => r.questionId !== questionId);
    updatedResponses.push(newResponse);
    setResponses(updatedResponses);
  };

  const getCurrentResponse = (questionId: string): string | string[] | undefined => {
    return responses.find(r => r.questionId === questionId)?.answer;
  };

  const canProceed = () => {
    const currentQ = QUIZ_QUESTIONS[currentQuestion];
    if (!currentQ.required) return true;
    
    const response = getCurrentResponse(currentQ.id);
    return response !== undefined && response !== '' && 
           (Array.isArray(response) ? response.length > 0 : true);
  };

  const nextQuestion = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeQuiz();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const generateRecommendations = (responses: QuizResponse[]): CourseRecommendation[] => {
    const responseMap = responses.reduce((acc, r) => {
      acc[r.questionId] = r.answer;
      return acc;
    }, {} as Record<string, any>);

    const recommendations: CourseRecommendation[] = [];

    // CPL Recommendation Logic
    const experienceLevel = responseMap.experience_level;
    const careerGoal = responseMap.career_goal;
    const budget = responseMap.budget_range;
    const timeline = responseMap.timeline;

    if (careerGoal === 'airline_pilot' || careerGoal === 'charter_pilot') {
      let cplScore = 85;
      const reasons = ['Essential for commercial flying career'];
      
      if (experienceLevel === 'beginner' || experienceLevel === 'some_knowledge') {
        reasons.push('Perfect starting point for aviation career');
      }
      if (budget === '25_50_lakh' || budget === 'above_50_lakh' || budget === 'flexible') {
        cplScore += 10;
        reasons.push('Budget aligns with CPL training requirements');
      }
      if (timeline === 'immediately' || timeline === 'within_3_months') {
        cplScore += 5;
        reasons.push('Ready to start comprehensive training program');
      }

      recommendations.push({
        courseId: 'cpl',
        courseName: 'Commercial Pilot License (CPL)',
        description: 'Comprehensive training program to become a commercial pilot with airline career prospects.',
        matchScore: Math.min(cplScore, 100),
        reasons,
        duration: '18-24 months',
        cost: '₹35-45 lakhs',
        nextSteps: [
          'Schedule a consultation with our CPL advisors',
          'Complete medical examination',
          'Review financing options',
          'Join the next batch starting soon'
        ],
        priority: 'high'
      });
    }

    // ATPL Recommendation Logic
    if (experienceLevel === 'private_pilot' || experienceLevel === 'experienced') {
      let atplScore = 75;
      const reasons = ['Advanced qualification for airline pilots'];
      
      if (careerGoal === 'airline_pilot') {
        atplScore += 15;
        reasons.push('Required for airline captain positions');
      }
      if (budget === 'above_50_lakh' || budget === 'flexible') {
        atplScore += 10;
        reasons.push('Investment in advanced pilot qualification');
      }

      recommendations.push({
        courseId: 'atpl',
        courseName: 'Airline Transport Pilot License (ATPL)',
        description: 'Advanced pilot training for airline captain positions and commercial aviation leadership.',
        matchScore: Math.min(atplScore, 100),
        reasons,
        duration: '12-18 months',
        cost: '₹25-35 lakhs',
        nextSteps: [
          'Verify CPL prerequisites',
          'Book ATPL consultation session',
          'Plan training timeline',
          'Explore airline partnerships'
        ],
        priority: careerGoal === 'airline_pilot' ? 'high' : 'medium'
      });
    }

    // Type Rating Recommendation
    if (experienceLevel === 'experienced' || careerGoal === 'airline_pilot') {
      recommendations.push({
        courseId: 'type_rating',
        courseName: 'Type Rating (A320/B737)',
        description: 'Aircraft-specific training for modern commercial aircraft operations.',
        matchScore: 70,
        reasons: ['Essential for airline employment', 'High demand in Indian aviation market'],
        duration: '6-8 weeks',
        cost: '₹15-25 lakhs',
        nextSteps: [
          'Choose aircraft type (A320 vs B737)',
          'Check airline preferences',
          'Schedule simulator assessment',
          'Apply for type rating program'
        ],
        priority: 'medium'
      });
    }

    // RTR License Recommendation
    if (experienceLevel === 'beginner' || experienceLevel === 'some_knowledge') {
      recommendations.push({
        courseId: 'rtr',
        courseName: 'Restricted Radio Telephone (RTR) License',
        description: 'Essential communication license for all pilot training and operations.',
        matchScore: 90,
        reasons: ['Mandatory for all pilot training', 'Quick to complete', 'Cost-effective start'],
        duration: '2-4 weeks',
        cost: '₹25,000-50,000',
        nextSteps: [
          'Enroll in RTR ground classes',
          'Practice radio procedures',
          'Schedule DGCA examination',
          'Obtain license before flight training'
        ],
        priority: 'high'
      });
    }

    // Interview Preparation
    if (careerGoal === 'airline_pilot' && (experienceLevel === 'student_pilot' || experienceLevel === 'private_pilot')) {
      recommendations.push({
        courseId: 'interview_prep',
        courseName: 'Airline Interview Preparation',
        description: 'Comprehensive preparation for airline recruitment processes and interviews.',
        matchScore: 65,
        reasons: ['Improve airline selection chances', 'Professional interview coaching'],
        duration: '4-6 weeks',
        cost: '₹1-3 lakhs',
        nextSteps: [
          'Assess current interview readiness',
          'Join mock interview sessions',
          'Build professional aviation resume',
          'Practice technical and HR questions'
        ],
        priority: 'medium'
      });
    }

    return recommendations.sort((a, b) => b.matchScore - a.matchScore);
  };

  const completeQuiz = async () => {
    setIsLoading(true);
    
    try {
      const recommendations = generateRecommendations(responses);
      const personalizedMessage = generatePersonalizedMessage(responses, recommendations);
      
      const quizResult: QuizResult = {
        responses,
        recommendations,
        personalizedMessage,
        nextSteps: generateNextSteps(recommendations),
        completedAt: new Date()
      };

      setResult(quizResult);
      setIsCompleted(true);
      onComplete(quizResult);

      // Track completion event
      if (typeof window !== 'undefined') {
        // Analytics tracking would go here
        console.log('Quiz completed:', quizResult);
      }

    } catch (error) {
      console.error('Error completing quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePersonalizedMessage = (responses: QuizResponse[], recommendations: CourseRecommendation[]): string => {
    const responseMap = responses.reduce((acc, r) => {
      acc[r.questionId] = r.answer;
      return acc;
    }, {} as Record<string, any>);

    const careerGoal = responseMap.career_goal;
    const experienceLevel = responseMap.experience_level;
    const topRecommendation = recommendations[0];

    let message = `Based on your responses, `;

    if (careerGoal === 'airline_pilot') {
      message += `your goal of becoming an airline pilot is achievable with the right training path. `;
    } else if (careerGoal === 'exploring') {
      message += `we've identified several aviation career paths that match your interests. `;
    }

    if (experienceLevel === 'beginner') {
      message += `As someone new to aviation, we recommend starting with foundational courses before advancing to commercial training. `;
    } else if (experienceLevel === 'experienced') {
      message += `With your aviation background, you're well-positioned for advanced training programs. `;
    }

    if (topRecommendation) {
      message += `Our top recommendation is ${topRecommendation.courseName}, which aligns perfectly with your career goals and current experience level.`;
    }

    return message;
  };

  const generateNextSteps = (recommendations: CourseRecommendation[]): string[] => {
    const steps = [
      'Review your personalized course recommendations below',
      'Schedule a free consultation with our aviation career advisors',
      'Download our comprehensive course brochures',
      'Connect with our admissions team to discuss enrollment'
    ];

    if (recommendations.some(r => r.courseId === 'rtr')) {
      steps.splice(1, 0, 'Consider starting with RTR license for immediate progress');
    }

    return steps;
  };

  const renderQuestion = (question: QuizQuestion) => {
    const currentResponse = getCurrentResponse(question.id);

    switch (question.type) {
      case 'single-choice':
        return (
          <RadioGroup
            value={currentResponse as string || ''}
            onValueChange={(value) => handleResponse(question.id, value)}
            className="space-y-3"
          >
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value as string} id={option.id} />
                <Label htmlFor={option.id} className="cursor-pointer flex-1">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multiple-choice':
        const multiResponse = (currentResponse as string[]) || [];
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={multiResponse.includes(option.value as string)}
                  onCheckedChange={(checked) => {
                    const newResponse = checked
                      ? [...multiResponse, option.value as string]
                      : multiResponse.filter(v => v !== option.value);
                    handleResponse(question.id, newResponse);
                  }}
                />
                <Label htmlFor={option.id} className="cursor-pointer flex-1">
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'text':
        return (
          <Textarea
            value={currentResponse as string || ''}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            placeholder="Please share your thoughts..."
            className="min-h-[100px]"
          />
        );

      default:
        return null;
    }
  };

  if (isCompleted && result) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Award className="h-6 w-6 text-yellow-500" />
              Your Personalized Aviation Career Recommendations
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {result.personalizedMessage}
            </p>
          </CardHeader>
        </Card>

        <div className="grid gap-6">
          {result.recommendations.map((rec, index) => (
            <Card key={rec.courseId} className={`${rec.priority === 'high' ? 'ring-2 ring-blue-500' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Plane className="h-5 w-5" />
                      {rec.courseName}
                      {rec.priority === 'high' && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          Top Match
                        </span>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {rec.matchScore}% Match
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {rec.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {rec.cost}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{rec.description}</p>
                
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Why this course is perfect for you:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {rec.reasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Next Steps:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {rec.nextSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    Learn More About {rec.courseName}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline">
                    Download Brochure
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ready to Take the Next Step?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Our aviation career advisors are ready to help you plan your journey:</p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                {result.nextSteps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
              <div className="flex gap-4 pt-4">
                <Button size="lg" className="flex-1 conversion-button" data-conversion="true" data-analytics-event="consultation_request" data-analytics-source="course_recommendation_quiz">
                  Schedule Free Consultation
                </Button>
                <Button variant="outline" size="lg">
                  Call Now: +91-XXXX-XXXX
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Aviation Career Quiz</CardTitle>
            <span className="text-sm text-muted-foreground">
              {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
            </span>
          </div>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {QUIZ_QUESTIONS[currentQuestion].question}
                {QUIZ_QUESTIONS[currentQuestion].required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </h3>
              {renderQuestion(QUIZ_QUESTIONS[currentQuestion])}
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              <Button
                onClick={nextQuestion}
                disabled={!canProceed() || isLoading}
              >
                {currentQuestion === QUIZ_QUESTIONS.length - 1 ? 'Get Recommendations' : 'Next'}
                {isLoading && <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
