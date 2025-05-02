"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface ContactHeaderProps {
    isDemoBooking: boolean;
}

const contactHeaderUrl = "/About/AboutHeader.webp";
const FALLBACK_IMAGE = "/HomePage/Hero5.webp";

const ContactHeader: React.FC<ContactHeaderProps> = ({ isDemoBooking }) => {
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const target = e.target as HTMLImageElement;
        if (!target.src.endsWith(FALLBACK_IMAGE)) {
            target.onerror = null;
            target.src = FALLBACK_IMAGE;
        }
    };

    return (
        <motion.section
            className="relative h-[50vh] md:h-[60vh] flex items-center justify-center text-center text-white overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <img
                src={contactHeaderUrl}
                alt="Contact ATC background"
                className="absolute inset-0 z-0 object-cover w-full h-full"
                onError={handleImageError}
                style={{ filter: 'brightness(0.6)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,94,104,0.25)] to-[rgba(12,110,114,0.55)] z-10"></div>
            <motion.div
                className="relative z-20 max-w-4xl p-6 md:p-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
            >
                <h1 className="mb-3 text-4xl font-extrabold leading-tight tracking-tight drop-shadow-md sm:text-5xl md:text-6xl">
                    {isDemoBooking ? 'Book Your Demo' : 'Get In Touch'}
                </h1>
                <p className="max-w-2xl mx-auto text-lg drop-shadow-md md:text-xl text-white/90">
                    {isDemoBooking
                        ? `Fill in your details below, and we will schedule your personalized demo.`
                        : `Have questions? Select a subject or let us know how we can help.`
                    }
                </p>
            </motion.div>
        </motion.section>
    );
};

export default ContactHeader;