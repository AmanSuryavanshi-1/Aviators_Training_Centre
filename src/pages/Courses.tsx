import React from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookMarked, MicVocal, Plane, UserCheck, GraduationCap, CheckSquare, RadioTower, Briefcase, MessageCircle, Users, Clock, BarChart, Award } from 'lucide-react'; // Added more icons
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";

// --- Configuration ---
// Define aviation colors (ensure these are in your tailwind.config.ts)
// Example:
// colors: {
//   'aviation-primary': '#075E68',
//   'aviation-secondary': '#0C6E72',
//   'aviation-accent': '#...', // Add other colors if needed
// }

const HERO_VIDEO_URL = "/placeholder-video.mp4"; // Replace with your actual video path in /public
const CPL_IMAGE = "/Course1.webp"; // Replace with your CPL image path in /public
const ATPL_IMAGE = "/Course2.webp"; // Replace with your ATPL image path in /public
const TYPE_RATING_IMAGE = "/Course3.webp"; // Replace with your Type Rating image path in /public
const RTR_IMAGE = "/rtr.webp"; // Replace with your RTR image path in /public
const INTERVIEW_PREP_IMAGE = "/public/placeholder.svg"; // Replace if you have one
const ONE_ON_ONE_IMAGE = "/public/placeholder.svg"; // Replace if you have one
const FALLBACK_IMAGE = "/placeholder.svg"; // Generic fallback in /public

// --- Animation Variants ---
const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut", staggerChildren: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const cardHoverEffect = {
  rest: { y: 0, boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" },
  hover: { y: -6, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.15)", transition: { duration: 0.3, ease: "circOut" } }
};

// --- Data ---
const coursesData = [
    {
        title: "Commercial Pilot License (CPL) Ground School",
        image: CPL_IMAGE,
        fallbackImage: FALLBACK_IMAGE,
        descriptionPoints: [
            "Covers all DGCA syllabus subjects.",
            "Experienced instructors.",
            "Regular mock tests & feedback.",
            "Flexible batch timings.",
        ],
        link: "/contact" // Or a specific course page link
    },
    {
        title: "Airline Transport Pilot License (ATPL) Ground School",
        image: ATPL_IMAGE,
        fallbackImage: FALLBACK_IMAGE,
        descriptionPoints: [
            "Advanced aviation theory.",
            "Complex aircraft systems.",
            "Performance and loading.",
            "Airline-oriented preparation.",
        ],
        link: "/contact"
    },
    {
        title: "A320/B737 Type Rating Prep",
        image: TYPE_RATING_IMAGE,
        fallbackImage: FALLBACK_IMAGE,
        descriptionPoints: [
            "Pre & post type rating support.",
            "Focus on airline exam patterns.",
            "Covers AIX, IndiGo, Air India etc.",
            "Affordable & effective.",
        ],
        link: "/contact"
    },
     {
        title: "RTR(A) - Radio Telephony",
        image: RTR_IMAGE,
        fallbackImage: FALLBACK_IMAGE,
        descriptionPoints: [
            "Master aviation communication.",
            "Prepare for RTR(A) license exam.",
            "Clear and concise delivery.",
            "Practice sessions included.",
        ],
        link: "/contact"
    },
    {
        title: "One-on-One Classes",
        image: ONE_ON_ONE_IMAGE,
        fallbackImage: FALLBACK_IMAGE,
        descriptionPoints: [
            "Personalized CPL/ATPL coaching.",
            "Tailored to your learning pace.",
            "Address specific weak areas.",
            "Flexible online scheduling.",
        ],
        link: "/contact"
    },
    {
        title: "Airline Interview Preparation",
        image: INTERVIEW_PREP_IMAGE,
        fallbackImage: FALLBACK_IMAGE,
        descriptionPoints: [
            "Build confidence & communication skills.",
            "Technical & HR interview practice.",
            "Grooming and etiquette guidance.",
            "Mock interview sessions.",
        ],
        link: "/contact"
    },
];

const atcFeaturesData = [
    { icon: Award, title: "Guaranteed Passing*", description: "95% Success Rate" },
    { icon: UserCheck, title: "Airline Instructors", description: "Industry Experts" },
    { icon: MicVocal, title: "Interview Prep", description: "Ace Your Interviews" },
    { icon: BookMarked, title: "Comprehensive Mock Tests", description: "Exam Ready" },
    { icon: MessageCircle, title: "24/7 Doubt Support", description: "Always Available" },
    { icon: Users, title: "Personalized Attention", description: "Small Batch Sizes" },
    { icon: Clock, title: "Flexible Timings", description: "Study On Your Schedule" },
    { icon: GraduationCap, title: "Proven Track Record", description: "Success Stories" },
];

const atcBenefitsData = [
    {
        title: "Why Choose Our Ground School?",
        content: "Our DGCA CPL & ATPL ground school programs offer a blend of experienced instruction, rigorous testing, and personalized support to ensure you master the syllabus and pass your exams with confidence. We focus on conceptual clarity and practical application."
    },
    {
        title: "The Advantage of Airline-Experienced Instructors",
        content: "Learn from pilots and engineers who have real-world airline experience. They provide invaluable insights into industry best practices, exam patterns, and what airlines look for in candidates, going beyond just the textbook knowledge."
    },
    {
        title: "How We Ensure High Success Rates",
        content: "Our methodology includes structured learning, frequent assessments, detailed performance feedback, doubt-clearing sessions, and targeted preparation for specific airline exams. *'Guaranteed Passing' refers to our commitment to support students until they pass, subject to terms."
    },
    {
        title: "Flexible Learning Options",
        content: "We understand the demanding schedules of aspiring pilots. We offer flexible batch timings, online class options, and recorded sessions (where applicable) to fit your lifestyle."
    }
];


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

      {/* Hero Section with Video Background */}
      <motion.section
        className="relative h-[50vh] md:h-[60vh] flex items-center justify-center text-center text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Video Background */}
        <video
            autoPlay
            loop
            muted
            playsInline // Important for mobile playback
            className="absolute inset-0 w-full h-full object-cover z-0"
            poster={FALLBACK_IMAGE} // Poster image while video loads
        >
           <source src={HERO_VIDEO_URL} type="video/mp4" />
            Your browser does not support the video tag.
        </video>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,94,104,0.75)] to-[rgba(12,110,114,0.75)] z-10"></div>

        {/* Content */}
        <motion.div
          className="relative z-20 max-w-4xl p-6 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-3">
            Elevate Your Aviation Career
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Comprehensive ground school, type rating preparation, and career support designed for your success.
          </p>
        </motion.div>
      </motion.section>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-16 md:py-24 space-y-20 md:space-y-28">

        {/* Course Grid Section */}
        <motion.section
           variants={sectionVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, amount: 0.1 }} // Trigger when 10% is visible
        >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-aviation-primary dark:text-sky-300">Explore Our Training Programs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {coursesData.map((course, index) => (
                    <motion.div key={index} variants={itemVariants}>
                        <motion.div
                            className="relative h-full"
                            whileHover="hover"
                            initial="rest"
                            animate="rest"
                            variants={cardHoverEffect}
                        >
                            {/* Optional: Gradient Border on Hover */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-aviation-primary to-aviation-secondary rounded-lg opacity-0 motion-safe:group-hover:opacity-75 transition duration-300 blur"></div>

                            <Card className="bg-card h-full flex flex-col overflow-hidden rounded-lg shadow-sm border border-border transition-shadow duration-300 relative z-10 group">
                                <CardHeader className="p-0 relative">
                                    <div className="aspect-w-16 aspect-h-9"> {/* Maintain aspect ratio */}
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            onError={handleImageError}
                                            loading="lazy" // Lazy load images
                                        />
                                     </div>
                                </CardHeader>
                                <CardContent className="p-5 flex flex-col flex-grow">
                                    <CardTitle className="text-xl font-semibold text-foreground mb-3">{course.title}</CardTitle>
                                    <ul className="space-y-1.5 text-sm text-foreground/80 list-disc list-inside mb-4 flex-grow">
                                        {course.descriptionPoints.map((point, pIndex) => (
                                            <li key={pIndex}>{point}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter className="p-5 pt-0 mt-auto"> {/* Ensure footer is at bottom */}
                                     <Link to={course.link} className="w-full">
                                        <Button
                                            variant="default"
                                            className="w-full bg-aviation-primary hover:bg-aviation-secondary dark:bg-sky-600 dark:hover:bg-sky-700 text-white min-h-[48px] transition duration-300 ease-in-out transform group-hover:scale-[1.02]" // Ensure min height for touch targets
                                        >
                                            Learn More
                                        </Button>
                                     </Link>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </motion.section>

        {/* ATC Features Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="bg-gradient-to-br from-aviation-primary/5 to-aviation-secondary/10 dark:from-gray-800/30 dark:to-gray-900/30 rounded-xl p-8 md:p-12 border border-border/50 shadow-md"
        >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-aviation-primary dark:text-sky-300">Why Train with ATC?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-8 text-center">
                {atcFeaturesData.map((feature, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        className="flex flex-col items-center p-3 bg-card/50 dark:bg-card/70 rounded-lg hover:bg-card transition duration-200"
                    >
                        <feature.icon className="h-8 w-8 mb-3 text-aviation-secondary dark:text-sky-400" />
                        <h4 className="text-sm font-semibold text-foreground mb-1">{feature.title}</h4>
                        <p className="text-xs text-foreground/70">{feature.description}</p>
                    </motion.div>
                ))}
            </div>
             <p className="text-xs text-center mt-6 text-foreground/60">*Guarantee subject to terms and conditions regarding attendance and participation.</p>
        </motion.section>


        {/* ATC Benefits Accordion Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-aviation-primary dark:text-sky-300">Detailed Benefits</h2>
            <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
                 {atcBenefitsData.map((item, index) => (
                     <motion.div key={index} variants={itemVariants}>
                        <AccordionItem value={`item-${index + 1}`} className="border-b border-border/60">
                            <AccordionTrigger className="text-left text-lg font-medium hover:text-aviation-secondary dark:hover:text-sky-400 py-4">
                                {item.title}
                            </AccordionTrigger>
                            <AccordionContent className="text-base text-foreground/80 pb-4 px-1">
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
