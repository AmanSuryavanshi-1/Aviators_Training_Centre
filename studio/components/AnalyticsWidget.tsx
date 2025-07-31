/**
 * Analytics Widget for Sanity Studio Dashboard
 * Shows recent analytics data and quick insights
 */

import React, { useState, useEffect } from 'react'
import {Card, Text, Box, Stack, Flex, Badge, Button, Spinner} from '@sanity/ui'

interface AnalyticsData {
  totalPageviews: number
  totalCTAClicks: number
  totalContactVisits: number
  conversionRate: number
  topPosts: Array<{
    title: string
    slug: string
    views: number
  }>
  recentActivity: Array<{
    type: string
    timestamp: string
    postSlug?: string
  }>
}

export const AnalyticsWidget: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // In a real implementation, this would fetch from your analytics API
      // For now, we'll simulate the data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: AnalyticsData = {
        totalPageviews: 1247,
        totalCTAClicks: 89,
        totalContactVisits: 23,
        conversionRate: 7.1,
        topPosts: [
          { title: 'Getting Started with Flight Training', slug: 'getting-started-flight-training', views: 234 },
          { title: 'CPL vs ATPL: Which Path to Choose', slug: 'cpl-vs-atpl-guide', views: 189 },
          { title: 'Aviation Career Opportunities', slug: 'aviation-career-opportunities', views: 156 }
        ],
        recentActivity: [
          { type: 'pageview', timestamp: '2024-01-15T10:30:00Z', postSlug: 'getting-started-flight-training' },
          { type: 'cta_click', timestamp: '2024-01-15T10:25:00Z', postSlug: 'cpl-vs-atpl-guide' },
          { type: 'contact_visit', timestamp: '2024-01-15T10:20:00Z' }
        ]
      }
      
      setAnalyticsData(mockData)
      setError(null)
    } catch (err) {
      setError('Failed to load analytics data')
      console.error('Analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  const getActivityIcon = (type: string): string => {
    switch (type) {
      case 'pageview': return '👁️'
      case 'cta_click': return '🎯'
      case 'contact_visit': return '📞'
      case 'form_submission': return '📝'
      default: return '📊'
    }
  }

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (loading) {
    return (
      <Card padding={4} radius={2} shadow={1}>
        <Flex align="center" justify="center" style={{ minHeight: '200px' }}>
          <Stack space={3} align="center">
            <Spinner />
            <Text size={1}>Loading analytics...</Text>
          </Stack>
        </Flex>
      </Card>
    )
  }

  if (error) {
    return (
      <Card padding={4} radius={2} shadow={1} tone="critical">
        <Stack space={3}>
          <Text size={1} weight="semibold">
            ❌ Analytics Error
          </Text>
          <Text size={1}>
            {error}
          </Text>
          <Button
            text="Retry"
            tone="primary"
            mode="ghost"
            onClick={fetchAnalyticsData}
          />
        </Stack>
      </Card>
    )
  }

  if (!analyticsData) {
    return null
  }

  return (
    <Card padding={4} radius={2} shadow={1}>
      <Stack space={4}>
        {/* Header */}
        <Flex align="center" justify="space-between">
          <Box>
            <Text size={2} weight="bold">
              📊 Analytics Overview
            </Text>
            <Text size={1} tone="default" marginTop={1}>
              Last 30 days performance
            </Text>
          </Box>
          <Button
            text="View Full Dashboard"
            tone="primary"
            mode="ghost"
            onClick={() => window.open('/admin/analytics', '_blank')}
          />
        </Flex>

        {/* Key Metrics */}
        <Stack space={3}>
          <Text size={1} weight="semibold">
            Key Metrics
          </Text>
          
          <Flex gap={3} wrap="wrap">
            <Card padding={3} tone="primary" radius={2} style={{ flex: 1, minWidth: '120px' }}>
              <Stack space={1} align="center">
                <Text size={2} weight="bold">
                  {formatNumber(analyticsData.totalPageviews)}
                </Text>
                <Text size={0}>Page Views</Text>
              </Stack>
            </Card>
            
            <Card padding={3} tone="positive" radius={2} style={{ flex: 1, minWidth: '120px' }}>
              <Stack space={1} align="center">
                <Text size={2} weight="bold">
                  {analyticsData.totalCTAClicks}
                </Text>
                <Text size={0}>CTA Clicks</Text>
              </Stack>
            </Card>
            
            <Card padding={3} tone="caution" radius={2} style={{ flex: 1, minWidth: '120px' }}>
              <Stack space={1} align="center">
                <Text size={2} weight="bold">
                  {analyticsData.conversionRate}%
                </Text>
                <Text size={0}>Conversion</Text>
              </Stack>
            </Card>
          </Flex>
        </Stack>

        {/* Top Posts */}
        <Stack space={3}>
          <Text size={1} weight="semibold">
            Top Performing Posts
          </Text>
          
          <Stack space={2}>
            {analyticsData.topPosts.map((post, index) => (
              <Card 
                key={post.slug} 
                padding={2} 
                tone="transparent"
                style={{ cursor: 'pointer' }}
                onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
              >
                <Flex align="center" justify="space-between">
                  <Box style={{ flex: 1 }}>
                    <Text size={1} weight="medium">
                      {post.title}
                    </Text>
                  </Box>
                  <Badge tone="primary" fontSize={0} padding={1}>
                    {formatNumber(post.views)} views
                  </Badge>
                </Flex>
              </Card>
            ))}
          </Stack>
        </Stack>

        {/* Recent Activity */}
        <Stack space={3}>
          <Text size={1} weight="semibold">
            Recent Activity
          </Text>
          
          <Stack space={2}>
            {analyticsData.recentActivity.map((activity, index) => (
              <Flex key={index} align="center" gap={2}>
                <Text size={1}>{getActivityIcon(activity.type)}</Text>
                <Box style={{ flex: 1 }}>
                  <Text size={0}>
                    {activity.type.replace('_', ' ')}
                    {activity.postSlug && (
                      <span style={{ color: '#666' }}> on {activity.postSlug}</span>
                    )}
                  </Text>
                </Box>
                <Text size={0} tone="default">
                  {formatTimeAgo(activity.timestamp)}
                </Text>
              </Flex>
            ))}
          </Stack>
        </Stack>

        {/* Footer */}
        <Box 
          padding={2} 
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            textAlign: 'center'
          }}
        >
          <Text size={0} tone="default">
            Data updates every 5 minutes • Last updated: {new Date().toLocaleTimeString()}
          </Text>
        </Box>
      </Stack>
    </Card>
  )
}

export default AnalyticsWidget