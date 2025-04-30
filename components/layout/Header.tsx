import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import NextLink from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Link from "next/link";
import { Mail, Menu, Plane } from 'lucide-react';

import { ThemeToggle } from '@/components/ThemeToggle';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Updated Nav Links for ATC structure
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/courses', label: 'Training Programs' }, // Changed label
    { href: '/instructors', label: 'Instructors' },
    { href: '/faq', label: 'FAQ' },
    // { href: '/schedule', label: 'Schedule' }, // Consider if scheduling page is needed, maybe link to contact?
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        {/* Updated Logo Text */}
        <NextLink href="/" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
          <Plane className="h-6 w-6" />
          {/* <img src="/ATC-Logo.webp" alt="" className='h-16 w-40'/> */}
          <span className="font-bold text-xl text-foreground">Aviators Training Centre</span>
        </NextLink>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          
          
          {navLinks.map((link) => (
              <NextLink key={link.href} href={link.href} className="text-foreground/70 hover:text-primary transition-colors">
                {link.label}
              </NextLink>
            ))}
           
          <Button
            asChild
            className="flex rounded-full px-4 py-1 items-center bg-gradient-to-r from-[#00ff95] to-[#0073e6] text-white hover:text-white hover:from-[#00ff95]/80 hover:to-[#0073e6]/80"
          >
            <Link href="/contact"><Mail className="h-4 w-4" /><span>Contact</span></Link>
          </Button>
          <ThemeToggle />
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center">
           <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6 text-foreground" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs bg-background p-6">
              <div className="flex flex-col space-y-4">
                {/* Updated Logo Text in Mobile Menu */}
                <NextLink href="/" className="flex items-center space-x-2 text-primary mb-6" onClick={() => setIsOpen(false)}>
                  <Plane className="h-6 w-6" />
                  <span className="font-bold text-lg text-foreground">Aviators Training Centre</span>
                </NextLink>
                {navLinks.map((link) => (
                    <NextLink
                      key={link.href}
                      href={link.href}
                      className="text-foreground/80 hover:text-primary transition-colors text-lg"
                      onClick={() => setIsOpen(false)}>
                      {link.label}
                    </NextLink>
                ))}
                 <Button
                    asChild
                    className="flex items-center space-x-2 bg-gradient-to-r from-[#00ff95] to-[#0073e6] text-white hover:text-white hover:from-[#00ff95]/80 hover:to-[#0073e6]/80"
                  >
                    <Link href="/contact" onClick={() => setIsOpen(false)}><Mail className="h-4 w-4" /><span>Contact</span></Link>
                  </Button>
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
