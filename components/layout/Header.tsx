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
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/courses', label: 'Training Programs' }, 
    { href: '/instructors', label: 'Instructors' },
    { href: '/faq', label: 'FAQ' },
    // { href: '/schedule', label: 'Schedule' }, // Consider if scheduling page is needed, maybe link to contact?
  ];

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      scrolled 
        ? "border-b shadow-sm backdrop-blur-xl border-border/40 bg-background/60 supports-[backdrop-filter]:bg-background/40 dark:bg-teal-900/80 dark:supports-[backdrop-filter]:bg-teal-900/60"
        : "backdrop-blur-xl bg-background/60 supports-[backdrop-filter]:bg-background/40 dark:bg-teal-950"
    )}>
      <div className="container flex items-center justify-between px-3 mx-auto h-14 sm:h-16 sm:px-4 md:px-6 lg:px-8">
        {/* Logo with Image */}
        <NextLink href="/" className="flex items-center group">
          <div className="relative h-8 overflow-hidden sm:h-12 md:h-14 lg:h-16 w-28 sm:w-40 md:w-48 lg:w-60">
            {mounted && ( // Conditionally render based on mounted state
              <Image
                src={theme === 'dark' ? '/AVIATORS_TRAINING_CENTRE_LOGO_DarkMode.png' : '/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png'}
                alt="Aviators Training Centre Logo"
                width={128}
                height={64}
                className="object-contain transition-transform duration-500 transform group-hover:scale-105"
                priority
              />
            )}
            {!mounted && ( // Optional: Render a placeholder or the light logo initially to prevent layout shift
              <Image
                src={'/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png'} // Default to light mode logo before mount
                alt="Aviators Training Centre Logo"
                width={128}
                height={64}
                className="object-contain transition-transform duration-500 transform group-hover:scale-105"
                priority
                aria-hidden="true" // Hide placeholder from screen readers
              />
            )}
          </div>
        </NextLink>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="items-center hidden space-x-3 text-sm font-medium md:space-x-4 lg:space-x-8 md:flex">
          {navLinks.map((link) => (
            <NextLink 
              key={link.href} 
              href={link.href} 
              className={cn(
                "relative py-2 px-1 text-sm transition-colors hover:text-primary whitespace-nowrap",
                pathname === link.href
                  ? "text-primary font-semibold" 
                  : "text-foreground/80"
              )}
            >
              {link.label}
              {pathname === link.href && (
                <motion.div 
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"
                  layoutId="navIndicator"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
            </NextLink>
          ))}
        </nav>

        {/* Right side buttons */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4">
          <ThemeToggle />
          <ContactButton href="/contact" className="scale-75 sm:scale-85 md:scale-90 lg:scale-100" />
        </div>

        {/* Mobile Navigation Trigger - Shown only on mobile */}
        <div className="flex items-center md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8 sm:w-9 sm:h-9">
                <Menu className="w-5 h-5 sm:w-5 sm:h-5 text-foreground" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-full max-w-xs p-6 border-l bg-background"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="flex flex-col space-y-6 overflow-y-auto">
                {navLinks.map((link) => (
                  <NextLink
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-lg transition-colors py-2",
                      pathname === link.href
                        ? "text-primary font-semibold"
                        : "text-foreground/80 hover:text-primary"
                    )}
                    onClick={() => setIsOpen(false)}>
                    {link.label}
                  </NextLink>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
