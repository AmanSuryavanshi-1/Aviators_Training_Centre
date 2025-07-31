/**
 * Revision History Component for Sanity Studio
 * Shows document revision history with comparison and restore functionality
 */

import React from 'react'
import {Card, Text, Box, Stack} from '@sanity/ui'

export const RevisionHistory: React.FC = () => {
  return (
    <Card padding={4} radius={2} shadow={1}>
      <Stack space={3}>
        <Box>
          <Text size={2} weight="bold">
            📚 Revision History
          </Text>
          <Text size={1} tone="default" marginTop={2}>
            Document revision history will be available here
          </Text>
        </Box>
        
        <Box 
          padding={3} 
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            textAlign: 'center'
          }}
        >
          <Text size={1} tone="default">
            🚧 Feature coming soon
          </Text>
        </Box>
      </Stack>
    </Card>
  )
}

export default RevisionHistory