// Firestore Security Rules for Advanced Analytics Dashboard

export const FIRESTORE_SECURITY_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Analytics Events Collection
    match /analytics_events/{eventId} {
      // Allow read access for authenticated admin users
      allow read: if isAuthenticated() && isAdmin();
      
      // Allow write access for the analytics tracking system
      allow create: if isValidAnalyticsEvent();
      
      // Prevent updates and deletes to maintain data integrity
      allow update, delete: if false;
    }
    
    // User Journeys Collection
    match /user_journeys/{journeyId} {
      // Allow read access for authenticated admin users
      allow read: if isAuthenticated() && isAdmin();
      
      // Allow create and update for journey tracking
      allow create, update: if isValidUserJourney();
      
      // Prevent deletes to maintain historical data
      allow delete: if false;
    }
    
    // Traffic Sources Collection
    match /traffic_sources/{sourceId} {
      // Allow read access for authenticated admin users
      allow read: if isAuthenticated() && isAdmin();
      
      // Allow create and update for aggregated data
      allow create, update: if isValidTrafficSource();
      
      // Allow delete for data cleanup (admin only)
      allow delete: if isAuthenticated() && isAdmin();
    }
    
    // Helper Functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      // Check if user has admin role or is accessing from admin domain
      return request.auth.token.admin == true || 
             request.auth.token.email in ['admin@aviatorstrainingcentre.com'];
    }
    
    function isValidAnalyticsEvent() {
      let data = request.resource.data;
      return data.keys().hasAll(['timestamp', 'userId', 'sessionId', 'event', 'page', 'source', 'user', 'journey', 'validation']) &&
             data.event.keys().hasAll(['type', 'category', 'action']) &&
             data.page.keys().hasAll(['url', 'title', 'path', 'category']) &&
             data.source.keys().hasAll(['category', 'source', 'medium', 'isAuthentic', 'confidence']) &&
             data.user.keys().hasAll(['isReturning', 'deviceType', 'browser', 'os']) &&
             data.journey.keys().hasAll(['journeyId', 'stepNumber', 'isEntryPoint', 'isExitPoint', 'timeSpent', 'scrollDepth']) &&
             data.validation.keys().hasAll(['isValid', 'isBot', 'botScore', 'flags']) &&
             data.timestamp is timestamp &&
             data.source.confidence >= 0 && data.source.confidence <= 100 &&
             data.validation.botScore >= 0 && data.validation.botScore <= 100;
    }
    
    function isValidUserJourney() {
      let data = request.resource.data;
      return data.keys().hasAll(['userId', 'sessionId', 'startTime', 'entry', 'path', 'outcome', 'metrics', 'attribution']) &&
             data.entry.keys().hasAll(['page', 'source', 'referrer']) &&
             data.outcome.keys().hasAll(['type']) &&
             data.metrics.keys().hasAll(['duration', 'pageCount', 'interactionCount', 'averageScrollDepth', 'engagementScore']) &&
             data.attribution.keys().hasAll(['firstTouch', 'lastTouch', 'assistingChannels']) &&
             data.startTime is timestamp &&
             data.metrics.duration >= 0 &&
             data.metrics.pageCount >= 0 &&
             data.metrics.interactionCount >= 0 &&
             data.metrics.averageScrollDepth >= 0 && data.metrics.averageScrollDepth <= 100 &&
             data.metrics.engagementScore >= 0 && data.metrics.engagementScore <= 100;
    }
    
    function isValidTrafficSource() {
      let data = request.resource.data;
      return data.keys().hasAll(['date', 'source', 'medium', 'category', 'metrics', 'authenticity']) &&
             data.metrics.keys().hasAll(['visitors', 'sessions', 'pageViews', 'conversions', 'conversionRate', 'averageSessionDuration', 'bounceRate']) &&
             data.authenticity.keys().hasAll(['validTraffic', 'suspiciousTraffic', 'botTraffic', 'confidenceScore']) &&
             data.date is string &&
             data.metrics.visitors >= 0 &&
             data.metrics.sessions >= 0 &&
             data.metrics.pageViews >= 0 &&
             data.metrics.conversions >= 0 &&
             data.metrics.conversionRate >= 0 && data.metrics.conversionRate <= 100 &&
             data.metrics.bounceRate >= 0 && data.metrics.bounceRate <= 100 &&
             data.authenticity.confidenceScore >= 0 && data.authenticity.confidenceScore <= 100;
    }
  }
}
`;

// Export security rules as a deployable format
export const getSecurityRulesConfig = () => ({
  rules: FIRESTORE_SECURITY_RULES,
  targets: [
    {
      target: 'analytics_events',
      resources: ['analytics_events']
    },
    {
      target: 'user_journeys', 
      resources: ['user_journeys']
    },
    {
      target: 'traffic_sources',
      resources: ['traffic_sources']
    }
  ]
});