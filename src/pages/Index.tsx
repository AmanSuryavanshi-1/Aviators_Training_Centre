import React from 'react';
import { motion } from 'framer-motion';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, Clock, MessageSquare, Users, DollarSign } from 'lucide-react'; // Updated icons
import { Link } from 'react-router-dom';

// Placeholder image URLs (replace with actual high-quality images)
const heroImageUrl = "https://images.unsplash.com/photo-1484653850798-575a3ac1f2c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8YWlycGxhbmV8fHx8fHwxNjE4NTQ4NjI1&ixlib=rb-1.2.1&q=80&w=1080";
const coursesOverviewImageUrl = "https://images.unsplash.com/photo-1516876345887-6dd751719f5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8ZmxpZ2h0JTIwc2Nob29sJTIwc3R1ZHl8fHx8fHwxNjE4NTUwMjM0&ixlib=rb-1.2.1&q=80&w=1080";

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4
    }
  }
};

const Index: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section */}
      <motion.section
        className="relative h-[70vh] flex items-center justify-center text-center text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <img 
          src={heroImageUrl} 
          alt="Airplane soaring through clouds" 
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ filter: 'brightness(0.5)' }} 
        />
        <motion.div 
          className="relative z-10 max-w-3xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
           <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">✈ Welcome to AVIATORS TRAINING CENTRE! ✈</h1>
          <p className="text-xl md:text-2xl text-foreground/80 mb-8">Transforming Dreams into Wings. Specialized CPL/ATPL Classes Just for You!</p>
          <Link to="/courses">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">Explore Training Programs</Button>
          </Link>
        </motion.div>
      </motion.section>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-16 space-y-20">

        {/* Why Choose Us Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose Aviators Training Centre?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[ 
              { icon: UserCheck, title: "Personalized Coaching", description: "Tailored guidance matching your learning style for thorough understanding and confident progress." },
              { icon: Clock, title: "Flexible Scheduling", description: "Adaptable class timings ideal for CPL/ATPL candidates fitting around flight schedules or jobs." },
              { icon: MessageSquare, title: "24/7 Doubt-Clearing", description: "Stuck on a concept? Our dedicated team is available round-the-clock to help you resolve doubts." },
              { icon: Users, title: "Expert Faculty", description: "Learn from highly experienced, airline-rated instructors bringing real-world insights." },
              { icon: DollarSign, title: "Affordable Courses", description: "Premium, world-class training at competitive prices without a heavy price tag." },
              // Added a placeholder or link to contact
              { icon: MessageSquare, title: "Get Started Today", description: "Ready to take the next step? Contact us to discuss your training needs." },
            ].map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="text-center h-full bg-card hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                       <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-foreground">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/70">{feature.description}</p>
                     {/* Optional: Add a specific button/link for the last item */} 
                    {index === 5 && (
                        <div className="mt-4">
                            <Link to="/contact">
                                <Button variant="outline" size="sm">Contact Us</Button>
                            </Link>
                        </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Courses Overview Section */}
        <motion.section
          className="text-center"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className="text-4xl font-bold mb-6">Our Training Programs</h2>
          <p className="max-w-3xl mx-auto text-foreground/70 mb-12">Comprehensive ground school for DGCA CPL & ATPL exams, RTR(A), Type Rating Prep, One-on-One Classes, and Interview Preparation.</p>
          <motion.img 
            src={coursesOverviewImageUrl} 
            alt="Student studying aviation charts" 
            className="rounded-lg shadow-md mx-auto mb-8 w-full max-w-4xl h-auto object-cover"
            variants={itemVariants}
          />
          <Link to="/courses">
            <Button variant="default">See Program Details</Button>
          </Link>
        </motion.section>

        {/* Testimonial Snippet (Keep generic or update if provided) */}
         <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="bg-card rounded-lg p-12 text-center"
        >
            <motion.blockquote variants={itemVariants} className="max-w-3xl mx-auto">
                <p className="text-2xl italic text-foreground/90 mb-4">"ATC provided the personalized attention I needed to succeed. The flexible timings and expert instructors made all the difference!"</p>
                <footer className="text-foreground/70">- Aspiring Pilot</footer>
            </motion.blockquote>
        </motion.section>

        {/* Call to Action Section */}
        <motion.section
          className="text-center bg-gradient-to-r from-primary to-secondary rounded-lg py-16 px-6 text-white"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl font-bold mb-4">Ready to Elevate Your Skills?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">Get ready to elevate your skills and confidence as we embark on this journey together. Clear skies ahead!</p>
            <div className="space-x-4">
                {/* Link to WhatsApp or Contact */}
                <a href="https://wa.me/919485687609" target="_blank" rel="noopener noreferrer">
                   <Button size="lg" variant="outline" className="bg-white text-primary hover:bg-gray-100">Chat on WhatsApp</Button>
                </a>
                <Link to="/contact">
                    <Button size="lg" variant="ghost" className="border border-white hover:bg-white/10">Contact Us Now</Button>
                </Link>
            </div>
          </motion.div>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
};

export default Index;
