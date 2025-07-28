import React from 'react'
import {Card, Text, Box, Stack, Badge, Flex} from '@sanity/ui'

export const MediaGuidelines: React.FC = () => {
  const imageSpecs = [
    {
      type: 'Featured Images',
      dimensions: '1200 x 630px',
      format: 'WebP, JPEG',
      maxSize: '500KB',
      description: 'Main blog post images for social sharing',
      aspectRatio: '1.91:1'
    },
    {
      type: 'In-Content Images',
      dimensions: '800 x 450px',
      format: 'WebP, JPEG',
      maxSize: '300KB',
      description: 'Images within blog post content',
      aspectRatio: '16:9'
    },
    {
      type: 'Author Photos',
      dimensions: '400 x 400px',
      format: 'WebP, JPEG',
      maxSize: '150KB',
      description: 'Square profile images for authors',
      aspectRatio: '1:1'
    },
    {
      type: 'Course Images',
      dimensions: '600 x 400px',
      format: 'WebP, JPEG',
      maxSize: '250KB',
      description: 'Course promotional images',
      aspectRatio: '3:2'
    },
  ]

  const bestPractices = [
    {
      title: 'Alt Text Requirements',
      description: 'Always add descriptive alt text for accessibility and SEO',
      icon: '♿'
    },
    {
      title: 'Aviation Focus',
      description: 'Use high-quality aviation-related imagery that supports content',
      icon: '✈️'
    },
    {
      title: 'Brand Consistency',
      description: 'Maintain consistent visual style with website branding',
      icon: '🎨'
    },
    {
      title: 'Performance',
      description: 'Optimize images for web to ensure fast loading times',
      icon: '⚡'
    },
    {
      title: 'Copyright',
      description: 'Only use royalty-free or properly licensed images',
      icon: '⚖️'
    },
    {
      title: 'Mobile Friendly',
      description: 'Ensure images look good on all device sizes',
      icon: '📱'
    },
  ]

  return (
    <Stack space={4}>
      <Card padding={4} radius={2} shadow={1}>
        <Box marginBottom={3}>
          <Text size={2} weight="bold">
            📸 Media Management Guidelines
          </Text>
        </Box>

        <Stack space={3}>
          <Box>
            <Text size={1} weight="semibold" marginBottom={2}>
              Image Specifications
            </Text>
            
            <Stack space={2}>
              {imageSpecs.map((spec, index) => (
                <Card key={index} padding={3} tone="default" radius={1}>
                  <Flex justify="space-between" align="flex-start">
                    <Box flex={1}>
                      <Text size={1} weight="semibold" marginBottom={1}>
                        {spec.type}
                      </Text>
                      <Text size={1} tone="default" marginBottom={1}>
                        {spec.description}
                      </Text>
                    </Box>
                    <Stack space={1}>
                      <Badge tone="primary" fontSize={0}>
                        {spec.dimensions}
                      </Badge>
                      <Badge tone="default" fontSize={0}>
                        {spec.aspectRatio}
                      </Badge>
                      <Badge tone="caution" fontSize={0}>
                        Max {spec.maxSize}
                      </Badge>
                    </Stack>
                  </Flex>
                </Card>
              ))}
            </Stack>
          </Box>

          <Box>
            <Text size={1} weight="semibold" marginBottom={2}>
              Best Practices
            </Text>
            
            <Stack space={2}>
              {bestPractices.map((practice, index) => (
                <Flex key={index} align="flex-start" gap={2}>
                  <Text size={2}>
                    {practice.icon}
                  </Text>
                  <Box>
                    <Text size={1} weight="semibold" marginBottom={1}>
                      {practice.title}
                    </Text>
                    <Text size={1} tone="default">
                      {practice.description}
                    </Text>
                  </Box>
                </Flex>
              ))}
            </Stack>
          </Box>

          <Box padding={3} style={{backgroundColor: '#e6f7ff', borderRadius: '4px'}}>
            <Text size={1} weight="semibold" marginBottom={1}>
              💡 Pro Tips
            </Text>
            <Stack space={1}>
              <Text size={1}>
                • Use the Media Library plugin for organized asset management
              </Text>
              <Text size={1}>
                • Add credit lines for stock photos when required
              </Text>
              <Text size={1}>
                • Consider using aviation-themed stock photos from Unsplash or Pexels
              </Text>
              <Text size={1}>
                • Test images on mobile devices before publishing
              </Text>
              <Text size={1}>
                • Use descriptive filenames for better SEO (e.g., "pilot-training-cockpit.jpg")
              </Text>
            </Stack>
          </Box>
        </Stack>
      </Card>
    </Stack>
  )
}