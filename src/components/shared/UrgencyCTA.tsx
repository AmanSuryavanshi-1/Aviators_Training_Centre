import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarClock } from 'lucide-react';
// import { CountdownTimer } from '@/components/shared/CountdownTimer'; // Import actual timer when ready

// --- Configuration (can be adjusted or passed as props) ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';
const urgencyButtonBorderGradient = 'bg-gradient-to-r from-[#0C6E72] to-[#56A7B0]';
const urgencyButtonHoverBg = 'hover:from-[#56A7B0] hover:to-[#0C6E72]';

// --- Animation Variants (Optional: Pass down or define here) ---
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

interface UrgencyCTAProps {
    offerEndDate: Date; // Pass the calculated end date
    formattedEndDate: string; // Pass the pre-formatted date string
    className?: string; // Allow custom styling
}

export const UrgencyCTA: React.FC<UrgencyCTAProps> = ({ offerEndDate, formattedEndDate, className }) => {

  return (
    <motion.div
        variants={itemVariants} // Use item variant for fade-in
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className={cn(
            "mt-16 md:mt-20 max-w-2xl mx-auto text-center p-6 bg-card border border-border/80 rounded-lg shadow-md",
            className // Allow overriding styles
        )}
    >
       <h3 className={cn("text-2xl font-semibold mb-3", aviationPrimary)}>Limited Time Offer!</h3>
       <p className="text-foreground/80 mb-6">
           Enroll in any of our ground school batches by <strong className="text-foreground">{formattedEndDate}</strong> and secure a <strong className="text-foreground">20% discount</strong> on your course fees. Start your journey today!
       </p>

       {/* Gradient Button */}
       <div className="relative inline-block mb-4 group">
            <div className={cn(
               "absolute -inset-0.5 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300 group-hover:duration-200",
               urgencyButtonBorderGradient
            )}></div>
             <Button
                 asChild
                 size="lg"
                 className={cn(
                     "relative px-7 py-4 leading-none rounded-lg flex items-center justify-center",
                     "bg-background hover:bg-transparent text-foreground hover:text-white", // Inner button styles
                     "transition duration-300 ease-in-out transform hover:scale-[1.03]",
                     urgencyButtonBorderGradient, // Apply gradient bg for hover effect
                     urgencyButtonHoverBg
                  )}
             >
                 <Link to="/courses"> {/* Link to courses page or specific enrollment */}
                      <CalendarClock className="mr-2 h-5 w-5" />
                     Enroll by {formattedEndDate} for 20% Off
                 </Link>
             </Button>
       </div>

       {/* Countdown Timer (Simulated) */}
       <div className="mb-6">
          {/* Replace with actual CountdownTimer component if available */}
          {/* <CountdownTimer targetDate={offerEndDate} /> */}
          <p className="text-sm text-foreground/60">(Offer expires soon!)</p> 
       </div>


       {/* Secondary CTA */}
       <Button asChild variant="link" className={cn("text-base", aviationSecondary, "hover:text-teal-500 dark:hover:text-teal-300")}>
           <Link to="/contact" state={{ subject: 'Consultation Request', message: 'I would like to schedule a consultation to discuss the courses and the limited-time offer.' }}>
              Limited seats! Schedule a consultation →
          </Link>
       </Button>

    </motion.div>
  );
};
