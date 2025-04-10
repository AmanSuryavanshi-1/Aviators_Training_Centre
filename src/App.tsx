
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "@/pages/Index";
import ContactPage from "@/pages/ContactPage";
import Schedule from "@/pages/Schedule";
import NotFound from "@/pages/NotFound";
import About from "@/pages/About"; // Import new page
import Courses from "@/pages/Courses"; // Import new page
import Instructors from "@/pages/Instructors"; // Import new page
import FAQ from "@/pages/FAQ"; // Import new page
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const queryClient = new QueryClient();

// Define routes including the new placeholder pages
const router = createBrowserRouter([
  { path: "/", element: <Index /> },
  { path: "/about", element: <About /> },
  { path: "/courses", element: <Courses /> },
  { path: "/instructors", element: <Instructors /> },
  { path: "/faq", element: <FAQ /> },
  { path: "/contact", element: <ContactPage /> },
  { path: "/schedule", element: <Schedule /> },
  { path: "*", element: <NotFound /> },
]);

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="skybound-ui-theme"> {/* Default to dark theme */} 
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
