import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/components/ui/utils";

// --- Configuration ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';

// --- Animation Variants ---
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } },
};

const ContactMapSection: React.FC = () => {
    return (
        <motion.section
            className="container flex-grow px-4 py-16 mx-auto sm:px-6 md:py-24"
            
        >
            <motion.h2
                variants={itemVariants}
                className={cn("mb-6 text-3xl font-bold text-center md:text-4xl", aviationPrimary)}
            >
                Find Our Location
            </motion.h2>
            <motion.p
                variants={itemVariants}
                className="max-w-2xl mx-auto mb-10 text-center text-foreground/80"
            >
                Visit our training centre in Dwarka, New Delhi, to discuss your training needs in person.
            </motion.p>

            <motion.div
                variants={itemVariants}
                className="overflow-hidden border rounded-lg shadow-md border-border"
            >
                <div className="aspect-video">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.014408488279!2d77.0489654150817!3d28.60868878241755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d055725848f4f%3A0x76e37572262f1b3c!2sRamphal%20Chowk%20Rd%2C%20Sector%207%20Dwarka%2C%20Dwarka%2C%20Delhi%2C%20110075!5e0!3m2!1sen!2sin!4v1725999999999!5m2!1sen!2sin"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Aviators Training Centre Location - Ramphal Chowk, Dwarka, Delhi"
                    ></iframe>
                </div>
            </motion.div>
        </motion.section>
    );
};

export default ContactMapSection;