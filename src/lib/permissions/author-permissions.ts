/**
 * Enhanced Author Permissions System
 * Implements role-based access control for multi-author blog management
 */

export type AuthorLevel = 'admin' | 'senior' | 'regular' | 'guest'

export interface AuthorPermissions {
  canPublishDirectly: boolean
  canEditOthersContent: boolean
  canManageCategories: boolean
  canManageCourses: boolean
  requiresApproval: boolean
  canApproveContent: boolean
  canManageAuthors: boolean
  canAccessAnalytics: boolean
  canManageWorkflows: boolean
  canDeleteContent: boolean
  maxDraftsAllowed: number
  canSchedulePublishing: boolean
  canManageSEO: boolean
  canManageCTAs: boolean
}

export interface ContentAreaPermissions {
  canWrite: boolean
  canEdit: boolean
  canReview: boolean
  requiresExpertReview: boolean
}

export interface WorkflowPermissions {
  canSubmitForReview: boolean
  canApproveReview: boolean
  canRejectContent: boolean
  canRequestRevisions: boolean
  canPublish: boolean
  canUnpublish: boolean
  canArchive: boolean
}

// Author level configurations
export const authorLevelConfig: Record<AuthorLevel, AuthorPermissions> = {
  admin: {
    canPublishDirectly: true,
    canEditOthersContent: true,
    canManageCategories: true,
    canManageCourses: true,
    requiresApproval: false,
    canApproveContent: true,
    canManageAuthors: true,
    canAccessAnalytics: true,
    canManageWorkflows: true,
    canDeleteContent: true,
    maxDraftsAllowed: -1, // Unlimited
    canSchedulePublishing: true,
    canManageSEO: true,
    canManageCTAs: true,
  },
  senior: {
    canPublishDirectly: true,
    canEditOthersContent: true,
    canManageCategories: true,
    canManageCourses: false,
    requiresApproval: false,
    canApproveContent: true,
    canManageAuthors: false,
    canAccessAnalytics: true,
    canManageWorkflows: true,
    canDeleteContent: false,
    maxDraftsAllowed: 50,
    canSchedulePublishing: true,
    canManageSEO: true,
    canManageCTAs: true,
  },
  regular: {
    canPublishDirectly: false,
    canEditOthersContent: false,
    canManageCategories: false,
    canManageCourses: false,
    requiresApproval: true,
    canApproveContent: false,
    canManageAuthors: false,
    canAccessAnalytics: false,
    canManageWorkflows: false,
    canDeleteContent: false,
    maxDraftsAllowed: 20,
    canSchedulePublishing: false,
    canManageSEO: false,
    canManageCTAs: false,
  },
  guest: {
    canPublishDirectly: false,
    canEditOthersContent: false,
    canManageCategories: false,
    canManageCourses: false,
    requiresApproval: true,
    canApproveContent: false,
    canManageAuthors: false,
    canAccessAnalytics: false,
    canManageWorkflows: false,
    canDeleteContent: false,
    maxDraftsAllowed: 5,
    canSchedulePublishing: false,
    canManageSEO: false,
    canManageCTAs: false,
  },
}

// Content area expertise requirements
export const contentAreaConfig: Record<string, { requiresExpertise: boolean; expertLevels: AuthorLevel[] }> = {
  'technical-general': {
    requiresExpertise: true,
    expertLevels: ['admin', 'senior', 'regular']
  },
  'technical-specific': {
    requiresExpertise: true,
    expertLevels: ['admin', 'senior']
  },
  'cpl-ground-school': {
    requiresExpertise: true,
    expertLevels: ['admin', 'senior', 'regular']
  },
  'atpl-ground-school': {
    requiresExpertise: true,
    expertLevels: ['admin', 'senior']
  },
  'type-rating': {
    requiresExpertise: true,
    expertLevels: ['admin', 'senior']
  },
  'career-guidance': {
    requiresExpertise: false,
    expertLevels: ['admin', 'senior', 'regular', 'guest']
  },
  'industry-news': {
    requiresExpertise: false,
    expertLevels: ['admin', 'senior', 'regular']
  },
  'safety-regulations': {
    requiresExpertise: true,
    expertLevels: ['admin', 'senior']
  },
}

export class AuthorPermissionService {
  /**
   * Get permissions for an author based on their level and custom permissions
   */
  static getAuthorPermissions(
    authorLevel: AuthorLevel,
    customPermissions?: Partial<AuthorPermissions>
  ): AuthorPermissions {
    const basePermissions = authorLevelConfig[authorLevel]
    return { ...basePermissions, ...customPermissions }
  }

  /**
   * Check if author can perform a specific action
   */
  static canPerformAction(
    author: { authorLevel: AuthorLevel; permissions?: Partial<AuthorPermissions> },
    action: keyof AuthorPermissions
  ): boolean {
    const permissions = this.getAuthorPermissions(author.authorLevel, author.permissions)
    return permissions[action] as boolean
  }

  /**
   * Check if author can write in a specific content area
   */
  static canWriteInContentArea(
    author: { 
      authorLevel: AuthorLevel
      contentAreas: string[]
      credentials?: Array<{ credential: string; details?: string }>
    },
    contentArea: string
  ): boolean {
    // Check if author is assigned to this content area
    if (!author.contentAreas.includes(contentArea)) {
      return false
    }

    const areaConfig = contentAreaConfig[contentArea]
    if (!areaConfig) {
      return true // Unknown areas are allowed by default
    }

    // Check if author level is sufficient for this content area
    if (!areaConfig.expertLevels.includes(author.authorLevel)) {
      return false
    }

    // For technical areas, check if author has relevant credentials
    if (areaConfig.requiresExpertise && contentArea.includes('technical')) {
      const hasRelevantCredentials = author.credentials?.some(cred => 
        ['ATPL', 'CPL', 'CFI', 'CFII', 'MEI', 'Ground Instructor'].includes(cred.credential)
      )
      return hasRelevantCredentials || author.authorLevel === 'admin'
    }

    return true
  }

  /**
   * Get workflow permissions for an author
   */
  static getWorkflowPermissions(
    author: { authorLevel: AuthorLevel; permissions?: Partial<AuthorPermissions> }
  ): WorkflowPermissions {
    const permissions = this.getAuthorPermissions(author.authorLevel, author.permissions)
    
    return {
      canSubmitForReview: true, // All authors can submit for review
      canApproveReview: permissions.canApproveContent,
      canRejectContent: permissions.canApproveContent,
      canRequestRevisions: permissions.canApproveContent,
      canPublish: permissions.canPublishDirectly,
      canUnpublish: permissions.canEditOthersContent || permissions.canPublishDirectly,
      canArchive: permissions.canDeleteContent,
    }
  }

  /**
   * Check if author can edit specific content
   */
  static canEditContent(
    author: { 
      _id: string
      authorLevel: AuthorLevel
      permissions?: Partial<AuthorPermissions>
      contentAreas: string[]
    },
    content: {
      author?: { _ref: string }
      category?: { title: string }
      workflowStatus?: string
    }
  ): boolean {
    const permissions = this.getAuthorPermissions(author.authorLevel, author.permissions)

    // Admin and senior authors can edit any content
    if (permissions.canEditOthersContent) {
      return true
    }

    // Authors can edit their own content
    if (content.author?._ref === author._id) {
      return true
    }

    // Check if content is in author's content areas and not published
    if (content.category && content.workflowStatus !== 'published') {
      const categoryMapping: Record<string, string> = {
        'Technical General': 'technical-general',
        'Technical Specific': 'technical-specific',
        'CPL Ground School': 'cpl-ground-school',
        'ATPL Ground School': 'atpl-ground-school',
        'Type Rating': 'type-rating',
        'Career Guidance': 'career-guidance',
        'Industry News': 'industry-news',
        'Safety & Regulations': 'safety-regulations',
      }
      
      const contentArea = categoryMapping[content.category.title]
      if (contentArea && author.contentAreas.includes(contentArea)) {
        return this.canWriteInContentArea(author, contentArea)
      }
    }

    return false
  }

  /**
   * Get content creation limits for an author
   */
  static getContentLimits(
    author: { authorLevel: AuthorLevel; permissions?: Partial<AuthorPermissions> }
  ): {
    maxDrafts: number
    canSchedulePublishing: boolean
    requiresApproval: boolean
  } {
    const permissions = this.getAuthorPermissions(author.authorLevel, author.permissions)
    
    return {
      maxDrafts: permissions.maxDraftsAllowed,
      canSchedulePublishing: permissions.canSchedulePublishing,
      requiresApproval: permissions.requiresApproval,
    }
  }

  /**
   * Validate author permissions update
   */
  static validatePermissionsUpdate(
    currentUser: { authorLevel: AuthorLevel },
    targetAuthor: { authorLevel: AuthorLevel },
    newPermissions: Partial<AuthorPermissions>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const currentUserPermissions = this.getAuthorPermissions(currentUser.authorLevel)

    // Only admins can manage other authors
    if (!currentUserPermissions.canManageAuthors) {
      errors.push('Insufficient permissions to manage authors')
      return { valid: false, errors }
    }

    // Can't grant permissions higher than your own level
    const targetPermissions = this.getAuthorPermissions(targetAuthor.authorLevel, newPermissions)
    
    if (targetPermissions.canManageAuthors && !currentUserPermissions.canManageAuthors) {
      errors.push('Cannot grant author management permissions')
    }

    if (targetPermissions.canManageCourses && !currentUserPermissions.canManageCourses) {
      errors.push('Cannot grant course management permissions')
    }

    if (targetPermissions.canDeleteContent && !currentUserPermissions.canDeleteContent) {
      errors.push('Cannot grant content deletion permissions')
    }

    return { valid: errors.length === 0, errors }
  }

  /**
   * Get author dashboard permissions
   */
  static getDashboardPermissions(
    author: { authorLevel: AuthorLevel; permissions?: Partial<AuthorPermissions> }
  ): {
    canViewAnalytics: boolean
    canManageUsers: boolean
    canAccessWorkflows: boolean
    canManageSettings: boolean
    visibleSections: string[]
  } {
    const permissions = this.getAuthorPermissions(author.authorLevel, author.permissions)
    
    const visibleSections = ['my-content', 'drafts']
    
    if (permissions.canAccessAnalytics) {
      visibleSections.push('analytics')
    }
    
    if (permissions.canManageAuthors) {
      visibleSections.push('authors', 'users')
    }
    
    if (permissions.canManageWorkflows) {
      visibleSections.push('workflows', 'approvals')
    }
    
    if (permissions.canManageCategories) {
      visibleSections.push('categories')
    }
    
    if (permissions.canManageCourses) {
      visibleSections.push('courses')
    }

    return {
      canViewAnalytics: permissions.canAccessAnalytics,
      canManageUsers: permissions.canManageAuthors,
      canAccessWorkflows: permissions.canManageWorkflows,
      canManageSettings: permissions.canManageCategories || permissions.canManageCourses,
      visibleSections,
    }
  }
}

export default AuthorPermissionService
