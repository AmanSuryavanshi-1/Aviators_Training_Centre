'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TrainingCostInput, 
  CostBreakdown, 
  FinancingOption, 
  CostCalculatorResult 
} from '@/lib/types/lead-generation';
import { 
  Calculator, 
  DollarSign, 
  CreditCard, 
  PiggyBank, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Download,
  Phone,
  ArrowRight,
  Info
} from 'lucide-react';

const COURSE_COSTS = {
  CPL: {
    base: 3500000, // ₹35 lakhs
    groundSchool: 300000,
    flightTraining: 2800000,
    examFees: 50000,
    medicalFees: 25000,
    licenseProcessing: 75000
  },
  ATPL: {
    base: 2500000, // ₹25 lakhs
    groundSchool: 400000,
    theoryExams: 100000,
    practicalTraining: 1800000,
    examFees: 75000,
    licenseProcessing: 125000
  },
  'Type Rating': {
    base: 2000000, // ₹20 lakhs
    groundTraining: 200000,
    simulatorTraining: 1500000,
    checkRide: 150000,
    certification: 100000,
    accommodation: 50000
  },
  RTR: {
    base: 35000, // ₹35,000
    groundClasses: 15000,
    studyMaterial: 5000,
    examFees: 10000,
    licenseProcessing: 5000
  },
  'Interview Prep': {
    base: 150000, // ₹1.5 lakhs
    coaching: 100000,
    mockInterviews: 30000,
    materials: 10000,
    certification: 10000
  }
};

const LOCATION_MULTIPLIERS = {
  Delhi: 1.1,
  Mumbai: 1.15,
  Bangalore: 1.05,
  Other: 1.0
};

const ACCOMMODATION_COSTS = {
  hostel: { monthly: 15000, description: 'Shared hostel accommodation' },
  pg: { monthly: 25000, description: 'Paying guest accommodation' },
  rental: { monthly: 35000, description: 'Private rental apartment' },
  home: { monthly: 0, description: 'Living at home' }
};

const MEAL_COSTS = {
  included: { monthly: 0, description: 'Meals included in accommodation' },
  self: { monthly: 8000, description: 'Self-cooking arrangement' },
  canteen: { monthly: 12000, description: 'Institute canteen meals' }
};

const STUDY_MATERIALS = {
  basic: { cost: 25000, description: 'Basic books and materials' },
  premium: { cost: 50000, description: 'Premium study package with online resources' },
  digital: { cost: 15000, description: 'Digital-only study materials' }
};

const ADDITIONAL_SERVICES = [
  { id: 'simulator_extra', name: 'Additional Simulator Hours', cost: 150000 },
  { id: 'english_proficiency', name: 'English Proficiency Training', cost: 75000 },
  { id: 'interview_coaching', name: 'Interview Preparation Coaching', cost: 100000 },
  { id: 'career_counseling', name: 'Career Counseling Sessions', cost: 25000 },
  { id: 'medical_assistance', name: 'Medical Examination Assistance', cost: 15000 },
  { id: 'visa_assistance', name: 'Visa Processing Assistance', cost: 50000 }
];

const FINANCING_OPTIONS: FinancingOption[] = [
  {
    id: 'education_loan',
    name: 'Education Loan',
    type: 'loan',
    description: 'Traditional education loan from banks with competitive interest rates',
    eligibility: ['Indian citizen', 'Co-applicant required', 'Income proof', 'Collateral for amounts >₹7.5L'],
    interestRate: 9.5,
    tenure: 84, // months
    provider: 'Major Banks (SBI, HDFC, ICICI)',
    applicationLink: '/apply-education-loan'
  },
  {
    id: 'aviation_loan',
    name: 'Aviation-Specific Loan',
    type: 'loan',
    description: 'Specialized loans for aviation training with industry-specific terms',
    eligibility: ['Age 18-35', 'Medical fitness certificate', 'Academic qualifications', 'Career prospects assessment'],
    interestRate: 11.0,
    tenure: 96,
    provider: 'Aviation Finance Companies',
    applicationLink: '/apply-aviation-loan'
  },
  {
    id: 'emi_plan',
    name: 'Institute EMI Plan',
    type: 'emi',
    description: 'Flexible EMI options directly with the training institute',
    eligibility: ['Enrollment confirmation', 'Down payment 30%', 'Guarantor required'],
    interestRate: 8.0,
    tenure: 24,
    provider: 'Aviators Training Centre',
    applicationLink: '/apply-emi-plan'
  },
  {
    id: 'scholarship',
    name: 'Merit Scholarship',
    type: 'scholarship',
    description: 'Merit-based scholarships for deserving candidates',
    eligibility: ['Academic excellence', 'Entrance test performance', 'Financial need assessment'],
    provider: 'Aviators Training Centre',
    applicationLink: '/apply-scholarship'
  },
  {
    id: 'installment_plan',
    name: 'Flexible Installments',
    type: 'installment',
    description: 'Pay in installments aligned with training milestones',
    eligibility: ['Course enrollment', 'Initial deposit', 'Progress-based payments'],
    provider: 'Aviators Training Centre',
    applicationLink: '/apply-installments'
  }
];

interface PilotTrainingCostCalculatorProps {
  onComplete: (result: CostCalculatorResult) => void;
  onLeadCapture?: (leadData: any) => void;
}

export default function PilotTrainingCostCalculator({ 
  onComplete, 
  onLeadCapture 
}: PilotTrainingCostCalculatorProps) {
  const [input, setInput] = useState<TrainingCostInput>({
    courseType: 'CPL',
    location: 'Delhi',
    accommodationType: 'hostel',
    mealPlan: 'canteen',
    studyMaterials: 'basic',
    examAttempts: 1,
    additionalServices: []
  });
  
  const [result, setResult] = useState<CostCalculatorResult | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [selectedFinancing, setSelectedFinancing] = useState<string>('');

  const calculateCosts = () => {
    const courseCosts = COURSE_COSTS[input.courseType];
    const locationMultiplier = LOCATION_MULTIPLIERS[input.location];
    const accommodationCost = ACCOMMODATION_COSTS[input.accommodationType];
    const mealCost = MEAL_COSTS[input.mealPlan];
    const materialCost = STUDY_MATERIALS[input.studyMaterials];

    // Calculate training duration in months
    const trainingDuration = input.courseType === 'CPL' ? 18 : 
                           input.courseType === 'ATPL' ? 12 : 
                           input.courseType === 'Type Rating' ? 2 : 
                           input.courseType === 'RTR' ? 1 : 3;

    const breakdown: CostBreakdown[] = [];

    // Base course cost
    const baseCost = Math.round(courseCosts.base * locationMultiplier);
    breakdown.push({
      category: `${input.courseType} Training Fee`,
      amount: baseCost,
      description: 'Complete training program including ground school and practical training',
      isOptional: false
    });

    // Accommodation costs
    if (accommodationCost.monthly > 0) {
      const totalAccommodation = accommodationCost.monthly * trainingDuration;
      breakdown.push({
        category: 'Accommodation',
        amount: totalAccommodation,
        description: `${accommodationCost.description} for ${trainingDuration} months`,
        isOptional: false
      });
    }

    // Meal costs
    if (mealCost.monthly > 0) {
      const totalMeals = mealCost.monthly * trainingDuration;
      breakdown.push({
        category: 'Meals',
        amount: totalMeals,
        description: `${mealCost.description} for ${trainingDuration} months`,
        isOptional: false
      });
    }

    // Study materials
    breakdown.push({
      category: 'Study Materials',
      amount: materialCost.cost,
      description: materialCost.description,
      isOptional: false
    });

    // Additional exam attempts
    if (input.examAttempts > 1) {
      const extraAttempts = input.examAttempts - 1;
      const examFee = input.courseType === 'CPL' ? 25000 : 
                     input.courseType === 'ATPL' ? 35000 : 
                     input.courseType === 'Type Rating' ? 50000 : 5000;
      breakdown.push({
        category: 'Additional Exam Attempts',
        amount: extraAttempts * examFee,
        description: `${extraAttempts} additional exam attempt(s)`,
        isOptional: true
      });
    }

    // Additional services
    input.additionalServices.forEach(serviceId => {
      const service = ADDITIONAL_SERVICES.find(s => s.id === serviceId);
      if (service) {
        breakdown.push({
          category: service.name,
          amount: service.cost,
          description: 'Optional additional service',
          isOptional: true
        });
      }
    });

    const totalCost = breakdown.reduce((sum, item) => sum + item.amount, 0);

    // Calculate financing options
    const financingOptions = FINANCING_OPTIONS.map(option => {
      const finOption = { ...option };
      
      if (option.type === 'loan' || option.type === 'emi') {
        const principal = totalCost;
        const monthlyRate = (option.interestRate || 0) / 100 / 12;
        const tenure = option.tenure || 60;
        
        if (monthlyRate > 0) {
          const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                               (Math.pow(1 + monthlyRate, tenure) - 1);
          finOption.monthlyPayment = Math.round(monthlyPayment);
          finOption.totalAmount = Math.round(monthlyPayment * tenure);
        }
      }
      
      return finOption;
    });

    // Generate recommendations
    const recommendations = [
      'Consider starting with RTR license to begin your aviation journey cost-effectively',
      'Look into merit scholarships and financial aid options',
      'Plan your training timeline to optimize costs and career progression',
      'Explore education loans with competitive interest rates'
    ];

    // Generate savings tips
    const savings = [
      'Choose accommodation wisely - hostel can save ₹20,000+ per month',
      'Opt for digital study materials to save ₹35,000',
      'Prepare well for exams to avoid additional attempt fees',
      'Consider training in tier-2 cities for lower living costs'
    ];

    const calculatorResult: CostCalculatorResult = {
      totalCost,
      breakdown,
      financingOptions,
      recommendations,
      savings,
      timeline: `${trainingDuration} months`
    };

    setResult(calculatorResult);
    setIsCalculated(true);
    onComplete(calculatorResult);
  };

  const handleInputChange = (field: keyof TrainingCostInput, value: any) => {
    setInput(prev => ({ ...prev, [field]: value }));
    setIsCalculated(false);
  };

  const handleAdditionalServiceToggle = (serviceId: string, checked: boolean) => {
    setInput(prev => ({
      ...prev,
      additionalServices: checked 
        ? [...prev.additionalServices, serviceId]
        : prev.additionalServices.filter(id => id !== serviceId)
    }));
    setIsCalculated(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isCalculated && result) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Calculator className="h-6 w-6 text-green-500" />
              Your Training Cost Breakdown
            </CardTitle>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {formatCurrency(result.totalCost)}
            </div>
            <p className="text-muted-foreground">
              Complete cost for {input.courseType} training in {input.location}
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Detailed Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.breakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.category}</span>
                      {item.isOptional && (
                        <Badge variant="outline" className="text-xs">Optional</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(item.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Financing Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {result.financingOptions.map((option) => (
                <div key={option.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{option.name}</h4>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    <Badge variant={option.type === 'scholarship' ? 'default' : 'outline'}>
                      {option.type}
                    </Badge>
                  </div>
                  
                  {option.monthlyPayment && (
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Monthly Payment:</span>
                        <div className="font-semibold">{formatCurrency(option.monthlyPayment)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Amount:</span>
                        <div className="font-semibold">{formatCurrency(option.totalAmount || 0)}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3">
                    <span className="text-sm text-muted-foreground">Eligibility:</span>
                    <ul className="text-sm list-disc list-inside mt-1">
                      {option.eligibility.slice(0, 2).map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="flex-1">
                      Apply Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      Learn More
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5" />
                Money-Saving Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.savings.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 text-blue-500" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ready to Start Your Aviation Journey?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Our financial advisors can help you plan your training investment:</p>
              <div className="flex gap-4">
                <Button size="lg" className="flex-1">
                  <Phone className="mr-2 h-4 w-4" />
                  Schedule Financial Consultation
                </Button>
                <Button variant="outline" size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  Download Cost Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => {
              setIsCalculated(false);
              setResult(null);
            }}
          >
            Recalculate Costs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Pilot Training Cost Calculator
          </CardTitle>
          <p className="text-muted-foreground">
            Get accurate cost estimates for your aviation training journey
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="courseType">Course Type</Label>
                <Select 
                  value={input.courseType} 
                  onValueChange={(value: any) => handleInputChange('courseType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CPL">Commercial Pilot License (CPL)</SelectItem>
                    <SelectItem value="ATPL">Airline Transport Pilot License (ATPL)</SelectItem>
                    <SelectItem value="Type Rating">Type Rating (A320/B737)</SelectItem>
                    <SelectItem value="RTR">RTR License</SelectItem>
                    <SelectItem value="Interview Prep">Interview Preparation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Training Location</Label>
                <Select 
                  value={input.location} 
                  onValueChange={(value: any) => handleInputChange('location', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                    <SelectItem value="Bangalore">Bangalore</SelectItem>
                    <SelectItem value="Other">Other Cities</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="accommodation">Accommodation Type</Label>
                <Select 
                  value={input.accommodationType} 
                  onValueChange={(value: any) => handleInputChange('accommodationType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select accommodation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hostel">Hostel (₹15,000/month)</SelectItem>
                    <SelectItem value="pg">Paying Guest (₹25,000/month)</SelectItem>
                    <SelectItem value="rental">Private Rental (₹35,000/month)</SelectItem>
                    <SelectItem value="home">Living at Home (₹0/month)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="meals">Meal Plan</Label>
                <Select 
                  value={input.mealPlan} 
                  onValueChange={(value: any) => handleInputChange('mealPlan', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select meal plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="included">Included in Accommodation (₹0/month)</SelectItem>
                    <SelectItem value="self">Self Cooking (₹8,000/month)</SelectItem>
                    <SelectItem value="canteen">Institute Canteen (₹12,000/month)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="materials">Study Materials</Label>
                <Select 
                  value={input.studyMaterials} 
                  onValueChange={(value: any) => handleInputChange('studyMaterials', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select study materials" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic Package (₹25,000)</SelectItem>
                    <SelectItem value="premium">Premium Package (₹50,000)</SelectItem>
                    <SelectItem value="digital">Digital Only (₹15,000)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="examAttempts">Expected Exam Attempts</Label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={input.examAttempts}
                  onChange={(e) => handleInputChange('examAttempts', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-base font-semibold">Additional Services (Optional)</Label>
              <div className="grid gap-3 mt-3">
                {ADDITIONAL_SERVICES.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={service.id}
                      checked={input.additionalServices.includes(service.id)}
                      onCheckedChange={(checked) => 
                        handleAdditionalServiceToggle(service.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={service.id} className="flex-1 cursor-pointer">
                      <div className="flex justify-between">
                        <span>{service.name}</span>
                        <span className="text-muted-foreground">
                          {formatCurrency(service.cost)}
                        </span>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={calculateCosts} className="w-full" size="lg">
              Calculate Training Costs
              <Calculator className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}