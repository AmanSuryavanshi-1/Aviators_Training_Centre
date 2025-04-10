
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CTASection = () => {
  return (
    <section className="relative py-20 overflow-hidden parallax-container">
      {/* Background image with overlay */}
      <motion.div 
        className="parallax-bg"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1612051528446-895ced594c40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80)' }}
        animate={{
          y: [-10, 0, -10],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-aviation-primary/80 to-aviation-secondary/80"></div>
      </motion.div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="max-w-3xl mx-auto text-center text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Pursue Your Aviation Dreams?</h2>
          <p className="text-lg md:text-xl mb-8 text-white/90">
            Take the first step toward a rewarding career in aviation. 
            Schedule a meeting with our admissions team or contact us today.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              className="bg-aviation-secondary hover:bg-aviation-secondary/90 text-white text-lg px-8 py-6 btn-hover-effect"
              asChild
            >
              <Link to="/schedule">
                Schedule Meeting
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-6 btn-hover-effect"
              asChild
            >
              <Link to="/contact">
                Contact Us <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
