import React from 'react'
import {Card, Text, Box, Stack} from '@sanity/ui'
import { Flex } from './shared/FlexComponent'

interface SearchResultPreviewProps {
  document: any
}

export const SearchResultPreview: React.FC<SearchResultPreviewProps> = ({ document }) => {
  const title = document?.seoTitle || document?.title || 'Untitled Post'
  const description = document?.seoDescription || document?.excerpt || 'No description available'
  const slug = document?.slug?.current || 'untitled-post'
  const baseUrl = 'https://aviatorscentre.com'
  const fullUrl = `${baseUrl}/blog/${slug}`

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - 3) + '...'
  }

  const getValidationIssues = () => {
    const issues = []
    
    if (title.length > 60) {
      issues.push('Title is too long for Google (60+ characters)')
    }
    if (title.length < 30) {
      issues.push('Title could be longer to utilize available space')
    }
    if (description.length > 160) {
      issues.push('Description is too long for Google (160+ characters)')
    }
    if (description.length < 120) {
      issues.push('Description could be longer for better engagement')
    }
    if (!document?.focusKeyword) {
      issues.push('No focus keyword set for SEO optimization')
    } else {
      const keyword = document.focusKeyword.toLowerCase()
      const titleLower = title.toLowerCase()
      const descLower = description.toLowerCase()
      
      if (!titleLower.includes(keyword)) {
        issues.push(`Focus keyword "${document.focusKeyword}" not found in title`)
      }
      if (!descLower.includes(keyword)) {
        issues.push(`Focus keyword "${document.focusKeyword}" not found in description`)
      }
    }
    
    return issues
  }

  const validationIssues = getValidationIssues()

  return (
    <Card padding={3} radius={2} shadow={1}>
      <Box marginBottom={3}>
        <Text size={1} weight="semibold">
          Google Search Preview
        </Text>
      </Box>

      {/* Search Result Mockup */}
      <Box 
        padding={3}
        style={{
          backgroundColor: '#fff',
          border: '1px solid #e1e8ed',
          borderRadius: '8px',
          fontFamily: 'arial, sans-serif'
        }}
      >
        <Stack space={1}>
          {/* URL */}
          <Text 
            size={1} 
            style={{ 
              color: '#006621',
              fontSize: '14px',
              lineHeight: '1.3'
            }}
          >
            {fullUrl}
          </Text>

          {/* Title */}
          <Text 
            size={2} 
            weight="medium"
            style={{ 
              color: '#1a0dab',
              fontSize: '20px',
              lineHeight: '1.3',
              cursor: 'pointer',
              textDecoration: 'none',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {truncateText(title, 60)}
          </Text>

          {/* Description */}
          <Text 
            size={1}
            style={{ 
              color: '#4d5156',
              fontSize: '14px',
              lineHeight: '1.4',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {truncateText(description, 160)}
          </Text>

          {/* Breadcrumb */}
          <Text 
            size={0}
            style={{ 
              color: '#70757a',
              fontSize: '12px',
              marginTop: '4px'
            }}
          >
            Aviators Training Centre › Blog › {document?.category?.title || 'Aviation'}
          </Text>
        </Stack>
      </Box>

      {/* Character Counts */}
      <Box marginTop={3}>
        <Stack space={2}>
          <Flex justify="space-between" align="center">
            <Text size={1}>Title Length:</Text>
            <Text 
              size={1} 
              tone={title.length > 60 ? 'critical' : title.length < 30 ? 'caution' : 'positive'}
            >
              {title.length}/60 characters
            </Text>
          </Flex>
          
          <Flex justify="space-between" align="center">
            <Text size={1}>Description Length:</Text>
            <Text 
              size={1} 
              tone={description.length > 160 ? 'critical' : description.length < 120 ? 'caution' : 'positive'}
            >
              {description.length}/160 characters
            </Text>
          </Flex>
        </Stack>
      </Box>

      {/* Validation Issues */}
      {validationIssues.length > 0 && (
        <Box marginTop={3}>
          <Text size={1} weight="semibold" marginBottom={2}>
            SEO Recommendations:
          </Text>
          <Stack space={1}>
            {validationIssues.map((issue, index) => (
              <Box 
                key={index}
                padding={2} 
                style={{
                  backgroundColor: '#fff3cd', 
                  borderRadius: '4px',
                  borderLeft: '4px solid #ffc107'
                }}
              >
                <Text size={1} tone="caution">
                  • {issue}
                </Text>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* Success Message */}
      {validationIssues.length === 0 && (
        <Box 
          marginTop={3}
          padding={2} 
          style={{
            backgroundColor: '#d4edda', 
            borderRadius: '4px',
            borderLeft: '4px solid #28a745'
          }}
        >
          <Text size={1} tone="positive">
            ✅ Your search result preview looks great! All SEO best practices are followed.
          </Text>
        </Box>
      )}
    </Card>
  )
}

