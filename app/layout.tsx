import "../styles/globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "./providers";
import { Toaster } from "@/components/ui/sonner";
export const metadata: Metadata = {

    title: "Aviator Training Centre",
    description:
        "Aviator Training Centre.",
};

export default function RootLayout({ children, }: {
    children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background text-foreground">{children}</div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
