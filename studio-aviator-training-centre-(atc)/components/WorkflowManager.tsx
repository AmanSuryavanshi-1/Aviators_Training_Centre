import React, { useState } from 'react'

// Workflow status types
type WorkflowStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived'

interface WorkflowStep {
  status: WorkflowStatus
  title: string
  description: string
  icon: string
  color: string
}

const workflowSteps: WorkflowStep[] = [
  {
    status: 'draft',
    title: 'Draft',
    description: 'Content is being written',
    icon: '✏️',
    color: '#6B7280'
  },
  {
    status: 'review',
    title: 'Under Review',
    description: 'Content is being reviewed',
    icon: '👀',
    color: '#F59E0B'
  },
  {
    status: 'approved',
    title: 'Approved',
    description: 'Content is approved for publishing',
    icon: '✅',
    color: '#10B981'
  },
  {
    status: 'published',
    title: 'Published',
    description: 'Content is live on the website',
    icon: '🌐',
    color: '#3B82F6'
  },
  {
    status: 'archived',
    title: 'Archived',
    description: 'Content is no longer active',
    icon: '📦',
    color: '#6B7280'
  }
]

interface WorkflowManagerProps {
  document: any
  onStatusChange: (status: WorkflowStatus) => void
}

export const WorkflowManager: React.FC<WorkflowManagerProps> = ({ document, onStatusChange }) => {
  const [currentStatus, setCurrentStatus] = useState<WorkflowStatus>(
    document?.workflowStatus || 'draft'
  )
  
  const getCurrentStep = () => {
    return workflowSteps.find(step => step.status === currentStatus) || workflowSteps[0]
  }
  
  const handleStatusChange = (newStatus: WorkflowStatus) => {
    setCurrentStatus(newStatus)
    onStatusChange(newStatus)
  }
  
  const getStatusColor = (status: WorkflowStatus) => {
    const step = workflowSteps.find(s => s.status === status)
    return step?.color || '#6B7280'
  }
  
  return (
    <div style={{ padding: '20px' }}>
      <h3>Content Workflow</h3>
      
      {/* Current Status */}
      <div style={{
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '20px',
        border: `2px solid ${getCurrentStep().color}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '24px', marginRight: '12px' }}>
            {getCurrentStep().icon}
          </span>
          <div>
            <h4 style={{ margin: 0, color: getCurrentStep().color }}>
              {getCurrentStep().title}
            </h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              {getCurrentStep().description}
            </p>
          </div>
        </div>
      </div>
      
      {/* Workflow Steps */}
      <div style={{ marginBottom: '20px' }}>
        <h4>Workflow Progress</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {workflowSteps.map((step, index) => (
            <React.Fragment key={step.status}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  backgroundColor: currentStatus === step.status ? step.color : '#f1f3f4',
                  color: currentStatus === step.status ? 'white' : '#666',
                  fontSize: '12px',
                  fontWeight: currentStatus === step.status ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleStatusChange(step.status)}
              >
                <span style={{ marginRight: '6px' }}>{step.icon}</span>
                {step.title}
              </div>
              {index < workflowSteps.length - 1 && (
                <span style={{ color: '#ccc' }}>→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {currentStatus === 'draft' && (
          <button
            onClick={() => handleStatusChange('review')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#F59E0B',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Submit for Review
          </button>
        )}
        
        {currentStatus === 'review' && (
          <>
            <button
              onClick={() => handleStatusChange('approved')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Approve
            </button>
            <button
              onClick={() => handleStatusChange('draft')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6B7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Send Back to Draft
            </button>
          </>
        )}
        
        {currentStatus === 'approved' && (
          <button
            onClick={() => handleStatusChange('published')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Publish Now
          </button>
        )}
        
        {currentStatus === 'published' && (
          <button
            onClick={() => handleStatusChange('archived')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6B7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Archive
          </button>
        )}
      </div>
      
      {/* Workflow History */}
      <div style={{ marginTop: '30px' }}>
        <h4>Workflow History</h4>
        <div style={{
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#666'
        }}>
          <p style={{ margin: 0 }}>
            📅 Created: {document?._createdAt ? new Date(document._createdAt).toLocaleDateString() : 'Unknown'}
          </p>
          <p style={{ margin: '4px 0 0 0' }}>
            🔄 Last Updated: {document?._updatedAt ? new Date(document._updatedAt).toLocaleDateString() : 'Unknown'}
          </p>
          {document?.publishedAt && (
            <p style={{ margin: '4px 0 0 0' }}>
              🌐 Published: {new Date(document.publishedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      
      {/* Content Checklist */}
      <div style={{ marginTop: '20px' }}>
        <h4>Content Checklist</h4>
        <div style={{ fontSize: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ marginRight: '8px' }}>
              {document?.title ? '✅' : '❌'}
            </span>
            Title is set
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ marginRight: '8px' }}>
              {document?.slug?.current ? '✅' : '❌'}
            </span>
            Slug is configured
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ marginRight: '8px' }}>
              {document?.excerpt ? '✅' : '❌'}
            </span>
            Excerpt is written
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ marginRight: '8px' }}>
              {document?.image ? '✅' : '❌'}
            </span>
            Featured image is uploaded
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ marginRight: '8px' }}>
              {document?.image?.alt ? '✅' : '❌'}
            </span>
            Featured image has alt text
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ marginRight: '8px' }}>
              {document?.category ? '✅' : '❌'}
            </span>
            Category is selected
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ marginRight: '8px' }}>
              {document?.author ? '✅' : '❌'}
            </span>
            Author is assigned
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ marginRight: '8px' }}>
              {document?.body && document.body.length > 0 ? '✅' : '❌'}
            </span>
            Content is written
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ marginRight: '8px' }}>
              {document?.seoTitle ? '✅' : '⚠️'}
            </span>
            SEO title is set (recommended)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ marginRight: '8px' }}>
              {document?.seoDescription ? '✅' : '⚠️'}
            </span>
            SEO description is set (recommended)
          </div>
        </div>
      </div>
    </div>
  )
}

// Workflow status badge component
export const WorkflowStatusBadge: React.FC<{ status: WorkflowStatus }> = ({ status }) => {
  const step = workflowSteps.find(s => s.status === status) || workflowSteps[0]
  
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 8px',
        borderRadius: '12px',
        backgroundColor: step.color,
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold'
      }}
    >
      <span style={{ marginRight: '4px' }}>{step.icon}</span>
      {step.title}
    </span>
  )
}