import React from 'react';
import { Button } from '@/components/ui/button';
// Consistent icons
import { GraduationCap, RadioTower, PlaneTakeoff, ChevronRight, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// --- Configuration (Matching other pages) ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';
const aviationButtonBg = 'bg-teal-600 hover:bg-teal-700';
const aviationButtonDarkBg = 'dark:bg-teal-500 dark:hover:bg-teal-600';

// --- Animation Variants (Define or import) ---
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

// --- Course Data (Updated to match actual offerings) ---
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

const FALLBACK_IMAGE = "/HomePage/Hero5.webp"; // Fallback for course images

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
      // Use standard section structure, padding/spacing from parent
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
            className="flex" // Ensure motion.div fills height for cardHoverEffect
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
                  <CardDescription className="text-sm text-foreground/80 flex-grow mb-4"> {/* Use CardDescription, add flex-grow */} 
                    {course.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="p-5 pt-0 mt-auto"> {/* Footer takes remaining space */}
                  <Button
                    variant="outline"
                    className={cn("w-full min-h-[44px] border-teal-500 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-300 dark:hover:bg-teal-900/30 transition duration-300", "group-hover:border-teal-600 dark:group-hover:border-teal-300")}
                    asChild
                  >
                    <Link to={course.path} className="flex items-center justify-center gap-2">
                      Learn More
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Optional: Button to view all courses page */}
      <motion.div
        variants={itemVariants}
        className="mt-12 text-center"
       >
        <Button
          size="lg"
          className={cn(
              "min-h-[48px] transition duration-300 ease-in-out transform hover:scale-[1.03]",
              aviationButtonBg,
              aviationButtonDarkBg,
              "text-white inline-flex items-center gap-2"
          )}
          asChild
        >
          <Link to="/courses">
              View All Course Details <LinkIcon className="h-4 w-4"/>
          </Link>
        </Button>
      </motion.div>

    </motion.section>
  );
};

export default CoursesSection;
