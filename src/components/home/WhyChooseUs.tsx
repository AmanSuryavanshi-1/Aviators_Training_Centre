
import React from 'react';
import { Users, Calendar, Award, Headset, Plane, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const WhyChooseUs = () => {
  const features = [
    {
      icon: <Users className="h-10 w-10" />,
      title: 'Expert Instructors',
      description: 'Learn from certified flight instructors with thousands of hours of experience across commercial and military aviation.'
    },
    {
      icon: <Calendar className="h-10 w-10" />,
      title: 'Flexible Scheduling',
      description: 'Choose from flexible training schedules designed to accommodate your personal and professional commitments.'
    },
    {
      icon: <Award className="h-10 w-10" />,
      title: 'Industry Recognition',
      description: 'Our graduates are sought after by major airlines and aviation organizations worldwide.'
    },
    {
      icon: <Headset className="h-10 w-10" />,
      title: '24/7 Support',
      description: 'Access round-the-clock support from our dedicated team throughout your training journey.'
    },
    {
      icon: <Plane className="h-10 w-10" />,
      title: 'Modern Fleet',
      description: 'Train on a diverse fleet of well-maintained aircraft equipped with the latest avionics technology.'
    },
    {
      icon: <Shield className="h-10 w-10" />,
      title: 'Safety First',
      description: 'Your safety is our priority with rigorous maintenance standards and comprehensive safety protocols.'
    }
  ];

  return (
    <section id="about" className="section-padding bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-aviation-navy mb-4">Why Choose Skybound Aviator</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We pride ourselves on delivering exceptional flight training through experienced instructors,
            state-of-the-art facilities, and a supportive learning environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={cn(
                "bg-white rounded-lg p-6 shadow-md card-hover",
                "transform transition-all duration-300"
              )}
            >
              <div className="text-aviation-gold mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-aviation-navy mb-2">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button 
            className="bg-aviation-navy hover:bg-aviation-navy/90 text-white px-8 py-6 text-lg"
            asChild
          >
            <a href="/about">
              Learn More About Us
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
