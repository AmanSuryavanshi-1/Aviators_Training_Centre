import React from 'react'
import {Card, Text, Button, Flex, Box} from '@sanity/ui'

interface ContentPreviewProps {
  document: any
  schemaType: string
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({
  document,
  schemaType,
}) => {
  const handlePreview = () => {
    const slug = document?.slug?.current
    if (!slug) {
      alert('Please add a slug to preview this content')
      return
    }

    const baseUrl = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'
    let previewUrl = ''

    switch (schemaType) {
      case 'post':
        previewUrl = `${baseUrl}/blog/${slug}?preview=true`
        break
      case 'course':
        previewUrl = `${baseUrl}/courses/${slug}?preview=true`
        break
      default:
        previewUrl = `${baseUrl}/${slug}?preview=true`
    }

    window.open(previewUrl, '_blank', 'noopener,noreferrer')
  }

  const handleLivePreview = () => {
    const slug = document?.slug?.current
    if (!slug) {
      alert('Please add a slug to preview this content')
      return
    }

    const baseUrl = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'
    let previewUrl = ''

    switch (schemaType) {
      case 'post':
        previewUrl = `${baseUrl}/blog/${slug}`
        break
      case 'course':
        previewUrl = `${baseUrl}/courses/${slug}`
        break
      default:
        previewUrl = `${baseUrl}/${slug}`
    }

    window.open(previewUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <Card padding={3} radius={2} shadow={1}>
      <Box marginBottom={3}>
        <Text size={1} weight="semibold">
          Content Preview
        </Text>
      </Box>
      
      <Flex gap={2}>
        <Button
          text="Preview Draft"
          tone="primary"
          onClick={handlePreview}
          disabled={!document?.slug?.current}
        />
        <Button
          text="View Live"
          tone="default"
          onClick={handleLivePreview}
          disabled={!document?.slug?.current || !document?.publishedAt}
        />
      </Flex>
      
      {!document?.slug?.current && (
        <Box marginTop={2}>
          <Text size={1} tone="caution">
            Add a slug to enable preview functionality
          </Text>
        </Box>
      )}
    </Card>
  )
}