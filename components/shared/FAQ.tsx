import React from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// import { Button } from "@/components/ui/button"; // Replaced with custom buttons
import { SolidButton } from "@/components/shared/SolidButton"; // Corrected: Use named import
import { TransparentButton } from "@/components/shared/TransparentButton"; // Corrected: Use named import
import { MessageCircle, HelpCircle, Phone, Smartphone } from 'lucide-react'; // Added Phone and Smartphone (for WhatsApp)


// --- Animation Variants (keep existing variants) ---
const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
};

const hoverVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02, transition: { duration: 0.2 } }
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

// --- FAQ Data (Expanded & SEO Optimized) ---
export const faqData = [
    {
        question: "What courses does Aviators Training Centre specialize in?",
        answer: "We specialize in comprehensive online ground school classes for DGCA CPL and ATPL examinations in India. Our courses cover all required subjects: Air Navigation, Aviation Meteorology, Air Regulations, Technical General (Aircraft & Engines), and Technical Specific. Additionally, we offer RTR(A) training, A320/B737 type rating preparation (technical knowledge), and airline interview preparation."
    },
    {
        question: "Are the classes online or in person?",
        answer: "Our primary mode of instruction is online, providing flexibility and accessibility for aspiring pilots across India. This modern approach eliminates travel hassles and accommodation costs often associated with traditional ground schools, allowing you to focus solely on your DGCA exam preparation."
    },
     {
        question: "What subjects are covered in the DGCA CPL/ATPL Ground Classes?",
        answer: "Our DGCA-focused ground classes cover the complete syllabus required for CPL and ATPL exams: Air Navigation, Aviation Meteorology, Air Regulations, Technical General (Aircraft & Engines), and Technical Specific (relevant to your chosen aircraft type). We aim for thorough preparation for all DGCA papers."
    },
    {
        question: "How flexible are the class timings for DGCA online classes?",
        answer: "Highly flexible! We understand the demanding schedules pilots and aspiring pilots face. Our online class timings can often be adjusted to accommodate flight schedules, business commitments, or other jobs, particularly beneficial for ATPL candidates and working professionals pursuing CPL."
    },
    {
        question: "What if I need personalized attention or feel hesitant in group classes?",
        answer: "No problem! We offer One-on-One Online Classes for all DGCA CPL and ATPL subjects. This personalized coaching ensures you receive dedicated attention, allowing you to learn at your own pace and clarify doubts comfortably and effectively."
    },
    {
        question: "What kind of support is available outside of online class hours?",
        answer: "We pride ourselves on offering 24/7 support for doubt clarification. Our dedicated team is available round-the-clock via WhatsApp to assist you whenever you encounter difficulties with DGCA subject concepts, ensuring continuous learning."
    },
    {
        question: "How does the A320/B737 Type Rating Prep work?",
        answer: "Our affordable pre and post type rating preparation focuses on the technical knowledge required for A320 & B737 aircraft. This includes study materials, question banks based on previous airline exam questions (e.g., IndiGo, Air India Express, Air India), and preparation tailored for the technical exams conducted by major Indian airlines during their recruitment process."
    },
    {
        question: "Do you help with airline interview preparation?",
        answer: "Yes, cracking the interview is crucial. We offer specialized preparation focusing on enhancing English language proficiency, technical knowledge revision, HR questions, and building the confidence needed to succeed in demanding airline interviews in India."
    },
     {
        question: "Why choose Aviators Training Centre for online DGCA classes?",
        answer: "Choose us for experienced instructors (often current airline pilots), flexible online scheduling, personalized one-on-one options, 24/7 doubt support, comprehensive study materials, mock tests simulating DGCA exams, and proven strategies focused on helping you clear your CPL and ATPL papers efficiently."
    },
    {
        question: "What study materials are provided for DGCA exam preparation?",
        answer: "We provide updated and curated study materials specifically designed for DGCA CPL/ATPL exams. This includes detailed notes, extensive question banks (often including past DGCA questions), topic-wise tests, full mock exams, and performance analysis tools to track your progress."
    },
     {
        question: "What is involved in the RTR(A) (Radio Telephony Restricted - Aeronautical) training?",
        answer: "Our RTR(A) course prepares candidates for both Part 1 (Practical Transmission) and Part 2 (Oral Viva) of the WPC (Wireless Planning & Coordination Wing) examination. We focus on mastering standard aviation phraseology, efficient communication procedures, and handling simulated Air Traffic Control (ATC) scenarios."
    },
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
    headerImage?: string; // Keep if used elsewhere, otherwise potentially remove
}

// --- FAQ Component ---
const FAQ: React.FC<FAQProps> = ({
    showAll = false,
    showHeader = true,
    showCTA = true,
    className = "",
    // headerImage is unused in this component's current state
}) => {
    const displayFaqs = showAll ? faqData : faqData.slice(0, 5); // Show first 5 on homepage, all on FAQ page

    return (
        <section className={`section-padding ${showAll ? '' : 'py-16 my-8'} ${className}`}>
            <div className="container mx-auto px-4 md:px-6">
                {/* Header Section */}
                {showHeader && (
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-aviation-primary dark:text-aviation-tertiary mb-3">
                            Frequently Asked Questions (DGCA Prep & More)
                        </h2>
                        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Find answers to common questions about our online DGCA CPL/ATPL ground classes, RTR(A), type rating prep,
                            and the path to becoming a certified pilot in India.
                        </p>
                    </motion.div>
                )}

                {/* Accordion Section */}
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
                                    {/* Schema.org Microdata for SEO */}
                                    <AccordionItem
                                        itemScope // Mark item for microdata
                                        itemProp="mainEntity" // Part of FAQPage schema
                                        itemType="https://schema.org/Question" // Define type as Question
                                        value={`item-${index}`}
                                        className="border-b border-border last:border-0 overflow-hidden bg-white/50 dark:bg-aviation-primary/10 rounded-md my-2 shadow-sm"
                                    >
                                        <AccordionTrigger
                                            itemProp="name" // Question text
                                            className="text-left text-sm md:text-base font-medium text-foreground hover:text-aviation-primary dark:hover:text-aviation-tertiary transition-colors py-5 px-4"
                                        >
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent
                                            itemScope // Mark item for microdata
                                            itemProp="acceptedAnswer" // Links answer to question
                                            itemType="https://schema.org/Answer" // Define type as Answer
                                            className="text-sm text-muted-foreground px-4 pb-5 leading-relaxed"
                                        >
                                            <div itemProp="text">{faq.answer}</div> {/* Answer text */}
                                        </AccordionContent>
                                    </AccordionItem>
                                </motion.div>
                            </motion.div>
                        ))}
                    </Accordion>
                </motion.div>

                {/* "View All FAQs" Button (only shown when not showing all) */}
                {!showAll && (
                    <motion.div
                        className="mt-10 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        {/* Use SolidButton with Link handled internally */}
                        <SolidButton
                            label="View All FAQs"
                            href="/faq"
                            icon={HelpCircle}
                        />
                    </motion.div>
                )}

                {/* "Didn't Find Your Answer?" CTA (only shown when showAll and showCTA are true) */}
                {showAll && showCTA && (
                     <motion.section
                        variants={sectionVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        className="text-center mt-20 py-12 px-6 bg-aviation-primary/5 dark:bg-aviation-tertiary/10 rounded-xl shadow-md"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="bg-aviation-tertiary/10 dark:bg-aviation-tertiary/20 p-4 rounded-full inline-block mb-4">
                                <MessageCircle className="h-12 w-12 text-aviation-primary dark:text-aviation-tertiary" />
                            </div>
                        </motion.div>
                        <h2 className="text-3xl font-bold mb-4 text-aviation-primary dark:text-aviation-tertiary">Still Have Questions?</h2>
                        <p className="max-w-xl mx-auto text-foreground/70 mb-8">
                            Our team is ready to help with any specific questions about our DGCA ground classes, online training programs, enrollment, or pilot career guidance. Reach out today!
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            {/* WhatsApp Button */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <SolidButton
                                    label="Chat on WhatsApp"
                                    href="https://wa.me/919485687609" // Replace with actual number if different
                                    icon={Smartphone}
                                    external // Mark as external link
                                />
                            </motion.div>

                            {/* Contact Us Button */}
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
