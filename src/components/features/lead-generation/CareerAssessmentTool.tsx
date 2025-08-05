'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  CareerAssessmentQuestion, 
  CareerPath, 
  CareerAssessmentResult 
} from '@/lib/types/lead-generation';
import { 
  Plane, 
  Award, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Star,
  Target,
  Users,
  Briefcase
} from 'lucide-react';

const ASSESSMENT_QUESTIONS: CareerAssessmentQuestion[] = [
  {
    id: 'technical_aptitude',
    question: 'How comfortable are you with technical systems and procedures?',
    type: 'rating',
    category: 'skills',
    weight: 0.8
  },
  {
    id: 'stress_management',
    question: 'How well do you handle high-pressure situations?',
    type: 'rating',
    category: 'skills',
    weight: 0.9
  },
  {
    id: 'communication_skills',
    question: 'Rate your communication and teamwork abilities',
    type: 'rating',
    category: 'skills',
    weight: 0.7
  },
  {
    id: 'leadership_interest',
    question: 'How interested are you in leadership and management roles?',
    type: 'rating',
    category: 'interests',
    weight: 0.6
  },
  {
    id: 'travel_preference',
    question: 'How much do you enjoy traveling and being away from home?',
    type: 'rating',
    category: 'interests',
    weight: 0.8
  },
  {
    id: 'teaching_interest',
    question: 'How interested are you in teaching and mentoring others?',
    type: 'rating',
    category: 'interests',
    weight: 0.5
  },
  {
    id: 'work_environment',
    question: 'What type of work environment appeals to you most?',
    type: 'choice',
    options: [
      'Structured airline operations',
      'Flexible charter/private flying',
      'Educational/training environment',
      'Corporate/business aviation',
      'Cargo and logistics operations'
    ],
    category: 'values',
    weight: 0.7
  },
  {
    id: 'career_priority',
    question: 'What is most important to you in your aviation career?',
    type: 'choice',
    options: [
      'High salary and benefits',
      'Job security and stability',
      'Career growth opportunities',
      'Work-life balance',
      'Professional recognition',
      'Making a difference/impact'
    ],
    category: 'values',
    weight: 0.8
  },
  {
    id: 'risk_tolerance',
    question: 'How do you feel about career risks and uncertainties?',
    type: 'choice',
    options: [
      'I prefer stable, predictable careers',
      'I can handle moderate uncertainty',
      'I thrive in dynamic, changing environments',
      'I enjoy taking calculated risks'
    ],
    category: 'personality',
    weight: 0.6
  },
  {
    id: 'decision_making',
    question: 'How do you prefer to make important decisions?',
    type: 'choice',
    options: [
      'Carefully analyze all options',
      'Consult with experts and mentors',
      'Trust my instincts and experience',
      'Follow established procedures'
    ],
    category: 'personality',
    weight: 0.5
  }
];

const CAREER_PATHS: CareerPath[] = [
  {
    id: 'airline_pilot',
    title: 'Airline Pilot',
    description: 'Fly commercial aircraft for scheduled airlines, ensuring safe passenger transport on domestic and international routes.',
    requirements: ['CPL License', 'ATPL (for Captain)', 'Type Rating', 'Medical Certificate', 'English Proficiency'],
    averageSalary: '₹15-80 lakhs per year',
    growthProspects: 'Excellent - Growing aviation market in India',
    timeToAchieve: '2-4 years',
    matchScore: 0,
    pros: [
      'High earning potential',
      'International travel opportunities',
      'Job security with major airlines',
      'Professional prestige',
      'Structured career progression'
    ],
    cons: [
      'High training costs',
      'Irregular schedules',
      'Time away from family',
      'Strict medical requirements',
      'Competitive job market'
    ]
  },
  {
    id: 'charter_pilot',
    title: 'Charter/Private Pilot',
    description: 'Operate private aircraft for individuals, corporations, and charter companies with flexible scheduling.',
    requirements: ['CPL License', 'Multi-engine Rating', 'Instrument Rating', 'Medical Certificate'],
    averageSalary: '₹8-25 lakhs per year',
    growthProspects: 'Good - Growing corporate aviation sector',
    timeToAchieve: '1.5-3 years',
    matchScore: 0,
    pros: [
      'Flexible working hours',
      'Variety in destinations',
      'Personal relationships with clients',
      'Less bureaucracy',
      'Faster career entry'
    ],
    cons: [
      'Income variability',
      'Less job security',
      'Irregular work patterns',
      'Limited benefits',
      'Weather-dependent operations'
    ]
  },
  {
    id: 'flight_instructor',
    title: 'Flight Instructor',
    description: 'Teach aspiring pilots flight skills, ground knowledge, and aviation safety procedures.',
    requirements: ['CPL License', 'Flight Instructor Rating', 'Teaching Experience', 'Communication Skills'],
    averageSalary: '₹4-12 lakhs per year',
    growthProspects: 'Stable - Consistent demand for training',
    timeToAchieve: '2-3 years',
    matchScore: 0,
    pros: [
      'Rewarding teaching experience',
      'Building aviation community',
      'Flexible schedule options',
      'Continuous learning',
      'Lower stress environment'
    ],
    cons: [
      'Lower salary compared to airlines',
      'Repetitive training routines',
      'Student safety responsibility',
      'Limited career advancement',
      'Seasonal demand variations'
    ]
  },
  {
    id: 'cargo_pilot',
    title: 'Cargo Pilot',
    description: 'Transport freight and cargo using specialized aircraft for logistics and shipping companies.',
    requirements: ['CPL License', 'Multi-engine Rating', 'Cargo Operations Training', 'Night Flying Experience'],
    averageSalary: '₹10-35 lakhs per year',
    growthProspects: 'Very Good - E-commerce growth driving demand',
    timeToAchieve: '2-3 years',
    matchScore: 0,
    pros: [
      'Growing market demand',
      'Less passenger-related stress',
      'Interesting cargo operations',
      'Good work-life balance',
      'Stable employment'
    ],
    cons: [
      'Night and irregular hours',
      'Less glamorous than passenger flights',
      'Weather-dependent operations',
      'Physical demands of cargo handling',
      'Limited international exposure'
    ]
  },
  {
    id: 'aviation_management',
    title: 'Aviation Management',
    description: 'Lead aviation operations, airport management, airline administration, or aviation consulting.',
    requirements: ['Aviation Degree/MBA', 'Industry Experience', 'Leadership Skills', 'Regulatory Knowledge'],
    averageSalary: '₹12-50 lakhs per year',
    growthProspects: 'Excellent - Industry expansion needs leaders',
    timeToAchieve: '3-5 years',
    matchScore: 0,
    pros: [
      'High earning potential',
      'Strategic decision making',
      'Industry influence',
      'Diverse career opportunities',
      'Professional growth'
    ],
    cons: [
      'High responsibility and stress',
      'Long working hours',
      'Complex regulatory environment',
      'Requires extensive experience',
      'Competitive advancement'
    ]
  }
];

interface CareerAssessmentToolProps {
  onComplete: (result: CareerAssessmentResult) => void;
  onLeadCapture?: (leadData: any) => void;
}

export default function CareerAssessmentTool({ 
  onComplete, 
  onLeadCapture 
}: CareerAssessmentToolProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, number | string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<CareerAssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const progress = ((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100;

  const handleResponse = (questionId: string, value: number | string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const canProceed = () => {
    const currentQ = ASSESSMENT_QUESTIONS[currentQuestion];
    return responses[currentQ.id] !== undefined;
  };

  const nextQuestion = () => {
    if (currentQuestion < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeAssessment();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateCareerMatches = (responses: Record<string, number | string>): CareerPath[] => {
    const careerPaths = [...CAREER_PATHS];

    careerPaths.forEach(career => {
      let score = 0;
      let totalWeight = 0;

      // Technical aptitude scoring
      const techScore = responses.technical_aptitude as number || 3;
      if (career.id === 'airline_pilot' || career.id === 'cargo_pilot') {
        score += techScore * 0.2;
      } else if (career.id === 'aviation_management') {
        score += techScore * 0.15;
      } else {
        score += techScore * 0.1;
      }
      totalWeight += 0.2;

      // Stress management scoring
      const stressScore = responses.stress_management as number || 3;
      if (career.id === 'airline_pilot') {
        score += stressScore * 0.25;
      } else if (career.id === 'aviation_management') {
        score += stressScore * 0.2;
      } else {
        score += stressScore * 0.15;
      }
      totalWeight += 0.25;

      // Communication skills
      const commScore = responses.communication_skills as number || 3;
      if (career.id === 'flight_instructor') {
        score += commScore * 0.25;
      } else if (career.id === 'aviation_management') {
        score += commScore * 0.2;
      } else {
        score += commScore * 0.15;
      }
      totalWeight += 0.25;

      // Leadership interest
      const leadershipScore = responses.leadership_interest as number || 3;
      if (career.id === 'aviation_management') {
        score += leadershipScore * 0.2;
      } else if (career.id === 'flight_instructor') {
        score += leadershipScore * 0.15;
      } else {
        score += leadershipScore * 0.1;
      }
      totalWeight += 0.2;

      // Travel preference
      const travelScore = responses.travel_preference as number || 3;
      if (career.id === 'airline_pilot') {
        score += travelScore * 0.2;
      } else if (career.id === 'charter_pilot') {
        score += travelScore * 0.15;
      } else if (career.id === 'cargo_pilot') {
        score += travelScore * 0.1;
      }
      totalWeight += 0.2;

      // Teaching interest
      const teachingScore = responses.teaching_interest as number || 3;
      if (career.id === 'flight_instructor') {
        score += teachingScore * 0.3;
      } else {
        score += teachingScore * 0.05;
      }
      totalWeight += 0.3;

      // Work environment preference
      const workEnv = responses.work_environment as string;
      if (workEnv === 'Structured airline operations' && career.id === 'airline_pilot') {
        score += 1;
      } else if (workEnv === 'Flexible charter/private flying' && career.id === 'charter_pilot') {
        score += 1;
      } else if (workEnv === 'Educational/training environment' && career.id === 'flight_instructor') {
        score += 1;
      } else if (workEnv === 'Corporate/business aviation' && career.id === 'aviation_management') {
        score += 1;
      } else if (workEnv === 'Cargo and logistics operations' && career.id === 'cargo_pilot') {
        score += 1;
      }
      totalWeight += 1;

      // Career priority alignment
      const priority = responses.career_priority as string;
      if (priority === 'High salary and benefits' && (career.id === 'airline_pilot' || career.id === 'aviation_management')) {
        score += 0.8;
      } else if (priority === 'Job security and stability' && career.id === 'airline_pilot') {
        score += 0.8;
      } else if (priority === 'Work-life balance' && (career.id === 'flight_instructor' || career.id === 'charter_pilot')) {
        score += 0.8;
      } else if (priority === 'Making a difference/impact' && career.id === 'flight_instructor') {
        score += 0.8;
      }
      totalWeight += 0.8;

      // Normalize score to percentage
      career.matchScore = Math.round((score / totalWeight) * 100);
    });

    return careerPaths.sort((a, b) => b.matchScore - a.matchScore);
  };

  const generateSkillGaps = (responses: Record<string, number | string>, topCareer: CareerPath): string[] => {
    const gaps: string[] = [];
    
    const techScore = responses.technical_aptitude as number || 3;
    const stressScore = responses.stress_management as number || 3;
    const commScore = responses.communication_skills as number || 3;

    if (techScore < 4) {
      gaps.push('Technical systems knowledge and procedures');
    }
    if (stressScore < 4) {
      gaps.push('Stress management and decision-making under pressure');
    }
    if (commScore < 4) {
      gaps.push('Communication and teamwork skills');
    }

    // Career-specific gaps
    if (topCareer.id === 'airline_pilot') {
      gaps.push('Commercial pilot license and type rating');
      gaps.push('Airline-specific procedures and protocols');
    } else if (topCareer.id === 'flight_instructor') {
      gaps.push('Teaching methodology and instructional design');
      gaps.push('Student assessment and evaluation techniques');
    } else if (topCareer.id === 'aviation_management') {
      gaps.push('Business management and leadership skills');
      gaps.push('Aviation regulations and compliance knowledge');
    }

    return gaps;
  };

  const generateRecommendations = (careerPaths: CareerPath[], skillGaps: string[]): string[] => {
    const recommendations: string[] = [];
    const topCareer = careerPaths[0];

    recommendations.push(`Focus on ${topCareer.title} as your primary career path with ${topCareer.matchScore}% compatibility`);
    
    if (skillGaps.length > 0) {
      recommendations.push('Address identified skill gaps through targeted training and development');
    }

    recommendations.push('Consider starting with foundational courses like RTR license and ground school');
    recommendations.push('Connect with industry professionals in your chosen career path');
    recommendations.push('Gain relevant experience through internships or entry-level positions');

    return recommendations;
  };

  const generateActionPlan = (topCareer: CareerPath, responses: Record<string, number | string>): string[] => {
    const plan: string[] = [];
    const timeline = responses.timeline as string;

    plan.push(`Step 1: Complete ${topCareer.requirements[0]} - Start immediately`);
    plan.push('Step 2: Build relevant skills through practical training');
    plan.push('Step 3: Gain industry experience and networking');
    plan.push(`Step 4: Pursue advanced certifications for ${topCareer.title}`);
    plan.push('Step 5: Apply for positions and continue professional development');

    return plan;
  };

  const completeAssessment = async () => {
    setIsLoading(true);
    
    try {
      const careerMatches = calculateCareerMatches(responses);
      const topCareer = careerMatches[0];
      const skillGaps = generateSkillGaps(responses, topCareer);
      const recommendations = generateRecommendations(careerMatches, skillGaps);
      const actionPlan = generateActionPlan(topCareer, responses);

      const assessmentResult: CareerAssessmentResult = {
        topCareerPaths: careerMatches.slice(0, 3),
        skillGaps,
        recommendations,
        actionPlan,
        completedAt: new Date()
      };

      setResult(assessmentResult);
      setIsCompleted(true);
      onComplete(assessmentResult);

      // Track completion
      if (typeof window !== 'undefined') {
        console.log('Career assessment completed:', assessmentResult);
      }

    } catch (error) {
      console.error('Error completing assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuestion = (question: CareerAssessmentQuestion) => {
    const currentResponse = responses[question.id];

    switch (question.type) {
      case 'rating':
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Not at all</span>
              <span>Extremely well</span>
            </div>
            <Slider
              value={[currentResponse as number || 3]}
              onValueChange={(value) => handleResponse(question.id, value[0])}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
            <div className="text-center">
              <Badge variant="outline">
                Rating: {currentResponse || 3}/5
              </Badge>
            </div>
          </div>
        );

      case 'choice':
        return (
          <RadioGroup
            value={currentResponse as string || ''}
            onValueChange={(value) => handleResponse(question.id, value)}
            className="space-y-3"
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`} className="cursor-pointer flex-1">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
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
              <Target className="h-6 w-6 text-blue-500" />
              Your Aviation Career Assessment Results
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Based on your responses, we've identified the best aviation career paths for you
            </p>
          </CardHeader>
        </Card>

        <div className="grid gap-6">
          {result.topCareerPaths.map((career, index) => (
            <Card key={career.id} className={`${index === 0 ? 'ring-2 ring-blue-500' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      {career.title}
                      {index === 0 && (
                        <Badge className="bg-blue-100 text-blue-800">
                          Best Match
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {career.matchScore}% Match
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {career.timeToAchieve}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {career.averageSalary}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {career.growthProspects}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{career.description}</p>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Advantages
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {career.pros.map((pro, idx) => (
                        <li key={idx}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      Considerations
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {career.cons.map((con, idx) => (
                        <li key={idx}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Requirements:</h4>
                  <div className="flex flex-wrap gap-2">
                    {career.requirements.map((req, idx) => (
                      <Badge key={idx} variant="outline">{req}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    Explore {career.title} Path
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Skill Development Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.skillGaps.map((gap, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-blue-500" />
                    <span className="text-sm">{gap}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Action Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.actionPlan.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                    {idx + 1}
                  </div>
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 pt-6">
              <Button size="lg" className="flex-1 conversion-button" data-conversion="true" data-analytics-event="career_consultation_request" data-analytics-source="career_assessment_tool">
                Schedule Career Consultation
              </Button>
              <Button variant="outline" size="lg">
                Download Career Guide
              </Button>
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
            <CardTitle>Aviation Career Assessment</CardTitle>
            <span className="text-sm text-muted-foreground">
              {currentQuestion + 1} of {ASSESSMENT_QUESTIONS.length}
            </span>
          </div>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {ASSESSMENT_QUESTIONS[currentQuestion].question}
              </h3>
              {renderQuestion(ASSESSMENT_QUESTIONS[currentQuestion])}
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
                {currentQuestion === ASSESSMENT_QUESTIONS.length - 1 ? 'Get Results' : 'Next'}
                {isLoading && <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
