
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "@/pages/Index";
import ContactPage from "@/pages/ContactPage";
import Schedule from "@/pages/Schedule";
import NotFound from "@/pages/NotFound";
import About from "@/pages/About";
import Courses from "@/pages/Courses";
import Instructors from "@/pages/Instructors";
import FAQ from "@/pages/FAQ";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom"; // Removed BrowserRouter import, Added Outlet
import ScrollToTop from "@/components/shared/ScrollToTop";

const queryClient = new QueryClient();

// Layout component that includes ScrollToTop and renders child routes
const RootLayout = () => {
  return (
    <>
      <ScrollToTop />
      {/* Outlet renders the matched child route component */}
      <Outlet />
    </>
  );
};

// Define routes using the layout
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Index /> },
      { path: "/about", element: <About /> },
      { path: "/courses", element: <Courses /> },
      { path: "/instructors", element: <Instructors /> },
      { path: "/faq", element: <FAQ /> },
      { path: "/contact", element: <ContactPage /> },
      { path: "/schedule", element: <Schedule /> },
      { path: "*", element: <NotFound /> }, // 404 route still works here
    ]
  }
]);


const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="skybound-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {/* RouterProvider now renders the routes defined above */}
        <RouterProvider router={router} />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
