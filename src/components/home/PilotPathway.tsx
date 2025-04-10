
import React from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { BookOpen, Award, Plane, FileText } from 'lucide-react';

const PilotPathway = () => {
  const steps = [
    {
      id: '1',
      title: 'Educational Qualification',
      icon: <BookOpen className="h-5 w-5 text-aviation-gold" />,
      content: (
        <>
          <p className="mb-2">A high school diploma or equivalent is the minimum requirement to begin flight training. For certain advanced programs:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Bachelor's degree recommended for airline career paths</li>
            <li>Strong foundation in mathematics and physics beneficial</li>
            <li>English proficiency required for international aviation communication</li>
          </ul>
        </>
      )
    },
    {
      id: '2',
      title: 'Medical Requirements',
      icon: <FileText className="h-5 w-5 text-aviation-gold" />,
      content: (
        <>
          <p className="mb-2">Obtain the appropriate medical certificate from an FAA-designated Aviation Medical Examiner (AME):</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Class 3 Medical Certificate - Required for Private Pilot License</li>
            <li>Class 2 Medical Certificate - Required for Commercial Pilot License</li>
            <li>Class 1 Medical Certificate - Required for Airline Transport Pilot License</li>
            <li>Vision requirements include 20/20 or corrected to 20/20 vision</li>
          </ul>
        </>
      )
    },
    {
      id: '3',
      title: 'Ground Training Course',
      icon: <Award className="h-5 w-5 text-aviation-gold" />,
      content: (
        <>
          <p className="mb-2">Comprehensive classroom instruction covering essential aviation theory:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Aerodynamics and aircraft systems</li>
            <li>Navigation and flight planning</li>
            <li>Aviation regulations and procedures</li>
            <li>Meteorology and weather interpretation</li>
            <li>Human factors and crew resource management</li>
          </ul>
          <p className="mt-2">Our ground training utilizes modern teaching methods, interactive simulations, and practice exams to ensure thorough preparation for FAA knowledge tests.</p>
        </>
      )
    },
    {
      id: '4',
      title: 'Flight Training Course',
      icon: <Plane className="h-5 w-5 text-aviation-gold" />,
      content: (
        <>
          <p className="mb-2">Hands-on training in the aircraft with certified flight instructors:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Basic flight maneuvers and procedures</li>
            <li>Cross-country flight planning and navigation</li>
            <li>Night flying operations</li>
            <li>Emergency procedures and situational awareness</li>
            <li>Instrument training (depending on program)</li>
          </ul>
          <p className="mt-2">Flight training progresses from basic skills to advanced operations, with regular progress checks to ensure competency before final examination with FAA examiners.</p>
        </>
      )
    }
  ];

  return (
    <section id="programs" className="section-padding bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-aviation-navy mb-4">Your Path to Becoming a Pilot</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            The journey to earning your wings involves several key steps. Our structured program 
            guides you through each phase, from initial qualifications to your first solo flight.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {steps.map((step) => (
              <AccordionItem value={step.id} key={step.id} className="border border-gray-200 rounded-lg mb-4 shadow-sm">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="bg-aviation-navy/5 p-2 rounded-full mr-3">
                      {step.icon}
                    </div>
                    <span className="font-semibold text-lg text-aviation-navy">
                      {step.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pt-2 pb-4 text-gray-600">
                  {step.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default PilotPathway;
