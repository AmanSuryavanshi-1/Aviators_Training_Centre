"use client"
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { TransparentButton } from '@/components/shared/TransparentButton';
import { PhoneForwarded } from 'lucide-react';

const InstructorsPage: React.FC = () => {
  const instructors = [
    {
      name: 'Dhruv Shirkoli',
      title: 'Senior Instructor - CPL',
      image: '/Instructor/Dhruv Shirkoli.webp',
      bio: 'An accomplished Commercial Pilot with a deep understanding of aviation regulations and technical knowledge. Passionate about nurturing the next generation of pilots.',
      expertise: ["Air Regulations", "Technical General", "Flight Instruction", "Aerodynamics"]
    },
    {
      name: 'Ankit Kumar',
      title: 'Lead Instructor - ATPL',
      image: '/Instructor/Ankit Kumar.png',
      bio: 'A seasoned Airline Captain and Educator, bringing real-world airline experience to the classroom. Dedicated to guiding aspiring pilots through the intricacies of ATPL.',
      expertise: ["Advanced Navigation", "Aviation Meteorology", "Airline Operations", "Aircraft Systems"]
    },
    {
      name: "Shubham",
      title: "RTR(A) Specialist",
      image: "/Instructor/Instructor3.webp",
      bio: "Expert in aviation communication, specializing in Radio Telephony. Committed to ensuring clear and efficient communication practices in aviation.",
      expertise: ["Radio Telephony", "Aviation English", "Exam Preparation", "ATC Procedures"]
    }
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="container mx-auto px-4 py-16"
    >
      <h1 className="text-4xl font-bold text-center mb-12">Our Instructors</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 items-stretch">
        {instructors.map((instructor, index) => (
            <div
                key={index}
                className="bg-card w-full h-full flex flex-col overflow-hidden rounded-lg shadow-sm border border-border transition-shadow duration-300 relative z-10"
            >
            <div className="relative w-full h-64">
              <Image
                src={instructor.image}
                alt={instructor.name}
                fill
                className="object-cover"
                    sizes="100vw"
              />
            </div>
             <div className="p-4 text-center">
                <h3 className="text-lg font-semibold">{instructor.name}</h3>
                <p className="text-gray-600">{instructor.title}</p>
                <p className="mt-2 text-gray-800">{instructor.bio}</p>
                 <div className="mt-2">
                        <h4 className="text-xs font-semibold uppercase text-foreground/60 tracking-wider">Expertise:</h4>
                        <div className="flex flex-wrap justify-center gap-1.5">
                            {instructor.expertise.map(area => (
                                <div key={area} className="text-xs bg-teal-100/80 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200 border border-teal-300/50 dark:border-teal-700/50 px-2 py-1 rounded-full">{area}</div>
                            ))}
                        </div>
                    </div>
                <div className="mt-4">
                  <Link href="/contact#contact-form" className="text-center">
                      <TransparentButton
                          href="/contact#contact-form"
                          icon={PhoneForwarded} // Or MessageCircle
                          label="Contact Us"
                        />
                    </Link>
                </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold">{instructor.name}</h3>
              <p className="text-gray-600">{instructor.title}</p>
              <p className="mt-2 text-gray-800">{instructor.bio}</p>
              <div className="mt-4">
                    <TransparentButton
                          href="/contact#contact-form"
                          icon={PhoneForwarded} // Or MessageCircle
                          label="Contact Us"
                        />
              </div>
            </div>
            </div>
        ))}
      </div>
    </motion.section>
  );
};

export default InstructorsPage;
