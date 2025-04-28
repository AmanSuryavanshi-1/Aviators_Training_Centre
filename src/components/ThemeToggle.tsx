"use client"; // Added "use client" for hooks and motion

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider"; // Use local provider hook
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid rendering mismatch by returning placeholder until mounted
  if (!mounted) {
    // Render a placeholder button with the same size to avoid layout shift
    return <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full border border-border/30 opacity-0 pointer-events-none" />;
  }

  const handleToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="w-10 h-10 rounded-full border border-border/30 bg-background/10 text-foreground hover:bg-background/20 shadow-sm transition-all duration-300 hover:shadow-md"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{
          rotate: theme === "light" ? 0 : 180,
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 0.4,
          ease: "easeInOut",
          scale: { duration: 0.2 }
        }}
        className="relative w-5 h-5 flex items-center justify-center"
      >
        {/* Sun Icon */}
        <motion.div
          key="sun" // Added key for animation
          initial={{ opacity: 0, y: 10 }} // Start from slightly below
          animate={{
            opacity: theme === "light" ? 1 : 0,
            y: theme === "light" ? 0 : -10,
          }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Sun className="h-5 w-5 text-amber-500" />
        </motion.div>
        
        {/* Moon Icon */}
        <motion.div
          key="moon" // Added key for animation
          initial={{ opacity: 0, y: -10 }} // Start from slightly above
          animate={{
            opacity: theme === "dark" ? 1 : 0,
            y: theme === "dark" ? 0 : 10,
          }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Moon className="h-5 w-5 text-indigo-300" />
        </motion.div>
      </motion.div>
    </Button>
  );
}
