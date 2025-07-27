'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Share2, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Link2, 
  Mail,
  MessageCircle,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
  className?: string;
  variant?: 'default' | 'compact' | 'floating';
}

export default function SocialShare({ 
  url, 
  title, 
  description = '', 
  hashtags = [],
  className = '',
  variant = 'default'
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  // Encode URL and text for sharing
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const hashtagString = hashtags.length > 0 ? hashtags.map(tag => `#${tag}`).join(' ') : '';
  const encodedHashtags = encodeURIComponent(hashtagString);

  // Social sharing URLs
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${hashtags.join(',')}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  };

  // Handle copy to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      
      // Track copy event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'share', {
          method: 'copy_link',
          content_type: 'blog_post',
          content_id: url,
        });
      }

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  };

  // Handle social share click
  const handleSocialShare = (platform: string, shareUrl: string) => {
    // Track share event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'share', {
        method: platform,
        content_type: 'blog_post',
        content_id: url,
      });
    }

    // Open share window
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    window.open(
      shareUrl,
      `share-${platform}`,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  // Compact variant for mobile or inline use
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-muted-foreground">Share:</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSocialShare('twitter', shareUrls.twitter)}
            className="h-8 w-8 p-0"
            title="Share on Twitter"
          >
            <Twitter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSocialShare('facebook', shareUrls.facebook)}
            className="h-8 w-8 p-0"
            title="Share on Facebook"
          >
            <Facebook className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSocialShare('linkedin', shareUrls.linkedin)}
            className="h-8 w-8 p-0"
            title="Share on LinkedIn"
          >
            <Linkedin className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="h-8 w-8 p-0"
            title="Copy link"
          >
            {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    );
  }

  // Floating variant for sticky sharing
  if (variant === 'floating') {
    return (
      <div className={`fixed left-2 sm:left-4 top-1/2 -translate-y-1/2 z-40 hidden lg:block ${className}`}>
        <div className="flex flex-col gap-1 sm:gap-2 bg-background/90 backdrop-blur-sm border rounded-lg p-1.5 sm:p-2 shadow-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSocialShare('twitter', shareUrls.twitter)}
            className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 touch-manipulation"
            title="Share on Twitter"
          >
            <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSocialShare('facebook', shareUrls.facebook)}
            className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-blue-50 hover:text-blue-800 dark:hover:bg-blue-950 touch-manipulation"
            title="Share on Facebook"
          >
            <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSocialShare('linkedin', shareUrls.linkedin)}
            className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950 touch-manipulation"
            title="Share on LinkedIn"
          >
            <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSocialShare('whatsapp', shareUrls.whatsapp)}
            className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950 touch-manipulation"
            title="Share on WhatsApp"
          >
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div className="border-t my-0.5 sm:my-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-950 touch-manipulation"
            title="Copy link"
          >
            {copied ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : <Link2 className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
        </div>
      </div>
    );
  }

  // Default variant - full sharing options
  return (
    <div className={`space-y-3 sm:space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        <h3 className="text-sm sm:text-base font-semibold text-foreground">Share this article</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        <Button
          variant="outline"
          onClick={() => handleSocialShare('twitter', shareUrls.twitter)}
          className="flex items-center gap-1.5 sm:gap-2 justify-start hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 dark:hover:bg-blue-950 h-9 sm:h-10 text-xs sm:text-sm touch-manipulation"
        >
          <Twitter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Twitter
        </Button>
        
        <Button
          variant="outline"
          onClick={() => handleSocialShare('facebook', shareUrls.facebook)}
          className="flex items-center gap-1.5 sm:gap-2 justify-start hover:bg-blue-50 hover:border-blue-200 hover:text-blue-800 dark:hover:bg-blue-950 h-9 sm:h-10 text-xs sm:text-sm touch-manipulation"
        >
          <Facebook className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Facebook
        </Button>
        
        <Button
          variant="outline"
          onClick={() => handleSocialShare('linkedin', shareUrls.linkedin)}
          className="flex items-center gap-1.5 sm:gap-2 justify-start hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 dark:hover:bg-blue-950 h-9 sm:h-10 text-xs sm:text-sm touch-manipulation"
        >
          <Linkedin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          LinkedIn
        </Button>
        
        <Button
          variant="outline"
          onClick={() => handleSocialShare('whatsapp', shareUrls.whatsapp)}
          className="flex items-center gap-1.5 sm:gap-2 justify-start hover:bg-green-50 hover:border-green-200 hover:text-green-600 dark:hover:bg-green-950 h-9 sm:h-10 text-xs sm:text-sm touch-manipulation"
        >
          <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          WhatsApp
        </Button>
        
        <Button
          variant="outline"
          onClick={() => handleSocialShare('email', shareUrls.email)}
          className="flex items-center gap-1.5 sm:gap-2 justify-start hover:bg-gray-50 hover:border-gray-200 hover:text-gray-600 dark:hover:bg-gray-950 h-9 sm:h-10 text-xs sm:text-sm touch-manipulation"
        >
          <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Email
        </Button>
        
        <Button
          variant="outline"
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 sm:gap-2 justify-start hover:bg-gray-50 hover:border-gray-200 hover:text-gray-600 dark:hover:bg-gray-950 h-9 sm:h-10 text-xs sm:text-sm touch-manipulation"
        >
          {copied ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Link2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
          <span className="truncate">{copied ? 'Copied!' : 'Copy Link'}</span>
        </Button>
      </div>

      {hashtagString && (
        <div className="text-xs sm:text-sm text-muted-foreground">
          <span className="font-medium">Suggested hashtags:</span> {hashtagString}
        </div>
      )}
    </div>
  );
}