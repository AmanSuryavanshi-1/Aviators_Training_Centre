"use client"
import Image from "next/image";
import Link from "next/link";
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Target, Users, Telescope, Heart, MessageSquare, UserCheck, Clock, DollarSign, UserX, MessageCircleQuestion, MapPin, Home, BadgeDollarSign, ArrowRight, Archive, PhoneForwarded } from 'lucide-react';
import { cn } from "@/components/ui/utils";
import AboutSection from "@/components/features/courses/AboutSection";


// --- Configuration (Removed button style variables) ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';

// Image paths (Unchanged)
const aboutHeroUrl = "/About-Img.webp";
// const storyImageUrl = "/About/About2.avif"; // Keep for reference if needed, but image is now passed to AboutSection
const FALLBACK_IMAGE = "/HomePage/Hero4.webp";

// --- Animation Variants (Unchanged) ---
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeInOut" } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};
const cardHoverEffect = {
  rest: { scale: 1, transition: { duration: 0.3, ease: "easeInOut" } },
  hover: { scale: 1.03, transition: { duration: 0.3, ease: "easeInOut" } }
};

// --- Data (Unchanged) ---
const traditionalHassles = [
    { icon: UserX, text: "Large, impersonal batches" },
    { icon: MessageCircleQuestion, text: "Hesitation to ask questions" },
    { icon: MapPin, text: "Travel time & costs for classes" },
    { icon: Home, text: "Flat/PG rental costs" },
    { icon: BadgeDollarSign, text: "High traditional coaching fees" },
    { icon: Archive, text: "Outdated study materials" }
];

const atcAdvantages = [
    { icon: UserCheck, title: "Personalized Coaching", description: "Tailored guidance matching your learning style for optimal understanding." },
    { icon: Clock, title: "Flexible Scheduling", description: "Study at your own pace with adaptable online class timings." },
    { icon: MessageSquare, title: "24/7 Doubt-Clearing", description: "Never get stuck – access round-the-clock support from experts." },
    { icon: Users, title: "Expert Faculty", description: "Learn crucial concepts from experienced, airline-rated instructors." },
    { icon: DollarSign, title: "Affordable Courses", description: "Receive premium ground school education at competitive prices." },
    { icon: Heart, title: "Dedicated Support", description: "We are fully committed to your success, every step of the way." },
];

const whoWeAreContent = `
  Aviators Training Centre (ATC) is a premier ground school specializing in comprehensive preparation for the DGCA CPL and ATPL examinations. Founded by experienced aviation professionals, we recognized the need for a more focused, efficient, and student-centric approach to ground training.
  
  Our core mission is to deliver top-tier, professional pilot training programs that build a rock-solid foundation of theoretical knowledge, essential for a safe and successful career in the skies. We're passionate about helping you transform your aviation dreams into reality.
`;

const ourMissionContent = `
  Our mission is to bridge the gap between aspiration and achievement in the aviation world. We understand that every individual who dreams of the skies has unique challenges and ambitions. That's why we've tailored our approach to be as personalized as it is comprehensive. Our team of experts is dedicated to guiding you through every step, from foundational knowledge to advanced techniques. We strive to create an environment that's not only conducive to learning but also inspires growth, creativity, and collaboration. It's not just about passing exams; it's about fostering a lifelong passion for flight and equipping you with the skills and confidence to navigate your aviation career.
`;

const ourVisionContent = `
  We envision a future where the world of aviation is open to all, regardless of background or prior experience. We see ATC as a beacon of inclusivity, where diverse individuals can come together to share their passion for the skies. Our vision extends beyond the classroom; we aim to build a global network of aviation enthusiasts, professionals, and innovators. By fostering this community, we hope to contribute to a future where the wonders of flight are more accessible and the industry thrives on the collective strength of diverse perspectives.
`;

// Note: SEO Metadata is now in metadata.ts


export default function About() {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      e.currentTarget.src = FALLBACK_IMAGE;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <motion.section
        className="relative h-[50vh] md:h-[60vh] flex items-center justify-center text-center text-white overflow-hidden" // Matched height from Courses
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Image
          src={aboutHeroUrl}
          alt="About Aviators Training Centre"
          fill
          className="object-cover"
          onError={handleImageError}
          priority
        />
         <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,94,104,0.35)] to-[rgba(12,110,114,0.65)] z-10"></div> {/* Added gradient overlay */}
        <motion.div
          className="relative z-20 p-6 max-w-4xl md:p-10" // Matched padding
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight leading-tight drop-shadow-md sm:text-5xl md:text-6xl"> {/* Matched text styles */}
            About Aviators Training Centre
          </h1>
          <p className="mb-8 text-white">
            Join us at Aviator Training Center and begin your journey towards the
            skies. Whether you're taking your first steps in aviation or looking
            to advance your career, we're here to support your flight.
          </p>
          {/* Removed Button */}
        </motion.div>
      </motion.section>

      {/* Main Content */}
      <main className="container flex-grow px-4 py-16 mx-auto space-y-20 sm:px-6 md:py-24 md:space-y-28">

        {/* Combined Story, Who We Are, Mission, Vision Section */}
        <AboutSection
          title="Who We Are"
          content={whoWeAreContent}
          image="/About/About2.avif"
        />

        <AboutSection
          title="Our Mission"
          content={ourMissionContent}
          image="/Plane2.webp"
          reverse
        />

        <AboutSection
          title="Our Vision"
          content={ourVisionContent}
          image="/Plane.webp"
        />

        {/* Why Choose Us Section (The ATC Advantage) - Refactored with Cards */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
            <h2 className={cn("mb-12 text-3xl font-bold text-center md:text-4xl md:mb-16", aviationPrimary)}> {/* Updated heading style */}
              The ATC Advantage
            </h2>
            {/* Added items-stretch */}
            <div className="grid grid-cols-1 gap-8 items-stretch sm:grid-cols-2 lg:grid-cols-3">
                {atcAdvantages.map((item, index) => (
                  <motion.div key={index} variants={itemVariants} className="flex"> {/* Added flex */}
                    <motion.div
                        className="relative w-full h-full group"
                        whileHover="hover"
                        initial="rest"
                        animate="rest"
                        variants={cardHoverEffect}
                    >
                       {/* Ensure Card takes full height */}
                       <Card className="flex overflow-hidden relative z-10 flex-col p-6 w-full h-full text-center rounded-lg border shadow-sm transition-shadow duration-300 bg-card border-border">
                           <CardHeader className="flex-shrink-0 p-0 mb-4"> {/* Adjusted padding */}
                               <div className="p-3 mx-auto mb-3 rounded-full transition-colors duration-300 bg-teal-100/70 dark:bg-teal-900/40 w-fit group-hover:bg-teal-200/80 dark:group-hover:bg-teal-800/60"> {/* Icon style from Courses */}
                                   <item.icon className={cn("w-7 h-7", aviationSecondary)} /> {/* Adjusted icon size */}
                               </div>
                               <CardTitle className="text-lg font-semibold text-foreground">{item.title}</CardTitle> {/* Adjusted text size */}
                           </CardHeader>
                           <CardContent className="flex-grow p-0">
                               <CardDescription className="text-sm leading-relaxed text-foreground/80"> {/* Use CardDescription */}
                                 {item.description}
                                </CardDescription>
                           </CardContent>
                       </Card>
                    </motion.div>
                  </motion.div>
                ))}
            </div>
        </motion.section>

        {/* "Say Goodbye" Section - Refined Styling */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="p-8 bg-gradient-to-br rounded-xl border shadow-lg from-red-50/30 to-rose-50/30 dark:from-gray-800/40 dark:to-gray-900/40 md:p-12 border-border/50"
        >
            <h2 className={cn("mb-12 text-3xl font-bold text-center md:text-4xl md:mb-16", 'text-red-700 dark:text-red-400')}> {/* Adjusted heading color */}
                Say Goodbye To Traditional Hassles
            </h2>
            <div className="grid grid-cols-1 gap-8 items-stretch mx-auto max-w-5xl sm:grid-cols-2 lg:grid-cols-3"> {/* Added items-stretch, gap-8 */}
               {traditionalHassles.map((hassle, index) => (
                   <motion.div key={index} variants={itemVariants} className="flex"> {/* Added flex */}
                       <motion.div
                           className="relative w-full h-full group"
                           whileHover="hover"
                           initial="rest"
                           animate="rest"
                           variants={cardHoverEffect}
                       >
                           <Card className="flex relative z-10 flex-col items-center p-6 h-full text-center rounded-lg border shadow-sm transition-shadow duration-300 bg-card border-border"> {/* Applied consistent card styling */}
                              <div className="p-3 mb-3 rounded-full transition-colors duration-300 bg-red-100/70 dark:bg-red-900/40 group-hover:bg-red-200/80 dark:group-hover:bg-red-800/60"> {/* Consistent icon style */}
                                <hassle.icon className="w-7 h-7 text-red-600 dark:text-red-400" /> {/* Adjusted colors */}
                              </div>
                              <CardContent className="flex flex-grow items-center p-0"> {/* Use CardContent, center text vertically */}
                                <CardDescription className="text-sm font-medium leading-snug text-foreground/80">{hassle.text}</CardDescription> {/* Use CardDescription */}
                              </CardContent>
                           </Card>
                       </motion.div>
                   </motion.div>
               ))}
            </div>
            <motion.div
              variants={itemVariants} // Add animation
              className="mt-12 text-center md:mt-16"
            >
                <p className={cn("text-lg font-semibold", aviationPrimary)}> {/* Use primary color */}
                  Focus purely on mastering your ground subjects with ATC!
                </p>
            </motion.div>
        </motion.section>

      </main>
    </div>
  );
}
