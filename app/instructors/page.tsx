"use client";
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { cn } from '@/components/ui/utils';
import { PhoneForwarded, ArrowRight, Award, UsersRound, CheckSquare } from 'lucide-react'; // Import icons
import { BookDemoButton } from '@/components/shared/BookDemoButton'; // Import BookDemoButton
import { TransparentButton } from '@/components/shared/TransparentButton'; // Import TransparentButton

// --- Configuration ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';
const HERO_IMAGE_URL = "/Instructor/InstructorHero.webp"; // Use a relevant hero image
const FALLBACK_IMAGE = "/HomePage/Hero4.webp";

// --- Animation Variants (Consistent with other pages) ---
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

// --- Instructor Data ---
const instructors = [
  {
    name: 'Dhruv Shirkoli',
    title: 'Senior Instructor - CPL',
    image: '/Instructor/Dhruv in cockpit.webp',
    bio: 'An accomplished Commercial Pilot with a deep understanding of aviation regulations and technical knowledge. Passionate about nurturing the next generation of pilots.',
    expertise: ["Air Regulations", "Technical General", "Flight Instruction", "Aerodynamics"]
  },
  {
    name: 'Ankit Kumar',
    title: 'Lead Instructor - ATPL',
    image: '/Instructor/ankit.webp',
    bio: 'A seasoned Airline Captain and Educator, bringing real-world airline experience to the classroom. Dedicated to guiding aspiring pilots through the intricacies of ATPL.',
    expertise: ["Advanced Navigation", "Aviation Meteorology", "Airline Operations", "Aircraft Systems"]
  },
  {
    name: "Saksham Khandelwal",
    title: "RTR(A) Specialist",
    image: "/Instructor/saksham engine.webp",
    bio: "Expert in aviation communication, specializing in Radio Telephony. Committed to ensuring clear and efficient communication practices in aviation.",
    expertise: ["Radio Telephony", "Aviation English", "Exam Preparation", "ATC Procedures"]
  }
];

const InstructorsPage: React.FC = () => {

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (!target.src.endsWith(FALLBACK_IMAGE)) {
        target.onerror = null;
        target.src = FALLBACK_IMAGE;
    }
  };

  // Add JSON-LD Schema for Instructors
  const instructorsJsonLd = {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Aviation Instructors at Aviators Training Centre",
      "description": "Expert aviation instructors with airline experience teaching CPL/ATPL subjects, RTR(A), and providing interview preparation.",
      "itemListElement": instructors.map((instructor, index) => ({
        "@type": "Person",
        "@id": `https://aviatorstrainingcentre.com/instructors#${instructor.name.toLowerCase().replace(/\s+/g, '-')}-${index}`,
        "name": instructor.name,
        "jobTitle": instructor.title,
        "image": `https://aviatorstrainingcentre.com${instructor.image}`, // Add image URL
        "description": instructor.bio,
        "knowsAbout": instructor.expertise,
        "worksFor": {
          "@type": "Organization",
          "name": "Aviators Training Centre",
          "url": "https://aviatorstrainingcentre.com"
        }
      }))
    })
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={instructorsJsonLd}
      />

      {/* Hero Section - Styled like other pages */}
      <motion.section
        className="relative h-[50vh] md:h-[60vh] flex items-center justify-center text-center text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
         <Image
            src={HERO_IMAGE_URL}
            alt="Aviators Training Centre Instructors"
            fill
            priority
            className="absolute inset-0 z-0 object-cover w-full h-full"
            onError={handleImageError}
            style={{ filter: 'brightness(0.6)' }} // Adjusted brightness
         />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,94,104,0.25)] to-[rgba(12,110,114,0.55)] z-10"></div> {/* Consistent gradient overlay */}
        <motion.div
          className="relative z-20 max-w-4xl p-6 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="mb-3 text-4xl font-extrabold leading-tight tracking-tight drop-shadow-md sm:text-5xl md:text-6xl"> {/* Consistent text styles */}
            Meet Our Expert Instructors
          </h1>
          <p className="max-w-2xl mx-auto text-lg drop-shadow-md md:text-xl text-white/90"> {/* Consistent text styles */}
            Learn from seasoned professionals dedicated to your success in aviation.
          </p>
        </motion.div>
      </motion.section>

      {/* Main Content - Consistent padding and spacing */}
      <main className="container flex-grow px-4 py-16 mx-auto space-y-20 sm:px-6 md:py-24 md:space-y-28">

          {/* --- Instructors Grid Section --- */}
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {/* Optional Section Header */}
            <div className="mb-12 text-center md:mb-16">
                <motion.h2 variants={itemVariants} className={cn("mb-3 text-3xl font-bold md:text-4xl", aviationPrimary)}>Guidance from the Best</motion.h2>
                <motion.p variants={itemVariants} className="max-w-3xl mx-auto text-lg text-foreground/80">
                    Our instructors bring a wealth of real-world experience and a passion for teaching to help you achieve your aviation goals.
                </motion.p>
            </div>

            <div className="grid items-stretch grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {instructors.map((instructor, index) => (
                <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex"
                >
                  <motion.div
                    className="relative w-full h-full group"
                    whileHover="hover"
                    initial="rest"
                    animate="rest"
                    variants={cardHoverEffect}
                  >
                    <Card className="relative z-10 flex flex-col w-full h-full overflow-hidden transition-shadow duration-300 border rounded-lg shadow-sm bg-card border-border">
                      <CardHeader className="relative p-0">
                        <div className="relative w-full h-64 sm:h-72"> {/* Adjusted image height */}
                          <Image
                            src={instructor.image}
                            alt={`Photo of ${instructor.name}`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            onError={handleImageError}
                            priority={index < 3} // Prioritize loading images for the first few instructors
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col flex-grow p-5 sm:p-6"> {/* Use CardContent for main body */}
                        <CardTitle className={cn("mb-1 text-xl font-semibold", aviationSecondary)}>{instructor.name}</CardTitle>
                        <CardDescription className="mb-3 text-sm font-medium text-foreground/70">{instructor.title}</CardDescription>
                        <p className="flex-grow mb-4 text-sm text-foreground/90">{instructor.bio}</p>
                        <div>
                          <h4 className="mb-2 text-xs font-semibold tracking-wider uppercase text-foreground/60">Areas of Expertise:</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {instructor.expertise.map(area => (
                              <span key={area} className="px-2.5 py-1 text-xs rounded-full bg-teal-100/70 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200 border border-teal-200 dark:border-teal-800">{area}</span>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-center p-4 mt-auto bg-muted/30"> {/* Consistent Footer Style */}
                        {/* Using BookDemoButton or a similar styled link */}
                        <BookDemoButton
                            size="sm"
                            className="w-full sm:w-auto"
                            state={{ subject: `Inquiry about classes with ${instructor.name}`, courseName: instructor.name }}
                        />
                      </CardFooter>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* --- Why Learn With Us Section (Optional - Add if relevant) --- */}
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="p-8 text-center rounded-lg bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/30 dark:to-blue-900/30 md:p-12"
          >
            <motion.h2 variants={itemVariants} className={cn("mb-4 text-3xl font-bold md:text-4xl", aviationPrimary)}>The ATC Advantage</motion.h2>
            <motion.p variants={itemVariants} className="max-w-3xl mx-auto mb-8 text-lg text-foreground/80">
              Our instructors are the cornerstone of our success, providing unparalleled expertise and dedicated support.
            </motion.p>
            <div className="grid max-w-4xl grid-cols-1 gap-6 mx-auto mb-10 sm:grid-cols-2 lg:grid-cols-3 md:gap-8">
                {[ // Example features - adapt as needed
                    { icon: Award, text: "Airline Experienced Faculty" },
                    { icon: UsersRound, text: "Personalized Mentorship" },
                    { icon: CheckSquare, text: "Proven Success Record" },
                ].map((feature, index) => (
                    <motion.div key={index} variants={itemVariants} className="flex items-center p-4 space-x-3 border rounded-md shadow-sm bg-background/50 border-border/50">
                        <feature.icon className={cn("w-6 h-6", aviationSecondary)} />
                        <span className="font-medium text-foreground/90">{feature.text}</span>
                    </motion.div>
                ))}
            </div>
            <motion.div variants={itemVariants}>
                <TransparentButton href="/about" icon={ArrowRight} label="Learn More About ATC" />
            </motion.div>
          </motion.section>

        </main>
    </div>
  );
};

export default InstructorsPage;

