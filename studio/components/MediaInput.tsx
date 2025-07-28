import React from 'react'
import { ImageInputProps } from 'sanity'

// Enhanced image input with validation and guidelines
export const EnhancedImageInput: React.FC<ImageInputProps> = (props) => {
  const { value, onChange, schemaType } = props
  
  const guidelines = {
    featuredImage: {
      title: 'Featured Image Guidelines',
      recommendations: [
        'Recommended size: 1200x630px (16:9 aspect ratio)',
        'File format: WebP, JPEG, or PNG',
        'File size: Under 500KB for optimal performance',
        'Alt text is required for SEO and accessibility',
      ],
    },
    contentImage: {
      title: 'Content Image Guidelines',
      recommendations: [
        'Maximum width: 1920px',
        'File format: WebP preferred, JPEG or PNG acceptable',
        'File size: Under 1MB',
        'Alt text and caption recommended',
      ],
    },
    openGraphImage: {
      title: 'Open Graph Image Guidelines',
      recommendations: [
        'Required size: 1200x630px (exactly)',
        'File format: JPEG or PNG',
        'Text should be readable at small sizes',
        'Represents the blog post content',
      ],
    },
  }
  
  const getGuidelines = () => {
    if (schemaType.name === 'image' && schemaType.title === 'Featured Image') {
      return guidelines.featuredImage
    }
    if (schemaType.name === 'image' && schemaType.title === 'Open Graph Image') {
      return guidelines.openGraphImage
    }
    return guidelines.contentImage
  }
  
  const currentGuidelines = getGuidelines()
  
  return (
    <div>
      {/* Guidelines Panel */}
      <div style={{
        marginBottom: '16px',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        border: '1px solid #e1e5e9'
      }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>
          {currentGuidelines.title}
        </h4>
        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#666' }}>
          {currentGuidelines.recommendations.map((rec, index) => (
            <li key={index} style={{ marginBottom: '4px' }}>{rec}</li>
          ))}
        </ul>
      </div>
      
      {/* Image Upload Area */}
      <div style={{
        border: '2px dashed #ccc',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: value ? '#f0f9ff' : '#fafafa',
        transition: 'all 0.2s ease',
      }}>
        {value ? (
          <div>
            <div style={{ marginBottom: '12px' }}>
              <img
                src={`${value.asset?._ref ? `https://cdn.sanity.io/images/3u4fa9kl/production/${value.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp')}?w=300&h=200&fit=crop` : ''}`}
                alt={value.alt || 'Preview'}
                style={{
                  maxWidth: '300px',
                  maxHeight: '200px',
                  borderRadius: '4px',
                  objectFit: 'cover'
                }}
              />
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
              {value.alt ? `Alt text: "${value.alt}"` : '⚠️ Alt text missing'}
            </div>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Remove Image
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📸</div>
            <p style={{ margin: '0 0 12px 0', color: '#666' }}>
              Click to upload an image or drag and drop
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
              Supported formats: JPEG, PNG, WebP
            </p>
          </div>
        )}
      </div>
      
      {/* Validation Messages */}
      {value && !value.alt && (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#856404'
        }}>
          ⚠️ Alt text is required for SEO and accessibility
        </div>
      )}
    </div>
  )
}

// Media library component
export const MediaLibraryPanel = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Media Library</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
        marginTop: '20px'
      }}>
        {/* This would be populated with actual media items */}
        <div style={{
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>📁</div>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            Media items will appear here
          </p>
        </div>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h3>Upload Guidelines</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          <div style={{
            padding: '16px',
            border: '1px solid #e1e5e9',
            borderRadius: '8px'
          }}>
            <h4>Featured Images</h4>
            <ul style={{ fontSize: '12px', color: '#666', paddingLeft: '16px' }}>
              <li>Size: 1200x630px</li>
              <li>Format: WebP, JPEG, PNG</li>
              <li>Max size: 500KB</li>
            </ul>
          </div>
          <div style={{
            padding: '16px',
            border: '1px solid #e1e5e9',
            borderRadius: '8px'
          }}>
            <h4>Content Images</h4>
            <ul style={{ fontSize: '12px', color: '#666', paddingLeft: '16px' }}>
              <li>Max width: 1920px</li>
              <li>Format: WebP preferred</li>
              <li>Max size: 1MB</li>
            </ul>
          </div>
          <div style={{
            padding: '16px',
            border: '1px solid #e1e5e9',
            borderRadius: '8px'
          }}>
            <h4>SEO Images</h4>
            <ul style={{ fontSize: '12px', color: '#666', paddingLeft: '16px' }}>
              <li>Open Graph: 1200x630px</li>
              <li>Twitter Card: 1200x600px</li>
              <li>Alt text required</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}