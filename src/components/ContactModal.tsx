import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Phone, Mail, MessageCircle } from 'lucide-react'; // Added contact icons

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {

  const whatsappLink = "https://wa.me/919485687609"; // Example WhatsApp link, update if needed

  // Framer Motion variants
  const modalVariants = {
    hidden: { x: "100%", opacity: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    visible: { x: "0%", opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { x: "100%", opacity: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  const backdropVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
  };
  
  const formItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
      },
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <motion.div 
                className="fixed inset-0 bg-black/70 z-50" 
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={onClose} 
            />
          <DialogContent 
            className="fixed inset-y-0 right-0 h-full w-full shadow-xl bg-[#075E68] text-white border-l border-white/10 z-50 flex flex-col overflow-y-auto p-4 sm:p-6" 
            as={motion.div} 
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ maxWidth: 'min(450px, 85vw)' }} // Better mobile responsiveness
            onEscapeKeyDown={onClose} 
            onInteractOutside={(e) => e.preventDefault()} 
          >
            <DialogHeader className="mb-4 relative"> 
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <DialogTitle className="text-xl sm:text-2xl font-semibold text-white">Contact Aviators Training Centre</DialogTitle>
                <DialogDescription className="text-sm sm:text-base text-white/80">
                  Get in touch via form, phone, email, or WhatsApp.
                </DialogDescription>
              </motion.div>
              <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-0 right-0 rounded-sm opacity-70 text-white hover:bg-white/10 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 disabled:pointer-events-none">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogHeader>
            
            {/* Contact Form */}
            <form className="space-y-4 mb-6">
                <motion.div 
                  className="space-y-2"
                  custom={0}
                  variants={formItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                    <Label htmlFor="name" className="text-white/90">Name</Label>
                    <Input id="name" placeholder="Your Name" className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#219099]" />
                </motion.div>
                <motion.div 
                  className="space-y-2"
                  custom={1}
                  variants={formItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                    <Label htmlFor="email" className="text-white/90">Email</Label>
                    <Input id="email" type="email" placeholder="Your Email" className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#219099]" />
                </motion.div>
                <motion.div 
                  className="space-y-2"
                  custom={2}
                  variants={formItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                    <Label htmlFor="subject" className="text-white/90">Subject</Label>
                    <Input id="subject" placeholder="Subject (e.g., CPL Inquiry, Batch Schedule)" className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#219099]" />
                </motion.div>
                <motion.div 
                  className="space-y-2"
                  custom={3}
                  variants={formItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                    <Label htmlFor="message" className="text-white/90">Message</Label>
                    <Textarea id="message" placeholder="Your message..." rows={4} className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#219099]" />
                </motion.div>
                <motion.div
                  custom={4}
                  variants={formItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Button type="submit" className="w-full bg-[#219099] hover:bg-[#0C6E72] text-white transition-all duration-300 hover:shadow-lg">
                    Send Message
                  </Button>
                </motion.div>
            </form>

            {/* Divider */}
            <motion.div 
              className="flex items-center my-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
                <div className="flex-grow border-t border-white/20"></div>
                <span className="flex-shrink mx-4 text-white/60 text-xs">OR</span>
                <div className="flex-grow border-t border-white/20"></div>
            </motion.div>

            {/* Other Contact Methods */}
            <motion.div 
              className="space-y-3 text-sm md:text-base mt-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
                <motion.a 
                  href="tel:+919485687609" 
                  className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors p-1"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Phone className="h-4 w-4 text-[#73B5BD] flex-shrink-0" />
                  <span>+91 94856 87609</span>
                </motion.a>
                <motion.a 
                  href="tel:+919773720998" 
                  className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors p-1"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Phone className="h-4 w-4 text-[#73B5BD] flex-shrink-0" />
                  <span>+91 97737 20998</span>
                </motion.a>
                <motion.a 
                  href={whatsappLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors p-1"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <MessageCircle className="h-4 w-4 text-[#73B5BD] flex-shrink-0" />
                  <span>Chat on WhatsApp</span>
                </motion.a>
                <motion.a 
                  href="mailto:aviatorstrainingcentre@gmail.com" 
                  className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors p-1"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Mail className="h-4 w-4 text-[#73B5BD] flex-shrink-0" />
                  <span className="break-all">aviatorstrainingcentre@gmail.com</span>
                </motion.a>
            </motion.div>

            {/* Footer kept minimal in modal */}
            {/* <DialogFooter className="mt-6 pt-4 border-t border-border/40">
              <Button type="button" variant="outline" onClick={onClose}>Close</Button>
            </DialogFooter> */}
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default ContactModal;
