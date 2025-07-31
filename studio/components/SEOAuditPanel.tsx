import React, { useState, useEffect } from 'react'
import { Card, Stack, Text, Badge, Button, Flex, Box } from '@sanity/ui'
import { CheckmarkIcon, WarningOutlineIcon, CloseIcon, RefreshIcon } from '@sanity/icons'
import { 
  validateSEOTitle, 
  validateSEODescription, 
  validateFocusKeyword, 
  validateContentReadability,
  calculateSEOScore 
} from '../plugins/seoAuditPlugin'

interface SEOAuditPanelProps {
  document: any
  onRefresh?: () => void
}

interface SEOCheck {
  name: string
  status: 'pass' | 'warning' | 'fail'
  message: string
  score: number
  recommendation?: string
}

export const SEOAuditPanel: React.FC<SEOAuditPanelProps> = ({ document, onRefresh }) => {
  const [checks, setChecks] = useState<SEOCheck[]>([])
  const [overallScore, setOverallScore] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const runSEOAudit = () => {
    setIsLoading(true)
    
    // Extract content as plain text for analysis
    const contentText = document.content 
      ? document.content
          .filter((block: any) => block._type === 'block')
          .map((block: any) => 
            block.children
              ?.filter((child: any) => child._type === 'span')
              .map((span: any) => span.text)
              .join('')
          )
          .join(' ')
      : ''

    // Run all SEO validations
    const titleValidation = validateSEOTitle(document.seoTitle || document.title)
    const descriptionValidation = validateSEODescription(document.seoDescription)
    const keywordValidation = validateFocusKeyword(contentText, document.focusKeyword)
    const contentValidation = validateContentReadability(contentText)

    // Additional checks
    const imageAltCheck = checkImageAltText(document.content)
    const headingStructureCheck = checkHeadingStructure(document.content)
    const linkCheck = checkInternalLinks(document.content)

    const seoChecks: SEOCheck[] = [
      {
        name: 'SEO Title',
        status: titleValidation.isValid ? 'pass' : 'fail',
        message: titleValidation.message || 'SEO title is optimized',
        score: titleValidation.score,
        recommendation: !titleValidation.isValid 
          ? 'Create a compelling title between 30-60 characters that includes your focus keyword'
          : undefined
      },
      {
        name: 'Meta Description',
        status: descriptionValidation.isValid ? 'pass' : 'fail',
        message: descriptionValidation.message || 'Meta description is optimized',
        score: descriptionValidation.score,
        recommendation: !descriptionValidation.isValid 
          ? 'Write a compelling meta description between 120-160 characters that summarizes your content'
          : undefined
      },
      {
        name: 'Focus Keyword',
        status: keywordValidation.isValid ? 'pass' : 'warning',
        message: keywordValidation.message || 'Focus keyword density is optimal',
        score: keywordValidation.score,
        recommendation: !keywordValidation.isValid 
          ? 'Ensure your focus keyword appears naturally throughout your content (0.5-3% density)'
          : undefined
      },
      {
        name: 'Content Readability',
        status: contentValidation.isValid ? 'pass' : 'warning',
        message: contentValidation.message || 'Content readability is good',
        score: contentValidation.score,
        recommendation: !contentValidation.isValid 
          ? 'Improve readability by using shorter sentences, simpler words, and clear structure'
          : undefined
      },
      {
        name: 'Image Alt Text',
        status: imageAltCheck.status,
        message: imageAltCheck.message,
        score: imageAltCheck.score,
        recommendation: imageAltCheck.status !== 'pass' 
          ? 'Add descriptive alt text to all images for better accessibility and SEO'
          : undefined
      },
      {
        name: 'Heading Structure',
        status: headingStructureCheck.status,
        message: headingStructureCheck.message,
        score: headingStructureCheck.score,
        recommendation: headingStructureCheck.status !== 'pass' 
          ? 'Use proper heading hierarchy (H1, H2, H3) to structure your content'
          : undefined
      },
      {
        name: 'Internal Links',
        status: linkCheck.status,
        message: linkCheck.message,
        score: linkCheck.score,
        recommendation: linkCheck.status !== 'pass' 
          ? 'Add 2-5 internal links to related content to improve SEO and user experience'
          : undefined
      }
    ]

    setChecks(seoChecks)
    setOverallScore(calculateSEOScore(document))
    setIsLoading(false)
  }

  // Helper functions for additional SEO checks
  const checkImageAltText = (content: any[]): Omit<SEOCheck, 'name' | 'recommendation'> => {
    if (!content) return { status: 'pass', message: 'No images to check', score: 100 }
    
    const images = content.filter(block => block._type === 'image')
    if (images.length === 0) return { status: 'pass', message: 'No images in content', score: 100 }
    
    const imagesWithoutAlt = images.filter(img => !img.alt || img.alt.trim() === '')
    
    if (imagesWithoutAlt.length === 0) {
      return { status: 'pass', message: 'All images have alt text', score: 100 }
    }
    
    return { 
      status: 'fail', 
      message: `${imagesWithoutAlt.length} of ${images.length} images missing alt text`, 
      score: Math.max(0, 100 - (imagesWithoutAlt.length / images.length) * 100)
    }
  }

  const checkHeadingStructure = (content: any[]): Omit<SEOCheck, 'name' | 'recommendation'> => {
    if (!content) return { status: 'warning', message: 'No content to analyze', score: 50 }
    
    const headings = content.filter(block => 
      block._type === 'block' && block.style && block.style.startsWith('h')
    )
    
    if (headings.length === 0) {
      return { status: 'warning', message: 'No headings found in content', score: 30 }
    }
    
    const hasH1 = headings.some(h => h.style === 'h1')
    const hasH2 = headings.some(h => h.style === 'h2')
    
    if (hasH1 && hasH2) {
      return { status: 'pass', message: 'Good heading structure detected', score: 100 }
    } else if (hasH2) {
      return { status: 'warning', message: 'Consider adding an H1 heading', score: 75 }
    } else {
      return { status: 'warning', message: 'Add more headings to structure your content', score: 50 }
    }
  }

  const checkInternalLinks = (content: any[]): Omit<SEOCheck, 'name' | 'recommendation'> => {
    if (!content) return { status: 'warning', message: 'No content to analyze', score: 50 }
    
    // This is a simplified check - in a real implementation, you'd parse the content more thoroughly
    const contentText = JSON.stringify(content)
    const linkMatches = contentText.match(/href.*?aviatorstrainingcentre\.com/g) || []
    
    if (linkMatches.length >= 2) {
      return { status: 'pass', message: `${linkMatches.length} internal links found`, score: 100 }
    } else if (linkMatches.length === 1) {
      return { status: 'warning', message: 'Consider adding more internal links', score: 70 }
    } else {
      return { status: 'warning', message: 'No internal links found', score: 30 }
    }
  }

  useEffect(() => {
    runSEOAudit()
  }, [document])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'positive'
    if (score >= 60) return 'caution'
    return 'critical'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckmarkIcon />
      case 'warning': return <WarningOutlineIcon />
      case 'fail': return <CloseIcon />
      default: return <WarningOutlineIcon />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'positive'
      case 'warning': return 'caution'
      case 'fail': return 'critical'
      default: return 'default'
    }
  }

  return (
    <Card padding={4} radius={2} shadow={1}>
      <Stack space={4}>
        {/* Header with overall score */}
        <Flex align="center" justify="space-between">
          <Text size={2} weight="semibold">SEO Audit Results</Text>
          <Flex align="center" gap={3}>
            <Badge 
              tone={getScoreColor(overallScore)} 
              fontSize={1}
              padding={2}
            >
              Score: {overallScore}%
            </Badge>
            <Button
              icon={RefreshIcon}
              mode="ghost"
              onClick={runSEOAudit}
              loading={isLoading}
              text="Refresh"
              fontSize={1}
            />
          </Flex>
        </Flex>

        {/* Overall score indicator */}
        <Box>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e9ecef',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${overallScore}%`,
              height: '100%',
              backgroundColor: overallScore >= 80 ? '#28a745' : overallScore >= 60 ? '#ffc107' : '#dc3545',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <Text size={1} muted style={{ marginTop: '4px' }}>
            {overallScore >= 80 ? 'Excellent SEO optimization!' : 
             overallScore >= 60 ? 'Good SEO, room for improvement' : 
             'Needs significant SEO optimization'}
          </Text>
        </Box>

        {/* Individual checks */}
        <Stack space={3}>
          {checks.map((check, index) => (
            <Card key={index} padding={3} radius={1} tone={getStatusColor(check.status)}>
              <Flex align="flex-start" gap={3}>
                <Box style={{ marginTop: '2px' }}>
                  {getStatusIcon(check.status)}
                </Box>
                <Stack space={2} flex={1}>
                  <Flex align="center" justify="space-between">
                    <Text size={1} weight="medium">{check.name}</Text>
                    <Badge tone={getScoreColor(check.score)} fontSize={0}>
                      {check.score}%
                    </Badge>
                  </Flex>
                  <Text size={1}>{check.message}</Text>
                  {check.recommendation && (
                    <Text size={1} muted style={{ fontStyle: 'italic' }}>
                      💡 {check.recommendation}
                    </Text>
                  )}
                </Stack>
              </Flex>
            </Card>
          ))}
        </Stack>

        {/* Quick tips */}
        <Card padding={3} radius={1} tone="primary">
          <Stack space={2}>
            <Text size={1} weight="medium">💡 Quick SEO Tips:</Text>
            <Text size={1}>
              • Use your focus keyword in the title, first paragraph, and headings<br/>
              • Write compelling meta descriptions that encourage clicks<br/>
              • Structure content with proper headings (H1, H2, H3)<br/>
              • Add internal links to related content<br/>
              • Optimize images with descriptive alt text<br/>
              • Aim for 300+ words of high-quality, readable content
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Card>
  )
}