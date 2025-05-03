import React from 'react';
import { Plane, Mail, Phone, Instagram, MessageCircle, Facebook, Twitter, Linkedin, MapPin } from 'lucide-react';
import NextLink from "next/link";
import Image from 'next/image';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const whatsappLink = "https://wa.me/919485687609"; // Example WhatsApp link

  return (
    <footer className="py-8 text-white bg-teal-800">
      {/* Main Footer Content */}
      <div className="container px-6 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Column 1: Aviators Training Centre */}
          <div className="md:col-span-1">
            <div className="flex flex-col space-y-4">
              <NextLink href="/" className="mb-3">
                <div className="relative h-24 p-4 overflow-hidden bg-white shadow-lg w-52 shadow-teal-950 rounded-2xl">
                  <Image 
                    src="/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png"
                    alt="Aviators Training Centre Logo" 
                    width={100} 
                    height={50} 
                    className="object-contain w-full h-full"
                  />
                </div>
              </NextLink>
              <p className="text-sm text-gray-200">
                Providing world-class aviation training for aspiring pilots and aviation professionals since 2005.
              </p>
              <div className="flex mt-4 space-x-3">
                <a href="#" className="p-3 transition-colors duration-300 bg-teal-700 rounded-full hover:bg-teal-600">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="p-3 transition-colors duration-300 bg-teal-700 rounded-full hover:bg-teal-600">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/aviatorstrainingcentre" target="_blank" rel="noopener noreferrer" className="p-3 transition-colors duration-300 bg-teal-700 rounded-full hover:bg-teal-600">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="p-3 transition-colors duration-300 bg-teal-700 rounded-full hover:bg-teal-600">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:col-span-1">
            <h3 className="pb-2 mb-6 text-lg font-semibold border-b border-teal-600">Quick Links</h3>
            <ul className="space-y-3">
              <li><NextLink href="/" className="flex items-center text-sm text-gray-200 transition-colors hover:text-white"><span className="mr-2">›</span>Home</NextLink></li>
              <li><NextLink href="/about" className="flex items-center text-sm text-gray-200 transition-colors hover:text-white"><span className="mr-2">›</span>About Us</NextLink></li>
              <li><NextLink href="/courses" className="flex items-center text-sm text-gray-200 transition-colors hover:text-white"><span className="mr-2">›</span>Training Programs</NextLink></li>
              <li><NextLink href="/instructors" className="flex items-center text-sm text-gray-200 transition-colors hover:text-white"><span className="mr-2">›</span>Instructors</NextLink></li>
               <li><NextLink href="/faq" className="flex items-center text-sm text-gray-200 transition-colors hover:text-white"><span className="mr-2">›</span>FAQ</NextLink></li>
              <li><NextLink href="/contact" className="flex items-center text-sm text-gray-200 transition-colors hover:text-white"><span className="mr-2">›</span>Contact</NextLink></li>
            </ul>
          </div>

          {/* Column 3: Our Courses */}
          <div className="md:col-span-1">
            <h3 className="pb-2 mb-6 text-lg font-semibold border-b border-teal-600">Our Courses</h3>
            <ul className="space-y-3">
              <li><NextLink href="/courses" className="flex items-center text-sm text-gray-200 transition-colors hover:text-white"><span className="mr-2">›</span>Air Navigation</NextLink></li>
              <li><NextLink href="/courses" className="flex items-center text-sm text-gray-200 transition-colors hover:text-white"><span className="mr-2">›</span>Meteorology</NextLink></li>
              <li><NextLink href="/courses" className="flex items-center text-sm text-gray-200 transition-colors hover:text-white"><span className="mr-2">›</span>Air Regulations</NextLink></li>
              <li><NextLink href="/courses" className="flex items-center text-sm text-gray-200 transition-colors hover:text-white"><span className="mr-2">›</span>Technical General</NextLink></li>
              <li><NextLink href="/courses" className="flex items-center text-sm text-gray-200 transition-colors hover:text-white"><span className="mr-2">›</span>Technical Specific</NextLink></li>
              <li><NextLink href="/courses" className="flex items-center text-sm text-gray-200 transition-colors hover:text-white"><span className="mr-2">›</span>RTR(A)</NextLink></li>
              <li><NextLink href="/courses" className="flex items-center text-sm text-gray-200 transition-colors hover:text-white"><span className="mr-2">›</span>A320 & B737 Type Rating Prep</NextLink></li>
              <li><NextLink href="/courses" className="flex items-center text-sm text-gray-200 transition-colors hover:text-white"><span className="mr-2">›</span>One-on-One Online Classes</NextLink></li>
              <li><NextLink href="/courses" className="flex items-center text-sm text-gray-200 transition-colors hover:text-white"><span className="mr-2">›</span>Interview Preparation</NextLink></li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="md:col-span-1">
            <h3 className="pb-2 mb-6 text-lg font-semibold border-b border-teal-600">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-sm text-gray-200">
                <MapPin className="h-5 w-5 text-teal-300 flex-shrink-0 mt-0.5" />
                <span>Ramphal Chowk Rd, Sector 7 Dwarka,<br />Dwarka, Delhi, 110075, India</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-gray-200">
                <Phone className="flex-shrink-0 w-5 h-5 text-teal-300" />
                <div className="flex flex-col">
                  <a href="tel:+919485687609" className="transition-colors hover:text-white">+91 94856 87609</a>
                  <a href="tel:+917842401155" className="transition-colors hover:text-white">+91 7842401155</a>
                </div>
              </li>
              <li className="flex items-center space-x-3 text-sm text-gray-200">
                <Mail className="flex-shrink-0 w-5 h-5 text-teal-300" />
                <div className="flex flex-col">
                  <a href="mailto:aviatorstrainingcentre@gmail.com" className="break-all transition-colors hover:text-white">aviatorstrainingcentre@gmail.com</a>
                </div>
              </li>
              <li className="flex items-center space-x-3 text-sm text-gray-200">
                <MessageCircle className="flex-shrink-0 w-5 h-5 text-teal-300" />
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">WhatsApp</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="pt-8 mt-16 border-t border-teal-700">
        <div className="container px-6 mx-auto text-center">
          <p className="text-sm text-gray-300">
            © {currentYear} Aviators Training Centre. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
