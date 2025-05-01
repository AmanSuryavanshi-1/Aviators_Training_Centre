import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/components/ui/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileSignature, Lightbulb, Rocket, BookOpenCheck, ArrowRight } from 'lucide-react';
import { SolidButton } from '../shared/SolidButton';

interface AboutSectionProps {
    whoWeAre: string;
}

const AboutSection: React.FC<AboutSectionProps> = ({ whoWeAre }) => {
    // Animation variants
    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeInOut" } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    const cardHoverEffect = {
        rest: { scale: 1, transition: { duration: 0.3, ease: "easeInOut" } },
        hover: { scale: 1.03, transition: { duration: 0.3, ease: "easeInOut" } }
    };

    // Fixed, concise, SEO-friendly descriptions for each section
    const cardsData = [
        {
            title: "Our Story",
            content: "Founded by experienced aviation professionals, Aviators Training Centre emerged from a vision to transform pilot training in India. Since 2015, we've helped hundreds of aspiring pilots achieve their DGCA certifications through our specialized online ground school. Our journey began with a commitment to excellence and accessibility in aviation education, creating a supportive community where future aviators can thrive and succeed in their licensing exams.",
            imageUrl: "/HomePage/Hero2.webp", // Using available image
            icon: BookOpenCheck,
        },
        {
            title: "Our Mission",
            content: "At Aviators Training Centre, our mission is to provide comprehensive, accessible, and high-quality aviation ground training that prepares students to excel in DGCA examinations and their future careers. We are dedicated to bridging the knowledge gap in pilot training through innovative online education, expert instruction from airline professionals, and personalized learning experiences that accommodate diverse schedules and learning styles.",
            imageUrl: "/HomePage/Hero3.webp", // Using available image
            icon: Lightbulb,
        },
        {
            title: "Our Vision",
            content: "We envision becoming India's premier online aviation training institute, recognized for excellence in DGCA exam preparation and professional development. Our goal is to create a new generation of highly qualified pilots who meet international standards of knowledge and professionalism. Through continuous innovation in digital learning and industry partnerships, we aim to shape the future of aviation education in India and beyond.",
            imageUrl: "/HomePage/Hero4.webp", // Using available image
            icon: Rocket,
        },
    ];

    return (
        <>
            {/* Hero Section - Who We Are */}
            <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="px-4 py-16 md:py-24 md:px-8 bg-background"
            >
                <div className="container mx-auto">
                    <div className="flex flex-col gap-8 items-center lg:flex-row md:gap-12">
                        {/* Left side - Text content */}
                        <motion.div 
                            variants={itemVariants} 
                            className="space-y-6 lg:w-1/2"
                        >
                            <div className="inline-flex items-center px-3 py-1 mb-2 text-sm font-medium text-teal-700 rounded-full bg-teal-100/50 dark:bg-teal-900/30 dark:text-teal-300">
                                <FileSignature className="mr-2 w-4 h-4" />
                                <span>Who We Are</span>
                            </div>
                            
                            <h1 className="text-3xl font-bold leading-tight text-teal-700 md:text-3xl lg:text-4xl">
                                Aviators Training Centre
                            </h1>
                            
                            <p className="text-lg leading-relaxed text-foreground/80">
                                {whoWeAre}
                            </p>
                            
                            <SolidButton
                                href="/contact"
                                icon={ArrowRight} // Using the same icon
                                label="Get in Touch"
                                />
                        </motion.div>
                        
                        {/* Right side - Image */}
                        <motion.div 
                            variants={itemVariants} 
                            className="lg:w-1/2"
                        >
                            <div className="relative h-[300px] md:h-[350px] lg:h-[400px] w-full rounded-xl overflow-hidden shadow-lg">
                                <Image
                                    src="/Plane2.webp" // Using available image
                                    alt="Aviators Training Centre"
                                    className="object-cover"
                                    fill
                                    priority
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>
            
            {/* Our Story, Mission, Vision Cards */}
            <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="px-4 py-16 md:px-8 bg-muted/30 dark:bg-muted/10"
            >
                <div className="container mx-auto">
                    <motion.div variants={itemVariants} className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-teal-700 md:text-4xl dark:text-teal-300">
                            Our Aviation Journey
                        </h2>
                        <p className="mx-auto max-w-3xl text-lg text-foreground/80">
                            Discover our story, mission, and vision that drive us to provide exceptional aviation training.
                        </p>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-10">
                        {cardsData.map((card, index) => (
                            <motion.div 
                                key={index} 
                                variants={itemVariants} 
                                className="flex"
                            >
                                <motion.div
                                    className="relative w-full h-full"
                                    whileHover="hover"
                                    initial="rest"
                                    animate="rest"
                                    variants={cardHoverEffect}
                                >
                                    <Card className="flex overflow-hidden flex-col h-full rounded-xl border shadow-md bg-card border-border">
                                        <CardHeader className="relative flex-shrink-0 p-0">
                                            <div className="relative w-full h-56">
                                                <Image
                                                    src={card.imageUrl}
                                                    alt={card.title}
                                                    className="object-cover transition-transform duration-500 hover:scale-105"
                                                    fill
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t to-transparent from-black/60"></div>
                                                <div className="flex absolute bottom-4 left-4 items-center">
                                                    <div className="p-2 mr-3 rounded-full bg-white/90 dark:bg-black/70">
                                                        <card.icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-white drop-shadow-sm">{card.title}</h3>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-grow p-6">
                                            <p className="leading-relaxed text-foreground/80">
                                                {card.content}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>
        </>
    );
};

export default AboutSection;
