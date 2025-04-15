import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Send, Clock, Facebook, Instagram, Twitter, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// --- Configuration (Matching other pages) ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';
const aviationButtonBg = 'bg-teal-600 hover:bg-teal-700';
const aviationButtonDarkBg = 'dark:bg-teal-500 dark:hover:bg-teal-600';
const contactHeaderUrl = "/About/AboutHeader.webp";
const FALLBACK_IMAGE = "/HomePage/Hero5.webp";

// --- Animation Variants (Matching other pages) ---
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const cardHoverEffect = {
  rest: { y: 0, boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.08)" },
  hover: { y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.12)", transition: { duration: 0.3, ease: "circOut" } }
};

const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (!target.src.endsWith(FALLBACK_IMAGE)) {
        target.onerror = null;
        target.src = FALLBACK_IMAGE;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Message Sent Successfully!",
        description: "We'll get back to you as soon as possible.",
        variant: "default",
      });

      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />

      {/* Page Header - Standardized */}
      <motion.section
        className="relative h-[50vh] md:h-[60vh] flex items-center justify-center text-center text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <img
          src={contactHeaderUrl}
          alt="Contact ATC background"
          className="absolute inset-0 w-full h-full object-cover z-0"
          onError={handleImageError}
          style={{ filter: 'brightness(0.6)' }}
        />
         <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,94,104,0.25)] to-[rgba(12,110,114,0.55)] z-10"></div>
        <motion.div
          className="relative z-20 max-w-4xl p-6 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="drop-shadow-md text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-3">
            Get In Touch
          </h1>
          <p className="text-lg drop-shadow-md md:text-xl text-white/90 max-w-2xl mx-auto">
            Have questions? We're here to help you navigate your path to the cockpit.
          </p>
        </motion.div>
      </motion.section>

      {/* Main Content - Standardized */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-16 md:py-24 space-y-20 md:space-y-28">

        {/* Contact Info & Form Section */}
        <motion.section
           variants={sectionVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, amount: 0.05 }}
        >
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">

              {/* Contact Information Card */} 
              <motion.div
                variants={itemVariants}
                className="lg:col-span-2"
              >
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
                             {/* Fixed heading size */}
                             <h4 className="text-sm font-semibold text-foreground mb-1">Location</h4> 
                             <p className="text-sm text-foreground/80">456 Aerocity Avenue<br />New Delhi, Delhi 110037, India</p>
                           </div>
                         </div>
                         {/* Phone */} 
                         <div className="flex items-start space-x-3">
                           <div className={cn("flex-shrink-0 mt-1 p-2 rounded-full bg-teal-100/70 dark:bg-teal-900/40", aviationSecondary)}> 
                            <Phone className="h-5 w-5" />
                           </div>
                           <div>
                            {/* Fixed heading size */}
                             <h4 className="text-sm font-semibold text-foreground mb-1">Phone</h4> 
                             <p className="text-sm text-foreground/80">+91 94856 87609</p>
                             <p className="text-sm text-foreground/80">+91 97737 20998</p>
                           </div>
                         </div>
                         {/* Email */} 
                         <div className="flex items-start space-x-3">
                             <div className={cn("flex-shrink-0 mt-1 p-2 rounded-full bg-teal-100/70 dark:bg-teal-900/40", aviationSecondary)}> 
                               <Mail className="h-5 w-5" />
                              </div>
                           <div>
                            {/* Fixed heading size */}
                             <h4 className="text-sm font-semibold text-foreground mb-1">Email</h4> 
                             <Link to="mailto:aviatorstrainingcentre@gmail.com" className="text-sm text-foreground/80 hover:text-foreground underline-offset-2 hover:underline break-all">aviatorstrainingcentre@gmail.com</Link>
                             <br/>
                             <Link to="mailto:info@aviatorstrainingcentre.in" className="text-sm text-foreground/80 hover:text-foreground underline-offset-2 hover:underline break-all">info@aviatorstrainingcentre.in</Link>
                           </div>
                         </div>
                          {/* Operating Hours */} 
                         <div className="flex items-start space-x-3">
                              <div className={cn("flex-shrink-0 mt-1 p-2 rounded-full bg-teal-100/70 dark:bg-teal-900/40", aviationSecondary)}> 
                                <Clock className="h-5 w-5" />
                               </div>
                            <div>
                                {/* Fixed heading size */}
                                <h4 className="text-sm font-semibold text-foreground mb-1">Operating Hours</h4> 
                                <dl className="text-sm text-foreground/80">
                                    <div className="flex justify-between"><dt>Mon - Fri:</dt><dd className="pl-2">8:00 AM - 7:00 PM</dd></div>
                                    <div className="flex justify-between"><dt>Saturday:</dt><dd className="pl-2">9:00 AM - 5:00 PM</dd></div>
                                    <div className="flex justify-between"><dt>Sunday:</dt><dd className="pl-2">10:00 AM - 4:00 PM</dd></div>
                                </dl>
                            </div>
                         </div>
                         {/* Social Links */} 
                         <div className="pt-4 border-t border-border/50">
                                {/* Fixed heading size */}
                              <h4 className="text-sm font-semibold text-foreground mb-2">Follow Us</h4> 
                              <div className="flex space-x-2">
                                  <Button variant="ghost" size="icon" asChild className={cn("text-foreground/70 hover:text-foreground", aviationSecondary)}> 
                                     <Link to="#" aria-label="Facebook"><Facebook size={20}/></Link>
                                  </Button>
                                   <Button variant="ghost" size="icon" asChild className={cn("text-foreground/70 hover:text-foreground", aviationSecondary)}> 
                                     <Link to="#" aria-label="Instagram"><Instagram size={20}/></Link>
                                  </Button>
                                  <Button variant="ghost" size="icon" asChild className={cn("text-foreground/70 hover:text-foreground", aviationSecondary)}> 
                                     <Link to="#" aria-label="Twitter"><Twitter size={20}/></Link>
                                  </Button>
                              </div>
                          </div>
                     </CardContent>
                 </Card>
              </motion.div>

              {/* Contact Form Card */} 
              <motion.div
                variants={itemVariants}
                className="lg:col-span-3"
              >
                 <Card className="bg-card rounded-lg shadow-sm border border-border p-6 md:p-8">
                     <CardHeader className="p-0 mb-6">
                         <CardTitle className={cn("text-2xl font-semibold", aviationPrimary)}>Send Us a Message</CardTitle>
                         <CardDescription className="text-foreground/70 mt-1">
                             Fill out the form below and we'll get back to you shortly.
                         </CardDescription>
                     </CardHeader>
                     <CardContent className="p-0">
                          <form onSubmit={handleSubmit} className="space-y-5">
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
                                      <Input
                                          id="subject"
                                          value={subject}
                                          onChange={(e) => setSubject(e.target.value)}
                                          placeholder="e.g. CPL Course Inquiry"
                                          required
                                          className="focus-visible:ring-teal-500"
                                      />
                                  </div>
                              </div>
                              <div className="space-y-1.5">
                                  <Label htmlFor="message" className="text-sm font-medium">Your Message</Label>
                                  <Textarea
                                      id="message"
                                      value={message}
                                      onChange={(e) => setMessage(e.target.value)}
                                      placeholder="Please provide details about your question or request..."
                                      rows={5}
                                      required
                                      className="focus-visible:ring-teal-500"
                                  />
                              </div>
                              <div>
                                  <Button
                                      type="submit"
                                      size="lg"
                                      className={cn(
                                          "w-full flex items-center justify-center gap-2 transition duration-300 ease-in-out transform hover:scale-[1.02]",
                                          aviationButtonBg,
                                          aviationButtonDarkBg,
                                          "text-white"
                                      )}
                                      disabled={loading}
                                  >
                                      {loading ? (
                                          <>
                                              <motion.div
                                                  className="h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"
                                                  animate={{ rotate: 360 }}
                                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                              />
                                              Sending...
                                          </>
                                      ) : (
                                          <>
                                              Send Message <Send className="ml-2 h-4 w-4" />
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
           variants={sectionVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, amount: 0.1 }}
        >
            <motion.h2
               variants={itemVariants}
               className={cn("text-3xl md:text-4xl font-bold text-center mb-6", aviationPrimary)}
            >
               Find Our Location
            </motion.h2>
             <motion.p
                 variants={itemVariants}
                 className="text-center text-foreground/80 max-w-2xl mx-auto mb-10"
             >
                Visit our training centre in Aerocity, New Delhi, to discuss your training needs in person.
            </motion.p>

            <motion.div
                variants={itemVariants}
                className="rounded-lg overflow-hidden shadow-md border border-border"
            >
                 <div className="aspect-video">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.1902582044795!2d77.09761827617668!3d28.5870361746613!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1b42a0a0a0a5%3A0x82b1e5c0a4a0a0a5!2sAerocity%2C%20New%20Delhi%2C%20Delhi%20110037!5e0!3m2!1sen!2sin!4v1681308898111!5m2!1sen!2sin"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={true}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Aviators Training Centre Location - Delhi"
                    ></iframe>
                </div>
            </motion.div>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
