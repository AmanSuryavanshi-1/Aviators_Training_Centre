
import React from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { BookOpen, Award, Plane, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const PilotPathway = () => {
  const steps = [
    {
      id: '1',
      title: 'Educational Qualification',
      icon: <BookOpen className="h-5 w-5 text-aviation-gold" />,
      content: (
        <>
          <p className="mb-2">A high school diploma or equivalent is the minimum requirement to begin flight training. For certain advanced programs:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Bachelor's degree recommended for airline career paths</li>
            <li>Strong foundation in mathematics and physics beneficial</li>
            <li>English proficiency required for international aviation communication</li>
          </ul>
        </>
      )
    },
    {
      id: '2',
      title: 'Medical Requirements',
      icon: <FileText className="h-5 w-5 text-aviation-gold" />,
      content: (
        <>
          <p className="mb-2">Obtain the appropriate medical certificate from an FAA-designated Aviation Medical Examiner (AME):</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Class 3 Medical Certificate - Required for Private Pilot License</li>
            <li>Class 2 Medical Certificate - Required for Commercial Pilot License</li>
            <li>Class 1 Medical Certificate - Required for Airline Transport Pilot License</li>
            <li>Vision requirements include 20/20 or corrected to 20/20 vision</li>
          </ul>
        </>
      )
    },
    {
      id: '3',
      title: 'Ground Training Course',
      icon: <Award className="h-5 w-5 text-aviation-gold" />,
      content: (
        <>
          <p className="mb-2">Comprehensive classroom instruction covering essential aviation theory:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Aerodynamics and aircraft systems</li>
            <li>Navigation and flight planning</li>
            <li>Aviation regulations and procedures</li>
            <li>Meteorology and weather interpretation</li>
            <li>Human factors and crew resource management</li>
          </ul>
          <p className="mt-2">Our ground training utilizes modern teaching methods, interactive simulations, and practice exams to ensure thorough preparation for FAA knowledge tests.</p>
        </>
      )
    },
    {
      id: '4',
      title: 'Flight Training Course',
      icon: <Plane className="h-5 w-5 text-aviation-gold" />,
      content: (
        <>
          <p className="mb-2">Hands-on training in the aircraft with certified flight instructors:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Basic flight maneuvers and procedures</li>
            <li>Cross-country flight planning and navigation</li>
            <li>Night flying operations</li>
            <li>Emergency procedures and situational awareness</li>
            <li>Instrument training (depending on program)</li>
          </ul>
          <p className="mt-2">Flight training progresses from basic skills to advanced operations, with regular progress checks to ensure competency before final examination with FAA examiners.</p>
        </>
      )
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
    <section id="programs" className="section-padding bg-[#73B5BD]/10 dark:bg-aviation-primary/20">
      <div className="container mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-aviation-primary dark:text-white mb-4">Your Path to Becoming a Pilot</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            The journey to earning your wings involves several key steps. Our structured program 
            guides you through each phase, from initial qualifications to your first solo flight.
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
            {steps.map((step) => (
              <motion.div
                key={step.id}
                variants={itemVariants}
                transition={{ duration: 0.3 }}
              >
                <AccordionItem 
                  value={step.id} 
                  className="border border-gray-200 dark:border-gray-700 rounded-lg mb-4 shadow-sm bg-white dark:bg-aviation-primary/40 overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 dark:hover:bg-aviation-primary/60">
                    <div className="flex items-center">
                      <div className="bg-aviation-navy/5 dark:bg-white/5 p-2 rounded-full mr-3">
                        {step.icon}
                      </div>
                      <span className="font-semibold text-lg text-aviation-primary dark:text-white">
                        {step.title}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pt-2 pb-4 text-gray-600 dark:text-gray-300">
                    {step.content}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default PilotPathway;
