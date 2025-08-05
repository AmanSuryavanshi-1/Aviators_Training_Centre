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
        className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-teal-500 via-blue-400 to-blue-500 opacity-70 group-hover:opacity-100 blur-[3px] group-hover:blur-[5px] transition-all duration-300"
        style={{
          animation: '2s ease-in-out infinite',
          backgroundSize: '200% 200%',
          animationTimingFunction: 'ease-in-out',
          animationName: 'glowAnimation'
        }}
      ></div>
      
      {/* Additional inner glow for enhanced effect */}
      <div 
        className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 opacity-0 group-hover:opacity-60 blur-sm transition-all duration-500"
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
          "relative flex rounded-full px-4 py-1.5 items-center space-x-1 bg-background hover:bg-background/90 text-foreground border-0 shadow-md conversion-button",
          fullWidth && "w-full justify-center"
        )}
        data-conversion="true"
      >
        <Link href={href} onClick={onClick}>
          <Mail className="w-4 h-4 mr-2 text-teal-500 transition-colors duration-300 group-hover:text-blue-500" />
          <span className="font-medium">{label}</span>
          <ChevronRight className="w-4 h-4 ml-1 text-blue-500 transition-colors transition-transform duration-300 transform group-hover:text-teal-500 group-hover:translate-x-1" />
        </Link>
      </Button>
    </motion.div>
  );
}
