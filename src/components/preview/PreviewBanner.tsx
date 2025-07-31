/**
 * Preview Banner Component
 * Shows when viewing draft content in preview mode
 */

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

interface PreviewBannerProps {
  slug?: string
  isDraft?: boolean
}

export const PreviewBanner: React.FC<PreviewBannerProps> = ({ 
  slug, 
  isDraft = false 
}) => {
  const router = useRouter()

  const handleExitPreview = async () => {
    try {
      // Call the preview API to disable preview mode
      const response = await fetch(`/api/preview/${slug}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Redirect to the published version or blog listing
        router.push(slug ? `/blog/${slug}` : '/blog')
        router.refresh()
      } else {
        console.error('Failed to exit preview mode')
      }
    } catch (error) {
      console.error('Error exiting preview mode:', error)
    }
  }

  const handleEditInStudio = () => {
    const studioUrl = slug 
      ? `/studio/desk/post;${slug}`
      : '/studio'
    
    window.open(studioUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg">👁️</span>
              <span className="font-semibold">
                {isDraft ? 'Draft Preview Mode' : 'Preview Mode'}
              </span>
            </div>
            
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <span>•</span>
              <span>
                {isDraft 
                  ? 'You are viewing unpublished content'
                  : 'You are viewing content in preview mode'
                }
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleEditInStudio}
              className="inline-flex items-center px-3 py-1 border border-black text-sm font-medium rounded-md text-black bg-transparent hover:bg-black hover:text-yellow-500 transition-colors duration-200"
            >
              <span className="mr-1">✏️</span>
              Edit in Studio
            </button>
            
            <button
              onClick={handleExitPreview}
              className="inline-flex items-center px-3 py-1 border border-black text-sm font-medium rounded-md text-black bg-transparent hover:bg-black hover:text-yellow-500 transition-colors duration-200"
            >
              <span className="mr-1">✕</span>
              Exit Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreviewBanner
