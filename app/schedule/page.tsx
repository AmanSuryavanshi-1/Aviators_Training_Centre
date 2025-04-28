// Added "use client" for state, hooks, and event handlers
"use client";

import React, { useState } from 'react';
import { format } from 'date-fns';
// Removed Header and Footer imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Clock, Users, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion'; // Import motion

// Define colors based on your tailwind config
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';
const aviationNavy = 'text-gray-800 dark:text-gray-200'; // Example for navy text
const aviationGold = 'text-amber-600 dark:text-amber-400'; // Example for gold accent

const Schedule = () => {
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState<string>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [meetingType, setMeetingType] = useState<string>();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
    "4:00 PM", "4:30 PM"
  ];

  const meetingTypes = [
    { value: "general-inquiry", label: "General Inquiry" },
    { value: "course-info", label: "Course Information Session" },
    { value: "enrollment", label: "Enrollment Consultation" },
    { value: "demo-class", label: "Book a Demo Class" },
    { value: "visit", label: "Centre Visit / Tour" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !timeSlot || !meetingType || !name || !email) { // Added name/email check
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (name, email, date, time, meeting type).",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    // --- Replace with your actual API endpoint call --- 
    // Example using fetch:
    // try {
    //   const response = await fetch('/api/schedule', { // Example API route
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ 
    //       name, email, phone, meetingType, 
    //       date: format(date, 'yyyy-MM-dd'), // Send formatted date 
    //       timeSlot, notes 
    //     }),
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

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Meeting Scheduled!",
      description: `Your ${meetingTypes.find(m => m.value === meetingType)?.label || 'meeting'} is set for ${format(date, 'MMMM d, yyyy')} at ${timeSlot}. We'll be in touch!`,
      variant: "default",
    });
      
    // Reset form
    setDate(undefined);
    setTimeSlot(undefined);
    setName('');
    setEmail('');
    setPhone('');
    setMeetingType(undefined);
    setNotes('');
    setLoading(false);
  };

  // Removed surrounding div
  return (
    <>
      {/* Hero section */}
      <motion.section 
        className="relative py-20 md:py-24 bg-gradient-to-b from-teal-50/30 to-transparent dark:from-gray-800/40 dark:to-transparent" // Added subtle gradient
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <motion.h1 
              className={cn("text-4xl md:text-5xl font-bold mb-4", aviationPrimary)} // Use primary color
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Schedule a Meeting
            </motion.h1>
            <motion.p 
              className="text-lg text-foreground/80 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Book a consultation with our aviation experts to discuss your training options,
              request a demo class, or get answers to your questions.
            </motion.p>
          </div>
        </div>
      </motion.section>
        
      {/* Scheduling section */}
      <motion.section 
        className="py-12 md:py-16 bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="bg-card rounded-xl shadow-lg overflow-hidden border border-border/50"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="p-6 md:p-10">
                <h2 className={cn("text-2xl font-bold mb-6", aviationPrimary)}>Book Your Appointment</h2>
                  
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Info */}
                  <div>
                    <h3 className={cn("text-lg font-semibold mb-4 flex items-center", aviationSecondary)}> 
                      <Users className={cn("mr-2 h-5 w-5", aviationSecondary)} />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-sm font-medium">Full Name <span className="text-red-500">*</span></Label>
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
                        <Label htmlFor="email" className="text-sm font-medium">Email <span className="text-red-500">*</span></Label>
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
                        <Label htmlFor="meeting-type" className="text-sm font-medium">Meeting Type <span className="text-red-500">*</span></Label>
                        <Select 
                          value={meetingType} 
                          onValueChange={setMeetingType}
                          required
                        >
                          <SelectTrigger id="meeting-type" className="focus:ring-teal-500">
                            <SelectValue placeholder="Select meeting type" />
                          </SelectTrigger>
                          <SelectContent>
                            {meetingTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                    
                  {/* Date & Time */}
                  <div>
                    <h3 className={cn("text-lg font-semibold mb-4 flex items-center", aviationSecondary)}> 
                      <Clock className={cn("mr-2 h-5 w-5", aviationSecondary)} />
                      Date & Time <span className="text-red-500">*</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Select Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal focus-visible:ring-teal-500",
                                !date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-card border border-border shadow-md" align="start">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              disabled={(d) => { // Renamed variable to avoid conflict
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                // Disable past dates
                                return d < today;
                                // Optionally disable weekends: || d.getDay() === 0 || d.getDay() === 6
                              }}
                              initialFocus
                              className="p-0" // Remove internal padding if PopoverContent handles it
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Select Time</Label>
                        <Select 
                          value={timeSlot} 
                          onValueChange={setTimeSlot}
                          disabled={!date} // Disable if date is not selected
                          required
                        >
                          <SelectTrigger className="focus:ring-teal-500">
                            <SelectValue placeholder={date ? "Pick a time" : "Select date first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((slot) => (
                              <SelectItem key={slot} value={slot}>
                                {slot}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                    
                  {/* Additional Notes */}
                  <div>
                    <h3 className={cn("text-lg font-semibold mb-4 flex items-center", aviationSecondary)}> 
                      <Info className={cn("mr-2 h-5 w-5", aviationSecondary)} />
                      Additional Information
                    </h3>
                    <div className="space-y-1.5">
                      <Label htmlFor="notes" className="text-sm font-medium">Notes <span className="text-foreground/50">(Optional)</span></Label>
                      <Textarea // Use Textarea component
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Please provide any specific questions or topics you'd like to discuss..."
                        rows={3}
                        className="w-full focus-visible:ring-teal-500"
                      />
                    </div>
                  </div>
                    
                  <Button 
                    type="submit" 
                    size="lg"
                    className={cn(
                      'w-full flex items-center justify-center gap-2',
                      'group relative rounded-full px-6 py-3 overflow-hidden bg-teal-600 text-white shadow-md transition-all duration-300 ease-out hover:bg-teal-700 hover:shadow-lg dark:bg-teal-500 dark:hover:bg-teal-600',
                      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                    disabled={loading || !date || !timeSlot || !meetingType || !name || !email}
                  >
                    {loading ? (
                       <>
                          <motion.div
                              className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <span className="ml-2">Scheduling...</span>
                       </>
                     ) : "Schedule Meeting"}
                  </Button>
                </form>
              </div>
            </motion.div>
              
            <motion.div 
              className="mt-10 bg-muted/50 dark:bg-muted/20 p-6 rounded-xl border border-border/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <h3 className={cn("text-xl font-semibold mb-3", aviationPrimary)}>What to Expect</h3>
              <ul className="space-y-2 text-foreground/80 text-sm">
                {[ // Array of expectations for easier mapping
                  "Confirmation email with meeting details will be sent immediately after booking.",
                  "A staff member may contact you 24 hours before your appointment to confirm.",
                  "Please arrive 5-10 minutes early for your scheduled appointment.",
                  "If visiting the centre, please bring a government-issued ID."
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className={cn("mr-2 pt-0.5", aviationSecondary)}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.section>
      {/* Footer is rendered by layout.tsx */}
    </>
  );
};

export default Schedule;
