// NOTE: This component is rendered within app/page.tsx, which is marked as 'use client'.
// Ensure all child components like HeroSection, CoursesSection, etc., 
// are either Server Components or correctly marked as Client Components if needed.

import React from 'react';
// Removed Header and Footer imports
import HeroSection from "@/components/home/HeroSection";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import CoursesSection from "@/components/home/CoursesSection";
import InstructorsSection from "@/components/home/InstructorsSection";
import PilotPathway from "@/components/home/PilotPathway";
import FAQ from "@/components/shared/FAQ";
import CTASection from "@/components/home/CTASection";
// Removed motion and cn imports as they aren't directly used here

// Removed animation variants and color constants as they aren't directly used here

const IndexPageContent: React.FC = () => {
  // Removed surrounding div, Header, and Footer
  return (
    <>
      {/* Hero Section remains outside the main container */}
      <HeroSection />

      {/* Main Content Area */}
      <main className="container mx-auto px-4 sm:px-6 py-16 md:py-24 space-y-20 md:space-y-28">

        {/* Why Choose Us Section */}
        {/* Ensure WhyChooseUs is compatible (client/server) */}
        <WhyChooseUs />

        {/* Pilot Pathway Section */}
        {/* Ensure PilotPathway is compatible (client/server) */}
        <PilotPathway />

        {/* Courses Section */}
        {/* Ensure CoursesSection is compatible (client/server) */}
        <CoursesSection />

        {/* Instructors Section */}
        {/* Ensure InstructorsSection is compatible (client/server) */}
        <InstructorsSection />

        {/* FAQ Section */}
        {/* Ensure FAQ is compatible (client/server) */}
        <FAQ showAll={false} />

        {/* CTA Section */}
        {/* Ensure CTASection is compatible (client/server) */}
        <CTASection />

      </main>
    </>
  );
};

// Renamed export to avoid conflict with folder name potentially
export default IndexPageContent;
