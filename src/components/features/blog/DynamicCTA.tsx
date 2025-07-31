'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, Plane, Radio, Briefcase, GraduationCap, Eye } from 'lucide-react';

interface DynamicCTAProps {
  post: {
    title: string;
    category?: { title: string };
    focusKeyword?: string;
    additionalKeywords?: string[];
    tags?: { title: string }[];
  };
}

const DynamicCTA: React.FC<DynamicCTAProps> = ({ post }) => {
  // Determine the most relevant CTA based on post content
  const getRelevantCTA = () => {
    const title = post.title.toLowerCase();
    const category = post.category?.title?.toLowerCase() || '';
    const keywords = [
      post.focusKeyword?.toLowerCase(),
      ...(post.additionalKeywords?.map(k => k.toLowerCase()) || []),
      ...(post.tags?.map(t => t.title.toLowerCase()) || [])
    ].filter(Boolean);
    
    const allContent = [title, category, ...keywords].join(' ');

    // CPL/ATPL Ground School CTA
    if (allContent.includes('cpl') || allContent.includes('atpl') || 
        allContent.includes('ground school') || allContent.includes('dgca')) {
      return {
        title: "Ready to Start Your CPL/ATPL Ground School?",
        subtitle: "Master all DGCA subjects with expert guidance from airline pilots and achieve your aviation dreams.",
        primaryCTA: {
          text: "Join Ground School",
          href: "/contact?subject=CPL%20Ground%20Classes%20(All%20Subjects)",
          icon: BookOpen
        },
        secondaryCTA: {
          text: "View Syllabus",
          href: "/courses",
          icon: Eye
        },
        benefits: "✅ High success rate • 👨‍✈️ Airline pilot instructors • 📞 24/7 doubt support"
      };
    }

    // Type Rating CTA
    if (allContent.includes('type rating') || allContent.includes('a320') || 
        allContent.includes('b737') || allContent.includes('airline')) {
      return {
        title: "Preparing for Type Rating Exams?",
        subtitle: "Get specialized coaching for A320 & B737 type rating preparation with industry experts.",
        primaryCTA: {
          text: "Book Type Rating Prep",
          href: "/contact?subject=A320/B737%20Type%20Rating%20Prep",
          icon: Plane
        },
        secondaryCTA: {
          text: "Interview Prep",
          href: "/contact?subject=Airline%20Interview%20Preparation",
          icon: Briefcase
        },
        benefits: "🎯 Airline-specific training • 📈 High success rate • 🤝 Industry connections"
      };
    }

    // RTR(A) CTA
    if (allContent.includes('rtr') || allContent.includes('radio') || 
        allContent.includes('communication') || allContent.includes('telephony')) {
      return {
        title: "Master Aviation Communication Skills?",
        subtitle: "Excel in RTR(A) exams with specialized radio telephony training and communication techniques.",
        primaryCTA: {
          text: "Join RTR(A) Training",
          href: "/contact?subject=RTR(A)%20Training",
          icon: Radio
        },
        secondaryCTA: {
          text: "Demo Class",
          href: "/contact?subject=Book%20a%20Demo",
          icon: GraduationCap
        },
        benefits: "🗣️ Communication mastery • 📡 Practical training • ✅ Exam success"
      };
    }

    // Interview Preparation CTA
    if (allContent.includes('interview') || allContent.includes('job') || 
        allContent.includes('career') || allContent.includes('hiring')) {
      return {
        title: "Ace Your Airline Interviews?",
        subtitle: "Get personalized interview coaching and boost your confidence with proven strategies.",
        primaryCTA: {
          text: "Book Interview Prep",
          href: "/contact?subject=Airline%20Interview%20Preparation",
          icon: Briefcase
        },
        secondaryCTA: {
          text: "Free Consultation",
          href: "/contact?subject=General%20Inquiry",
          icon: GraduationCap
        },
        benefits: "🎯 Personalized coaching • 💪 Confidence building • 🏆 Success stories"
      };
    }

    // Default General CTA
    return {
      title: "Ready to Advance Your Aviation Career?",
      subtitle: "Join thousands of successful pilots who achieved their dreams with Aviators Training Centre's expert guidance.",
      primaryCTA: {
        text: "Book Free Demo Class",
        href: "/contact?subject=Book%20a%20Demo",
        icon: GraduationCap
      },
      secondaryCTA: {
        text: "Explore All Courses",
        href: "/courses",
        icon: Plane
      },
      benefits: "📞 Instant callback • 🎯 Personalized guidance • 🏆 High success rate • 👨‍✈️ Airline pilot instructors"
    };
  };

  const cta = getRelevantCTA();

  return (
    <div className="mt-16 bg-gradient-to-r from-aviation-primary to-aviation-secondary rounded-2xl p-8 text-white text-center">
      <h3 className="text-2xl font-heading font-bold mb-4">
        {cta.title}
      </h3>
      <p className="text-aviation-light mb-8 max-w-2xl mx-auto">
        {cta.subtitle}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {/* Primary CTA Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Button
            asChild
            size="lg"
            className="group relative rounded-full px-8 py-4 overflow-hidden bg-white text-aviation-primary shadow-lg transition-all duration-300 ease-out hover:bg-aviation-light/10 hover:text-white hover:shadow-xl border-2 border-white min-h-[56px] font-semibold"
          >
            <Link href={cta.primaryCTA.href}>
              <span className="relative z-10 flex items-center justify-center">
                <cta.primaryCTA.icon className="w-5 h-5 mr-2" />
                <span>{cta.primaryCTA.text}</span>
              </span>
            </Link>
          </Button>
        </motion.div>

        {/* Secondary CTA Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Button
            asChild
            size="lg"
            variant="outline"
            className="group relative rounded-full px-8 py-4 overflow-hidden border-2 border-aviation-light bg-aviation-accent text-white shadow-lg transition-all duration-300 ease-out hover:bg-aviation-tertiary hover:border-white hover:shadow-xl min-h-[56px] font-semibold"
          >
            <Link href={cta.secondaryCTA.href}>
              <span className="relative z-10 flex items-center justify-center">
                <cta.secondaryCTA.icon className="w-5 h-5 mr-2" />
                <span>{cta.secondaryCTA.text}</span>
              </span>
            </Link>
          </Button>
        </motion.div>
      </div>
      <div className="mt-6 text-sm text-aviation-light">
        {cta.benefits}
      </div>
    </div>
  );
};

export default DynamicCTA;