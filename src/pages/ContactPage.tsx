
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Send, Plane, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you as soon as possible.",
      });
      
      // Reset form fields
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
      setLoading(false);
    }, 1500);
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-[#73B5BD]/10">
      <Header />
      
      <main className="flex-grow">
        {/* Hero section */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#075E68]/10 to-[#219099]/5"></div>
          
          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#219099]/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#075E68]/10 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center p-2 bg-[#075E68]/10 rounded-full mb-6">
                <Plane className="h-6 w-6 text-[#075E68] mr-2" />
                <span className="text-[#075E68] font-medium">Get in Touch</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#075E68] mb-6 font-heading">
                Contact Us
              </h1>
              
              <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
                Have questions about our flight training programs or want to schedule a visit?
                Reach out to our team and we'll be happy to assist you on your aviation journey.
              </p>
              
              {/* Scroll indicator */}
              <motion.div 
                className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex flex-col items-center mt-12"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5, repeat: 3, repeatType: "reverse" }}
              >
                <p className="text-sm text-[#075E68] mb-2">Scroll down to contact us</p>
                <svg 
                  className="w-6 h-6 text-[#075E68]" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 14l-7 7m0 0l-7-7m7 7V3" 
                  />
                </svg>
              </motion.div>
            </motion.div>
          </div>
        </section>
        
        {/* Contact section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Contact information */}
              <motion.div 
                className="lg:col-span-1"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-[#219099]/20 h-full">
.                  <motion.h2 
                    className="text-2xl font-bold text-[#075E68] mb-8 font-heading min-w-[200px]"
                    variants={fadeIn}
                  >
                    Get in Touch
                  </motion.h2>
                  
                  <motion.div className="space-y-8" variants={staggerContainer}>
                    <motion.div 
                      className="flex items-start space-x-5"
                      variants={fadeIn}
                    >
                      <div className="bg-[#219099]/10 p-4 rounded-full">
                        <MapPin className="h-6 w-6 text-[#219099]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#075E68] text-lg mb-1">Location</h3>
                        <p className="text-gray-700 dark:text-gray-300">456 Aerocity Avenue<br />New Delhi, Delhi 110037, India</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-start space-x-5"
                      variants={fadeIn}
                    >
                      <div className="bg-[#219099]/10 p-4 rounded-full">
                        <Phone className="h-6 w-6 text-[#219099]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#075E68] text-lg mb-1">Phone</h3>
                        <p className="text-gray-700 dark:text-gray-300">+91 94856 87609</p>
                        <p className="text-gray-700 dark:text-gray-300">+91 97737 20998</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-start space-x-5"
                      variants={fadeIn}
                    >
                      <div className="bg-[#219099]/10 p-4 rounded-full">
                        <Mail className="h-6 w-6 text-[#219099]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#075E68] text-lg mb-1">Email</h3>
                        <p className="text-gray-700 dark:text-gray-300">aviatorstrainingcentre@gmail.com</p>
                        <p className="text-gray-700 dark:text-gray-300">info@aviatorstrainingcentre.in</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-start space-x-5"
                      variants={fadeIn}
                    >
                      <div className="bg-[#219099]/10 p-4 rounded-full">
                        <Clock className="h-6 w-6 text-[#219099]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#075E68] text-lg mb-1">Operating Hours</h3>
                        <table className="w-full text-gray-700 dark:text-gray-300">
                          <tbody>
                            <tr>
                              <td className="py-1 font-medium">Monday - Friday</td>
                              <td className="py-1">8:00 AM - 7:00 PM</td>
                            </tr>
                            <tr>
                              <td className="py-1 font-medium">Saturday</td>
                              <td className="py-1">9:00 AM - 5:00 PM</td>
                            </tr>
                            <tr>
                              <td className="py-1 font-medium">Sunday</td>
                              <td className="py-1">10:00 AM - 4:00 PM</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  </motion.div>
                  
                  <motion.div 
                    className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700"
                    variants={fadeIn}
                  >
                    <h3 className="font-semibold text-[#075E68] text-lg mb-3">Follow Us</h3>
                    <div className="flex space-x-4">
                      <Link to="#" className="bg-[#219099]/10 p-3 rounded-full text-[#219099] hover:bg-[#219099] hover:text-white transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                        </svg>
                      </Link>
                      <Link to="#" className="bg-[#219099]/10 p-3 rounded-full text-[#219099] hover:bg-[#219099] hover:text-white transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                        </svg>
                      </Link>
                      <Link to="#" className="bg-[#219099]/10 p-3 rounded-full text-[#219099] hover:bg-[#219099] hover:text-white transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                        </svg>
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Contact form */}
              <motion.div 
                className="lg:col-span-2"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
              >
                <div className="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-2xl shadow-lg border border-[#219099]/20">
                  <h2 className="text-2xl font-bold text-[#075E68] mb-8 font-heading min-w-[200px]">Send Us a Message</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium">Full Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          required
                          className="border-gray-300 focus:border-[#219099] focus:ring-[#219099] transition-colors duration-200"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@example.com"
                          required
                          className="border-gray-300 focus:border-[#219099] focus:ring-[#219099] transition-colors duration-200"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300 font-medium">Phone Number</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(555) 123-4567"
                          className="border-gray-300 focus:border-[#219099] focus:ring-[#219099] transition-colors duration-200"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-gray-700 dark:text-gray-300 font-medium">Subject</Label>
                        <Input
                          id="subject"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="Flight Training Inquiry"
                          required
                          className="border-gray-300 focus:border-[#219099] focus:ring-[#219099] transition-colors duration-200"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-gray-700 dark:text-gray-300 font-medium">Message</Label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="I'm interested in learning more about your pilot training programs..."
                        rows={5}
                        required
                        className="border-gray-300 focus:border-[#219099] focus:ring-[#219099] transition-colors duration-200"
                      />
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        type="submit" 
                        className="bg-[#075E68] hover:bg-[#219099] text-white w-full flex items-center justify-center gap-2 py-6 transition-all duration-300 rounded-xl shadow-md hover:shadow-lg"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message <Send className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Map section */}
        <section className="py-16 bg-[#075E68]/5">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-[#075E68] mb-4 font-heading">Find Us</h2>
              <p className="text-gray-700 max-w-2xl mx-auto">Visit our training center to see our facilities and meet our instructors in person.</p>
            </motion.div>
            
            <motion.div 
              className="w-full h-96 rounded-2xl overflow-hidden shadow-lg border border-[#219099]/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.1902582044795!2d77.09761827617668!3d28.5870361746613!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1b42a0a0a0a5%3A0x82b1e5c0a4a0a0a5!2sAerocity%2C%20New%20Delhi%2C%20Delhi%20110037!5e0!3m2!1sen!2sin!4v1681308898111!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Aviators Training Centre Location - Delhi"
              ></iframe>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ContactPage;
