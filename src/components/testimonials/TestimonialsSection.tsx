"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/components/ui/utils';
import { Star, Quote, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TextTestimonial, Student } from '@/lib/testimonials/types';
import { easingFunctions } from '@/lib/animations/easing';

interface TestimonialsSectionProps {
  testimonials?: TextTestimonial[];
  students?: Student[];
  title?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
}

// Sample testimonials data
const sampleTestimonials: TextTestimonial[] = [
  {
    id: 'testimonial-1',
    text: 'The comprehensive DGCA ground school training at Aviators Training Centre helped me clear my CPL exams on the first attempt. The instructors are experienced airline pilots who provide real-world insights.',
    short: 'Cleared CPL exams on first attempt with excellent training.',
    detail: 'The instructors are experienced airline pilots who provide real-world insights.',
    confidenceScore: 0.95,
    needsReview: false,
    generatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'testimonial-2',
    text: 'Outstanding Type Rating preparation course. The simulator sessions and theoretical knowledge helped me secure a position with a major airline. Highly recommend ATC for serious aviation students.',
    short: 'Excellent Type Rating prep helped me get an airline job.',
    detail: 'The simulator sessions and theoretical knowledge were exceptional.',
    confidenceScore: 0.92,
    needsReview: false,
    generatedAt: '2024-02-20T14:30:00Z'
  },
  {
    id: 'testimonial-3',
    text: 'The RTR(A) training was thorough and well-structured. The communication skills I developed here are invaluable in my current role as a commercial pilot.',
    short: 'RTR(A) training was thorough and well-structured.',
    detail: 'Communication skills developed here are invaluable in my pilot career.',
    confidenceScore: 0.88,
    needsReview: false,
    generatedAt: '2024-03-10T09:15:00Z'
  }
];

const sampleStudents: Student[] = [
  {
    id: 'student-1',
    name: 'Captain Rajesh Kumar',
    course: 'DGCA CPL Ground School',
    gradYear: 2023,
    verified: true,
    avatarUrl: null
  },
  {
    id: 'student-2',
    name: 'First Officer Priya Singh',
    course: 'Type Rating Preparation',
    gradYear: 2023,
    verified: true,
    avatarUrl: null
  },
  {
    id: 'student-3',
    name: 'Pilot Arjun Patel',
    course: 'RTR(A) Training',
    gradYear: 2024,
    verified: true,
    avatarUrl: null
  }
];

const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';

export default function TestimonialsSection({
  testimonials = sampleTestimonials,
  students = sampleStudents,
  title = "What Our Students Say",
  subtitle = "Real experiences from successful aviation professionals",
  className,
  compact = false
}: TestimonialsSectionProps) {
  // Create student map for quick lookup
  const studentMap = new Map(students.map(s => [s.id, s]));

  // Animation variants
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5, 
        ease: easingFunctions.easeOut 
      }
    }
  };

  return (
    <motion.section
      className={cn(
        "py-12 sm:py-16 md:py-20",
        compact && "py-8 sm:py-12",
        className
      )}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
    >
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header with enhanced SEO */}
        <motion.div 
          className="text-center mb-12 md:mb-16"
          variants={itemVariants}
        >
          <h2 
            id="text-testimonials-heading"
            className={cn(
              "text-2xl md:text-3xl lg:text-4xl font-bold mb-4",
              aviationPrimary
            )}
          >
            {title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          className={cn(
            "grid gap-6 md:gap-8",
            compact 
              ? "grid-cols-1 md:grid-cols-2" 
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          )}
          variants={containerVariants}
        >
          {testimonials.slice(0, compact ? 2 : 3).map((testimonial, index) => {
            const student = studentMap.get(`student-${index + 1}`) || sampleStudents[index];
            
            return (
              <motion.div
                key={testimonial.id}
                variants={itemVariants}
              >
                <Card className="h-full bg-gradient-to-br from-card to-card/80 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    {/* Quote Icon */}
                    <div className="mb-4">
                      <Quote className={cn("w-8 h-8", aviationSecondary)} />
                    </div>

                    {/* Testimonial Text */}
                    <blockquote className="text-foreground/90 mb-6 leading-relaxed">
                      "{testimonial.text}"
                    </blockquote>

                    {/* Student Info */}
                    <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                        {student?.avatarUrl ? (
                          <img
                            src={student.avatarUrl}
                            alt={student.name || 'Student'}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                        )}
                      </div>

                      {/* Student Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">
                            {student?.name || 'Aviation Graduate'}
                          </h4>
                          {student?.verified && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              ✓
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {student?.course || 'Aviation Training'}
                        </p>
                        {student?.gradYear && (
                          <p className="text-xs text-muted-foreground">
                            Class of {student.gradYear}
                          </p>
                        )}
                      </div>

                      {/* Rating Stars */}
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View More Link (for compact version) */}
        {compact && (
          <motion.div 
            className="text-center mt-8"
            variants={itemVariants}
          >
            <a
              href="/testimonials"
              className={cn(
                "inline-flex items-center gap-2 text-sm font-medium hover:underline",
                aviationSecondary
              )}
            >
              View All Success Stories
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}