import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const CoursesSection = () => {
  const courses = [
    {
      title: 'Private Pilot License (PPL)',
      description: 'The foundation of your aviation career. Learn to fly solo and carry passengers in good weather conditions.',
      duration: '3-6 months',
      hours: '40-60 flight hours',
      image: '/HomePage/Course1.webp',
      path: '/courses/private-pilot'
    },
    {
      title: 'Commercial Pilot License (CPL)',
      description: 'Take your skills to the professional level and become eligible for paid flying positions.',
      duration: '6-12 months',
      hours: '200+ flight hours',
      image: '/HomePage/Course2.webp',
      path: '/courses/commercial-pilot'
    },
    {
      title: 'Airline Transport Pilot License (ATPL)',
      description: 'The highest level of aircraft pilot certification, required for airline captains.',
      duration: '18-24 months',
      hours: '1,500+ flight hours',
      image: '/HomePage/Course3.webp',
      path: '/courses/atpl'
    }
  ];

  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-aviation-navy mb-4">Our Flagship Programs</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive flight training programs designed to take you from zero experience to 
            fully qualified aviator through structured, hands-on learning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <div 
              key={index} 
              className={cn(
                "bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 flex flex-col",
                "group transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              )}
            >
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-aviation-navy mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-4 flex-grow">{course.description}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2 text-aviation-gold" />
                    <span>Duration: {course.duration}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2 text-aviation-gold" />
                    <span>Requirements: {course.hours}</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full border-aviation-navy text-aviation-navy hover:bg-aviation-navy hover:text-white transition-all duration-300 flex items-center justify-center gap-2 py-5"
                  asChild
                >
                  <Link to={course.path}>
                    Learn More
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button 
            className="bg-aviation-gold hover:bg-aviation-gold/90 text-white"
            asChild
          >
            <Link to="/courses">View All Courses</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
