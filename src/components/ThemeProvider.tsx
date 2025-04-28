// Added "use client" directive as this component interacts with browser APIs (localStorage, matchMedia)
"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "atc-ui-theme", // Updated storage key for Next.js app
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    // Need to check if window is defined before accessing localStorage
    () => {
      if (typeof window !== 'undefined') {
        return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
      }
      return defaultTheme; // Return default if window is not available (SSR)
    }
  );

  useEffect(() => {
    // Ensure window is defined before proceeding (though this runs client-side)
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    let effectiveTheme = theme;
    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    root.classList.add(effectiveTheme);

    // Save the resolved theme (light/dark) or the explicit choice (light/dark)
    // Don't save "system" itself back to local storage, save the resolved theme
    // unless the user explicitly chose "system". The initial state handles reading.
    // However, the original logic only saves when setTheme is called, which is fine.

  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newTheme);
      }
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
