import React from 'react';
// Removed import { Button } from '@/components/ui/button';
// Consistent icons - Keeping ChevronRight and LinkIcon
import { GraduationCap, RadioTower, PlaneTakeoff, ChevronRight, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom'; // Keep Link import (might be used elsewhere, though not directly for replaced buttons)
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SolidButton } from '@/components/shared/SolidButton'; // Import SolidButton
import { TransparentButton } from '@/components/shared/TransparentButton'; // Import TransparentButton

// --- Configuration (Removed button style variables) ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';

// --- Animation Variants (Unchanged) ---
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const cardHoverEffect = {
  rest: { y: 0, boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.08)" },
  hover: { y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.12)", transition: { duration: 0.3, ease: "circOut" } }
};

// --- Course Data (Unchanged) ---
const courses = [
  {
    icon: GraduationCap,
    title: 'CPL & ATPL Ground School',
    description: 'Comprehensive online classes covering all DGCA subjects - Navigation, Meteorology, Regulations, and Technical.',
    image: '/HomePage/Course1.webp', // Ensure images are relevant
    path: '/courses'
  },
  {
    icon: RadioTower,
    title: 'RTR(A) Radio Telephony',
    description: 'Master aviation communication protocols and prepare for the Radio Telephony Restricted (Aeronautical) license exam.',
    image: '/Courses/rtr.webp',
    path: '/courses'
  },
  {
    icon: PlaneTakeoff,
    title: 'Type Rating Prep',
    description: 'Affordable guidance for A320 & B737 pre/post type rating, covering questions for major airline exams.',
    image: '/HomePage/Course2.webp',
    path: '/courses'
  }
];
const FALLBACK_IMAGE = "/HomePage/Hero5.webp";

const CoursesSection: React.FC = () => {

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const target = e.target as HTMLImageElement;
        if (!target.src.endsWith(FALLBACK_IMAGE)) {
            target.onerror = null;
            target.src = FALLBACK_IMAGE;
        }
    };

  return (
    <motion.section
      id="courses"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <div className="text-center mb-12 md:mb-16">
        <motion.h2
          variants={itemVariants}
          className={cn("text-3xl md:text-4xl font-bold mb-4", aviationPrimary)}
        >
          Our Core Training Programs
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-lg text-foreground/80 max-w-3xl mx-auto leading-relaxed"
        >
          Expert-led online ground school and specialized preparation courses designed for your success in DGCA exams and beyond.
        </motion.p>
      </div>

      {/* Grid using standard Card component */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {courses.map((course, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="flex"
          >
            <motion.div
              className="relative h-full w-full group"
              whileHover="hover"
              initial="rest"
              animate="rest"
              variants={cardHoverEffect}
            >
              <Card className="bg-card w-full h-full flex flex-col overflow-hidden rounded-lg shadow-sm border border-border transition-shadow duration-300 relative z-10">
                <CardHeader className="p-0 relative">
                    {/* Image Section - Fixed Height */}
                    <div className="h-48 overflow-hidden"> {/* Fixed height */}
                      <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={handleImageError}
                          loading="lazy"
                      />
                    </div>
                </CardHeader>
                <CardContent className="p-5 flex-grow flex flex-col">
                  {/* Title and Icon */}
                  <div className="flex items-center space-x-3 mb-3">
                      <div className={cn("flex-shrink-0 p-1.5 rounded-md bg-teal-100/70 dark:bg-teal-900/40", aviationSecondary)}>
                          <course.icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-foreground">{course.title}</CardTitle>
                  </div>
                  {/* Description */} 
                  <CardDescription className="text-sm text-foreground/80 flex-grow mb-4">
                    {course.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="p-5 pt-0 mt-auto">
                  {/* Replaced Button with TransparentButton */}
                  <TransparentButton
                    href={course.path}
                    icon={ChevronRight} // Using the same icon
                    label="Learn More"
                    // Add className if specific sizing needed, e.g., "w-full min-h-[44px]"
                    className="w-full"
                  />
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Button to view all courses page - Updated */} 
      <motion.div
        variants={itemVariants}
        className="mt-12 text-center"
       >
        {/* Replaced Button with SolidButton */}
        <SolidButton
           href="/courses"
           icon={LinkIcon} // Using the same icon
           label="View All Course Details"
         />
      </motion.div>

    </motion.section>
  );
};

export default CoursesSection;
