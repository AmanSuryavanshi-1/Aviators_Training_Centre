import React from 'react';
// Updated icons to match desired style, removed unnecessary ones
import { UsersRound, CalendarClock, Award, Headset, GraduationCap, RadioTower } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { motion } from 'framer-motion';
import { easingFunctions } from '@/lib/animations/easing';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Import Card components

// --- Configuration (Matching other pages) ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';

// --- Animation Variants (Define or import from shared location) ---
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

// --- Feature Data (Updated to reflect core offerings) ---
const features = [
  {
    icon: UsersRound, // Consistent icon usage
    title: 'Airline Instructors',
    description: 'Learn directly from experienced pilots & engineers currently active in major airlines.'
  },
  {
    icon: GraduationCap,
    title: 'Structured Curriculum',
    description: 'Master the complete DGCA syllabus with our organized, exam-focused online ground school.'
  },
  {
    icon: Award,
    title: 'High Success Rate',
    description: 'Benefit from proven teaching methods and rigorous mock tests designed for exam success.'
  },
  {
    icon: Headset,
    title: '24/7 Doubt Support',
    description: 'Get your questions answered anytime with dedicated support from our expert faculty.'
  },
  {
    icon: CalendarClock, // Changed icon
    title: 'Flexible Online Classes',
    description: 'Study at your own pace with adaptable schedules fitting your personal commitments.'
  },
  {
    icon: RadioTower, // Added RTR(A)
    title: 'Specialized Training',
    description: 'Access additional courses like RTR(A) preparation and Type Rating guidance.'
  }
];

const WhyChooseUs: React.FC = () => {
  return (
    <motion.section
      id="why-choose-us" // Add ID for potential navigation
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      // Removed py-20, rely on main container spacing
      className="py-16 md:py-20 px-4 md:px-16 rounded-lg border shadow-sm bg-muted/30 dark:bg-card/5 border-border/30"
    >
      {/* Use container from parent (Index.tsx), removed local container/px */}
      <div className="mb-8 text-center md:mb-10">
        <motion.h2
          variants={itemVariants}
          className={cn("mb-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold", aviationPrimary)} // Consistent heading
        >
          Why Choose Aviators Training Centre?
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed text-foreground/80"
        >
          We deliver focused, high-quality online ground training designed to help you ace your DGCA exams and launch your pilot career.
        </motion.p>
      </div>

      {/* Grid using standard Card component */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 items-stretch md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="flex" // Ensure motion.div fills height for cardHoverEffect
          >
            <motion.div
              className="relative w-full h-full group rounded-3xl" // Needed for hover effect boundaries
              whileHover="hover"
              initial="rest"
              animate="rest"
              variants={cardHoverEffect}
            >
              {/* Standard Card Component Structure */}
              <Card className="flex overflow-hidden relative z-10 flex-col p-3 sm:p-4 md:p-6 lg:p-8 w-full h-full text-center rounded-3xl border shadow-sm transition-shadow duration-300 bg-card border-border">
                <CardHeader className="flex-shrink-0 p-0 mb-5">
                  {/* Consistent Icon Styling */}
                  <div className={cn("p-3 mx-auto mb-4 rounded-full transition-colors duration-300 bg-teal-100/70 dark:bg-teal-900/40 w-fit group-hover:bg-teal-200/80 dark:group-hover:bg-teal-800/60")}>
                    <feature.icon className={cn("w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8", aviationSecondary)} />
                  </div>
                  <CardTitle className="text-base sm:text-lg md:text-xl font-semibold text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-0">
                  <CardDescription className="text-xs sm:text-sm leading-relaxed text-foreground/80">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Removed redundant Learn More button - Hero and CTA suffice */}

    </motion.section>
  );
};

export default WhyChooseUs;
