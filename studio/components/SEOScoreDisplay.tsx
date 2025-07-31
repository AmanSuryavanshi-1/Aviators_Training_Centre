import React from 'react'
import {Card, Text, Box, Stack, Badge, Button, Flex as SanityFlex} from '@sanity/ui'
import {analyzeContent, calculateReadingTime, calculateWordCount, generateSEORecommendations} from '../../src/lib/seo/validation'
import { Flex } from './shared/FlexComponent'

interface SEOScoreDisplayProps {
  document: any
}

export const SEOScoreDisplay: React.FC<SEOScoreDisplayProps> = ({ document }) => {
  const [showDetails, setShowDetails] = React.useState(false)

  // Prepare data for SEO analysis
  const seoData = {
    title: document?.title || '',
    seoTitle: document?.seoTitle || '',
    seoDescription: document?.seoDescription || '',
    focusKeyword: document?.focusKeyword || '',
    content: extractTextFromBlocks(document?.content) || ''
  }

  const analysis = analyzeContent(
    seoData.content,
    seoData.seoTitle || seoData.title,
    seoData.seoDescription,
    seoData.focusKeyword
  )
  const seoResult = analysis.seoValidation
  const readingTime = { minutes: Math.floor(analysis.readingTime), seconds: (analysis.readingTime % 1) * 60 }
  const wordCount = analysis.wordCount
  const recommendations = generateSEORecommendations(analysis)

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'positive'
    if (score >= 60) return 'caution'
    return 'critical'
  }

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🚀'
    if (score >= 80) return '✅'
    if (score >= 60) return '⚠️'
    return '❌'
  }

  return (
    <Card padding={3} radius={2} shadow={1}>
      {/* Header with Score */}
      <Flex align="center" justify="space-between" marginBottom={3}>
        <Text size={1} weight="semibold">
          SEO Score
        </Text>
        <Flex align="center" gap={2}>
          <Text size={2}>
            {getScoreEmoji(seoResult.score)}
          </Text>
          <Badge tone={getScoreColor(seoResult.score)} fontSize={1} padding={2}>
            {seoResult.score}/100
          </Badge>
        </Flex>
      </Flex>

      {/* Quick Stats */}
      <Stack space={2} marginBottom={3}>
        <Flex justify="space-between" align="center">
          <Text size={1}>Word Count:</Text>
          <Text size={1} tone={wordCount < 300 ? 'caution' : 'positive'}>
            {wordCount.toLocaleString()} words
          </Text>
        </Flex>
        
        <Flex justify="space-between" align="center">
          <Text size={1}>Reading Time:</Text>
          <Text size={1}>
            {readingTime.minutes}m {readingTime.seconds}s
          </Text>
        </Flex>
        
        <Flex justify="space-between" align="center">
          <Text size={1}>Issues Found:</Text>
          <Text size={1} tone={seoResult.issues.length === 0 ? 'positive' : 'critical'}>
            {seoResult.issues.length}
          </Text>
        </Flex>
      </Stack>

      {/* Toggle Details Button */}
      <Button
        text={showDetails ? 'Hide Details' : 'Show Details'}
        tone="primary"
        mode="ghost"
        onClick={() => setShowDetails(!showDetails)}
        style={{ width: '100%' }}
      />

      {/* Detailed Analysis */}
      {showDetails && (
        <Box marginTop={3}>
          <Stack space={3}>
            {/* Issues */}
            {seoResult.issues.length > 0 && (
              <Box>
                <Text size={1} weight="semibold" marginBottom={2}>
                  Issues to Fix:
                </Text>
                <Stack space={1}>
                  {seoResult.issues.map((issue, index) => (
                    <Box 
                      key={index}
                      padding={2} 
                      style={{
                        backgroundColor: '#fee', 
                        borderRadius: '4px',
                        borderLeft: '4px solid #dc3545'
                      }}
                    >
                      <Text size={1} tone="critical">
                        ❌ {issue}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Suggestions */}
            {seoResult.suggestions.length > 0 && (
              <Box>
                <Text size={1} weight="semibold" marginBottom={2}>
                  Suggestions:
                </Text>
                <Stack space={1}>
                  {seoResult.suggestions.map((suggestion, index) => (
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
                        💡 {suggestion}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <Box>
                <Text size={1} weight="semibold" marginBottom={2}>
                  Recommendations:
                </Text>
                <Stack space={1}>
                  {recommendations.map((recommendation, index) => (
                    <Box 
                      key={index}
                      padding={2} 
                      style={{
                        backgroundColor: '#e7f3ff', 
                        borderRadius: '4px',
                        borderLeft: '4px solid #0066cc'
                      }}
                    >
                      <Text size={1}>
                        📈 {recommendation}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Success Message */}
            {seoResult.issues.length === 0 && seoResult.suggestions.length === 0 && (
              <Box 
                padding={3} 
                style={{
                  backgroundColor: '#d4edda', 
                  borderRadius: '4px',
                  borderLeft: '4px solid #28a745',
                  textAlign: 'center'
                }}
              >
                <Text size={1} tone="positive" weight="semibold">
                  🎉 Excellent! Your content is well-optimized for SEO.
                </Text>
              </Box>
            )}
          </Stack>
        </Box>
      )}

      {/* Score Interpretation */}
      <Box 
        marginTop={3}
        padding={2} 
        style={{
          backgroundColor: '#f8f9fa', 
          borderRadius: '4px',
          fontSize: '12px'
        }}
      >
        <Text size={0} tone="default">
          <strong>Score Guide:</strong> 90-100 (Excellent), 80-89 (Good), 60-79 (Needs Work), Below 60 (Poor)
        </Text>
      </Box>
    </Card>
  )
}

// Helper function to extract text from Sanity block content
function extractTextFromBlocks(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return ''
  
  return blocks
    .filter(block => block._type === 'block')
    .map(block => {
      if (!block.children) return ''
      return block.children
        .filter((child: any) => child._type === 'span')
        .map((child: any) => child.text || '')
        .join('')
    })
    .join(' ')
    .trim()
}

