import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarCheck } from 'lucide-react';
import { cn } from "@/components/ui/utils";

// Static version of the first slide for immediate LCP rendering
export const StaticHero = () => {
    // Constants from HeroSection Slide 1
    const slide = {
        image: '/HomePage/Hero3.webp',
        title: 'Your Pilot Career Starts Here',
        subtitle: 'Master DGCA exams with expert-led online ground school.',
        buttonText: 'Explore Courses',
        buttonLink: '/courses'
    };

    return (
        <section className="relative h-[70vh] md:h-[80vh] lg:h-[90vh] w-full overflow-hidden">
            {/* Background Image - Priority LCP Element */}
            <div className="absolute inset-0 w-full h-full">
                <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    priority={true}
                    quality={85}
                    sizes="100vw"
                    loading="eager"
                    fetchPriority="high"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAME/8QAIRAAAgIBAwUBAAAAAAAAAAAAAQIAAxEEITESQVFhcYH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AqtN7K4toYbEg77Hzfhq/Dl/cRAf/2Q=="
                />
            </div>

            {/* Content Overlay */}
            <div className="flex relative z-10 justify-center items-center p-4 h-full bg-black/30 sm:p-8">
                <div className="mx-auto max-w-4xl text-center text-white">
                    <h1 className="mb-4 text-2xl font-bold tracking-tight drop-shadow-lg sm:text-3xl md:text-5xl lg:text-6xl">
                        {slide.title}
                    </h1>
                    <p className="mx-auto mb-8 max-w-3xl text-sm drop-shadow-md sm:text-base md:text-xl text-white/95">
                        {slide.subtitle}
                    </p>

                    {/* Static Action Buttons */}
                    <div className="flex flex-wrap justify-center gap-3 w-full max-w-md mx-auto">
                        {/* Primary Button */}
                        <Link
                            href={slide.buttonLink}
                            className={cn(
                                "group relative rounded-full px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 overflow-hidden bg-teal-600 text-white shadow-md transition-all duration-300 ease-out hover:bg-teal-700 hover:shadow-lg dark:bg-teal-500 dark:hover:bg-teal-600 w-full sm:w-auto min-h-[44px] sm:min-h-[48px] text-sm sm:text-base flex items-center justify-center flex-1 w-auto min-w-[140px]"
                            )}
                        >
                            <span className="relative z-10 flex items-center justify-center">
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                <span>{slide.buttonText}</span>
                            </span>
                        </Link>

                        {/* Demo Button */}
                        <Link
                            href="/contact#contact-form"
                            className={cn(
                                "group relative rounded-full px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 overflow-hidden border-2 border-teal-500 shadow-sm transition-all duration-300 ease-out hover:bg-teal-500 hover:text-white hover:shadow-md dark:border-teal-400 dark:hover:bg-teal-500 dark:hover:text-white w-full sm:w-auto min-h-[44px] sm:min-h-[48px] text-sm sm:text-base flex items-center justify-center flex-1 w-auto min-w-[140px] border-white bg-transparent/30 dark:border-white text-white"
                            )}
                        >
                            <span className="relative z-10 flex items-center justify-center">
                                <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                <span>Book a Demo</span>
                            </span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Static Indicators Placeholder */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white scale-125" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/50" />
            </div>
        </section>
    );
};
