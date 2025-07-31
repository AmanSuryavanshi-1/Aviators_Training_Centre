/**
 * Studio Navigation Links Component
 * Provides quick navigation links within the studio
 */

import React from 'react'
import {Card, Text, Box, Stack, Button} from '@sanity/ui'

export const StudioNavigationLinks: React.FC = () => {
  return (
    <Card padding={4} radius={2} shadow={1}>
      <Stack space={3}>
        <Box>
          <Text size={2} weight="bold">
            🔗 Quick Navigation
          </Text>
          <Text size={1} tone="default" marginTop={2}>
            Navigate to different sections of your content
          </Text>
        </Box>

        <Stack space={2}>
          <Button
            text="📝 All Blog Posts"
            tone="primary"
            mode="ghost"
            onClick={() => window.location.href = '/studio/desk/post'}
            style={{ width: '100%' }}
          />
          
          <Button
            text="🏷️ Categories"
            tone="default"
            mode="ghost"
            onClick={() => window.location.href = '/studio/desk/category'}
            style={{ width: '100%' }}
          />
          
          <Button
            text="👥 Authors"
            tone="default"
            mode="ghost"
            onClick={() => window.location.href = '/studio/desk/author'}
            style={{ width: '100%' }}
          />
          
          <Button
            text="🎓 Courses"
            tone="default"
            mode="ghost"
            onClick={() => window.location.href = '/studio/desk/course'}
            style={{ width: '100%' }}
          />
        </Stack>
      </Stack>
    </Card>
  )
}

export default StudioNavigationLinks