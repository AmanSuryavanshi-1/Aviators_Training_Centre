'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Phone, Download, MessageCircle, Calendar, BookOpen, Users, Star, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for CTA integration
interface CTATemplate {
  id: string;
  name: string;
  category: string;
  style: 'card' | 'banner' | 'inline' | 'floating' | 'minimal';
  title: string;
  description: string;
  primaryButton: {
    text: string;
    action: string;
    url: string;
    style: 'primary' | 'urgent' | 'success';
  };
  secondaryButton?: {
    text: string;
    action: string;
    url: string;
  };
  urgencyElements?: {
    socialProof?: string;
    urgencyMessage?: string;
    limitedOffer?: string;
    countdown?: boolean;
  };
  targetKeywords: string[];
  priority: number;
}

interface BlogPost {
  title: string;
  category: string;
  tags?: string[];
  slug: string;
}

interface IntelligentCTAIntegrationProps {
  blogPost: BlogPost;
  position: 'top' | 'middle' | 'bottom' | 'sidebar' | 'floating';
  className?: string;
  onInteraction?: (data: any) => void;
}

// Predefined high-converting CTA templates
const CTA_TEMPLATES: CTATemplate[] = [
  {
    id: 'dgca-cpl-enrollment',
    name: 'DGCA CPL Enrollment',
    category: 'course-enrollment',
    style: 'card',
    title: 'Ready to Start Your DGCA CPL Journey?',
    description: 'Join 500+ successful pilots who started their career with our comprehensive DGCA CPL training program. 95% first-attempt pass rate guaranteed.',
    primaryButton: {
      text: 'Enroll Now - Limited Seats',
      action: 'course-enrollment',
      url: '/courses/cpl-ground-school',
      style: 'urgent'
    },
    secondaryButton: {
      text: 'Download Syllabus',
      action: 'download',
      url: '/downloads/cpl-syllabus.pdf'
    },
    urgencyElements: {
      socialProof: 'Trusted by 1000+ aspiring pilots',
      urgencyMessage: 'Next batch starts in 15 days',
      limitedOffer: 'Early Bird Discount - Save ₹50,000'
    },
    targetKeywords: ['dgca', 'cpl', 'commercial pilot license', 'ground school'],
    priority: 90
  },
  {
    id: 'free-consultation',
    name: 'Free Career Consultation',
    category: 'consultation',
    style: 'banner',
    title: 'Get Expert Aviation Career Guidance',
    description: 'Book a free 30-minute consultation with our aviation career experts. Get personalized advice on your pilot training journey.',
    primaryButton: {
      text: 'Book Free Consultation',
      action: 'consultation',
      url: '/contact?type=consultation',
      style: 'primary'
    },
    secondaryButton: {
      text: 'Call Now',
      action: 'phone',
      url: 'tel:+919876543210'
    },
    urgencyElements: {
      socialProof: 'Trusted by 1000+ aspiring pilots',
      urgencyMessage: 'Limited consultation slots available'
    },
    targetKeywords: ['career', 'guidance', 'consultation', 'advice'],
    priority: 75
  },
  {
    id: 'demo-class',
    name: 'Free Demo Class',
    category: 'demo',
    style: 'card',
    title: 'Experience Our Teaching Excellence',
    description: 'Attend a free demo class and see why 95% of our students pass DGCA exams on their first attempt.',
    primaryButton: {
      text: 'Book Demo Class',
      action: 'demo',
      url: '/contact?type=demo',
      style: 'success'
    },
    urgencyElements: {
      socialProof: '95% first-attempt pass rate',
      urgencyMessage: 'Only 10 demo slots left this month'
    },
    targetKeywords: ['demo', 'class', 'trial', 'experience'],
    priority: 80
  },
  {
    id: 'medical-consultation',
    name: 'Medical Consultation',
    category: 'consultation',
    style: 'inline',
    title: 'Concerned About Medical Requirements?',
    description: 'Get expert guidance on DGCA medical requirements and preparation strategies from our aviation medical advisor.',
    primaryButton: {
      text: 'Get Medical Guidance',
      action: 'consultation',
      url: '/contact?type=medical-consultation',
      style: 'primary'
    },
    urgencyElements: {
      socialProof: 'Helped 500+ students with medical preparation'
    },
    targetKeywords: ['medical', 'examination', 'requirements', 'health'],
    priority: 85
  },
  {
    id: 'financial-planning',
    name: 'Financial Planning',
    category: 'consultation',
    style: 'card',
    title: 'Plan Your Pilot Training Investment',
    description: 'Understand the complete cost of pilot training and explore financing options with our financial planning experts.',
    primaryButton: {
      text: 'Get Financial Guidance',
      action: 'consultation',
      url: '/contact?type=financial-planning',
      style: 'primary'
    },
    urgencyElements: {
      socialProof: 'Helped 500+ students plan their training budget'
    },
    targetKeywords: ['cost', 'fees', 'financing', 'budget', 'investment'],
    priority: 70
  },
  {
    id: 'interview-preparation',
    name: 'Interview Preparation',
    category: 'course-enrollment',
    style: 'card',
    title: 'Ace Your Airline Interview',
    description: 'Get personalized interview preparation coaching from experienced airline pilots. Boost your confidence and success rate.',
    primaryButton: {
      text: 'Get Interview Coaching',
      action: 'course-enrollment',
      url: '/contact?service=interview-prep',
      style: 'success'
    },
    urgencyElements: {
      socialProof: '90% interview success rate',
      urgencyMessage: 'Airline hiring season is active'
    },
    targetKeywords: ['interview', 'airline', 'preparation', 'coaching'],
    priority: 75
  }
];

// Intelligent CTA selection based on blog content
function selectOptimalCTA(blogPost: BlogPost, position: string): CTATemplate {
  const contentText = `${blogPost.title} ${blogPost.category} ${blogPost.tags?.join(' ') || ''}`.toLowerCase();
  
  // Score each template based on keyword relevance
  const scoredTemplates = CTA_TEMPLATES.map(template => {
    let score = 0;
    
    // Keyword matching
    template.targetKeywords.forEach(keyword => {
      if (contentText.includes(keyword.toLowerCase())) {
        score += 10;
      }
    });
    
    // Category-specific bonuses
    if (contentText.includes('dgca') && template.id === 'dgca-cpl-enrollment') score += 20;
    if (contentText.includes('medical') && template.id === 'medical-consultation') score += 20;
    if (contentText.includes('cost') && template.id === 'financial-planning') score += 20;
    if (contentText.includes('interview') && template.id === 'interview-preparation') score += 20;
    if (contentText.includes('career') && template.id === 'free-consultation') score += 15;
    
    // Position-specific adjustments
    if (position === 'top' && template.category === 'consultation') score += 5;
    if (position === 'bottom' && template.category === 'course-enrollment') score += 10;
    if (position === 'middle' && template.category === 'demo') score += 5;
    
    // Priority bonus
    score += template.priority / 10;
    
    return { template, score };
  });
  
  // Return the highest scoring template
  const bestMatch = scoredTemplates.sort((a, b) => b.score - a.score)[0];
  return bestMatch.template;
}

// CTA Component Variants
function CTACardVariant({ template, onInteraction, className }: { template: CTATemplate; onInteraction?: (data: any) => void; className?: string }) {
  const handleClick = (buttonType: 'primary' | 'secondary') => {
    onInteraction?.({
      templateId: template.id,
      action: buttonType === 'primary' ? template.primaryButton.action : template.secondaryButton?.action,
      buttonType
    });
  };

  return (
    <motion.div
      className={cn(
        'bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700 shadow-lg hover:shadow-xl transition-all duration-300',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Urgency Banner */}
      {template.urgencyElements?.limitedOffer && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-2 px-4 rounded-lg text-sm font-medium mb-4">
          🔥 {template.urgencyElements.limitedOffer}
        </div>
      )}

      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {template.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
          {template.description}
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            Expert Instructors
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <Star className="w-4 h-4 mr-2 text-yellow-500" />
            High Success Rate
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <Users className="w-4 h-4 mr-2 text-blue-500" />
            Proven Track Record
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <BookOpen className="w-4 h-4 mr-2 text-purple-500" />
            Comprehensive Training
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <motion.a
href={`${template.primaryButton.url}?subject=Demo%20Request%3A%20${encodeURIComponent(template.title)}&courseName=${encodeURIComponent(template.title)}&message=${encodeURIComponent('I would like to book a demo for the ' + template.title + ' course. Please contact me to schedule a time.')}#contact-form`
            onClick={() => handleClick('primary')}
            className={cn(
              'flex-1 flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300',
              template.primaryButton.style === 'urgent' 
                ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                : template.primaryButton.style === 'success'
                ? 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600'
                : 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {template.primaryButton.action === 'phone' && <Phone className="w-4 h-4 mr-2" />}
            {template.primaryButton.action === 'download' && <Download className="w-4 h-4 mr-2" />}
            {template.primaryButton.action === 'consultation' && <Calendar className="w-4 h-4 mr-2" />}
            {!['phone', 'download', 'consultation'].includes(template.primaryButton.action) && <ArrowRight className="w-4 h-4 mr-2" />}
            {template.primaryButton.text}
          </motion.a>

          {template.secondaryButton && (
            <motion.a
              href={template.secondaryButton.url}
              onClick={() => handleClick('secondary')}
              className="flex items-center justify-center px-6 py-3 border-2 border-blue-500 text-blue-600 dark:text-blue-400 font-medium rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {template.secondaryButton.text}
            </motion.a>
          )}
        </div>

        {/* Social Proof & Urgency */}
        <div className="mt-4 space-y-2">
          {template.urgencyElements?.socialProof && (
            <div className="flex items-center justify-center text-sm text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4 mr-1" />
              {template.urgencyElements.socialProof}
            </div>
          )}
          
          {template.urgencyElements?.urgencyMessage && (
            <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
              ⚡ {template.urgencyElements.urgencyMessage}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CTABannerVariant({ template, onInteraction, className }: { template: CTATemplate; onInteraction?: (data: any) => void; className?: string }) {
  const handleClick = (buttonType: 'primary' | 'secondary') => {
    onInteraction?.({
      templateId: template.id,
      action: buttonType === 'primary' ? template.primaryButton.action : template.secondaryButton?.action,
      buttonType
    });
  };

  return (
    <motion.div
      className={cn(
        'bg-gradient-to-r from-blue-600 via-teal-600 to-purple-600 text-white rounded-xl p-6 shadow-2xl',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex-1 text-center lg:text-left">
          <h3 className="text-2xl font-bold mb-2">{template.title}</h3>
          <p className="text-lg opacity-90 mb-4">{template.description}</p>
          
          {template.urgencyElements?.socialProof && (
            <div className="flex items-center justify-center lg:justify-start text-sm opacity-80">
              <Users className="w-4 h-4 mr-2" />
              {template.urgencyElements.socialProof}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <motion.a
            href={`${template.primaryButton.url}?subject=Demo%20Request%3A%20${encodeURIComponent(template.title)}&courseName=${encodeURIComponent(template.title)}&message=${encodeURIComponent('I would like to book a demo for the ' + template.title + ' course. Please contact me to schedule a time.')}#contact-form`}
            onClick={() => handleClick('primary')}
            className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {template.primaryButton.text}
            <ArrowRight className="w-5 h-5 ml-2" />
          </motion.a>

          {template.secondaryButton && (
            <motion.a
              href={template.secondaryButton.url}
              onClick={() => handleClick('secondary')}
              className="px-6 py-4 border-2 border-white/30 text-white font-medium rounded-xl hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {template.secondaryButton.text}
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CTAInlineVariant({ template, onInteraction, className }: { template: CTATemplate; onInteraction?: (data: any) => void; className?: string }) {
  const handleClick = (buttonType: 'primary' | 'secondary') => {
    onInteraction?.({
      templateId: template.id,
      action: buttonType === 'primary' ? template.primaryButton.action : template.secondaryButton?.action,
      buttonType
    });
  };

  return (
    <motion.div
      className={cn(
        'my-8 p-6 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/10 dark:to-teal-900/10 border-l-4 border-blue-500 rounded-r-xl shadow-md',
        className
      )}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            💡 {template.title}
          </h4>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {template.description}
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <motion.a
            href={`${template.primaryButton.url}?subject=Demo%20Request%3A%20${encodeURIComponent(template.title)}&courseName=${encodeURIComponent(template.title)}&message=${encodeURIComponent('I would like to book a demo for the ' + template.title + ' course. Please contact me to schedule a time.')}#contact-form`}
            onClick={() => handleClick('primary')}
            className="flex-1 md:flex-none px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300 flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {template.primaryButton.text}
            <ArrowRight className="w-4 h-4 ml-2" />
          </motion.a>

          {template.secondaryButton && (
            <motion.a
              href={template.secondaryButton.url}
              onClick={() => handleClick('secondary')}
              className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium rounded-lg transition-colors duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {template.secondaryButton.text}
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Main CTA Integration Component
export function IntelligentCTAIntegration({ 
  blogPost, 
  position, 
  className, 
  onInteraction 
}: IntelligentCTAIntegrationProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<CTATemplate | null>(null);

  useEffect(() => {
    const template = selectOptimalCTA(blogPost, position);
    setSelectedTemplate(template);
  }, [blogPost, position]);

  if (!selectedTemplate) return null;

  const handleInteraction = (data: any) => {
    onInteraction?.({
      ...data,
      blogPost: blogPost.slug,
      position,
      timestamp: new Date().toISOString()
    });
  };

  // Render appropriate variant based on template style
  switch (selectedTemplate.style) {
    case 'banner':
      return <CTABannerVariant template={selectedTemplate} onInteraction={handleInteraction} className={className} />;
    case 'inline':
      return <CTAInlineVariant template={selectedTemplate} onInteraction={handleInteraction} className={className} />;
    case 'card':
    default:
      return <CTACardVariant template={selectedTemplate} onInteraction={handleInteraction} className={className} />;
  }
}

export default IntelligentCTAIntegration;
