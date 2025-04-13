import React from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookMarked, MicVocal, Plane, User, GraduationCap, CheckSquare, RadioTower, Briefcase, MessageCircle, Users, Clock } from 'lucide-react'; // Added/updated icons
import { Link } from 'react-router-dom';

// Placeholder
const courseHeaderUrl = "https://images.unsplash.com/photo-1519389950473-47ba0277781c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8YXZpYXRpb24lMjBzdHVkeXxlbnwwfHx8fDE2MTg1NTExMzA&ixlib=rb-1.2.1&q=80&w=1080";
const typeRatingImageUrl = "https://images.unsplash.com/photo-1560461395-67640a1c1316?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8Y29ja3BpdCUyMHNpbXVsYXRvcnxlbnwwfHx8fDE2MTg1NTExNzk&ixlib=rb-1.2.1&q=80&w=1080";

// Animation Variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
};

// ATC Course Data Structure
const cplAtplSubjects = [
    { icon: BookMarked, name: "Air Navigation", description: "Mastering flight paths, charts, and instruments." },
    { icon: BookMarked, name: "Meteorology", description: "Understanding weather patterns for safe flight." },
    { icon: BookMarked, name: "Air Regulations", description: "Comprehensive knowledge of aviation laws." },
    { icon: BookMarked, name: "Technical General", description: "Principles of flight, engines, and systems." },
    { icon: BookMarked, name: "Technical Specific", description: "In-depth study of specific aircraft types." },
];

const otherPrograms = [
    { 
        icon: RadioTower, 
        title: "RTR(A) - Radio Telephony", 
        description: "Master aviation communication protocols required for the Radio Telephony Restricted (Aeronautical) license.", 
        image: "https://images.unsplash.com/photo-1581472256047-d37f6d14e0c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8YXZpYXRpb24lMjByYWRpb3xlbnwwfHx8fDE2MTg1NTEzMzk&ixlib=rb-1.2.1&q=80&w=1080" 
    },
    { 
        icon: Plane, 
        title: "A320 & B737 Type Rating Prep", 
        description: "Affordable pre & post type rating training covering previous exam questions and full preparation for major airline exams (AIX, IndiGo, Air India).", 
        image: typeRatingImageUrl 
    },
     { 
        icon: User, 
        title: "One-on-One Online Classes", 
        description: "Feel hesitant in batches? Personalized online classes available for all CPL and ATPL subjects tailored to your pace.", 
        image: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8b25saW5lJTIwbGVhcm5pbmd8ZW58MHx8fHwxNjE4NTUxNDIw&ixlib=rb-1.2.1&q=80&w=1080" 
    },
    { 
        icon: Briefcase, 
        title: "Interview Preparation", 
        description: "Build confidence and prepare effectively for airline interviews with specialized English language and confidence-building sessions.", 
        image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8am9iJTIwaW50ZXJ2aWV3fGVufDB8fHx8MTYxODU1MTQ4MQ&ixlib=rb-1.2.1&q=80&w=1080" 
    }
];

const Courses: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />

      {/* Page Header */}
      <motion.section
        className="relative h-[40vh] flex items-center justify-center text-center text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img 
          src={courseHeaderUrl} 
          alt="Students studying in a classroom setting" 
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ filter: 'brightness(0.6)' }} 
        />
        <motion.div 
          className="relative z-10 max-w-3xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">Our Training Programs</h1>
          <p className="text-lg md:text-xl text-foreground/80 mt-2">Comprehensive Ground School & Preparation Services</p>
        </motion.div>
      </motion.section>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-16 space-y-20">
        
        {/* CPL/ATPL Subjects Section */}
        <motion.section
           variants={sectionVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, amount: 0.2 }}
        >
            <h2 className="text-3xl font-bold text-center mb-4">Complete CPL/ATPL Ground Training</h2>
            <p className="text-center text-foreground/70 max-w-3xl mx-auto mb-10">We provide in-depth training for all subjects under the DGCA CPL and ATPL syllabus.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cplAtplSubjects.map((subject, index) => (
                    <motion.div key={index} variants={itemVariants}>
                        <Card className="bg-card h-full flex flex-col items-center text-center p-6 hover:shadow-md transition-shadow">
                             <div className="p-3 bg-primary/10 rounded-full mb-3">
                                 <subject.icon className="h-7 w-7 text-primary" />
                            </div>
                            <CardTitle className="text-lg font-semibold text-foreground mb-1">{subject.name}</CardTitle>
                            <CardDescription className="text-foreground/70 text-sm">{subject.description}</CardDescription>
                        </Card>
                    </motion.div>
                ))}
                 <motion.div variants={itemVariants}> 
                    {/* Call to action card */}
                    <Card className="bg-primary/10 border-primary border h-full flex flex-col items-center text-center p-6 justify-center">
                         <GraduationCap className="h-8 w-8 text-primary mb-3"/>
                         <CardTitle className="text-lg font-semibold text-primary mb-2">Ready to Master the Syllabus?</CardTitle>
                         <Link to="/contact">
                             <Button size="sm" variant="default">Enroll Now</Button>
                         </Link>
                    </Card>
                 </motion.div>
            </div>
        </motion.section>

        {/* Other Programs Section */}
        <motion.section
           variants={sectionVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, amount: 0.1 }}
           className="space-y-12"
        >
            <h2 className="text-3xl font-bold text-center mb-10">Additional Training & Prep Services</h2>
             {otherPrograms.map((program, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="overflow-hidden bg-card shadow-md hover:shadow-lg transition-shadow">
                <div className={`grid grid-cols-1 ${program.image ? 'md:grid-cols-3' : 'md:grid-cols-1'}`}> {/* Adjust grid if no image */} 
                  {program.image && (
                    <div className="md:col-span-1">
                      <img src={program.image} alt={program.title} className="w-full h-full object-cover min-h-[200px] md:max-h-[250px]" />
                    </div>
                  )}
                  <div className={`${program.image ? 'md:col-span-2' : 'md:col-span-1'} p-6 flex flex-col justify-between`}>
                    <div>
                      <CardHeader className="p-0 mb-3">
                        <div className="flex items-center space-x-3 mb-2">
                           <program.icon className="h-6 w-6 text-secondary flex-shrink-0" />
                           <CardTitle className="text-2xl text-foreground">{program.title}</CardTitle>
                        </div>
                         <CardDescription className="text-foreground/70">{program.description}</CardDescription>
                      </CardHeader>
                    </div>
                    <CardFooter className="p-0 pt-6 mt-auto">
                      <Link to="/contact">
                        <Button variant="secondary">Learn More</Button>
                      </Link>
                    </CardFooter>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.section>

         {/* Features Summary Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="bg-card rounded-lg p-12"
        >
            <h2 className="text-3xl font-bold text-center mb-8">ATC Features</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6 text-center text-foreground/80">
                <li className="flex flex-col items-center"><MessageCircle className="h-7 w-7 text-primary mb-2"/> 24/7 Doubt Support</li>
                <li className="flex flex-col items-center"><Users className="h-7 w-7 text-primary mb-2"/> One-on-One Class Option</li>
                <li className="flex flex-col items-center"><Clock className="h-7 w-7 text-primary mb-2"/> Flexible Timings</li>
                <li className="flex flex-col items-center"><Briefcase className="h-7 w-7 text-primary mb-2"/> Airline Exam Prep</li>
            </ul>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
};

export default Courses;
