import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import OptimizedImage from '@/components/shared/OptimizedImage';
import { TransparentButton } from '@/components/shared/TransparentButton';
import { cn } from '@/components/ui/utils';
import { ChevronRight } from 'lucide-react';
import { easingFunctions } from '@/lib/animations/easing';

const aviationSecondary = 'text-teal-600 dark:text-teal-400';
const FALLBACK_IMAGE = "/Course-Img.webp";

const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: easingFunctions.easeOut } }
};

const cardHoverEffect = {
    rest: { y: 0, boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.08)" },
    hover: { y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.12)", transition: { duration: 0.3, ease: easingFunctions.circOut } }
};

interface CourseCardProps {
    course: {
        icon: any;
        title: string;
        description: string;
        image: string;
        path: string;
    };
    index: number;
}

const CourseCard = memo(({ course, index }: CourseCardProps) => {
    return (
        <motion.li
            variants={itemVariants}
            className="flex"
        >
            <motion.div
                className="relative w-full h-full group rounded-3xl"
                whileHover="hover"
                initial="rest"
                animate="rest"
                variants={cardHoverEffect}
            >
                <Card className="flex overflow-hidden relative z-10 flex-col w-full h-full rounded-3xl border shadow-sm transition-shadow duration-300 bg-card border-border">
                    <CardHeader className="relative p-0">
                        {/* Image Section - Fixed Height */}
                        <div className="overflow-hidden h-48 relative"> {/* Fixed height */}
                            <OptimizedImage
                                src={course.image}
                                alt={course.title}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                fallbackSrc={FALLBACK_IMAGE}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-grow p-4">
                        {/* Title and Icon */}
                        <div className="flex items-center mb-3 space-x-3">
                            <div className={cn("flex-shrink-0 p-1.5 rounded-md bg-teal-100/70 dark:bg-teal-900/40", aviationSecondary)}>
                                <course.icon className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-lg font-semibold text-foreground">{course.title}</CardTitle>
                        </div>
                        {/* Description */}
                        <CardDescription className="flex-grow mb-4 text-sm text-foreground/80">
                            {course.description}
                        </CardDescription>
                    </CardContent>
                    <CardFooter className="p-5 pt-0 mt-auto">
                        {/* Replaced Button with TransparentButton */}
                        <TransparentButton
                            href={course.path}
                            icon={ChevronRight} // Using the same icon
                            label="View Course Details"
                            // Add className if specific sizing needed, e.g., "w-full min-h-[44px]"
                            className="w-full"
                        />
                    </CardFooter>
                </Card>
            </motion.div>
        </motion.li>
    );
});

CourseCard.displayName = 'CourseCard';

export default CourseCard;
