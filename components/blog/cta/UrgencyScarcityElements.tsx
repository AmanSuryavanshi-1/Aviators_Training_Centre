'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, AlertTriangle, Zap, Calendar, TrendingUp, Award, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

// Countdown Timer Component
interface CountdownTimerProps {
  endTime: Date | number;
  onExpire?: () => void;
  className?: string;
  variant?: 'default' | 'urgent' | 'minimal' | 'large';
  showLabels?: boolean;
}

export function CountdownTimer({ 
  endTime, 
  onExpire, 
  className, 
  variant = 'default',
  showLabels = true 
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const end = typeof endTime === 'number' ? endTime : endTime.getTime();
      const difference = end - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, total: difference });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        onExpire?.();
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpire]);

  if (timeLeft.total <= 0) {
    return (
      <motion.div
        className={cn('text-red-600 dark:text-red-400 font-medium', className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        ⏰ Offer Expired
      </motion.div>
    );
  }

  const timeUnits = [
    { value: timeLeft.days, label: 'Days', shortLabel: 'D' },
    { value: timeLeft.hours, label: 'Hours', shortLabel: 'H' },
    { value: timeLeft.minutes, label: 'Minutes', shortLabel: 'M' },
    { value: timeLeft.seconds, label: 'Seconds', shortLabel: 'S' },
  ];

  const getVariantStyles = () => {
    switch (variant) {
      case 'urgent':
        return {
          container: 'bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-4',
          timeUnit: 'bg-white/20 backdrop-blur-sm rounded-md p-2 min-w-[60px]',
          number: 'text-2xl font-bold',
          label: 'text-xs uppercase tracking-wide opacity-90',
        };
      case 'minimal':
        return {
          container: 'bg-gray-50 dark:bg-gray-800 rounded-md p-3',
          timeUnit: 'bg-white dark:bg-gray-700 rounded px-2 py-1 min-w-[40px]',
          number: 'text-lg font-semibold text-gray-900 dark:text-white',
          label: 'text-xs text-gray-600 dark:text-gray-400',
        };
      case 'large':
        return {
          container: 'bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 border border-teal-200 dark:border-teal-700 rounded-xl p-6',
          timeUnit: 'bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 min-w-[80px]',
          number: 'text-3xl font-bold text-teal-600 dark:text-teal-400',
          label: 'text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide',
        };
      default:
        return {
          container: 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4',
          timeUnit: 'bg-white dark:bg-gray-800 rounded-md p-2 min-w-[50px]',
          number: 'text-xl font-bold text-orange-600 dark:text-orange-400',
          label: 'text-xs text-gray-600 dark:text-gray-400',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <motion.div
      className={cn(styles.container, className)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-center gap-1 mb-2">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">Limited Time Offer</span>
      </div>
      
      <div className="flex items-center justify-center gap-2">
        {timeUnits.map((unit, index) => (
          <React.Fragment key={unit.label}>
            <motion.div
              className={cn('text-center', styles.timeUnit)}
              key={`${unit.label}-${unit.value}`}
              initial={{ scale: 1 }}
              animate={{ scale: unit.label === 'Seconds' ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.3, repeat: unit.label === 'Seconds' ? Infinity : 0, repeatDelay: 0.7 }}
            >
              <div className={styles.number}>
                {unit.value.toString().padStart(2, '0')}
              </div>
              {showLabels && (
                <div className={styles.label}>
                  {variant === 'minimal' ? unit.shortLabel : unit.label}
                </div>
              )}
            </motion.div>
            {index < timeUnits.length - 1 && (
              <div className="text-lg font-bold opacity-60">:</div>
            )}
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
}

// Seat Availability Counter Component
interface SeatAvailabilityProps {
  totalSeats: number;
  availableSeats: number;
  courseName?: string;
  className?: string;
  variant?: 'default' | 'urgent' | 'minimal';
  showPercentage?: boolean;
}

export function SeatAvailabilityCounter({ 
  totalSeats, 
  availableSeats, 
  courseName = 'this course',
  className,
  variant = 'default',
  showPercentage = true
}: SeatAvailabilityProps) {
  const filledSeats = totalSeats - availableSeats;
  const fillPercentage = (filledSeats / totalSeats) * 100;
  const isUrgent = availableSeats <= totalSeats * 0.2; // Less than 20% available
  const isCritical = availableSeats <= 5;

  const getUrgencyColor = () => {
    if (isCritical) return 'text-red-600 dark:text-red-400';
    if (isUrgent) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getProgressColor = () => {
    if (isCritical) return 'bg-red-500';
    if (isUrgent) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <motion.div
      className={cn(
        'rounded-lg p-4',
        variant === 'urgent' && 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700',
        variant === 'minimal' && 'bg-gray-50 dark:bg-gray-800',
        variant === 'default' && 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700',
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-gray-900 dark:text-white">
            Seat Availability
          </span>
        </div>
        <div className={cn('font-bold text-lg', getUrgencyColor())}>
          {availableSeats} left
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Enrolled: {filledSeats}/{totalSeats}</span>
          {showPercentage && (
            <span>{Math.round(fillPercentage)}% filled</span>
          )}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className={cn('h-2 rounded-full', getProgressColor())}
            initial={{ width: 0 }}
            animate={{ width: `${fillPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Urgency Message */}
      <AnimatePresence>
        {isCritical && (
          <motion.div
            className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Almost full! Only {availableSeats} seats remaining for {courseName}</span>
          </motion.div>
        )}
        {isUrgent && !isCritical && (
          <motion.div
            className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-sm font-medium"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Zap className="w-4 h-4" />
            <span>Filling up fast! Secure your seat for {courseName}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Batch Enrollment Deadline Component
interface BatchDeadlineProps {
  batchStartDate: Date;
  enrollmentDeadline: Date;
  batchName?: string;
  className?: string;
  variant?: 'default' | 'urgent' | 'card';
}

export function BatchEnrollmentDeadline({ 
  batchStartDate, 
  enrollmentDeadline, 
  batchName = 'Next Batch',
  className,
  variant = 'default'
}: BatchDeadlineProps) {
  const [timeUntilDeadline, setTimeUntilDeadline] = useState<number>(0);
  const [timeUntilStart, setTimeUntilStart] = useState<number>(0);

  useEffect(() => {
    const updateTimes = () => {
      const now = Date.now();
      setTimeUntilDeadline(enrollmentDeadline.getTime() - now);
      setTimeUntilStart(batchStartDate.getTime() - now);
    };

    updateTimes();
    const timer = setInterval(updateTimes, 1000);
    return () => clearInterval(timer);
  }, [enrollmentDeadline, batchStartDate]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isDeadlineNear = timeUntilDeadline <= 7 * 24 * 60 * 60 * 1000; // 7 days
  const isDeadlineCritical = timeUntilDeadline <= 2 * 24 * 60 * 60 * 1000; // 2 days

  return (
    <motion.div
      className={cn(
        'rounded-lg p-4',
        variant === 'urgent' && 'bg-gradient-to-r from-red-500 to-orange-500 text-white',
        variant === 'card' && 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md',
        variant === 'default' && 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          <div>
            <h4 className="font-semibold">{batchName}</h4>
            <p className="text-sm opacity-80">
              Starts: {formatDate(batchStartDate)}
            </p>
          </div>
        </div>
        
        {(isDeadlineNear || isDeadlineCritical) && (
          <motion.div
            className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              isDeadlineCritical 
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200'
            )}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {isDeadlineCritical ? 'URGENT' : 'DEADLINE NEAR'}
          </motion.div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Enrollment Deadline:</span>
          <span className="font-medium">{formatDate(enrollmentDeadline)}</span>
        </div>
        
        {timeUntilDeadline > 0 && (
          <CountdownTimer
            endTime={enrollmentDeadline}
            variant="minimal"
            showLabels={false}
            className="mt-2"
          />
        )}
      </div>

      {timeUntilDeadline <= 0 && (
        <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/30 rounded text-red-800 dark:text-red-200 text-sm text-center">
          Enrollment deadline has passed
        </div>
      )}
    </motion.div>
  );
}

// Early Bird Discount System Component
interface EarlyBirdDiscountProps {
  originalPrice: number;
  discountedPrice: number;
  discountEndDate: Date;
  discountPercentage?: number;
  className?: string;
  variant?: 'default' | 'banner' | 'card';
}

export function EarlyBirdDiscountSystem({ 
  originalPrice, 
  discountedPrice, 
  discountEndDate,
  discountPercentage,
  className,
  variant = 'default'
}: EarlyBirdDiscountProps) {
  const [isExpired, setIsExpired] = useState(false);
  const savings = originalPrice - discountedPrice;
  const calculatedPercentage = discountPercentage || Math.round((savings / originalPrice) * 100);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      className={cn(
        'rounded-lg overflow-hidden',
        variant === 'banner' && 'bg-gradient-to-r from-green-500 to-teal-500 text-white',
        variant === 'card' && 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg',
        variant === 'default' && 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Discount Badge */}
      <div className={cn(
        'px-4 py-2 text-center font-bold',
        variant === 'banner' ? 'bg-white/20' : 'bg-green-500 text-white'
      )}>
        🎉 EARLY BIRD SPECIAL - SAVE {calculatedPercentage}%
      </div>

      <div className="p-6">
        {/* Price Comparison */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="text-lg text-gray-500 dark:text-gray-400 line-through">
              {formatPrice(originalPrice)}
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatPrice(discountedPrice)}
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            You save {formatPrice(savings)}!
          </div>
        </div>

        {/* Countdown */}
        <div className="mb-4">
          <div className="text-center text-sm font-medium mb-2">
            Offer expires in:
          </div>
          <CountdownTimer
            endTime={discountEndDate}
            onExpire={() => setIsExpired(true)}
            variant="urgent"
            className="mx-auto max-w-sm"
          />
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-green-500" />
            <span>Same Quality Training</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-500" />
            <span>Expert Instructors</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            <span>Career Support</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-500" />
            <span>Limited Time Only</span>
          </div>
        </div>

        {isExpired && (
          <motion.div
            className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg text-center text-sm"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            Early bird discount has expired. Regular pricing now applies.
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Combined Urgency Elements Component
interface UrgencyElementsProps {
  elements: {
    countdown?: {
      endTime: Date;
      variant?: 'default' | 'urgent' | 'minimal' | 'large';
    };
    seatAvailability?: {
      totalSeats: number;
      availableSeats: number;
      courseName?: string;
    };
    batchDeadline?: {
      batchStartDate: Date;
      enrollmentDeadline: Date;
      batchName?: string;
    };
    earlyBird?: {
      originalPrice: number;
      discountedPrice: number;
      discountEndDate: Date;
      discountPercentage?: number;
    };
  };
  layout?: 'stacked' | 'grid' | 'inline';
  className?: string;
}

export function UrgencyElements({ elements, layout = 'stacked', className }: UrgencyElementsProps) {
  const hasMultipleElements = Object.keys(elements).length > 1;

  return (
    <div className={cn(
      'space-y-4',
      layout === 'grid' && hasMultipleElements && 'grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0',
      layout === 'inline' && 'flex flex-wrap gap-4 space-y-0',
      className
    )}>
      {elements.countdown && (
        <CountdownTimer
          endTime={elements.countdown.endTime}
          variant={elements.countdown.variant}
        />
      )}
      
      {elements.seatAvailability && (
        <SeatAvailabilityCounter
          totalSeats={elements.seatAvailability.totalSeats}
          availableSeats={elements.seatAvailability.availableSeats}
          courseName={elements.seatAvailability.courseName}
        />
      )}
      
      {elements.batchDeadline && (
        <BatchEnrollmentDeadline
          batchStartDate={elements.batchDeadline.batchStartDate}
          enrollmentDeadline={elements.batchDeadline.enrollmentDeadline}
          batchName={elements.batchDeadline.batchName}
        />
      )}
      
      {elements.earlyBird && (
        <EarlyBirdDiscountSystem
          originalPrice={elements.earlyBird.originalPrice}
          discountedPrice={elements.earlyBird.discountedPrice}
          discountEndDate={elements.earlyBird.discountEndDate}
          discountPercentage={elements.earlyBird.discountPercentage}
        />
      )}
    </div>
  );
}