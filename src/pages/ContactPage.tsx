
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main>
        {/* Hero section */}
        <section className="relative py-20 md:py-28">
          <div className="absolute inset-0 bg-aviation-navy/10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-aviation-navy mb-4">Contact Us</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Have questions about our flight training programs or want to schedule a visit?
                Reach out to our team and we'll be happy to assist you.
              </p>
            </div>
          </div>
        </section>
        
        {/* Contact section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Contact information */}
              <div className="lg:col-span-1">
                <h2 className="text-2xl font-bold text-aviation-navy mb-6">Get in Touch</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-aviation-gold/10 p-3 rounded-full">
                      <MapPin className="h-6 w-6 text-aviation-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-aviation-navy">Location</h3>
                      <p className="text-gray-600">123 Aviation Way<br />Skyline Heights, CA 90001</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-aviation-gold/10 p-3 rounded-full">
                      <Phone className="h-6 w-6 text-aviation-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-aviation-navy">Phone</h3>
                      <p className="text-gray-600">(555) 123-4567</p>
                      <p className="text-gray-600">(555) 987-6543</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-aviation-gold/10 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-aviation-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-aviation-navy">Email</h3>
                      <p className="text-gray-600">aviatorstrainingcentre@gmail.com</p>
                      <p className="text-gray-600">admissions@skyboundaviator.edu</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10">
                  <h3 className="text-lg font-semibold text-aviation-navy mb-3">Operating Hours</h3>
                  <table className="w-full text-gray-600">
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
              </div>
              
              {/* Contact form */}
              <div className="lg:col-span-2">
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
                  <h2 className="text-2xl font-bold text-aviation-navy mb-6">Send Us a Message</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
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
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="Flight Training Inquiry"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="I'm interested in learning more about your pilot training programs..."
                        rows={5}
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="bg-aviation-navy hover:bg-aviation-navy/90 text-white w-full flex items-center justify-center gap-2 py-6"
                      disabled={loading}
                    >
                      {loading ? (
                        "Sending..."
                      ) : (
                        <>
                          Send Message <Send className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Map section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="border-t border-gray-200 pt-12">
              <h2 className="text-2xl font-bold text-aviation-navy mb-6 text-center">Find Us</h2>
              <div className="w-full h-96 bg-gray-200 rounded-xl overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3306.4014287566006!2d-118.42118242309213!3d34.019346872898314!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bbf5ca94c047%3A0x50fdcf9dc9e97d8a!2sSanta%20Monica%20Airport%20(SMO)!5e0!3m2!1sen!2sus!4v1681308898111!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Skybound Aviator Academy Location"
                ></iframe>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ContactPage;
