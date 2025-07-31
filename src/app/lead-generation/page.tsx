'use client';

import LeadGenerationToolsHub from "@/components/features/lead-generation/LeadGenerationToolsHub";

export default function LeadGenerationPage() {
  const handleLeadCapture = async (leadData: any) => {
    try {
      const response = await fetch('/api/lead-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...leadData,
          sessionId: typeof window !== 'undefined' ? sessionStorage.getItem('sessionId') || 'unknown' : 'unknown'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Lead captured successfully:', result);
        
        // Track with analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'lead_generation_tool_completed', {
            tool_type: leadData.toolType,
            event_category: 'Lead Generation',
            event_label: leadData.toolType
          });
        }
      }
    } catch (error) {
      console.error('Failed to capture lead:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <LeadGenerationToolsHub onLeadCapture={handleLeadCapture} />
      </div>
    </div>
  );
}
