import React from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Award, BookOpen, Briefcase, UserCheck } from 'lucide-react';

// Image paths from restructured public folder
const instructorHeaderUrl = "/HomePage/Course2.webp";

// Instructor Data with updated image paths
const instructors = [
  {
    name: "Lead Instructor - ATPL",
    title: "- airline pilot and educator",
    avatar: "/Instructor/Instructor1.webp", // Using instructor image from public folder
    bio: "A seasoned Airline Captain with extensive operational experience, now dedicated to shaping the next generation of ATPL holders. Provides in-depth instruction on advanced navigation, complex aircraft systems, and meteorology, ensuring candidates are prepared for the rigors of airline operations.",
    expertise: ["Advanced Navigation", "Aviation Meteorology", "Airline Operations", "Aircraft Systems"]
  },
  {
    name: "Senior Instructor - CPL",
    title: "- airline pilot and educator",
    avatar: "/Instructor/Instructor2.webp", // Using instructor image from public folder
    bio: "An accomplished Commercial Pilot and dedicated educator, specializing in CPL and technical subjects. Creates a clear pathway for students to master air regulations, aircraft technical knowledge, and flight principles, building a strong foundation for a commercial aviation career.",
    expertise: ["Air Regulations", "Technical General", "Flight Instruction", "Aerodynamics"]
  },
  {
    name: "RTR(A) Specialist",
    title: "Communications Expert",
    avatar: "/Instructor/Instructor3.webp", // Using instructor image from public folder
    bio: "Expert in aviation communication, focusing exclusively on RTR(A) preparation. Delivers targeted training on radio telephony phraseology, procedures, and aviation English, equipping students with the confidence and skills needed to excel in the RTR(A) examination.",
    expertise: ["Radio Telephony", "Aviation English", "Exam Preparation", "ATC Procedures"]
  },
   {
    name: "Interview Prep Coach",
    title: "Confidence & Career Advisor",
    avatar: "/Instructor/Instructor1.webp", // Reusing instructor image as placeholder for fourth instructor
    bio: "A specialized coach focused on equipping aspiring pilots with the confidence and skills needed for successful airline interviews. Offers tailored guidance on interview techniques, communication strategies, and understanding airline expectations, paving the way for career success.",
    expertise: ["Interview Techniques", "Aviation Career Guidance", "English Proficiency", "Soft Skills"]
  }
];

// Animation Variants (kept as is)
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, type: "spring" } }
};

const cardHoverVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.3 } }
};

const Instructors: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />

      {/* Page Header (kept as is) */}
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
           className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" // Grid layout handles alignment
        >
          {/* Instructor Cards */}
          {instructors.map((instructor, index) => (
            <motion.div key={index} variants={itemVariants} whileHover="hover" initial="initial" className="flex">
              <motion.div variants={cardHoverVariants} className="w-full">
                <Card className="flex flex-col h-full bg-card shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-border hover:border-aviation-primary/50 dark:hover:border-aviation-tertiary/50">
                  <CardHeader className="flex flex-col items-center text-center p-6 bg-card/50">
                    <Avatar className="w-24 h-24 mb-4 border-4 border-aviation-secondary">
                      {/* Use local placeholder */}
                      <AvatarImage src={instructor.avatar} alt={instructor.name} />
                      {/* Fallback remains initials */}
                      <AvatarFallback>{instructor.name.match(/(\w)/g)?.join('') || '?'}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl text-foreground mb-1">{instructor.name}</CardTitle>
                    <CardDescription className="text-aviation-secondary font-medium">{instructor.title}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 flex-grow flex flex-col">
                    <p className="text-foreground/70 text-sm mb-6 flex-grow leading-relaxed">{instructor.bio}</p>
                     <div>
                       <h4 className="text-sm font-semibold text-foreground/90 mb-3">Expertise:</h4>
                       <div className="flex flex-wrap gap-2">
                          {instructor.expertise.map(area => (
                              <Badge key={area} variant="outline">{area}</Badge>
                          ))}
                       </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}

             {/* Placeholder Card */}
             <motion.div variants={itemVariants} whileHover="hover" initial="initial" className="flex">
                <motion.div variants={cardHoverVariants} className="w-full">
                  <Card className="flex flex-col h-full bg-card/50 border border-dashed border-border/60 items-center justify-center text-center p-6 hover:border-aviation-primary/50 dark:hover:border-aviation-tertiary/50 transition-all duration-300">
                    <UserCheck className="h-12 w-12 text-foreground/50 mb-4" />
                    <CardTitle className="text-xl text-foreground/80 mb-2">More Experts Coming Soon</CardTitle>
                    <CardDescription className="text-foreground/60 text-sm leading-relaxed">Our team comprises highly experienced, airline-rated instructors dedicated to your success.</CardDescription>
                  </Card>
                </motion.div>
            </motion.div>
        </motion.section>

         {/* The ATC Difference Section - Refined Styling */}
         <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="text-center mt-24 py-16 px-6 bg-muted/50 rounded-lg shadow-sm border border-border"
        >
            <h2 className="text-3xl font-bold mb-10 text-aviation-primary dark:text-aviation-tertiary">The Aviators Training Centre Difference</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10 max-w-5xl mx-auto">
                 <div className="flex flex-col items-center max-w-xs mx-auto">
                     <Award className="h-10 w-10 text-aviation-primary dark:text-aviation-tertiary mb-4"/>
                     <h3 className="text-lg font-semibold mb-2 text-foreground">Real-World Experience</h3>
                     <p className="text-foreground/70 text-sm leading-relaxed">Learn from instructors with direct airline and operational backgrounds.</p>
                 </div>
                 <div className="flex flex-col items-center max-w-xs mx-auto">
                     <BookOpen className="h-10 w-10 text-aviation-primary dark:text-aviation-tertiary mb-4"/>
                     <h3 className="text-lg font-semibold mb-2 text-foreground">Commitment to Teaching</h3>
                     <p className="text-foreground/70 text-sm leading-relaxed">Passionate educators focused on effective learning and concept mastery.</p>
                 </div>
                  <div className="flex flex-col items-center max-w-xs mx-auto">
                     <Briefcase className="h-10 w-10 text-aviation-primary dark:text-aviation-tertiary mb-4"/>
                     <h3 className="text-lg font-semibold mb-2 text-foreground">Career-Focused Guidance</h3>
                     <p className="text-foreground/70 text-sm leading-relaxed">Mentorship extends beyond the syllabus to support your aviation career goals.</p>
                 </div>
            </div>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
};

export default Instructors;
