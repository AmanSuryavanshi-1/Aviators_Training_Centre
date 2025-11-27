'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';

interface ContactWithUTM {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  source_description?: string;
  referrer?: string;
  landing_page?: string;
  timestamp?: number;
  submitted_at?: string;
}

interface SourceStats {
  count: number;
  percentage: number;
}

/**
 * UTM Analytics Dashboard
 * Displays contact form submissions grouped by traffic source
 * 
 * Usage: Add this component to an admin page
 */
export default function UTMAnalyticsDashboard() {
  const [contacts, setContacts] = useState<ContactWithUTM[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceStats, setSourceStats] = useState<Record<string, SourceStats>>({});

  useEffect(() => {
    const contactsRef = ref(db, 'contacts');

    // Listen for real-time updates
    const unsubscribe = onValue(contactsRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        const contactsArray: ContactWithUTM[] = Object.values(data);
        setContacts(contactsArray);
        
        // Calculate source statistics
        const stats: Record<string, number> = {};
        contactsArray.forEach(contact => {
          const source = contact.source_description || 'Unknown';
          stats[source] = (stats[source] || 0) + 1;
        });

        // Convert to percentages
        const total = contactsArray.length;
        const statsWithPercentage: Record<string, SourceStats> = {};
        Object.entries(stats).forEach(([source, count]) => {
          statsWithPercentage[source] = {
            count,
            percentage: Math.round((count / total) * 100)
          };
        });

        setSourceStats(statsWithPercentage);
      }
      
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => {
      off(contactsRef);
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>UTM Analytics Dashboard</CardTitle>
          <CardDescription>Loading contact data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Sort sources by count
  const sortedSources = Object.entries(sourceStats)
    .sort(([, a], [, b]) => b.count - a.count);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>UTM Analytics Dashboard</CardTitle>
          <CardDescription>
            Traffic source breakdown for {contacts.length} contact form submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedSources.map(([source, stats]) => (
              <div key={source} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{source}</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.count} leads ({stats.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Latest 10 contact form submissions with source data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contacts
              .sort((a, b) => {
                const timeA = a.timestamp || 0;
                const timeB = b.timestamp || 0;
                return timeB - timeA;
              })
              .slice(0, 10)
              .map((contact, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {contact.source_description || 'Unknown'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{contact.subject}</p>
                  {contact.utm_campaign && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Campaign: {contact.utm_campaign}
                    </p>
                  )}
                  {contact.submitted_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(contact.submitted_at).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>Leads grouped by campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(
              contacts.reduce((acc, contact) => {
                if (contact.utm_campaign) {
                  acc[contact.utm_campaign] = (acc[contact.utm_campaign] || 0) + 1;
                }
                return acc;
              }, {} as Record<string, number>)
            )
              .sort(([, a], [, b]) => b - a)
              .map(([campaign, count]) => (
                <div key={campaign} className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">{campaign}</span>
                  <span className="text-sm text-muted-foreground">{count} leads</span>
                </div>
              ))}
            {contacts.filter(c => c.utm_campaign).length === 0 && (
              <p className="text-sm text-muted-foreground">No campaign data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
