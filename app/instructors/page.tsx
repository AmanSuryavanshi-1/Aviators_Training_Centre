"use client";
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { cn } from '@/components/ui/utils';
import { PhoneForwarded,ArrowRight } from 'lucide-react'; // Import icons from lucide-react
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { handleImageError } from '@/components/ui/utils';

// --- Configuration ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';

// --- Animation Variants ---

const HERO_FALLBACK_IMAGE = "/Course-Img.webp";
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeInOut" } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const InstructorsPage: React.FC = () => {
  // --- Instructor Data ---
  const instructors = [
    {
      name: 'Dhruv Shirkoli',
      title: 'Senior Instructor - CPL',
      image: '/Instructor/Dhruv Shirkoli.webp',
      bio: 'An accomplished Commercial Pilot with a deep understanding of aviation regulations and technical knowledge. Passionate about nurturing the next generation of pilots.',
      expertise: ["Air Regulations", "Technical General", "Flight Instruction", "Aerodynamics"]
    },
    {
      name: 'Ankit Kumar',
      title: 'Lead Instructor - ATPL',
      image: '/Instructor/Ankit Kumar.png',
      bio: 'A seasoned Airline Captain and Educator, bringing real-world airline experience to the classroom. Dedicated to guiding aspiring pilots through the intricacies of ATPL.',
      expertise: ["Advanced Navigation", "Aviation Meteorology", "Airline Operations", "Aircraft Systems"]
    },
    {
      name: "Shubham",
      title: "RTR(A) Specialist",
      image: "/Instructor/Instructor3.webp",
      bio: "Expert in aviation communication, specializing in Radio Telephony. Committed to ensuring clear and efficient communication practices in aviation.",
      expertise: ["Radio Telephony", "Aviation English", "Exam Preparation", "ATC Procedures"]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header/>
      {/* Hero Section */}
      <motion.section
        className="relative h-[50vh] md:h-[60vh] flex items-center justify-center text-center text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
         <img
            src="/Plane.webp"
            alt="View from an aircraft cockpit"
            className="object-cover absolute inset-0 z-0 w-full h-full"
            onError={handleImageError}
            style={{ filter: 'brightness(0.6)' }} // Adjusted brightness
         />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,94,104,0.25)] to-[rgba(12,110,114,0.55)] z-10"></div> {/* Added gradient overlay */}
        <motion.div
          className="relative z-20 p-6 max-w-4xl md:p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight leading-tight drop-shadow-md sm:text-5xl md:text-6xl">
            Meet the Experts
          </h1>
          <p className="mb-8 text-white">
            Learn from our world-class instructors.
          </p>
        </motion.div>
      </motion.section>
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container flex-grow px-4 py-16 mx-auto space-y-20 sm:px-6 md:py-24 md:space-y-28"
        >

          {/* --- Instructors Section --- */}
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 items-stretch">
              {instructors.map((instructor, index) => (
                <motion.div key={index} variants={itemVariants} className="flex">
                  <Card className="bg-card w-full flex flex-col overflow-hidden rounded-lg shadow-sm border border-border transition-shadow duration-300 relative z-10">
                    <div className="relative w-full h-64">
                      <Image
                        src={instructor.image}
                        alt={instructor.name}
                        fill
                        className="object-cover"
                        sizes="100vw"
                        priority
                      />
                    </div>
                    <CardHeader className="p-4 text-center">
                      <CardTitle className="text-lg font-semibold">{instructor.name}</CardTitle>
                      <CardDescription className="text-foreground/80">{instructor.title}</CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 text-center">
                      <p className="mt-2 text-foreground/90">{instructor.bio}</p>
                      <div className="mt-2">
                        <h4 className="text-xs font-semibold uppercase text-foreground/60 tracking-wider">Expertise:</h4>
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {instructor.expertise.map(area => (
                            <div key={area} className="text-xs bg-teal-100/80 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200 border border-teal-300/50 dark:border-teal-700/50 px-2 py-1 rounded-full">{area}</div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="mt-auto p-4 flex justify-center">
                      <a href="/contact#contact-form" className={cn("inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md")}>
                        Contact Us<PhoneForwarded className="ml-2 h-4 w-4" />
                      </a>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </motion.main>
       <Footer />
    </div>
  );
};

export default InstructorsPage;

