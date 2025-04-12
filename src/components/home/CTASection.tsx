
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Award, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

const CTASection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  // Parallax effect values
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  
  // Button hover animation variants
  const buttonHoverVariants = {
    initial: { scale: 1, boxShadow: "0px 0px 0px rgba(0,0,0,0)" },
    hover: { 
      scale: 1.05, 
      boxShadow: "0px 10px 20px rgba(0,0,0,0.2)",
      transition: { duration: 0.3 }
    }
  };
  
  // Trust signals animation variants
  const trustSignalVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * i,
        duration: 0.5
      }
    })
  };
  
  // Trust signals data
  const trustSignals = [
    { icon: <Shield className="h-5 w-5" />, text: "SSL Secured Payment" },
    { icon: <Award className="h-5 w-5" />, text: "100% Satisfaction Guarantee" },
    { icon: <CheckCircle className="h-5 w-5" />, text: "30-Day Money Back" }
  ];

  return (
    <section ref={ref} className="relative py-24 overflow-hidden bg-gradient-to-b from-background to-card/30">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1612051528446-895ced594c40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center bg-fixed opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#075E68]/90 to-[#0C6E72]/90"></div>
      
      <div className="container mx-auto px-8 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center text-white"
          style={{ y }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Ready to Pursue Your Aviation Dreams?</h2>
          <p className="text-lg md:text-xl mb-10 text-white/90 max-w-3xl mx-auto">
            Take the first step toward a rewarding career in aviation. 
            Schedule a free consultation with our admissions team or contact us today.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
            <motion.div
              variants={buttonHoverVariants}
              initial="initial"
              whileHover="hover"
            >
              <Button 
                className="bg-[#0C6E72] hover:bg-[#219099] text-white text-lg px-8 py-6 w-full sm:w-auto transition-colors duration-300"
                asChild
              >
                <Link to="/schedule">
                  Schedule Free Consultation
                </Link>
              </Button>
            </motion.div>
            
            <motion.div
              variants={buttonHoverVariants}
              initial="initial"
              whileHover="hover"
            >
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 text-lg px-8 py-6 w-full sm:w-auto transition-colors duration-300"
                asChild
              >
                <Link to="/contact">
                  Contact Us <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
          
          {/* Trust Signals */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-8">
            {trustSignals.map((signal, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={trustSignalVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex items-center gap-2 text-white/90"
              >
                {signal.icon}
                <span>{signal.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
