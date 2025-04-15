
import React from 'react';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const InstructorsSection = () => {
  // Instructor data with images from restructured public folder
  const instructors = [
    {
      name: 'Capt. Michael Reynolds',
      position: 'Chief Flight Instructor',
      image: '/Instructor/Instructor1.webp',
      bio: 'Former airline captain with over 15,000 flight hours. Specialized in Boeing 737 and Airbus A320 type ratings.',
      social: {
        facebook: 'https://facebook.com',
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com'
      }
    },
    {
      name: 'Sarah Martinez',
      position: 'Advanced Training Specialist',
      image: '/Instructor/Instructor2.webp',
      bio: 'Commercial pilot with extensive experience in instrument training and aerobatics. FAA certified with 8,000+ flight hours.',
      social: {
        facebook: 'https://facebook.com',
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com'
      }
    },
    {
      name: 'David Chen',
      position: 'Ground School Director',
      image: '/Instructor/Instructor3.webp',
      bio: 'Aerospace engineer with a passion for teaching. Specializes in aviation theory, navigation, and flight planning.',
      social: {
        facebook: 'https://facebook.com',
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com'
      }
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section id="instructors" className="section-padding bg-[#73B5BD]/10 dark:bg-aviation-primary/20">
      <div className="container mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-aviation-primary dark:text-white mb-4">Meet Our Expert Instructors</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Learn from industry professionals with decades of combined experience in commercial, 
            military, and private aviation sectors. Fly high with ATC!
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {instructors.map((instructor, index) => (
            <motion.div 
              key={index} 
              className="bg-white dark:bg-aviation-primary/40 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-500"
              variants={itemVariants}
              whileHover={{ y: -10 }}
            >
              <div className="h-64 overflow-hidden">
                <img 
                  src={instructor.image} 
                  alt={instructor.name} 
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-110"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-aviation-primary dark:text-white">{instructor.name}</h3>
                <p className="text-aviation-secondary font-medium mb-3">{instructor.position}</p>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{instructor.bio}</p>
                <div className="flex space-x-3">
                  <a 
                    href={instructor.social.facebook} 
                    className="text-gray-400 hover:text-aviation-primary dark:hover:text-aviation-secondary transition-colors duration-300"
                    aria-label={`${instructor.name}'s Facebook`}
                  >
                    <Facebook size={18} />
                  </a>
                  <a 
                    href={instructor.social.twitter} 
                    className="text-gray-400 hover:text-aviation-primary dark:hover:text-aviation-secondary transition-colors duration-300"
                    aria-label={`${instructor.name}'s Twitter`}
                  >
                    <Twitter size={18} />
                  </a>
                  <a 
                    href={instructor.social.linkedin} 
                    className="text-gray-400 hover:text-aviation-primary dark:hover:text-aviation-secondary transition-colors duration-300"
                    aria-label={`${instructor.name}'s LinkedIn`}
                  >
                    <Linkedin size={18} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Button 
            className="bg-aviation-secondary hover:bg-[#219099] text-white transform transition-transform duration-300 hover:scale-105"
            asChild
          >
            <Link to="/instructors">Meet All Instructors</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default InstructorsSection;
