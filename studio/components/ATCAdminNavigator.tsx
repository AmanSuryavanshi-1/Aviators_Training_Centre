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
    <Box padding={[3, 4, 5]} style={{ minHeight: '100%', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header Section */}
        <Box marginBottom={4}>
          <Card 
            padding={[4, 5, 6]} 
            radius={3} 
            shadow={2}
            style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              color: 'white',
              border: 'none'
            }}
          >
            <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
              <Box>
                <Text size={[3, 4, 5]} weight="bold" style={{ color: 'white' }}>
                  ✈️ Aviators Training Centre
                </Text>
                <Text size={[1, 2, 2]} style={{ color: 'rgba(255,255,255,0.9)', marginTop: '8px' }}>
                  Admin Dashboard Access Portal
                </Text>
              </Box>
              <Box style={{ 
                width: '60px', 
                height: '60px', 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🚀
              </Box>
            </Flex>
          </Card>
        </Box>

        {/* Main Navigation Card */}
        <Card padding={[4, 5, 6]} radius={3} shadow={2} tone="default">
          <Stack space={[4, 5, 6]}>
            <Box>
              <Text size={[2, 3, 3]} weight="bold" style={{ color: '#1e40af' }}>
                Admin Dashboard Access
              </Text>
              <Text size={[1, 2, 2]} tone="default" style={{ marginTop: '8px', lineHeight: '1.6' }}>
                Access your comprehensive admin dashboard with real-time analytics, content management tools, 
                cache control, and system monitoring - all with unified Sanity Studio authentication.
              </Text>
            </Box>

            {/* Features Grid */}
            <Box>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px',
                marginBottom: '24px'
              }}>
                {[
                  { icon: '📊', title: 'Analytics Dashboard', desc: 'Real-time metrics & insights' },
                  { icon: '🔧', title: 'Content Management', desc: 'Blog posts & media control' },
                  { icon: '⚡', title: 'Cache Control', desc: 'Performance optimization' },
                  { icon: '🛡️', title: 'System Monitoring', desc: 'Health & security status' }
                ].map((feature, index) => (
                  <Card key={index} padding={3} radius={2} tone="transparent" style={{ border: '1px solid #e2e8f0' }}>
                    <Text size={2} style={{ fontSize: '20px', marginBottom: '8px' }}>{feature.icon}</Text>
                    <Text size={1} weight="semibold" style={{ color: '#1e40af', marginBottom: '4px' }}>
                      {feature.title}
                    </Text>
                    <Text size={0} tone="default">{feature.desc}</Text>
                  </Card>
                ))}
              </div>
            </Box>

            {/* Action Button */}
            <Button
              text="🚀 Launch Admin Dashboard"
              tone="primary"
              onClick={handleNavigateToAdmin}
              style={{ 
                width: '100%',
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                border: 'none',
                padding: '16px 24px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
                transition: 'all 0.2s ease'
              }}
            />

            {/* Info Section */}
            <Box 
              padding={[3, 4, 4]}
              style={{
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                borderRadius: '12px',
                border: '1px solid #0ea5e9'
              }}
            >
              <Flex align="flex-start" gap={3}>
                <Text style={{ fontSize: '20px' }}>✨</Text>
                <Box>
                  <Text size={[1, 2, 2]} weight="semibold" style={{ color: '#0c4a6e', marginBottom: '4px' }}>
                    Unified Authentication
                  </Text>
                  <Text size={[0, 1, 1]} style={{ color: '#0369a1', lineHeight: '1.5' }}>
                    No additional login required. Your current Sanity Studio session automatically 
                    provides secure access to all admin dashboard features.
                  </Text>
                </Box>
              </Flex>
            </Box>
          </Stack>
        </Card>

        {/* Footer */}
        <Box marginTop={4} style={{ textAlign: 'center' }}>
          <Text size={0} tone="default" style={{ color: '#64748b' }}>
            Aviators Training Centre • Content Management System
          </Text>
        </Box>
      </div>
    </Box>
  );
}

export default ATCAdminNavigator;