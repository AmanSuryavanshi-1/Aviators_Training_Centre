// Added "use client" for motion and Accordion
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SolidButton } from "@/components/shared/SolidButton";
import { TransparentButton } from "@/components/shared/TransparentButton";
import { MessageCircle, HelpCircle, Phone, Smartphone } from 'lucide-react';
// Removed Link import from react-router-dom

// --- Animation Variants (Keep existing) ---
const sectionVariants = { /* ... */ };
const fadeInVariants = { /* ... */ };
const itemVariants = { /* ... */ };
const hoverVariants = { /* ... */ };
const containerVariants = { /* ... */ };

// --- FAQ Data (Assume this is correct and exported) ---
export const faqData = [
    {
        question: "What courses does Aviators Training Centre specialize in?",
        answer: "We specialize in comprehensive online ground school classes for DGCA CPL and ATPL examinations in India. Our courses cover all required subjects: Air Navigation, Aviation Meteorology, Air Regulations, Technical General (Aircraft & Engines), and Technical Specific. Additionally, we offer RTR(A) training, A320/B737 type rating preparation (technical knowledge), and airline interview preparation."
    },
    {
        question: "Are the classes online or in person?",
        answer: "Our primary mode of instruction is online, providing flexibility and accessibility for aspiring pilots across India. This modern approach eliminates travel hassles and accommodation costs often associated with traditional ground schools, allowing you to focus solely on your DGCA exam preparation."
    },
    // ... (rest of faqData)
     {
        question: "How often do new online batches for DGCA subjects start?",
        answer: "We commence new online batches frequently for all DGCA subjects (Navigation, Meteorology, Regulations, Technical) and RTR(A). Please contact us directly via WhatsApp or our contact form for the latest batch schedules and seat availability."
    },
    {
        question: "Are there prerequisites for joining CPL or ATPL ground classes?",
        answer: "Generally, for CPL ground classes, you should meet the eligibility criteria for a Student Pilot License (SPL) as per DGCA guidelines (age, medicals, etc.). For ATPL classes, holding a valid CPL is typically required. We recommend contacting us to discuss your specific situation and the latest DGCA requirements."
    }
];

// --- Component Props ---
interface FAQProps {
    showAll?: boolean;
    showHeader?: boolean;
    showCTA?: boolean;
    className?: string;
}

// --- FAQ Component ---
const FAQ: React.FC<FAQProps> = ({
    showAll = false,
    showHeader = true,
    showCTA = true,
    className = "",
}) => {
    const displayFaqs = showAll ? faqData : faqData.slice(0, 5);

    return (
        <section className={`section-padding ${showAll ? '' : 'py-16 my-8'} ${className}`}>
            <div className="container mx-auto px-4 md:px-6">
                {showHeader && (
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-teal-700 dark:text-teal-300 mb-3">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Find answers about our online DGCA ground classes, RTR(A), type rating prep, and more.
                        </p>
                    </motion.div>
                )}

                <motion.div
                    className="max-w-4xl mx-auto"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <Accordion type="single" collapsible className="w-full divide-y divide-border">
                        {displayFaqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                transition={{ duration: 0.3 }}
                                whileHover="hover"
                                initial="initial"
                            >
                                <motion.div variants={hoverVariants}>
                                    <AccordionItem
                                        itemScope
                                        itemProp="mainEntity"
                                        itemType="https://schema.org/Question"
                                        value={`item-${index}`}
                                        className="border-b border-border last:border-0 overflow-hidden bg-card/50 dark:bg-card/10 rounded-md my-2 shadow-sm"
                                    >
                                        <AccordionTrigger
                                            itemProp="name"
                                            className="text-left text-sm md:text-base font-medium text-foreground hover:text-teal-600 dark:hover:text-teal-400 transition-colors py-5 px-4"
                                        >
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent
                                            itemScope
                                            itemProp="acceptedAnswer"
                                            itemType="https://schema.org/Answer"
                                            className="text-sm text-muted-foreground px-4 pb-5 leading-relaxed bg-muted/10 dark:bg-muted/5"
                                        >
                                            <div itemProp="text">{faq.answer}</div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </motion.div>
                            </motion.div>
                        ))}
                    </Accordion>
                </motion.div>

                {!showAll && (
                    <motion.div
                        className="mt-10 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        {/* SolidButton uses next/link internally */}
                        <SolidButton
                            label="View All FAQs"
                            href="/faq"
                            icon={HelpCircle}
                        />
                    </motion.div>
                )}

                {showAll && showCTA && (
                     <motion.section
                        variants={sectionVariants} // Ensure variants are defined
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        className="text-center mt-20 py-12 px-6 bg-teal-50/30 dark:bg-teal-900/20 rounded-xl shadow-md border border-border/30"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="bg-teal-100/70 dark:bg-teal-800/40 p-4 rounded-full inline-block mb-4">
                                <MessageCircle className="h-12 w-12 text-teal-700 dark:text-teal-300" />
                            </div>
                        </motion.div>
                        <h2 className="text-3xl font-bold mb-4 text-teal-700 dark:text-teal-300">Still Have Questions?</h2>
                        <p className="max-w-xl mx-auto text-foreground/70 mb-8">
                            Our team is ready to help. Reach out via WhatsApp or contact us directly.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            {/* SolidButton uses next/link or anchor tag internally */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <SolidButton
                                    label="Chat on WhatsApp"
                                    href="https://wa.me/919485687609"
                                    icon={Smartphone}
                                    className="w-full sm:w-auto"
                                    external
                                />
                            </motion.div>
                            {/* TransparentButton uses next/link internally */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <TransparentButton
                                    label="Contact Us Directly"
                                    href="/contact"
                                    icon={Phone}
                                    className="w-full sm:w-auto"
                                />
                            </motion.div>
                        </div>
                    </motion.section>
                )}
            </div>
        </section>
    );
};

export default FAQ;
