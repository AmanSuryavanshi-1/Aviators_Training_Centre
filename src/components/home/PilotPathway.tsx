import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import { cn } from "@/lib/utils";
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
import { CountdownTimer } from '@/components/shared/CountdownTimer'; // Assuming CountdownTimer component exists

// --- Configuration ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';
const urgencyButtonBorderGradient = 'bg-gradient-to-r from-[#0C6E72] to-[#56A7B0]';
const urgencyButtonHoverBg = 'hover:from-[#56A7B0] hover:to-[#0C6E72]';

// --- Animation Variants ---
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: 0, y: 20 },
  visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
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
      ease: "easeOut",
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
      "**Age:** Minimum 16 years (for PPL/CPL Student Pilot License), 18 years (for CPL).",
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
        "**Subjects:** Air Navigation, Meteorology, Air Regulation, Technical General, Technical Specific.",
        "**Format:** Online live classes, recorded sessions, comprehensive study materials.",
        "**Assessments:** Regular topic tests and mock exams simulating DGCA pattern.",
        "**Support:** 24/7 doubt-clearing via dedicated channels."
    ]
  },
  {
    icon: FileCheck2,
    title: "DGCA Exams Cleared",
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
          "absolute left-6 top-5 md:left-1/2 w-5 h-5 rounded-full border-4 border-background bg-teal-500 dark:bg-teal-400 transform -translate-x-1/2 -translate-y-1/2 z-10", // Ensure dot is above line
          "transition-all duration-300 group-hover:scale-110 group-hover:bg-teal-600 dark:group-hover:bg-teal-300"
      )}/>

      {/* Content Card Container */}
      <div className={cn(
          "ml-14 w-full",
          "md:ml-0 md:w-1/2",
          index % 2 === 0
            ? "md:pr-8 md:mr-auto"
            : "md:pl-8 md:ml-auto"
      )}>
        <Collapsible>
          <Card className="bg-card border border-border/80 rounded-lg shadow-sm transition-shadow hover:shadow-md overflow-hidden">
            <div className="p-4 flex items-start justify-between gap-2"> {/* Adjusted for better trigger placement */}
              <div className="flex items-center gap-3 flex-grow">
                  <div className={cn("flex-shrink-0 p-2 rounded-md bg-teal-100/70 dark:bg-teal-900/40", aviationSecondary)}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-foreground">{step.title}</h3>
                    <p className="text-sm text-foreground/70 mt-1"> {/* Description moved below title */}
                      {step.description}
                    </p>
                  </div>
              </div>
               {/* Collapsible Trigger Button */}
               <CollapsibleTrigger asChild>
                   <Button variant="ghost" size="sm" className="p-1 h-auto flex-shrink-0 text-teal-600 dark:text-teal-400 hover:bg-teal-100/50 dark:hover:bg-teal-900/30">
                      <span className="sr-only">Toggle details</span>
                      <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                   </Button>
               </CollapsibleTrigger>
            </div>

            {/* Collapsible Content Area */}
            <CollapsibleContent>
               <div className="bg-muted/30 dark:bg-muted/10 px-4 py-3 border-t border-border/50">
                  <ul className="space-y-1.5 pl-4"> {/* Slightly reduced indent */}
                    {step.details.map((detail, i) => (
                      <li key={i} className="text-xs text-foreground/80 flex items-start">
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
    // --- Urgency Data (Example) ---
    // In a real app, this date would come from Firebase or a config
    const offerEndDate = new Date();
    offerEndDate.setDate(offerEndDate.getDate() + 14); // Offer ends in 14 days
    const formattedEndDate = offerEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });


  return (
    <motion.section
      id="pathway"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }} // Trigger when section starts entering view
      className="py-16 md:py-24" // Added padding
    >
      <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <motion.h2
              variants={itemVariants}
              className={cn("text-3xl md:text-4xl font-bold mb-4", aviationPrimary)}
            >
              Your Pathway to the Cockpit
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-lg text-foreground/80 max-w-3xl mx-auto leading-relaxed"
            >
              We guide you through each essential step, from foundational knowledge to specialized training, preparing you for a successful aviation career.
            </motion.p>
          </div>

          {/* Timeline Visualization */}
          <div className="relative max-w-4xl mx-auto px-4 md:px-0">
            {/* Vertical Line - Removed -z-10 */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-teal-200 dark:bg-teal-800/60 transform md:-translate-x-1/2"></div>

            <div className="space-y-12 md:space-y-16">
              {pathwaySteps.map((step, index) => (
                 <AnimatedTimelineItem key={index} step={step} index={index} />
              ))}
            </div>
          </div>

          {/* --- Urgency CTA Section --- */}
          <motion.div
              variants={itemVariants} // Use item variant for fade-in
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="mt-16 md:mt-24 max-w-2xl mx-auto text-center p-6 bg-card border border-border/80 rounded-lg shadow-md"
          >
             <h3 className={cn("text-2xl font-semibold mb-3", aviationPrimary)}>Limited Time Offer!</h3>
             <p className="text-foreground/80 mb-6">
                 Enroll in any of our ground school batches by <strong className="text-foreground">{formattedEndDate}</strong> and secure a <strong className="text-foreground">20% discount</strong> on your course fees. Start your journey today!
             </p>

             {/* Gradient Button */}
             <div className="relative inline-block mb-4 group">
                  <div className={cn(
                     "absolute -inset-0.5 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300 group-hover:duration-200",
                     urgencyButtonBorderGradient
                  )}></div>
                   <Button
                       asChild
                       size="lg"
                       className={cn(
                           "relative px-7 py-4 leading-none rounded-lg flex items-center justify-center",
                           "bg-background hover:bg-transparent text-foreground hover:text-white", // Inner button styles
                           "transition duration-300 ease-in-out transform hover:scale-[1.03]",
                           urgencyButtonBorderGradient, // Apply gradient bg for hover effect
                           urgencyButtonHoverBg
                        )}
                   >
                       <Link to="/courses">
                            <CalendarClock className="mr-2 h-5 w-5" />
                           Enroll by {formattedEndDate} for 20% Off
                       </Link>
                   </Button>
             </div>

             {/* Countdown Timer (Simulated) */}
             <div className="mb-6">
                {/* Replace with actual CountdownTimer component if available */}
                {/* <CountdownTimer targetDate={offerEndDate} /> */}
                <p className="text-sm text-foreground/60">(Offer expires soon!)</p> 
             </div>


             {/* Secondary CTA */}
             <Button asChild variant="link" className={cn("text-base", aviationSecondary, "hover:text-teal-500 dark:hover:text-teal-300")}>
                 <Link to="/contact" state={{ subject: 'Consultation Request', message: 'I would like to schedule a consultation to discuss the pilot pathway and courses.' }}>
                    Limited seats! Schedule a consultation →
                </Link>
             </Button>

          </motion.div>
          {/* --- End Urgency CTA Section --- */}
        </div> 
    </motion.section>
  );
};

export default PilotPathway;

// --- Placeholder CountdownTimer Component (if not already created) ---
// You should replace this with a proper implementation using Firebase Timestamp
// or a library like react-countdown.
/*
import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
    targetDate: Date;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
    const calculateTimeLeft = () => {
        const difference = +targetDate - +new Date();
        let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    return (
        <div className="flex justify-center space-x-4 text-lg font-medium text-foreground/80">
            <span>{timeLeft.days}d</span>
            <span>:</span>
            <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
            <span>:</span>
            <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
            <span>:</span>
            <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
        </div>
    );
};
*/
