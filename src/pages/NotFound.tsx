
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold text-aviation-primary dark:text-white mb-4">404</h1>
            <h2 className="text-2xl md:text-3xl font-medium text-aviation-secondary mb-6">Page Not Found</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <Button 
              className="bg-aviation-primary hover:bg-aviation-primary/90 text-white px-8 py-6 btn-hover-effect"
              asChild
            >
              <Link to="/" className="inline-flex items-center">
                <Home className="mr-2 h-5 w-5" /> Back to Home
              </Link>
            </Button>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
