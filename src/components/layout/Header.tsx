"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import NextLink from 'next/link';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import Image from 'next/image';
import { usePathname } from 'next/navigation'; // Import usePathname
import { useTheme } from 'next-themes';

import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { ContactButton } from '@/components/shared/ContactButton';
import { Home, Info, BookOpen, Users, HelpCircle, MessageSquare, Sun, Moon, X, Mail } from 'lucide-react';

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
    { href: '/testimonials', label: 'Testimonials', icon: MessageSquare },
    { href: '/blog', label: 'Blog', icon: BookOpen },
    { href: '/faq', label: 'FAQ', icon: HelpCircle },
  ];

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300",
      scrolled
        ? "border-b shadow-sm backdrop-blur-xl border-border/40 bg-background/60 supports-[backdrop-filter]:bg-background/40 dark:bg-teal-950/85 dark:supports-[backdrop-filter]:bg-teal-950/75 dark:border-teal-800/60"
        : "backdrop-blur-xl bg-background/60 supports-[backdrop-filter]:bg-background/40 dark:bg-teal-950"
    )}>
      {/* Reduced horizontal padding: px-2 sm:px-4 md:px-5 lg:px-6 */}
      <div className="container flex items-center justify-between px-2 mx-auto h-14 sm:h-16 sm:px-4 md:px-5 lg:px-6">
        {/* Left group: Hamburger (mobile only) + Logo */}
        <div className="flex items-center gap-2">
          {/* Mobile (<=1199px): Hamburger at extreme left */}
          <div className="hidden max-[1199px]:block">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "relative w-8 h-8 min-w-[48px] min-h-[48px]",
                    "text-foreground/90 dark:text-foreground/90",
                    "hover:text-primary dark:hover:text-teal-300 transition-colors duration-150"
                  )}
                  aria-label={isOpen ? 'Close menu' : 'Open menu'}
                >
                  <div
                    className={cn(
                      "relative z-10 transition-transform duration-200 ease-out",
                      isOpen ? "rotate-90 scale-105" : "rotate-0 scale-100"
                    )}
                  >
                    {isOpen ? (
                      <X className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <Menu className="w-5 h-5" aria-hidden="true" />
                    )}
                  </div>
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-full max-w-[12rem] p-3 border-r bg-background dark:bg-teal-950 dark:border-teal-800/60 rounded-r-xl"
                onOpenAutoFocus={(e) => e.preventDefault()}
                aria-label="Main menu"
              >
                <div className="flex flex-col h-full">
                  {/* Subtle header with small logo and title */}
                  <div className="mb-2.5 pb-2 border-b border-border/40 dark:border-teal-800/60 flex items-center gap-2">
                    <NextLink href="/" className="flex items-center">
                      <div className="relative h-6 w-20 overflow-hidden">
                        {mounted ? (
                          <Image
                            src={theme === 'dark' ? '/AVIATORS_TRAINING_CENTRE_LOGO_DarkMode.png' : '/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png'}
                            alt="Aviators Training Centre"
                            fill
                            sizes="80px"
                            className="object-contain"
                            priority
                          />
                        ) : null}
                      </div>
                    </NextLink>
                    <SheetTitle className="ml-1 text-[10px] uppercase tracking-wider text-foreground/60">ATC</SheetTitle>
                  </div>

                  <div className="flex flex-col flex-grow space-y-2.5 overflow-y-auto">
                    {navLinks.map((link) => (
                      <NextLink
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "text-sm transition-colors py-1.5 flex items-center gap-2",
                          pathname === link.href
                            ? "text-primary font-semibold dark:text-teal-300"
                            : "text-foreground/80 hover:text-primary dark:text-foreground/80 dark:hover:text-teal-300"
                        )}
                        onClick={() => setIsOpen(false)}>
                        <link.icon className="w-4 h-4 opacity-80" aria-hidden="true" />
                        {link.label}
                      </NextLink>
                    ))}
                    {/* Contact page link inside the sheet */}
                    <NextLink
                      href="/contact"
                      className={cn(
                        "text-sm transition-colors py-1.5 flex items-center gap-2",
                        pathname === '/contact'
                          ? "text-primary font-semibold dark:text-teal-300"
                          : "text-foreground/80 hover:text-primary dark:text-foreground/80 dark:hover:text-teal-300"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <Mail className="w-4 h-4 opacity-80" aria-hidden="true" />
                      Contact
                    </NextLink>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo with Image */}
          <NextLink href="/" className="flex items-center group shrink-0">
            {/* Adjusted logo size slightly for better balance with reduced padding */}
            <div className="relative h-8 overflow-hidden sm:h-10 md:h-12 lg:h-14 w-24 lg:w-36">
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
        </div>

        {/* Desktop Navigation - Hidden on mobile */}
        {/* Reduced spacing: space-x-2 md:space-x-3 lg:space-x-6 */}
        <nav className="items-center hidden flex-grow justify-center space-x-2 text-sm font-medium md:space-x-3 lg:space-x-5 min-[1200px]:flex">
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
              <link.icon className="w-4 h-4 opacity-80" aria-hidden="true" /> {/* Added icon */}
              <span>{link.label}</span> {/* Wrapped label in span */}
              {pathname === link.href && (
                <div
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-teal-500 to-blue-500 dark:from-teal-400 dark:to-blue-400 rounded-full"
                />
              )}
            </NextLink>
          ))}
        </nav>

        {/* Right side buttons - desktop only */}
        {/* Reduced gap: gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 */}
        <div className="hidden min-[1200px]:flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3">
          <ThemeToggle />
          {/* Adjusted scale slightly */}
          <ContactButton href="/contact" className="scale-95 lg:scale-100" />
        </div>

        {/* Mobile controls: theme + contact (right side). Hamburger moved to far left. */}
        <div className="hidden max-[1199px]:flex items-center gap-2 ml-auto">
          <div className="scale-90">
            <ThemeToggle />
          </div>
          <ContactButton href="/contact" className="scale-90" />
        </div>
      </div>
    </header>
  );
};

export default Header;
