// Added "use client" because motion and error handlers are used
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react'; // Removed ArrowRight as it's not used
import { motion } from 'framer-motion';
import Link from 'next/link'; // Changed import to next/link
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- Configuration ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
// const aviationSecondary = 'text-teal-600 dark:text-teal-400'; // Unused
// const aviationButtonBg = 'bg-teal-600 hover:bg-teal-700'; // Defined in Button component
// const aviationButtonDarkBg = 'dark:bg-teal-500 dark:hover:bg-teal-600'; // Defined in Button component

// --- Animation Variants (Keep existing) ---
const sectionVariants = { /* ... */ };
const itemVariants = { /* ... */ };
const cardHoverEffect = { /* ... */ };

// --- Instructor Data ---
const instructors = [
  {
    name: 'Lead Instructor - ATPL',
    title: 'Airline Pilot & Educator',
    avatar: '/Instructor/Instructor1.webp',
    bio: 'Seasoned Airline Captain guiding ATPL candidates through advanced concepts and airline operations knowledge.'
  },
  {
    name: 'Senior Instructor - CPL',
    title: 'Airline Pilot & Educator',
    avatar: '/Instructor/Instructor2.webp',
    bio: 'Dedicated CPL instructor specializing in air regulations, technical subjects, and core flight principles.'
  },
  {
    name: 'RTR(A) Specialist',
    title: 'Communications Expert',
    avatar: '/Instructor/Instructor3.webp',
    bio: 'Expert in aviation communication, focused on preparing students for the RTR(A) examination.'
  }
];

const FALLBACK_AVATAR = "/placeholder.svg"; // Ensure this path is correct in /public

const InstructorsSection: React.FC = () => {

  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (!target.src.endsWith(FALLBACK_AVATAR)) {
      target.onerror = null;
      target.src = FALLBACK_AVATAR;
    }
  };

  return (
    <motion.section
      id="instructors"
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
          Learn From the Best
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="text-lg text-foreground/80 max-w-3xl mx-auto leading-relaxed"
        >
          Our instructors are experienced airline professionals dedicated to providing top-tier ground school education and mentorship.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {instructors.map((instructor, index) => (
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
                <CardContent className="p-5 flex-grow">
                  <CardDescription className="text-sm text-foreground/80 text-center leading-relaxed">
                    {instructor.bio}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Button to view all instructors - Use Next Link */}
      <motion.div
        variants={itemVariants}
        className="mt-12 text-center"
       >
        <Button
          variant="outline"
          size="lg"
          className={cn("min-h-[48px] border-teal-500 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-300 dark:hover:bg-teal-900/30 transition duration-300 ease-in-out transform hover:scale-[1.03] inline-flex items-center gap-2")}
          asChild // Use asChild to allow Link component inside
        >
          <Link href="/instructors"> {/* Use href for Next.js Link */}
              Meet the Full Team <Users className="h-4 w-4" />
          </Link>
        </Button>
      </motion.div>

    </motion.section>
  );
};

export default InstructorsSection;
