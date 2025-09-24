import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from "@/components/ui/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { easingFunctions } from '@/lib/animations/easing';

const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easingFunctions.easeInOut } },
};

const ContactDetailsCard: React.FC = () => {
    return (
        <motion.div variants={itemVariants} className="w-full h-full">
            <Card className="w-full h-full rounded-lg border shadow-sm bg-card border-border p-4 md:p-4 lg:p-5 flex flex-col">
                <CardHeader className="p-0 mb-3 md:mb-4 flex-shrink-0">
                    <CardTitle className={cn("text-lg md:text-xl font-semibold", aviationPrimary)}>Contact Details</CardTitle>
                    <CardDescription className="mt-1 text-sm text-foreground/70">
                        Reach out via phone, email, or visit us.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 flex-grow flex flex-col">
                    <div className="space-y-3 flex-grow">
                        {/* Location */}
                        <div className="flex items-start space-x-3">
                            <div className={cn("flex-shrink-0 p-2 mt-1 rounded-full bg-teal-100/70 dark:bg-teal-900/40", aviationSecondary)}>
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="mb-1 text-sm font-semibold text-foreground">Location</h4>
                                <p className="text-sm text-foreground/80">Delhi, India</p>
                            </div>
                        </div>
                        {/* Phone */}
                        <div className="flex items-start space-x-3">
                            <div className={cn("flex-shrink-0 p-2 mt-1 rounded-full bg-teal-100/70 dark:bg-teal-900/40", aviationSecondary)}>
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="mb-1 text-sm font-semibold text-foreground">Phone</h4>
                                <div className="space-y-1">
                                    <Link href="tel:+919485687609" className="block text-sm text-foreground/80 hover:text-foreground">+91 94856 87609</Link>
                                    <Link href="tel:+917842401155" className="block text-sm text-foreground/80 hover:text-foreground">+91 78424 01155</Link>
                                </div>
                            </div>
                        </div>
                        {/* Email */}
                        <div className="flex items-start space-x-3">
                            <div className={cn("flex-shrink-0 p-2 mt-1 rounded-full bg-teal-100/70 dark:bg-teal-900/40", aviationSecondary)}>
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="mb-1 text-sm font-semibold text-foreground">Email</h4>
                                <Link href="mailto:aviatorstrainingcentre@gmail.com" className="text-sm text-foreground/80 hover:text-foreground underline-offset-2 hover:underline">aviatorstrainingcentre@gmail.com</Link>
                            </div>
                        </div>
                        {/* Operating Hours */}
                        <div className="flex items-start space-x-3">
                            <div className={cn("flex-shrink-0 p-2 mt-1 rounded-full bg-teal-100/70 dark:bg-teal-900/40", aviationSecondary)}>
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="mb-1 text-sm font-semibold text-foreground">Operating Hours</h4>
                                <p className="text-sm text-foreground/80">Mon - Fri: 8:00 AM - 7:00 PM</p>
                                <p className="text-sm text-foreground/80">Weekends: 9:00 AM - 5:00 PM</p>
                            </div>
                        </div>

                        {/* Response Time */}
                        <div className="bg-teal-50/30 dark:bg-teal-900/20 rounded-lg p-3 border border-teal-200/50 dark:border-teal-800/30">
                            <div className="text-center">
                                <p className="text-sm font-medium text-teal-700 dark:text-teal-300 mb-1">Quick Response</p>
                                <p className="text-xs text-teal-600/90 dark:text-teal-400/90">We typically respond within 24 hours</p>
                            </div>
                        </div>

                        {/* Additional Contact Methods */}
                        <div className="space-y-2 pt-2">
                            <h4 className="text-sm font-semibold text-foreground mb-2">Preferred Contact Methods</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-md p-2 text-center">
                                    <p className="font-medium text-foreground/80">General Inquiries</p>
                                    <p className="text-foreground/60">Email or Phone</p>
                                </div>
                                <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-md p-2 text-center">
                                    <p className="font-medium text-foreground/80">Urgent Matters</p>
                                    <p className="text-foreground/60">Direct Call</p>
                                </div>
                            </div>
                        </div>



                    </div>
                    {/* Social Links */}
                    <div className="pt-3 border-t border-border/50 mt-auto">
                        <h4 className="mb-2 text-sm font-semibold text-foreground">Follow Us</h4>
                        <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" asChild className={cn("text-foreground/70 hover:text-foreground", aviationSecondary)}>
                                <Link href="https://www.facebook.com/profile.php?id=61576701390492" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={20} /></Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild className={cn("text-foreground/70 hover:text-foreground", aviationSecondary)}>
                                <Link href="https://www.instagram.com/aviatorstrainingcentre?igsh=MWd2NmVxdG83ZTdxMQ==" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={20} /></Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild className={cn("text-foreground/70 hover:text-foreground", aviationSecondary)}>
                                <Link href="https://youtube.com/@aviatewithatc?si=VGZ1IChG-bULcnVU" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M21.8 8.001a2.75 2.75 0 0 0-1.94-1.946C18.2 6 12 6 12 6s-6.2 0-7.86.055A2.75 2.75 0 0 0 2.2 8.001 28.6 28.6 0 0 0 2 12a28.6 28.6 0 0 0 .2 3.999a2.75 2.75 0 0 0 1.94 1.946C5.8 18 12 18 12 18s6.2 0 7.86-.055a2.75 2.75 0 0 0 1.94-1.946A28.6 28.6 0 0 0 22 12a28.6 28.6 0 0 0-.2-3.999zM10 15V9l6 3-6 3z"/></svg></Link>
                            </Button>
                            {/* <Button variant="ghost" size="icon" asChild className={cn("text-foreground/70 hover:text-foreground", aviationSecondary)}>
                                <Link href="#" aria-label="Twitter"><Twitter size={20} /></Link>
                            </Button> */}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ContactDetailsCard;
