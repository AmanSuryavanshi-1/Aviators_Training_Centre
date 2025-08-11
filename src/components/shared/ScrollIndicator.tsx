"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane } from "lucide-react";
import { easingFunctions } from "@/lib/animations/easing";
import { usePathname } from "next/navigation";

const SCROLL_THRESHOLD_PX = 12;
const SCROLL_GESTURE_DISTANCE_PX = 60;
const SCROLL_GESTURE_DEBOUNCE_MS = 600;
const GESTURE_LIMIT = 3; // show for initial 2-3 scrolls (using 3)
const PLANE_TILT_CORRECTION_DEG = -18; // fine-tune so plane appears perfectly vertical

function getIsAtBottom(): boolean {
  if (typeof window === "undefined") return false;
  const scrollPosition = window.scrollY + window.innerHeight;
  const pageHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.body.clientHeight,
    document.documentElement.clientHeight
  );
  return scrollPosition >= pageHeight - SCROLL_THRESHOLD_PX;
}

function scrollSmoothTo(y: number) {
  try {
    window.scrollTo({ top: y, behavior: "smooth" });
  } catch {
    window.scrollTo(0, y);
  }
}

const ScrollIndicator: React.FC = () => {
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isNearTop, setIsNearTop] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [showIndicator, setShowIndicator] = useState(true);
  const [justMounted, setJustMounted] = useState(true);

  const gestureCountRef = useRef<number>(0);
  const lastScrollYRef = useRef<number>(0);
  const lastGestureAtRef = useRef<number>(0);
  const pathname = usePathname();

  useEffect(() => {
    // Initialize for first mount
    gestureCountRef.current = 0;

    const getPageHeight = () => Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    );

    const handleScroll = () => {
      const atBottom = getIsAtBottom();
      setIsAtBottom(atBottom);
      setIsNearTop(window.scrollY <= SCROLL_THRESHOLD_PX);
      // Auto-hide on very short pages where no scroll is possible
      const pageHeight = getPageHeight();
      const canScroll = pageHeight - window.innerHeight > 1;
      setIsVisible(canScroll);

      // Detect discrete scroll gestures and hide after limit is reached
      const now = Date.now();
      const currentY = window.scrollY;
      const distance = Math.abs(currentY - lastScrollYRef.current);
      const enoughTimeElapsed = now - lastGestureAtRef.current > SCROLL_GESTURE_DEBOUNCE_MS;
      if (distance >= SCROLL_GESTURE_DISTANCE_PX && enoughTimeElapsed) {
        lastGestureAtRef.current = now;
        lastScrollYRef.current = currentY;
        const next = gestureCountRef.current + 1;
        gestureCountRef.current = next;
        if (next >= GESTURE_LIMIT) {
          setShowIndicator(false);
        }
      }
    };

    // Defer first calculations to allow layout/content to settle
    const t1 = setTimeout(handleScroll, 0);
    const t2 = setTimeout(handleScroll, 500);
    const t3 = setTimeout(() => setJustMounted(false), 2000);

    window.addEventListener("load", handleScroll, { once: true } as any);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Reset per route change so indicator shows on every page
  useEffect(() => {
    gestureCountRef.current = 0;
    lastScrollYRef.current = 0;
    lastGestureAtRef.current = 0;
    setShowIndicator(true);
    setJustMounted(true);
    const t = setTimeout(() => setJustMounted(false), 1500);
    return () => clearTimeout(t);
  }, [pathname]);

  const label = useMemo(() => {
    if (isAtBottom) return "Scroll to top";
    return "Scroll down";
  }, [isAtBottom]);

  const handleClick = () => {
    if (isAtBottom) {
      scrollSmoothTo(0);
    } else {
      const nextY = Math.min(
        window.scrollY + window.innerHeight * 0.9,
        document.body.scrollHeight
      );
      scrollSmoothTo(nextY);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 320, damping: 24 },
    },
  } as const;

  const planeVariants = {
    down: {
      y: [0, 6, 0],
      transition: { duration: 1.6, repeat: Infinity, ease: easingFunctions.easeInOut },
    },
    up: {
      y: [0, -6, 0],
      transition: { duration: 1.6, repeat: Infinity, ease: easingFunctions.easeInOut },
    },
    hover: { scale: 1.05 },
    tap: { scale: 0.97 },
  } as const;

  // no decorative trail to keep it ultra minimal

  // Position: extreme bottom-left, compact footprint.
  return (
    <AnimatePresence>
      {(isVisible || justMounted) && showIndicator && (
        <motion.div
          className="fixed bottom-3 left-3 sm:bottom-4 sm:left-4 z-[60]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            aria-label={label}
            title={label}
            onClick={handleClick}
            className="relative group flex items-center gap-2 pl-2.5 pr-3 py-1.5 cursor-pointer select-none rounded-full bg-gradient-to-br from-aviation-700 to-aviation-500 dark:from-aviation-200 dark:to-aviation-100 text-white dark:text-aviation-900 shadow-lg ring-1 ring-aviation-800/30 dark:ring-aviation-300/40"
            whileHover="hover"
            whileTap="tap"
          >
            {/* Plane icon */}
            <motion.span
              className="relative inline-flex items-center justify-center w-5 h-5 text-white"
              variants={planeVariants}
              animate={isAtBottom ? "up" : "down"}
              style={{ rotate: (isAtBottom ? -90 : 90) + PLANE_TILT_CORRECTION_DEG }}
            >
              <Plane className="w-4 h-4" />
            </motion.span>

            {/* Label cue */}
            <span className="inline text-[11px] font-semibold tracking-tight text-white dark:text-aviation-900">
              {isAtBottom ? "Top" : "Scroll down"}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollIndicator;
