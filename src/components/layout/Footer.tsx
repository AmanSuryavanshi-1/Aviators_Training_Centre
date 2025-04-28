import React from 'react';
import Link from 'next/link'; // Changed import from react-router-dom to next/link
import { Plane, Mail, Phone, MapPin, Instagram, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const whatsappLink = "https://wa.me/919485687609"; // Example WhatsApp link, update if needed
  const googleMapsLink = "https://www.google.com/maps/search/?api=1&query=Ramphal+Chowk+Rd,+Sector+7+Dwarka,+Dwarka,+Delhi,+110075"; // Link to the location

  return (
    <footer className="bg-card text-card-foreground border-t border-border/40 py-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-6">
        {/* Logo and About */}
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center space-x-2 text-primary mb-4">
            <Plane className="h-7 w-7" />
            <span className="font-bold text-2xl text-foreground">Aviators Training Centre</span>
          </Link>
          <p className="text-foreground/70 text-sm pr-4">
            Your premier ground school dedicated to empowering future pilots with the knowledge and skills required to ace the DGCA CPL and ATPL examinations.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Links</h3>
          <ul className="space-y-2">
            {/* Using Next Link with href */}
            <li><Link href="/about" className="text-foreground/70 hover:text-primary transition-colors text-sm">About Us</Link></li>
            <li><Link href="/courses" className="text-foreground/70 hover:text-primary transition-colors text-sm">Training Programs</Link></li>
            <li><Link href="/instructors" className="text-foreground/70 hover:text-primary transition-colors text-sm">Instructors</Link></li>
            <li><Link href="/faq" className="text-foreground/70 hover:text-primary transition-colors text-sm">FAQ</Link></li>
            <li><Link href="/contact" className="text-foreground/70 hover:text-primary transition-colors text-sm">Contact Us</Link></li>
            <li><Link href="/blog" className="text-foreground/70 hover:text-primary transition-colors text-sm">Blog</Link></li> {/* Added Blog Link */} 
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Contact Info</h3>
          <ul className="space-y-3">
            <li className="flex items-start space-x-2 text-foreground/70 text-sm"> {/* Changed items-center to items-start for multi-line address */} 
              <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-1" /> {/* Added MapPin and address */} 
              <a href={googleMapsLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                Ramphal Chowk Rd, <br />
                Sector 7 Dwarka, <br />
                Dwarka, Delhi, 110075
              </a>
            </li>
            <li className="flex items-center space-x-2 text-foreground/70 text-sm">
              <Phone className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="flex flex-col">
                 <a href="tel:+919485687609" className="hover:text-primary transition-colors">+91 94856 87609</a>
                 <a href="tel:+917842401155" className="hover:text-primary transition-colors">+91 78424 01155</a>
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
