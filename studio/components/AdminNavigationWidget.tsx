/**
 * Admin Navigation Widget for Sanity Studio
 * Provides seamless navigation between Studio and Admin Dashboard
 */

import React from 'react'
import {Card, Text, Box, Stack, Button, Flex} from '@sanity/ui'
// Temporarily disable navigation utils import due to path issues
// import {navigationUtils} from '../../src/lib/auth/studioAdminAuth'

// Simple navigation functions
const navigationUtils = {
  navigateToAdmin: (path = '') => {
    window.open(`/admin${path}`, '_blank', 'noopener,noreferrer')
  }
}

interface AdminNavigationWidgetProps {
  title?: string
}

export const AdminNavigationWidget: React.FC<AdminNavigationWidgetProps> = ({ 
  title = "Admin Dashboard" 
}) => {
  const handleNavigateToAdmin = () => {
    navigationUtils.navigateToAdmin()
  }

  const handleNavigateToAnalytics = () => {
    navigationUtils.navigateToAdmin('/analytics')
  }

  const handleNavigateToSystemStatus = () => {
    navigationUtils.navigateToAdmin('/system')
  }

  return (
    <Card padding={4} radius={2} shadow={1} tone="primary">
      <Stack space={3}>
        <Box>
          <Text size={2} weight="bold">
            {title}
          </Text>
          <Text size={1} tone="default" marginTop={2}>
            Access analytics, system monitoring, and admin tools
          </Text>
        </Box>

        <Stack space={2}>
          <Button
            text="📊 Open Analytics Dashboard"
            tone="primary"
            onClick={handleNavigateToAnalytics}
            style={{ width: '100%' }}
          />
          
          <Button
            text="🔧 System Status"
            tone="default"
            mode="ghost"
            onClick={handleNavigateToSystemStatus}
            style={{ width: '100%' }}
          />
          
          <Button
            text="⚙️ Full Admin Dashboard"
            tone="default"
            mode="ghost"
            onClick={handleNavigateToAdmin}
            style={{ width: '100%' }}
          />
        </Stack>

        <Box 
          padding={2} 
          style={{
            backgroundColor: '#f1f3f4',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        >
          <Text size={0} tone="default">
            💡 Tip: Use Ctrl+Click (Cmd+Click on Mac) to open in new tab
          </Text>
        </Box>
      </Stack>
    </Card>
  )
}

export default AdminNavigationWidget