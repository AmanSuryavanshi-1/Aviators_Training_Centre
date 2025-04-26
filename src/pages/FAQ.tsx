import React from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from 'framer-motion';
import FAQ from '@/components/shared/FAQ'; // Existing shared FAQ component
import { cn } from "@/lib/utils";
import { Card, CardDescription, CardTitle } from "@/components/ui/card"; // For contact card
import { Button } from "@/components/ui/button"; // For contact card
import { Link } from 'react-router-dom'; // For contact card
import { PhoneForwarded } from 'lucide-react'; // For contact card

// --- Configuration (Matching other pages) ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';
// Using a relevant image from the project
const faqHeaderUrl = "/FAQ.jpg";
const FALLBACK_IMAGE = "/HomePage/Hero5.webp"; // Consistent fallback

// --- Animation Variants (Matching other pages) ---
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

const FAQPage: React.FC = () => {

  // Function to handle image errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (!target.src.endsWith(FALLBACK_IMAGE)) {
        target.onerror = null;
        target.src = FALLBACK_IMAGE;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />

      {/* Page Header - Adjusted height, brightness, text shadow, gradient */}
      <motion.section
        className="relative h-[50vh] md:h-[60vh] flex items-center justify-center text-center text-white overflow-hidden" // Matched height
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <img
          src={faqHeaderUrl}
          alt="ATC aircraft wing detail" // More relevant alt text
          className="absolute inset-0 w-full h-full z-0"
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
            Frequently Asked Questions
          </h1>
          <p className="text-lg drop-shadow-md md:text-xl text-white/90 max-w-2xl mx-auto"> {/* Matched text styles */}
            Your questions about Aviators Training Centre, answered.
          </p>
        </motion.div>
      </motion.section>

      {/* Main Content - Adjusted container padding/spacing */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-16 md:py-24 space-y-20 md:space-y-28">

        {/* FAQ Section */}
        <motion.section
           variants={sectionVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, amount: 0.1 }}
           className="max-w-4xl mx-auto" // Center the FAQ component
        >
            {/* Added consistent section heading */}
            <motion.h2
                variants={itemVariants}
                className={cn("text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16", aviationPrimary)}
            >
                Find Your Answers
            </motion.h2>

            {/* Render the existing shared FAQ component */}
            <motion.div variants={itemVariants}>
               {/* Assuming FAQ component's Accordion styling is acceptable or handled within the component */}
               <FAQ showAll={true} showHeader={false} />
            </motion.div>
        </motion.section>

        {/* Contact Prompt Section - REMOVED */}
        {/*
        <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="flex justify-center" // Center the card
        >
           <motion.div
               variants={itemVariants} // Animate the card itself
               className="w-full max-w-2xl" // Control card width
           >
               <motion.div
                   className="relative h-full w-full group"
                   whileHover="hover"
                   initial="rest"
                   animate="rest"
                   variants={cardHoverEffect}
               >

                   <Card className="bg-gradient-to-br from-teal-50/50 to-sky-50/50 dark:from-gray-800/60 dark:to-gray-900/60 w-full h-full flex flex-col items-center justify-center text-center overflow-hidden rounded-lg shadow-sm border border-dashed border-border transition-shadow duration-300 relative z-10 p-8 md:p-10">
                       <div className="mb-4">
                          <PhoneForwarded className={cn("w-10 h-10", aviationSecondary)} />
                       </div>
                       <CardTitle className="text-xl font-semibold text-foreground mb-3">Still Have Questions?</CardTitle>
                       <CardDescription className="text-base text-foreground/80 mb-6 max-w-md mx-auto">
                          Can't find the answer you're looking for? Feel free to reach out to our team directly.
                       </CardDescription>
                       <Link to="/contact">
                           <Button size="lg" variant="outline" className={cn("min-h-[48px] border-teal-500 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-300 dark:hover:bg-teal-900/30 transition duration-300 ease-in-out transform hover:scale-[1.03]", "group-hover:border-teal-600 dark:group-hover:border-teal-300")}>
                               Contact Us
                           </Button>
                       </Link>
                   </Card>
               </motion.div>
           </motion.div>
        </motion.section>
        */}

      </main>

      <Footer />
    </div>
  );
};

export default FAQPage;
