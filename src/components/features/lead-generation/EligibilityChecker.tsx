'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  UserProfile, 
  EligibilityRequirement, 
  EligibilityResult, 
  EligibilityCheckResult 
} from '@/lib/types/lead-generation';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  User, 
  GraduationCap, 
  Heart, 
  Globe, 
  Clock,
  ArrowRight,
  FileText,
  Phone,
  Target
} from 'lucide-react';

const COURSE_REQUIREMENTS: Record<string, EligibilityRequirement[]> = {
  CPL: [
    {
      id: 'age_cpl',
      category: 'age',
      requirement: 'Minimum 18 years old',
      description: 'Must be at least 18 years old to apply for CPL',
      isMandatory: true
    },
    {
      id: 'education_cpl',
      category: 'education',
      requirement: '12th grade with Physics and Mathematics',
      description: 'Must have completed 12th grade with Physics and Mathematics (minimum 50%)',
      isMandatory: true,
      alternatives: ['Diploma in Engineering', 'Graduate degree in any stream']
    },
    {
      id: 'medical_cpl',
      category: 'medical',
      requirement: 'Class 1 Medical Certificate',
      description: 'Must obtain and maintain Class 1 Medical Certificate from DGCA',
      isMandatory: true
    },
    {
      id: 'english_cpl',
      category: 'language',
      requirement: 'English proficiency (ICAO Level 4)',
      description: 'Must demonstrate English proficiency at ICAO Level 4 or higher',
      isMandatory: true
    },
    {
      id: 'rtr_cpl',
      category: 'experience',
      requirement: 'RTR License',
      description: 'Must have valid Restricted Radio Telephone (RTR) license',
      isMandatory: true
    }
  ],
  ATPL: [
    {
      id: 'age_atpl',
      category: 'age',
      requirement: 'Minimum 23 years old',
      description: 'Must be at least 23 years old to apply for ATPL',
      isMandatory: true
    },
    {
      id: 'cpl_atpl',
      category: 'experience',
      requirement: 'Valid CPL License',
      description: 'Must hold a valid Commercial Pilot License',
      isMandatory: true
    },
    {
      id: 'flight_hours_atpl',
      category: 'experience',
      requirement: '1500 hours total flight time',
      description: 'Must have minimum 1500 hours of flight experience',
      isMandatory: true
    },
    {
      id: 'medical_atpl',
      category: 'medical',
      requirement: 'Class 1 Medical Certificate',
      description: 'Must maintain valid Class 1 Medical Certificate',
      isMandatory: true
    },
    {
      id: 'english_atpl',
      category: 'language',
      requirement: 'English proficiency (ICAO Level 4)',
      description: 'Must maintain English proficiency at ICAO Level 4 or higher',
      isMandatory: true
    }
  ],
  'Type Rating': [
    {
      id: 'cpl_type',
      category: 'experience',
      requirement: 'Valid CPL or ATPL License',
      description: 'Must hold a valid Commercial Pilot License or ATPL',
      isMandatory: true
    },
    {
      id: 'multi_engine_type',
      category: 'experience',
      requirement: 'Multi-engine aircraft experience',
      description: 'Must have experience flying multi-engine aircraft',
      isMandatory: true
    },
    {
      id: 'medical_type',
      category: 'medical',
      requirement: 'Valid Medical Certificate',
      description: 'Must have current medical certificate',
      isMandatory: true
    },
    {
      id: 'english_type',
      category: 'language',
      requirement: 'English proficiency (ICAO Level 4)',
      description: 'Must demonstrate English proficiency for international operations',
      isMandatory: true
    }
  ],
  RTR: [
    {
      id: 'age_rtr',
      category: 'age',
      requirement: 'Minimum 18 years old',
      description: 'Must be at least 18 years old to apply for RTR license',
      isMandatory: true
    },
    {
      id: 'education_rtr',
      category: 'education',
      requirement: '12th grade or equivalent',
      description: 'Must have completed 12th grade or equivalent qualification',
      isMandatory: true
    },
    {
      id: 'english_rtr',
      category: 'language',
      requirement: 'Basic English proficiency',
      description: 'Must be able to communicate effectively in English',
      isMandatory: true
    }
  ]
};

interface EligibilityCheckerProps {
  onComplete: (result: EligibilityCheckResult) => void;
  onLeadCapture?: (leadData: any) => void;
}

export default function EligibilityChecker({ 
  onComplete, 
  onLeadCapture 
}: EligibilityCheckerProps) {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: 18,
    education: '',
    experience: '',
    medicalStatus: 'pending',
    englishProficiency: 'intermediate',
    previousTraining: [],
    location: ''
  });

  const [selectedCourses, setSelectedCourses] = useState<string[]>(['CPL']);
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<EligibilityCheckResult | null>(null);

  const handleProfileChange = (field: keyof UserProfile, value: any) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleCourseToggle = (courseId: string, checked: boolean) => {
    setSelectedCourses(prev => 
      checked 
        ? [...prev, courseId]
        : prev.filter(id => id !== courseId)
    );
  };

  const checkEligibility = () => {
    const results: EligibilityResult[] = [];

    selectedCourses.forEach(courseId => {
      const requirements = COURSE_REQUIREMENTS[courseId] || [];
      const metRequirements: EligibilityRequirement[] = [];
      const missingRequirements: EligibilityRequirement[] = [];

      requirements.forEach(req => {
        let isMet = false;

        switch (req.category) {
          case 'age':
            if (req.id === 'age_cpl' || req.id === 'age_rtr') {
              isMet = userProfile.age >= 18;
            } else if (req.id === 'age_atpl') {
              isMet = userProfile.age >= 23;
            }
            break;

          case 'education':
            if (req.id === 'education_cpl') {
              isMet = ['12th_pcm', 'diploma', 'graduate', 'postgraduate'].includes(userProfile.education);
            } else if (req.id === 'education_rtr') {
              isMet = userProfile.education !== '';
            }
            break;

          case 'medical':
            isMet = userProfile.medicalStatus === 'fit';
            break;

          case 'language':
            isMet = ['intermediate', 'advanced'].includes(userProfile.englishProficiency);
            break;

          case 'experience':
            if (req.id === 'rtr_cpl') {
              isMet = userProfile.previousTraining?.includes('RTR') || false;
            } else if (req.id === 'cpl_atpl' || req.id === 'cpl_type') {
              isMet = userProfile.previousTraining?.includes('CPL') || false;
            } else if (req.id === 'flight_hours_atpl') {
              isMet = userProfile.experience === 'experienced';
            } else if (req.id === 'multi_engine_type') {
              isMet = userProfile.experience === 'experienced' || userProfile.previousTraining?.includes('Multi-engine') || false;
            }
            break;
        }

        if (isMet) {
          metRequirements.push(req);
        } else {
          missingRequirements.push(req);
        }
      });

      const eligibilityScore = (metRequirements.length / requirements.length) * 100;
      const isEligible = missingRequirements.filter(req => req.isMandatory).length === 0;

      const recommendations = generateRecommendations(courseId, missingRequirements, userProfile);
      const nextSteps = generateNextSteps(courseId, missingRequirements, isEligible);
      const estimatedTime = estimateTimeToEligibility(missingRequirements, userProfile);

      results.push({
        courseId,
        courseName: getCourseDisplayName(courseId),
        isEligible,
        eligibilityScore: Math.round(eligibilityScore),
        metRequirements,
        missingRequirements,
        recommendations,
        nextSteps,
        estimatedTimeToEligibility: estimatedTime
      });
    });

    const overallRecommendation = generateOverallRecommendation(results, userProfile);
    const priorityActions = generatePriorityActions(results);

    const checkResult: EligibilityCheckResult = {
      userProfile,
      results: results.sort((a, b) => b.eligibilityScore - a.eligibilityScore),
      overallRecommendation,
      priorityActions,
      completedAt: new Date()
    };

    setResult(checkResult);
    setIsCompleted(true);
    onComplete(checkResult);
  };

  const getCourseDisplayName = (courseId: string): string => {
    const names: Record<string, string> = {
      CPL: 'Commercial Pilot License (CPL)',
      ATPL: 'Airline Transport Pilot License (ATPL)',
      'Type Rating': 'Type Rating (A320/B737)',
      RTR: 'RTR License'
    };
    return names[courseId] || courseId;
  };

  const generateRecommendations = (
    courseId: string, 
    missingReqs: EligibilityRequirement[], 
    profile: UserProfile
  ): string[] => {
    const recommendations: string[] = [];

    if (courseId === 'CPL' && profile.age < 18) {
      recommendations.push('Wait until you turn 18 to begin CPL training');
    }

    if (missingReqs.some(req => req.category === 'education')) {
      recommendations.push('Complete your educational requirements first');
    }

    if (missingReqs.some(req => req.id === 'rtr_cpl')) {
      recommendations.push('Start with RTR license - it\'s quick and affordable');
    }

    if (missingReqs.some(req => req.category === 'medical')) {
      recommendations.push('Schedule your medical examination with a DGCA-approved doctor');
    }

    if (profile.englishProficiency === 'basic') {
      recommendations.push('Improve English proficiency through specialized aviation English courses');
    }

    return recommendations;
  };

  const generateNextSteps = (
    courseId: string, 
    missingReqs: EligibilityRequirement[], 
    isEligible: boolean
  ): string[] => {
    if (isEligible) {
      return [
        `Apply for ${getCourseDisplayName(courseId)} program`,
        'Submit required documents and fees',
        'Schedule orientation and begin training',
        'Complete ground school and practical training'
      ];
    }

    const steps: string[] = [];
    
    missingReqs.forEach(req => {
      if (req.category === 'education') {
        steps.push('Complete educational requirements');
      } else if (req.category === 'medical') {
        steps.push('Obtain medical certificate');
      } else if (req.id === 'rtr_cpl') {
        steps.push('Complete RTR license first');
      } else if (req.category === 'experience') {
        steps.push('Gain required flight experience');
      }
    });

    steps.push('Recheck eligibility once requirements are met');
    return [...new Set(steps)]; // Remove duplicates
  };

  const estimateTimeToEligibility = (
    missingReqs: EligibilityRequirement[], 
    profile: UserProfile
  ): string => {
    if (missingReqs.length === 0) return 'Eligible now';

    let maxTime = 0;

    missingReqs.forEach(req => {
      if (req.category === 'education') {
        maxTime = Math.max(maxTime, 12); // 1 year for education
      } else if (req.category === 'medical') {
        maxTime = Math.max(maxTime, 1); // 1 month for medical
      } else if (req.id === 'rtr_cpl') {
        maxTime = Math.max(maxTime, 2); // 2 months for RTR
      } else if (req.category === 'experience') {
        maxTime = Math.max(maxTime, 24); // 2 years for experience
      }
    });

    if (maxTime <= 1) return '1 month';
    if (maxTime <= 6) return `${maxTime} months`;
    return `${Math.round(maxTime / 12)} year${maxTime > 12 ? 's' : ''}`;
  };

  const generateOverallRecommendation = (
    results: EligibilityResult[], 
    profile: UserProfile
  ): string => {
    const eligibleCourses = results.filter(r => r.isEligible);
    
    if (eligibleCourses.length > 0) {
      const topCourse = eligibleCourses[0];
      return `You're eligible for ${topCourse.courseName}! This is an excellent starting point for your aviation career.`;
    }

    const bestOption = results[0];
    return `While you're not currently eligible for ${bestOption.courseName}, you can achieve eligibility in ${bestOption.estimatedTimeToEligibility}. Focus on addressing the missing requirements first.`;
  };

  const generatePriorityActions = (results: EligibilityResult[]): string[] => {
    const allMissingReqs = results.flatMap(r => r.missingRequirements);
    const priorityActions: string[] = [];

    // Group by category and prioritize
    const categories = ['education', 'medical', 'experience', 'language'];
    
    categories.forEach(category => {
      const categoryReqs = allMissingReqs.filter(req => req.category === category);
      if (categoryReqs.length > 0) {
        const req = categoryReqs[0];
        if (category === 'education') {
          priorityActions.push('Complete educational requirements');
        } else if (category === 'medical') {
          priorityActions.push('Schedule medical examination');
        } else if (category === 'experience') {
          priorityActions.push('Start with foundational training (RTR license)');
        } else if (category === 'language') {
          priorityActions.push('Improve English proficiency');
        }
      }
    });

    return priorityActions.slice(0, 3); // Top 3 priorities
  };

  if (isCompleted && result) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Target className="h-6 w-6 text-blue-500" />
              Your Eligibility Assessment Results
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {result.overallRecommendation}
            </p>
          </CardHeader>
        </Card>

        <div className="grid gap-6">
          {result.results.map((courseResult) => (
            <Card key={courseResult.courseId} className={courseResult.isEligible ? 'ring-2 ring-green-500' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      {courseResult.courseName}
                      <Badge 
                        variant={courseResult.isEligible ? 'default' : 'secondary'}
                        className={courseResult.isEligible ? 'bg-green-100 text-green-800' : ''}
                      >
                        {courseResult.isEligible ? 'Eligible' : 'Not Eligible'}
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Eligibility Score:</span>
                        <Progress value={courseResult.eligibilityScore} className="w-20" />
                        <span className="text-sm font-medium">{courseResult.eligibilityScore}%</span>
                      </div>
                      {courseResult.estimatedTimeToEligibility && !courseResult.isEligible && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {courseResult.estimatedTimeToEligibility} to eligibility
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Requirements Met ({courseResult.metRequirements.length})
                    </h4>
                    <ul className="space-y-1">
                      {courseResult.metRequirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 mt-1 text-green-500" />
                          <span>{req.requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-1">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Missing Requirements ({courseResult.missingRequirements.length})
                    </h4>
                    <ul className="space-y-1">
                      {courseResult.missingRequirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <XCircle className="h-3 w-3 mt-1 text-red-500" />
                          <div>
                            <span>{req.requirement}</span>
                            {req.isMandatory && (
                              <Badge variant="outline" className="ml-2 text-xs">Mandatory</Badge>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {courseResult.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Next Steps:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    {courseResult.nextSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" disabled={!courseResult.isEligible}>
                    {courseResult.isEligible ? 'Apply Now' : 'Not Eligible Yet'}
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Priority Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.priorityActions.map((action, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="bg-orange-100 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                    {idx + 1}
                  </div>
                  <span>{action}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 pt-6">
              <Button size="lg" className="flex-1 conversion-button" data-conversion="true" data-analytics-event="eligibility_consultation_request" data-analytics-source="eligibility_checker">
                <Phone className="mr-2 h-4 w-4" />
                Schedule Eligibility Consultation
              </Button>
              <Button variant="outline" size="lg">
                <FileText className="mr-2 h-4 w-4" />
                Download Requirements Guide
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
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Aviation Course Eligibility Checker
          </CardTitle>
          <p className="text-muted-foreground">
            Check your eligibility for various aviation training programs
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  type="number"
                  min="16"
                  max="65"
                  value={userProfile.age}
                  onChange={(e) => handleProfileChange('age', parseInt(e.target.value) || 18)}
                />
              </div>

              <div>
                <Label htmlFor="education">Educational Background</Label>
                <Select 
                  value={userProfile.education} 
                  onValueChange={(value) => handleProfileChange('education', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your education level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10th">10th Grade</SelectItem>
                    <SelectItem value="12th_pcm">12th Grade (Physics, Chemistry, Mathematics)</SelectItem>
                    <SelectItem value="12th_other">12th Grade (Other streams)</SelectItem>
                    <SelectItem value="diploma">Diploma in Engineering</SelectItem>
                    <SelectItem value="graduate">Graduate Degree</SelectItem>
                    <SelectItem value="postgraduate">Post Graduate Degree</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="experience">Aviation Experience</Label>
                <Select 
                  value={userProfile.experience} 
                  onValueChange={(value) => handleProfileChange('experience', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No aviation experience</SelectItem>
                    <SelectItem value="basic">Basic knowledge/courses</SelectItem>
                    <SelectItem value="student">Student pilot</SelectItem>
                    <SelectItem value="private">Private pilot license</SelectItem>
                    <SelectItem value="experienced">Commercial/experienced pilot</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="medical">Medical Status</Label>
                <Select 
                  value={userProfile.medicalStatus} 
                  onValueChange={(value: any) => handleProfileChange('medicalStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select medical status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fit">Medically fit (have certificate)</SelectItem>
                    <SelectItem value="pending">Medical examination pending</SelectItem>
                    <SelectItem value="issues">Have medical concerns</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="english">English Proficiency</Label>
                <Select 
                  value={userProfile.englishProficiency} 
                  onValueChange={(value: any) => handleProfileChange('englishProficiency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select English proficiency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic (can understand simple instructions)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (can communicate effectively)</SelectItem>
                    <SelectItem value="advanced">Advanced (fluent in aviation English)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Select 
                  value={userProfile.location} 
                  onValueChange={(value) => handleProfileChange('location', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delhi">Delhi NCR</SelectItem>
                    <SelectItem value="mumbai">Mumbai</SelectItem>
                    <SelectItem value="bangalore">Bangalore</SelectItem>
                    <SelectItem value="chennai">Chennai</SelectItem>
                    <SelectItem value="hyderabad">Hyderabad</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-semibold">Previous Training/Licenses</Label>
                <div className="grid gap-2 mt-2">
                  {['RTR', 'PPL', 'CPL', 'Multi-engine', 'Instrument Rating'].map((training) => (
                    <div key={training} className="flex items-center space-x-2">
                      <Checkbox
                        id={training}
                        checked={userProfile.previousTraining?.includes(training) || false}
                        onCheckedChange={(checked) => {
                          const current = userProfile.previousTraining || [];
                          const updated = checked 
                            ? [...current, training]
                            : current.filter(t => t !== training);
                          handleProfileChange('previousTraining', updated);
                        }}
                      />
                      <Label htmlFor={training} className="cursor-pointer">
                        {training}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold">Courses to Check</Label>
              <div className="grid gap-2 mt-2">
                {Object.keys(COURSE_REQUIREMENTS).map((courseId) => (
                  <div key={courseId} className="flex items-center space-x-2">
                    <Checkbox
                      id={courseId}
                      checked={selectedCourses.includes(courseId)}
                      onCheckedChange={(checked) => handleCourseToggle(courseId, checked as boolean)}
                    />
                    <Label htmlFor={courseId} className="cursor-pointer">
                      {getCourseDisplayName(courseId)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={checkEligibility} 
              className="w-full" 
              size="lg"
              disabled={selectedCourses.length === 0}
            >
              Check Eligibility
              <Target className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
