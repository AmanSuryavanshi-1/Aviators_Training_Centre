// Using "use client" because motion(Link) involves client-side interaction
"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Mail, ChevronRight } from 'lucide-react';
import React from 'react';
import { cn } from '@/components/ui/utils';

interface ContactButtonProps {
  href: string;
  label?: string;
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
}

export function ContactButton({
  href,
  label = "Contact",
  onClick,
  className = "",
  fullWidth = false,
}: ContactButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative group",
        fullWidth && "w-full",
        className
      )}
    >
      {/* Enhanced animated gradient border with glow effect */}
      <div 
        className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-aviation-600 via-aviation-500 to-aviation-400 opacity-60 group-hover:opacity-90 blur-[3px] group-hover:blur-[5px] transition-all duration-300"
        style={{
          animation: '2s ease-in-out infinite',
          backgroundSize: '200% 200%',
          animationTimingFunction: 'ease-in-out',
          animationName: 'glowAnimation'
        }}
      ></div>
      
      {/* Additional inner glow for enhanced effect */}
      <div 
        className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-aviation-500 to-aviation-400 opacity-0 group-hover:opacity-50 blur-sm transition-all duration-500"
        style={{
          animation: '2s infinite',
          animationName: 'pulseAnimation'
        }}
      ></div>
      
      {/* Inline animation styles */}
      <style jsx>{`
        @keyframes glowAnimation {
          0% { opacity: 0.5; filter: blur(3px); }
          50% { opacity: 0.9; filter: blur(4px); }
          100% { opacity: 0.5; filter: blur(3px); }
        }
        @keyframes pulseAnimation {
          0% { transform: scale(0.99); opacity: 0.6; }
          50% { transform: scale(1.01); opacity: 0.8; }
          100% { transform: scale(0.99); opacity: 0.6; }
        }
      `}</style>
      
      <Button
        asChild
        className={cn(
          "relative flex rounded-full items-center space-x-1 bg-background hover:bg-background/90 text-foreground border-0 shadow-md conversion-button",
          // Slightly reduced vertical padding for mobile only
          "px-3 py-0.5 text-xs sm:px-3.5 sm:py-1.5 sm:text-sm md:px-4 md:py-1.5 md:text-sm",
          fullWidth && "w-full justify-center"
        )}
        data-conversion="true"
      >
        <Link href={href} onClick={onClick}>
          <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-aviation-600 transition-colors duration-300 group-hover:text-aviation-500" />
          <span className="font-medium tracking-tight">{label}</span>
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 text-aviation-500 transition-colors transition-transform duration-300 transform group-hover:text-aviation-600 group-hover:translate-x-1" />
        </Link>
      </Button>
    </motion.div>
  );
}
