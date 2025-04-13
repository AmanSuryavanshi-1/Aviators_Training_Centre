import React from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from 'framer-motion';
import FAQ from '@/components/shared/FAQ';

const faqHeaderUrl = "https://images.unsplash.com/photo-1516797043888-58a406f03f2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8cXVlc3Rpb24lMjBtYXJrfHx8fHx8MTYxODU0OTYxNg&ixlib=rb-1.2.1&q=80&w=1080";

const FAQPage: React.FC = () => {
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
      <main className="flex-grow">
        <FAQ showAll={true} showHeader={false} headerImage={faqHeaderUrl} />
      </main>

      <Footer />
    </div>
  );
};

export default FAQPage;
