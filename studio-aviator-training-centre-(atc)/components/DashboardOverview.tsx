import React from 'react'
import {Card, Text, Box, Stack, Badge, Flex, Button} from '@sanity/ui'

interface DashboardOverviewProps {
  stats?: {
    totalPosts: number
    draftPosts: number
    publishedPosts: number
    scheduledPosts: number
    totalCourses: number
    activeCourses: number
  }
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ stats }) => {
  const defaultStats = {
    totalPosts: 0,
    draftPosts: 0,
    publishedPosts: 0,
    scheduledPosts: 0,
    totalCourses: 0,
    activeCourses: 0,
    ...stats
  }

  const quickActions = [
    {
      title: 'Create New Post',
      description: 'Start writing a new blog post',
      icon: '✍️',
      action: () => {
        // This would be handled by the parent component
        console.log('Create new post')
      }
    },
    {
      title: 'Review Drafts',
      description: `${defaultStats.draftPosts} posts need attention`,
      icon: '👀',
      action: () => {
        console.log('Review drafts')
      }
    },
    {
      title: 'SEO Health Check',
      description: 'Analyze content for SEO optimization',
      icon: '🔍',
      action: () => {
        console.log('SEO health check')
      }
    },
    {
      title: 'Media Library',
      description: 'Manage images and assets',
      icon: '🖼️',
      action: () => {
        console.log('Open media library')
      }
    },
  ]

  const recentActivity = [
    {
      type: 'post_created',
      title: 'New blog post created',
      description: 'DGCA Exam Preparation Guide',
      time: '2 hours ago',
      icon: '✍️'
    },
    {
      type: 'post_published',
      title: 'Blog post published',
      description: 'Commercial Pilot Career Path',
      time: '1 day ago',
      icon: '🌐'
    },
    {
      type: 'course_updated',
      title: 'Course information updated',
      description: 'CPL Ground School',
      time: '2 days ago',
      icon: '🎓'
    },
  ]

  return (
    <Stack space={4}>
      {/* Welcome Section */}
      <Card padding={4} radius={2} shadow={1} tone="primary">
        <Box>
          <Text size={2} weight="bold" style={{color: 'white'}}>
            ✈️ Welcome to Aviators Training Centre Blog Management
          </Text>
          <Text size={1} style={{color: 'white', opacity: 0.9}} marginTop={2}>
            Manage your aviation training content, optimize for SEO, and drive course enrollments
          </Text>
        </Box>
      </Card>

      {/* Stats Overview */}
      <Card padding={4} radius={2} shadow={1}>
        <Box marginBottom={3}>
          <Text size={1} weight="semibold">
            📊 Content Overview
          </Text>
        </Box>

        <Flex gap={3} wrap="wrap">
          <Card padding={3} tone="default" radius={1} flex={1} style={{minWidth: '200px'}}>
            <Stack space={2}>
              <Text size={3} weight="bold">
                {defaultStats.totalPosts}
              </Text>
              <Text size={1} tone="default">
                Total Blog Posts
              </Text>
              <Flex gap={1}>
                <Badge tone="positive" fontSize={0}>
                  {defaultStats.publishedPosts} Published
                </Badge>
                <Badge tone="caution" fontSize={0}>
                  {defaultStats.draftPosts} Drafts
                </Badge>
              </Flex>
            </Stack>
          </Card>

          <Card padding={3} tone="default" radius={1} flex={1} style={{minWidth: '200px'}}>
            <Stack space={2}>
              <Text size={3} weight="bold">
                {defaultStats.totalCourses}
              </Text>
              <Text size={1} tone="default">
                Total Courses
              </Text>
              <Flex gap={1}>
                <Badge tone="positive" fontSize={0}>
                  {defaultStats.activeCourses} Active
                </Badge>
                {defaultStats.scheduledPosts > 0 && (
                  <Badge tone="primary" fontSize={0}>
                    {defaultStats.scheduledPosts} Scheduled
                  </Badge>
                )}
              </Flex>
            </Stack>
          </Card>
        </Flex>
      </Card>

      {/* Quick Actions */}
      <Card padding={4} radius={2} shadow={1}>
        <Box marginBottom={3}>
          <Text size={1} weight="semibold">
            🚀 Quick Actions
          </Text>
        </Box>

        <Flex gap={2} wrap="wrap">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              padding={3} 
              tone="default" 
              radius={1} 
              style={{cursor: 'pointer', minWidth: '200px'}}
              onClick={action.action}
            >
              <Stack space={2}>
                <Text size={2}>
                  {action.icon}
                </Text>
                <Text size={1} weight="semibold">
                  {action.title}
                </Text>
                <Text size={1} tone="default">
                  {action.description}
                </Text>
              </Stack>
            </Card>
          ))}
        </Flex>
      </Card>

      {/* Recent Activity */}
      <Card padding={4} radius={2} shadow={1}>
        <Box marginBottom={3}>
          <Text size={1} weight="semibold">
            📈 Recent Activity
          </Text>
        </Box>

        <Stack space={2}>
          {recentActivity.map((activity, index) => (
            <Flex key={index} align="center" gap={3}>
              <Text size={2}>
                {activity.icon}
              </Text>
              <Box flex={1}>
                <Text size={1} weight="semibold" marginBottom={1}>
                  {activity.title}
                </Text>
                <Text size={1} tone="default">
                  {activity.description}
                </Text>
              </Box>
              <Text size={1} tone="default">
                {activity.time}
              </Text>
            </Flex>
          ))}
        </Stack>
      </Card>

      {/* Tips and Guidelines */}
      <Card padding={4} radius={2} shadow={1} tone="caution">
        <Box marginBottom={3}>
          <Text size={1} weight="semibold">
            💡 Content Guidelines
          </Text>
        </Box>

        <Stack space={2}>
          <Text size={1}>
            • Focus on aviation training topics that help students succeed
          </Text>
          <Text size={1}>
            • Include strategic CTAs to promote relevant courses
          </Text>
          <Text size={1}>
            • Optimize all content for SEO with proper titles and descriptions
          </Text>
          <Text size={1}>
            • Use high-quality aviation imagery with proper alt text
          </Text>
          <Text size={1}>
            • Maintain consistent brand voice and professional tone
          </Text>
        </Stack>
      </Card>
    </Stack>
  )
}