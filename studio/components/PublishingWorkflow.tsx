import React from 'react'
import {Card, Text, Button, Flex, Box, Badge, Stack, Select} from '@sanity/ui'

interface PublishingWorkflowProps {
  document: any
  onStatusChange: (status: string) => void
}

export const PublishingWorkflow: React.FC<PublishingWorkflowProps> = ({
  document,
  onStatusChange,
}) => {
  const workflowStatuses = [
    { value: 'draft', label: '✏️ Draft', description: 'Content is being written' },
    { value: 'review', label: '👀 Under Review', description: 'Ready for editorial review' },
    { value: 'approved', label: '✅ Approved', description: 'Approved for publication' },
    { value: 'published', label: '🌐 Published', description: 'Live on the website' },
    { value: 'archived', label: '📦 Archived', description: 'No longer active' },
  ]

  const currentStatus = document?.workflowStatus || 'draft'
  const currentStatusConfig = workflowStatuses.find(s => s.value === currentStatus)

  const getNextActions = (status: string) => {
    switch (status) {
      case 'draft':
        return ['review']
      case 'review':
        return ['approved', 'draft']
      case 'approved':
        return ['published', 'review']
      case 'published':
        return ['archived']
      case 'archived':
        return ['draft']
      default:
        return []
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default'
      case 'review': return 'caution'
      case 'approved': return 'positive'
      case 'published': return 'primary'
      case 'archived': return 'critical'
      default: return 'default'
    }
  }

  const nextActions = getNextActions(currentStatus)

  const handleStatusChange = (newStatus: string) => {
    if (window.confirm(`Change status to ${workflowStatuses.find(s => s.value === newStatus)?.label}?`)) {
      onStatusChange(newStatus)
    }
  }

  const getReadinessChecks = () => {
    const checks = [
      { name: 'Title', passed: !!document?.title },
      { name: 'Content', passed: !!document?.body && document.body.length > 0 },
      { name: 'Excerpt', passed: !!document?.excerpt },
      { name: 'Featured Image', passed: !!document?.image },
      { name: 'Category', passed: !!document?.category },
      { name: 'SEO Title', passed: !!document?.seoTitle },
      { name: 'SEO Description', passed: !!document?.seoDescription },
      { name: 'Slug', passed: !!document?.slug?.current },
    ]

    const passedCount = checks.filter(c => c.passed).length
    const readinessPercentage = Math.round((passedCount / checks.length) * 100)

    return { checks, readinessPercentage, passedCount, totalCount: checks.length }
  }

  const { checks, readinessPercentage, passedCount, totalCount } = getReadinessChecks()

  return (
    <Card padding={3} radius={2} shadow={1}>
      <Stack space={3}>
        <Box>
          <Text size={1} weight="semibold" marginBottom={2}>
            Publishing Workflow
          </Text>
          
          <Flex align="center" gap={2} marginBottom={2}>
            <Badge tone={getStatusColor(currentStatus)} fontSize={1}>
              {currentStatusConfig?.label}
            </Badge>
            <Text size={1} tone="default">
              {currentStatusConfig?.description}
            </Text>
          </Flex>
        </Box>

        <Box>
          <Text size={1} weight="semibold" marginBottom={2}>
            Content Readiness
          </Text>
          
          <Flex align="center" gap={2} marginBottom={2}>
            <Badge 
              tone={readinessPercentage >= 80 ? 'positive' : readinessPercentage >= 60 ? 'caution' : 'critical'} 
              fontSize={1}
            >
              {readinessPercentage}% ({passedCount}/{totalCount})
            </Badge>
          </Flex>

          <Stack space={1}>
            {checks.map((check, index) => (
              <Flex key={index} align="center" justify="space-between">
                <Text size={1}>
                  {check.name}
                </Text>
                <Text size={1} tone={check.passed ? 'positive' : 'critical'}>
                  {check.passed ? '✓' : '✗'}
                </Text>
              </Flex>
            ))}
          </Stack>
        </Box>

        {nextActions.length > 0 && (
          <Box>
            <Text size={1} weight="semibold" marginBottom={2}>
              Available Actions
            </Text>
            
            <Flex gap={2} wrap="wrap">
              {nextActions.map(action => {
                const actionConfig = workflowStatuses.find(s => s.value === action)
                return (
                  <Button
                    key={action}
                    text={actionConfig?.label}
                    tone={action === 'published' ? 'primary' : 'default'}
                    onClick={() => handleStatusChange(action)}
                    disabled={action === 'published' && readinessPercentage < 80}
                  />
                )
              })}
            </Flex>

            {nextActions.includes('published') && readinessPercentage < 80 && (
              <Box marginTop={2} padding={2} style={{backgroundColor: '#fef3cd', borderRadius: '4px'}}>
                <Text size={1} tone="caution">
                  ⚠️ Complete at least 80% of readiness checks before publishing
                </Text>
              </Box>
            )}
          </Box>
        )}

        {document?.reviewNotes && (
          <Box>
            <Text size={1} weight="semibold" marginBottom={1}>
              Review Notes
            </Text>
            <Text size={1} tone="default">
              {document.reviewNotes}
            </Text>
          </Box>
        )}

        {document?.scheduledPublishAt && (
          <Box>
            <Text size={1} weight="semibold" marginBottom={1}>
              Scheduled Publication
            </Text>
            <Text size={1} tone="primary">
              📅 {new Date(document.scheduledPublishAt).toLocaleString()}
            </Text>
          </Box>
        )}
      </Stack>
    </Card>
  )
}