/**
 * Conflict Resolution System for Multi-Author Editing
 * Handles conflicts when multiple authors edit the same content
 */

export interface ContentChange {
  id: string
  timestamp: string
  authorId: string
  authorName: string
  field: string
  oldValue: any
  newValue: any
  changeType: 'create' | 'update' | 'delete'
  conflictsWith?: string[] // IDs of conflicting changes
}

export interface ConflictResolution {
  conflictId: string
  changes: ContentChange[]
  resolutionStrategy: 'manual' | 'auto-merge' | 'latest-wins' | 'author-priority'
  resolvedBy?: string
  resolvedAt?: string
  finalValue: any
  notes?: string
}

export interface EditSession {
  sessionId: string
  authorId: string
  contentId: string
  startTime: string
  lastActivity: string
  changes: ContentChange[]
  isActive: boolean
}

export class ConflictResolutionService {
  /**
   * Detect conflicts between multiple edit sessions
   */
  static detectConflicts(sessions: EditSession[]): ContentChange[] {
    const conflictingChanges: ContentChange[] = []
    const changesByField: Record<string, ContentChange[]> = {}

    // Group changes by field
    sessions.forEach(session => {
      session.changes.forEach(change => {
        if (!changesByField[change.field]) {
          changesByField[change.field] = []
        }
        changesByField[change.field].push(change)
      })
    })

    // Find conflicts within each field
    Object.entries(changesByField).forEach(([field, changes]) => {
      if (changes.length > 1) {
        // Sort by timestamp
        const sortedChanges = changes.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )

        // Check for overlapping changes
        for (let i = 0; i < sortedChanges.length - 1; i++) {
          const current = sortedChanges[i]
          const next = sortedChanges[i + 1]

          // If changes are within 5 minutes and by different authors
          const timeDiff = new Date(next.timestamp).getTime() - new Date(current.timestamp).getTime()
          if (timeDiff < 5 * 60 * 1000 && current.authorId !== next.authorId) {
            // Mark as conflicting
            current.conflictsWith = current.conflictsWith || []
            current.conflictsWith.push(next.id)
            
            next.conflictsWith = next.conflictsWith || []
            next.conflictsWith.push(current.id)

            if (!conflictingChanges.find(c => c.id === current.id)) {
              conflictingChanges.push(current)
            }
            if (!conflictingChanges.find(c => c.id === next.id)) {
              conflictingChanges.push(next)
            }
          }
        }
      }
    })

    return conflictingChanges
  }

  /**
   * Auto-resolve conflicts using different strategies
   */
  static autoResolveConflicts(
    conflicts: ContentChange[],
    strategy: ConflictResolution['resolutionStrategy'],
    authorPriorities?: Record<string, number>
  ): ConflictResolution[] {
    const resolutions: ConflictResolution[] = []
    const processedConflicts = new Set<string>()

    conflicts.forEach(conflict => {
      if (processedConflicts.has(conflict.id)) return

      const relatedConflicts = [conflict]
      conflict.conflictsWith?.forEach(conflictId => {
        const related = conflicts.find(c => c.id === conflictId)
        if (related && !processedConflicts.has(related.id)) {
          relatedConflicts.push(related)
        }
      })

      // Mark all related conflicts as processed
      relatedConflicts.forEach(c => processedConflicts.add(c.id))

      let finalValue: any
      let resolutionStrategy = strategy

      switch (strategy) {
        case 'latest-wins':
          const latest = relatedConflicts.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )[0]
          finalValue = latest.newValue
          break

        case 'author-priority':
          if (authorPriorities) {
            const prioritized = relatedConflicts.sort((a, b) => 
              (authorPriorities[b.authorId] || 0) - (authorPriorities[a.authorId] || 0)
            )[0]
            finalValue = prioritized.newValue
          } else {
            // Fallback to latest-wins
            resolutionStrategy = 'latest-wins'
            const latest = relatedConflicts.sort((a, b) => 
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )[0]
            finalValue = latest.newValue
          }
          break

        case 'auto-merge':
          finalValue = this.attemptAutoMerge(relatedConflicts)
          if (finalValue === null) {
            // Auto-merge failed, require manual resolution
            resolutionStrategy = 'manual'
          }
          break

        default:
          resolutionStrategy = 'manual'
          finalValue = null
      }

      resolutions.push({
        conflictId: `conflict_${Date.now()}_${crypto.randomUUID().slice(0, 9)}`,
        changes: relatedConflicts,
        resolutionStrategy,
        finalValue,
        resolvedAt: resolutionStrategy !== 'manual' ? new Date().toISOString() : undefined
      })
    })

    return resolutions
  }

  /**
   * Attempt to automatically merge conflicting changes
   */
  private static attemptAutoMerge(conflicts: ContentChange[]): any {
    if (conflicts.length === 0) return null

    const field = conflicts[0].field
    const changeType = conflicts[0].changeType

    // Only attempt auto-merge for text fields
    if (typeof conflicts[0].newValue !== 'string') {
      return null
    }

    // For text content, try to merge if changes are in different parts
    if (field === 'body' || field === 'content') {
      return this.mergeTextContent(conflicts)
    }

    // For simple string fields, use latest value
    const latest = conflicts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0]
    
    return latest.newValue
  }

  /**
   * Merge text content from multiple authors
   */
  private static mergeTextContent(conflicts: ContentChange[]): string | null {
    // This is a simplified merge - in a real implementation,
    // you might use a more sophisticated diff/merge algorithm
    
    const baseContent = conflicts[0].oldValue || ''
    const changes = conflicts.map(c => ({
      content: c.newValue,
      author: c.authorName,
      timestamp: c.timestamp
    }))

    // Sort by timestamp
    changes.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    // For now, concatenate changes with author attribution
    let mergedContent = baseContent
    
    changes.forEach(change => {
      if (change.content !== baseContent) {
        mergedContent += `\n\n[Edit by ${change.author}]: ${change.content}`
      }
    })

    return mergedContent
  }

  /**
   * Create manual resolution interface data
   */
  static createManualResolutionData(conflicts: ContentChange[]): {
    field: string
    conflictingValues: Array<{
      value: any
      author: string
      timestamp: string
      changeId: string
    }>
    suggestedResolution?: any
  } {
    const field = conflicts[0].field
    const conflictingValues = conflicts.map(conflict => ({
      value: conflict.newValue,
      author: conflict.authorName,
      timestamp: conflict.timestamp,
      changeId: conflict.id
    }))

    // Suggest the latest change as default
    const latest = conflicts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0]

    return {
      field,
      conflictingValues,
      suggestedResolution: latest.newValue
    }
  }

  /**
   * Apply resolved conflicts to content
   */
  static applyResolutions(
    contentId: string,
    resolutions: ConflictResolution[]
  ): Record<string, any> {
    const updates: Record<string, any> = {}

    resolutions.forEach(resolution => {
      if (resolution.finalValue !== null && resolution.changes.length > 0) {
        const field = resolution.changes[0].field
        updates[field] = resolution.finalValue
      }
    })

    return updates
  }

  /**
   * Get author priority based on their level and permissions
   */
  static getAuthorPriorities(authors: Array<{
    _id: string
    authorLevel: 'admin' | 'senior' | 'regular' | 'guest'
    permissions?: {
      canEditOthersContent?: boolean
      canApproveContent?: boolean
    }
  }>): Record<string, number> {
    const priorities: Record<string, number> = {}

    authors.forEach(author => {
      let priority = 0

      // Base priority from author level
      switch (author.authorLevel) {
        case 'admin':
          priority = 100
          break
        case 'senior':
          priority = 75
          break
        case 'regular':
          priority = 50
          break
        case 'guest':
          priority = 25
          break
      }

      // Bonus for special permissions
      if (author.permissions?.canEditOthersContent) {
        priority += 10
      }
      if (author.permissions?.canApproveContent) {
        priority += 15
      }

      priorities[author._id] = priority
    })

    return priorities
  }

  /**
   * Track edit session activity
   */
  static updateEditSession(
    sessionId: string,
    authorId: string,
    contentId: string,
    changes: ContentChange[]
  ): EditSession {
    return {
      sessionId,
      authorId,
      contentId,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      changes,
      isActive: true
    }
  }

  /**
   * Check if content is currently being edited by others
   */
  static getActiveEditors(
    contentId: string,
    sessions: EditSession[],
    excludeAuthorId?: string
  ): Array<{
    authorId: string
    sessionId: string
    lastActivity: string
    isRecent: boolean
  }> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    
    return sessions
      .filter(session => 
        session.contentId === contentId &&
        session.isActive &&
        session.authorId !== excludeAuthorId
      )
      .map(session => ({
        authorId: session.authorId,
        sessionId: session.sessionId,
        lastActivity: session.lastActivity,
        isRecent: new Date(session.lastActivity) > fiveMinutesAgo
      }))
      .filter(editor => editor.isRecent)
  }
}

export default ConflictResolutionService
