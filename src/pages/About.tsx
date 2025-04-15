import React from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Import Archive icon
import { Target, Users, Telescope, Heart, MessageSquare, UserCheck, Clock, DollarSign, UserX, MessageCircleQuestion, MapPin, Home, BadgeDollarSign, ArrowRight, Archive } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";

// Updated Placeholders with new Unsplash URLs
const aboutHeroUrl = "https://images.unsplash.com/photo-1484603249447-659936a09819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"; // Cockpit view
const storyImageUrl = "https://images.unsplash.com/photo-1559166631-ef208440a05e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"; // Modern classroom/study

// Animation Variants (consistent with previous definitions)
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } }
};

const cardHoverVariants = {
  initial: { scale: 1, y: 0, boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' },
  hover: {
    scale: 1.03,
    y: -5,
    boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.15)',
    transition: { duration: 0.3, type: "spring", stiffness: 300, damping: 20 }
  }
};

// Updated Data for the "Say Goodbye" section with 6 items
const traditionalHassles = [
    { icon: UserX, text: "Large, impersonal batches" },
    { icon: MessageCircleQuestion, text: "Hesitation to ask questions" },
    { icon: MapPin, text: "Travel time & costs for classes" },
    { icon: Home, text: "Flat/PG rental costs" },
    { icon: BadgeDollarSign, text: "High traditional coaching fees" },
    { icon: Archive, text: "Outdated study materials" } // Added 6th item
];


const About: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />

      {/* Page Header */}
      <motion.section
        className="relative h-[45vh] flex items-center justify-center text-center text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={aboutHeroUrl}
          alt="View from an aircraft cockpit"
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ filter: 'brightness(0.5)' }}
        />
        <motion.div
          className="relative z-10 max-w-4xl p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, type: "spring", stiffness: 100 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold leading-tight drop-shadow-md">About Aviators Training Centre</h1>
          <p className="text-lg md:text-xl text-foreground/85 mt-4 max-w-2xl mx-auto drop-shadow-sm">
            Empowering aspiring pilots with focused ground training to conquer DGCA exams and launch successful aviation careers.
          </p>
        </motion.div>
      </motion.section>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-16 md:py-24 space-y-24">

        {/* Our Story / Mission Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center"
        >
          <motion.div variants={itemVariants} className="space-y-5">
            <h2 className="text-3xl md:text-4xl font-bold text-aviation-primary dark:text-aviation-tertiary">Who We Are</h2>
            <p className="text-foreground/75 leading-relaxed">
              Aviators Training Centre (ATC) is a premier ground school specializing in comprehensive preparation for the DGCA CPL and ATPL examinations. Founded by experienced aviation professionals, we recognized the need for a more focused, efficient, and student-centric approach to ground training.
            </p>
             <p className="text-foreground/75 leading-relaxed">
               Our core mission is to deliver top-tier, professional pilot training programs that build a rock-solid foundation of theoretical knowledge, essential for a safe and successful career in the skies. We're passionate about helping you transform your aviation dreams into reality.
            </p>
             <Link to="/contact">
                <Button size="lg" variant="secondary" className="mt-4 inline-flex items-center gap-2 group">
                    Contact Us
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
             </Link>
          </motion.div>
          <motion.div variants={itemVariants} whileHover="hover" initial="initial">
             <motion.img
                variants={cardHoverVariants}
                src={storyImageUrl}
                alt="Modern aviation training classroom environment"
                className="rounded-lg shadow-lg w-full h-auto object-cover transition-all duration-300"
             />
          </motion.div>
        </motion.section>

        {/* Why Choose Us Section (The ATC Advantage) */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-aviation-primary dark:text-aviation-tertiary">The ATC Advantage</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {[
                { icon: UserCheck, title: "Personalized Coaching", description: "Tailored guidance matching your learning style for optimal understanding." },
                { icon: Clock, title: "Flexible Scheduling", description: "Study at your own pace with adaptable online class timings." },
                { icon: MessageSquare, title: "24/7 Doubt-Clearing", description: "Never get stuck – access round-the-clock support from experts." },
                { icon: Users, title: "Expert Faculty", description: "Learn crucial concepts from experienced, airline-rated instructors." },
                { icon: DollarSign, title: "Affordable Courses", description: "Receive premium ground school education at competitive prices." },
                 { icon: Heart, title: "Dedicated Support", description: "We are fully committed to your success, every step of the way." },
                ].map((item, index) => (
                <motion.div key={index} variants={itemVariants} whileHover="hover" initial="initial" className="flex">
                    <motion.div variants={cardHoverVariants} className="w-full">
                        <Card className="flex flex-col text-center h-full bg-card transition-all duration-300 p-6 md:p-8 border border-border">
                            <CardHeader className="p-0 mb-5 flex-shrink-0">
                                <div className="mx-auto bg-aviation-secondary/10 p-4 rounded-full w-fit mb-4">
                                    <item.icon className="h-8 w-8 text-aviation-secondary" />
                                </div>
                                <CardTitle className="text-foreground text-xl font-semibold">{item.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 flex-grow">
                                <p className="text-foreground/70 text-sm leading-relaxed">{item.description}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
                ))}
            </div>
        </motion.section>

        {/* Redesigned "Say Goodbye" Section with 6 items */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="bg-muted/40 dark:bg-muted/20 rounded-lg p-8 md:p-12 border border-border/50 shadow-sm"
        >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 text-aviation-primary dark:text-aviation-tertiary">Say Goodbye To Traditional Hassles</h2>
            {/* Grid now has 6 items, so the placeholder div is removed */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
               {traditionalHassles.map((hassle, index) => (
                   <motion.div key={index} variants={itemVariants} whileHover="hover" initial="initial" className="flex">
                       <motion.div variants={cardHoverVariants} className="w-full">
                           <Card className="flex flex-col items-center text-center p-6 h-full bg-card border border-border"> 
                              <div className="bg-red-500/10 p-3 rounded-full mb-4">
                                <hassle.icon className="h-7 w-7 text-red-500" />
                              </div>
                              <p className="text-foreground/80 font-medium text-sm leading-snug flex-grow">{hassle.text}</p>
                           </Card>
                       </motion.div>
                   </motion.div>
               ))}
               {/* Removed the placeholder div previously here */}
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-center mt-12 md:mt-16 text-lg text-aviation-primary dark:text-aviation-tertiary font-semibold"
            >
              Focus purely on mastering your ground subjects with ATC!
            </motion.p>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
};

export default About;
