
import React from 'react';
import { Users, Calendar, Award, Headset, Plane, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const WhyChooseUs = () => {
  const features = [
    {
      icon: <Users className="h-10 w-10" />,
      title: 'Expert Instructors',
      description: 'Learn from certified flight instructors with thousands of hours of experience across commercial and military aviation.'
    },
    {
      icon: <Calendar className="h-10 w-10" />,
      title: 'Flexible Scheduling',
      description: 'Choose from flexible training schedules designed to accommodate your personal and professional commitments.'
    },
    {
      icon: <Award className="h-10 w-10" />,
      title: 'Industry Recognition',
      description: 'Our graduates are sought after by major airlines and aviation organizations worldwide.'
    },
    {
      icon: <Headset className="h-10 w-10" />,
      title: '24/7 Support',
      description: 'Access round-the-clock support from our dedicated team throughout your training journey.'
    },
    {
      icon: <Plane className="h-10 w-10" />,
      title: 'Modern Fleet',
      description: 'Train on a diverse fleet of well-maintained aircraft equipped with the latest avionics technology.'
    },
    {
      icon: <Shield className="h-10 w-10" />,
      title: 'Safety First',
      description: 'Your safety is our priority with rigorous maintenance standards and comprehensive safety protocols.'
    }
  ];

  // Animation variants for section
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Card hover variants
  const cardHoverVariants = {
    initial: { scale: 1, boxShadow: "0px 4px 10px rgba(0,0,0,0.05)" },
    hover: { 
      scale: 1.05, 
      boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
      transition: { duration: 0.3 }
    }
  };

  return (
    <section id="about" className="py-20 bg-background dark:bg-card/5">
      <div className="container mx-auto px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-aviation-navy dark:text-white mb-4">Why Choose Aviator Training Center</h2>
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
            We pride ourselves on delivering exceptional flight training through experienced instructors,
            state-of-the-art facilities, and a supportive learning environment.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              variants={cardVariants}
              whileHover="hover"
              initial="initial"
              variants={cardHoverVariants}
              className={cn(
                "bg-card rounded-lg p-8 shadow-md border border-border/10",
                "transform transition-all duration-300"
              )}
            >
              <div className="text-aviation-accent mb-6">{feature.icon}</div>
              <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-foreground/70 mb-4">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="inline-block"
          >
            <Button 
              className="bg-[#0C6E72] hover:bg-[#219099] text-white px-8 py-6 text-lg shadow-md hover:shadow-lg transition-all duration-300"
              asChild
            >
              <a href="/about">
                Learn More About Us
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
