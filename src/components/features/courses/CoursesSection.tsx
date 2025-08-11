import React from 'react';
// Removed import { Button } from '@/components/ui/button';
// Consistent icons - Keeping ChevronRight and LinkIcon
import { GraduationCap, RadioTower, PlaneTakeoff, ChevronRight, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom'; // Keep Link import (might be used elsewhere, though not directly for replaced buttons)
import { cn } from '@/components/ui/utils';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { easingFunctions } from '@/lib/animations/easing';
import { SolidButton } from '@/components/shared/SolidButton'; // Import SolidButton
import { TransparentButton } from '@/components/shared/TransparentButton'; // Import TransparentButton

// --- Configuration (Removed button style variables) ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';

// --- Animation Variants (Unchanged) ---
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easingFunctions.easeOut, staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: easingFunctions.easeOut } }
};

const cardHoverEffect = {
  rest: { y: 0, boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.08)" },
  hover: { y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.12)", transition: { duration: 0.3, ease: easingFunctions.circOut } }
};

// --- Course Data (Unchanged) ---
const courses = [
  {
    icon: GraduationCap,
    title: 'CPL & ATPL Ground School',
    description: 'Comprehensive online classes covering all DGCA subjects - Navigation, Meteorology, Regulations, and Technical.',
    image: '/Course-Img.webp', // Ensure images are relevant
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
    image: '/Courses/TypeRatingPrep.webp',
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
      className="px-4 md:px-16"
    >
      <div className="mb-12 px-4 md:px-16 text-center md:mb-16">
        <motion.h2
          variants={itemVariants}
          className={cn("mb-4 text-3xl font-bold md:text-4xl", aviationPrimary)}
        >
          Our Core Training Programs
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="mx-auto max-w-3xl text-lg leading-relaxed text-foreground/80"
        >
          Expert-led online ground school and specialized preparation courses designed for your success in DGCA exams and beyond.
        </motion.p>
      </div>

      {/* Grid using standard Card component */}
      <div className="grid grid-cols-1 gap-8 items-stretch md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="flex"
          >
            <motion.div
              className="relative w-full h-full group rounded-3xl"
              whileHover="hover"
              initial="rest"
              animate="rest"
              variants={cardHoverEffect}
            >
              <Card className="flex overflow-hidden relative z-10 flex-col w-full h-full rounded-3xl border shadow-sm transition-shadow duration-300 bg-card border-border">
                <CardHeader className="relative p-0">
                    {/* Image Section - Fixed Height */}
                    <div className="overflow-hidden h-48"> {/* Fixed height */}
                      <img
                          src={course.image}
                          alt={course.title}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                          onError={handleImageError}
                          loading="lazy"
                      />
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow p-4">
                  {/* Title and Icon */}
                  <div className="flex items-center mb-3 space-x-3">
                      <div className={cn("flex-shrink-0 p-1.5 rounded-md bg-teal-100/70 dark:bg-teal-900/40", aviationSecondary)}>
                          <course.icon className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-foreground">{course.title}</CardTitle>
                  </div>
                  {/* Description */} 
                  <CardDescription className="flex-grow mb-4 text-sm text-foreground/80">
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
