"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import NextLink from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/components/ui/utils';
import Image from 'next/image';
import { usePathname } from 'next/navigation'; // Import usePathname
import { useTheme } from 'next-themes';

import { ThemeToggle } from '@/components/ThemeToggle';
import { ContactButton } from '@/components/shared/ContactButton';
import { Home, Info, BookOpen, Users, HelpCircle, Sun, Moon } from 'lucide-react'; // Added icons

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false); // Add mounted state
  const pathname = usePathname(); // Use usePathname hook
  const { theme } = useTheme(); // Get the current theme

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Set mounted state after initial render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Updated Nav Links for ATC structure
  // Updated Nav Links with icons
  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/about', label: 'About Us', icon: Info },
    { href: '/courses', label: 'Training Programs', icon: BookOpen },
    { href: '/instructors', label: 'Instructors', icon: Users },
    { href: '/faq', label: 'FAQ', icon: HelpCircle },
  ];

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      scrolled
        ? "border-b shadow-sm backdrop-blur-xl border-border/40 bg-background/60 supports-[backdrop-filter]:bg-background/40 dark:bg-teal-950/85 dark:supports-[backdrop-filter]:bg-teal-950/75 dark:border-teal-800/60"
        : "backdrop-blur-xl bg-background/60 supports-[backdrop-filter]:bg-background/40 dark:bg-teal-950"
    )}>
      {/* Reduced horizontal padding: px-2 sm:px-4 md:px-5 lg:px-6 */}
      <div className="container flex items-center justify-between px-2 mx-auto h-14 sm:h-16 sm:px-4 md:px-5 lg:px-6">
        {/* Logo with Image */}
        <NextLink href="/" className="flex items-center group shrink-0">
          {/* Adjusted logo size slightly for better balance with reduced padding */}
          <div className="relative h-8 overflow-hidden sm:h-10 md:h-12 lg:h-14 w-24 sm:w-32 md:w-40 lg:w-48">
            {mounted && ( // Conditionally render based on mounted state
              <Image
                src={theme === 'dark' ? '/AVIATORS_TRAINING_CENTRE_LOGO_DarkMode.png' : '/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png'}
                alt="Aviators Training Centre Logo"
                fill // Use fill for responsive sizing within the container
                sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, (max-width: 1024px) 160px, 192px" // Provide sizes hint
                className="object-contain transition-transform duration-500 transform group-hover:scale-105"
                priority
              />
            )}
            {!mounted && ( // Optional: Render a placeholder or the light logo initially to prevent layout shift
              <Image
                src={'/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png'} // Default to light mode logo before mount
                alt="Aviators Training Centre Logo"
                fill
                sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, (max-width: 1024px) 160px, 192px"
                className="object-contain transition-transform duration-500 transform group-hover:scale-105"
                priority
                aria-hidden="true" // Hide placeholder from screen readers
              />
            )}
          </div>
        </NextLink>

        {/* Desktop Navigation - Hidden on mobile */}
        {/* Reduced spacing: space-x-2 md:space-x-3 lg:space-x-6 */}
        <nav className="items-center hidden space-x-2 text-sm font-medium md:space-x-3 lg:space-x-5 md:flex">
          {navLinks.map((link) => (
            <NextLink
              key={link.href}
              href={link.href}
              className={cn(
                "relative py-2 px-1 text-sm transition-colors hover:text-primary dark:hover:text-teal-300 whitespace-nowrap flex items-center gap-1.5", // Added flex, items-center, gap
                pathname === link.href
                  ? "text-primary font-semibold dark:text-teal-300" // Enhanced dark mode active color
                  : "text-foreground/70 dark:text-foreground/80" // Enhanced dark mode inactive color
              )}
            >
              <link.icon className="w-4 h-4 opacity-80" /> {/* Added icon */}
              <span>{link.label}</span> {/* Wrapped label in span */}
              {pathname === link.href && (
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-teal-500 to-blue-500 dark:from-teal-400 dark:to-blue-400 rounded-full"
                  layoutId="navIndicator"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
            </NextLink>
          ))}
        </nav>

        {/* Right side buttons */}
        {/* Reduced gap: gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 */}
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3">
          <ThemeToggle />
          {/* Adjusted scale slightly */}
          <ContactButton href="/contact" className="scale-80 sm:scale-90 md:scale-95 lg:scale-100" />
        </div>

        {/* Mobile Navigation Trigger - Shown only on mobile */}
        <div className="flex items-center md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8 sm:w-9 sm:h-9">
                <Menu className="w-5 h-5 sm:w-5 sm:h-5 text-foreground dark:text-foreground/90" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full max-w-xs p-6 border-l bg-background dark:bg-teal-950 dark:border-teal-800/60"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="flex flex-col h-full">
                <div className="flex flex-col flex-grow space-y-5 overflow-y-auto">
                  {navLinks.map((link) => (
                    <NextLink
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "text-lg transition-colors py-2 flex items-center gap-2", // Added flex, items-center, gap
                        pathname === link.href
                          ? "text-primary font-semibold dark:text-teal-300"
                          : "text-foreground/80 hover:text-primary dark:text-foreground/80 dark:hover:text-teal-300"
                      )}
                      onClick={() => setIsOpen(false)}>
                      <link.icon className="w-5 h-5 opacity-80" /> {/* Added icon */}
                      {link.label}
                    </NextLink>
                  ))}
                </div>
                {/* Optional: Add ThemeToggle/ContactButton to bottom of mobile menu */}
                {/* <div className="pt-4 mt-auto border-t border-border/40 dark:border-teal-800/60 flex justify-between items-center">
                  <ThemeToggle />
                  <ContactButton href="/contact" onClick={() => setIsOpen(false)} />
                </div> */}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
