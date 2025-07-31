// SEO Preview Component for Sanity Studio
import React, { useMemo } from 'react'
import { Card, Stack, Text, Badge, Box, Flex } from '@sanity/ui'
import { analyzeSEOContent } from '../lib/seoAnalysis'

interface SEOPreviewProps {
  document: {
    title?: string
    content?: any[]
    focusKeyword?: string
    seoTitle?: string
    seoDescription?: string
    slug?: { current?: string }
  }
}

export function SEOPreview({ document }: SEOPreviewProps) {
  const analysis = useMemo(() => {
    if (!document) return null
    
    return analyzeSEOContent(
      document.title || '',
      document.content || [],
      document.focusKeyword || '',
      document.seoTitle || '',
      document.seoDescription || ''
    )
  }, [document])

  if (!analysis) return null

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'positive'
    if (score >= 60) return 'caution'
    return 'critical'
  }

  const getDensityColor = (density: number) => {
    if (density >= 0.5 && density <= 3) return 'positive'
    if (density < 0.5 || density > 5) return 'critical'
    return 'caution'
  }

  return (
    <Card padding={4} radius={2} shadow={1}>
      <Stack space={4}>
        <Text size={2} weight="semibold">SEO Analysis</Text>
        
        {/* SEO Score */}
        <Flex align="center" gap={3}>
          <Text size={1}>SEO Score:</Text>
          <Badge 
            tone={getScoreColor(analysis.seoScore)}
            fontSize={1}
          >
            {analysis.seoScore}/100
          </Badge>
        </Flex>

        {/* Content Stats */}
        <Stack space={2}>
          <Flex align="center" gap={3}>
            <Text size={1}>Word Count:</Text>
            <Badge 
              tone={analysis.wordCount >= 800 ? 'positive' : analysis.wordCount >= 300 ? 'caution' : 'critical'}
              fontSize={1}
            >
              {analysis.wordCount} words
            </Badge>
          </Flex>
          
          <Flex align="center" gap={3}>
            <Text size={1}>Reading Time:</Text>
            <Badge tone="default" fontSize={1}>
              {analysis.readingTime} min
            </Badge>
          </Flex>
          
          {document.focusKeyword && (
            <Flex align="center" gap={3}>
              <Text size={1}>Keyword Density:</Text>
              <Badge 
                tone={getDensityColor(analysis.keywordDensity)}
                fontSize={1}
              >
                {analysis.keywordDensity}%
              </Badge>
            </Flex>
          )}
        </Stack>

        {/* Google Search Preview */}
        <Stack space={2}>
          <Text size={1} weight="semibold">Search Preview:</Text>
          <Card padding={3} radius={1} tone="default">
            <Stack space={1}>
              <Text 
                size={1} 
                style={{ 
                  color: '#1a0dab', 
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                {document.seoTitle || document.title || 'Your Blog Post Title'}
              </Text>
              <Text size={0} style={{ color: '#006621' }}>
                https://yoursite.com/blog/{document.slug?.current || 'your-post-slug'}
              </Text>
              <Text size={0} style={{ color: '#545454' }}>
                {document.seoDescription || 'Add an SEO description to see how your post appears in search results...'}
              </Text>
            </Stack>
          </Card>
        </Stack>

        {/* Table of Contents */}
        {analysis.tableOfContents.length > 0 && (
          <Stack space={2}>
            <Text size={1} weight="semibold">Table of Contents:</Text>
            <Card padding={3} radius={1} tone="default">
              <Stack space={1}>
                {analysis.tableOfContents.map((item, index) => (
                  <Text 
                    key={index}
                    size={0}
                    style={{ 
                      paddingLeft: `${(item.level - 1) * 12}px`,
                      color: '#1a0dab'
                    }}
                  >
                    {item.heading}
                  </Text>
                ))}
              </Stack>
            </Card>
          </Stack>
        )}

        {/* SEO Recommendations */}
        {analysis.recommendations.length > 0 && (
          <Stack space={2}>
            <Text size={1} weight="semibold">SEO Recommendations:</Text>
            <Stack space={1}>
              {analysis.recommendations.slice(0, 5).map((rec, index) => (
                <Card key={index} padding={2} radius={1} tone="caution">
                  <Text size={0}>• {rec}</Text>
                </Card>
              ))}
              {analysis.recommendations.length > 5 && (
                <Text size={0} style={{ fontStyle: 'italic' }}>
                  +{analysis.recommendations.length - 5} more recommendations
                </Text>
              )}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Card>
  )
}

export default SEOPreview