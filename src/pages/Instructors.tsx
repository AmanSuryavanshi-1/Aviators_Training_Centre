import React from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Award, BookOpen, Briefcase, UserCheck, PhoneForwarded, Users } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

// --- Configuration ---
const aviationPrimary = 'text-teal-700 dark:text-teal-300';
const aviationSecondary = 'text-teal-600 dark:text-teal-400';
const aviationButtonBg = 'bg-teal-600 hover:bg-teal-700';
const aviationButtonDarkBg = 'dark:bg-teal-500 dark:hover:bg-teal-600';

// --- Image Paths ---
const instructorHeaderUrl = "/HomePage/Course2.webp";
const FALLBACK_IMAGE = "/HomePage/Hero5.webp";
const FALLBACK_AVATAR = "/placeholder.svg"; // Ensure this path is correct relative to /public

// --- Instructor Data ---
const instructors = [
  {
    name: "Lead Instructor - ATPL",
    title: "- airline pilot and educator",
    avatar: "/Instructor/Instructor1.webp",
    bio: "A seasoned Airline Captain...", // Truncated for brevity
    expertise: ["Advanced Navigation", "Aviation Meteorology", "Airline Operations", "Aircraft Systems"]
  },
  {
    name: "Senior Instructor - CPL",
    title: "- airline pilot and educator",
    avatar: "/Instructor/Instructor2.webp",
    bio: "An accomplished Commercial Pilot...", // Truncated for brevity
    expertise: ["Air Regulations", "Technical General", "Flight Instruction", "Aerodynamics"]
  },
  {
    name: "RTR(A) Specialist",
    title: "Communications Expert",
    avatar: "/Instructor/Instructor3.webp",
    bio: "Expert in aviation communication...", // Truncated for brevity
    expertise: ["Radio Telephony", "Aviation English", "Exam Preparation", "ATC Procedures"]
  },
   {
    name: "Interview Prep Coach",
    title: "Confidence & Career Advisor",
    avatar: "/Instructor/Instructor4.webp", // Reusing instructor image
    bio: "A specialized coach...", // Truncated for brevity
    expertise: ["Interview Techniques", "Aviation Career Guidance", "English Proficiency", "Soft Skills"]
  }
];

// --- Animation Variants ---
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const cardHoverEffect = {
  rest: { y: 0, boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.08)" },
  hover: { y: -5, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.12)", transition: { duration: 0.3, ease: "circOut" } }
};

// --- Component Definition ---
const Instructors: React.FC = () => {

  // Function to handle image errors (for header)
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    // Simple check: if the current src doesn't end with the fallback path, set it.
    if (!target.src.endsWith(FALLBACK_IMAGE)) {
        target.onerror = null; // Prevent infinite loop
        target.src = FALLBACK_IMAGE;
    }
  };

   // Function to handle avatar errors
  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    // Simple check: if the current src doesn't end with the fallback path, set it.
    if (!target.src.endsWith(FALLBACK_AVATAR)) {
      target.onerror = null; // Prevent infinite loop
      target.src = FALLBACK_AVATAR;
    }
  };

  // Ensure clean separation before return

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />

      {/* Page Header */}
      <motion.section
        className="relative h-[50vh] md:h-[60vh] flex items-center justify-center text-center text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <img
          src={instructorHeaderUrl}
          alt="Group of Aviators Training Centre instructors"
          className="absolute inset-0 w-full h-full object-cover z-0"
          onError={handleImageError}
          style={{ filter: 'brightness(0.6)' }}
        />
         <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,94,104,0.25)] to-[rgba(12,110,114,0.55)] z-10"></div>
        <motion.div
          className="relative z-20 max-w-4xl p-6 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="drop-shadow-md text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-3">
            Meet Our Expert Faculty
          </h1>
          <p className="text-lg drop-shadow-md md:text-xl text-white/90 max-w-2xl mx-auto">
            Experienced instructors guiding your path to success.
          </p>
        </motion.div>
      </motion.section>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-16 md:py-24 space-y-20 md:space-y-28">

        {/* Instructor Cards Section */}
        <motion.section
           variants={sectionVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, amount: 0.1 }}
        >
            <h2 className={cn("text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16", aviationPrimary)}>
              Experienced Airline Professionals
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {instructors.map((instructor, index) => (
                <motion.div key={index} variants={itemVariants} className="flex">
                  <motion.div
                      className="relative h-full w-full group"
                      whileHover="hover"
                      initial="rest"
                      animate="rest"
                      variants={cardHoverEffect}
                  >
                    <Card className="bg-card w-full h-full flex flex-col overflow-hidden rounded-lg shadow-sm border border-border transition-shadow duration-300 relative z-10">
                      <CardHeader className="flex flex-col items-center text-center p-6 bg-muted/30 dark:bg-muted/10 border-b border-border/50">
                        <Avatar className="w-20 h-20 mb-4 border-4 border-teal-300 dark:border-teal-600 ring-2 ring-teal-500/30">
                          <AvatarImage
                              src={instructor.avatar}
                              alt={instructor.name}
                              onError={handleAvatarError}
                          />
                          <AvatarFallback>{instructor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <CardTitle className={cn("text-lg font-semibold", aviationPrimary)}>{instructor.name}</CardTitle>
                        <CardDescription className="text-sm text-foreground/70">{instructor.title}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-5 flex-grow flex flex-col">
                        <CardDescription className="text-sm text-foreground/80 mb-5 flex-grow leading-relaxed">{instructor.bio}</CardDescription>
                        <div>
                          <h4 className="text-xs font-semibold uppercase text-foreground/60 mb-2 tracking-wider">Expertise:</h4>
                          <div className="flex flex-wrap gap-1.5">
                              {instructor.expertise.map(area => (
                                  <Badge key={area} variant="secondary" className="text-xs bg-teal-100/80 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200 border border-teal-300/50 dark:border-teal-700/50">{area}</Badge>
                              ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}

               {/* Placeholder Card */}
               <motion.div variants={itemVariants} className="flex">
                   <motion.div
                       className="relative h-full w-full group"
                       whileHover="hover"
                       initial="rest"
                       animate="rest"
                       variants={cardHoverEffect}
                   >
                       <Card className="bg-gradient-to-br from-teal-50/50 to-sky-50/50 dark:from-gray-800/60 dark:to-gray-900/60 w-full h-full flex flex-col items-center justify-center text-center overflow-hidden rounded-lg shadow-sm border border-dashed border-border transition-shadow duration-300 relative z-10 p-6">
                           <div className="mb-4">
                              <PhoneForwarded className={cn("w-10 h-10", aviationSecondary)} />
                           </div>
                           <CardTitle className="text-lg font-semibold text-foreground mb-2">Want to Join Our Team?</CardTitle>
                           <CardDescription className="text-sm text-foreground/80 mb-4">
                              We're always looking for passionate aviation experts. Contact us!
                           </CardDescription>
                           <Link to="/contact">
                               <Button variant="outline" className={cn("border-teal-500 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-300 dark:hover:bg-teal-900/30", "group-hover:border-teal-600 dark:group-hover:border-teal-300")}>
                                   Contact Us
                               </Button>
                           </Link>
                       </Card>
                   </motion.div>
               </motion.div>
            </div>
        </motion.section>

         {/* The ATC Difference Section */}
         <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="bg-gradient-to-br from-teal-50/30 to-sky-50/30 dark:from-gray-800/40 dark:to-gray-900/40 rounded-xl p-8 md:p-12 border border-border/50 shadow-lg"
        >
            <h2 className={cn("text-3xl md:text-4xl font-bold text-center mb-10", aviationPrimary)}>The ATC Instructor Difference</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8 text-center">
                {[
                     { icon: Award, title: "Real-World Experience", description: "Direct airline & operational insight" },
                     { icon: BookOpen, title: "Commitment to Teaching", description: "Focus on effective learning" },
                     { icon: Briefcase, title: "Career-Focused Guidance", description: "Mentorship beyond the syllabus" },
                     { icon: UserCheck, title: "Exam Success Focus", description: "Strategies for DGCA & airline tests" },
                     { icon: Users, title: "Student-Centric Approach", description: "Adapting to individual needs" },
                     { icon: PhoneForwarded, title: "Accessible & Supportive", description: "Always available for guidance" },
                ].map((feature, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        className="flex flex-col items-center p-3 group"
                    >
                         <div className="p-3 rounded-full bg-teal-100/70 dark:bg-teal-900/40 mb-3 transition-colors duration-300 group-hover:bg-teal-200/80 dark:group-hover:bg-teal-800/60">
                            <feature.icon className={cn("h-7 w-7", aviationSecondary)} />
                        </div>
                        <h4 className="text-sm font-semibold text-foreground mb-1">{feature.title}</h4>
                        <p className="text-xs text-foreground/70">{feature.description}</p>
                    </motion.div>
                ))}
            </div>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
};

export default Instructors;
