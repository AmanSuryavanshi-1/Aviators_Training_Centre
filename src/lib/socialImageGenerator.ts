import { createCanvas, loadImage, registerFont } from 'canvas'
import path from 'path'

// Social image dimensions
export const SOCIAL_IMAGE_DIMENSIONS = {
  width: 1200,
  height: 630,
}

// Brand colors
const BRAND_COLORS = {
  primary: '#0891b2', // Teal
  secondary: '#1e40af', // Blue
  accent: '#f59e0b', // Amber
  dark: '#1f2937',
  light: '#f8fafc',
  white: '#ffffff',
}

// Template configurations
export interface SocialImageTemplate {
  name: string
  backgroundColor: string
  textColor: string
  accentColor: string
  layout: 'centered' | 'left-aligned' | 'split'
  showLogo: boolean
  showCategory: boolean
  showAuthor: boolean
}

export const SOCIAL_IMAGE_TEMPLATES: Record<string, SocialImageTemplate> = {
  default: {
    name: 'Default',
    backgroundColor: BRAND_COLORS.primary,
    textColor: BRAND_COLORS.white,
    accentColor: BRAND_COLORS.accent,
    layout: 'centered',
    showLogo: true,
    showCategory: true,
    showAuthor: true,
  },
  minimal: {
    name: 'Minimal',
    backgroundColor: BRAND_COLORS.white,
    textColor: BRAND_COLORS.dark,
    accentColor: BRAND_COLORS.primary,
    layout: 'left-aligned',
    showLogo: true,
    showCategory: false,
    showAuthor: false,
  },
  dark: {
    name: 'Dark',
    backgroundColor: BRAND_COLORS.dark,
    textColor: BRAND_COLORS.white,
    accentColor: BRAND_COLORS.accent,
    layout: 'centered',
    showLogo: true,
    showCategory: true,
    showAuthor: true,
  },
  gradient: {
    name: 'Gradient',
    backgroundColor: 'gradient',
    textColor: BRAND_COLORS.white,
    accentColor: BRAND_COLORS.accent,
    layout: 'split',
    showLogo: true,
    showCategory: true,
    showAuthor: true,
  },
}

export interface SocialImageData {
  title: string
  category?: string
  author?: string
  template?: keyof typeof SOCIAL_IMAGE_TEMPLATES
  customBackground?: string
}

// Text wrapping utility
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = words[0]

  for (let i = 1; i < words.length; i++) {
    const word = words[i]
    const width = ctx.measureText(currentLine + ' ' + word).width
    if (width < maxWidth) {
      currentLine += ' ' + word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }
  lines.push(currentLine)
  return lines
}

// Create gradient background
function createGradientBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, BRAND_COLORS.primary)
  gradient.addColorStop(0.5, BRAND_COLORS.secondary)
  gradient.addColorStop(1, BRAND_COLORS.dark)
  return gradient
}

// Draw aviation-themed decorative elements
function drawAviationElements(ctx: CanvasRenderingContext2D, template: SocialImageTemplate) {
  ctx.save()
  ctx.globalAlpha = 0.1
  ctx.strokeStyle = template.accentColor
  ctx.lineWidth = 2

  // Draw subtle aircraft silhouettes or aviation patterns
  const centerX = SOCIAL_IMAGE_DIMENSIONS.width / 2
  const centerY = SOCIAL_IMAGE_DIMENSIONS.height / 2

  // Simple aircraft silhouette
  ctx.beginPath()
  ctx.moveTo(centerX - 100, centerY + 200)
  ctx.lineTo(centerX - 80, centerY + 180)
  ctx.lineTo(centerX + 80, centerY + 180)
  ctx.lineTo(centerX + 100, centerY + 200)
  ctx.moveTo(centerX - 20, centerY + 160)
  ctx.lineTo(centerX + 20, centerY + 160)
  ctx.stroke()

  ctx.restore()
}

// Main image generation function
export async function generateSocialImage(data: SocialImageData): Promise<Buffer> {
  const canvas = createCanvas(SOCIAL_IMAGE_DIMENSIONS.width, SOCIAL_IMAGE_DIMENSIONS.height)
  const ctx = canvas.getContext('2d')

  const template = SOCIAL_IMAGE_TEMPLATES[data.template || 'default']

  // Set background
  if (template.backgroundColor === 'gradient') {
    ctx.fillStyle = createGradientBackground(ctx, SOCIAL_IMAGE_DIMENSIONS.width, SOCIAL_IMAGE_DIMENSIONS.height)
  } else if (data.customBackground) {
    ctx.fillStyle = data.customBackground
  } else {
    ctx.fillStyle = template.backgroundColor
  }
  ctx.fillRect(0, 0, SOCIAL_IMAGE_DIMENSIONS.width, SOCIAL_IMAGE_DIMENSIONS.height)

  // Draw decorative elements
  drawAviationElements(ctx, template)

  // Set up text styling
  ctx.textAlign = template.layout === 'left-aligned' ? 'left' : 'center'
  ctx.fillStyle = template.textColor

  let yPosition = template.layout === 'centered' ? 200 : 150
  const xPosition = template.layout === 'left-aligned' ? 80 : SOCIAL_IMAGE_DIMENSIONS.width / 2
  const maxTextWidth = template.layout === 'left-aligned' ? 800 : 1000

  // Draw logo/brand
  if (template.showLogo) {
    ctx.font = 'bold 32px Arial, sans-serif'
    ctx.fillStyle = template.accentColor
    const logoText = '✈️ Aviators Training Centre'
    ctx.fillText(logoText, xPosition, yPosition)
    yPosition += 60
  }

  // Draw category
  if (template.showCategory && data.category) {
    ctx.font = 'bold 24px Arial, sans-serif'
    ctx.fillStyle = template.accentColor
    ctx.fillText(data.category.toUpperCase(), xPosition, yPosition)
    yPosition += 50
  }

  // Draw title (main content)
  ctx.font = 'bold 48px Arial, sans-serif'
  ctx.fillStyle = template.textColor
  
  const titleLines = wrapText(ctx, data.title, maxTextWidth)
  const lineHeight = 60
  
  // Adjust starting position based on number of lines
  const titleBlockHeight = titleLines.length * lineHeight
  if (template.layout === 'centered') {
    yPosition = (SOCIAL_IMAGE_DIMENSIONS.height - titleBlockHeight) / 2
  }

  titleLines.forEach((line, index) => {
    ctx.fillText(line, xPosition, yPosition + (index * lineHeight))
  })

  yPosition += titleBlockHeight + 40

  // Draw author
  if (template.showAuthor && data.author) {
    ctx.font = '28px Arial, sans-serif'
    ctx.fillStyle = template.textColor
    ctx.globalAlpha = 0.8
    ctx.fillText(`By ${data.author}`, xPosition, yPosition)
    ctx.globalAlpha = 1
  }

  // Add subtle border
  ctx.strokeStyle = template.accentColor
  ctx.lineWidth = 8
  ctx.strokeRect(4, 4, SOCIAL_IMAGE_DIMENSIONS.width - 8, SOCIAL_IMAGE_DIMENSIONS.height - 8)

  return canvas.toBuffer('image/png')
}

// Template preview generator
export async function generateTemplatePreview(templateName: keyof typeof SOCIAL_IMAGE_TEMPLATES): Promise<Buffer> {
  return generateSocialImage({
    title: 'Sample Blog Post Title for Preview',
    category: 'Aviation Training',
    author: 'John Doe',
    template: templateName,
  })
}

// Batch generation for multiple templates
export async function generateMultipleTemplates(data: SocialImageData): Promise<Record<string, Buffer>> {
  const results: Record<string, Buffer> = {}
  
  for (const templateName of Object.keys(SOCIAL_IMAGE_TEMPLATES)) {
    results[templateName] = await generateSocialImage({
      ...data,
      template: templateName as keyof typeof SOCIAL_IMAGE_TEMPLATES,
    })
  }
  
  return results
}

// Utility to get optimal template based on content
export function getOptimalTemplate(data: SocialImageData): keyof typeof SOCIAL_IMAGE_TEMPLATES {
  // Simple logic to choose template based on content
  if (data.title.length > 60) {
    return 'minimal' // Less clutter for long titles
  }
  
  if (data.category?.toLowerCase().includes('technical')) {
    return 'dark' // Professional look for technical content
  }
  
  if (data.category?.toLowerCase().includes('news') || data.category?.toLowerCase().includes('update')) {
    return 'gradient' // Eye-catching for news
  }
  
  return 'default' // Safe default choice
}
