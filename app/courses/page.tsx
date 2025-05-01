"use client"
import React from 'react';
import {clsx} from 'clsx'
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
// Removed Button import if no longer directly needed, or kept if still used elsewhere
// import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// Added ArrowRight and Info icons (ArrowRight is already imported)
import { MicVocal, Plane, UserCheck, GraduationCap, CheckSquare, RadioTower, Briefcase, MessageCircle, Users, Clock, Award, Map, CloudSun, Gavel, Wrench, UsersRound, PhoneForwarded, ArrowRight, Info } from 'lucide-react';
import { BookDemoButton } from '@/components/shared/BookDemoButton';
import { UrgencyCTA } from '@/components/shared/UrgencyCTA';
import { TransparentButton } from '@/components/shared/TransparentButton'; // Import TransparentButton
import { cn } from '@/components/ui/utils'

// --- Configuration (Removed button style variables) ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';

const HERO_VIDEO_URL = "/placeholder-video.mp4"; // Replace with actual video URL if available
// const HERO_IMAGE_URL = "/Plane.webp";
const HERO_FALLBACK_IMAGE = "/Course-Img.webp";

// Specific Images from public/Courses folder
const NAV_IMAGE = "/Courses/Navigation.jpg";
const MET_IMAGE = "/Courses/Meteorology.jpg";
const REGS_IMAGE = "/Courses/ICAO regs.jpg";
const TECH_GEN_IMAGE = "/Courses/technical gen.webp";
const TECH_SPEC_IMAGE = "/Courses/technical specific.webp";
const RTR_IMAGE = "/Courses/rtr.webp";
const TYPE_RATING_IMAGE = "/Courses/TypeRatingPrep.webp";
const ONE_ON_ONE_IMAGE = "/Courses/one-on-one-classes.webp";
const INTERVIEW_PREP_IMAGE = "/HomePage/Hero4.webp";

// --- Animation Variants (Unchanged) ---
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

// --- Course Data (Unchanged) ---
const groundSchoolSubjects = [
  { icon: Map, title: "Air Navigation", description: "Mastering flight path calculations, chart reading, and navigational instruments.", image: NAV_IMAGE },
  { icon: CloudSun, title: "Meteorology", description: "Understanding atmospheric conditions, weather patterns, and forecasts.", image: MET_IMAGE },
  { icon: Gavel, title: "Air Regulations", description: "Knowledge of national (DGCA) and international aviation laws and procedures.", image: REGS_IMAGE },
  { icon: Wrench, title: "Technical General", description: "Fundamental principles of flight, aerodynamics, aircraft structures, and systems.", image: TECH_GEN_IMAGE },
  { icon: Plane, title: "Technical Specific", description: "In-depth study of specific aircraft types systems and performance.", image: TECH_SPEC_IMAGE },
];

const additionalServicesData = [
  { icon: RadioTower, title: "RTR(A) - Radio Telephony", description: "Specialized training to enhance communication skills for the RTR(A) license exam.", image: RTR_IMAGE, link: "/contact", learnMoreText: "Ace Communication" },
  { icon: Plane, title: "A320 & B737 Type Rating Prep", description: "Intensive preparation for type rating exams, including major airlines like IndiGo.", image: TYPE_RATING_IMAGE, link: "/contact", learnMoreText: "Prep for Type Rating" },
  { icon: UserCheck, title: "One-on-One Online Classes", description: "Personalized tutoring for CPL/ATPL subjects, tailored to your learning pace.", image: ONE_ON_ONE_IMAGE, link: "/contact", learnMoreText: "Get Personalised Coaching" },
  { icon: Briefcase, title: "Interview Preparation", description: "Targeted practice sessions to develop confidence for airline interviews.", image: INTERVIEW_PREP_IMAGE, link: "/contact", learnMoreText: "Ace Your Interview" },
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

  const offerEndDate = new Date();
  offerEndDate.setDate(offerEndDate.getDate() + 14);
  const formattedEndDate = offerEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section (Unchanged) */}
      <motion.section
        className="relative h-[50vh] md:h-[60vh] flex items-center justify-center text-center text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <video
            autoPlay loop muted playsInline
            className="object-cover absolute inset-0 z-0 w-full h-full"
            poster={HERO_FALLBACK_IMAGE}
        >
           <source src={HERO_VIDEO_URL} type="video/mp4" />
            Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,94,104,0.35)] to-[rgba(12,110,114,0.65)] z-10"></div>
        <motion.div
          className="relative z-20 p-6 max-w-4xl md:p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight leading-tight drop-shadow-md sm:text-5xl md:text-6xl">
            Your Flight Path Starts Here
          </h1>
          <p className="mx-auto max-w-2xl text-lg drop-shadow-md md:text-xl text-white/90">
            Comprehensive DGCA Ground School, Type Rating Prep, and Pilot Career Services.
          </p>
        </motion.div>
      </motion.section>

      {/* Main Content */}
      <main className="container flex-grow px-4 py-16 mx-auto space-y-20 sm:px-6 md:py-24 md:space-y-28">

        {/* Complete CPL/ATPL Ground Training Section */}
        <motion.section
           variants={sectionVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, amount: 0.1 }}
        >
          <div className="mb-12 text-center md:mb-16">
             <motion.h2 variants={itemVariants} className={clsx("mb-3 text-3xl font-bold md:text-4xl", aviationPrimary)}>Complete CPL/ATPL Ground Training</motion.h2>
             <motion.p variants={itemVariants} className="mx-auto max-w-3xl text-lg text-foreground/80">
                We provide in-depth training for all DGCA syllabus subjects, building a strong foundation for your aviation career.
             </motion.p>
          </div>

          <div className="grid grid-cols-1 gap-8 items-stretch mb-12 sm:grid-cols-2 lg:grid-cols-3">  
            {groundSchoolSubjects.map((subject, index) => (
              <motion.div key={index} variants={itemVariants} className="flex">
                 <motion.div className="relative w-full h-full group" whileHover="hover" initial="rest" animate="rest" variants={cardHoverEffect} >
                   <Card className="flex overflow-hidden relative z-10 flex-col w-full h-full rounded-lg border shadow-sm transition-shadow duration-300 bg-card border-border">
                      <CardHeader className="relative p-0">
                          <div className="overflow-hidden h-48">
                            <img
                                src={subject.image}
                                alt={subject.title}
                                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                onError={handleImageError}
                                loading="lazy"
                            />
                         </div>
                     </CardHeader>
                     <CardContent className="flex flex-col flex-grow p-5">
                        <div className="flex items-center mb-3 space-x-3">
                            <subject.icon className={clsx("flex-shrink-0 w-6 h-6", aviationSecondary)} />
                            <CardTitle className="text-lg font-semibold text-foreground">{subject.title}</CardTitle>
                        </div>
                        <CardDescription className="flex-grow text-sm text-foreground/80">
                          {subject.description}
                        </CardDescription>
                     </CardContent>
                      <CardFooter className="flex gap-3 justify-end p-5 pt-4 mt-auto border-t border-border/30">
                          <BookDemoButton
                             size="sm"
                             state={{ subject: `Demo Request: ${subject.title}`, courseName: subject.title }}
                           />
                       </CardFooter>
                   </Card>
                 </motion.div>
               </motion.div>
            ))}

            {/* Placeholder Contact Card - Updated Button */}
            <motion.div variants={itemVariants} className="flex">
                 <motion.div className="relative w-full h-full group" whileHover="hover" initial="rest" animate="rest" variants={cardHoverEffect} >
                    <Card className="flex overflow-hidden relative z-10 flex-col justify-center items-center p-6 w-full h-full text-center bg-gradient-to-br rounded-lg border border-dashed shadow-sm transition-shadow duration-300 from-teal-50/50 to-sky-50/50 dark:from-gray-800/60 dark:to-gray-900/60 border-border">
                       <div className="mb-4">
                          <PhoneForwarded className={clsx("w-10 h-10", aviationSecondary)} />
                       </div>
                       <CardTitle className="mb-2 text-lg font-semibold text-foreground">Have Questions?</CardTitle>
                       <CardDescription className="mb-4 text-sm text-foreground/80">
                          Contact us for details about courses or enrollment.
                       </CardDescription>
                       {/* Replaced Button with TransparentButton */}
                       <TransparentButton
                          href="/contact#contact-form"
                          icon={PhoneForwarded} // Or MessageCircle
                          label="Contact Us"
                        />
                    </Card>
                 </motion.div>
            </motion.div>

          </div>
        </motion.section>

         {/* Additional Training & Prep Services Section - Updated Button */}
        <motion.section
           variants={sectionVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, amount: 0.1 }}
        >
            <h2 className={clsx("mb-12 text-3xl font-bold text-center md:text-4xl md:mb-16", aviationPrimary)}>Additional Training & Prep Services</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-10 ">
                {additionalServicesData.map((service, index) => (
                    <motion.div key={index} variants={itemVariants}>
                        <motion.div className="relative h-full group" whileHover="hover" initial="rest" animate="rest" variants={cardHoverEffect} >
                            <Card className="flex overflow-hidden relative z-10 flex-col h-full rounded-lg border shadow-sm transition-shadow duration-300 bg-card sm:flex-row border-border">
                                <div className="flex-shrink-0 sm:w-1/3 aspect-video sm:aspect-auto">
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="object-cover w-full h-full"
                                        onError={handleImageError}
                                        loading="lazy"
                                    />
                                </div>
                                <div className="flex flex-col flex-grow p-5 sm:p-6 ">
                                    <CardHeader className="p-0 mb-2">
                                        <div className="flex items-center mb-2 space-x-2">
                                            <service.icon className={clsx("flex-shrink-0 w-5 h-5", aviationSecondary)} />
                                            <CardTitle className="text-xl font-semibold text-foreground">{service.title}</CardTitle>
                                        </div>
                                    </CardHeader>    
                                    <CardContent className="flex-grow p-0 mb-4 ">
                                        <CardDescription className="text-sm text-foreground/80">
                                            {service.description}
                                        </CardDescription>
                                    </CardContent>
                                    <CardFooter className="flex flex-col sm:flex-row sm:gap-3 p-0 mt-auto">
                                        <div className="flex-grow sm:flex-grow-0"> {/* This div is the fix */}
                                            {/* Replaced Button with TransparentButton */}
                                            <TransparentButton
                                                href={service.link}
                                                icon={ArrowRight} // Or Info icon
                                                label={service.learnMoreText}
                                                className="min-h-[40px] w-full sm:w-auto "
                                            />
                                        </div>
                                        <div className="flex-grow sm:flex-grow-0"> {/* This div is the fix */}
                                             <BookDemoButton
                                               size="sm"
                                               className="min-h-[40px] w-full sm:w-auto"
                                               state={{ subject: `Demo Request: ${service.title}`, courseName: service.title }}
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

        {/* Urgency CTA Section (Unchanged) */}
        <UrgencyCTA offerEndDate={offerEndDate} formattedEndDate={formattedEndDate} />

        {/* ATC Features Section (Unchanged) */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="p-8 bg-gradient-to-br rounded-xl border shadow-lg from-teal-50/30 to-sky-50/30 dark:from-gray-800/40 dark:to-gray-900/40 md:p-12 border-border/50"
        >
            <h2 className={clsx("mb-10 text-3xl font-bold text-center md:text-4xl", aviationPrimary)}>Why Train with ATC?</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 text-center sm:grid-cols-3 md:grid-cols-4">
                {atcFeaturesData.map((feature, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        className="flex flex-col items-center p-3 group" 
                    >
                         <div className="p-3 mb-3 rounded-full transition-colors duration-300 bg-teal-100/70 dark:bg-teal-900/40 group-hover:bg-teal-200/80 dark:group-hover:bg-teal-800/60">
                            <feature.icon className={clsx("w-7 h-7", aviationSecondary)} />
                        </div>
                        <h4 className="mb-1 text-sm font-semibold text-foreground">{feature.title}</h4>
                        <p className="text-xs text-foreground/70">{feature.description}</p>
                    </motion.div>
                ))}
            </div>
        </motion.section>

        {/* ATC Benefits Accordion Section (Unchanged) */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
            <h2 className={clsx("mb-10 text-3xl font-bold text-center md:text-4xl", aviationPrimary)}>Detailed Benefits</h2>
            <Accordion type="single" collapsible className="mx-auto w-full max-w-3xl">
                 {atcBenefitsData.map((item, index) => (
                    <motion.div key={index} variants={itemVariants}>
                        <AccordionItem value={`item-${index + 1}`} className="overflow-hidden mb-2 rounded-md border-b shadow-sm border-border/60 bg-card/40 dark:bg-card/60">
                            <AccordionTrigger className={cn("px-5 py-4 text-base font-medium text-left transition-colors sm:text-lg hover:no-underline hover:bg-teal-50/50 dark:hover:bg-teal-900/30", aviationSecondary)}>
                                {item.title}
                            </AccordionTrigger>
                            <AccordionContent className="px-5 pt-2 pb-5 text-sm sm:text-base text-foreground/80 bg-card/30 dark:bg-card/50">
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