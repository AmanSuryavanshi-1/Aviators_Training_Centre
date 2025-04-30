import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/components/ui/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileSignature, Lightbulb, Rocket } from 'lucide-react';


interface AboutSectionProps {
    whoWeAre: string;
    ourMission: string;
    ourVision: string;
}

const AboutSection: React.FC<AboutSectionProps> = ({ whoWeAre, ourMission, ourVision }) => {

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

    const sectionData = [
        {
            title: "Who We Are",
            content: whoWeAre,
            imageUrl: "/About/About4.avif",
            icon: FileSignature,
        },
        {
            title: "Our Mission",
            content: ourMission,
            imageUrl: "/About/About5.avif",
            icon: Lightbulb,
        },
        {
            title: "Our Vision",
            content: ourVision,
            imageUrl: "/About/About6.avif",
            icon: Rocket,
        },
    ];

    return (
        <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="py-16 px-4 md:px-16"
        >
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
                {sectionData.map((section, index) => (
                    <motion.div key={index} variants={itemVariants} className="flex">
                        <motion.div
                            className="relative h-full w-full group"
                            whileHover="hover"
                            initial="rest"
                            animate="rest"
                            variants={cardHoverEffect}
                        >
                            <Card className="bg-card text-foreground w-full h-full flex flex-col overflow-hidden rounded-lg shadow-sm border border-border transition-shadow duration-300 relative z-10">
                                <CardHeader className="p-0 flex-shrink-0">
                                    <div className="relative w-full h-60 md:h-48">
                                        <Image
                                            src={section.imageUrl}
                                            alt={section.title}
                                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                            fill
                                            loading="lazy"
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 flex-grow flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-4">
                                        <section.icon className={cn("h-7 w-7", 'text-teal-600 dark:text-teal-300')} />
                                    </div>
                                    <CardTitle className="text-foreground text-xl font-bold mb-2">
                                        {section.title}
                                    </CardTitle>
                                    <CardDescription className="text-foreground/80 text-sm leading-relaxed">
                                        {section.content}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
};

export default AboutSection;
