"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/components/ui/utils";
import ContactHeader from '@/components/contact/ContactHeader';
import ContactDetailsCard from '@/components/contact/ContactDetailsCard';
import ContactFormCard from '@/components/contact/ContactFormCard';
import ContactMapSection from '@/components/contact/ContactMapSection';
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
    const params = new URLSearchParams(window.location.search);
    const isDemoBooking = params.get("subject") ? true : false;

  

    const FALLBACK_IMAGE = "/Course-Img.webp";

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = FALLBACK_IMAGE;
    };  
    
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
           <ContactHeader isDemoBooking={isDemoBooking} />

            <main id="contact-form" className="container flex-grow px-4 py-16 mx-auto space-y-20 sm:px-6 md:py-24 md:space-y-28">
                <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>
                    <div className="grid items-start grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
                       <motion.div variants={itemVariants} className="lg:col-span-2"> <ContactDetailsCard /> </motion.div>
                        <motion.div variants={itemVariants} className="lg:col-span-3"> <ContactFormCard
                            inquirySubjects={inquirySubjects}
                        /></motion.div>
                    </div>
                </motion.section>

                <ContactMapSection />
            </main>
        </div>
    );
};

export default ContactPage;