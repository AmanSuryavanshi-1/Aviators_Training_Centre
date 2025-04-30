
"use client";

import {  Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from 'next-themes';
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="opacity-0 w-9 h-9" />;
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
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
        <motion.div
          animate={{
            opacity: theme === "light" ? 1 : 0,
            y: theme === "light" ? 0 : -10,
          }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Sun className="h-5 w-5 text-amber-500" />
        </motion.div>   
        
        <motion.div
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
