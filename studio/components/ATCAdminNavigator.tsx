/**
 * ATC Admin Navigator Component
 * Aviation-themed navigation component for Sanity Studio
 */

import React from 'react';
import { Card, Stack, Button, Text, Box, Flex } from '@sanity/ui';

export function ATCAdminNavigator() {
  const handleNavigateToAdmin = () => {
    // Navigate to admin dashboard in same tab (unified auth)
    window.location.href = '/studio/admin';
  };

  return (
    <Box padding={[4, 5]}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        {/* Header Section */}
        <Box marginBottom={4}>
          <Card padding={[4, 5]} radius={3} tone="default">
            <Flex align="center" justify="space-between" wrap="wrap" gap={4}>
              <Box>
                <Text size={[3, 4]} weight="bold">
                  ✈️ Aviators Training Centre
                </Text>
                <Text size={[1, 2]} tone="default" style={{ marginTop: 6 }}>
                  Admin Dashboard Access Portal
                </Text>
              </Box>
              <Box style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '1px solid rgba(0,0,0,0.06)' }}>
                🚀
              </Box>
            </Flex>
          </Card>
        </Box>

        {/* Main Navigation Card */}
        <Card padding={[4, 5]} radius={3} tone="default">
          <Stack space={[4, 5]}>
            <Box>
              <Text size={[2, 3]} weight="semibold" style={{ color: '#075E68' }}>
                Admin Dashboard Access
              </Text>
              <Text size={[1, 2]} tone="default" style={{ marginTop: 8 }}>
                Access your comprehensive admin dashboard with real-time analytics, content management tools,
                cache control, and system monitoring — all with unified Sanity Studio authentication.
              </Text>
            </Box>

            {/* Features Grid */}
            <Box>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {[
                  { icon: '📊', title: 'Analytics Dashboard', desc: 'Real-time metrics & insights' },
                  { icon: '🔧', title: 'Content Management', desc: 'Blog posts & media control' },
                  { icon: '⚡', title: 'Cache Control', desc: 'Performance optimization' },
                  { icon: '🛡️', title: 'System Monitoring', desc: 'Health & security status' }
                ].map((feature, index) => (
                  <Card key={index} padding={3} radius={2} tone="default">
                    <Text size={2} style={{ fontSize: 18, marginBottom: 6 }}>{feature.icon}</Text>
                    <Text size={1} weight="semibold" style={{ color: '#075E68', marginBottom: 2 }}>
                      {feature.title}
                    </Text>
                    <Text size={0} tone="default">{feature.desc}</Text>
                  </Card>
                ))}
              </div>
            </Box>

            {/* Action Button */}
            <Button
              text="Launch Admin Dashboard"
              tone="primary"
              onClick={handleNavigateToAdmin}
              style={{ width: '100%' }}
            />

            {/* Info Section */}
            <Card padding={3} radius={2} tone="default">
              <Flex align="flex-start" gap={3}>
                <Text style={{ fontSize: 18 }}>✨</Text>
                <Box>
                  <Text size={[1, 2]} weight="semibold" style={{ marginBottom: 2 }}>
                    Unified Authentication
                  </Text>
                  <Text size={[0, 1]} style={{ lineHeight: 1.5 }}>
                    No additional login required. Your current Sanity Studio session automatically provides secure access to all admin dashboard features.
                  </Text>
                </Box>
              </Flex>
            </Card>
          </Stack>
        </Card>

        {/* Footer */}
        <Box marginTop={4} style={{ textAlign: 'center' }}>
          <Text size={0} tone="default">
            Aviators Training Centre • Content Management System
          </Text>
        </Box>
      </div>
    </Box>
  );
}

export default ATCAdminNavigator;