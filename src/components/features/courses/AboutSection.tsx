import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FileSignature, ArrowRight } from 'lucide-react';
import { SolidButton } from '@/components/shared/SolidButton';

interface AboutSectionProps {
    title: string;
    content: string;
    image: string;
    reverse?: boolean;
}

const AboutSection: React.FC<AboutSectionProps> = ({ title, content, image, reverse = false }) => {
    // Animation variants
    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeInOut" } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    // Determine the order of content and image based on reverse prop
    const contentOrder = reverse ? "lg:order-2" : "";
    const imageOrder = reverse ? "lg:order-1" : "";

    return (
        <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="px-4 py-16 md:py-24 md:px-8 bg-background"
        >
            <div className="container mx-auto">
                <div className="flex flex-col gap-8 items-center lg:flex-row md:gap-12">
                    {/* Text content */}
                    <motion.div 
                        variants={itemVariants} 
                        className={`space-y-6 lg:w-1/2 ${contentOrder}`}
                    >
                        <div className="inline-flex items-center px-3 py-1 mb-2 text-sm font-medium text-teal-700 rounded-full bg-teal-100/50 dark:bg-teal-900/30 dark:text-teal-300">
                            <FileSignature className="mr-2 w-4 h-4" />
                            <span>{title}</span>
                        </div>
                        
                        <h1 className="text-3xl font-bold leading-tight text-teal-700 lg:text-4xl md:text-4xl dark:text-teal-300">
                            {title}
                        </h1>
                        
                        <p className="text-lg leading-relaxed text-foreground/80">
                            {content}
                        </p>
                        
                        <SolidButton
                            href="/contact"
                            icon={ArrowRight}
                            label="Get in Touch"
                            />
                    </motion.div>
                    
                    {/* Image */}
                    <motion.div 
                        variants={itemVariants} 
                        className={`lg:w-1/2 ${imageOrder}`}
                    >
                        <div className="relative h-[300px] md:h-[350px] lg:h-[400px] w-full rounded-xl overflow-hidden shadow-lg">
                            <Image
                                src={image}
                                alt={title}
                                className="object-cover"
                                fill
                                priority
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.section>
    );
};

export default AboutSection;
