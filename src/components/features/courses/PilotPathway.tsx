import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import { cn } from "@/components/ui/utils";
import { BookUser, FileCheck2, GraduationCap, RadioTower, PlaneTakeoff, Briefcase, ChevronDown, CalendarClock, Info } from 'lucide-react'; // Added CalendarClock, Info
import { motion, useAnimation } from 'framer-motion'; // Added useAnimation
import { useInView } from 'react-intersection-observer'; // Added useInView
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom'; // Added Link
// import { CountdownTimer } from '@/components/shared/CountdownTimer'; // Assuming CountdownTimer component exists
import { UrgencyCTA } from '@/components/shared/UrgencyCTA';
import { easingFunctions } from '@/lib/animations/easing';

// --- Configuration ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';
// const urgencyButtonBorderGradient = 'bg-gradient-to-r from-[#0C6E72] to-[#56A7B0]';
// const urgencyButtonHoverBg = 'hover:from-[#56A7B0] hover:to-[#0C6E72]';

// --- Animation Variants ---
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easingFunctions.easeOut, staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: 0, y: 20 },
  visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.5, ease: easingFunctions.easeOut } }
};

const timelineItemVariant = (index: number) => ({
  hidden: {
    opacity: 0,
    x: index % 2 === 0 ? -50 : 50, // Slide in from left for even, right for odd
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: easingFunctions.easeOut,
    },
  },
});

// --- Pathway Steps Data ---
const pathwaySteps = [
  {
    icon: BookUser,
    title: "Eligibility & Enrollment",
    description: "Meet basic requirements and enroll in our comprehensive ground school program.",
    details: [
      "**Age:** Minimum 16 years for SPL (Student Pilot License), 18 years (for CPL).",
      "**Education:** Passed Class 10+2 with Physics & Mathematics from a recognized board.",
      "**Medical:** Valid DGCA Class 2 Medical Certificate (minimum). Class 1 needed for CPL/ATPL issuance.",
      "**English Proficiency:** Ability to read, speak, write, and understand English.",
    ]
  },
  {
    icon: GraduationCap,
    title: "Ground School Mastery",
    description: "Complete our structured online classes covering all DGCA subjects.",
    details: [
      "**Subjects:** Air Navigation, Meteorology, Air Regulation, Technical General, Technical Specific, RTR(A).",
      "**Format:** Online live classes, recorded sessions, comprehensive study materials.",
      "**Assessments:** Regular topic tests and mock exams simulating DGCA pattern.",
      "**Support:** 24/7 doubt-clearing via dedicated channels."
    ]
  },
  {
    icon: FileCheck2,
    title: "DGCA Exams",
    description: "Successfully pass all CPL/ATPL theoretical knowledge examinations.",
    details: [
      "**Exam Structure:** Multiple Choice Questions (MCQs) covering the syllabus.",
      "**Passing Score:** Minimum 70% required for each subject.",
      "**Validity:** Subject passes have a validity period (check DGCA regulations).",
      "**Preparation:** Our course includes extensive question banks and mock tests."
    ]
  },
  {
    icon: RadioTower,
    title: "RTR(A) License",
    description: "Obtain your Radio Telephony Restricted (Aeronautical) license.",
    details: [
      "**Purpose:** Required for using aeronautical mobile radio communication equipment.",
      "**Exam Parts:** Part 1 (Practical: Transmission technique), Part 2 (Oral Exam: Regulations & Procedures).",
      "**Training:** We provide dedicated RTR(A) preparation covering theory and practicals."
    ]
  },
  {
    icon: PlaneTakeoff,
    title: "Type Rating Prep (Optional)",
    description: "Prepare for A320/B737 Type Rating (if pursuing an airline career).",
    details: [
      "**Focus:** Technical specifics of the chosen aircraft type (e.g., Airbus A320, Boeing 737).",
      "**Content:** Covers systems, performance, procedures, and airline exam patterns.",
      "**Benefit:** Increases employability with specific airlines.",
      "**Note:** This is separate from the actual Type Rating course done at an approved TRTO."
    ]
  },
  {
    icon: Briefcase,
    title: "Airline Interview Ready",
    description: "Build confidence and skills for airline interviews.",
    details: [
      "**Components:** Mock interviews (HR & Technical), group discussions, psychometric test guidance.",
      "**Skills:** Communication, problem-solving, situational awareness, aviation knowledge review.",
      "**Goal:** Prepare candidates to confidently face airline recruitment processes."
    ]
  }
];

// Helper component for individual animated timeline items
const AnimatedTimelineItem: React.FC<{ step: typeof pathwaySteps[0]; index: number }> = ({ step, index }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2, // Trigger when 20% of the item is visible
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else {
      controls.start('hidden'); // Optional: reset if it scrolls out of view
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      variants={timelineItemVariant(index)}
      initial="hidden"
      animate={controls}
      className="relative flex items-start group"
    >
      {/* Dot on the Line */}
      <div className={cn(
        "absolute top-5 left-6 z-10 w-5 h-5 bg-teal-500 rounded-full border-4 transform -translate-x-1/2 -translate-y-1/2 md:left-1/2 border-background dark:bg-teal-400", // Ensure dot is above line
        "transition-all duration-300 group-hover:scale-110 group-hover:bg-teal-600 dark:group-hover:bg-teal-300"
      )} />

      {/* Content Card Container - Stacked on mobile, alternating on md+ */}
      <div className={cn(
        "ml-14 w-full", // Mobile: full width, margin left for line
        "md:ml-0 md:w-1/2", // Medium+: half width, no margin
        index % 2 === 0
          ? "md:pr-8 md:mr-auto" // Even items on left for md+
          : "md:pl-8 md:ml-auto" // Odd items on right for md+
      )}>
        <Collapsible suppressHydrationWarning>
          <Card className="overflow-hidden transition-shadow border rounded-lg shadow-sm bg-card border-border/80 hover:shadow-md">
            <div className="flex items-start justify-between gap-2 p-4"> {/* Adjusted for better trigger placement */}
              <div className="flex items-center flex-grow gap-3">
                <div className={cn("flex-shrink-0 p-2 rounded-md bg-teal-100/70 dark:bg-teal-900/40", aviationSecondary)}>
                  <step.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-sm text-foreground/70"> {/* Description moved below title */}
                    {step.description}
                  </p>
                </div>
              </div>
              {/* Collapsible Trigger Button */}
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="flex-shrink-0 h-auto p-1 text-teal-600 dark:text-teal-400 hover:bg-teal-100/50 dark:hover:bg-teal-900/30">
                  <span className="sr-only">Toggle details</span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
            </div>

            {/* Collapsible Content Area */}
            <CollapsibleContent>
              <div className="px-4 py-3 border-t bg-muted/30 dark:bg-muted/10 border-border/50">
                <ul className="space-y-1.5 pl-4"> {/* Slightly reduced indent */}
                  {step.details.map((detail, i) => (
                    <li key={i} className="flex items-start text-xs text-foreground/80">
                      <span className="mr-2 mt-0.5">•</span>
                      <span dangerouslySetInnerHTML={{ __html: detail.replace(/\*\*(.*?)\*\*/g, '<strong class="font-medium text-foreground/90">$1</strong>') }} />
                    </li>
                  ))}
                </ul>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </motion.div>
  );
};

const PilotPathway: React.FC = () => {


  return (
    <motion.section
      id="pilot-pathway"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }} // Lower amount for earlier trigger
      className="py-16 md:py-24"
    >
      <div className="mb-12 text-center md:mb-16">
        <motion.h2
          variants={itemVariants}
          className={cn("mb-4 text-3xl font-bold md:text-4xl", aviationPrimary)}
        >
          Your Pathway to the Cockpit
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="max-w-3xl mx-auto text-lg leading-relaxed text-foreground/80"
        >
          Follow our structured roadmap from enrollment to becoming an airline-ready pilot, covering DGCA exams and essential skills.
        </motion.p>
      </div>

      {/* Timeline Container */}
      <div className="relative max-w-3xl mx-auto">
        {/* Vertical Line */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-border transform -translate-x-1/2" aria-hidden="true" />

        {/* Timeline Items */}
        <div className="space-y-10 md:space-y-12">
          {pathwaySteps.map((step, index) => (
            <AnimatedTimelineItem key={index} step={step} index={index} />
          ))}
        </div>
      </div>

      {/* Urgency CTA Section */}
      <motion.div variants={itemVariants} className="max-w-4xl mx-auto mt-16 md:mt-20">
        <UrgencyCTA
          title="Limited Time Offer: Enroll Now!"
          description="Special discount available for the next batch starting soon. Secure your spot today!"
          buttonIcon={CalendarClock}
          buttonClassName="min-h-[48px]" // Ensure button height
        />
      </motion.div>

    </motion.section>
  );
};

export default PilotPathway;
