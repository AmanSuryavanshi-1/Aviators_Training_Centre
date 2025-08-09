"use client"
import React, { useEffect } from 'react';
import {clsx} from 'clsx'
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MicVocal, Plane, UserCheck, GraduationCap, CheckSquare, RadioTower, Briefcase, MessageCircle, Users, Clock, Award, Map, CloudSun, Gavel, Wrench, UsersRound, PhoneForwarded, ArrowRight, Info, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { BookDemoButton } from '@/components/shared/BookDemoButton';
import { UrgencyCTA } from '@/components/shared/UrgencyCTA';
import { TransparentButton } from '@/components/shared/TransparentButton';
import { cn } from '@/components/ui/utils'
import Image from 'next/image';
import { commonVariants } from '@/lib/animations/easing';
// Note: SEO Metadata is now in metadata.ts

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

// Use consistent animation variants with proper easing
const { sectionVariants, itemVariants, cardHoverEffect } = commonVariants;

// --- Course Data (Unchanged) ---
const groundSchoolSubjects = [
{ id: "air-navigation", icon: Map, title: "Air Navigation", description: "Mastering flight path calculations, chart reading, and navigational instruments.", image: NAV_IMAGE },
{ id: "meteorology", icon: CloudSun, title: "Meteorology", description: "Understanding atmospheric conditions, weather patterns, and forecasts.", image: MET_IMAGE },
{ id: "air-regulations", icon: Gavel, title: "Air Regulations", description: "Knowledge of national (DGCA) and international aviation laws and procedures.", image: REGS_IMAGE },
{ id: "technical-general", icon: Wrench, title: "Technical General", description: "Fundamental principles of flight, aerodynamics, aircraft structures, and systems.", image: TECH_GEN_IMAGE },
  { id: "technical-specific", icon: Plane, title: "Technical Specific", description: "In-depth study of specific aircraft types systems and performance.", image: TECH_SPEC_IMAGE },
];

const additionalServicesData = [
{ id: "rtr-radio-telephony", icon: RadioTower, title: "RTR(A) - Radio Telephony", description: "Specialized training to enhance communication skills for the RTR(A) license exam.", image: RTR_IMAGE, link: "/contact", learnMoreText: "Ace Communication" },
{ id: "type-rating-prep", icon: Plane, title: "A320 & B737 Type Rating Prep", description: "Intensive preparation for type rating exams, including major airlines like IndiGo.", image: TYPE_RATING_IMAGE, link: "/contact", learnMoreText: "Prep for Type Rating" },
  { id: "one-on-one-classes", icon: UserCheck, title: "One-on-One Online Classes", description: "Personalized tutoring for CPL/ATPL subjects, tailored to your learning pace.", image: ONE_ON_ONE_IMAGE, link: "/contact", learnMoreText: "Get Coaching" },
  { id: "interview-prep", icon: Briefcase, title: "Interview Preparation", description: "Targeted practice sessions to develop confidence for airline interviews.", image: INTERVIEW_PREP_IMAGE, link: "/contact", learnMoreText: "Ace Your Interview" },
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
  // Auto-scroll functionality for hash-based navigation
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash.substring(1); // Remove the '#' from hash
      if (hash) {
        // Small delay to ensure DOM is rendered
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            // Smooth scroll to the element with offset for header
            const yOffset = -80; // Adjust based on your header height
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            
            window.scrollTo({
              top: y,
              behavior: 'smooth'
            });
            
            // Add a subtle highlight effect
            element.style.transform = 'scale(1.02)';
            element.style.transition = 'transform 0.3s ease-in-out';
            
            // Remove highlight after animation
            setTimeout(() => {
              element.style.transform = 'scale(1)';
            }, 1000);
          }
        }, 100);
      }
    };

    // Handle hash on initial load
    handleHashNavigation();

    // Handle hash changes (for single page navigation)
    window.addEventListener('hashchange', handleHashNavigation);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('hashchange', handleHashNavigation);
    };
  }, []);

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

  // Add JSON-LD Schema for SEO
  const jsonLd = {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Aviation Training Courses",
      "description": "Comprehensive DGCA Ground School, Type Rating Prep, and Pilot Career Services offered by Aviators Training Centre.",
      "itemListElement": [
        ...groundSchoolSubjects.map((subject, index) => ({
          "@type": "Course",
          "name": subject.title,
          "description": subject.description,
          "provider": {
            "@type": "Organization",
            "name": "Aviators Training Centre",
            "sameAs": "https://aviatorstrainingcentre.com"
          }
        })),
        ...additionalServicesData.map((service) => ({
          "@type": "Course",
          "name": service.title,
          "description": service.description,
          "provider": {
            "@type": "Organization",
            "name": "Aviators Training Centre",
            "sameAs": "https://aviatorstrainingcentre.com"
          }
        }))
      ]
    })
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* JSON-LD structured data added via script tag */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd}
      />
      <motion.section
        className="relative h-[40vh] sm:h-[45vh] md:h-[60vh] flex items-center justify-center text-center text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <video
            autoPlay loop muted playsInline
            className="absolute inset-0 z-0 object-cover w-full h-full"
            poster={HERO_FALLBACK_IMAGE}
        >
           <source src={HERO_VIDEO_URL} type="video/mp4" />
            Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,94,104,0.35)] to-[rgba(12,110,114,0.65)] z-10"></div>
        <motion.div
          className="relative z-20 max-w-4xl p-4 sm:p-6 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="mb-2 text-2xl font-extrabold leading-tight tracking-tight drop-shadow-md sm:mb-3 sm:text-4xl md:text-5xl lg:text-6xl">
            Your Flight Path Starts Here
          </h1>
          <p className="max-w-2xl mx-auto text-base drop-shadow-md sm:text-lg md:text-xl text-white/90">
            Comprehensive DGCA Ground School, Type Rating Prep, and Pilot Career Services.
          </p>
        </motion.div>
      </motion.section>

      {/* Main Content - Responsive Optimized */}
      <main className="container flex-grow px-4 py-10 mx-auto space-y-16 sm:px-6 sm:py-14 md:py-20 lg:py-24 md:space-y-20 lg:space-y-28">

        {/* Complete CPL/ATPL Ground Training Section */}
        <motion.section
           variants={sectionVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, amount: 0.1 }}
        >
          <div className="mb-12 text-center md:mb-16">
             <motion.h2 variants={itemVariants} className={clsx("mb-3 text-3xl font-bold md:text-4xl", aviationPrimary)}>Complete CPL/ATPL Ground Training</motion.h2>
             <motion.p variants={itemVariants} className="max-w-3xl mx-auto text-lg text-foreground/80">
                We provide in-depth training for all DGCA syllabus subjects, building a strong foundation for your aviation career.
             </motion.p>
          </div>

          <div className="grid items-stretch grid-cols-1 gap-6 mb-12 md:grid-cols-2 lg:grid-cols-3 sm:gap-8">  
            {groundSchoolSubjects.map((subject, index) => (
              <motion.div key={index} variants={itemVariants} className="flex">
                 <motion.div id={subject.id} className="relative w-full h-full group" whileHover="hover" initial="rest" animate="rest" variants={cardHoverEffect} >
                   <Card className="relative z-10 flex flex-col w-full h-full overflow-hidden transition-shadow duration-300 border rounded-lg shadow-sm bg-card border-border">
                      <CardHeader className="relative p-0">
                          <div className="relative h-40 overflow-hidden sm:h-48">
                            <Image
                                src={subject.image}
                                alt={subject.title}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={handleImageError}
                                loading="lazy"
                            />
                         </div>
                     </CardHeader>
                     <CardContent className="flex flex-col flex-grow p-4 sm:p-5">
                        <div className="flex items-center mb-2 space-x-3 sm:mb-3">
                            <subject.icon className={clsx("flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6", aviationSecondary)} />
                            <CardTitle className="text-base font-semibold sm:text-lg text-foreground">{subject.title}</CardTitle>
                        </div>
                        <CardDescription className="flex-grow text-xs sm:text-sm text-foreground/80">
                          {subject.description}
                        </CardDescription>
                        
                        {/* Internal Links to Related Blog Posts */}
                        {subject.title === "Technical General" && (
                          <div className="mt-3 p-3 bg-teal-50 rounded-lg border-l-4 border-teal-500 dark:bg-teal-900/20">
                            <h4 className="font-semibold text-teal-800 dark:text-teal-300 mb-2 text-xs">📚 Study Guide</h4>
                            <Link 
                              href="/blog/dgca-ground-school-technical-general-vs-specific"
                              className="inline-flex items-center text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 conversion-button"
                              data-conversion="true"
                              data-analytics-event="blog_link_click"
                              data-analytics-source="courses_page"
                            >
                              Technical General vs Specific Guide
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Link>
                          </div>
                        )}
                        
                        {subject.title === "Air Navigation" && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500 dark:bg-blue-900/20">
                            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 text-xs">✈️ Complete Guide</h4>
                            <Link 
                              href="/blog/dgca-cpl-complete-guide-2024"
                              className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 conversion-button"
                              data-conversion="true"
                              data-analytics-event="blog_link_click"
                              data-analytics-source="courses_page"
                            >
                              DGCA CPL Complete Guide 2024
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Link>
                          </div>
                        )}
                     </CardContent>
                      <CardFooter className="flex justify-end gap-2 p-4 pt-3 mt-auto border-t sm:gap-3 sm:p-5 sm:pt-4 border-border/30">
                          <BookDemoButton
                             size="sm"
                             className="min-h-[40px] w-full sm:w-auto"
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
                    <Card className="relative z-10 flex flex-col items-center justify-center w-full h-full p-4 overflow-hidden text-center transition-shadow duration-300 border border-dashed rounded-lg shadow-sm bg-gradient-to-br sm:p-6 from-teal-50/50 to-sky-50/50 dark:from-gray-800/60 dark:to-gray-900/60 border-border">
                       <div className="mb-3 sm:mb-4">
                          <PhoneForwarded className={clsx("w-8 h-8 sm:w-10 sm:h-10", aviationSecondary)} />
                       </div>
                       <CardTitle className="mb-1 text-base font-semibold sm:mb-2 sm:text-lg text-foreground">Have Questions?</CardTitle>
                       <CardDescription className="mb-3 text-xs sm:mb-4 sm:text-sm text-foreground/80">
                          Contact us for details about courses or enrollment.
                       </CardDescription>
                       {/* Responsive TransparentButton */}
                       <TransparentButton
                          href="/contact#contact-form"
                          icon={PhoneForwarded}
                          label="Contact Us"
                          className="min-h-[40px] w-full sm:w-auto"
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 sm:gap-8 lg:gap-10">
                {additionalServicesData.map((service, index) => (
                    <motion.div key={index} variants={itemVariants}>
                        <motion.div id={service.id} className="relative h-full group" whileHover="hover" initial="rest" animate="rest" variants={cardHoverEffect} >
                            <Card className="relative z-10 flex flex-col h-full overflow-hidden transition-shadow duration-300 border rounded-lg shadow-sm bg-card sm:flex-row border-border">
                                <div className="relative flex-shrink-0 h-48 sm:h-auto sm:w-1/3 aspect-video sm:aspect-auto">
                                    <Image
                                        src={service.image}
                                        alt={service.title}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className="object-cover"
                                        onError={handleImageError}
                                        loading="lazy"
                                    />
                                </div>
                                <div className="flex flex-col flex-grow p-4 sm:p-5 md:p-6">
                                    <CardHeader className="p-0 mb-2">
                                        <div className="flex items-center mb-2 space-x-2">
                                            <service.icon className={clsx("flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5", aviationSecondary)} />
                                            <CardTitle className="text-lg font-semibold sm:text-xl text-foreground">{service.title}</CardTitle>
                                        </div>
                                    </CardHeader>    
                                    <CardContent className="flex-grow p-0 mb-3 sm:mb-4">
                                        <CardDescription className="text-xs sm:text-sm text-foreground/80">
                                            {service.description}
                                        </CardDescription>
                                    </CardContent>
                                    <CardFooter className="flex flex-col gap-2 p-0 mt-auto sm:flex-row sm:gap-3">
                                        <div className="flex-grow sm:flex-grow-0"> 
                                            <TransparentButton
                                                href={service.link}
                                                icon={ArrowRight}
                                                label={service.learnMoreText}
                                                className="min-h-[40px] w-full sm:w-auto"
                                            />
                                        </div>
                                        <div className="flex-grow sm:flex-grow-0"> 
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

        {/* ATC Features Section - Responsive Optimized */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="p-5 border shadow-lg bg-gradient-to-br rounded-xl sm:p-8 from-teal-50/30 to-sky-50/30 dark:from-gray-800/40 dark:to-gray-900/40 md:p-12 border-border/50"
        >
            <h2 className={clsx("mb-6 text-2xl font-bold text-center sm:mb-10 sm:text-3xl md:text-4xl", aviationPrimary)}>Why Train with ATC?</h2>
            <div className="grid grid-cols-2 text-center gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-8 sm:grid-cols-3 md:grid-cols-4">
                {atcFeaturesData.map((feature, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        className="flex flex-col items-center p-2 sm:p-3 group" 
                    >
                         <div className="p-2 mb-2 transition-colors duration-300 rounded-full sm:p-3 sm:mb-3 bg-teal-100/70 dark:bg-teal-900/40 group-hover:bg-teal-200/80 dark:group-hover:bg-teal-800/60">
                            <feature.icon className={clsx("w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7", aviationSecondary)} />
                        </div>
                        <h4 className="mb-1 text-xs font-semibold sm:text-sm text-foreground">{feature.title}</h4>
                        <p className="text-xs text-foreground/70">{feature.description}</p>
                    </motion.div>
                ))}
            </div>
        </motion.section>

        {/* ATC Benefits Accordion Section - Responsive Optimized */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
            <h2 className={clsx("mb-6 text-2xl font-bold text-center sm:mb-10 sm:text-3xl md:text-4xl", aviationPrimary)}>Detailed Benefits</h2>
            <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
                 {atcBenefitsData.map((item, index) => (
                    <motion.div key={index} variants={itemVariants}>
                        <AccordionItem value={`item-${index + 1}`} className="mb-2 overflow-hidden border-b rounded-md shadow-sm border-border/60 bg-card/40 dark:bg-card/60">
                            <AccordionTrigger className={cn("px-4 py-3 text-sm font-medium text-left transition-colors sm:px-5 sm:py-4 sm:text-base md:text-lg hover:no-underline hover:bg-teal-50/50 dark:hover:bg-teal-900/30", aviationSecondary)}>
                                {item.title}
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pt-2 pb-4 text-xs sm:px-5 sm:pb-5 sm:text-sm md:text-base text-foreground/80 bg-card/30 dark:bg-card/50">
                                {item.content}
                            </AccordionContent>
                        </AccordionItem>
                     </motion.div>
                ))}
            </Accordion>
        </motion.section>

      </main>
    </div>
  );
};

export default Courses;
