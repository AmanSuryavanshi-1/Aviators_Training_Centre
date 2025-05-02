import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send,  } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from "@/components/ui/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';

interface ContactFormCardProps {
  inquirySubjects: string[];
}

const ContactFormCard: React.FC<ContactFormCardProps> = ({inquirySubjects}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const [isDemoBooking, setIsDemoBooking] = useState(false);
    const defaultDemoMessage = `I would like to book a demo. Please contact me to schedule a time.`;

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const subjectFromUrl = params.get('subject');
        const courseName = params.get('courseName');
        const nameFromUrl = params.get('name');
        const messageFromUrl = params.get('message');

        if (nameFromUrl) {
            setName(nameFromUrl);
        }
        if (subjectFromUrl) {
            setSubject(subjectFromUrl);
            setMessage(isDemoBooking ? `I would like to book a demo${courseName ? ` for the ${courseName} course` : ''}. Please contact me to schedule a time.` : String(messageFromUrl || ''));
            setIsDemoBooking(true);
        }
    }, [isDemoBooking, defaultDemoMessage]);

    const handleSubmit = (e: React.FormEvent) => {
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
        setTimeout(() => {
            setLoading(false);
            toast({
                title: isDemoBooking ? "Demo Request Received!" : "Message Sent Successfully!",
                description: isDemoBooking
                    ? `We have received your demo request and will contact you shortly.`
                    : `Thank you for reaching out! We will get back to you soon.`,
                variant: "default",
            });
            setName('');
            setEmail('');
            setPhone('');
            setSubject('');
            setMessage('');
        }, 1500);
    };
    const aviationPrimary = 'text-teal-700 dark:text-teal-300';
  return (
    <Card className="p-6 border rounded-lg shadow-sm bg-card border-border md:p-8">
      <CardHeader className="p-0 mb-6">
        <CardTitle className={cn("text-2xl font-semibold", aviationPrimary)}>
          {isDemoBooking ? 'Demo Request Form' : 'Send Us a Message'}
        </CardTitle>
                <CardDescription className="mt-1 text-foreground/70">
                    {isDemoBooking
                        ? `Confirm your details and the pre-filled request.`
                        : `Fill out the form below and we will get back to you shortly.`}
                </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5">
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
          <div className="grid grid-cols-1 gap-5">
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

                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={cn(
                    "cursor-text",
                    "focus-visible:ring-teal-500",
                    "cursor-not-allowed bg-muted/50"
                  )}
                />
              ) : (
                <Select
                  value={subject}
                  onValueChange={setSubject}
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
          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-sm font-medium">Your Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isDemoBooking ? "Add any specific questions here..." : "Please provide details about your question or request..."}
              rows={5}
              required={!isDemoBooking}
              readOnly={isDemoBooking}
              className={cn("cursor-text",
                "focus-visible:ring-teal-500",
                isDemoBooking && "bg-muted/50 cursor-not-allowed"
              )}
            />
          </div>
          <div>
            <Button
              type="submit"
              size="lg"
              className={cn(
                'flex gap-2 justify-center items-center w-full',
                'overflow-hidden relative text-white bg-teal-600 rounded-full shadow-md transition-all duration-300 ease-out group hover:bg-teal-700 hover:shadow-lg dark:bg-teal-500 dark:hover:bg-teal-600',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              disabled={loading}
            >
              {loading ? (
                <>
                  <motion.div
                    className="w-5 h-5 border-2 border-white rounded-full border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="ml-2">{isDemoBooking ? 'Submitting Request...' : 'Sending...'}</span>
                </>
              ) : (
                <>
                  {isDemoBooking ? 'Confirm Demo Request' : 'Send Message'} <Send className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
                    </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactFormCard;