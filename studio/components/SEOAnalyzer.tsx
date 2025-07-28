import React from 'react'
import {Card, Text, Button, Flex, Box, Badge, Stack} from '@sanity/ui'

interface SEOAnalyzerProps {
  document: any
}

interface SEOCheck {
  name: string
  passed: boolean
  message: string
  severity: 'error' | 'warning' | 'success'
}

export const SEOAnalyzer: React.FC<SEOAnalyzerProps> = ({ document }) => {
  const runSEOAnalysis = (): SEOCheck[] => {
    const checks: SEOCheck[] = []

    // Title checks
    if (!document?.title) {
      checks.push({
        name: 'Title',
        passed: false,
        message: 'Title is required',
        severity: 'error'
      })
    } else if (document.title.length < 10) {
      checks.push({
        name: 'Title Length',
        passed: false,
        message: 'Title should be at least 10 characters',
        severity: 'warning'
      })
    } else if (document.title.length > 80) {
      checks.push({
        name: 'Title Length',
        passed: false,
        message: 'Title should be under 80 characters',
        severity: 'warning'
      })
    } else {
      checks.push({
        name: 'Title',
        passed: true,
        message: 'Title looks good',
        severity: 'success'
      })
    }

    // SEO Title checks
    if (!document?.seoTitle) {
      checks.push({
        name: 'SEO Title',
        passed: false,
        message: 'SEO title is missing - will use main title',
        severity: 'warning'
      })
    } else if (document.seoTitle.length > 60) {
      checks.push({
        name: 'SEO Title Length',
        passed: false,
        message: 'SEO title should be under 60 characters',
        severity: 'error'
      })
    } else {
      checks.push({
        name: 'SEO Title',
        passed: true,
        message: 'SEO title is optimized',
        severity: 'success'
      })
    }

    // Meta Description checks
    if (!document?.seoDescription && !document?.excerpt) {
      checks.push({
        name: 'Meta Description',
        passed: false,
        message: 'Meta description or excerpt is required',
        severity: 'error'
      })
    } else {
      const description = document?.seoDescription || document?.excerpt
      if (description.length < 120) {
        checks.push({
          name: 'Meta Description Length',
          passed: false,
          message: 'Meta description should be at least 120 characters',
          severity: 'warning'
        })
      } else if (description.length > 160) {
        checks.push({
          name: 'Meta Description Length',
          passed: false,
          message: 'Meta description should be under 160 characters',
          severity: 'error'
        })
      } else {
        checks.push({
          name: 'Meta Description',
          passed: true,
          message: 'Meta description is well optimized',
          severity: 'success'
        })
      }
    }

    // Focus Keyword check
    if (!document?.focusKeyword) {
      checks.push({
        name: 'Focus Keyword',
        passed: false,
        message: 'Focus keyword is missing',
        severity: 'warning'
      })
    } else {
      checks.push({
        name: 'Focus Keyword',
        passed: true,
        message: 'Focus keyword is set',
        severity: 'success'
      })
    }

    // Featured Image check
    if (!document?.image) {
      checks.push({
        name: 'Featured Image',
        passed: false,
        message: 'Featured image is required for social sharing',
        severity: 'error'
      })
    } else if (!document.image.alt) {
      checks.push({
        name: 'Image Alt Text',
        passed: false,
        message: 'Featured image needs alt text for accessibility',
        severity: 'warning'
      })
    } else {
      checks.push({
        name: 'Featured Image',
        passed: true,
        message: 'Featured image is properly configured',
        severity: 'success'
      })
    }

    // Slug check
    if (!document?.slug?.current) {
      checks.push({
        name: 'URL Slug',
        passed: false,
        message: 'URL slug is required',
        severity: 'error'
      })
    } else {
      checks.push({
        name: 'URL Slug',
        passed: true,
        message: 'URL slug is set',
        severity: 'success'
      })
    }

    // Category check
    if (!document?.category) {
      checks.push({
        name: 'Category',
        passed: false,
        message: 'Category is required for organization',
        severity: 'warning'
      })
    } else {
      checks.push({
        name: 'Category',
        passed: true,
        message: 'Category is assigned',
        severity: 'success'
      })
    }

    return checks
  }

  const seoChecks = runSEOAnalysis()
  const passedChecks = seoChecks.filter(check => check.passed).length
  const totalChecks = seoChecks.length
  const seoScore = Math.round((passedChecks / totalChecks) * 100)

  const getBadgeColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'critical'
      case 'warning': return 'caution'
      case 'success': return 'positive'
      default: return 'default'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'positive'
    if (score >= 60) return 'caution'
    return 'critical'
  }

  return (
    <Card padding={3} radius={2} shadow={1}>
      <Box marginBottom={3}>
        <Flex align="center" justify="space-between">
          <Text size={1} weight="semibold">
            SEO Analysis
          </Text>
          <Badge tone={getScoreColor(seoScore)} fontSize={1}>
            {seoScore}% ({passedChecks}/{totalChecks})
          </Badge>
        </Flex>
      </Box>

      <Stack space={2}>
        {seoChecks.map((check, index) => (
          <Flex key={index} align="center" justify="space-between">
            <Text size={1}>
              {check.name}
            </Text>
            <Flex align="center" gap={2}>
              <Text size={1} tone={check.passed ? 'positive' : 'default'}>
                {check.message}
              </Text>
              <Badge tone={getBadgeColor(check.severity)} fontSize={0}>
                {check.passed ? '✓' : '✗'}
              </Badge>
            </Flex>
          </Flex>
        ))}
      </Stack>

      {seoScore < 80 && (
        <Box marginTop={3} padding={2} style={{backgroundColor: '#fef3cd', borderRadius: '4px'}}>
          <Text size={1} tone="caution">
            💡 Tip: Aim for 80%+ SEO score for better search engine visibility
          </Text>
        </Box>
      )}
    </Card>
  )
}