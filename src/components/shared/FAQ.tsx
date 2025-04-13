import React from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MessageCircle, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

// Animation Variants
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

export const faqData = [
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
    answer: "We provide 24/7 support to clear your doubts. Our dedicated team is available round-the-clock via WhatsApp to assist you whenever you're stuck on a concept."
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

interface FAQProps {
  showAll?: boolean;
  showHeader?: boolean;
  showCTA?: boolean;
  className?: string;
  headerImage?: string;
}

const FAQ: React.FC<FAQProps> = ({ 
  showAll = false, 
  showHeader = true, 
  showCTA = true,
  className = "",
  headerImage = "https://images.unsplash.com/photo-1516797043888-58a406f03f2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8cXVlc3Rpb24lMjBtYXJrfHx8fHx8MTYxODU0OTYxNg&ixlib=rb-1.2.1&q=80&w=1080"
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
            <motion.div 
              className="flex justify-center mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-aviation-primary/10 dark:bg-aviation-tertiary/20 p-3 rounded-full">
                <HelpCircle className="h-8 w-8 text-aviation-primary dark:text-aviation-tertiary" />
              </div>
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-aviation-primary dark:text-aviation-tertiary mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Find answers to common questions about our online flight training, requirements, 
              and the path to becoming a certified pilot.
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
                    value={`item-${index}`} 
                    className="border-b border-border last:border-0 overflow-hidden bg-white/50 dark:bg-aviation-primary/10 rounded-md my-2 shadow-sm"
                  >
                    <AccordionTrigger className="text-left text-sm md:text-base font-medium text-foreground hover:text-aviation-primary dark:hover:text-aviation-tertiary transition-colors py-5 px-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground px-4 pb-5 leading-relaxed">
                      {faq.answer}
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
            <Button 
              className="bg-aviation-tertiary hover:bg-aviation-secondary text-white transform transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
              asChild
              size="lg"
            >
              <Link to="/faq">View All FAQs</Link>
            </Button>
          </motion.div>
        )}

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
            <h2 className="text-3xl font-bold mb-4 text-aviation-primary dark:text-aviation-tertiary">Didn't Find Your Answer?</h2>
            <p className="max-w-xl mx-auto text-foreground/70 mb-8">
              Our team is ready to help with any specific questions you have about our programs, enrollment, or support. Reach out today!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <a href="https://wa.me/919485687609" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-aviation-tertiary hover:bg-aviation-secondary text-white w-full sm:w-auto shadow-md hover:shadow-lg">
                    Chat on WhatsApp
                  </Button>
                </a>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="border-aviation-primary dark:border-aviation-tertiary text-aviation-primary dark:text-aviation-tertiary hover:bg-aviation-primary/5 dark:hover:bg-aviation-tertiary/10 w-full sm:w-auto">
                    Contact Us Directly
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.section>
        )}
      </div>
    </section>
  );
};

export default FAQ;