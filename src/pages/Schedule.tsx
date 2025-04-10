
import React, { useState } from 'react';
import { format } from 'date-fns';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
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
    { value: "intro", label: "Introductory Meeting" },
    { value: "tour", label: "Campus Tour" },
    { value: "assessment", label: "Flight Assessment" },
    { value: "enrollment", label: "Enrollment Consultation" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !timeSlot || !meetingType) {
      toast({
        title: "Missing information",
        description: "Please select a date, time and meeting type.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Meeting scheduled!",
        description: `Your meeting is set for ${format(date, 'MMMM d, yyyy')} at ${timeSlot}.`,
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
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main>
        {/* Hero section */}
        <section className="relative py-20 md:py-24">
          <div className="absolute inset-0 bg-aviation-navy/10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-aviation-navy mb-4">Schedule a Meeting</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Book a consultation with our aviation experts to discuss your training options,
                tour our facilities, or get answers to your questions.
              </p>
            </div>
          </div>
        </section>
        
        {/* Scheduling section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 md:p-10">
                  <h2 className="text-2xl font-bold text-aviation-navy mb-6">Book Your Appointment</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-aviation-navy mb-4 flex items-center">
                        <Users className="mr-2 h-5 w-5 text-aviation-gold" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(555) 123-4567"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="meeting-type">Meeting Type</Label>
                          <Select 
                            value={meetingType} 
                            onValueChange={setMeetingType}
                          >
                            <SelectTrigger id="meeting-type">
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
                      <h3 className="text-lg font-semibold text-aviation-navy mb-4 flex items-center">
                        <Clock className="mr-2 h-5 w-5 text-aviation-gold" />
                        Date & Time
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label>Select Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                disabled={(date) => {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  // Disable past dates and weekends
                                  return (
                                    date < today ||
                                    date.getDay() === 0 // Sunday
                                  );
                                }}
                                initialFocus
                                className="p-3"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Select Time</Label>
                          <Select 
                            value={timeSlot} 
                            onValueChange={setTimeSlot}
                            disabled={!date}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pick a time" />
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
                      <h3 className="text-lg font-semibold text-aviation-navy mb-4 flex items-center">
                        <Info className="mr-2 h-5 w-5 text-aviation-gold" />
                        Additional Information
                      </h3>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Please provide any specific questions or topics you'd like to discuss during the meeting."
                          rows={3}
                          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="bg-aviation-gold hover:bg-aviation-gold/90 text-white w-full py-6"
                      disabled={loading || !date || !timeSlot || !meetingType}
                    >
                      {loading ? "Scheduling..." : "Schedule Meeting"}
                    </Button>
                  </form>
                </div>
              </div>
              
              <div className="mt-10 bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold text-aviation-navy mb-3">What to Expect</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-aviation-gold mr-2">•</span>
                    <span>Confirmation email with meeting details will be sent immediately after booking.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-aviation-gold mr-2">•</span>
                    <span>A staff member will contact you 24 hours before your appointment to confirm.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-aviation-gold mr-2">•</span>
                    <span>Please arrive 10 minutes early for your appointment.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-aviation-gold mr-2">•</span>
                    <span>Bring a government-issued ID if you're planning to tour our facilities.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Schedule;
