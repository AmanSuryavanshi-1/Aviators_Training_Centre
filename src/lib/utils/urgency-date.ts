/**
 * Utility for consistent urgency offer dates across the application
 * Provides a single source of truth for offer end dates
 */

export interface UrgencyDateInfo {
  offerEndDate: Date;
  formattedEndDate: string;
}

/**
 * Gets a consistent offer end date that's always 7 days from today
 * This ensures the offer never expires and remains consistent across all pages
 */
export function getUrgencyOfferDate(): UrgencyDateInfo {
  const today = new Date();
  const offerEndDate = new Date(today);
  offerEndDate.setDate(today.getDate() + 7);
  
  const formattedEndDate = offerEndDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });

  return {
    offerEndDate,
    formattedEndDate
  };
}