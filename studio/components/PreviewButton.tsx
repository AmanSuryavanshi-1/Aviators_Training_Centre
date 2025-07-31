/**
 * Preview Button Component for Sanity Studio
 * Provides preview functionality for documents
 */

import React from 'react'
import {Button} from '@sanity/ui'

interface PreviewButtonProps {
  document?: any
}

export const PreviewButton: React.FC<PreviewButtonProps> = ({ document }) => {
  const handlePreview = () => {
    if (document?.slug?.current) {
      const previewUrl = `/blog/${document.slug.current}?preview=true`
      window.open(previewUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <Button
      text="👁️ Preview"
      tone="primary"
      mode="ghost"
      onClick={handlePreview}
      disabled={!document?.slug?.current}
    />
  )
}

export default PreviewButton