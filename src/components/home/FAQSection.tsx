
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FAQSection = () => {
  const faqs = [
    {
      question: "How long does it take to complete your online training programs?",
      answer: "Our online training programs are self-paced, but most students complete their chosen course in 3-6 months, studying 10-15 hours per week. The timeline depends on your learning pace, prior knowledge, and the specific program you enroll in."
    },
    {
      question: "What are the costs associated with your training?",
      answer: "Our online training programs range from $1,500-$3,500 depending on the course level and material covered. We offer transparent pricing with no hidden fees and various financing options to make training accessible. All course materials, simulator sessions, and mentor support are included in the price."
    },
    {
      question: "Do you offer flight hours or practical training?",
      answer: "No, we focus exclusively on theory, exam preparation, and interview coaching. Our online academy specializes in preparing pilots for CPL/ATPL written exams and airline interviews. For practical flight hours, you would need to work with a local flight school."
    },
    {
      question: "Can I start training with zero experience?",
      answer: "Absolutely! Our programs are designed to accommodate students with no prior aviation experience. Our structured curriculum and experienced instructors will guide you through every step of the theoretical knowledge required for your aviation career."
    },
    {
      question: "How do you deliver simulator training online?",
      answer: "We use advanced desktop flight simulation software that you install on your computer. Our instructors connect remotely to guide you through scenarios in real-time. For students pursuing professional certifications, we can recommend partner facilities for in-person simulator assessments when required."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section id="faq" className="section-padding py-20 my-12 bg-[#73B5BD]/10 dark:bg-aviation-primary/20">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-aviation-primary dark:text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Find answers to common questions about our online flight training, requirements, 
            and the path to becoming a certified pilot.
          </p>
        </motion.div>

        <motion.div 
          className="max-w-3xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                transition={{ duration: 0.3 }}
              >
                <AccordionItem 
                  value={`item-${index}`} 
                  className="border border-gray-200 dark:border-gray-700 rounded-lg mb-4 shadow-sm bg-white dark:bg-aviation-primary/40 overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 dark:hover:bg-aviation-primary/60 font-medium text-aviation-primary dark:text-white">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pt-2 pb-4 text-gray-600 dark:text-gray-300">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        <div className="mt-10 text-center">
          <Button 
            className="bg-aviation-secondary hover:bg-[#219099] text-white transform transition-transform duration-300 hover:scale-105"
            asChild
          >
            <Link to="/faq">View All FAQs</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
