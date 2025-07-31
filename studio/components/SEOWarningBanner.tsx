import React from 'react'
import { Card, Stack, Text, Flex, Badge } from '@sanity/ui'
import { WarningOutlineIcon, CheckmarkIcon, CloseIcon } from '@sanity/icons'
import { calculateSEOScore } from '../plugins/seoAuditPlugin'

interface SEOWarningBannerProps {
  document: any
}

export const SEOWarningBanner: React.FC<SEOWarningBannerProps> = ({ document }) => {
  if (!document) return null

  const seoScore = calculateSEOScore(document)
  const warnings = []

  // Check for missing SEO title
  if (!document.seoTitle && !document.title) {
    warnings.push('Missing SEO title')
  }

  // Check for missing meta description
  if (!document.seoDescription) {
    warnings.push('Missing meta description')
  }

  // Check for missing focus keyword
  if (!document.focusKeyword) {
    warnings.push('Missing focus keyword')
  }

  // Check for missing alt text on featured image
  if (document.image && !document.image.alt) {
    warnings.push('Featured image missing alt text')
  }

  // Check content length
  const contentText = document.body 
    ? document.body
        .filter((block: any) => block._type === 'block')
        .map((block: any) => 
          block.children
            ?.filter((child: any) => child._type === 'span')
            .map((span: any) => span.text)
            .join('')
        )
        .join(' ')
    : ''

  const wordCount = contentText.split(/\s+/).filter(word => word.length > 0).length
  if (wordCount < 300) {
    warnings.push(`Content too short (${wordCount} words, minimum 300 recommended)`)
  }

  // Check for missing category
  if (!document.category) {
    warnings.push('Missing category')
  }

  // If no warnings and good SEO score, show success
  if (warnings.length === 0 && seoScore >= 80) {
    return (
      <Card padding={3} radius={2} tone="positive" style={{ marginBottom: '16px' }}>
        <Flex align="center" gap={2}>
          <CheckmarkIcon />
          <Text size={1} weight="medium">
            ✅ SEO Optimized (Score: {seoScore}%)
          </Text>
        </Flex>
      </Card>
    )
  }

  // If no critical warnings but low score
  if (warnings.length === 0 && seoScore < 80) {
    return (
      <Card padding={3} radius={2} tone="caution" style={{ marginBottom: '16px' }}>
        <Flex align="center" gap={2}>
          <WarningOutlineIcon />
          <Text size={1} weight="medium">
            ⚠️ SEO Score: {seoScore}% - Room for improvement
          </Text>
        </Flex>
      </Card>
    )
  }

  // Show warnings
  if (warnings.length === 0) return null

  const severity = warnings.length >= 3 ? 'critical' : 'caution'
  const icon = severity === 'critical' ? <CloseIcon /> : <WarningOutlineIcon />
  const emoji = severity === 'critical' ? '❌' : '⚠️'

  return (
    <Card padding={3} radius={2} tone={severity} style={{ marginBottom: '16px' }}>
      <Stack space={2}>
        <Flex align="center" gap={2}>
          {icon}
          <Text size={1} weight="medium">
            {emoji} SEO Issues Found (Score: {seoScore}%)
          </Text>
          <Badge tone={severity} fontSize={0}>
            {warnings.length} issue{warnings.length !== 1 ? 's' : ''}
          </Badge>
        </Flex>
        <Stack space={1}>
          {warnings.slice(0, 3).map((warning, index) => (
            <Text key={index} size={1} style={{ paddingLeft: '24px' }}>
              • {warning}
            </Text>
          ))}
          {warnings.length > 3 && (
            <Text size={1} muted style={{ paddingLeft: '24px' }}>
              ... and {warnings.length - 3} more issue{warnings.length - 3 !== 1 ? 's' : ''}
            </Text>
          )}
        </Stack>
      </Stack>
    </Card>
  )
}