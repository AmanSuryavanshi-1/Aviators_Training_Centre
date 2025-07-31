import React from 'react'
import {Card, Text, Box, Stack, Button, Flex as SanityFlex, Tab, TabList, TabPanel} from '@sanity/ui'
import {SocialCardPreview, SocialPreviewTabs} from './SocialCardPreview'
import {SearchResultPreview} from './SearchResultPreview'
import {SEOScoreDisplay} from './SEOScoreDisplay'
import { Flex } from './shared/FlexComponent'

interface ComprehensivePreviewProps {
  document: any
  schemaType: any
}

export const ComprehensivePreview: React.FC<ComprehensivePreviewProps> = ({ 
  document, 
  schemaType 
}) => {
  const [activeTab, setActiveTab] = React.useState('seo')

  // Only show for blog posts
  if (schemaType.name !== 'blogPost') {
    return null
  }

  const tabs = [
    { id: 'seo', label: 'SEO Score', icon: '📊' },
    { id: 'search', label: 'Search Preview', icon: '🔍' },
    { id: 'social', label: 'Social Preview', icon: '📱' },
    { id: 'analytics', label: 'Analytics Link', icon: '📈' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'seo':
        return <SEOScoreDisplay document={document} />
      
      case 'search':
        return <SearchResultPreview document={document} />
      
      case 'social':
        return <SocialPreviewTabs document={document} />
      
      case 'analytics':
        return <AnalyticsLinkPanel document={document} />
      
      default:
        return <SEOScoreDisplay document={document} />
    }
  }

  return (
    <Card padding={4} radius={2} shadow={1}>
      <Box marginBottom={4}>
        <Text size={2} weight="bold">
          Content Preview & SEO Analysis
        </Text>
        <Text size={1} tone="default" marginTop={2}>
          Real-time preview of how your content will appear across different platforms
        </Text>
      </Box>

      {/* Tab Navigation */}
      <Box marginBottom={4}>
        <Flex gap={2} wrap="wrap">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              text={`${tab.icon} ${tab.label}`}
              tone={activeTab === tab.id ? 'primary' : 'default'}
              mode={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id)}
              style={{
                minWidth: 'auto',
                fontSize: '14px'
              }}
            />
          ))}
        </Flex>
      </Box>

      {/* Tab Content */}
      <Box>
        {renderTabContent()}
      </Box>

      {/* Quick Actions */}
      <Box marginTop={4}>
        <Stack space={2}>
          <Text size={1} weight="semibold">
            Quick Actions:
          </Text>
          <Flex gap={2} wrap="wrap">
            <Button
              text="📝 Edit in Studio"
              tone="primary"
              mode="ghost"
              onClick={() => {
                // This would be handled by Sanity's built-in functionality
                console.log('Edit document')
              }}
            />
            <Button
              text="👁️ Preview Live"
              tone="default"
              mode="ghost"
              onClick={() => {
                const slug = document?.slug?.current
                if (slug) {
                  window.open(`/blog/${slug}?preview=true`, '_blank')
                }
              }}
            />
            <Button
              text="📊 View Analytics"
              tone="default"
              mode="ghost"
              onClick={() => {
                const slug = document?.slug?.current
                if (slug) {
                  window.open(`/admin/analytics?post=${slug}`, '_blank')
                }
              }}
            />
          </Flex>
        </Stack>
      </Box>
    </Card>
  )
}

// Analytics Link Panel Component
const AnalyticsLinkPanel: React.FC<{document: any}> = ({ document }) => {
  const slug = document?.slug?.current
  const title = document?.title || 'Untitled Post'
  const publishedAt = document?.publishedAt
  const isPublished = document?._id && !document?._id.startsWith('drafts.')

  return (
    <Card padding={3} radius={2} shadow={1}>
      <Stack space={3}>
        <Box>
          <Text size={1} weight="semibold" marginBottom={2}>
            Analytics Dashboard Integration
          </Text>
          <Text size={1} tone="default">
            View detailed analytics for this blog post in the admin dashboard
          </Text>
        </Box>

        {/* Post Status */}
        <Box 
          padding={2} 
          style={{
            backgroundColor: isPublished ? '#d4edda' : '#fff3cd',
            borderRadius: '4px',
            borderLeft: `4px solid ${isPublished ? '#28a745' : '#ffc107'}`
          }}
        >
          <Text size={1} tone={isPublished ? 'positive' : 'caution'}>
            {isPublished ? '✅ Published' : '⏳ Draft'} - {title}
          </Text>
          {publishedAt && (
            <Text size={0} tone="default" marginTop={1}>
              Published: {new Date(publishedAt).toLocaleDateString()}
            </Text>
          )}
        </Box>

        {/* Analytics Actions */}
        <Stack space={2}>
          <Button
            text="📊 View Post Analytics"
            tone="primary"
            disabled={!slug || !isPublished}
            onClick={() => {
              if (slug) {
                window.open(`/admin/analytics?post=${slug}`, '_blank')
              }
            }}
            style={{ width: '100%' }}
          />
          
          <Button
            text="📈 Open Admin Dashboard"
            tone="default"
            mode="ghost"
            onClick={() => {
              window.open('/admin', '_blank')
            }}
            style={{ width: '100%' }}
          />

          <Button
            text="🔗 Copy Post URL"
            tone="default"
            mode="ghost"
            disabled={!slug}
            onClick={() => {
              if (slug) {
                const url = `https://aviatorscentre.com/blog/${slug}`
                navigator.clipboard.writeText(url)
                // You might want to show a toast notification here
                alert('URL copied to clipboard!')
              }
            }}
            style={{ width: '100%' }}
          />
        </Stack>

        {/* Analytics Preview */}
        {isPublished && slug && (
          <Box 
            padding={2} 
            style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}
          >
            <Text size={0} weight="semibold" marginBottom={1}>
              Analytics Preview:
            </Text>
            <Text size={0} tone="default">
              • Page views, CTA clicks, and conversion tracking
            </Text>
            <Text size={0} tone="default">
              • Real-time engagement metrics
            </Text>
            <Text size={0} tone="default">
              • SEO performance monitoring
            </Text>
          </Box>
        )}

        {/* Draft Notice */}
        {!isPublished && (
          <Box 
            padding={2} 
            style={{
              backgroundColor: '#fff3cd',
              borderRadius: '4px',
              border: '1px solid #ffeaa7'
            }}
          >
            <Text size={0} tone="caution">
              📝 Analytics will be available once this post is published
            </Text>
          </Box>
        )}
      </Stack>
    </Card>
  )
}



export default ComprehensivePreview