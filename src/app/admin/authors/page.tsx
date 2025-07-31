'use client'

import React, { useState, useEffect } from 'react'
import AuthorManagement from "@/components/features/admin/AuthorManagement";
import { toast } from '@/hooks/use-toast'

interface Author {
  _id: string
  name: string
  slug: { current: string }
  email: string
  image?: {
    asset: {
      url: string
    }
    alt: string
  }
  bio: string
  role: string
  credentials: Array<{
    credential: string
    details?: string
  }>
  experience: {
    totalFlightHours?: number
    yearsExperience?: number
    specializations?: string[]
  }
  authorLevel: 'admin' | 'senior' | 'regular' | 'guest'
  permissions: {
    canPublishDirectly: boolean
    canEditOthersContent: boolean
    canManageCategories: boolean
    canManageCourses: boolean
    requiresApproval: boolean
  }
  contentAreas: string[]
  socialMedia?: {
    linkedin?: string
    twitter?: string
    website?: string
  }
  status: 'active' | 'inactive' | 'suspended'
  joinedDate: string
  lastActive?: string
  notificationPreferences: {
    emailNotifications: boolean
    reviewReminders: boolean
    publishingUpdates: boolean
  }
  stats?: {
    totalPosts: number
    publishedPosts: number
    draftPosts: number
    pendingReview: number
  }
}

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch authors from API
  const fetchAuthors = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/authors')
      const result = await response.json()

      if (result.success) {
        setAuthors(result.data)
        setError(null)
      } else {
        setError(result.error || 'Failed to fetch authors')
        toast({
          title: "Error",
          description: result.error || 'Failed to fetch authors',
          variant: "destructive",
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch authors'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Create new author
  const handleAuthorCreate = async (authorData: Partial<Author>) => {
    try {
      const response = await fetch('/api/admin/authors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authorData),
      })

      const result = await response.json()

      if (result.success) {
        // Refresh authors list
        await fetchAuthors()
        toast({
          title: "Success",
          description: "Author created successfully",
        })
      } else {
        throw new Error(result.error || 'Failed to create author')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create author'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  // Update existing author
  const handleAuthorUpdate = async (author: Author) => {
    try {
      const response = await fetch(`/api/admin/authors/${author._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(author),
      })

      const result = await response.json()

      if (result.success) {
        // Update local state
        setAuthors(prev => 
          prev.map(a => a._id === author._id ? { ...a, ...author } : a)
        )
        toast({
          title: "Success",
          description: "Author updated successfully",
        })
      } else {
        throw new Error(result.error || 'Failed to update author')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update author'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  // Delete author
  const handleAuthorDelete = async (authorId: string) => {
    try {
      const response = await fetch(`/api/admin/authors/${authorId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        // Remove from local state
        setAuthors(prev => prev.filter(a => a._id !== authorId))
        toast({
          title: "Success",
          description: "Author deleted successfully",
        })
      } else {
        throw new Error(result.error || 'Failed to delete author')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete author'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  // Load authors on component mount
  useEffect(() => {
    fetchAuthors()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Authors</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchAuthors}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <AuthorManagement
        authors={authors}
        onAuthorCreate={handleAuthorCreate}
        onAuthorUpdate={handleAuthorUpdate}
        onAuthorDelete={handleAuthorDelete}
      />
    </div>
  )
}
