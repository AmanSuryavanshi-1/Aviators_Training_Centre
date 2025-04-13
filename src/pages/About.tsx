import React from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Added Button
import { Target, Users, Telescope, Heart, MessageSquare, UserCheck, Clock, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom'; // Added Link
import { cn } from "@/lib/utils";

// Placeholders
const aboutHeroUrl = "https://images.unsplash.com/photo-1526778548025-1db135a44262?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8ZmxpZ2h0JTIwc2Nob29sJTIwYnVpbGRpbmd8fHx8fHwxNjE4NTUwNTQ0&ixlib=rb-1.2.1&q=80&w=1080";
const storyImageUrl = "https://images.unsplash.com/photo-1578554793730-9065c0494186?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8YXZpYXRpb24lMjBlZHVjYXRpb258fHx8fHwxNjE4NTUwNTkz&ixlib=rb-1.2.1&q=80&w=1080";

// Animation Variants
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
};

const cardHoverVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.3 } }
};

const About: React.FC = () => {
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
          src={aboutHeroUrl} 
          alt="Aviators Training Centre facility exterior" 
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ filter: 'brightness(0.5)' }} 
        />
        <motion.div 
          className="relative z-10 max-w-3xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">About Aviators Training Centre</h1>
          <p className="text-lg md:text-xl text-foreground/80 mt-2">Transforming Dreams into Wings</p>
        </motion.div>
      </motion.section>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-16 space-y-20">

        {/* Our Story / Mission Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold mb-4 text-aviation-primary dark:text-aviation-tertiary">Who We Are</h2>
            <p className="text-foreground/70 mb-4">
              Aviators Training Centre is a premier ground school dedicated to empowering future pilots with the knowledge and skills required to ace the DGCA CPL and ATPL examinations. 
            </p>
             <p className="text-foreground/70 mb-4">
               Our mission is to deliver top-tier, professional pilot training programs that set the foundation for a successful aviation career. Let us help you turn your dreams into soaring reality.
            </p>
             <Link to="/contact">
                <Button variant="secondary" className="px-6 py-3 rounded-lg transform transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg">Contact Us</Button>
             </Link>
          </motion.div>
          <motion.div variants={itemVariants}>
             <img src={storyImageUrl} alt="Instructor teaching student aviation concepts" className="rounded-lg shadow-lg w-full h-auto object-cover hover:shadow-xl transition-all duration-300" />
          </motion.div>
        </motion.section>

        {/* Why Choose Us Section (Reiterated from Index, adapted for About) */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
            <h2 className="text-4xl font-bold text-center mb-12 text-aviation-primary dark:text-aviation-tertiary">The ATC Advantage</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[ // Using icons and titles from Index/provided data
                { icon: UserCheck, title: "Personalized Coaching", description: "Tailored guidance matching your learning style." },
                { icon: Clock, title: "Flexible Scheduling", description: "Adaptable timings for CPL/ATPL candidates." },
                { icon: MessageSquare, title: "24/7 Doubt-Clearing", description: "Round-the-clock support from our dedicated team." },
                { icon: Users, title: "Expert Faculty", description: "Learn from experienced, airline-rated instructors." },
                { icon: DollarSign, title: "Affordable Courses", description: "Premium education at competitive prices." },
                 { icon: Heart, title: "Dedicated Support", description: "We are committed to your success every step of the way." }, // Placeholder/Summary Value
                ].map((item, index) => (
                <motion.div key={index} variants={itemVariants} whileHover="hover" initial="initial">
                    <motion.div variants={cardHoverVariants}>
                        <Card className="text-center h-full bg-card hover:shadow-lg transition-all duration-300 p-6 border border-border hover:border-aviation-primary/50 dark:hover:border-aviation-tertiary/50">
                            <CardHeader className="p-0 mb-4">
                                <div className="mx-auto bg-aviation-secondary/10 p-3 rounded-full w-fit mb-4">
                                    <item.icon className="h-8 w-8 text-aviation-secondary" />
                                </div>
                                <CardTitle className="text-foreground text-xl">{item.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <p className="text-foreground/70 text-sm">{item.description}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
                ))}
            </div>
        </motion.section>

        {/* Farewell to Drawbacks Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="bg-card rounded-lg p-12 border border-border shadow-md"
        >
            <h2 className="text-3xl font-bold text-center mb-8 text-aviation-primary dark:text-aviation-tertiary">Say Goodbye To Traditional Hassles</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-w-3xl mx-auto text-foreground/80">
                <li className="flex items-center"><span className="text-red-500 mr-2 text-xl font-bold">×</span> Large, impersonal batches</li>
                <li className="flex items-center"><span className="text-red-500 mr-2 text-xl font-bold">×</span> Hesitation to ask questions</li>
                <li className="flex items-center"><span className="text-red-500 mr-2 text-xl font-bold">×</span> Travel hassles for classes</li>
                <li className="flex items-center"><span className="text-red-500 mr-2 text-xl font-bold">×</span> Flat/PG rental costs</li>
                <li className="flex items-center"><span className="text-red-500 mr-2 text-xl font-bold">×</span> High coaching fees</li>
            </ul>
            <p className="text-center mt-8 text-lg text-aviation-primary dark:text-aviation-tertiary font-semibold">Focus purely on your training with ATC!</p>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
};

export default About;
