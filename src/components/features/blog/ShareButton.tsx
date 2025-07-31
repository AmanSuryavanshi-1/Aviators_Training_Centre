'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  url?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ title, url }) => {
  const handleShare = async () => {
    const shareUrl = url || window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
      } catch (error) {
        // Fallback to clipboard if share fails
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } else {
      // Fallback for browsers without Web Share API
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Button
        onClick={handleShare}
        size="lg"
        variant="outline"
        className="group relative rounded-full px-6 py-3 overflow-hidden border-2 border-aviation-accent/30 bg-aviation-accent/10 text-aviation-primary shadow-sm transition-all duration-300 ease-out hover:bg-aviation-accent hover:text-white hover:border-aviation-accent hover:shadow-md min-h-[48px] font-medium"
      >
        <span className="relative z-10 flex items-center justify-center">
          <Share2 className="w-4 h-4 mr-2" />
          <span>Share Article</span>
        </span>
      </Button>
    </motion.div>
  );
};

export default ShareButton;