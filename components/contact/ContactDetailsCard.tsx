import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from "@/components/ui/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } },
};

const ContactDetailsCard: React.FC = () => {
    return (
        <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="h-full p-6 border rounded-lg shadow-sm bg-card border-border md:p-8">
                <CardHeader className="p-0 mb-6">
                    <CardTitle className={cn("text-2xl font-semibold", aviationPrimary)}>Contact Details</CardTitle>
                    <CardDescription className="mt-1 text-foreground/70">
                        Reach out via phone, email, or visit us.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-5">
                    {/* Location */}
                    <div className="flex items-start space-x-3">
                        <div className={cn("flex-shrink-0 p-2 mt-1 rounded-full bg-teal-100/70 dark:bg-teal-900/40", aviationSecondary)}>
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="mb-1 text-sm font-semibold text-foreground">Location</h4>
                            <p className="text-sm text-foreground/80">Ramphal Chowk Rd, Sector 7 Dwarka,<br />Dwarka, Delhi, 110075, India</p>
                        </div>
                    </div>
                    {/* Phone */}
                    <div className="flex items-start space-x-3">
                        <div className={cn("flex-shrink-0 p-2 mt-1 rounded-full bg-teal-100/70 dark:bg-teal-900/40", aviationSecondary)}>
                            <Phone className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="mb-1 text-sm font-semibold text-foreground">Phone</h4>
                            <p className="text-sm text-foreground/80">+91 94856 87609</p>
                            <p className="text-sm text-foreground/80">+91 7842401155</p>
                        </div>
                    </div>
                    {/* Email */}
                    <div className="flex items-start space-x-3">
                        <div className={cn("flex-shrink-0 p-2 mt-1 rounded-full bg-teal-100/70 dark:bg-teal-900/40", aviationSecondary)}>
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="mb-1 text-sm font-semibold text-foreground">Email</h4>
                            <Link href="mailto:aviatorstrainingcentre@gmail.com" className="text-sm break-all text-foreground/80 hover:text-foreground underline-offset-2 hover:underline">aviatorstrainingcentre@gmail.com</Link>
                            <br />
                            <Link href="mailto:info@aviatorstrainingcentre.in" className="text-sm break-all text-foreground/80 hover:text-foreground underline-offset-2 hover:underline">info@aviatorstrainingcentre.in</Link>
                        </div>
                    </div>
                    {/* Operating Hours */}
                    <div className="flex items-start space-x-3">
                        <div className={cn("flex-shrink-0 p-2 mt-1 rounded-full bg-teal-100/70 dark:bg-teal-900/40", aviationSecondary)}>
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="mb-1 text-sm font-semibold text-foreground">Operating Hours</h4>
                            <dl className="text-sm text-foreground/80">
                                <div className="flex justify-between"><dt>Mon - Fri:</dt><dd className="pl-2">8:00 AM - 7:00 PM</dd></div>
                                <div className="flex justify-between"><dt>Saturday:</dt><dd className="pl-2">9:00 AM - 5:00 PM</dd></div>
                                <div className="flex justify-between"><dt>Sunday:</dt><dd className="pl-2">10:00 AM - 4:00 PM</dd></div>
                            </dl>
                        </div>
                    </div>
                    {/* Social Links */}
                    <div className="pt-4 border-t border-border/50">
                        <h4 className="mb-2 text-sm font-semibold text-foreground">Follow Us</h4>
                        <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" asChild className={cn("text-foreground/70 hover:text-foreground", aviationSecondary)}>
                                <Link href="#" aria-label="Facebook"><Facebook size={20} /></Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild className={cn("text-foreground/70 hover:text-foreground", aviationSecondary)}>
                                <Link href="#" aria-label="Instagram"><Instagram size={20} /></Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild className={cn("text-foreground/70 hover:text-foreground", aviationSecondary)}>
                                <Link href="#" aria-label="Twitter"><Twitter size={20} /></Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ContactDetailsCard;