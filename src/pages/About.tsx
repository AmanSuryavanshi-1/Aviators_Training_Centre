import React from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Added CardDescription
import { Button } from "@/components/ui/button";
// Updated icon imports to match Courses.tsx and usage
import { Target, Users, Telescope, Heart, MessageSquare, UserCheck, Clock, DollarSign, UserX, MessageCircleQuestion, MapPin, Home, BadgeDollarSign, ArrowRight, Archive, PhoneForwarded } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";

// --- Configuration (Matching Courses.tsx) ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';
const aviationButtonBg = 'bg-teal-600 hover:bg-teal-700';
const aviationButtonDarkBg = 'dark:bg-teal-500 dark:hover:bg-teal-600';

// Image paths (kept as is, assuming they are correct)
const aboutHeroUrl = "/Plane3.jpg"; // Cockpit view
const storyImageUrl = "/About/About2.avif"; // Modern classroom/study
const FALLBACK_IMAGE = "/HomePage/Hero5.webp"; // Consistent fallback

// --- Animation Variants (Matching Courses.tsx) ---
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 } } // Adjusted stagger
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const cardHoverEffect = { // Renamed and using Courses.tsx style
  rest: { y: 0, boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.08)" },
  hover: { y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.12)", transition: { duration: 0.3, ease: "circOut" } }
};

// --- Data (kept as is, using 6 items) ---
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


const About: React.FC = () => {

  // Function to handle image errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== FALLBACK_IMAGE) {
        target.onerror = null;
        target.src = FALLBACK_IMAGE;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />

      {/* Page Header - Adjusted brightness, text shadow */}
      <motion.section
        className="relative h-[50vh] md:h-[60vh] flex items-center justify-center text-center text-white overflow-hidden" // Matched height from Courses
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <img
          src={aboutHeroUrl}
          alt="View from an aircraft cockpit"
          className="absolute inset-0 w-full h-full object-cover z-0"
          onError={handleImageError}
          style={{ filter: 'brightness(0.6)' }} // Adjusted brightness
        />
         <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,94,104,0.25)] to-[rgba(12,110,114,0.55)] z-10"></div> {/* Added gradient overlay */}
        <motion.div
          className="relative z-20 max-w-4xl p-6 md:p-10" // Matched padding
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="drop-shadow-md text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-3"> {/* Matched text styles */}
            About Aviators Training Centre
          </h1>
          <p className="text-lg drop-shadow-md md:text-xl text-white/90 max-w-2xl mx-auto"> {/* Matched text styles */}
            Empowering aspiring pilots with focused ground training to conquer DGCA exams and launch successful aviation careers.
          </p>
        </motion.div>
      </motion.section>

      {/* Main Content - Adjusted container padding/spacing */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-16 md:py-24 space-y-20 md:space-y-28">

        {/* Our Story / Mission Section - Adjusted layout and text */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }} // Adjusted viewport amount
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center"
        >
          <motion.div variants={itemVariants} className="space-y-5">
            <h2 className={cn("text-3xl md:text-4xl font-bold mb-4 text-left", aviationPrimary)}> {/* Updated heading style */}
              Who We Are
            </h2>
            <p className="text-foreground/80 leading-relaxed text-base"> {/* Adjusted text color/size */}
              Aviators Training Centre (ATC) is a premier ground school specializing in comprehensive preparation for the DGCA CPL and ATPL examinations. Founded by experienced aviation professionals, we recognized the need for a more focused, efficient, and student-centric approach to ground training.
            </p>
             <p className="text-foreground/80 leading-relaxed text-base"> {/* Adjusted text color/size */}
               Our core mission is to deliver top-tier, professional pilot training programs that build a rock-solid foundation of theoretical knowledge, essential for a safe and successful career in the skies. We're passionate about helping you transform your aviation dreams into reality.
            </p>
             <Link to="/contact">
                <Button size="lg" className={cn("mt-4 inline-flex items-center gap-2 group transition duration-300 ease-in-out transform hover:scale-[1.03]", aviationButtonBg, aviationButtonDarkBg, "text-white")}> {/* Matched Button style */}
                    Contact Us
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
             </Link>
          </motion.div>
          <motion.div variants={itemVariants} className="flex justify-center"> {/* Center image on small screens */}
             <motion.div
                className="relative group w-full max-w-md" // Limit image width, add group
                whileHover="hover"
                initial="rest"
                animate="rest"
                variants={cardHoverEffect} // Applied card hover effect
             >
                 <Card className="overflow-hidden rounded-lg shadow-sm border border-border transition-shadow duration-300 relative z-10"> {/* Added Card wrapper */}
                    <img
                        src={storyImageUrl}
                        alt="Modern aviation training classroom environment"
                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105" // Added hover scale
                        onError={handleImageError}
                        loading="lazy"
                    />
                 </Card>
             </motion.div>
          </motion.div>
        </motion.section>

        {/* Why Choose Us Section (The ATC Advantage) - Refactored with Cards */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
            <h2 className={cn("text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16", aviationPrimary)}> {/* Updated heading style */}
              The ATC Advantage
            </h2>
            {/* Added items-stretch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                {atcAdvantages.map((item, index) => (
                  <motion.div key={index} variants={itemVariants} className="flex"> {/* Added flex */}
                    <motion.div
                        className="relative h-full w-full group" // Added w-full
                        whileHover="hover"
                        initial="rest"
                        animate="rest"
                        variants={cardHoverEffect} // Applied hover effect
                    >
                       {/* Ensure Card takes full height */}
                       <Card className="bg-card w-full h-full flex flex-col text-center overflow-hidden rounded-lg shadow-sm border border-border transition-shadow duration-300 relative z-10 p-6">
                           <CardHeader className="p-0 mb-4 flex-shrink-0"> {/* Adjusted padding */}
                               <div className="mx-auto p-3 rounded-full bg-teal-100/70 dark:bg-teal-900/40 w-fit mb-3 transition-colors duration-300 group-hover:bg-teal-200/80 dark:group-hover:bg-teal-800/60"> {/* Icon style from Courses */}
                                   <item.icon className={cn("h-7 w-7", aviationSecondary)} /> {/* Adjusted icon size */}
                               </div>
                               <CardTitle className="text-foreground text-lg font-semibold">{item.title}</CardTitle> {/* Adjusted text size */}
                           </CardHeader>
                           <CardContent className="p-0 flex-grow">
                               <CardDescription className="text-foreground/80 text-sm leading-relaxed"> {/* Use CardDescription */}
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
          className="bg-gradient-to-br from-red-50/30 to-rose-50/30 dark:from-gray-800/40 dark:to-gray-900/40 rounded-xl p-8 md:p-12 border border-border/50 shadow-lg" // Enhanced styling similar to Courses feature section
        >
            <h2 className={cn("text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16", 'text-red-700 dark:text-red-400')}> {/* Adjusted heading color */}
                Say Goodbye To Traditional Hassles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto"> {/* Added items-stretch, gap-8 */}
               {traditionalHassles.map((hassle, index) => (
                   <motion.div key={index} variants={itemVariants} className="flex"> {/* Added flex */}
                       <motion.div
                           className="relative h-full w-full group"
                           whileHover="hover"
                           initial="rest"
                           animate="rest"
                           variants={cardHoverEffect} // Applied hover effect
                       >
                           <Card className="flex flex-col items-center text-center p-6 h-full bg-card rounded-lg shadow-sm border border-border transition-shadow duration-300 relative z-10"> {/* Applied consistent card styling */}
                              <div className="p-3 rounded-full bg-red-100/70 dark:bg-red-900/40 mb-3 transition-colors duration-300 group-hover:bg-red-200/80 dark:group-hover:bg-red-800/60"> {/* Consistent icon style */}
                                <hassle.icon className="h-7 w-7 text-red-600 dark:text-red-400" /> {/* Adjusted colors */}
                              </div>
                              <CardContent className="p-0 flex-grow flex items-center"> {/* Use CardContent, center text vertically */}
                                <CardDescription className="text-foreground/80 font-medium text-sm leading-snug">{hassle.text}</CardDescription> {/* Use CardDescription */}
                              </CardContent>
                           </Card>
                       </motion.div>
                   </motion.div>
               ))}
            </div>
            <motion.div
              variants={itemVariants} // Add animation
              className="text-center mt-12 md:mt-16"
            >
                <p className={cn("text-lg font-semibold", aviationPrimary)}> {/* Use primary color */}
                  Focus purely on mastering your ground subjects with ATC!
                </p>
            </motion.div>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
};

export default About;
