import React from 'react';
import { cn } from "@/lib/utils";
import { BookUser, FileCheck2, GraduationCap, RadioTower, PlaneTakeoff, Briefcase, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"; // Import Collapsible components
import { Button } from "@/components/ui/button"; // Import Button for Trigger styling

// --- Configuration ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';

// --- Animation Variants ---
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 } }
};

const itemVariants = {
  // Adjusted animation slightly for timeline items
  hidden: { opacity: 0, x: 0, y: 20 }, // Start slightly below
  visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

// --- Pathway Steps Data with Details ---
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

const PilotPathway: React.FC = () => {
  return (
    <motion.section
      id="pathway"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }} // Adjust viewport trigger point
    >
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
      <div className="relative max-w-4xl mx-auto px-4 md:px-0"> {/* Increased max-width slightly */}
        {/* Vertical Line - Centered for medium screens and up */}
        <div className="absolute left-6 md:left-1/2 top-0 h-full w-0.5 bg-teal-200 dark:bg-teal-800/60 transform md:-translate-x-1/2"></div>

        <div className="space-y-12 md:space-y-16">
          {pathwaySteps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative flex items-start group"
            >
              {/* Dot on the Line */}
              <div className={cn(
                  "absolute left-6 top-5 md:left-1/2 w-5 h-5 rounded-full border-4 border-background bg-teal-500 dark:bg-teal-400 transform -translate-x-1/2 -translate-y-1/2", // Centered dot vertically
                   "transition-all duration-300 group-hover:scale-110 group-hover:bg-teal-600 dark:group-hover:bg-teal-300"
              )}/>

              {/* Content Card Container - Corrected Alignment Logic */}
              <div className={cn(
                  "ml-14 w-full", // Default: Right of line
                  "md:ml-0 md:w-1/2", // Medium screens: Half width
                  index % 2 === 0 
                    ? "md:pr-8 md:mr-auto" // Even items (0, 2, 4): Left side of timeline
                    : "md:pl-8 md:ml-auto" // Odd items (1, 3, 5): Right side of timeline
              )}>
                  <Collapsible>
                    <Card className="bg-card border border-border/80 rounded-lg shadow-sm transition-shadow hover:shadow-md overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={cn("flex-shrink-0 p-2 rounded-md bg-teal-100/70 dark:bg-teal-900/40", aviationSecondary)}>
                            <step.icon className="h-5 w-5" />
                          </div>
                          <h3 className="font-semibold text-base text-foreground flex-grow">{step.title}</h3>
                           {/* Collapsible Trigger Button */} 
                           <CollapsibleTrigger asChild>
                               <Button variant="ghost" size="sm" className="p-1 h-auto text-teal-600 dark:text-teal-400 hover:bg-teal-100/50 dark:hover:bg-teal-900/30">
                                  <span className="sr-only">Toggle details</span>
                                  <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                               </Button>
                           </CollapsibleTrigger>
                        </div>
                        <p className="text-sm text-foreground/70 pl-10"> {/* Initial description */}
                          {step.description}
                        </p>
                      </div>
                      {/* Collapsible Content Area */}
                      <CollapsibleContent>
                         <div className="bg-muted/30 dark:bg-muted/10 px-4 py-3 border-t border-border/50">
                            <ul className="space-y-1.5 pl-10"> {/* Indent details */} 
                              {step.details.map((detail, i) => (
                                <li key={i} className="text-xs text-foreground/80 flex items-start">
                                  <span className="mr-2 mt-0.5">•</span>
                                  {/* Basic markdown support for bold */} 
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
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default PilotPathway;
