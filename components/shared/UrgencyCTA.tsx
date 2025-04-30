import { cn } from "../ui/utils";
import { Button } from "@/components/ui/button"; // Keep Button for specific cases
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CalendarClock, ArrowRight } from 'lucide-react';
// import { CountdownTimer } from '@/components/shared/CountdownTimer'; // Import actual timer when ready

// --- Configuration ---
const aviationSecondary = 'text-teal-600 dark:text-teal-400'; // Used for link button
// Gradient for the primary button border effect
const urgencyButtonBorderGradient = 'bg-gradient-to-r from-[#0C6E72] to-[#56A7B0]';

// --- Animation Variants ---
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

interface UrgencyCTAProps {
    offerEndDate: Date;
    formattedEndDate: string;
    className?: string;
}

export const UrgencyCTA: React.FC<UrgencyCTAProps> = ({ offerEndDate, formattedEndDate, className }) => {

  return (
    <motion.div
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className={cn(
            "mt-16 md:mt-20 max-w-2xl mx-auto text-center p-6 bg-card border border-border/80 rounded-lg shadow-md",
            className
        )}
    >
       {/* Adjusted primary text color reference if needed, or remove if not used */}
       <h3 className={cn("text-2xl font-semibold mb-3", 'text-teal-700 dark:text-teal-300')}>Limited Time Offer!</h3>
       <p className="text-foreground/80 mb-6">
           Enroll in any of our ground school batches by <strong className="text-foreground">{formattedEndDate}</strong> and secure a <strong className="text-foreground">20% discount</strong> on your course fees. Start your journey today!
       </p>

       {/* Gradient Button - Adapted inner button style */}
       <div className="relative inline-block mb-4 group">
            {/* Gradient Border Effect Div */}
            <div className={cn(
               "absolute -inset-0.5 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300 group-hover:duration-200",
               urgencyButtonBorderGradient
            )}></div>
             {/* Inner Button - Styled similar to SolidButton */}
             <Button
                 asChild
                 size="lg" // Controls padding and font size
                 className={cn(
                     "relative px-7 py-4 leading-none rounded-lg flex items-center justify-center", // Keep specific layout classes
                     // Core SolidButton-like styles
                     'bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600',
                     'shadow-md hover:shadow-lg', // Add shadow consistent with SolidButton
                     "transition-all duration-300 ease-out transform group-hover:scale-[1.03]" // Keep existing hover transform
                  )}
             >
                 <Link href="/courses">
                      <CalendarClock className="mr-2 h-5 w-5" />
                     Enroll by {formattedEndDate} for 20% Off
                </Link>
             </Button>
       </div>

       {/* Countdown Timer (Placeholder) */}
       <div className="mb-6">
          {/* <CountdownTimer targetDate={offerEndDate} /> */}
          <p className="text-sm text-foreground/60">(Offer expires soon!)</p>
       </div>

       {/* Secondary Link Button - Kept as variant="link" */}
       <Button asChild variant="link" className={cn("text-base", aviationSecondary, "hover:text-teal-500 dark:hover:text-teal-300")}>
           <Link href={{ pathname: "/contact#contact-form", query: { subject: 'Consultation Request', message: 'I would like to schedule a consultation to discuss the courses and the limited-time offer.' } }}>
              Limited seats! Schedule a consultation →
          </Link> 
       </Button>

    </motion.div>
  );
};
