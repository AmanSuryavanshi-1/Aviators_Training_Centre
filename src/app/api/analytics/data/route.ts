import { NextRequest, NextResponse } from 'next/server'
import { getFirestoreAdmin } from '@/lib/firebase/admin'

interface FirestoreAnalyticsData {
  pageviews: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    uniqueUsers: number;
  };
  ctaClicks: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    conversionRate: number;
  };
  contactVisits: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  formSubmissions: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  topPosts: Array<{
    slug: string;
    title: string;
    views: number;
    ctaClicks: number;
    conversionRate: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    pageviews: number;
    ctaClicks: number;
    conversions: number;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'week'

    // Check if Firebase is properly configured
    const isFirebaseConfigured = process.env.FIREBASE_PROJECT_ID && 
                                 process.env.FIREBASE_PRIVATE_KEY && 
                                 process.env.FIREBASE_CLIENT_EMAIL &&
                                 !process.env.FIREBASE_PRIVATE_KEY.includes('YOUR_PRIVATE_KEY_HERE') &&
                                 !process.env.FIREBASE_CLIENT_EMAIL.includes('firebase-adminsdk-xxxxx');

    if (!isFirebaseConfigured) {
      // Return empty data structure if Firebase is not configured
      return NextResponse.json({
        success: true,
        data: {
          pageviews: { total: 0, today: 0, thisWeek: 0, thisMonth: 0, uniqueUsers: 0 },
          ctaClicks: { total: 0, today: 0, thisWeek: 0, thisMonth: 0, conversionRate: 0 },
          contactVisits: { total: 0, today: 0, thisWeek: 0, thisMonth: 0 },
          formSubmissions: { total: 0, today: 0, thisWeek: 0, thisMonth: 0 },
          topPosts: [],
          timeSeriesData: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            pageviews: 0,
            ctaClicks: 0,
            conversions: 0
          }))
        },
        message: 'Firebase not configured. Please set up Firebase credentials to view analytics.'
      })
    }

    try {
      // Initialize Firestore Admin
      const firestore = getFirestoreAdmin()
      const now = new Date()
      
      // Calculate time ranges
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const thisMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      // Get time range based on selected timeframe
      const getTimeRange = () => {
        switch (timeframe) {
          case 'day': return today
          case 'week': return thisWeek
          case 'month': return thisMonth
          default: return new Date(0) // All time
        }
      }
      
      const startDate = getTimeRange()

      // Try to fetch analytics data from Firestore (simplified to avoid index issues)
      const pageviewsQuery = await firestore
        .collection('analytics_events')
        .where('eventType', '==', 'pageview')
        .limit(1000)
        .get()

      const pageviewEvents = pageviewsQuery.docs.map(doc => ({
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      }))

      // Fetch other analytics data (simplified)
      const ctaQuery = await firestore
        .collection('analytics_events')
        .where('eventType', '==', 'cta_click')
        .limit(1000)
        .get()

      const ctaEvents = ctaQuery.docs.map(doc => ({
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      }))

      const contactQuery = await firestore
        .collection('analytics_events')
        .where('eventType', '==', 'contact_visit')
        .limit(1000)
        .get()

      const contactEvents = contactQuery.docs.map(doc => ({
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      }))

      const formQuery = await firestore
        .collection('analytics_events')
        .where('eventType', '==', 'form_submission')
        .limit(1000)
        .get()

      const formEvents = formQuery.docs.map(doc => ({
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      }))

      // Calculate metrics
      const uniqueUsers = new Set([
        ...pageviewEvents.map((e: any) => e.userId || e.sessionId),
        ...ctaEvents.map((e: any) => e.userId || e.sessionId),
        ...contactEvents.map((e: any) => e.userId || e.sessionId),
        ...formEvents.map((e: any) => e.userId || e.sessionId)
      ]).size

      const pageviews = {
        total: pageviewEvents.length,
        today: pageviewEvents.filter((e: any) => e.timestamp >= today).length,
        thisWeek: pageviewEvents.filter((e: any) => e.timestamp >= thisWeek).length,
        thisMonth: pageviewEvents.filter((e: any) => e.timestamp >= thisMonth).length,
        uniqueUsers
      }

      const ctaClicks = {
        total: ctaEvents.length,
        today: ctaEvents.filter((e: any) => e.timestamp >= today).length,
        thisWeek: ctaEvents.filter((e: any) => e.timestamp >= thisWeek).length,
        thisMonth: ctaEvents.filter((e: any) => e.timestamp >= thisMonth).length,
        conversionRate: pageviews.total > 0 ? (ctaEvents.length / pageviews.total) * 100 : 0
      }

      const contactVisits = {
        total: contactEvents.length,
        today: contactEvents.filter((e: any) => e.timestamp >= today).length,
        thisWeek: contactEvents.filter((e: any) => e.timestamp >= thisWeek).length,
        thisMonth: contactEvents.filter((e: any) => e.timestamp >= thisMonth).length,
      }

      const formSubmissions = {
        total: formEvents.length,
        today: formEvents.filter((e: any) => e.timestamp >= today).length,
        thisWeek: formEvents.filter((e: any) => e.timestamp >= thisWeek).length,
        thisMonth: formEvents.filter((e: any) => e.timestamp >= thisMonth).length,
      }

      // Calculate top posts
      const postStats = pageviewEvents.reduce((acc: Record<string, any>, event: any) => {
        const slug = event.postSlug || event.page || 'unknown'
        if (!acc[slug]) {
          acc[slug] = { slug, views: 0, ctaClicks: 0 }
        }
        acc[slug].views++
        return acc
      }, {})

      ctaEvents.forEach((event: any) => {
        const slug = event.postSlug || event.page || 'unknown'
        if (postStats[slug]) {
          postStats[slug].ctaClicks++
        }
      })

      const topPosts = Object.values(postStats)
        .map((post: any) => ({
          ...post,
          title: post.slug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          conversionRate: post.views > 0 ? (post.ctaClicks / post.views) * 100 : 0
        }))
        .sort((a: any, b: any) => b.views - a.views)
        .slice(0, 10)

      // Generate time series data (last 7 days)
      const timeSeriesData = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const dateStr = date.toISOString().split('T')[0]
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

        const dayPageviews = pageviewEvents.filter((e: any) => 
          e.timestamp >= dayStart && e.timestamp < dayEnd
        ).length
        
        const dayCtaClicks = ctaEvents.filter((e: any) => 
          e.timestamp >= dayStart && e.timestamp < dayEnd
        ).length
        
        const dayConversions = formEvents.filter((e: any) => 
          e.timestamp >= dayStart && e.timestamp < dayEnd
        ).length

        timeSeriesData.push({
          date: dateStr,
          pageviews: dayPageviews,
          ctaClicks: dayCtaClicks,
          conversions: dayConversions
        })
      }

      const analyticsData: FirestoreAnalyticsData = {
        pageviews,
        ctaClicks,
        contactVisits,
        formSubmissions,
        topPosts,
        timeSeriesData
      }

      return NextResponse.json({
        success: true,
        data: analyticsData,
        message: 'Real analytics data from Firebase Firestore'
      })

    } catch (firebaseError) {
      console.error('Firebase connection error:', firebaseError)
      
      // Return empty data if Firebase connection fails
      return NextResponse.json({
        success: true,
        data: {
          pageviews: { total: 0, today: 0, thisWeek: 0, thisMonth: 0, uniqueUsers: 0 },
          ctaClicks: { total: 0, today: 0, thisWeek: 0, thisMonth: 0, conversionRate: 0 },
          contactVisits: { total: 0, today: 0, thisWeek: 0, thisMonth: 0 },
          formSubmissions: { total: 0, today: 0, thisWeek: 0, thisMonth: 0 },
          topPosts: [],
          timeSeriesData: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            pageviews: 0,
            ctaClicks: 0,
            conversions: 0
          }))
        },
        message: `Firebase connection failed: ${firebaseError instanceof Error ? firebaseError.message : 'Unknown error'}. Please check your Firebase configuration.`
      })
    }

  } catch (error) {
    console.error('Error fetching analytics data:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'ANALYTICS_FETCH_ERROR',
        message: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 })
  }
}
