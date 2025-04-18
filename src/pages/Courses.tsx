import React from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"; // Added CardDescription
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookMarked, MicVocal, Plane, UserCheck, GraduationCap, CheckSquare, RadioTower, Briefcase, MessageCircle, Users, Clock, BarChart, Award, Map, CloudSun, Gavel, Wrench, UsersRound, PhoneForwarded } from 'lucide-react'; // Added more specific icons, including PhoneForwarded
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { BookDemoButton } from '@/components/shared/BookDemoButton'; // Import the BookDemoButton

// --- Configuration ---
// Ensure these color variables match your tailwind.config.ts
const aviationPrimary = 'text-teal-700 dark:text-teal-300'; // Example primary color class
const aviationSecondary = 'text-teal-600 dark:text-teal-400'; // Example secondary color class
const aviationButtonBg = 'bg-teal-600 hover:bg-teal-700'; // Example button background
const aviationButtonDarkBg = 'dark:bg-teal-500 dark:hover:bg-teal-600'; // Example dark mode button background

const HERO_VIDEO_URL = "/placeholder-video.mp4"; // Replace with your actual video path in /public
const FALLBACK_IMAGE = "/HomePage/Hero5.webp"; // Generic fallback in /public if video doesn't loads

// Specific Images from public/Courses folder
const NAV_IMAGE = "/Courses/Navigation.jpg";
const MET_IMAGE = "/Courses/Meteorology.jpg";
const REGS_IMAGE = "/Courses/ICAO regs.jpg";
const TECH_GEN_IMAGE = "/Courses/technical gen.webp";
const TECH_SPEC_IMAGE = "/HomePage/Course3.webp"; // Using Course3 from HomePage folder
const RTR_IMAGE = "/Courses/rtr.webp";
const TYPE_RATING_IMAGE = "/HomePage/Course2.webp"; // Using Course2 from HomePage folder
const ONE_ON_ONE_IMAGE = "/HomePage/Hero5.webp"; // Using Hero5 from HomePage folder
const INTERVIEW_PREP_IMAGE = "/HomePage/Hero4.webp"; // Using Hero4 from HomePage folder

// --- Animation Variants ---
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

// --- Course Data ---
// Restructured based on user input
const groundSchoolSubjects = [
  {
    icon: Map,
    title: "Air Navigation",
    description: "Mastering flight path calculations, chart reading, and the use of navigational instruments for safe and efficient flight.",
    image: NAV_IMAGE,
  },
  {
    icon: CloudSun,
    title: "Meteorology",
    description: "Understanding atmospheric conditions, weather patterns, forecasts, and their impact on flight operations.",
    image: MET_IMAGE,
  },
  {
    icon: Gavel,
    title: "Air Regulations",
    description: "Comprehensive knowledge of national (DGCA) and international aviation laws, rules, and procedures.",
    image: REGS_IMAGE,
  },
  {
    icon: Wrench, // Changed icon
    title: "Technical General",
    description: "Exploring the fundamental principles of flight, aerodynamics, aircraft structures, engines, and systems.",
    image: TECH_GEN_IMAGE,
  },
  {
    icon: Plane, // Changed icon
    title: "Technical Specific",
    description: "In-depth study focused on the systems, performance, and handling characteristics of particular aircraft types.",
    image: TECH_SPEC_IMAGE, // Requires specific image per aircraft type if applicable
  },
];

const additionalServicesData = [
   {
        icon: RadioTower,
        title: "RTR(A) - Radio Telephony",
        description: "Master aviation communication protocols and phraseology required for the Radio Telephony Restricted (Aeronautical) license exam.",
        image: RTR_IMAGE,
        link: "/contact", // Or specific page
        learnMoreText: "Master Communication"
    },
    {
        icon: Plane, // Consider a more specific icon if available
        title: "A320 & B737 Type Rating Prep",
        description: "Affordable pre & post type rating guidance, covering previous exam questions and full preparation for major airline exams (Air India Express, IndiGo, Air India).",
        image: TYPE_RATING_IMAGE,
        link: "/contact",
        learnMoreText: "Prep for Type Rating" // Updated text
    },
    {
        icon: UserCheck, // Changed icon
        title: "One-on-One Online Classes",
        description: "Feel hesitant in batches? Get personalized online classes for all CPL and ATPL subjects, tailored specifically to your learning pace and needs.",
        image: ONE_ON_ONE_IMAGE,
        link: "/contact",
        learnMoreText: "Get Personalized Coaching"
    },
    {
        icon: Briefcase, // Changed icon
        title: "Interview Preparation",
        description: "Build confidence and prepare effectively for airline interviews with specialized English language practice and confidence-building sessions.",
        image: INTERVIEW_PREP_IMAGE,
        link: "/contact",
        learnMoreText: "Ace Your Interview"
    },
];

// --- Benefits/Features Data --- (Keeping existing ones, can be modified)
const atcFeaturesData = [
    { icon: Award, title: "High Success Rate", description: "Proven Exam Passing Record" }, // Updated wording
    { icon: UsersRound, title: "Airline Instructors", description: "Learn from Industry Experts" }, // Changed icon
    { icon: MicVocal, title: "Interview Prep", description: "Dedicated Guidance" },
    { icon: CheckSquare, title: "Thorough Mock Tests", description: "Be Exam Ready" }, // Changed icon
    { icon: MessageCircle, title: "24/7 Doubt Support", description: "Always Here to Help" }, // Updated wording
    { icon: Users, title: "Personalized Attention", description: "Focused Learning" }, // Updated wording
    { icon: Clock, title: "Flexible Timings", description: "Study On Your Schedule" },
    { icon: GraduationCap, title: "Structured Curriculum", description: "Comprehensive Syllabus Coverage" }, // Updated wording
];

const atcBenefitsData = [
    {
        title: "Why Choose Our Ground School?",
        content: "Our DGCA CPL & ATPL ground school programs offer a blend of experienced instruction, rigorous testing, and personalized support to ensure you master the syllabus and pass your exams with confidence. We focus on conceptual clarity and practical application across all required subjects."
    },
    {
        title: "The Advantage of Airline-Experienced Instructors",
        content: "Learn from pilots and engineers who have real-world airline experience. They provide invaluable insights into industry best practices, exam patterns, and what airlines look for in candidates, going beyond just the textbook knowledge."
    },
    {
        title: "How We Ensure High Success Rates",
        content: "Our methodology includes structured learning, frequent assessments based on DGCA patterns, detailed performance feedback, dedicated doubt-clearing sessions, and targeted preparation for airline screenings."
    },
     {
        title: "Comprehensive Support Services",
        content: "Beyond ground subjects, we offer specialized training for RTR(A), Type Rating preparation, personalized one-on-one classes, and interview coaching to fully support your journey to becoming a professional pilot."
    }
];

// --- Component ---
const Courses: React.FC = () => {

  // Function to handle image errors and load fallback
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== FALLBACK_IMAGE) { // Prevent infinite loop if fallback fails
        target.onerror = null; // Prevent potential infinite loop
        target.src = FALLBACK_IMAGE;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section - Keeping existing structure */}
      <motion.section
        className="relative h-[50vh] md:h-[60vh] flex items-center justify-center text-center text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <video
            autoPlay loop muted playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
            poster={FALLBACK_IMAGE} // Poster image while video loads
        >
           <source src={HERO_VIDEO_URL} type="video/mp4" />
            Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,94,104,0.35)] to-[rgba(12,110,114,0.65)] z-10"></div>
        <motion.div
          className="relative z-20 max-w-4xl p-6 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="drop-shadow-md text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-3">
            Your Flight Path Starts Here
          </h1>
          <p className="text-lg drop-shadow-md md:text-xl text-white/90 max-w-2xl mx-auto">
            Comprehensive DGCA Ground School, Type Rating Prep, and Pilot Career Services.
          </p>
        </motion.div>
      </motion.section>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-16 md:py-24 space-y-20 md:space-y-28">

        {/* Complete CPL/ATPL Ground Training Section */}
        <motion.section
           variants={sectionVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, amount: 0.1 }}
        >
          <div className="text-center mb-12 md:mb-16">
             <motion.h2 variants={itemVariants} className={cn("text-3xl md:text-4xl font-bold mb-3", aviationPrimary)}>Complete CPL/ATPL Ground Training</motion.h2>
             <motion.p variants={itemVariants} className="text-lg text-foreground/80 max-w-3xl mx-auto">
                We provide in-depth training for all subjects under the DGCA CPL and ATPL syllabus, ensuring you have the knowledge foundation for a successful aviation career.
             </motion.p>
          </div>

          {/* Grid for Ground School Subjects + Placeholder */}
          {/* Added items-stretch to help cards have same height */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 items-stretch">
            {groundSchoolSubjects.map((subject, index) => (
              <motion.div key={index} variants={itemVariants} className="flex"> {/* Added flex to make motion div take full height */}
                <motion.div
                    className="relative h-full w-full group" // Added w-full
                    whileHover="hover"
                    initial="rest"
                    animate="rest"
                    variants={cardHoverEffect}
                >
                  {/* Ensure Card takes full height */}
                  <Card className="bg-card w-full h-full flex flex-col overflow-hidden rounded-lg shadow-sm border border-border transition-shadow duration-300 relative z-10">
                     {/* Image Section - Fixed Height */}
                     <CardHeader className="p-0 relative">
                         {/* Fixed height container for the image */}
                         <div className="h-48 overflow-hidden"> {/* <-- FIXED HEIGHT ADDED HERE */}
                            <img
                                src={subject.image} // Use the image path from data
                                alt={subject.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" // object-cover is important
                                onError={handleImageError} // Fallback if image fails
                                loading="lazy"
                            />
                         </div>
                     </CardHeader>
                     {/* Content Section - flex-grow pushes content down */}
                     <CardContent className="p-5 flex-grow flex flex-col"> {/* Adjusted padding back, ensure flex-grow */}
                        <div className="flex items-center space-x-3 mb-3">
                            <subject.icon className={cn("w-6 h-6 flex-shrink-0", aviationSecondary)} />
                            <CardTitle className="text-lg font-semibold text-foreground">{subject.title}</CardTitle>
                        </div>
                        <CardDescription className="text-sm text-foreground/80 flex-grow"> {/* flex-grow on description */}
                          {subject.description}
                        </CardDescription>
                     </CardContent>
                      {/* Footer for Ground School Cards - Added Book Demo here too */}
                      <CardFooter className="p-5 mt-auto border-t border-border/30 pt-4 flex justify-end gap-3">
                          <BookDemoButton size="sm" />
                       </CardFooter>
                  </Card>
                </motion.div>
              </motion.div>
            ))}

            {/* Placeholder Card to fill the 6th spot */}
            <motion.div variants={itemVariants} className="flex"> {/* Added flex */}
                 <motion.div
                    className="relative h-full w-full group" // Added w-full
                    whileHover="hover"
                    initial="rest"
                    animate="rest"
                    variants={cardHoverEffect}
                 >
                    <Card className="bg-gradient-to-br from-teal-50/50 to-sky-50/50 dark:from-gray-800/60 dark:to-gray-900/60 w-full h-full flex flex-col items-center justify-center text-center overflow-hidden rounded-lg shadow-sm border border-dashed border-border transition-shadow duration-300 relative z-10 p-6">
                       <div className="mb-4">
                          <PhoneForwarded className={cn("w-10 h-10", aviationSecondary)} />
                       </div>
                       <CardTitle className="text-lg font-semibold text-foreground mb-2">Have Questions?</CardTitle>
                       <CardDescription className="text-sm text-foreground/80 mb-4">
                          Contact us for more details about our courses or enrollment process.
                       </CardDescription>
                       <Link to="/contact">
                           <Button variant="outline" className={cn("border-teal-500 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-300 dark:hover:bg-teal-900/30", "group-hover:border-teal-600 dark:group-hover:border-teal-300")}>
                               Contact Us
                           </Button>
                       </Link>
                    </Card>
                 </motion.div>
            </motion.div>

          </div>
           {/* Commented out the general Enroll Now button, as each card has a demo button */}
           {/* <motion.div variants={itemVariants} className="text-center">
                <h3 className="text-2xl font-semibold mb-4 text-foreground">Ready to Master the Syllabus?</h3>
                <Link to="/contact">
                    <Button size="lg" className={cn("min-h-[48px] transition duration-300 ease-in-out transform hover:scale-[1.03]", aviationButtonBg, aviationButtonDarkBg, "text-white")}>
                        Enroll Now
                    </Button>
                </Link>
            </motion.div> */}
        </motion.section>

         {/* Additional Training & Prep Services Section */}
        <motion.section
           variants={sectionVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, amount: 0.1 }}
        >
            <h2 className={cn("text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16", aviationPrimary)}>Additional Training & Prep Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10"> {/* Reduced to 2 columns for better info display */}
                {additionalServicesData.map((service, index) => (
                    <motion.div key={index} variants={itemVariants}>
                        <motion.div
                            className="relative h-full group"
                            whileHover="hover"
                            initial="rest"
                            animate="rest"
                            variants={cardHoverEffect}
                        >
                            <Card className="bg-card h-full flex flex-col sm:flex-row overflow-hidden rounded-lg shadow-sm border border-border transition-shadow duration-300 relative z-10">
                                {/* Image on the side (optional, adjust layout) */}
                                <div className="sm:w-1/3 flex-shrink-0 aspect-video sm:aspect-auto">
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="w-full h-full object-cover"
                                        onError={handleImageError}
                                        loading="lazy"
                                    />
                                </div>
                                <div className="flex flex-col flex-grow p-5">
                                    <CardHeader className="p-0 mb-2">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <service.icon className={cn("w-5 h-5 flex-shrink-0", aviationSecondary)} />
                                            <CardTitle className="text-xl font-semibold text-foreground">{service.title}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0 flex-grow mb-4">
                                        <CardDescription className="text-sm text-foreground/80">
                                            {service.description}
                                        </CardDescription>
                                    </CardContent>
                                    {/* --- Card Footer with Buttons --- */}
                                    <CardFooter className="p-0 mt-auto flex flex-wrap gap-3"> {/* Use flex-wrap and gap */}
                                        {/* Learn More Button */}
                                        <Link to={service.link} className="flex-grow sm:flex-grow-0"> {/* Allow grow on small screens */}
                                            <Button
                                                variant="outline"
                                                size="sm" // Standardize size
                                                className={cn("w-full sm:w-auto min-h-[40px] border-teal-500 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-300 dark:hover:bg-teal-900/30 transition duration-300", "group-hover:border-teal-600 dark:group-hover:border-teal-300")}
                                            >
                                                {service.learnMoreText || 'Learn More'}
                                            </Button>
                                        </Link>
                                        {/* Book Demo Button */}
                                        <div className="flex-grow sm:flex-grow-0"> {/* Allow grow on small screens */}
                                            <BookDemoButton size="sm" className="w-full sm:w-auto min-h-[40px]" />
                                        </div>
                                    </CardFooter>
                                    {/* --- End Card Footer --- */}
                                </div>
                            </Card>
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </motion.section>


        {/* ATC Features Section - Keeping existing structure, maybe update text */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="bg-gradient-to-br from-teal-50/30 to-sky-50/30 dark:from-gray-800/40 dark:to-gray-900/40 rounded-xl p-8 md:p-12 border border-border/50 shadow-lg" // Enhanced styling
        >
            <h2 className={cn("text-3xl md:text-4xl font-bold text-center mb-10", aviationPrimary)}>Why Train with ATC?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-8 text-center">
                {atcFeaturesData.map((feature, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        className="flex flex-col items-center p-3 group" // Added group
                    >
                         <div className="p-3 rounded-full bg-teal-100/70 dark:bg-teal-900/40 mb-3 transition-colors duration-300 group-hover:bg-teal-200/80 dark:group-hover:bg-teal-800/60">
                            <feature.icon className={cn("h-7 w-7", aviationSecondary)} />
                        </div>
                        <h4 className="text-sm font-semibold text-foreground mb-1">{feature.title}</h4>
                        <p className="text-xs text-foreground/70">{feature.description}</p>
                    </motion.div>
                ))}
            </div>
            {/* <p className="text-xs text-center mt-6 text-foreground/60">*Success rates based on historical student data. Individual results may vary.</p> */}
        </motion.section>


        {/* ATC Benefits Accordion Section - Keeping existing structure */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
            <h2 className={cn("text-3xl md:text-4xl font-bold text-center mb-10", aviationPrimary)}>Detailed Benefits</h2>
            <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
                 {atcBenefitsData.map((item, index) => (
                     <motion.div key={index} variants={itemVariants}>
                        <AccordionItem value={`item-${index + 1}`} className="border-b border-border/60 mb-2 rounded-md overflow-hidden bg-card/40 dark:bg-card/60 shadow-sm">
                            <AccordionTrigger className={cn("text-left text-base sm:text-lg font-medium hover:no-underline px-5 py-4 hover:bg-teal-50/50 dark:hover:bg-teal-900/30 transition-colors", aviationSecondary)}>
                                {item.title}
                            </AccordionTrigger>
                            <AccordionContent className="text-sm sm:text-base text-foreground/80 pb-5 px-5 pt-2 bg-card/30 dark:bg-card/50"> {/* Added background for content */}
                                {item.content}
                            </AccordionContent>
                        </AccordionItem>
                     </motion.div>
                ))}
            </Accordion>
        </motion.section>


      </main>

      <Footer />
    </div>
  );
};

export default Courses;
