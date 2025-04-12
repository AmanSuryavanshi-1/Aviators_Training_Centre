import React from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import CoursesSection from "@/components/home/CoursesSection";
import InstructorsSection from "@/components/home/InstructorsSection";
import PilotPathway from "@/components/home/PilotPathway";
import FAQSection from "@/components/home/FAQSection";
import CTASection from "@/components/home/CTASection";
import { ScrollArea } from "@/components/ui/scroll-area";


const Index: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      
      <ScrollArea className="flex-grow">
        {/* Enhanced Hero Section with Video Background */}
        <HeroSection />
        
        {/* Main Content */}
        <main>
          {/* Why Choose Us Section with Animation */}
          <WhyChooseUs />
          
          {/* Pilot Pathway Section */}
          <PilotPathway />
          
          {/* Courses Section with Card Animations */}
          <CoursesSection />
          
          {/* Instructors Section with Animation */}
          <InstructorsSection />
          
          {/* FAQ Section with Accordion Animation */}
          <FAQSection />
          
          {/* Enhanced CTA Section */}
          <CTASection />
        </main>
      </ScrollArea>
      
      <Footer />
    </div>
  );
};

export default Index;
