import React from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import CoursesSection from "@/components/home/CoursesSection";
import InstructorsSection from "@/components/home/InstructorsSection";
import PilotPathway from "@/components/home/PilotPathway";
import FAQ from "@/components/shared/FAQ";
import CTASection from "@/components/home/CTASection";
import { motion } from 'framer-motion'; // Import motion
import { cn } from "@/lib/utils"; // Import cn

// Define consistent animation variants (can be moved to a shared file later)
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

// Define primary color for consistent heading usage
const aviationPrimary = 'text-teal-700 dark:text-teal-300';

const Index: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section remains outside the main container */}
      <HeroSection />

      {/* Main Content Area with standard padding and spacing */}
      {/* Removed ScrollArea, applied container styles directly */}
      <main className="container mx-auto px-4 sm:px-6 py-16 md:py-24 space-y-20 md:space-y-28">

        {/* Why Choose Us Section */}
        <WhyChooseUs />

        {/* Pilot Pathway Section */}
        <PilotPathway />

        {/* Courses Section */}
        <CoursesSection />

        {/* Instructors Section */}
        <InstructorsSection />

        {/* FAQ Section - Wrapped in standard section structure */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="max-w-4xl mx-auto" // Center FAQ
        >
          <motion.h2
            variants={itemVariants}
            className={cn("text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16", aviationPrimary)} // Consistent heading
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.div variants={itemVariants}>
            {/* Assuming FAQ component uses appropriate internal styling */}
            <FAQ showAll={false} showHeader={false} />
          </motion.div>
        </motion.section>

        {/* CTA Section */}
        <CTASection />

      </main>

      <Footer />
    </div>
  );
};

export default Index;
