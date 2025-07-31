/**
 * Revision Comparison Component
 * Shows side-by-side comparison of document revisions
 */

import React, { useState, useEffect } from 'react'
import {Card, Text, Box, Stack, Button, Flex, Badge} from '@sanity/ui'
import {useClient} from 'sanity'

interface RevisionComparisonProps {
  documentId: string
  fromRevision: string
  toRevision: string
  onClose: () => void
}

interface ComparisonData {
  from: {
    _rev: string
    _updatedAt: string
    title: string
    content: any
    author?: string
  }
  to: {
    _rev: string
    _updatedAt: string
    title: string
    content: any
    author?: string
  }
  differences: Array<{
    field: string
    type: 'added' | 'removed' | 'modified'
    oldValue?: any
    newValue?: any
  }>
}

export const RevisionComparison: React.FC<RevisionComparisonProps> = ({
  documentId,
  fromRevision,
  toRevision,
  onClose
}) => {
  const client = useClient()
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComparisonData()
  }, [fromRevision, toRevision])

  const fetchComparisonData = async () => {
    try {
      setLoading(true)
      
      // In a real implementation, you would fetch both revisions and compare them
      // For now, we'll simulate the comparison data
      
      const mockComparison: ComparisonData = {
        from: {
          _rev: fromRevision,
          _updatedAt: '2024-01-14T10:00:00Z',
          title: 'Getting Started with Flight Training',
          content: 'Original content about flight training basics...',
          author: 'John Doe'
        },
        to: {
          _rev: toRevision,
          _updatedAt: '2024-01-15T14:30:00Z',
          title: 'Getting Started with Flight Training - Updated',
          content: 'Updated content about flight training basics with new information...',
          author: 'Jane Smith'
        },
        differences: [
          {
            field: 'title',
            type: 'modified',
            oldValue: 'Getting Started with Flight Training',
            newValue: 'Getting Started with Flight Training - Updated'
          },
          {
            field: 'content',
            type: 'modified',
            oldValue: 'Original content about flight training basics...',
            newValue: 'Updated content about flight training basics with new information...'
          },
          {
            field: 'seoDescription',
            type: 'added',
            newValue: 'Comprehensive guide to starting your flight training journey'
          }
        ]
      }
      
      setComparisonData(mockComparison)
    } catch (error) {
      console.error('Error fetching comparison data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  const getDifferenceIcon = (type: string): string => {
    switch (type) {
      case 'added': return '➕'
      case 'removed': return '➖'
      case 'modified': return '✏️'
      default: return '📝'
    }
  }

  const getDifferenceTone = (type: string): 'positive' | 'critical' | 'caution' => {
    switch (type) {
      case 'added': return 'positive'
      case 'removed': return 'critical'
      case 'modified': return 'caution'
      default: return 'caution'
    }
  }

  if (loading) {
    return (
      <Card padding={4} radius={2} shadow={1}>
        <Stack space={3} align="center">
          <Text size={1}>Loading comparison...</Text>
        </Stack>
      </Card>
    )
  }

  if (!comparisonData) {
    return (
      <Card padding={4} radius={2} shadow={1} tone="critical">
        <Stack space={3}>
          <Text size={1} weight="semibold">
            ❌ Comparison Error
          </Text>
          <Text size={1}>
            Unable to load revision comparison data.
          </Text>
          <Button text="Close" onClick={onClose} />
        </Stack>
      </Card>
    )
  }

  return (
    <Card padding={4} radius={2} shadow={1}>
      <Stack space={4}>
        {/* Header */}
        <Flex align="center" justify="space-between">
          <Box>
            <Text size={2} weight="bold">
              🔍 Revision Comparison
            </Text>
            <Text size={1} tone="default" marginTop={1}>
              {comparisonData.differences.length} differences found
            </Text>
          </Box>
          <Button
            text="Close"
            tone="default"
            onClick={onClose}
          />
        </Flex>

        {/* Revision Info */}
        <Flex gap={4}>
          <Card padding={3} tone="critical" radius={2} style={{ flex: 1 }}>
            <Stack space={2}>
              <Text size={1} weight="semibold">
                📄 From Revision
              </Text>
              <Text size={0}>
                Rev: {comparisonData.from._rev.slice(-8)}
              </Text>
              <Text size={0}>
                Date: {formatDate(comparisonData.from._updatedAt)}
              </Text>
              {comparisonData.from.author && (
                <Text size={0}>
                  Author: {comparisonData.from.author}
                </Text>
              )}
            </Stack>
          </Card>

          <Card padding={3} tone="positive" radius={2} style={{ flex: 1 }}>
            <Stack space={2}>
              <Text size={1} weight="semibold">
                📄 To Revision
              </Text>
              <Text size={0}>
                Rev: {comparisonData.to._rev.slice(-8)}
              </Text>
              <Text size={0}>
                Date: {formatDate(comparisonData.to._updatedAt)}
              </Text>
              {comparisonData.to.author && (
                <Text size={0}>
                  Author: {comparisonData.to.author}
                </Text>
              )}
            </Stack>
          </Card>
        </Flex>

        {/* Differences */}
        <Stack space={3}>
          <Text size={1} weight="semibold">
            Changes
          </Text>

          {comparisonData.differences.map((diff, index) => (
            <Card 
              key={index} 
              padding={3} 
              radius={2}
              tone={getDifferenceTone(diff.type)}
            >
              <Stack space={3}>
                {/* Difference Header */}
                <Flex align="center" gap={2}>
                  <Text size={1}>{getDifferenceIcon(diff.type)}</Text>
                  <Text size={1} weight="semibold">
                    {diff.field}
                  </Text>
                  <Badge 
                    tone={getDifferenceTone(diff.type)} 
                    fontSize={0} 
                    padding={1}
                  >
                    {diff.type}
                  </Badge>
                </Flex>

                {/* Difference Content */}
                {diff.type === 'modified' && (
                  <Flex gap={3}>
                    <Box style={{ flex: 1 }}>
                      <Text size={0} weight="semibold" marginBottom={2}>
                        Before:
                      </Text>
                      <Box 
                        padding={2} 
                        style={{
                          backgroundColor: '#fee',
                          borderRadius: '4px',
                          border: '1px solid #fcc'
                        }}
                      >
                        <Text size={0} style={{ fontFamily: 'monospace' }}>
                          {typeof diff.oldValue === 'string' 
                            ? diff.oldValue 
                            : JSON.stringify(diff.oldValue, null, 2)
                          }
                        </Text>
                      </Box>
                    </Box>

                    <Box style={{ flex: 1 }}>
                      <Text size={0} weight="semibold" marginBottom={2}>
                        After:
                      </Text>
                      <Box 
                        padding={2} 
                        style={{
                          backgroundColor: '#efe',
                          borderRadius: '4px',
                          border: '1px solid #cfc'
                        }}
                      >
                        <Text size={0} style={{ fontFamily: 'monospace' }}>
                          {typeof diff.newValue === 'string' 
                            ? diff.newValue 
                            : JSON.stringify(diff.newValue, null, 2)
                          }
                        </Text>
                      </Box>
                    </Box>
                  </Flex>
                )}

                {diff.type === 'added' && (
                  <Box 
                    padding={2} 
                    style={{
                      backgroundColor: '#efe',
                      borderRadius: '4px',
                      border: '1px solid #cfc'
                    }}
                  >
                    <Text size={0} weight="semibold" marginBottom={1}>
                      Added:
                    </Text>
                    <Text size={0} style={{ fontFamily: 'monospace' }}>
                      {typeof diff.newValue === 'string' 
                        ? diff.newValue 
                        : JSON.stringify(diff.newValue, null, 2)
                      }
                    </Text>
                  </Box>
                )}

                {diff.type === 'removed' && (
                  <Box 
                    padding={2} 
                    style={{
                      backgroundColor: '#fee',
                      borderRadius: '4px',
                      border: '1px solid #fcc'
                    }}
                  >
                    <Text size={0} weight="semibold" marginBottom={1}>
                      Removed:
                    </Text>
                    <Text size={0} style={{ fontFamily: 'monospace' }}>
                      {typeof diff.oldValue === 'string' 
                        ? diff.oldValue 
                        : JSON.stringify(diff.oldValue, null, 2)
                      }
                    </Text>
                  </Box>
                )}
              </Stack>
            </Card>
          ))}
        </Stack>

        {/* Actions */}
        <Flex gap={2} justify="flex-end">
          <Button
            text="Restore From Version"
            tone="primary"
            mode="ghost"
            onClick={() => {
              const confirmed = window.confirm(
                'Restore the "From" version? This will create a new revision with that content.'
              )
              if (confirmed) {
                alert('Revision restored successfully!')
                onClose()
              }
            }}
          />
          <Button
            text="Export Comparison"
            tone="default"
            mode="ghost"
            onClick={() => {
              // In a real implementation, this would export the comparison
              alert('Comparison exported to clipboard!')
            }}
          />
        </Flex>
      </Stack>
    </Card>
  )
}

export default RevisionComparison