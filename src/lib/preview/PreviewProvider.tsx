/**
 * Preview Context Provider
 * Manages preview mode state and provides preview utilities
 */

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface PreviewContextType {
  isPreviewMode: boolean
  isDraft: boolean
  previewData: PreviewData | null
  enablePreview: (slug: string, token?: string) => Promise<void>
  disablePreview: () => Promise<void>
  refreshPreview: () => void
}

interface PreviewData {
  slug: string
  timestamp: number
  enabled: boolean
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined)

interface PreviewProviderProps {
  children: React.ReactNode
  initialPreviewData?: PreviewData | null
}

export const PreviewProvider: React.FC<PreviewProviderProps> = ({
  children,
  initialPreviewData = null
}) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isDraft, setIsDraft] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewData | null>(initialPreviewData)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check for preview mode on mount and route changes
    checkPreviewMode()
  }, [pathname])

  const checkPreviewMode = () => {
    // Check if we're in preview mode by looking for preview cookies or URL params
    const urlParams = new URLSearchParams(window.location.search)
    const previewParam = urlParams.get('preview')
    const tokenParam = urlParams.get('token')
    
    // Check cookies (if accessible)
    const hasPreviewCookie = document.cookie.includes('__prerender_bypass')
    
    const inPreviewMode = previewParam === 'true' || hasPreviewCookie
    const isCurrentlyDraft = pathname.includes('/blog/') && (previewParam === 'true' || tokenParam)
    
    setIsPreviewMode(inPreviewMode)
    setIsDraft(isCurrentlyDraft)
    
    if (inPreviewMode && !previewData) {
      // Extract slug from pathname
      const slug = pathname.split('/blog/')[1]
      if (slug) {
        setPreviewData({
          slug,
          timestamp: Date.now(),
          enabled: true
        })
      }
    }
  }

  const enablePreview = async (slug: string, token?: string): Promise<void> => {
    try {
      const previewToken = token || process.env.NEXT_PUBLIC_SANITY_PREVIEW_TOKEN || 'preview'
      
      // Call preview API to enable preview mode
      const response = await fetch(`/api/preview/${slug}?token=${previewToken}`)
      
      if (response.ok) {
        setIsPreviewMode(true)
        setIsDraft(true)
        setPreviewData({
          slug,
          timestamp: Date.now(),
          enabled: true
        })
        
        // Redirect to preview URL
        router.push(`/blog/${slug}?preview=true`)
      } else {
        throw new Error('Failed to enable preview mode')
      }
    } catch (error) {
      console.error('Error enabling preview mode:', error)
      throw error
    }
  }

  const disablePreview = async (): Promise<void> => {
    try {
      const slug = previewData?.slug
      
      // Call preview API to disable preview mode
      if (slug) {
        await fetch(`/api/preview/${slug}`, {
          method: 'DELETE'
        })
      }
      
      setIsPreviewMode(false)
      setIsDraft(false)
      setPreviewData(null)
      
      // Remove preview params from URL
      const url = new URL(window.location.href)
      url.searchParams.delete('preview')
      url.searchParams.delete('token')
      
      // Redirect to clean URL
      router.push(url.pathname)
      router.refresh()
      
    } catch (error) {
      console.error('Error disabling preview mode:', error)
      throw error
    }
  }

  const refreshPreview = () => {
    router.refresh()
  }

  const contextValue: PreviewContextType = {
    isPreviewMode,
    isDraft,
    previewData,
    enablePreview,
    disablePreview,
    refreshPreview
  }

  return (
    <PreviewContext.Provider value={contextValue}>
      {children}
    </PreviewContext.Provider>
  )
}

export const usePreview = (): PreviewContextType => {
  const context = useContext(PreviewContext)
  if (context === undefined) {
    throw new Error('usePreview must be used within a PreviewProvider')
  }
  return context
}

// Server-side preview detection utility
export const getPreviewData = (cookies: string): PreviewData | null => {
  try {
    // Parse preview data from cookies
    const previewCookie = cookies
      .split(';')
      .find(c => c.trim().startsWith('__next_preview_data='))
    
    if (!previewCookie) return null
    
    const previewDataStr = previewCookie.split('=')[1]
    if (!previewDataStr) return null
    
    return JSON.parse(decodeURIComponent(previewDataStr))
  } catch {
    return null
  }
}

// Preview mode detection for server components
export const isPreviewMode = (cookies: string): boolean => {
  return cookies.includes('__prerender_bypass=1')
}

export default PreviewProvider
