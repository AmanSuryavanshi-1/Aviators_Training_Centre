import React from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageCircle } from 'lucide-react'; // Added MessageCircle
import { Link } from 'react-router-dom';

// Placeholder
const faqHeaderUrl = "https://images.unsplash.com/photo-1516797043888-58a406f03f2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8cXVlc3Rpb24lMjBtYXJrfHx8fHx8MTYxODU0OTYxNg&ixlib=rb-1.2.1&q=80&w=1080";

// ATC FAQ Data (Updated)
const faqData = [
  {
    question: "What courses does Aviators Training Centre specialize in?",
    answer: "We specialize in ground school classes for DGCA CPL and ATPL examinations, covering all required subjects: Navigation, Meteorology, Regulations, Technical General, and Technical Specific. We also offer RTR(A) training, A320/B737 type rating preparation, and Interview Preparation."
  },
  {
    question: "Are the classes online or in person?",
    answer: "Our primary mode of instruction is online, allowing for flexibility and accessibility. This eliminates travel hassles and rental costs associated with traditional ground schools."
  },
   {
    question: "How flexible are the class timings?",
    answer: "Highly flexible! We understand the demanding schedules of pilots. Timings can be adjusted as per your flight schedule, business commitments, or other jobs, especially for ATPL/CPL candidates."
  },
  {
    question: "What if I feel hesitant asking questions in a group batch?",
    answer: "No problem! We offer One-on-One Online Classes for all CPL and ATPL subjects. This personalized coaching ensures you get the individual attention you need to learn comfortably and effectively."
  },
  {
    question: "What kind of support do you offer outside of class hours?",
    answer: "We provide 24/7 support to clear your doubts. Our dedicated team is available round-the-clock via [Specify Method - e.g., WhatsApp, dedicated portal] to assist you whenever you're stuck on a concept."
  },
   {
    question: "How does the Type Rating Prep work?",
    answer: "Our affordable pre and post type rating training for A320 & B737 includes study materials based on previous exam questions and comprehensive preparation tailored for exams conducted by major airlines like Air India Express, IndiGo, and Air India."
  },
  {
    question: "Do you help with interview preparation?",
    answer: "Yes, we offer specialized preparation focusing on English language proficiency and building confidence specifically for airline interviews."
  },
   {
    question: "How often do new batches start?",
    answer: "We have frequent batches starting for all subjects. Please contact us for the latest schedule and availability."
  }
];

// Animation Variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
};

const FAQ: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />

      {/* Page Header */}
       <motion.section
        className="relative h-[40vh] flex items-center justify-center text-center text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img 
          src={faqHeaderUrl} 
          alt="Question marks background" 
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ filter: 'brightness(0.6)' }} 
        />
        <motion.div 
          className="relative z-10 max-w-3xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">Frequently Asked Questions</h1>
          <p className="text-lg md:text-xl text-foreground/80 mt-2">Your questions about Aviators Training Centre, answered.</p>
        </motion.div>
      </motion.section>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-16">
        
        <motion.section
           variants={sectionVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, amount: 0.1 }}
           className="max-w-4xl mx-auto"
        >
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqData.map((faq, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <AccordionItem value={`item-${index}`} className="bg-card border border-border/40 rounded-lg overflow-hidden px-6 shadow-sm">
                        <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary transition-colors py-4">
                           {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="pt-1 pb-4 text-foreground/70">
                           {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                  </motion.div>
              ))}
            </Accordion>
        </motion.section>

        {/* Contact Us CTA */}
         <motion.section 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }} 
            className="text-center mt-20 py-12 px-6 bg-secondary/10 rounded-lg"
        > 
            <MessageCircle className="h-12 w-12 text-secondary mx-auto mb-4" /> {/* Changed icon */} 
            <h2 className="text-3xl font-bold mb-4">Didn't Find Your Answer?</h2>
            <p className="max-w-xl mx-auto text-foreground/70 mb-8">
                Our team is ready to help with any specific questions you have about our programs, enrollment, or support. Reach out today!
            </p>
             {/* Link to WhatsApp or Contact Page */}
             <div className="flex justify-center space-x-4">
                 <a href="https://wa.me/919485687609" target="_blank" rel="noopener noreferrer">
                   <Button size="lg" variant="secondary">Chat on WhatsApp</Button>
                </a>
                <Link to="/contact">
                    <Button size="lg" variant="outline">Contact Us Directly</Button>
                </Link>
             </div>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
