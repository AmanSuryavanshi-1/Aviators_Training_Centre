"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Plane, Star, Zap } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { easingFunctions } from '@/lib/animations/easing';

const WhatsAppChat: React.FC = () => {
  // All hooks must be declared first before any conditional logic
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<string>("");
  const pathname = usePathname();

  // Check if we're on contact page
  const isContactPage = pathname.includes('/contact');

  const whatsappNumber = "+919485687609"; // Aviators Training Centre WhatsApp number
  const defaultMessage = "Hi! I'm interested in learning more about the aviation courses at Aviators Training Centre. Could you please provide more information?";

  // Define quick action queries with intelligent, concise messages
  const quickActions = {
    courseInfo: {
      icon: "📚",
      label: "Course Information",
      message: "Hi! I would like to know about your aviation courses. Specifically interested in: "
    },
    feeStructure: {
      icon: "💰",
      label: "Fee Structure",
      message: "Hello! Can you please share the fee structure for: "
    },
    scheduleDemo: {
      icon: "📅",
      label: "Schedule Demo",
      message: "Hi! I'd like to schedule a demo class. My preferred time and course: "
    },
    bookMeeting: {
      icon: "🤝",
      label: "Book Meeting",
      message: "Hello! I want to book a consultation meeting to discuss: "
    },
    eligibilityCheck: {
      icon: "✈️",
      label: "Eligibility Check",
      message: "Hi! I want to check my eligibility. My background: "
    },
    placementInfo: {
      icon: "🎯",
      label: "Placement Assistance",
      message: "Hello! Please tell me about your placement assistance for: "
    },
    admissionProcess: {
      icon: "📝",
      label: "Admission Process",
      message: "Hi! I want to know about the admission process for: "
    },
    batchTiming: {
      icon: "⏰",
      label: "Batch Timings",
      message: "Hello! Can you share the batch timings and schedule for: "
    }
  };

  const handleQuickAction = (actionKey: keyof typeof quickActions) => {
    setSelectedQuery(actionKey);
    const action = quickActions[actionKey];
    const message = encodeURIComponent(action.message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

    // Add a small delay to show the selection before opening WhatsApp
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      setIsOpen(false); // Close the chat box after opening WhatsApp
    }, 300);
  };

  const handleWhatsAppClick = () => {
    const message = selectedQuery ?
      encodeURIComponent(quickActions[selectedQuery as keyof typeof quickActions].message) :
      encodeURIComponent(defaultMessage);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const buttonVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    hover: {
      scale: 1.1,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 0, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: easingFunctions.easeInOut
      }
    }
  };

  const chatBoxVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: { duration: 0.2 }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  // Don't render on contact page - use conditional rendering instead of early return
  if (isContactPage) {
    return null;
  }

  return (
    <>
      {/* Floating WhatsApp Button */}
      <motion.div
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
        initial="initial"
        animate="animate"
        variants={buttonVariants}
      >
        {/* Pulse animation ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-aviation-500/60 dark:bg-aviation-500/50"
          variants={pulseVariants}
          animate="animate"
        />

        {/* Main button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-16 h-16 bg-gradient-to-r from-aviation-700 to-aviation-500 dark:from-aviation-500 dark:to-aviation-400 text-white rounded-full shadow-lg hover:shadow-xl ring-1 ring-aviation-800/30 dark:ring-aviation-700/40 flex items-center justify-center group overflow-hidden whatsapp-float conversion-button"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          data-conversion="true"
          data-analytics-event="whatsapp_chat_open"
          data-analytics-source="floating_button"
          aria-label={isOpen ? "Close WhatsApp chat menu" : "Open WhatsApp chat for inquiries"}
        >
          {/* Background gradient animation - themed */}
          <div className="absolute inset-0 bg-gradient-to-r from-aviation-800 to-aviation-600 dark:from-aviation-600 dark:to-aviation-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay" />

          {/* Aviation-themed sparkle decorations */}
          <motion.div
            className="absolute -top-2 -left-2 w-2 h-2 text-aviation-200"
            animate={{
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: 0
            }}
            aria-hidden="true"
          >
            <Star className="w-full h-full" aria-hidden="true" />
          </motion.div>

          <motion.div
            className="absolute -bottom-2 -right-2 w-2 h-2 text-aviation-300"
            animate={{
              rotate: [360, 0],
              scale: [0.6, 1.4, 0.6],
              opacity: [0.3, 0.9, 0.3]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: 1
            }}
            aria-hidden="true"
          >
            <Zap className="w-full h-full" aria-hidden="true" />
          </motion.div>

          {/* Aviation-themed decorative elements */}
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-aviation-300 dark:bg-aviation-200 rounded-full opacity-60"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 0.5
            }}
          />

          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative z-10"
              >
                <X className="w-7 h-7 text-white" aria-hidden="true" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 flex items-center justify-center"
              >
                <MessageCircle className="w-7 h-7 text-white" aria-hidden="true" />
                {/* Small notification dot */}
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-aviation-300 dark:bg-aviation-400 rounded-full border-2 border-white/90"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: easingFunctions.easeInOut
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Chat Preview Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-3 sm:right-6 z-40 w-[280px] sm:w-64 max-w-[280px]"
            variants={chatBoxVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-aviation-700 to-aviation-500 dark:from-aviation-600 dark:to-aviation-500 p-3 text-white">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 dark:bg-white/15 rounded-full flex items-center justify-center" aria-hidden="true">
                    <Plane className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs">Aviators Training Centre</h3>
                    <p className="text-xs opacity-90">Online now</p>
                  </div>
                </div>
              </div>

              {/* Chat Content */}
              <div className="p-3 space-y-2">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-aviation-100 dark:bg-aviation-500/20 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                    <MessageCircle className="w-3 h-3 text-aviation-700 dark:text-aviation-200" aria-hidden="true" />
                  </div>
                  <div className="bg-gray-100 dark:bg-aviation-700/25 rounded-lg rounded-tl-md p-2 max-w-[180px]">
                    <p className="text-xs text-gray-800 dark:text-aviation-50">
                      Hello! 👋 How can we help you today?
                    </p>
                  </div>
                </div>

                {/* Quick action buttons */}
                <div className="space-y-1 pl-0">
                  {Object.entries(quickActions).slice(0, 4).map(([key, action]) => (
                    <motion.button
                      key={key}
                      onClick={() => handleQuickAction(key as keyof typeof quickActions)}
                      className="w-full text-left p-2 text-xs bg-gray-50 dark:bg-aviation-700/20 hover:bg-aviation-50 dark:hover:bg-aviation-600/25 rounded-md transition-colors duration-150 border border-transparent dark:border-aviation-700/40 hover:border-aviation-200 dark:hover:border-aviation-500 active:bg-aviation-100 dark:active:bg-aviation-500/20"
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                    >
                      <span className="flex items-center space-x-2">
                        <span className="text-sm">{action.icon}</span>
                        <span className="font-medium text-gray-900 dark:text-aviation-50">{action.label}</span>
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Footer with WhatsApp button */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                  onClick={handleWhatsAppClick}
                  className="w-full bg-gradient-to-r from-aviation-700 to-aviation-500 dark:from-aviation-600 dark:to-aviation-500 hover:from-aviation-800 hover:to-aviation-600 dark:hover:from-aviation-700 dark:hover:to-aviation-600 text-white rounded-lg py-2.5 px-3 flex items-center justify-center space-x-2 text-sm font-medium transition-all duration-200 hover:shadow-lg ring-1 ring-aviation-800/20 dark:ring-aviation-700/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="Continue conversation on WhatsApp"
                >
                  <Send className="w-3 h-3" aria-hidden="true" />
                  <span>Continue on WhatsApp</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WhatsAppChat;
