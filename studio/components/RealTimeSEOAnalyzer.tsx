import React, { useEffect, useState, useMemo } from 'react'
import {Card, Text, Box, Stack, Badge, Flex as SanityFlex} from '@sanity/ui'
import {analyzeContent, generateSEORecommendations} from '../../src/lib/seo/validation'
import { Flex } from './shared/FlexComponent'

// Custom Progress Bar component since ProgressBar is not available in current Sanity UI
const CustomProgressBar: React.FC<{
  value: number
  tone?: 'positive' | 'caution' | 'critical'
}> = ({ value, tone = 'positive' }) => {
  const getColor = () => {
    switch (tone) {
      case 'positive': return '#43d9ad'
      case 'caution': return '#f59e0b'
      case 'critical': return '#ef4444'
      default: return '#43d9ad'
    }
  }

  return (
    <div style={{
      width: '100%',
      height: '4px',
      backgroundColor: '#e5e7eb',
      borderRadius: '2px',
      overflow: 'hidden'
    }}>
      <div style={{
        width: `${Math.min(100, Math.max(0, value))}%`,
        height: '100%',
        backgroundColor: getColor(),
        transition: 'width 0.3s ease'
      }} />
    </div>
  )
}

interface RealTimeSEOAnalyzerProps {
  document: any
  onChange?: (analysis: any) => void
}

export const RealTimeSEOAnalyzer: React.FC<RealTimeSEOAnalyzerProps> = ({ 
  document, 
  onChange 
}) => {
  const [analysis, setAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Debounced analysis to avoid excessive calculations
  const debouncedAnalysis = useMemo(() => {
    const timeoutId = setTimeout(() => {
      if (document) {
        setIsAnalyzing(true)
        
        const content = extractTextFromBlocks(document.content) || ''
        const title = document.seoTitle || document.title || ''
        const description = document.seoDescription || ''
        const keyword = document.focusKeyword || ''

        const result = analyzeContent(content, title, description, keyword)
        const recommendations = generateSEORecommendations(result)
        
        const fullAnalysis = {
          ...result,
          recommendations,
          lastUpdated: new Date().toISOString()
        }
        
        setAnalysis(fullAnalysis)
        onChange?.(fullAnalysis)
        setIsAnalyzing(false)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [document?.title, document?.seoTitle, document?.seoDescription, document?.focusKeyword, document?.content, onChange])

  useEffect(() => {
    return debouncedAnalysis
  }, [debouncedAnalysis])

  if (!analysis) {
    return (
      <Card padding={3} radius={2} tone="transparent">
        <Stack space={2} align="center">
          <Text size={1}>Analyzing content...</Text>
          <CustomProgressBar value={50} />
        </Stack>
      </Card>
    )
  }

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

  const getCriticalIssues = () => {
    return analysis.seoValidation.issues.filter((issue: string) => 
      issue.includes('empty') || 
      issue.includes('too long') || 
      issue.includes('not found')
    )
  }

  const criticalIssues = getCriticalIssues()

  return (
    <Card padding={3} radius={2} shadow={1}>
      {/* Header with Live Indicator */}
      <Flex align="center" justify="space-between" marginBottom={3}>
        <Flex align="center" gap={2}>
          <Text size={1} weight="semibold">
            Live SEO Analysis
          </Text>
          {isAnalyzing && (
            <Badge tone="primary" fontSize={0} padding={1}>
              Analyzing...
            </Badge>
          )}
        </Flex>
        <Flex align="center" gap={2}>
          <Text size={1}>
            {getScoreEmoji(analysis.seoValidation.score)}
          </Text>
          <Badge tone={getScoreColor(analysis.seoValidation.score)} fontSize={1} padding={2}>
            {analysis.seoValidation.score}/100
          </Badge>
        </Flex>
      </Flex>

      {/* Critical Issues Alert */}
      {criticalIssues.length > 0 && (
        <Box 
          marginBottom={3}
          padding={2} 
          style={{
            backgroundColor: '#fee', 
            borderRadius: '4px',
            borderLeft: '4px solid #dc3545'
          }}
        >
          <Text size={1} weight="semibold" tone="critical" marginBottom={1}>
            🚨 Critical Issues ({criticalIssues.length})
          </Text>
          <Stack space={1}>
            {criticalIssues.slice(0, 2).map((issue, index) => (
              <Text key={index} size={0} tone="critical">
                • {issue}
              </Text>
            ))}
            {criticalIssues.length > 2 && (
              <Text size={0} tone="critical">
                • +{criticalIssues.length - 2} more issues
              </Text>
            )}
          </Stack>
        </Box>
      )}

      {/* Quick Metrics */}
      <Stack space={2} marginBottom={3}>
        <Flex justify="space-between" align="center">
          <Text size={1}>Word Count:</Text>
          <Badge 
            tone={analysis.wordCount < 300 ? 'caution' : analysis.wordCount > 2000 ? 'caution' : 'positive'}
            fontSize={0}
          >
            {analysis.wordCount.toLocaleString()}
          </Badge>
        </Flex>
        
        <Flex justify="space-between" align="center">
          <Text size={1}>Reading Time:</Text>
          <Badge tone="default" fontSize={0}>
            {analysis.readingTime} min
          </Badge>
        </Flex>
        
        <Flex justify="space-between" align="center">
          <Text size={1}>Keyword Density:</Text>
          <Badge 
            tone={
              analysis.keywordDensity === 0 ? 'critical' :
              analysis.keywordDensity < 0.5 || analysis.keywordDensity > 3 ? 'caution' : 
              'positive'
            }
            fontSize={0}
          >
            {analysis.keywordDensity.toFixed(1)}%
          </Badge>
        </Flex>

        <Flex justify="space-between" align="center">
          <Text size={1}>Title Length:</Text>
          <Badge 
            tone={
              analysis.titleLength === 0 ? 'critical' :
              analysis.titleLength > 60 || analysis.titleLength < 30 ? 'caution' : 
              'positive'
            }
            fontSize={0}
          >
            {analysis.titleLength}/60
          </Badge>
        </Flex>

        <Flex justify="space-between" align="center">
          <Text size={1}>Description Length:</Text>
          <Badge 
            tone={
              analysis.descriptionLength === 0 ? 'critical' :
              analysis.descriptionLength > 160 || analysis.descriptionLength < 120 ? 'caution' : 
              'positive'
            }
            fontSize={0}
          >
            {analysis.descriptionLength}/160
          </Badge>
        </Flex>
      </Stack>

      {/* Progress Bars for Key Metrics */}
      <Stack space={2} marginBottom={3}>
        <Box>
          <Flex justify="space-between" align="center" marginBottom={1}>
            <Text size={0}>Title Optimization</Text>
            <Text size={0}>{Math.min(100, (analysis.titleLength / 60) * 100).toFixed(0)}%</Text>
          </Flex>
          <CustomProgressBar 
            value={Math.min(100, (analysis.titleLength / 60) * 100)} 
            tone={analysis.titleLength > 60 ? 'critical' : analysis.titleLength < 30 ? 'caution' : 'positive'}
          />
        </Box>

        <Box>
          <Flex justify="space-between" align="center" marginBottom={1}>
            <Text size={0}>Description Optimization</Text>
            <Text size={0}>{Math.min(100, (analysis.descriptionLength / 160) * 100).toFixed(0)}%</Text>
          </Flex>
          <CustomProgressBar 
            value={Math.min(100, (analysis.descriptionLength / 160) * 100)} 
            tone={analysis.descriptionLength > 160 ? 'critical' : analysis.descriptionLength < 120 ? 'caution' : 'positive'}
          />
        </Box>

        {analysis.keywordDensity > 0 && (
          <Box>
            <Flex justify="space-between" align="center" marginBottom={1}>
              <Text size={0}>Keyword Density</Text>
              <Text size={0}>{((analysis.keywordDensity / 3) * 100).toFixed(0)}%</Text>
            </Flex>
            <CustomProgressBar 
              value={(analysis.keywordDensity / 3) * 100} 
              tone={analysis.keywordDensity > 3 ? 'critical' : analysis.keywordDensity < 0.5 ? 'caution' : 'positive'}
            />
          </Box>
        )}
      </Stack>

      {/* Top Recommendations */}
      {analysis.recommendations.length > 0 && (
        <Box>
          <Text size={1} weight="semibold" marginBottom={2}>
            Top Recommendations:
          </Text>
          <Stack space={1}>
            {analysis.recommendations.slice(0, 3).map((rec: string, index: number) => {
              const isPositive = rec.includes('✅')
              const isCritical = rec.includes('🔴')
              
              return (
                <Box 
                  key={index}
                  padding={2} 
                  style={{
                    backgroundColor: isPositive ? '#d4edda' : isCritical ? '#fee' : '#fff3cd',
                    borderRadius: '4px',
                    borderLeft: `3px solid ${isPositive ? '#28a745' : isCritical ? '#dc3545' : '#ffc107'}`
                  }}
                >
                  <Text size={0} tone={isPositive ? 'positive' : isCritical ? 'critical' : 'caution'}>
                    {rec}
                  </Text>
                </Box>
              )
            })}
            {analysis.recommendations.length > 3 && (
              <Text size={0} tone="default" style={{ fontStyle: 'italic' }}>
                +{analysis.recommendations.length - 3} more recommendations available in detailed view
              </Text>
            )}
          </Stack>
        </Box>
      )}

      {/* Last Updated */}
      <Box 
        marginTop={3}
        padding={1} 
        style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          textAlign: 'center'
        }}
      >
        <Text size={0} tone="default">
          Last analyzed: {new Date(analysis.lastUpdated).toLocaleTimeString()}
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



export default RealTimeSEOAnalyzer