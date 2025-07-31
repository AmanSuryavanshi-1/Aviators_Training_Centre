/**
 * Preview Status Indicator Component for Sanity Studio
 * Shows the preview status of documents
 */

import React from 'react'
import {Badge} from '@sanity/ui'

interface PreviewStatusIndicatorProps {
  document?: any
}

export const PreviewStatusIndicator: React.FC<PreviewStatusIndicatorProps> = ({ document }) => {
  const isDraft = document?._id?.startsWith('drafts.')
  const hasSlug = !!document?.slug?.current
  
  if (!hasSlug) {
    return <Badge tone="critical" fontSize={0}>No Slug</Badge>
  }
  
  if (isDraft) {
    return <Badge tone="caution" fontSize={0}>Draft</Badge>
  }
  
  return <Badge tone="positive" fontSize={0}>Published</Badge>
}

export default PreviewStatusIndicator