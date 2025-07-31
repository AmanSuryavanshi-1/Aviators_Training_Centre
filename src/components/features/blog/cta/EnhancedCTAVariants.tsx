'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, Star, ArrowRight, Phone, Download, MessageCircle, CheckCircle, Zap, Award, Target, TrendingUp } from 'lucide-react';
import { CTATemplate, CTAComponentProps } from '@/lib/types/cta';
import { cn } from '@/lib/utils';

// Enhanced Card CTA Variant
export function EnhancedCTACardVariant({ 
  template, 
  blogPost, 
  position, 
  className, 
  onInteraction 
}: CTAComponentProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Countdown timer effect
  useEffect(() => {
    if (template.urgencyElements?.enableCountdown && template.urgencyElements.countdownDuration) {
      const endTime = Date.now() + (template.urgencyElements.countdownDuration * 60 * 60 * 1000);
      
      const timer = setInterval(() => {
        const remaining = endTime - Date.now();
        if (remaining > 0) {
          setTimeLeft(Math.floor(remaining / 1000));
        } else {
          setTimeLeft(0);
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [template.urgencyElements]);

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const handleClick = (buttonType: 'primary' | 'secondary') => {
    onInteraction?.({
      ctaId: template._id,
      blogPostId: blogPost._id,
      blogPostSlug: blogPost.slug?.current || '',
      ctaType: template.ctaType,
      ctaPosition: position,
      targetCourse: template.targetCourse?._id,
      action: 'click',
      metadata: { buttonType, variant: 'enhanced-card' },
    });
  };

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 border border-teal-200 dark:border-teal-700 shadow-lg hover:shadow-xl transition-all duration-300',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000000%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%227%22%20cy%3D%227%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      </div>

      {/* Urgency Banner */}
      {template.urgencyElements?.limitedOffer && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-2 px-4 text-sm font-medium">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, repeat: Infinity, repeatType: 'reverse' }}
          >
            🔥 {template.urgencyElements.limitedOffer}
          </motion.div>
        </div>
      )}

      <div className="relative p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <motion.h3 
              className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {template.title.replace('{courseName}', template.targetCourse?.name || 'Aviation Training')}
            </motion.h3>
            
            {template.urgencyElements?.socialProof && (
              <div className="flex items-center text-sm text-teal-600 dark:text-teal-400 mb-2">
                <Users className="w-4 h-4 mr-1" />
                {template.urgencyElements.socialProof}
              </div>
            )}
          </div>

          {/* Priority Badge */}
          {template.priority >= 80 && (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <Star className="w-3 h-3 mr-1" />
              Popular
            </div>
          )}
        </div>

        {/* Description */}
        <motion.p 
          className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {template.description.replace('{courseName}', template.targetCourse?.name || 'our training program')}
        </motion.p>

        {/* Countdown Timer */}
        {timeLeft !== null && timeLeft > 0 && (
          <motion.div 
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 mb-4"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-center text-red-600 dark:text-red-400">
              <Clock className="w-4 h-4 mr-2" />
              <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              <span className="ml-2 text-sm">remaining</span>
            </div>
          </motion.div>
        )}

        {/* Features/Benefits */}
        {template.targetCourse && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Expert Instructors
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Award className="w-4 h-4 mr-2 text-blue-500" />
              Industry Certified
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Target className="w-4 h-4 mr-2 text-purple-500" />
              High Success Rate
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <TrendingUp className="w-4 h-4 mr-2 text-orange-500" />
              Career Growth
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <motion.button
            onClick={() => handleClick('primary')}
            className={cn(
              'flex-1 flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 transform',
              template.primaryButton.style === 'urgent' 
                ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
                : template.primaryButton.style === 'success'
                ? 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-lg hover:shadow-xl'
                : 'bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 shadow-lg hover:shadow-xl'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {template.primaryButton.action === 'phone-call' && <Phone className="w-4 h-4 mr-2" />}
            {template.primaryButton.action === 'download' && <Download className="w-4 h-4 mr-2" />}
            {template.primaryButton.action === 'whatsapp' && <MessageCircle className="w-4 h-4 mr-2" />}
            {!['phone-call', 'download', 'whatsapp'].includes(template.primaryButton.action) && <Zap className="w-4 h-4 mr-2" />}
            {template.primaryButton.text}
            <ArrowRight className="w-4 h-4 ml-2" />
          </motion.button>

          {template.secondaryButton && (
            <motion.button
              onClick={() => handleClick('secondary')}
              className="flex items-center justify-center px-6 py-3 rounded-xl font-medium text-teal-600 dark:text-teal-400 border-2 border-teal-200 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {template.secondaryButton.text}
            </motion.button>
          )}
        </div>

        {/* Urgency Message */}
        {template.urgencyElements?.urgencyMessage && (
          <motion.div 
            className="mt-4 text-center text-sm text-orange-600 dark:text-orange-400 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            ⚡ {template.urgencyElements.urgencyMessage}
          </motion.div>
        )}
      </div>

      {/* Hover Effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Enhanced Banner CTA Variant
export function EnhancedCTABannerVariant({ 
  template, 
  blogPost, 
  position, 
  className, 
  onInteraction 
}: CTAComponentProps) {
  const handleClick = (buttonType: 'primary' | 'secondary') => {
    onInteraction?.({
      ctaId: template._id,
      blogPostId: blogPost._id,
      blogPostSlug: blogPost.slug?.current || '',
      ctaType: template.ctaType,
      ctaPosition: position,
      targetCourse: template.targetCourse?._id,
      action: 'click',
      metadata: { buttonType, variant: 'enhanced-banner' },
    });
  };

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 text-white shadow-2xl',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-600/90 via-blue-600/90 to-purple-600/90">
        <motion.div
          className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22white%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M20%2020c0-11.046-8.954-20-20-20v20h20z%22/%3E%3C/g%3E%3C/svg%3E')] opacity-20"
          animate={{ x: [0, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="relative p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Content Section */}
          <div className="flex-1 text-center lg:text-left">
            <motion.h3 
              className="text-2xl lg:text-3xl font-bold mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {template.title.replace('{courseName}', template.targetCourse?.name || 'Aviation Training')}
            </motion.h3>
            
            <motion.p 
              className="text-lg opacity-90 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {template.description.replace('{courseName}', template.targetCourse?.name || 'our program')}
            </motion.p>

            {template.urgencyElements?.socialProof && (
              <motion.div 
                className="flex items-center justify-center lg:justify-start text-sm opacity-80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Users className="w-4 h-4 mr-2" />
                {template.urgencyElements.socialProof}
              </motion.div>
            )}
          </div>

          {/* Action Section */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-3 min-w-fit"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              onClick={() => handleClick('primary')}
              className="px-8 py-4 bg-white text-teal-600 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {template.primaryButton.text}
              <ArrowRight className="w-5 h-5 ml-2" />
            </motion.button>

            {template.secondaryButton && (
              <motion.button
                onClick={() => handleClick('secondary')}
                className="px-6 py-4 border-2 border-white/30 text-white font-medium rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {template.secondaryButton.text}
              </motion.button>
            )}
          </motion.div>
        </div>

        {/* Urgency Strip */}
        {template.urgencyElements?.urgencyMessage && (
          <motion.div 
            className="mt-4 text-center text-sm bg-white/10 rounded-lg py-2 px-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            ⚡ {template.urgencyElements.urgencyMessage}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Enhanced Inline CTA Variant
export function EnhancedCTAInlineVariant({ 
  template, 
  blogPost, 
  position, 
  className, 
  onInteraction 
}: CTAComponentProps) {
  const handleClick = (buttonType: 'primary' | 'secondary') => {
    onInteraction?.({
      ctaId: template._id,
      blogPostId: blogPost._id,
      blogPostSlug: blogPost.slug?.current || '',
      ctaType: template.ctaType,
      ctaPosition: position,
      targetCourse: template.targetCourse?._id,
      action: 'click',
      metadata: { buttonType, variant: 'enhanced-inline' },
    });
  };

  return (
    <motion.div
      className={cn(
        'my-8 p-6 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/10 dark:to-blue-900/10 border-l-4 border-teal-500 rounded-r-xl shadow-md',
        className
      )}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            💡 {template.title.replace('{courseName}', template.targetCourse?.name || 'Aviation Training')}
          </h4>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {template.description.replace('{courseName}', template.targetCourse?.name || 'our program')}
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <motion.button
            onClick={() => handleClick('primary')}
            className="flex-1 md:flex-none px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors duration-300 flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {template.primaryButton.text}
            <ArrowRight className="w-4 h-4 ml-2" />
          </motion.button>

          {template.secondaryButton && (
            <motion.button
              onClick={() => handleClick('secondary')}
              className="px-4 py-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 font-medium rounded-lg transition-colors duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {template.secondaryButton.text}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Enhanced Floating CTA Variant
export function EnhancedCTAFloatingVariant({ 
  template, 
  blogPost, 
  position, 
  className, 
  onInteraction 
}: CTAComponentProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = (buttonType: 'primary' | 'secondary') => {
    onInteraction?.({
      ctaId: template._id,
      blogPostId: blogPost._id,
      blogPostSlug: blogPost.slug?.current || '',
      ctaType: template.ctaType,
      ctaPosition: position,
      targetCourse: template.targetCourse?._id,
      action: 'click',
      metadata: { buttonType, variant: 'enhanced-floating' },
    });
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            'fixed bottom-6 right-6 z-50 max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700',
            className
          )}
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            ×
          </button>

          <div className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                ✈️
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  {template.title.replace('{courseName}', template.targetCourse?.name || 'Aviation Training')}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {template.description.replace('{courseName}', template.targetCourse?.name || 'our program')}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button
                onClick={() => handleClick('primary')}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-medium rounded-lg text-sm hover:from-teal-600 hover:to-blue-600 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {template.primaryButton.text}
              </motion.button>

              {template.secondaryButton && (
                <motion.button
                  onClick={() => handleClick('secondary')}
                  className="px-4 py-2 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-700 rounded-lg text-sm hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {template.secondaryButton.text}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
