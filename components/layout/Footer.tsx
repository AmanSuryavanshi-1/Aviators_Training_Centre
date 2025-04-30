import React from 'react';
import { Plane, Mail, Phone, Instagram, MessageCircle } from 'lucide-react';
import NextLink from "next/link";


const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const whatsappLink = "https://wa.me/919485687609"; // Example WhatsApp link, update if needed

  return (
    <footer className="bg-card text-card-foreground border-t border-border/40 py-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-6"> {/* Changed to 4 columns */} 
        {/* Logo and About */}
        <div className="md:col-span-2"> {/* Logo spans 2 columns */} 
          <NextLink href="/" className="flex items-center space-x-2 text-primary mb-4">            
            <Plane className="h-7 w-7" />
            <span className="font-bold text-2xl text-foreground">Aviators Training Centre</span>
          </NextLink> 
            <p className="text-foreground/70 text-sm pr-4">
              Your premier ground school dedicated to empowering future pilots with the knowledge and skills required to ace the DGCA CPL and ATPL examinations.
            </p>
          </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><NextLink href="/about" className="text-foreground/70 hover:text-primary transition-colors text-sm">About Us</NextLink></li>
            <li><NextLink href="/courses" className="text-foreground/70 hover:text-primary transition-colors text-sm">Training Programs</NextLink></li>
            <li><NextLink href="/instructors" className="text-foreground/70 hover:text-primary transition-colors text-sm">Instructors</NextLink></li>
            <li><NextLink href="/faq" className="text-foreground/70 hover:text-primary transition-colors text-sm">FAQ</NextLink></li>
            <li><NextLink href="/contact" className="text-foreground/70 hover:text-primary transition-colors text-sm">Contact Us</NextLink></li>
          </ul> 
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Contact Info</h3>
          <ul className="space-y-3">
            {/* Removed MapPin as address wasn't provided */}
            <li className="flex items-center space-x-2 text-foreground/70 text-sm">
              <Phone className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="flex flex-col">
                 <a href="tel:+919485687609" className="hover:text-primary transition-colors">+91 94856 87609</a>
                 <a href="tel:+919773720998" className="hover:text-primary transition-colors">+91 7842401155</a>
              </span>
            </li>
             <li className="flex items-center space-x-2 text-foreground/70 text-sm">
              <MessageCircle className="h-4 w-4 text-primary flex-shrink-0" />
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">WhatsApp</a>
            </li>
            <li className="flex items-center space-x-2 text-foreground/70 text-sm">
              <Mail className="h-4 w-4 text-primary flex-shrink-0" />
              <a href="mailto:aviatorstrainingcentre@gmail.com" className="hover:text-primary transition-colors break-all">aviatorstrainingcentre@gmail.com</a>
            </li>
             <li className="flex items-center space-x-2 text-foreground/70 text-sm">
                <Instagram className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="https://www.instagram.com/aviatorstrainingcentre" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">@aviatorstrainingcentre</a>
             </li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto text-center mt-10 pt-6 border-t border-border/40">
        <p className="text-sm text-foreground/60">
          &copy; {currentYear} Aviators Training Centre. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
