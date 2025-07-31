'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CourseRecommendationQuiz from './CourseRecommendationQuiz';
import CareerAssessmentTool from './CareerAssessmentTool';
import PilotTrainingCostCalculator from './PilotTrainingCostCalculator';
import EligibilityChecker from './EligibilityChecker';
import { 
  QuizResult, 
  CareerAssessmentResult, 
  CostCalculatorResult, 
  EligibilityCheckResult 
} from '@/lib/types/lead-generation';
import { useEnhancedLeadScoring } from '@/lib/hooks/use-enhanced-lead-scoring';
import { 
  HelpCircle, 
  Target, 
  Calculator, 
  CheckCircle, 
  ArrowRight,
  Clock,
  Users,
  TrendingUp,
  Award
} from 'lucide-react';

interface LeadGenerationToolsHubProps {
  onLeadCapture?: (leadData: any) => void;
}

export default function LeadGenerationToolsHub({ onLeadCapture }: LeadGenerationToolsHubProps) {
  const [activeTab, setActiveTab] = useState('quiz');
  const [completedTools, setCompletedTools] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<{
    quiz?: QuizResult;
    assessment?: CareerAssessmentResult;
    calculator?: CostCalculatorResult;
    eligibility?: EligibilityCheckResult;
  }>({});

  // Enhanced lead scoring integration
  const {
    profile,
    score,
    updateProfile,
    trackToolInteraction,
    trackIntent,
    getQualityLevel,
    isQualified
  } = useEnhancedLeadScoring({ autoScore: true, autoRoute: true });

  const handleToolComplete = async (toolType: string, result: any) => {
    setCompletedTools(prev => new Set([...prev, toolType]));
    setResults(prev => ({ ...prev, [toolType]: result }));
    
    // Enhanced lead scoring integration
    try {
      // Track tool interaction
      await trackToolInteraction(
        toolType as any,
        true,
        result
      );

      // Extract intent signals from results
      if (result.recommendations || result.topCareerPaths || result.results) {
        const courseInterest: string[] = [];
        
        if (result.recommendations) {
          courseInterest.push(...result.recommendations.map((r: any) => r.courseName || r.courseId));
        }
        
        if (result.topCareerPaths) {
          courseInterest.push(...result.topCareerPaths.map((p: any) => p.title));
        }
        
        if (result.results) {
          result.results.forEach((r: any) => {
            if (r.isEligible && r.courseName) {
              courseInterest.push(r.courseName);
            }
          });
        }

        // Update intent based on tool results
        if (courseInterest.length > 0) {
          await trackIntent({
            courseInterest: [...new Set(courseInterest)], // Remove duplicates
            urgency: result.urgency || 'within_3_months',
            timeline: result.timeline || 'planned'
          });
        }
      }
    } catch (error) {
      console.error('Error updating lead profile:', error);
    }
    
    // Track completion for lead generation
    if (onLeadCapture) {
      onLeadCapture({
        toolType,
        result,
        completedAt: new Date(),
        userId: profile?.userId || 'anonymous',
        leadScore: score?.totalScore,
        leadQuality: score?.quality
      });
    }
  };

  const tools = [
    {
      id: 'quiz',
      title: 'Course Recommendation Quiz',
      description: 'Get personalized course recommendations based on your goals and experience',
      icon: HelpCircle,
      duration: '5-7 minutes',
      difficulty: 'Easy',
      component: CourseRecommendationQuiz,
      benefits: [
        'Personalized course recommendations',
        'Career path guidance',
        'Training timeline planning',
        'Cost estimation overview'
      ]
    },
    {
      id: 'assessment',
      title: 'Career Assessment Tool',
      description: 'Discover the best aviation career path that matches your skills and interests',
      icon: Target,
      duration: '8-10 minutes',
      difficulty: 'Medium',
      component: CareerAssessmentTool,
      benefits: [
        'Career compatibility analysis',
        'Skill gap identification',
        'Professional development roadmap',
        'Industry insights and trends'
      ]
    },
    {
      id: 'calculator',
      title: 'Training Cost Calculator',
      description: 'Calculate accurate training costs and explore financing options',
      icon: Calculator,
      duration: '3-5 minutes',
      difficulty: 'Easy',
      component: PilotTrainingCostCalculator,
      benefits: [
        'Detailed cost breakdown',
        'Financing options comparison',
        'Budget planning assistance',
        'Money-saving recommendations'
      ]
    },
    {
      id: 'eligibility',
      title: 'Eligibility Checker',
      description: 'Check your eligibility for various aviation training programs',
      icon: CheckCircle,
      duration: '4-6 minutes',
      difficulty: 'Easy',
      component: EligibilityChecker,
      benefits: [
        'Instant eligibility assessment',
        'Requirements checklist',
        'Timeline to eligibility',
        'Priority action items'
      ]
    }
  ];

  const getCompletionStats = () => {
    const completed = completedTools.size;
    const total = tools.length;
    const percentage = Math.round((completed / total) * 100);
    return { completed, total, percentage };
  };

  const stats = getCompletionStats();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Aviation Career Planning Tools</CardTitle>
          <p className="text-muted-foreground text-lg mt-2">
            Comprehensive tools to plan your aviation career journey
          </p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-sm">Used by 10,000+ students</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-sm">95% accuracy rate</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <span className="text-sm">Expert-designed</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Lead Quality Indicator */}
      {score && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Lead Quality Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Quality Level:</span>
              <Badge 
                variant={
                  score.quality === 'hot' ? 'destructive' : 
                  score.quality === 'warm' ? 'default' : 
                  score.quality === 'cold' ? 'secondary' : 'outline'
                }
                className="capitalize"
              >
                {score.quality}
              </Badge>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Score:</span>
              <span className="font-semibold">{score.totalScore}/1000</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Qualified:</span>
              <Badge variant={isQualified() ? 'default' : 'outline'}>
                {isQualified() ? 'Yes' : 'No'}
              </Badge>
            </div>
            {score.recommendations.estimatedConversionProbability > 0 && (
              <div className="text-xs text-gray-500 mt-2">
                Conversion Probability: {score.recommendations.estimatedConversionProbability}%
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progress Overview */}
      {stats.completed > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span>Tools Completed</span>
                  <span>{stats.completed}/{stats.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </div>
              <Badge variant="outline" className="text-sm">
                {stats.percentage}% Complete
              </Badge>
            </div>
            {stats.completed === tools.length && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <Award className="h-5 w-5" />
                  <span className="font-semibold">Congratulations!</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  You've completed all career planning tools. Ready to take the next step?
                </p>
                <Button className="mt-3" size="sm">
                  Schedule Career Consultation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tools Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {tools.map((tool) => (
            <TabsTrigger 
              key={tool.id} 
              value={tool.id}
              className="relative"
            >
              <tool.icon className="h-4 w-4 mr-2" />
              {tool.title.split(' ')[0]}
              {completedTools.has(tool.id) && (
                <CheckCircle className="h-3 w-3 ml-1 text-green-500" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {tools.map((tool) => (
          <TabsContent key={tool.id} value={tool.id} className="space-y-6">
            {/* Tool Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <tool.icon className="h-6 w-6" />
                      {tool.title}
                      {completedTools.has(tool.id) && (
                        <Badge className="bg-green-100 text-green-800">
                          Completed
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-muted-foreground mt-2">{tool.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{tool.duration}</span>
                      </div>
                      <Badge variant="outline">{tool.difficulty}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-semibold mb-2">What you'll get:</h4>
                  <ul className="grid grid-cols-2 gap-2">
                    {tool.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Tool Component */}
            <tool.component
              onComplete={(result) => handleToolComplete(tool.id, result)}
              onLeadCapture={onLeadCapture}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Call to Action */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Ready to Start Your Aviation Journey?</CardTitle>
          <p className="text-muted-foreground">
            Our expert advisors are here to help you turn your career plan into reality
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="flex-1 sm:flex-none">
              Schedule Free Consultation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="flex-1 sm:flex-none">
              Download Career Guide
            </Button>
            <Button variant="outline" size="lg" className="flex-1 sm:flex-none">
              Call: +91-XXXX-XXXX
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
