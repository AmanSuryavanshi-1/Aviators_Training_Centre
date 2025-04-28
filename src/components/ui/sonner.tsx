// Added "use client" directive as this component uses the useTheme hook
"use client";

// Import useTheme from the local ThemeProvider, not next-themes
import { useTheme } from "@/components/ThemeProvider"; 
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  // Now correctly uses the theme state from our custom provider
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      // Cast theme to the expected type for Sonner component
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
