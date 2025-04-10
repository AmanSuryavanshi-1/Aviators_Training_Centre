import React from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Award, BookOpen, Briefcase, UserCheck } from 'lucide-react'; // Added UserCheck

// Placeholders
const instructorHeaderUrl = "https://images.unsplash.com/photo-1549057357-675a6ea03eae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8ZmxpZ2h0JTIwaW5zdHJ1Y3RvcnN8fHx8fHwxNjE4NTQ5MzQ1&ixlib=rb-1.2.1&q=80&w=1080";
const getAvatarUrl = (name: string) => `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6366F1&textColor=ffffff&fontSize=36`; // Using secondary color

// Sample Instructor Data (Generic - REPLACE WITH ACTUAL DATA)
const instructors = [
  {
    name: "Lead Instructor - ATPL",
    title: "Experienced Airline Captain",
    avatar: getAvatarUrl("Lead ATPL"),
    bio: "Bringing years of airline operational experience to the classroom, focusing on advanced concepts for ATPL candidates. Expert in Navigation and Meteorology.",
    ratings: ["ATPL", "CFI", "Type Rated"],
    expertise: ["Advanced Navigation", "Aviation Meteorology", "Airline Operations"]
  },
  {
    name: "Senior Instructor - CPL",
    title: "Commercial Pilot & Educator",
    avatar: getAvatarUrl("Senior CPL"),
    bio: "Specializing in guiding students through the complexities of CPL regulations and technical subjects, ensuring a strong foundation for commercial flying.",
    ratings: ["CPL", "CFI", "CFII"],
    expertise: ["Air Regulations", "Technical General", "Flight Instruction"]
  },
  {
    name: "RTR(A) Specialist",
    title: "Communications Expert",
    avatar: getAvatarUrl("RTR Expert"),
    bio: "Dedicated to mastering radio telephony procedures and ensuring clear, confident communication skills essential for passing the RTR(A) exam.",
    ratings: ["RTR(A) License Holder"],
    expertise: ["Radio Telephony", "Aviation English", "Exam Preparation"]
  },
   {
    name: "Interview Prep Coach",
    title: "Confidence & Career Advisor",
    avatar: getAvatarUrl("Interview Coach"),
    bio: "Focuses on building interview confidence, refining communication skills, and preparing candidates for the specific requirements of airline hiring processes.",
    ratings: ["Professional Coach"],
    expertise: ["Interview Techniques", "Aviation Career Guidance", "English Proficiency"]
  }
];

// Animation Variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, type: "spring" } }
};

const Instructors: React.FC = () => {
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
          src={instructorHeaderUrl} 
          alt="Group of Aviators Training Centre instructors" 
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ filter: 'brightness(0.6)' }} 
        />
        <motion.div 
          className="relative z-10 max-w-3xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">Meet Our Expert Faculty</h1>
          <p className="text-lg md:text-xl text-foreground/80 mt-2">Experienced instructors guiding your path to success.</p>
        </motion.div>
      </motion.section>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-16">
        
        <motion.section
           variants={sectionVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, amount: 0.1 }} 
           className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {instructors.map((instructor, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="flex flex-col h-full bg-card shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <CardHeader className="flex flex-col items-center text-center p-6 bg-card/50">
                  <Avatar className="w-24 h-24 mb-4 border-4 border-secondary"> {/* Changed border color */} 
                    <AvatarImage src={instructor.avatar} alt={instructor.name} />
                    <AvatarFallback>{instructor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl text-foreground">{instructor.name}</CardTitle>
                  <CardDescription className="text-secondary font-medium">{instructor.title}</CardDescription> {/* Changed text color */} 
                </CardHeader>
                <CardContent className="p-6 flex-grow">
                  <p className="text-foreground/70 text-sm mb-4">{instructor.bio}</p>
                  <div className="mb-3">
                     <h4 className="text-sm font-semibold text-foreground/90 mb-2">Area Focus / Ratings:</h4>
                     <div className="flex flex-wrap gap-1">
                        {instructor.ratings.map(rating => (
                            <Badge key={rating} variant="secondary">{rating}</Badge>
                        ))}
                     </div>
                  </div>
                   <div>
                     <h4 className="text-sm font-semibold text-foreground/90 mb-2">Expertise:</h4>
                     <div className="flex flex-wrap gap-1">
                        {instructor.expertise.map(area => (
                            <Badge key={area} variant="outline">{area}</Badge>
                        ))}
                     </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
             {/* Placeholder for adding more instructors or a general statement */} 
             <motion.div variants={itemVariants}>
                 <Card className="flex flex-col h-full bg-card/50 border border-dashed border-border/60 items-center justify-center text-center p-6">
                    <UserCheck className="h-12 w-12 text-foreground/50 mb-4" />
                    <CardTitle className="text-xl text-foreground/80 mb-2">More Experts Coming Soon</CardTitle>
                    <CardDescription className="text-foreground/60 text-sm">Our team comprises highly experienced, airline-rated instructors dedicated to your success.</CardDescription>
                 </Card>
            </motion.div>
        </motion.section>

         {/* The ATC Difference Section */}
         <motion.section 
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }} 
            className="text-center mt-20 py-12 px-6"
        > 
            <h2 className="text-3xl font-bold mb-6">The Aviators Training Centre Difference</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                 <div className="flex flex-col items-center">
                     <Award className="h-10 w-10 text-primary mb-3"/>
                     <h3 className="text-lg font-semibold mb-1 text-foreground">Real-World Experience</h3>
                     <p className="text-foreground/70 text-sm">Learn from instructors with direct airline and operational backgrounds.</p>
                 </div>
                 <div className="flex flex-col items-center">
                     <BookOpen className="h-10 w-10 text-primary mb-3"/>
                     <h3 className="text-lg font-semibold mb-1 text-foreground">Commitment to Teaching</h3>
                     <p className="text-foreground/70 text-sm">Passionate educators focused on effective learning and concept mastery.</p>
                 </div>
                  <div className="flex flex-col items-center">
                     <Briefcase className="h-10 w-10 text-primary mb-3"/>
                     <h3 className="text-lg font-semibold mb-1 text-foreground">Career-Focused Guidance</h3>
                     <p className="text-foreground/70 text-sm">Mentorship extends beyond the syllabus to support your aviation career goals.</p>
                 </div>
            </div>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
};

export default Instructors;
