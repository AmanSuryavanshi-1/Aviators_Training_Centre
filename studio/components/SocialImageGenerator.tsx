import React, { useState, useEffect } from 'react'
import { Card, Stack, Text, Button, Flex, Select, Box, Spinner } from '@sanity/ui'
import { DownloadIcon, RefreshIcon, EyeOpenIcon } from '@sanity/icons'

interface SocialImageGeneratorProps {
  document: any
}

const TEMPLATE_OPTIONS = [
  { title: 'Default (Teal)', value: 'default' },
  { title: 'Minimal (White)', value: 'minimal' },
  { title: 'Dark (Professional)', value: 'dark' },
  { title: 'Gradient (Eye-catching)', value: 'gradient' },
]

export const SocialImageGenerator: React.FC<SocialImageGeneratorProps> = ({ document }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('default')
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const slug = document?.slug?.current
  const title = document?.seoTitle || document?.title
  const category = document?.category?.title
  const author = document?.author?.name

  // Generate preview URL
  const generatePreviewUrl = (template: string) => {
    if (!slug) return null
    const baseUrl = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'
    return `${baseUrl}/api/social-image?slug=${slug}&template=${template}`
  }

  // Update preview when template changes
  useEffect(() => {
    if (slug) {
      setPreviewUrl(generatePreviewUrl(selectedTemplate))
    }
  }, [selectedTemplate, slug])

  const handleGenerateImage = async () => {
    if (!title) {
      setError('Title is required to generate social image')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const baseUrl = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/social-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          category,
          author,
          template: selectedTemplate,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate image')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      // Create download link
      const a = document.createElement('a')
      a.href = url
      a.download = `social-image-${slug || 'preview'}-${selectedTemplate}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePreviewInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleRefreshPreview = () => {
    if (slug) {
      const newUrl = generatePreviewUrl(selectedTemplate)
      setPreviewUrl(newUrl ? `${newUrl}&t=${Date.now()}` : null)
    }
  }

  if (!title) {
    return (
      <Card padding={4} radius={2} tone="caution">
        <Text size={1}>
          ⚠️ Add a title to your post to generate social media images
        </Text>
      </Card>
    )
  }

  return (
    <Card padding={4} radius={2} shadow={1}>
      <Stack space={4}>
        {/* Header */}
        <Flex align="center" justify="space-between">
          <Text size={2} weight="semibold">Social Media Image Generator</Text>
          <Button
            icon={RefreshIcon}
            mode="ghost"
            onClick={handleRefreshPreview}
            text="Refresh"
            fontSize={1}
          />
        </Flex>

        {/* Template Selection */}
        <Stack space={2}>
          <Text size={1} weight="medium">Template Style</Text>
          <Select
            value={selectedTemplate}
            onChange={(event) => setSelectedTemplate(event.currentTarget.value)}
          >
            {TEMPLATE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.title}
              </option>
            ))}
          </Select>
        </Stack>

        {/* Preview */}
        {previewUrl && (
          <Stack space={2}>
            <Text size={1} weight="medium">Preview (1200x630px)</Text>
            <Box style={{ 
              border: '1px solid #e1e5e9', 
              borderRadius: '4px', 
              overflow: 'hidden',
              backgroundColor: '#f8f9fa'
            }}>
              <img
                src={previewUrl}
                alt="Social media preview"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxWidth: '600px',
                  display: 'block',
                }}
                onError={() => setError('Failed to load preview image')}
              />
            </Box>
          </Stack>
        )}

        {/* Content Info */}
        <Stack space={2}>
          <Text size={1} weight="medium">Content Information</Text>
          <Box style={{ 
            padding: '12px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            <div><strong>Title:</strong> {title}</div>
            {category && <div><strong>Category:</strong> {category}</div>}
            {author && <div><strong>Author:</strong> {author}</div>}
            <div><strong>Template:</strong> {TEMPLATE_OPTIONS.find(t => t.value === selectedTemplate)?.title}</div>
          </Box>
        </Stack>

        {/* Error Display */}
        {error && (
          <Card padding={3} radius={1} tone="critical">
            <Text size={1}>❌ {error}</Text>
          </Card>
        )}

        {/* Action Buttons */}
        <Flex gap={2} wrap="wrap">
          <Button
            icon={DownloadIcon}
            text="Generate & Download"
            tone="primary"
            onClick={handleGenerateImage}
            loading={isGenerating}
            disabled={!title}
          />
          {previewUrl && (
            <Button
              icon={EyeOpenIcon}
              text="Open Preview"
              mode="ghost"
              onClick={handlePreviewInNewTab}
            />
          )}
        </Flex>

        {/* Usage Instructions */}
        <Card padding={3} radius={1} tone="primary">
          <Stack space={2}>
            <Text size={1} weight="medium">💡 How to Use:</Text>
            <Text size={1}>
              1. Select a template style that matches your content<br/>
              2. Preview the generated image above<br/>
              3. Click "Generate & Download" to save the image<br/>
              4. Upload the image to your social media platforms<br/>
              5. Or set it as the Open Graph image in the SEO section
            </Text>
          </Stack>
        </Card>

        {/* Template Descriptions */}
        <Card padding={3} radius={1}>
          <Stack space={2}>
            <Text size={1} weight="medium">Template Guide:</Text>
            <Text size={1}>
              <strong>Default:</strong> Teal background with aviation branding<br/>
              <strong>Minimal:</strong> Clean white background for professional content<br/>
              <strong>Dark:</strong> Dark theme for technical or serious topics<br/>
              <strong>Gradient:</strong> Eye-catching gradient for news and updates
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Card>
  )
}