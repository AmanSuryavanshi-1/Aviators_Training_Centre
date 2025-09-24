"use client"
import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { motion } from 'framer-motion';
import { Phone, ArrowUp, ChevronDown } from 'lucide-react';
import ContactHeader from "@/components/features/contact/ContactHeader";
import ContactDetailsCard from "@/components/features/contact/ContactDetailsCard";
import ContactFormCard from "@/components/features/contact/ContactFormCard";
import { usePageViewTracking } from '@/hooks/use-conversion-tracking';
import { trackContactVisit } from '@/lib/analytics/client';
// import ContactMapSection from "@/components/features/contact/ContactMapSection';
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeInOut" } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } }
};
const ContactPage: React.FC = () => {
    const [isDemoBooking, setIsDemoBooking] = useState(false); // Add state for isDemoBooking

    // Track contact page visit for conversion analytics (legacy)
    usePageViewTracking('contact');

    // New analytics tracking
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const referrerSlug = params.get('referrer');
        const source = params.get('subject') === 'Book a Demo' ? 'cta' : 'direct';
        
        // Track contact visit with new analytics system
        trackContactVisit(source, {
            referrerSlug: referrerSlug || undefined,
            immediate: false
        });
    }, []);

    useEffect(() => {
        // Move window-dependent logic here
        const params = new URLSearchParams(window.location.search);
        setIsDemoBooking(params.get("subject") ? true : false);
    }, []); // Empty dependency array ensures this runs only once on mount

    const inquirySubjects = [
        "General Inquiry", "CPL Ground Classes (All Subjects)",
        "ATPL Ground Classes (All Subjects)", "Air Navigation Course",
        "Aviation Meteorology Course", "Air Regulations Course",
        "Technical General Course", "Technical Specific Course",
        "RTR(A) Training", "A320/B737 Type Rating Prep",
        "Airline Interview Preparation", "One-on-One Classes Inquiry",
        "Batch Schedule Inquiry", "Fee Structure Inquiry",
        "Other"
    ];
    // const params = new URLSearchParams(window.location.search); // Removed from here
    // const isDemoBooking = params.get("subject") ? true : false; // Removed from here

  

    const FALLBACK_IMAGE = "/Course-Img.webp";

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = FALLBACK_IMAGE;
    };  
    
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
           {/* Desktop Header - Hidden on mobile */}
           <div className="hidden md:block">
               <ContactHeader isDemoBooking={isDemoBooking} />
           </div>

           {/* Mobile Header - Compact version with background image */}
           <div className="block md:hidden">
               <motion.section
                   className="relative h-[35vh] flex items-center justify-center text-center text-white overflow-hidden"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ duration: 0.6 }}
               >
                   <img
                       src="/About/AboutHeader.webp"
                       alt="Contact ATC background"
                       className="absolute inset-0 z-0 object-cover w-full h-full"
                       onError={(e) => {
                           const target = e.target as HTMLImageElement;
                           if (!target.src.endsWith('/HomePage/Hero5.webp')) {
                               target.onerror = null;
                               target.src = '/HomePage/Hero5.webp';
                           }
                       }}
                       style={{ filter: 'brightness(0.6)' }}
                   />
                   <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,94,104,0.25)] to-[rgba(12,110,114,0.55)] z-10"></div>
                   <div className="relative z-20 container mx-auto px-4 text-center">
                       <h1 className="text-2xl font-bold mb-2 drop-shadow-md">
                           {isDemoBooking ? 'Book Your Demo' : 'Contact Us'}
                       </h1>
                       <p className="text-sm text-white/90 mb-3 drop-shadow-md">
                           {isDemoBooking
                               ? 'Fill in your details below to schedule your demo'
                               : 'Ready to start your aviation journey? Fill out the form below!'
                           }
                       </p>
                       <div className="flex flex-col items-center justify-center mt-4">
                           <div className="flex flex-col items-center space-y-1">
                               <div className="w-0.5 h-6 bg-gradient-to-b from-white/60 to-transparent"></div>
                               <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                           </div>
                       </div>
                   </div>
               </motion.section>
           </div>

            <main id="contact-form" className="container flex-grow px-4 py-4 mx-auto sm:px-6 md:py-6 lg:py-8 max-w-7xl overflow-visible">
                <motion.section 
                    variants={sectionVariants} 
                    initial="hidden" 
                    whileInView="visible" 
                    viewport={{ once: true, amount: 0.05 }}
                    className="min-h-0 w-full" // Prevent flex issues and ensure full width
                >
                    {/* Mobile Layout - Form First */}
                    <div className="block md:hidden space-y-6">
                        <motion.div variants={itemVariants}>
                            <ContactFormCard inquirySubjects={inquirySubjects} />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <ContactDetailsCard />
                        </motion.div>
                    </div>

                    {/* Desktop Layout - Equal height cards with flexible design */}
                    <div className="hidden md:flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-[600px]">
                       <motion.div variants={itemVariants} className="lg:w-2/5 flex">
                           <ContactDetailsCard />
                       </motion.div>
                        <motion.div variants={itemVariants} className="lg:w-3/5 flex">
                            <ContactFormCard inquirySubjects={inquirySubjects} />
                        </motion.div>
                    </div>
                </motion.section>

                {/* Mobile Quick Contact CTA - Shows after contact details */}
                <div className="block md:hidden mt-8">
                    <motion.div 
                        className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-teal-200 dark:border-teal-800"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-teal-700 dark:text-teal-300 mb-2">
                                Need Help?
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                Call us directly or scroll up to fill the contact form
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                <a 
                                    href="tel:+919485687609" 
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-full text-sm font-medium hover:bg-teal-700 transition-colors"
                                >
                                    <Phone className="w-4 h-4" />
                                    Call Now
                                </a>
                                <button 
                                    onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-teal-600 border border-teal-600 rounded-full text-sm font-medium hover:bg-teal-50 transition-colors"
                                >
                                    <ArrowUp className="w-4 h-4" />
                                    Back to Form
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Desktop: Additional spacing for better visual balance */}
                <div className="hidden md:block h-8 lg:h-12"></div>

                {/* <ContactMapSection /> */}
            </main>
        </div>
    );
};

export default ContactPage;
