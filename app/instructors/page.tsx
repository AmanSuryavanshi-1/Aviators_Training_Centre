// Added "use client" for motion and error handlers
"use client";

import React from 'react';
// Removed Header and Footer imports
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Award, BookOpen, Briefcase, UserCheck, PhoneForwarded, Users } from 'lucide-react';
import { cn } from "@/lib/utils";
// Removed unused Link import
import { TransparentButton } from '@/components/shared/TransparentButton';

// --- Configuration ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';

// --- Image Paths ---
const instructorHeaderUrl = "/HomePage/Course2.webp";
const FALLBACK_IMAGE = "/HomePage/Hero5.webp";
const FALLBACK_AVATAR = "/placeholder.svg";

// --- Instructor Data ---
const instructors = [
  {
    name: "Lead Instructor - ATPL",
    title: "- airline pilot and educator",
    avatar: "/Instructor/Instructor1.webp",
    bio: "A seasoned Airline Captain with thousands of flight hours and extensive training experience. Focuses on advanced concepts and practical application for ATPL success.",
    expertise: ["Advanced Navigation", "Aviation Meteorology", "Airline Operations", "Aircraft Systems", "ATPL Syllabus"]
  },
  {
    name: "Senior Instructor - CPL",
    title: "- airline pilot and educator",
    avatar: "/Instructor/Instructor2.webp",
    bio: "An accomplished Commercial Pilot and dedicated instructor, specializing in CPL subjects and foundational pilot knowledge. Ensures thorough understanding and exam readiness.",
    expertise: ["Air Regulations", "Technical General", "Flight Instruction Theory", "Aerodynamics", "CPL Syllabus"]
  },
  {
    name: "RTR(A) Specialist",
    title: "Communications Expert",
    avatar: "/Instructor/Instructor3.webp",
    bio: "Expert in aviation communication protocols and procedures. Provides targeted training to master the RTR(A) exam and ensure clear, confident radio communication.",
    expertise: ["Radio Telephony", "Aviation English", "Exam Preparation", "ATC Procedures", "Mock Tests"]
  },
   {
    name: "Interview Prep Coach",
    title: "Confidence & Career Advisor",
    avatar: "/Instructor/Instructor4.webp",
    bio: "A specialized coach focusing on airline interview preparation, soft skills, and building confidence. Helps students present their best selves to potential employers.",
    expertise: ["Interview Techniques", "Aviation Career Guidance", "English Proficiency", "Soft Skills", "Airline Screening Prep"]
  }
];

// --- Animation Variants (Keep your existing variants) ---
const sectionVariants = { /* ... */ };
const itemVariants = { /* ... */ };
const cardHoverEffect = { /* ... */ };

// --- Component Definition ---
const Instructors: React.FC = () => {

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (!target.src.endsWith(FALLBACK_IMAGE)) {
        target.onerror = null;
        target.src = FALLBACK_IMAGE;
    }
  };

  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (!target.src.endsWith(FALLBACK_AVATAR)) {
      target.onerror = null;
      target.src = FALLBACK_AVATAR;
    }
  };

  // Removed surrounding div
  return (
    <>
      {/* Page Header */}
      <motion.section
        className="relative h-[50vh] md:h-[60vh] flex items-center justify-center text-center text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Consider Next/Image */}
        <img
          src={instructorHeaderUrl}
          alt="Group of Aviators Training Centre instructors"
          className="absolute inset-0 w-full h-full object-cover z-0"
          onError={handleImageError}
          style={{ filter: 'brightness(0.6)' }}
          loading="lazy"
        />
         <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,94,104,0.25)] to-[rgba(12,110,114,0.55)] z-10"></div>
        <motion.div
          className="relative z-20 max-w-4xl p-6 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="drop-shadow-md text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-3">
            Meet Our Expert Faculty
          </h1>
          <p className="text-lg drop-shadow-md md:text-xl text-white/90 max-w-2xl mx-auto">
            Experienced instructors guiding your path to success.
          </p>
        </motion.div>
      </motion.section>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-16 md:py-24 space-y-20 md:space-y-28">

        {/* Instructor Cards Section */} 
        <motion.section
           // Add variants
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, amount: 0.1 }}
        >
            <h2 className={cn("text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16", aviationPrimary)}>
              Experienced Airline Professionals
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {instructors.map((instructor, index) => (
                <motion.div key={index} /* Add variants */ className="flex">
                  <motion.div
                      className="relative h-full w-full group"
                      whileHover="hover"
                      initial="rest"
                      animate="rest"
                      // Add variants
                  >
                    <Card className="bg-card w-full h-full flex flex-col overflow-hidden rounded-lg shadow-sm border border-border transition-shadow duration-300 relative z-10">
                      <CardHeader className="flex flex-col items-center text-center p-6 bg-muted/30 dark:bg-muted/10 border-b border-border/50">
                        <Avatar className="w-20 h-20 mb-4 border-4 border-teal-300 dark:border-teal-600 ring-2 ring-teal-500/30">
                          {/* Consider Next/Image */}
                          <AvatarImage
                              src={instructor.avatar}
                              alt={instructor.name}
                              onError={handleAvatarError}
                          />
                          <AvatarFallback>{instructor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <CardTitle className={cn("text-lg font-semibold", aviationPrimary)}>{instructor.name}</CardTitle>
                        <CardDescription className="text-sm text-foreground/70">{instructor.title}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-5 flex-grow flex flex-col">
                        <CardDescription className="text-sm text-foreground/80 mb-5 flex-grow leading-relaxed">{instructor.bio}</CardDescription>
                        <div>
                          <h4 className="text-xs font-semibold uppercase text-foreground/60 mb-2 tracking-wider">Expertise:</h4>
                          <div className="flex flex-wrap gap-1.5">
                              {instructor.expertise.map(area => (
                                  <Badge key={area} variant="secondary" className="text-xs bg-teal-100/80 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200 border border-teal-300/50 dark:border-teal-700/50">{area}</Badge>
                              ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}

               {/* Placeholder Card */} 
               <motion.div /* Add variants */ className="flex">
                   <motion.div
                       className="relative h-full w-full group"
                       whileHover="hover"
                       initial="rest"
                       animate="rest"
                       // Add variants
                   >
                       <Card className="bg-gradient-to-br from-teal-50/50 to-sky-50/50 dark:from-gray-800/60 dark:to-gray-900/60 w-full h-full flex flex-col items-center justify-center text-center overflow-hidden rounded-lg shadow-sm border border-dashed border-border transition-shadow duration-300 relative z-10 p-6">
                           <div className="mb-4">
                              <PhoneForwarded className={cn("w-10 h-10", aviationSecondary)} />
                           </div>
                           <CardTitle className="text-lg font-semibold text-foreground mb-2">Want to Join Our Team?</CardTitle>
                           <CardDescription className="text-sm text-foreground/80 mb-4">
                              We're always looking for passionate aviation experts. Contact us!
                           </CardDescription>
                           <TransparentButton
                               href="/contact"
                               icon={PhoneForwarded}
                               label="Contact Us"
                           />
                       </Card>
                   </motion.div>
               </motion.div>
            </div>
        </motion.section>

         {/* The ATC Difference Section */} 
         <motion.section
            // Add variants
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="bg-gradient-to-br from-teal-50/30 to-sky-50/30 dark:from-gray-800/40 dark:to-gray-900/40 rounded-xl p-8 md:p-12 border border-border/50 shadow-lg"
        >
            <h2 className={cn("text-3xl md:text-4xl font-bold text-center mb-10", aviationPrimary)}>The ATC Instructor Difference</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8 text-center">
                {[
                     { icon: Award, title: "Real-World Experience", description: "Direct airline & operational insight" },
                     { icon: BookOpen, title: "Commitment to Teaching", description: "Focus on effective learning" },
                     { icon: Briefcase, title: "Career-Focused Guidance", description: "Mentorship beyond the syllabus" },
                     { icon: UserCheck, title: "Exam Success Focus", description: "Strategies for DGCA & airline tests" },
                     { icon: Users, title: "Student-Centric Approach", description: "Adapting to individual needs" },
                     { icon: PhoneForwarded, title: "Accessible & Supportive", description: "Always available for guidance" },
                ].map((feature, index) => (
                    <motion.div
                        key={index}
                        // Add variants
                        className="flex flex-col items-center p-3 group"
                    >
                         <div className="p-3 rounded-full bg-teal-100/70 dark:bg-teal-900/40 mb-3 transition-colors duration-300 group-hover:bg-teal-200/80 dark:group-hover:bg-teal-800/60">
                            <feature.icon className={cn("h-7 w-7", aviationSecondary)} />
                        </div>
                        <h4 className="text-sm font-semibold text-foreground mb-1">{feature.title}</h4>
                        <p className="text-xs text-foreground/70">{feature.description}</p>
                    </motion.div>
                ))}
            </div>
        </motion.section>

      </main>
      {/* Footer is rendered by layout.tsx */}
    </>
  );
};

export default Instructors;
