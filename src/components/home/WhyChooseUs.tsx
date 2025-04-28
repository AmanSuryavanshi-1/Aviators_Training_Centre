// Added "use client" because motion is used
"use client";

import React from 'react';
import { UsersRound, CalendarClock, Award, Headset, GraduationCap, RadioTower } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// --- Configuration ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';

// --- Animation Variants (Keep existing) ---
const sectionVariants = { /* ... */ };
const itemVariants = { /* ... */ };
const cardHoverEffect = { /* ... */ };

// --- Feature Data ---
const features = [
  {
    icon: UsersRound,
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
    icon: CalendarClock,
    title: 'Flexible Online Classes',
    description: 'Study at your own pace with adaptable schedules fitting your personal commitments.'
  },
  {
    icon: RadioTower,
    title: 'Specialized Training',
    description: 'Access additional courses like RTR(A) preparation and Type Rating guidance.'
  }
];

const WhyChooseUs: React.FC = () => {
  return (
    <motion.section
      id="why-choose-us"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="bg-muted/30 dark:bg-card/5 py-16 md:py-20 rounded-lg border border-border/30 shadow-sm"
    >
      <div className="text-center mb-12 md:mb-16">
        <motion.h2
          variants={itemVariants}
          className={cn("text-3xl md:text-4xl font-bold mb-4", aviationPrimary)}
        >
          Why Choose Aviators Training Centre?
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-lg text-foreground/80 max-w-3xl mx-auto leading-relaxed"
        >
          We deliver focused, high-quality online ground training designed to help you ace your DGCA exams and launch your pilot career.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {features.map((feature, index) => (
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
                <Card className="bg-card w-full h-full flex flex-col text-center overflow-hidden rounded-lg shadow-sm border border-border transition-shadow duration-300 relative z-10 p-6 md:p-8">
                    <CardHeader className="p-0 mb-5 flex-shrink-0">
                        <div className={cn("mx-auto p-3 rounded-full bg-teal-100/70 dark:bg-teal-900/40 w-fit mb-4 transition-colors duration-300 group-hover:bg-teal-200/80 dark:group-hover:bg-teal-800/60")}>
                           <feature.icon className={cn("h-8 w-8", aviationSecondary)} />
                        </div>
                        <CardTitle className="text-foreground text-xl font-semibold">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-grow">
                        <CardDescription className="text-foreground/80 text-sm leading-relaxed">
                            {feature.description}
                        </CardDescription>
                    </CardContent>
                </Card>
             </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default WhyChooseUs;
