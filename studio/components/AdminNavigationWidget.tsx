/**
 * ATC Admin Navigation Widget for Sanity Studio
 * Provides seamless navigation to ATC Admin Dashboard
 */

import React from 'react'
import {Card, Text, Box, Stack, Button} from '@sanity/ui'

interface ATCAdminNavigationWidgetProps {
  title?: string
}

export const AdminNavigationWidget: React.FC<ATCAdminNavigationWidgetProps> = ({ 
  title = "ATC Admin" 
}) => {
  const handleNavigateToAdmin = () => {
    // Navigate to studio admin dashboard (same tab since we're already authenticated)
    window.location.href = '/studio/admin'
  }

  return (
    <Card padding={4} radius={2} shadow={1} tone="primary">
      <Stack space={3}>
        <Box>
          <Text size={2} weight="bold">
            ✈️ {title}
          </Text>
          <Text size={1} tone="default" marginTop={2}>
            Access ATC admin dashboard with analytics and system tools
          </Text>
        </Box>

        <Button
          text="🚀 Open ATC Admin Dashboard"
          tone="primary"
          onClick={handleNavigateToAdmin}
          style={{ 
            width: '100%',
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            border: 'none'
          }}
        />

        <Box 
          padding={2} 
          style={{
            backgroundColor: '#f1f3f4',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        >
          <Text size={0} tone="default">
            ✨ Unified authentication - no additional login required
          </Text>
        </Box>
      </Stack>
    </Card>
  )
}

export default AdminNavigationWidget