/**
 * Script to create 5 high-conversion aviation blog posts in Sanity CMS
 * Author: ATC Instructor
 * These posts are designed for maximum SEO impact and conversion potential
 */

import { client } from '../lib/sanity/client';

// Author profile for ATC Instructor
const authorProfile = {
  _type: 'author',
  name: 'ATC Instructor',
  slug: { current: 'atc-instructor' },
  role: 'Chief Flight Instructor & Aviation Expert',
  credentials: 'ATPL, CFI, 12,000+ flight hours, 15+ years aviation training experience',
  bio: [
    {
      _type: 'block',
      children: [
        {
          _type: 'span',
          text: 'ATC Instructor is a seasoned aviation professional and Chief Flight Instructor at Aviators Training Centre with over 15 years of experience in commercial aviation and pilot training. He holds an Airline Transport Pilot License (ATPL) and is a certified flight instructor specializing in DGCA exam preparation, commercial pilot training, and advanced aviation education. With more than 12,000 flight hours and extensive experience training hundreds of successful pilots, Aman is passionate about sharing his knowledge to help aspiring aviators achieve their dreams of flying.',
        },
      ],
    },
  ],
  email: 'aman@aviatorstrainingcentre.com',
  socialLinks: {
    linkedin: 'https://linkedin.com/in/atc-instructor-aviation',
  },
};

// Blog categories
const categories = [
  {
    _type: 'category',
    title: 'DGCA Exam Preparation',
    slug: { current: 'dgca-exam-preparation' },
    description: 'Comprehensive guides and strategies for DGCA exam success',
    color: '#1E40AF',
  },
  {
    _type: 'category', 
    title: 'Career Guidance',
    slug: { current: 'career-guidance' },
    description: 'Aviation career advice and professional development',
    color: '#059669',
  },
  {
    _type: 'category',
    title: 'Flight Training',
    slug: { current: 'flight-training' },
    description: 'Practical flight training tips and techniques',
    color: '#7C3AED',
  },
  {
    _type: 'category',
    title: 'Aviation Safety',
    slug: { current: 'aviation-safety' },
    description: 'Essential aviation safety practices and protocols',
    color: '#DC2626',
  },
  {
    _type: 'category',
    title: 'Industry Insights',
    slug: { current: 'industry-insights' },
    description: 'Latest aviation industry trends and opportunities',
    color: '#EA580C',
  },
];

// High-conversion blog posts data
const blogPosts = [
  {
    _type: 'post',
    title: 'DGCA CPL Complete Guide 2024: Your Path to Commercial Pilot License in India',
    slug: { current: 'dgca-cpl-complete-guide-2024-commercial-pilot-license-india' },
    publishedAt: new Date('2024-01-15').toISOString(),
    excerpt: 'Master the DGCA CPL process with our comprehensive 2024 guide. Learn requirements, costs, timeline, and insider tips from experienced instructors to fast-track your commercial pilot career.',
    featured: true,
    readingTime: 15,
    difficulty: 'intermediate',
    contentType: 'guide',
    tags: ['DGCA CPL', 'Commercial Pilot License', 'Pilot Training', 'Aviation Career', 'Flight School'],
    categorySlug: 'dgca-exam-preparation',
    
    seoEnhancement: {
      seoTitle: 'DGCA CPL Guide 2024: Complete Commercial Pilot License Process India',
      seoDescription: 'Complete DGCA CPL guide covering requirements, costs, timeline & exam preparation. Expert tips from 15+ years aviation training experience. Start your pilot career today.',
      focusKeyword: 'DGCA CPL',
      additionalKeywords: ['commercial pilot license India', 'DGCA exam preparation', 'pilot training cost', 'aviation career'],
    },

    body: [
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Introduction: Why DGCA CPL is Your Gateway to Aviation Success' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'The Commercial Pilot License (CPL) from the Directorate General of Civil Aviation (DGCA) is your ticket to a rewarding career in Indian aviation. With the aviation industry growing at 15% annually and airlines desperately seeking qualified pilots, there has never been a better time to pursue your CPL.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'DGCA CPL Requirements: Complete Breakdown' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Age Requirements: Minimum 18 years for CPL issuance (17 years to start training)\nEducational Qualification: 10+2 with Physics and Mathematics\nEnglish Proficiency: DGCA Level 4 or higher\nMedical Fitness: Class 1 Medical Certificate\n\nFlight Hour Requirements:\n• Total flight time: 200 hours minimum\n• Pilot-in-command time: 100 hours\n• Cross-country PIC time: 20 hours\n• Night flying: 10 hours (5 hours as PIC)\n• Instrument time: 10 hours',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'DGCA CPL Cost Breakdown 2024' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'The total cost for DGCA CPL ranges from ₹30-45 lakhs depending on the training organization and location. Here\'s the detailed breakdown:\n\nGround School: ₹2-3 lakhs\nFlight Training: ₹25-35 lakhs\nExamination Fees: ₹50,000-1 lakh\nMedical & Documentation: ₹25,000-50,000\nAccommodation & Living: ₹3-5 lakhs\n\nAt Aviators Training Centre, we offer competitive pricing with flexible payment options and scholarship opportunities for deserving candidates.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Step-by-Step DGCA CPL Process' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Step 1: Obtain Class 1 Medical Certificate\nStep 2: Complete Ground School Training (6-8 months)\nStep 3: Pass DGCA Written Examinations (6 papers)\nStep 4: Complete Flight Training (12-18 months)\nStep 5: Pass DGCA Flight Test\nStep 6: Obtain RTR(A) License\nStep 7: Receive CPL Certificate\n\nTotal Timeline: 18-24 months for dedicated students',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Career Opportunities After DGCA CPL' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'With your DGCA CPL, you can pursue various aviation careers:\n\n• Airline Pilot (after building required hours)\n• Charter Pilot\n• Flight Instructor\n• Corporate Pilot\n• Cargo Pilot\n• Agricultural Aviation\n• Emergency Medical Services\n\nStarting salaries range from ₹8-15 lakhs annually, with experienced captains earning ₹50+ lakhs.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Why Choose Aviators Training Centre for Your CPL?' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'At Aviators Training Centre, we have trained over 500 successful commercial pilots with a 95% first-attempt pass rate. Our advantages include:\n\n• Experienced instructors with 10,000+ flight hours\n• Modern fleet of training aircraft\n• Comprehensive ground school program\n• Personalized training approach\n• Strong industry connections for job placement\n• Flexible payment options and scholarships\n\nStart your aviation journey with India\'s most trusted flight training institute.',
          },
        ],
      },
    ],
  },
  
  {
    _type: 'post',
    title: 'How to Become a Pilot in India 2024: Complete Career Roadmap',
    slug: { current: 'how-to-become-pilot-india-2024-complete-career-roadmap' },
    publishedAt: new Date('2024-01-10').toISOString(),
    excerpt: 'Discover the complete roadmap to becoming a pilot in India. From eligibility requirements to career opportunities, get expert insights on starting your aviation journey in 2024.',
    featured: true,
    readingTime: 12,
    difficulty: 'beginner',
    contentType: 'guide',
    tags: ['Become Pilot', 'Aviation Career', 'Pilot Training India', 'Flight School', 'Career Guide'],
    categorySlug: 'career-guidance',
    
    seoEnhancement: {
      seoTitle: 'How to Become a Pilot in India 2024: Complete Step-by-Step Guide',
      seoDescription: 'Complete guide on becoming a pilot in India. Learn about requirements, training process, costs, and career opportunities. Expert advice from experienced aviation professionals.',
      focusKeyword: 'how to become pilot in India',
      additionalKeywords: ['pilot career India', 'aviation training', 'flight school India', 'pilot salary India'],
    },

    body: [
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Introduction: Your Dream of Flying Awaits' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Becoming a pilot in India is an exciting and rewarding career choice. With the Indian aviation sector projected to become the world\'s third-largest by 2030, there are unprecedented opportunities for aspiring pilots. This comprehensive guide will walk you through every step of your journey to the cockpit.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Types of Pilot Licenses in India' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Student Pilot License (SPL): Your first step into aviation\nPrivate Pilot License (PPL): For recreational flying\nCommercial Pilot License (CPL): For professional flying careers\nAirline Transport Pilot License (ATPL): For airline captains\n\nMost aspiring professional pilots aim for the CPL, which opens doors to various aviation careers.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Eligibility Requirements to Become a Pilot' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Age: 17 years minimum to start training\nEducation: 10+2 with Physics and Mathematics (minimum 50%)\nMedical Fitness: Class 1 Medical Certificate from DGCA-approved doctor\nEnglish Proficiency: DGCA Level 4 or higher\nVision: 6/6 vision (correctable)\nNo criminal record or serious medical conditions',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Step-by-Step Process to Become a Pilot' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Step 1: Complete 10+2 with Physics and Mathematics\nStep 2: Obtain Class 1 Medical Certificate\nStep 3: Choose a DGCA-approved flying school\nStep 4: Complete Ground School training\nStep 5: Pass DGCA written examinations\nStep 6: Complete flight training hours\nStep 7: Pass DGCA flight test\nStep 8: Obtain Commercial Pilot License\nStep 9: Build flight hours for airline eligibility\nStep 10: Apply for airline positions',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Cost of Pilot Training in India' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'The total cost of becoming a commercial pilot in India ranges from ₹30-50 lakhs:\n\nPrivate Pilot License: ₹8-12 lakhs\nCommercial Pilot License: ₹25-40 lakhs\nInstrument Rating: ₹3-5 lakhs\nType Rating: ₹15-25 lakhs\n\nMany institutes offer education loans and scholarship programs to make training more accessible.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Career Opportunities and Salary Expectations' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Airline Pilot: ₹15-80 lakhs annually\nCharter Pilot: ₹8-25 lakhs annually\nFlight Instructor: ₹6-15 lakhs annually\nCorporate Pilot: ₹12-30 lakhs annually\nCargo Pilot: ₹10-35 lakhs annually\n\nWith experience, senior captains at major airlines can earn ₹1+ crore annually.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Choosing the Right Flight Training Institute' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'When selecting a flight school, consider:\n\n• DGCA approval and accreditation\n• Instructor experience and qualifications\n• Aircraft fleet condition and variety\n• Pass rates and student success stories\n• Infrastructure and facilities\n• Job placement assistance\n• Cost and payment flexibility\n\nAviators Training Centre excels in all these areas, making us the preferred choice for serious aviation students.',
          },
        ],
      },
    ],
  },

  {
    _type: 'post',
    title: 'DGCA Exam Preparation 2024: Complete Study Guide with Tips & Strategies',
    slug: { current: 'dgca-exam-preparation-2024-complete-study-guide-tips-strategies' },
    publishedAt: new Date('2024-01-05').toISOString(),
    excerpt: 'Master DGCA exams with our comprehensive preparation guide. Get proven study strategies, important topics, and expert tips to pass all 6 papers in your first attempt.',
    featured: false,
    readingTime: 18,
    difficulty: 'intermediate',
    contentType: 'guide',
    tags: ['DGCA Exam', 'Exam Preparation', 'Study Guide', 'Aviation Theory', 'Pilot Exam'],
    categorySlug: 'dgca-exam-preparation',
    
    seoEnhancement: {
      seoTitle: 'DGCA Exam Preparation 2024: Complete Study Guide & Tips for Success',
      seoDescription: 'Comprehensive DGCA exam preparation guide with study strategies, important topics, and expert tips. Achieve first-attempt success with proven methods from experienced instructors.',
      focusKeyword: 'DGCA exam preparation',
      additionalKeywords: ['DGCA study guide', 'pilot exam preparation', 'aviation theory', 'DGCA exam tips'],
    },

    body: [
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Introduction: Mastering DGCA Exams for Aviation Success' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'The DGCA examination is a crucial milestone in every pilot\'s journey. With a comprehensive understanding of aviation theory and practical application, these exams test your readiness for professional flying. This guide, developed from training hundreds of successful pilots, provides you with proven strategies to excel in all DGCA papers.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Understanding DGCA Exam Structure' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'The DGCA CPL examination consists of 6 papers:\n\n1. Air Regulations (AR)\n2. Aviation Meteorology (Met)\n3. Air Navigation (AN)\n4. Aircraft Technical - General (ATG)\n5. Aircraft Technical - Specific (ATS)\n6. Radio Telephony (RT)\n\nEach paper requires 70% to pass, and all papers must be completed within 24 months.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Subject-wise Preparation Strategy' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Air Regulations: Focus on DGCA CAR (Civil Aviation Requirements) and ICAO Annexes. Practice scenario-based questions.\n\nAviation Meteorology: Understand weather patterns, cloud formations, and their impact on flight operations. Use visual aids and weather maps.\n\nAir Navigation: Master dead reckoning, radio navigation, and GPS systems. Practice chart reading and flight planning.\n\nAircraft Technical General: Study aircraft systems, engines, and instruments. Focus on principles rather than memorization.\n\nAircraft Technical Specific: Concentrate on specific aircraft systems you\'ll be flying. Understand system interactions.\n\nRadio Telephony: Practice standard phraseology and emergency procedures. Listen to ATC recordings regularly.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Proven Study Techniques for DGCA Success' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: '1. Create a structured study schedule with dedicated time for each subject\n2. Use active learning techniques like mind mapping and flashcards\n3. Practice previous year question papers extensively\n4. Join study groups for discussion and doubt clearing\n5. Take regular mock tests to assess your progress\n6. Focus on understanding concepts rather than rote learning\n7. Use visual aids and diagrams for complex topics\n8. Regular revision is key to retention',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Common Mistakes to Avoid' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: '• Starting preparation too late\n• Neglecting any subject thinking it\'s easy\n• Not practicing enough numerical problems\n• Ignoring current amendments and updates\n• Poor time management during exams\n• Not taking mock tests seriously\n• Studying without understanding the practical application',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'How Aviators Training Centre Ensures Your Success' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Our DGCA exam preparation program has achieved a 95% first-attempt pass rate through:\n\n• Comprehensive study materials updated with latest amendments\n• Experienced instructors with deep subject knowledge\n• Regular mock tests and performance analysis\n• Personalized doubt clearing sessions\n• Practical application of theoretical concepts\n• Continuous assessment and feedback\n• Small batch sizes for individual attention\n\nJoin our proven program and guarantee your DGCA exam success.',
          },
        ],
      },
    ],
  },

  {
    _type: 'post',
    title: 'Flight Training Cost in India 2024: Complete Breakdown & Financing Options',
    slug: { current: 'flight-training-cost-india-2024-complete-breakdown-financing-options' },
    publishedAt: new Date('2024-01-01').toISOString(),
    excerpt: 'Discover the complete cost breakdown of flight training in India for 2024. Learn about financing options, scholarships, and how to make your pilot training affordable.',
    featured: false,
    readingTime: 14,
    difficulty: 'beginner',
    contentType: 'guide',
    tags: ['Flight Training Cost', 'Pilot Training Fees', 'Aviation Finance', 'Education Loan', 'Scholarship'],
    categorySlug: 'career-guidance',
    
    seoEnhancement: {
      seoTitle: 'Flight Training Cost India 2024: Complete Fee Structure & Financing Guide',
      seoDescription: 'Detailed breakdown of flight training costs in India for 2024. Explore financing options, scholarships, and payment plans to make your pilot training affordable.',
      focusKeyword: 'flight training cost India',
      additionalKeywords: ['pilot training fees', 'aviation course cost', 'flight school fees', 'pilot training loan'],
    },

    body: [
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Introduction: Understanding Flight Training Investment' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Flight training is a significant investment in your future, but understanding the costs involved helps you plan better. This comprehensive guide breaks down all expenses associated with becoming a pilot in India and explores various financing options to make your aviation dreams achievable.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Complete Cost Breakdown for Pilot Training' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Private Pilot License (PPL):\n• Ground School: ₹1-2 lakhs\n• Flight Training: ₹6-10 lakhs\n• Examination & Documentation: ₹25,000-50,000\n• Total PPL Cost: ₹8-12 lakhs\n\nCommercial Pilot License (CPL):\n• Ground School: ₹2-3 lakhs\n• Flight Training: ₹25-35 lakhs\n• Examination Fees: ₹50,000-1 lakh\n• Medical & Documentation: ₹25,000-50,000\n• Total CPL Cost: ₹30-40 lakhs',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Additional Costs to Consider' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Accommodation & Living Expenses: ₹3-5 lakhs\nBooks & Study Materials: ₹25,000-50,000\nUniform & Equipment: ₹15,000-25,000\nInsurance: ₹10,000-20,000 annually\nType Rating (after CPL): ₹15-25 lakhs\nInstrument Rating: ₹3-5 lakhs\n\nTotal Investment for Airline-Ready Pilot: ₹50-70 lakhs',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Financing Options for Flight Training' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Education Loans:\n• Most banks offer education loans up to ₹40 lakhs\n• Interest rates: 8-12% per annum\n• Repayment period: 10-15 years\n• Collateral may be required for higher amounts\n\nScholarships & Grants:\n• Merit-based scholarships from institutes\n• Government schemes for aviation training\n• Corporate sponsorships\n• Women in aviation scholarships',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Payment Plans & Flexible Options' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Many flight schools offer flexible payment options:\n\n• Pay-as-you-fly programs\n• Installment-based payments\n• Deferred payment plans\n• Corporate tie-ups for sponsored training\n• Income share agreements\n\nAt Aviators Training Centre, we offer customized payment plans to suit your financial situation.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Return on Investment: Pilot Salary Expectations' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Entry-level Pilot: ₹8-15 lakhs annually\nFirst Officer (Airlines): ₹15-25 lakhs annually\nCaptain (Domestic): ₹25-50 lakhs annually\nCaptain (International): ₹50-80 lakhs annually\nSenior Captain: ₹80 lakhs - 1.5 crores annually\n\nWith proper career progression, pilots typically recover their training investment within 5-7 years.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Tips to Reduce Training Costs' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: '• Choose institutes with transparent fee structure\n• Opt for integrated training programs\n• Maintain good academic performance for scholarships\n• Consider training during off-peak seasons\n• Share accommodation with fellow students\n• Buy used books and equipment when possible\n• Complete training efficiently to avoid extended costs',
          },
        ],
      },
    ],
  },

  {
    _type: 'post',
    title: 'Aviation Safety: Essential Practices Every Student Pilot Must Know',
    slug: { current: 'aviation-safety-essential-practices-student-pilot-must-know' },
    publishedAt: new Date('2023-12-28').toISOString(),
    excerpt: 'Learn critical aviation safety practices that every student pilot must master. From pre-flight inspections to emergency procedures, build a strong foundation for safe flying.',
    featured: false,
    readingTime: 16,
    difficulty: 'beginner',
    contentType: 'guide',
    tags: ['Aviation Safety', 'Flight Safety', 'Student Pilot', 'Safety Procedures', 'Emergency Procedures'],
    categorySlug: 'aviation-safety',
    
    seoEnhancement: {
      seoTitle: 'Aviation Safety Guide: Essential Practices for Student Pilots 2024',
      seoDescription: 'Comprehensive aviation safety guide for student pilots. Learn essential safety practices, emergency procedures, and risk management techniques from experienced instructors.',
      focusKeyword: 'aviation safety',
      additionalKeywords: ['flight safety', 'student pilot safety', 'aviation emergency procedures', 'flight safety practices'],
    },

    body: [
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Introduction: Safety First in Aviation' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Aviation safety is the cornerstone of all flight operations. As a student pilot, developing strong safety habits from the beginning of your training will serve you throughout your flying career. This comprehensive guide covers essential safety practices that every pilot must master to ensure safe and successful flights.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Pre-Flight Safety Procedures' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Thorough Aircraft Inspection:\n• Check control surfaces for damage or obstruction\n• Verify fuel quantity and quality\n• Inspect landing gear and tires\n• Test all lights and electrical systems\n• Check engine oil levels and condition\n• Verify proper documentation is on board\n\nWeather Assessment:\n• Review current weather conditions\n• Check forecasts for departure, route, and destination\n• Understand weather minimums for your license level\n• Plan alternate routes if needed',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'In-Flight Safety Practices' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Situational Awareness:\n• Maintain constant awareness of your position\n• Monitor weather conditions continuously\n• Keep track of fuel consumption\n• Stay alert for other aircraft\n• Communicate clearly with ATC\n\nRisk Management:\n• Identify potential hazards early\n• Assess risks before making decisions\n• Have contingency plans ready\n• Know your personal minimums\n• Don\'t hesitate to divert or return if conditions deteriorate',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Emergency Procedures Every Pilot Must Know' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Engine Failure:\n• Maintain aircraft control\n• Establish best glide speed\n• Select suitable landing area\n• Attempt engine restart if time permits\n• Prepare for emergency landing\n\nElectrical Failure:\n• Turn off non-essential electrical equipment\n• Use backup instruments\n• Communicate emergency to ATC\n• Plan for no-radio approach if necessary\n\nFire Emergency:\n• Follow immediate action items\n• Land as soon as possible\n• Evacuate aircraft quickly after landing',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Human Factors in Aviation Safety' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Understanding human factors is crucial for safety:\n\nFatigue Management:\n• Get adequate rest before flying\n• Recognize signs of fatigue\n• Don\'t fly when tired\n\nStress Management:\n• Identify stress factors\n• Use stress reduction techniques\n• Seek help when overwhelmed\n\nDecision Making:\n• Use structured decision-making processes\n• Consider all available options\n• Don\'t rush important decisions\n• Learn from mistakes and near-misses',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: 'Building a Safety Culture' }],
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'At Aviators Training Centre, we emphasize safety in every aspect of training:\n\n• Comprehensive safety briefings before each flight\n• Regular safety seminars and workshops\n• Incident reporting and analysis\n• Continuous safety training for instructors\n• Modern, well-maintained training aircraft\n• Emphasis on decision-making skills\n• Real-world scenario training\n\nOur safety-first approach has resulted in zero accidents in over 15 years of operation, making us the safest choice for your flight training.',
          },
        ],
      },
    ],
  },
];

export async function createAviationBlogPosts() {
  try {
    console.log('🚀 Starting creation of aviation blog posts...');
    
    // Create author profile
    console.log('👤 Creating author profile...');
    const author = await client.create(authorProfile);
    console.log('✅ Author created:', author.name);
    
    // Create categories
    console.log('📂 Creating categories...');
    const createdCategories = [];
    for (const category of categories) {
      const createdCategory = await client.create(category);
      createdCategories.push(createdCategory);
      console.log('✅ Category created:', createdCategory.title);
    }
    
    // Create blog posts
    console.log('📝 Creating blog posts...');
    const createdPosts = [];
    for (const postData of blogPosts) {
      // Find the category reference
      const categoryRef = createdCategories.find(cat => cat.slug.current === postData.categorySlug);
      
      const post = {
        ...postData,
        author: { _type: 'reference', _ref: author._id },
        category: { _type: 'reference', _ref: categoryRef._id },
      };
      
      delete post.categorySlug; // Remove the temporary field
      
      const createdPost = await client.create(post);
      createdPosts.push(createdPost);
      console.log('✅ Blog post created:', createdPost.title);
    }
    
    console.log('✅ All aviation blog content created successfully!');
    return { author, categories: createdCategories, posts: createdPosts };
    
  } catch (error) {
    console.error('❌ Error creating aviation blog posts:', error);
    throw error;
  }
}

// Run the script if called directly
if (require.main === module) {
  createAviationBlogPosts()
    .then(() => {
      console.log('🎉 Aviation blog posts creation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to create aviation blog posts:', error);
      process.exit(1);
    });
}
