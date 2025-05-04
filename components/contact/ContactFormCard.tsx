import React, { useState, useEffect, FormEvent } from 'react';
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

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}
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
    const [isDemoBooking, setIsDemoBooking] = useState(false);
    
    const { toast } = useToast();

    // Effect to handle URL parameters on component mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search); // Get URL search parameters
        const subjectFromUrl = params.get('subject');
        const courseName = params.get('courseName');
        const nameFromUrl = params.get('name');
        const messageFromUrl = params.get('message');
        const isDemo = subjectFromUrl === 'Book a Demo'; // Check if it's specifically a demo booking
        setIsDemoBooking(isDemo);

        if (nameFromUrl) {
            setName(nameFromUrl);
        }
        // Set Subject
        if (subjectFromUrl) {
            setSubject(subjectFromUrl);
        }

        // Set Message based on priority: messageFromUrl (if not demo) > Demo > default
        if (messageFromUrl && !isDemo) {
            // If a message is provided in the URL and it's NOT a demo booking, use it
            setMessage(messageFromUrl);
        } else if (isDemo) {
            // If it IS a demo booking, set the specific demo message (this takes precedence if somehow both messageFromUrl and isDemo are true)
            setMessage(`I would like to book a demo${courseName ? ` for the ${courseName} course` : ''}. Please contact me to schedule a time.`);
        }
        // If neither condition is met (no messageFromUrl or it's a demo without a message param), message remains the initial empty string

    }, []); // Empty dependency array to run only once on component mount
    /**
     * Handles the form submission.
     * Sends a POST request to the /api/contact endpoint with form data.
     * @param {FormEvent} e - The form submit event.
     */
    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        // Check if subject is present when form is not in Demo booking mode.
        if (!isDemoBooking && !subject) {
            toast({
                title: "Subject Required",

                description: "Please select a subject for your inquiry.",
                variant: "destructive",
            });
            return;
        }
        setLoading(true);

        // Collect form data
        const formData: FormData = {
          name,
            email,
            phone,
            subject,
            message,
        };

        try {
            // Send a POST request to the API with absolute URL in production
            const apiUrl = process.env.NODE_ENV === 'production' 
                ? `${window.location.origin}/api/contact`
                : '/api/contact';
                
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData), // Send form data as JSON
            });

            // Check if response is successful
            if (!response.ok) {
              // Clone the response before reading its body to avoid the "body stream already read" error
              const responseClone = response.clone();
              
              // Try to parse error response as JSON, if fails use text() method
              let errorMessage = "An error occurred. Please try again.";
              try {
                  const errorData = await responseClone.json();
                  errorMessage = errorData.error || errorMessage;
              } catch (jsonError) {
                try {
                  errorMessage = await response.text(); // Get raw text if not JSON
                } catch (textError) {
                  console.error("Error reading response:", textError);
                  // Keep default error message
                }
              }
              // Show error toast
              toast({
                  title: "Submission Failed",
                  description: errorMessage,
                  variant: "destructive",
              });
            } else {
              // Show success toast
              toast({
                  title: isDemoBooking ? "Demo Request Received!" : "Message Sent Successfully!",
                  description: isDemoBooking
                      ? `We have received your demo request and will contact you shortly.`
                      : `Thank you for reaching out! We will get back to you soon.`,
                  variant: "default",
              });

              // Reset form fields
              setName('');
              setEmail('');
              setPhone('');
              // Reset subject and message, handle demo booking specific case
              if (isDemoBooking) {
                  const courseName = new URLSearchParams(window.location.search).get('courseName');
                  setMessage(`I would like to book a demo${courseName ? ` for the ${courseName} course` : ''}. Please contact me to schedule a time.`);
                } else {
                    setSubject('');
                    setMessage('');
                }
            } 
            // else {
            //     toast({
            //         title: "Submission Failed",
            //         description: result.error || "An error occurred. Please try again.",
            //         variant: "destructive",
            //     });
            // }
        } catch (error) {
            console.error("Form submission error:", error);
            // Show error toast
            toast({
                title: "Submission Error",
                description: "An unexpected error occurred. Please try again later.",
                variant: "destructive",
            });
        } finally{
            setLoading(false);
        }
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
        <form onSubmit={handleFormSubmit} className="space-y-5">
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
              {isDemoBooking || (subject && new URLSearchParams(window.location.search).get('subject')) ? (
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  readOnly={isDemoBooking}
                  className={cn(
                    "cursor-text",
                    "focus-visible:ring-teal-500",
                    isDemoBooking && "cursor-not-allowed bg-muted/50"
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