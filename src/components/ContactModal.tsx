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
            className="fixed inset-y-0 right-0 h-full w-full max-w-md p-6 shadow-xl bg-card text-card-foreground border-l border-border z-50 flex flex-col" 
            as={motion.div} 
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ maxWidth: 'min(450px, 90vw)' }} // Adjusted width for better mobile view
            onEscapeKeyDown={onClose} 
            onInteractOutside={(e) => e.preventDefault()} 
          >
            <DialogHeader className="mb-4 relative"> {/* Added relative positioning */} 
              <DialogTitle className="text-2xl font-semibold text-foreground">Contact Aviators Training Centre</DialogTitle>
              <DialogDescription className="text-foreground/70">
                Get in touch via form, phone, email, or WhatsApp.
              </DialogDescription>
               <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-0 right-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
            </DialogHeader>
            
            {/* Contact Form */}
            <form className="space-y-4 mb-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground/80">Name</Label>
                    <Input id="name" placeholder="Your Name" className="bg-background border-border focus:border-primary" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground/80">Email</Label>
                    <Input id="email" type="email" placeholder="Your Email" className="bg-background border-border focus:border-primary" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="subject" className="text-foreground/80">Subject</Label>
                    <Input id="subject" placeholder="Subject (e.g., CPL Inquiry, Batch Schedule)" className="bg-background border-border focus:border-primary" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="message" className="text-foreground/80">Message</Label>
                    <Textarea id="message" placeholder="Your message..." rows={4} className="bg-background border-border focus:border-primary" />
                </div>
                 <Button type="submit" variant="secondary" className="w-full">Send Message</Button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-4">
                <div className="flex-grow border-t border-border/40"></div>
                <span className="flex-shrink mx-4 text-foreground/50 text-xs">OR</span>
                <div className="flex-grow border-t border-border/40"></div>
            </div>

            {/* Other Contact Methods */}
            <div className="space-y-3 text-sm">
                <a href="tel:+919485687609" className="flex items-center space-x-2 text-foreground/80 hover:text-primary transition-colors">
                  <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>+91 94856 87609</span>
                </a>
                 <a href="tel:+919773720998" className="flex items-center space-x-2 text-foreground/80 hover:text-primary transition-colors">
                  <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>+91 97737 20998</span>
                </a>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-foreground/80 hover:text-primary transition-colors">
                    <MessageCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>Chat on WhatsApp</span>
                </a>
                <a href="mailto:aviatorstrainingcentre@gmail.com" className="flex items-center space-x-2 text-foreground/80 hover:text-primary transition-colors">
                  <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="break-all">aviatorstrainingcentre@gmail.com</span>
                </a>
            </div>

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
