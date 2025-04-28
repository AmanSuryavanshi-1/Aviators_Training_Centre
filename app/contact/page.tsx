// This component uses hooks, state, and browser APIs, so it must be a Client Component.
"use client";

import React, { useState, useEffect, Suspense } from 'react';
// Import useRouter and useSearchParams from next/navigation
import { useRouter, useSearchParams } from 'next/navigation';
// Removed Header and Footer imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MapPin, Send, Clock, Facebook, Instagram, Twitter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast'; // Corrected path assumption
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// --- Configuration ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';
const contactHeaderUrl = "/About/AboutHeader.webp";
const FALLBACK_IMAGE = "/HomePage/Hero5.webp";

// --- Animation Variants (Keep your existing variants) ---
const sectionVariants = { /* ... */ };
const itemVariants = { /* ... */ };

// --- Subjects List ---
const inquirySubjects = [
  "General Inquiry",
  "CPL Ground Classes (All Subjects)",
  "ATPL Ground Classes (All Subjects)",
  "Air Navigation Course",
  "Aviation Meteorology Course",
  "Air Regulations Course",
  "Technical General Course",
  "Technical Specific Course",
  "RTR(A) Training",
  "A320/B737 Type Rating Prep",
  "Airline Interview Preparation",
  "One-on-One Classes Inquiry",
  "Batch Schedule Inquiry",
  "Fee Structure Inquiry",
  "Other"
];

// Define the component that uses hooks
function ContactPageContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Read initial values from query parameters
  const isDemoBooking = searchParams.get('demo') === 'true';
  const initialSubjectParam = searchParams.get('subject') || '';
  const courseNameParam = searchParams.get('courseName') || '';
  const nameParam = searchParams.get('name') || '';
  const emailParam = searchParams.get('email') || '';
  const phoneParam = searchParams.get('phone') || '';
  const messageParam = searchParams.get('message') || '';

  const defaultDemoMessage = `I would like to book a demo${courseNameParam ? ` for the ${courseNameParam} course` : ''}. Please contact me to schedule a time.`;

  // State Initialization
  const [name, setName] = useState(nameParam);
  const [email, setEmail] = useState(emailParam);
  const [phone, setPhone] = useState(phoneParam);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Effect to set initial subject/message based on query params
  useEffect(() => {
    if (isDemoBooking) {
      setSubject(initialSubjectParam || 'Book a Demo');
      setMessage(messageParam || defaultDemoMessage);
    } else {
      setSubject(initialSubjectParam); // Set initial subject if passed
      setMessage(messageParam);
    }
    // Set other fields based on params only once on mount
    setName(nameParam);
    setEmail(emailParam);
    setPhone(phoneParam);
  }, [isDemoBooking, initialSubjectParam, messageParam, defaultDemoMessage, nameParam, emailParam, phoneParam]); // Dependencies include all params read

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (!target.src.endsWith(FALLBACK_IMAGE)) {
      target.onerror = null;
      target.src = FALLBACK_IMAGE;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDemoBooking && !subject) {
        toast({
            title: "Subject Required",
            description: "Please select a subject for your inquiry.",
            variant: "destructive",
        });
        return;
    }
    setLoading(true);

    // --- Replace with your actual API endpoint call --- 
    // Example using fetch:
    // try {
    //   const response = await fetch('/api/contact', { // Example API route
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ name, email, phone, subject, message, isDemoBooking }),
    //   });
    //   if (!response.ok) throw new Error('Network response was not ok');
    //   // Handle success
    //   toast({...});
    //   // Clear form
    // } catch (error) {
    //   // Handle error
    //   toast({...});
    // } finally {
    //   setLoading(false);
    // }
    // ---------------------------------------------------

    // Simulate API call for now
    await new Promise(resolve => setTimeout(resolve, 1500));

    setLoading(false);
    toast({
      title: isDemoBooking ? "Demo Request Received!" : "Message Sent Successfully!",
      description: isDemoBooking
        ? `We have received your demo request for ${name} and will contact you shortly.`
        : `Thank you for reaching out, ${name}! We will get back to you soon.`,
      variant: "default",
    });
    // Clear form
    setName('');
    setEmail('');
    setPhone('');
    setSubject('');
    setMessage('');
    // Optionally clear query params (requires router)
    // router.replace('/contact', undefined); // Use router if needed
  };

  // Removed outer div
  return (
    <>
      {/* Page Header */}
      <motion.section
        className="relative h-[50vh] md:h-[60vh] flex items-center justify-center text-center text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
         {/* Consider Next/Image */}
         <img
          src={contactHeaderUrl}
          alt="Contact ATC background"
          className="absolute inset-0 w-full h-full object-cover z-0"
          onError={handleImageError}
          style={{ filter: 'brightness(0.6)' }}
          loading="lazy"
        />
         <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,94,104,0.25)] to-[rgba(12,110,114,0.55)] z-10"></div>
        <motion.div
          className="relative z-20 max-w-4xl p-6 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="drop-shadow-md text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-3">
             {isDemoBooking ? 'Book Your Demo' : 'Get In Touch'}
          </h1>
          <p className="text-lg drop-shadow-md md:text-xl text-white/90 max-w-2xl mx-auto">
           {isDemoBooking
             ? `Confirm your details below${courseNameParam ? ` for the ${courseNameParam} course` : ''}, and we will schedule your personalized demo.`
             : `Have questions? Select a subject or let us know how we can help.`
           }
          </p>
        </motion.div>
      </motion.section>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-16 md:py-24 space-y-20 md:space-y-28">
        {/* Contact Info & Form Section */} 
        <motion.section
          // Add variants if defined
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, amount: 0.05 }}
        >
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
              {/* Contact Information Card */} 
              <motion.div /* Add variants */ className="lg:col-span-2">
                 <Card className="bg-card h-full rounded-lg shadow-sm border border-border p-6 md:p-8">
                     <CardHeader className="p-0 mb-6">
                         <CardTitle className={cn("text-2xl font-semibold", aviationPrimary)}>Contact Details</CardTitle>
                         <CardDescription className="text-foreground/70 mt-1">
                             Reach out via phone, email, or visit us.
                         </CardDescription>
                     </CardHeader>
                     <CardContent className="p-0 space-y-5">
                         {/* Location */} 
                         <div className="flex items-start space-x-3">
                           <div className={cn("flex-shrink-0 mt-1 p-2 rounded-full bg-teal-100/70 dark:bg-teal-900/40", aviationSecondary)}>
                             <MapPin className="h-5 w-5" />
                           </div>
                           <div>
                             <h4 className="text-sm font-semibold text-foreground mb-1">Location</h4>
                             {/* Link to Google Maps */}
                             <a href="https://www.google.com/maps/search/?api=1&query=Ramphal+Chowk+Rd,+Sector+7+Dwarka,+Dwarka,+Delhi,+110075" target="_blank" rel="noopener noreferrer" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                               Ramphal Chowk Rd, Sector 7 Dwarka,<br />Dwarka, Delhi, 110075, India
                             </a>
                           </div>
                         </div>
                         {/* Phone */} 
                         <div className="flex items-start space-x-3">
                           <div className={cn("flex-shrink-0 mt-1 p-2 rounded-full bg-teal-100/70 dark:bg-teal-900/40", aviationSecondary)}>
                            <Phone className="h-5 w-5" />
                           </div>
                           <div>
                             <h4 className="text-sm font-semibold text-foreground mb-1">Phone</h4>
                             {/* Use anchor tags for tel links */}
                             <a href="tel:+919485687609" className="block text-sm text-foreground/80 hover:text-primary transition-colors">+91 94856 87609</a>
                             <a href="tel:+917842401155" className="block text-sm text-foreground/80 hover:text-primary transition-colors">+91 78424 01155</a>
                           </div>
                         </div>
                         {/* Email */} 
                         <div className="flex items-start space-x-3">
                             <div className={cn("flex-shrink-0 mt-1 p-2 rounded-full bg-teal-100/70 dark:bg-teal-900/40", aviationSecondary)}>
                               <Mail className="h-5 w-5" />
                              </div>
                           <div>
                             <h4 className="text-sm font-semibold text-foreground mb-1">Email</h4>
                             {/* Use anchor tags for mailto links */}
                             <a href="mailto:aviatorstrainingcentre@gmail.com" className="block text-sm text-foreground/80 hover:text-primary transition-colors underline-offset-2 hover:underline break-all">aviatorstrainingcentre@gmail.com</a>
                             <a href="mailto:info@aviatorstrainingcentre.in" className="block text-sm text-foreground/80 hover:text-primary transition-colors underline-offset-2 hover:underline break-all">info@aviatorstrainingcentre.in</a>
                           </div>
                         </div>
                          {/* Operating Hours */} 
                         <div className="flex items-start space-x-3">
                              <div className={cn("flex-shrink-0 mt-1 p-2 rounded-full bg-teal-100/70 dark:bg-teal-900/40", aviationSecondary)}>
                                <Clock className="h-5 w-5" />
                               </div>
                            <div>
                                <h4 className="text-sm font-semibold text-foreground mb-1">Operating Hours</h4>
                                <dl className="text-sm text-foreground/80">
                                    <div className="flex justify-between"><dt>Mon - Fri:</dt><dd className="pl-2">8:00 AM - 7:00 PM</dd></div>
                                    <div className="flex justify-between"><dt>Saturday:</dt><dd className="pl-2">9:00 AM - 5:00 PM</dd></div>
                                    <div className="flex justify-between"><dt>Sunday:</dt><dd className="pl-2">10:00 AM - 4:00 PM</dd></div>
                                </dl>
                            </div>
                         </div>
                         {/* Social Links - Use anchor tags */}
                         <div className="pt-4 border-t border-border/50">
                              <h4 className="text-sm font-semibold text-foreground mb-2">Follow Us</h4>
                              <div className="flex space-x-2">
                                  <Button variant="ghost" size="icon" asChild className={cn("text-foreground/70 hover:text-primary", aviationSecondary)}>
                                     {/* Use anchor tag for external link */} 
                                     <a href="https://www.facebook.com/profile.php?id=61557303895431" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={20}/></a>
                                  </Button>
                                   <Button variant="ghost" size="icon" asChild className={cn("text-foreground/70 hover:text-primary", aviationSecondary)}>
                                     {/* Use anchor tag for external link */} 
                                     <a href="https://www.instagram.com/aviatorstrainingcentre/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={20}/></a>
                                  </Button>
                                  <Button variant="ghost" size="icon" asChild className={cn("text-foreground/70 hover:text-primary", aviationSecondary)}>
                                     {/* Use anchor tag for external link */}
                                     <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="pointer-events-none opacity-50"> {/* Example: Disable if no link */} 
                                       <Twitter size={20}/>
                                     </a>
                                  </Button>
                              </div>
                          </div>
                     </CardContent>
                 </Card>
              </motion.div>

              {/* Contact Form Card */} 
              <motion.div /* Add variants */ className="lg:col-span-3">
                 <Card className="bg-card rounded-lg shadow-sm border border-border p-6 md:p-8">
                     <CardHeader className="p-0 mb-6">
                         <CardTitle className={cn("text-2xl font-semibold", aviationPrimary)}>
                             {isDemoBooking ? 'Demo Request Form' : 'Send Us a Message'}
                         </CardTitle>
                         <CardDescription className="text-foreground/70 mt-1">
                            {isDemoBooking 
                                ? `Confirm your details and the pre-filled request.`
                                : `Fill out the form below and we will get back to you shortly.`
                            }
                         </CardDescription>
                     </CardHeader>
                     <CardContent className="p-0">
                          <form onSubmit={handleSubmit} className="space-y-5">
                              {/* Name and Email */} 
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                  <div className="space-y-1.5">
                                      <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                                      <Input
                                          id="name"
                                          value={name}
                                          onChange={(e) => setName(e.target.value)}
                                          placeholder="e.g. John Doe"
                                          required
                                          className="focus-visible:ring-teal-500"
                                      />
                                  </div>
                                  <div className="space-y-1.5">
                                      <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                                      <Input
                                          id="email"
                                          type="email"
                                          value={email}
                                          onChange={(e) => setEmail(e.target.value)}
                                          placeholder="e.g. john.doe@email.com"
                                          required
                                          className="focus-visible:ring-teal-500"
                                      />
                                  </div>
                              </div>

                              {/* Phone and Subject */} 
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                   <div className="space-y-1.5">
                                       <Label htmlFor="phone" className="text-sm font-medium">Phone Number <span className="text-foreground/50">(Optional)</span></Label>
                                       <Input
                                           id="phone"
                                           value={phone}
                                           onChange={(e) => setPhone(e.target.value)}
                                           placeholder="e.g. +91 12345 67890"
                                           className="focus-visible:ring-teal-500"
                                       />
                                   </div>
                                   <div className="space-y-1.5">
                                      <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                                      {isDemoBooking ? (
                                          <Input
                                              id="subject-input"
                                              value={subject} // Controlled by state
                                              readOnly
                                              className={cn(
                                                  "focus-visible:ring-teal-500",
                                                  "bg-muted/50 cursor-not-allowed" // Style read-only field
                                              )}
                                          />
                                      ) : (
                                          <Select
                                              value={subject} // Bind to state
                                              onValueChange={setSubject} // Update state on change
                                              required // Make select required for general inquiry
                                          >
                                              <SelectTrigger id="subject-select" className="focus:ring-teal-500">
                                                  <SelectValue placeholder="Select a subject..." />
                                              </SelectTrigger>
                                              <SelectContent>
                                                  {inquirySubjects.map((subj) => (
                                                      <SelectItem key={subj} value={subj}>
                                                          {subj}
                                                      </SelectItem>
                                                  ))}
                                              </SelectContent>
                                          </Select>
                                      )}
                                  </div>
                              </div>

                              {/* Message */} 
                              <div className="space-y-1.5">
                                  <Label htmlFor="message" className="text-sm font-medium">Your Message</Label>
                                  <Textarea
                                      id="message"
                                      value={message} // Controlled by state
                                      onChange={(e) => setMessage(e.target.value)}
                                      placeholder={isDemoBooking ? "Add any specific questions here..." : "Please provide details about your question or request..."}
                                      rows={5}
                                      required={!isDemoBooking} // Required only for general contact
                                      readOnly={isDemoBooking} // Read-only if demo booking
                                      className={cn(
                                          "focus-visible:ring-teal-500",
                                          isDemoBooking && "bg-muted/50 cursor-not-allowed" // Style read-only field
                                      )}
                                  />
                              </div>
                              
                              {/* Submit Button */} 
                              <div>
                                  <Button
                                      type="submit"
                                      size="lg"
                                      className={cn(
                                          'w-full flex items-center justify-center gap-2',
                                          'group relative rounded-full overflow-hidden bg-teal-600 text-white shadow-md transition-all duration-300 ease-out hover:bg-teal-700 hover:shadow-lg dark:bg-teal-500 dark:hover:bg-teal-600',
                                          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500',
                                          'disabled:opacity-50 disabled:cursor-not-allowed'
                                      )}
                                      disabled={loading}
                                  >
                                      {loading ? (
                                          <>
                                              <motion.div
                                                  className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                                                  animate={{ rotate: 360 }}
                                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                              />
                                              <span className="ml-2">{isDemoBooking ? 'Submitting Request...' : 'Sending...'}</span>
                                          </>
                                      ) : (
                                          <>
                                              {isDemoBooking ? 'Confirm Demo Request' : 'Send Message'} <Send className="ml-2 h-4 w-4" />
                                          </>
                                      )}
                                  </Button>
                              </div>
                          </form>
                     </CardContent>
                 </Card>
              </motion.div>
            </div>
        </motion.section>

        {/* Map Section */} 
        <motion.section
           // Add variants
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, amount: 0.1 }}
        >
           <motion.h2 
               /* Add variants */
               className={cn("text-3xl md:text-4xl font-bold text-center mb-6", aviationPrimary)}
            >
               Find Our Location
            </motion.h2>
             <motion.p
                 /* Add variants */
                 className="text-center text-foreground/80 max-w-2xl mx-auto mb-10"
             >
                Visit our training centre in Dwarka, New Delhi, to discuss your training needs in person.
            </motion.p>
            
            <motion.div
                /* Add variants */
                className="rounded-lg overflow-hidden shadow-md border border-border"
            >
                 <div className="aspect-video">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.014408488279!2d77.0489654150817!3d28.60868878241755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d055725848f4f%3A0x76e37572262f1b3c!2sRamphal%20Chowk%20Rd%2C%20Sector%207%20Dwarka%2C%20Dwarka%2C%20Delhi%2C%20110075!5e0!3m2!1sen!2sin!4v1725999999999!5m2!1sen!2sin" 
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={true}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Aviators Training Centre Location - Ramphal Chowk, Dwarka, Delhi"
                    ></iframe>
                </div>
            </motion.div>
        </motion.section>

      </main>
      {/* Footer rendered by layout.tsx */}
    </>
  );
}

// Wrap the component needing searchParams with Suspense
const ContactPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}> {/* Or a proper skeleton loader */}
      <ContactPageContent />
    </Suspense>
  );
};

export default ContactPage;
