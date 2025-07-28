'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

interface BlogFAQSectionProps {
  faqs: FAQItem[];
  title?: string;
  className?: string;
  blogTitle?: string;
  category?: string;
}

export function BlogFAQSection({ 
  faqs, 
  title = "Frequently Asked Questions", 
  className,
  blogTitle,
  category 
}: BlogFAQSectionProps) {
  const [openItems, setOpenItems] = React.useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  // Generate FAQ schema markup for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      {/* FAQ Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <motion.section
        className={cn(
          'my-12 p-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-900/20 rounded-2xl border border-slate-200 dark:border-slate-700',
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Section Header */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <HelpCircle className="w-8 h-8 text-white" />
          </motion.div>
          
          <motion.h2
            className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {title}
          </motion.h2>
          
          {blogTitle && (
            <motion.p
              className="text-gray-600 dark:text-gray-300 text-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Common questions about {blogTitle.toLowerCase()}
            </motion.p>
          )}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              {/* Question Button */}
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                aria-expanded={openItems.has(index)}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="font-semibold text-gray-900 dark:text-white pr-4">
                  {faq.question}
                </span>
                
                <motion.div
                  animate={{ rotate: openItems.has(index) ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </motion.div>
              </button>

              {/* Answer Content */}
              <motion.div
                id={`faq-answer-${index}`}
                initial={false}
                animate={{
                  height: openItems.has(index) ? 'auto' : 0,
                  opacity: openItems.has(index) ? 1 : 0
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-4 pt-2 border-t border-slate-100 dark:border-slate-600">
                  <div 
                    className="text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Additional Help Section */}
        <motion.div
          className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 rounded-xl border border-blue-200 dark:border-blue-700"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Still have questions?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Our aviation experts are here to help you with personalized guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.a
                href="/contact?type=consultation"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Expert Consultation
              </motion.a>
              <motion.a
                href="tel:+919876543210"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-blue-500 text-blue-600 dark:text-blue-400 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Call Now
              </motion.a>
            </div>
          </div>
        </motion.div>
      </motion.section>
    </>
  );
}

// Predefined FAQ sets for different blog categories
export const DGCA_CPL_FAQS: FAQItem[] = [
  {
    question: "What is the minimum age requirement for DGCA CPL?",
    answer: "The minimum age requirement for DGCA Commercial Pilot License is 18 years. However, you can start your training at 17 years of age and appear for the skill test once you turn 18."
  },
  {
    question: "How much does DGCA CPL training cost in India?",
    answer: "DGCA CPL training typically costs between ₹30-45 lakhs, including flight training (₹25-35 lakhs), ground school (₹2-4 lakhs), examination fees, medical costs, and living expenses. The exact cost varies based on the training organization and location."
  },
  {
    question: "What are the educational qualifications required for CPL?",
    answer: "You need to have completed 10+2 (12th standard) with Physics and Mathematics as mandatory subjects. English proficiency at ICAO Level 4 or higher is also required."
  },
  {
    question: "How long does it take to complete DGCA CPL training?",
    answer: "DGCA CPL training typically takes 18-24 months to complete, including ground school (3-6 months), flight training (12-18 months), and skill test preparation (1-2 months). The duration may vary based on weather conditions and individual progress."
  },
  {
    question: "What is the medical requirement for CPL?",
    answer: "You must obtain a Class 1 Medical Certificate from a DGCA-authorized medical examiner. This includes comprehensive physical, vision, hearing, cardiovascular, and psychological assessments."
  },
  {
    question: "How many flight hours are required for DGCA CPL?",
    answer: "You need a minimum of 200 flight hours, including 100 hours as Pilot-in-Command (PIC), 20 hours cross-country PIC, 10 hours night flying (5 as PIC), and 10 hours instrument time."
  },
  {
    question: "What subjects are covered in DGCA CPL ground school?",
    answer: "The ground school covers 9 subjects: Air Regulations, Aircraft General Knowledge, Flight Performance and Planning, Human Performance and Limitations, Meteorology, Navigation, Operational Procedures, Principles of Flight, and Radio Telephony."
  },
  {
    question: "What career opportunities are available after CPL?",
    answer: "After obtaining CPL, you can work as a flight instructor (₹30,000-60,000/month), charter pilot (₹50,000-1.5 lakhs/month), cargo pilot (₹60,000-2 lakhs/month), or progress to airline positions as First Officer and eventually Captain."
  }
];

export const DGCA_MEDICAL_FAQS: FAQItem[] = [
  {
    question: "What is a Class 1 Medical Certificate?",
    answer: "A Class 1 Medical Certificate is the highest level of aviation medical certification required for commercial pilots. It ensures you meet the stringent health standards necessary for safe commercial flight operations."
  },
  {
    question: "How often do I need to renew my medical certificate?",
    answer: "Class 1 Medical Certificate validity depends on age: Under 40 years - 12 months, 40-60 years - 6 months, Over 60 years - 6 months. You must renew before expiry to maintain your flying privileges."
  },
  {
    question: "What vision requirements must I meet?",
    answer: "You need 6/6 vision (with or without correction), pass color vision tests (Ishihara plates), have normal depth perception, and meet specific requirements for near and intermediate vision."
  },
  {
    question: "Can I get CPL if I wear glasses or contact lenses?",
    answer: "Yes, you can obtain CPL with corrected vision using glasses or contact lenses, provided your corrected vision meets the 6/6 standard and you carry spare glasses during flight operations."
  },
  {
    question: "What happens if I fail the medical examination?",
    answer: "If you fail the medical examination, you can appeal the decision, seek treatment for correctable conditions, or consult with an aviation medical examiner about alternative pathways. Many conditions can be addressed with proper medical intervention."
  },
  {
    question: "Are there any medications that disqualify me?",
    answer: "Certain medications can be disqualifying, including some antidepressants, antihistamines, and sleep aids. Always consult with an aviation medical examiner before taking any medication and disclose all medications during your examination."
  },
  {
    question: "How should I prepare for the medical examination?",
    answer: "Get adequate sleep, avoid alcohol 48 hours before, stay hydrated, bring all required documents, disclose complete medical history honestly, and consider a pre-screening health check-up 3-6 months prior."
  },
  {
    question: "What cardiovascular requirements must I meet?",
    answer: "You must have normal blood pressure (typically below 140/90), normal heart rhythm, no history of significant heart disease, and pass an ECG examination. Regular cardiovascular exercise and healthy lifestyle help maintain these standards."
  }
];

export const AVIATION_CAREER_FAQS: FAQItem[] = [
  {
    question: "What is the current job market for pilots in India?",
    answer: "The Indian aviation industry is experiencing significant growth with increasing demand for pilots. Major airlines like IndiGo, Air India, SpiceJet, and Vistara are actively hiring. The industry is expected to need thousands of new pilots over the next decade."
  },
  {
    question: "What is the typical career progression for a commercial pilot?",
    answer: "The typical progression is: Student Pilot → CPL → Flight Instructor/Charter Pilot → First Officer (Airlines) → Captain → Senior Captain/Training Captain. Each stage requires additional experience, training, and certifications."
  },
  {
    question: "How much can I earn as a commercial pilot in India?",
    answer: "Pilot salaries vary by position: Flight Instructor (₹30,000-60,000/month), Charter Pilot (₹50,000-1.5 lakhs/month), First Officer (₹1.5-3 lakhs/month), Domestic Captain (₹3-8 lakhs/month), International Captain (₹8-25 lakhs/month)."
  },
  {
    question: "What are the different types of pilot licenses?",
    answer: "Main licenses include: Student Pilot License (SPL), Private Pilot License (PPL), Commercial Pilot License (CPL), Airline Transport Pilot License (ATPL), and various ratings like Instrument Rating (IR) and Type Ratings for specific aircraft."
  },
  {
    question: "Is pilot training worth the investment?",
    answer: "Yes, pilot training is generally a good investment considering the high earning potential, job security in a growing industry, international opportunities, and the rewarding nature of the profession. However, it requires significant upfront investment and dedication."
  },
  {
    question: "What are the physical and mental requirements for pilots?",
    answer: "Pilots must maintain excellent physical and mental health, including good vision, hearing, cardiovascular health, and psychological stability. Regular medical examinations ensure ongoing fitness for flight operations."
  },
  {
    question: "Can I become a pilot if I'm from a non-aviation background?",
    answer: "Absolutely! Many successful pilots come from diverse backgrounds. What matters most is dedication, aptitude for learning, good health, and the ability to handle responsibility. Prior aviation experience is helpful but not mandatory."
  },
  {
    question: "What are the opportunities for female pilots in India?",
    answer: "India has one of the highest percentages of female pilots globally (around 12-15%). Airlines actively encourage diversity, and there are excellent opportunities for women in all areas of aviation, from commercial airlines to flight instruction."
  }
];

// Helper function to get FAQs based on blog category or content
export function getFAQsForBlogPost(category: string, blogTitle: string): FAQItem[] {
  const categoryLower = category.toLowerCase();
  const titleLower = blogTitle.toLowerCase();

  if (categoryLower.includes('dgca') && (titleLower.includes('cpl') || titleLower.includes('commercial'))) {
    return DGCA_CPL_FAQS;
  }
  
  if (titleLower.includes('medical') || titleLower.includes('examination')) {
    return DGCA_MEDICAL_FAQS;
  }
  
  if (titleLower.includes('career') || titleLower.includes('salary') || titleLower.includes('opportunity')) {
    return AVIATION_CAREER_FAQS;
  }

  // Default general aviation FAQs
  return [
    {
      question: "How do I start my aviation career?",
      answer: "Start by researching different pilot licenses, choosing a reputable training organization, ensuring you meet medical and educational requirements, and planning your finances. Consider booking a consultation with aviation career experts for personalized guidance."
    },
    {
      question: "What is the best training organization for pilot training?",
      answer: "Look for DGCA-approved organizations with experienced instructors, modern aircraft fleet, good infrastructure, strong placement record, and positive student reviews. Aviators Training Centre offers comprehensive programs with high success rates."
    },
    {
      question: "How can I finance my pilot training?",
      answer: "Options include education loans from banks, family support, scholarships, phased training payments, and some organizations offer financing assistance. Research all available options and plan your budget carefully."
    },
    {
      question: "What support is available during training?",
      answer: "Good training organizations provide academic support, mentorship, career guidance, placement assistance, and ongoing support throughout your training journey. Choose an organization that offers comprehensive student support services."
    }
  ];
}