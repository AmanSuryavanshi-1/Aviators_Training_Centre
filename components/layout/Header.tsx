"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import NextLink from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Link from "next/link";
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/components/ui/utils';
import Image from 'next/image';
import { usePathname } from 'next/navigation'; // Import usePathname

import { ThemeToggle } from '@/components/ThemeToggle';
import { ContactButton } from '@/components/shared/ContactButton';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname(); // Use usePathname hook

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
        ? "border-b shadow-sm backdrop-blur-xl border-border/40 bg-background/60 supports-[backdrop-filter]:bg-background/40"
        : "backdrop-blur-xl bg-background/60 supports-[backdrop-filter]:bg-background/40"
    )}>
      <div className="container flex justify-between items-center max-w-screen-2xl h-16">
        {/* Logo with Image */}
        <NextLink href="/" className="group">
          <div className="overflow-hidden relative w-15 h-15">
            <Image 
              src="/AVIATORS_TRAINING_CENTRE-LOGO.webp" 
              alt="Aviators Training Centre Logo" 
              width={120}
              height={60}
              className="object-contain transition-transform duration-500 transform group-hover:scale-105"
            />
          </div>
        </NextLink>

        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden items-center space-x-4 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <NextLink 
              key={link.href} 
              href={link.href} 
              className={cn(
                "relative py-1 text-sm transition-colors",
                pathname === link.href // Use pathname for comparison
                  ? "text-primary font-semibold" 
                  : "text-foreground/70 hover:text-primary"
              )}
            >
              {link.label}
              {pathname === link.href && ( // Use pathname for comparison
                <motion.div 
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"
                  layoutId="navIndicator"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
            </NextLink>
          ))}
           
          <ContactButton href="/contact" />
          <ThemeToggle />
        </nav>

        {/* Mobile Navigation Trigger - Shown only on mobile */}
        <div className="flex items-center md:hidden">
           <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6 text-foreground" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-6 w-full max-w-xs bg-background">
              <div className="flex flex-col space-y-4">
                {/* Updated Logo in Mobile Menu */}
                {/* <NextLink href="/" className="mb-6" onClick={() => setIsOpen(false)}>
                  <div className="overflow-hidden relative w-10 h-10">
                    <Image 
                      src="/AVIATORS_TRAINING_CENTRE-LOGO.webp" 
                      alt="Aviators Training Centre Logo" 
                      width={80} 
                      height={80}
                      className="object-contain" 
                    /> 
                  </div>
                </NextLink> */}
                {navLinks.map((link) => (
                    <NextLink
                      key={link.href}
                      href={link.href}
                      className={cn( // Apply active styles in mobile too
                        "text-lg transition-colors",
                        pathname === link.href
                          ? "text-primary font-semibold"
                          : "text-foreground/80 hover:text-primary"
                      )}
                      onClick={() => setIsOpen(false)}>
                      {link.label}
                    </NextLink>
                ))}
                 <div className="mt-2">
                    <ContactButton 
                      href="/contact" 
                      onClick={() => setIsOpen(false)} 
                      fullWidth 
                    />
                  </div>
              <ThemeToggle />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
