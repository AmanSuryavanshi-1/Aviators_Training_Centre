import React from 'react'
import {Card, Text, Box, Flex, Stack, Avatar} from '@sanity/ui'
import {urlFor} from '../lib/image'

interface SocialCardPreviewProps {
  document: any
  platform?: 'twitter' | 'facebook' | 'linkedin'
}

export const SocialCardPreview: React.FC<SocialCardPreviewProps> = ({ 
  document, 
  platform = 'twitter' 
}) => {
  const title = document?.seoTitle || document?.title || 'Untitled Post'
  const description = document?.seoDescription || document?.excerpt || 'No description available'
  const imageUrl = document?.mainImage ? urlFor(document.mainImage).width(600).height(315).url() : null
  const siteName = 'Aviators Training Centre'
  const domain = 'aviatorscentre.com'

  const getPlatformStyles = () => {
    switch (platform) {
      case 'facebook':
        return {
          cardWidth: '500px',
          imageHeight: '261px',
          titleSize: 2,
          descriptionSize: 1,
          borderRadius: '8px'
        }
      case 'linkedin':
        return {
          cardWidth: '552px',
          imageHeight: '289px',
          titleSize: 2,
          descriptionSize: 1,
          borderRadius: '4px'
        }
      default: // twitter
        return {
          cardWidth: '504px',
          imageHeight: '263px',
          titleSize: 1,
          descriptionSize: 1,
          borderRadius: '16px'
        }
    }
  }

  const styles = getPlatformStyles()

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - 3) + '...'
  }

  return (
    <Card padding={3} radius={2} shadow={1}>
      <Box marginBottom={3}>
        <Text size={1} weight="semibold">
          {platform.charAt(0).toUpperCase() + platform.slice(1)} Preview
        </Text>
      </Box>

      <Box 
        style={{
          width: styles.cardWidth,
          maxWidth: '100%',
          border: '1px solid #e1e8ed',
          borderRadius: styles.borderRadius,
          overflow: 'hidden',
          backgroundColor: '#fff'
        }}
      >
        {/* Social Card Image */}
        {imageUrl && (
          <Box
            style={{
              width: '100%',
              height: styles.imageHeight,
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#f7f9fa'
            }}
          />
        )}

        {/* Card Content */}
        <Box padding={3}>
          <Stack space={2}>
            {/* Domain */}
            <Text size={0} tone="default" style={{ color: '#657786' }}>
              {domain}
            </Text>

            {/* Title */}
            <Text 
              size={styles.titleSize} 
              weight="semibold" 
              style={{ 
                color: '#14171a',
                lineHeight: '1.3',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {truncateText(title, platform === 'twitter' ? 70 : 95)}
            </Text>

            {/* Description */}
            <Text 
              size={styles.descriptionSize} 
              style={{ 
                color: '#657786',
                lineHeight: '1.3',
                display: '-webkit-box',
                WebkitLineClamp: platform === 'twitter' ? 2 : 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {truncateText(description, platform === 'twitter' ? 125 : 200)}
            </Text>

            {/* Site name for Facebook/LinkedIn */}
            {(platform === 'facebook' || platform === 'linkedin') && (
              <Text size={0} weight="semibold" style={{ color: '#657786' }}>
                {siteName}
              </Text>
            )}
          </Stack>
        </Box>
      </Box>

      {/* Validation Messages */}
      <Box marginTop={3}>
        <Stack space={2}>
          {!imageUrl && (
            <Box padding={2} style={{backgroundColor: '#fff3cd', borderRadius: '4px'}}>
              <Text size={1} tone="caution">
                ⚠️ No featured image - social cards will use default image
              </Text>
            </Box>
          )}
          
          {title.length > (platform === 'twitter' ? 70 : 95) && (
            <Box padding={2} style={{backgroundColor: '#fff3cd', borderRadius: '4px'}}>
              <Text size={1} tone="caution">
                ⚠️ Title may be truncated on {platform}
              </Text>
            </Box>
          )}
          
          {description.length > (platform === 'twitter' ? 125 : 200) && (
            <Box padding={2} style={{backgroundColor: '#fff3cd', borderRadius: '4px'}}>
              <Text size={1} tone="caution">
                ⚠️ Description may be truncated on {platform}
              </Text>
            </Box>
          )}
        </Stack>
      </Box>
    </Card>
  )
}

// Multi-platform preview component
export const SocialPreviewTabs: React.FC<{document: any}> = ({ document }) => {
  const [activeTab, setActiveTab] = React.useState<'twitter' | 'facebook' | 'linkedin'>('twitter')

  return (
    <Card padding={3} radius={2} shadow={1}>
      <Box marginBottom={3}>
        <Text size={1} weight="semibold" marginBottom={3}>
          Social Media Preview
        </Text>
        
        <Flex gap={2}>
          {(['twitter', 'facebook', 'linkedin'] as const).map((platform) => (
            <button
              key={platform}
              onClick={() => setActiveTab(platform)}
              style={{
                padding: '8px 16px',
                border: '1px solid #e1e8ed',
                borderRadius: '4px',
                backgroundColor: activeTab === platform ? '#1976d2' : '#fff',
                color: activeTab === platform ? '#fff' : '#14171a',
                cursor: 'pointer',
                fontSize: '14px',
                textTransform: 'capitalize'
              }}
            >
              {platform}
            </button>
          ))}
        </Flex>
      </Box>

      <SocialCardPreview document={document} platform={activeTab} />
    </Card>
  )
}