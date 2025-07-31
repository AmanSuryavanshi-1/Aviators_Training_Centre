/**
 * SEO Audit Dashboard Component
 * Displays real-time SEO score and actionable improvement suggestions
 */

import React, { useState, useEffect } from 'react'
import {Card, Text, Box, Stack, Button, Flex, Badge} from '@sanity/ui'
import {SEOAuditor} from '../plugins/seoAuditPlugin'

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

interface SEOAuditDashboardProps {
  document: any
  schemaType: any
}

export const SEOAuditDashboard: React.FC<SEOAuditDashboardProps> = ({
  document,
  schemaType
}) => {
  const [auditResult, setAuditResult] = useState<any>(null)
  const [isAuditing, setIsAuditing] = useState(false)

  // Only show for blog posts
  if (schemaType.name !== 'post') {
    return null
  }

  useEffect(() => {
    // Run audit when document changes
    if (document) {
      runAudit()
    }
  }, [document?.title, document?.seoTitle, document?.seoDescription, document?.focusKeyword, document?.body])

  const runAudit = async () => {
    setIsAuditing(true)
    
    try {
      // Small delay to debounce rapid changes
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const auditor = new SEOAuditor()
      const result = auditor.auditDocument(document)
      setAuditResult(result)
    } catch (error) {
      console.error('SEO audit error:', error)
    } finally {
      setIsAuditing(false)
    }
  }

  const getScoreColor = (score: number): 'positive' | 'caution' | 'critical' => {
    if (score >= 80) return 'positive'
    if (score >= 60) return 'caution'
    return 'critical'
  }

  const getScoreEmoji = (score: number): string => {
    if (score >= 90) return '🚀'
    if (score >= 80) return '✅'
    if (score >= 60) return '⚠️'
    return '❌'
  }

  const getIssueIcon = (type: string): string => {
    switch (type) {
      case 'critical': return '🔴'
      case 'warning': return '⚠️'
      case 'suggestion': return '💡'
      default: return '📝'
    }
  }

  const getIssueTone = (type: string): 'critical' | 'caution' | 'primary' => {
    switch (type) {
      case 'critical': return 'critical'
      case 'warning': return 'caution'
      default: return 'primary'
    }
  }

  if (!auditResult && !isAuditing) {
    return (
      <Card padding={4} radius={2} shadow={1}>
        <Stack space={3} align="center">
          <Text size={1} weight="semibold">
            🔍 SEO Audit
          </Text>
          <Button
            text="Run SEO Audit"
            tone="primary"
            onClick={runAudit}
          />
        </Stack>
      </Card>
    )
  }

  if (isAuditing) {
    return (
      <Card padding={4} radius={2} shadow={1}>
        <Stack space={3} align="center">
          <Text size={1}>Analyzing SEO...</Text>
          <CustomProgressBar value={50} />
        </Stack>
      </Card>
    )
  }

  return (
    <Card padding={4} radius={2} shadow={1}>
      <Stack space={4}>
        {/* Header with Score */}
        <Flex align="center" justify="space-between">
          <Box>
            <Text size={2} weight="bold">
              🔍 SEO Audit Results
            </Text>
            <Text size={1} tone="default" marginTop={1}>
              Last updated: {new Date(auditResult.timestamp).toLocaleTimeString()}
            </Text>
          </Box>
          <Flex align="center" gap={2}>
            <Text size={2}>
              {getScoreEmoji(auditResult.score)}
            </Text>
            <Badge tone={getScoreColor(auditResult.score)} fontSize={1} padding={2}>
              {auditResult.score}/100
            </Badge>
          </Flex>
        </Flex>

        {/* Score Progress Bar */}
        <Box>
          <Flex justify="space-between" align="center" marginBottom={2}>
            <Text size={1} weight="semibold">
              SEO Score
            </Text>
            <Text size={1}>
              {auditResult.score}/100
            </Text>
          </Flex>
          <CustomProgressBar 
            value={auditResult.score} 
            tone={getScoreColor(auditResult.score)}
          />
        </Box>

        {/* Quick Stats */}
        <Flex gap={3}>
          <Card padding={2} tone="critical" radius={2} style={{ flex: 1 }}>
            <Stack space={1} align="center">
              <Text size={1} weight="bold">
                {auditResult.issues.filter((i: any) => i.type === 'critical').length}
              </Text>
              <Text size={0}>Critical</Text>
            </Stack>
          </Card>
          
          <Card padding={2} tone="caution" radius={2} style={{ flex: 1 }}>
            <Stack space={1} align="center">
              <Text size={1} weight="bold">
                {auditResult.issues.filter((i: any) => i.type === 'warning').length}
              </Text>
              <Text size={0}>Warnings</Text>
            </Stack>
          </Card>
          
          <Card padding={2} tone="positive" radius={2} style={{ flex: 1 }}>
            <Stack space={1} align="center">
              <Text size={1} weight="bold">
                {auditResult.passedChecks.length}
              </Text>
              <Text size={0}>Passed</Text>
            </Stack>
          </Card>
        </Flex>

        {/* Critical Issues */}
        {auditResult.issues.filter((i: any) => i.type === 'critical').length > 0 && (
          <Box>
            <Text size={1} weight="semibold" marginBottom={2}>
              🔴 Critical Issues
            </Text>
            <Stack space={2}>
              {auditResult.issues
                .filter((issue: any) => issue.type === 'critical')
                .slice(0, 3)
                .map((issue: any, index: number) => (
                <Box 
                  key={index}
                  padding={2} 
                  style={{
                    backgroundColor: '#fee',
                    borderRadius: '4px',
                    borderLeft: '4px solid #dc3545'
                  }}
                >
                  <Text size={0} weight="semibold" marginBottom={1}>
                    {getIssueIcon(issue.type)} {issue.message}
                  </Text>
                  {issue.suggestion && (
                    <Text size={0} tone="default">
                      💡 {issue.suggestion}
                    </Text>
                  )}
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* Top Recommendations */}
        {auditResult.recommendations.length > 0 && (
          <Box>
            <Text size={1} weight="semibold" marginBottom={2}>
              💡 Top Recommendations
            </Text>
            <Stack space={1}>
              {auditResult.recommendations.slice(0, 3).map((rec: string, index: number) => (
                <Box 
                  key={index}
                  padding={2} 
                  style={{
                    backgroundColor: '#e8f4fd',
                    borderRadius: '4px',
                    borderLeft: '4px solid #0066cc'
                  }}
                >
                  <Text size={0}>
                    {rec}
                  </Text>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* Passed Checks */}
        {auditResult.passedChecks.length > 0 && (
          <Box>
            <Text size={1} weight="semibold" marginBottom={2}>
              ✅ What's Working Well
            </Text>
            <Stack space={1}>
              {auditResult.passedChecks.slice(0, 3).map((check: string, index: number) => (
                <Flex key={index} align="center" gap={2}>
                  <Text size={0}>✅</Text>
                  <Text size={0}>{check}</Text>
                </Flex>
              ))}
              {auditResult.passedChecks.length > 3 && (
                <Text size={0} tone="default" style={{ fontStyle: 'italic' }}>
                  +{auditResult.passedChecks.length - 3} more checks passed
                </Text>
              )}
            </Stack>
          </Box>
        )}

        {/* Actions */}
        <Flex gap={2}>
          <Button
            text="Refresh Audit"
            tone="primary"
            mode="ghost"
            onClick={runAudit}
            disabled={isAuditing}
          />
          
          <Button
            text="View Full Report"
            tone="default"
            mode="ghost"
            onClick={() => {
              // Show detailed audit report
              let report = `SEO Audit Report\n\n`
              report += `Score: ${auditResult.score}/100\n\n`
              
              if (auditResult.issues.length > 0) {
                report += `Issues (${auditResult.issues.length}):\n`
                auditResult.issues.forEach((issue: any, i: number) => {
                  report += `${i + 1}. ${getIssueIcon(issue.type)} ${issue.message}\n`
                  if (issue.suggestion) {
                    report += `   💡 ${issue.suggestion}\n`
                  }
                })
                report += '\n'
              }
              
              if (auditResult.passedChecks.length > 0) {
                report += `Passed Checks (${auditResult.passedChecks.length}):\n`
                auditResult.passedChecks.forEach((check: string, i: number) => {
                  report += `${i + 1}. ✅ ${check}\n`
                })
              }
              
              alert(report)
            }}
          />
        </Flex>

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
            SEO audit runs automatically when you make changes to content
          </Text>
        </Box>
      </Stack>
    </Card>
  )
}

export default SEOAuditDashboard