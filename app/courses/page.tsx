// Added "use client" directive for motion and potentially other client-side needs
"use client";

import React from 'react';
// Removed Header and Footer imports
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MicVocal, Plane, UserCheck, GraduationCap, CheckSquare, RadioTower, Briefcase, MessageCircle, Users, Clock, Award, Map, CloudSun, Gavel, Wrench, UsersRound, PhoneForwarded, ArrowRight, Info } from 'lucide-react';
// Removed Link import from react-router-dom
import { cn } from "@/lib/utils";
import { BookDemoButton } from '@/components/shared/BookDemoButton';
import { UrgencyCTA } from '@/components/shared/UrgencyCTA';
import { TransparentButton } from '@/components/shared/TransparentButton';

// --- Configuration ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';

const HERO_VIDEO_URL = "/placeholder-video.mp4"; // Replace with actual video URL if available
const HERO_FALLBACK_IMAGE = "/Plane4.png";

// Specific Images from public/Courses folder
const NAV_IMAGE = "/Courses/Navigation.jpg";
const MET_IMAGE = "/Courses/Meteorology.jpg";
const REGS_IMAGE = "/Courses/ICAO regs.jpg";
const TECH_GEN_IMAGE = "/Courses/technical gen.webp";
const TECH_SPEC_IMAGE = "/Courses/technical specific.webp";
const RTR_IMAGE = "/Courses/rtr.webp";
const TYPE_RATING_IMAGE = "/HomePage/Course2.webp";
const ONE_ON_ONE_IMAGE = "/Courses/one-on-one-classes.webp";
const INTERVIEW_PREP_IMAGE = "/HomePage/Hero4.webp";

// --- Animation Variants (Keep your existing variants) ---
const sectionVariants = { /* ... */ };
const itemVariants = { /* ... */ };
const cardHoverEffect = { /* ... */ };


// --- Course Data ---
const groundSchoolSubjects = [
  { icon: Map, title: "Air Navigation", description: "Mastering flight path calculations, chart reading, and navigational instruments.", image: NAV_IMAGE },
  { icon: CloudSun, title: "Meteorology", description: "Understanding atmospheric conditions, weather patterns, and forecasts.", image: MET_IMAGE },
  { icon: Gavel, title: "Air Regulations", description: "Knowledge of national (DGCA) and international aviation laws and procedures.", image: REGS_IMAGE },
  { icon: Wrench, title: "Technical General", description: "Fundamental principles of flight, aerodynamics, aircraft structures, and systems.", image: TECH_GEN_IMAGE },
  { icon: Plane, title: "Technical Specific", description: "In-depth study of specific aircraft types systems and performance.", image: TECH_SPEC_IMAGE },
];

const additionalServicesData = [
   { icon: RadioTower, title: "RTR(A) - Radio Telephony", description: "Master aviation communication protocols for the RTR(A) license exam.", image: RTR_IMAGE, link: "/contact", learnMoreText: "Master Communication" },
   { icon: Plane, title: "A320 & B737 Type Rating Prep", description: "Guidance and preparation for major airline type rating exams (IndiGo, Air India, etc.).", image: TYPE_RATING_IMAGE, link: "/contact", learnMoreText: "Prep for Type Rating" },
   { icon: UserCheck, title: "One-on-One Online Classes", description: "Personalized online classes for all CPL/ATPL subjects tailored to your pace.", image: ONE_ON_ONE_IMAGE, link: "/contact", learnMoreText: "Get Personalized Coaching" },
   { icon: Briefcase, title: "Interview Preparation", description: "Build confidence and skills for airline interviews with specialized practice.", image: INTERVIEW_PREP_IMAGE, link: "/contact", learnMoreText: "Ace Your Interview" },
];

const atcFeaturesData = [
    { icon: Award, title: "High Success Rate", description: "Proven Exam Passing Record" },
    { icon: UsersRound, title: "Airline Instructors", description: "Learn from Industry Experts" },
    { icon: MicVocal, title: "Interview Prep", description: "Dedicated Guidance" },
    { icon: CheckSquare, title: "Thorough Mock Tests", description: "Be Exam Ready" },
    { icon: MessageCircle, title: "24/7 Doubt Support", description: "Always Here to Help" },
    { icon: Users, title: "Personalized Attention", description: "Focused Learning" },
    { icon: Clock, title: "Flexible Timings", description: "Study On Your Schedule" },
    { icon: GraduationCap, title: "Structured Curriculum", description: "Comprehensive Syllabus Coverage" },
];

const atcBenefitsData = [
    { title: "Why Choose Our Ground School?", content: "Our programs blend experienced instruction, rigorous testing, and personalized support to ensure exam success. We focus on conceptual clarity and practical application." },
    { title: "The Advantage of Airline-Experienced Instructors", content: "Learn from pilots and engineers with real-world airline experience, gaining invaluable insights beyond textbook knowledge." },
    { title: "How We Ensure High Success Rates", content: "Our methodology includes structured learning, frequent DGCA-pattern assessments, detailed feedback, doubt-clearing, and targeted airline screening prep." },
    { title: "Comprehensive Support Services", content: "Beyond ground subjects, we offer specialized RTR(A), Type Rating prep, one-on-one classes, and interview coaching." }
];

// --- Component ---
const Courses: React.FC = () => {

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const target = e.target as HTMLImageElement;
        if (target.src !== HERO_FALLBACK_IMAGE) {
            target.onerror = null;
            target.src = HERO_FALLBACK_IMAGE;
        }
    };


  // NOTE: UrgencyCTA might use useState/useEffect - Ensure it's client component compatible
  const offerEndDate = new Date();
  offerEndDate.setDate(offerEndDate.getDate() + 14); // Example: 14 days from now
  const formattedEndDate = offerEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Removed surrounding div
  return (
    <>
      {/* Hero Section */}
      <motion.section
        className="relative h-[50vh] md:h-[60vh] flex items-center justify-center text-center text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <video
            autoPlay loop muted playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
            poster={HERO_FALLBACK_IMAGE}
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
          // Add variants
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, amount: 0.1 }}
        >
          <div className="text-center mb-12 md:mb-16">
             <motion.h2 /* Add variants */ className={cn("text-3xl md:text-4xl font-bold mb-3", aviationPrimary)}>Complete CPL/ATPL Ground Training</motion.h2>
             <motion.p /* Add variants */ className="text-lg text-foreground/80 max-w-3xl mx-auto">
                We provide in-depth training for all DGCA syllabus subjects, building a strong foundation for your aviation career.
             </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 items-stretch">
            {groundSchoolSubjects.map((subject, index) => (
              <motion.div key={index} /* Add variants */ className="flex">
                 <motion.div className="relative h-full w-full group" whileHover="hover" initial="rest" animate="rest" /* Add variants */ >
                   <Card className="bg-card w-full h-full flex flex-col overflow-hidden rounded-lg shadow-sm border border-border transition-shadow duration-300 relative z-10">
                      <CardHeader className="p-0 relative">
                          <div className="h-48 overflow-hidden">
                            {/* Consider Next/Image */}
                            <img
                                src={subject.image}
                                alt={subject.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={handleImageError}
                                loading="lazy"
                            />
                         </div>
                     </CardHeader>
                     <CardContent className="p-5 flex-grow flex flex-col">
                        <div className="flex items-center space-x-3 mb-3">
                            <subject.icon className={cn("w-6 h-6 flex-shrink-0", aviationSecondary)} />
                            <CardTitle className="text-lg font-semibold text-foreground">{subject.title}</CardTitle>
                        </div>
                        <CardDescription className="text-sm text-foreground/80 flex-grow">
                          {subject.description}
                        </CardDescription>
                     </CardContent>
                      <CardFooter className="p-5 mt-auto border-t border-border/30 pt-4 flex justify-end gap-3">
                          {/* BookDemoButton needs to be updated to use query params */}
                          <BookDemoButton
                             size="sm"
                             // Pass data for query params instead of state
                             queryParams={{ subject: `Demo Request: ${subject.title}`, courseName: subject.title }}
                           />
                       </CardFooter>
                   </Card>
                 </motion.div>
               </motion.div>
            ))}

            {/* Placeholder Contact Card */} 
            <motion.div /* Add variants */ className="flex">
                 <motion.div className="relative h-full w-full group" whileHover="hover" initial="rest" animate="rest" /* Add variants */ >
                    <Card className="bg-gradient-to-br from-teal-50/50 to-sky-50/50 dark:from-gray-800/60 dark:to-gray-900/60 w-full h-full flex flex-col items-center justify-center text-center overflow-hidden rounded-lg shadow-sm border border-dashed border-border transition-shadow duration-300 relative z-10 p-6">
                       <div className="mb-4">
                          <PhoneForwarded className={cn("w-10 h-10", aviationSecondary)} />
                       </div>
                       <CardTitle className="text-lg font-semibold text-foreground mb-2">Have Questions?</CardTitle>
                       <CardDescription className="text-sm text-foreground/80 mb-4">
                          Contact us for details about courses or enrollment.
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

         {/* Additional Training & Prep Services Section */} 
        <motion.section
          // Add variants
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, amount: 0.1 }}
        >
            <h2 className={cn("text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16", aviationPrimary)}>Additional Training & Prep Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                {additionalServicesData.map((service, index) => (
                    <motion.div key={index} /* Add variants */>
                        <motion.div className="relative h-full group" whileHover="hover" initial="rest" animate="rest" /* Add variants */ >
                            <Card className="bg-card h-full flex flex-col sm:flex-row overflow-hidden rounded-lg shadow-sm border border-border transition-shadow duration-300 relative z-10">
                                <div className="sm:w-1/3 flex-shrink-0 aspect-video sm:aspect-auto">
                                    {/* Consider Next/Image */}
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
                                    <CardFooter className="p-0 mt-auto flex flex-wrap gap-3">
                                        <TransparentButton
                                            href={service.link}
                                            icon={ArrowRight}
                                            label={service.learnMoreText || 'Learn More'}
                                        />
                                        <div className="flex-grow sm:flex-grow-0">
                                             {/* BookDemoButton needs to be updated to use query params */}
                                             <BookDemoButton
                                               size="sm"
                                               className="w-full sm:w-auto min-h-[40px]"
                                               // Pass data for query params instead of state
                                               queryParams={{ subject: `Demo Request: ${service.title}`, courseName: service.title }}
                                             />
                                        </div>
                                    </CardFooter>
                                </div>
                            </Card>
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </motion.section>

        {/* Urgency CTA Section */}
        <UrgencyCTA offerEndDate={offerEndDate} formattedEndDate={formattedEndDate} />

        {/* ATC Features Section */} 
        <motion.section
          // Add variants
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="bg-gradient-to-br from-teal-50/30 to-sky-50/30 dark:from-gray-800/40 dark:to-gray-900/40 rounded-xl p-8 md:p-12 border border-border/50 shadow-lg"
        >
            <h2 className={cn("text-3xl md:text-4xl font-bold text-center mb-10", aviationPrimary)}>Why Train with ATC?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-8 text-center">
                {atcFeaturesData.map((feature, index) => (
                    <motion.div
                        key={index}
                        /* Add variants */
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

        {/* ATC Benefits Accordion Section */} 
        <motion.section
          // Add variants
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
            <h2 className={cn("text-3xl md:text-4xl font-bold text-center mb-10", aviationPrimary)}>Detailed Benefits</h2>
            <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
                 {atcBenefitsData.map((item, index) => (
                     <motion.div key={index} /* Add variants */>
                        <AccordionItem value={`item-${index + 1}`} className="border-b border-border/60 mb-2 rounded-md overflow-hidden bg-card/40 dark:bg-card/60 shadow-sm">
                            <AccordionTrigger className={cn("text-left text-base sm:text-lg font-medium hover:no-underline px-5 py-4 hover:bg-teal-50/50 dark:hover:bg-teal-900/30 transition-colors", aviationSecondary)}>
                                {item.title}
                            </AccordionTrigger>
                            <AccordionContent className="text-sm sm:text-base text-foreground/80 pb-5 px-5 pt-2 bg-card/30 dark:bg-card/50">
                                {item.content}
                            </AccordionContent>
                        </AccordionItem>
                     </motion.div>
                ))}
            </Accordion>
        </motion.section>

      </main>
      {/* Footer is rendered by layout.tsx */}
    </>
  );
};

export default Courses;
