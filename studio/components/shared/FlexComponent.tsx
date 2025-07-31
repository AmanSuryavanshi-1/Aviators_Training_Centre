import React from 'react'

// Shared Flex component for studio components
export const Flex: React.FC<{
  children: React.ReactNode
  justify?: 'space-between' | 'center' | 'flex-start' | 'flex-end'
  align?: 'center' | 'flex-start' | 'flex-end'
  gap?: number
  wrap?: 'wrap' | 'nowrap'
  marginBottom?: number
}> = ({ children, justify = 'flex-start', align = 'flex-start', gap = 0, wrap = 'nowrap', marginBottom = 0 }) => (
  <div style={{ 
    display: 'flex', 
    justifyContent: justify, 
    alignItems: align,
    gap: `${gap * 4}px`,
    flexWrap: wrap,
    marginBottom: marginBottom ? `${marginBottom * 4}px` : undefined
  }}>
    {children}
  </div>
)