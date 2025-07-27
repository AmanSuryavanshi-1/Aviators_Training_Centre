// User roles and permissions configuration
export type UserRole = 'admin' | 'editor' | 'author' | 'contributor'

export interface UserPermissions {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canPublish: boolean
  canManageUsers: boolean
  canAccessAnalytics: boolean
  canManageMedia: boolean
  canManageCategories: boolean
  canManageCourses: boolean
}

// Role-based permissions
export const rolePermissions: Record<UserRole, UserPermissions> = {
  admin: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canPublish: true,
    canManageUsers: true,
    canAccessAnalytics: true,
    canManageMedia: true,
    canManageCategories: true,
    canManageCourses: true,
  },
  editor: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canPublish: true,
    canManageUsers: false,
    canAccessAnalytics: true,
    canManageMedia: true,
    canManageCategories: true,
    canManageCourses: false,
  },
  author: {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canPublish: false,
    canManageUsers: false,
    canAccessAnalytics: false,
    canManageMedia: true,
    canManageCategories: false,
    canManageCourses: false,
  },
  contributor: {
    canCreate: true,
    canEdit: false,
    canDelete: false,
    canPublish: false,
    canManageUsers: false,
    canAccessAnalytics: false,
    canManageMedia: false,
    canManageCategories: false,
    canManageCourses: false,
  },
}

// Document-level permissions
export const documentPermissions = {
  // Blog posts
  post: {
    create: (user: any) => {
      const role = getUserRole(user)
      return rolePermissions[role].canCreate
    },
    update: (user: any, document: any) => {
      const role = getUserRole(user)
      const permissions = rolePermissions[role]
      
      // Authors can only edit their own posts
      if (role === 'author') {
        return document.author?._ref === user.id
      }
      
      // Contributors can't edit after creation
      if (role === 'contributor') {
        return false
      }
      
      return permissions.canEdit
    },
    delete: (user: any, document: any) => {
      const role = getUserRole(user)
      const permissions = rolePermissions[role]
      
      // Authors can't delete posts
      if (role === 'author' || role === 'contributor') {
        return false
      }
      
      return permissions.canDelete
    },
    publish: (user: any) => {
      const role = getUserRole(user)
      return rolePermissions[role].canPublish
    },
  },
  
  // Categories
  category: {
    create: (user: any) => {
      const role = getUserRole(user)
      return rolePermissions[role].canManageCategories
    },
    update: (user: any) => {
      const role = getUserRole(user)
      return rolePermissions[role].canManageCategories
    },
    delete: (user: any) => {
      const role = getUserRole(user)
      return rolePermissions[role].canManageCategories
    },
  },
  
  // Authors
  author: {
    create: (user: any) => {
      const role = getUserRole(user)
      return role === 'admin' || role === 'editor'
    },
    update: (user: any, document: any) => {
      const role = getUserRole(user)
      
      // Users can edit their own profile
      if (document._id === user.id) {
        return true
      }
      
      return role === 'admin' || role === 'editor'
    },
    delete: (user: any) => {
      const role = getUserRole(user)
      return role === 'admin'
    },
  },
  
  // Courses
  course: {
    create: (user: any) => {
      const role = getUserRole(user)
      return rolePermissions[role].canManageCourses
    },
    update: (user: any) => {
      const role = getUserRole(user)
      return rolePermissions[role].canManageCourses
    },
    delete: (user: any) => {
      const role = getUserRole(user)
      return rolePermissions[role].canManageCourses
    },
  },
}

// Helper function to get user role
function getUserRole(user: any): UserRole {
  // This would typically come from your authentication system
  // For now, we'll use a simple email-based role assignment
  const adminEmails = [
    'admin@aviatorstrainingcentre.com',
    'director@aviatorstrainingcentre.com',
  ]
  
  const editorEmails = [
    'editor@aviatorstrainingcentre.com',
    'content@aviatorstrainingcentre.com',
  ]
  
  if (adminEmails.includes(user.email)) {
    return 'admin'
  }
  
  if (editorEmails.includes(user.email)) {
    return 'editor'
  }
  
  // Default role for authenticated users
  return 'author'
}

// Workflow permissions
export const workflowPermissions = {
  canChangeStatus: (user: any, fromStatus: string, toStatus: string) => {
    const role = getUserRole(user)
    
    // Admin and editors can change any status
    if (role === 'admin' || role === 'editor') {
      return true
    }
    
    // Authors can only submit for review
    if (role === 'author') {
      return fromStatus === 'draft' && toStatus === 'review'
    }
    
    // Contributors can only create drafts
    if (role === 'contributor') {
      return fromStatus === 'draft' && toStatus === 'draft'
    }
    
    return false
  },
  
  canApprove: (user: any) => {
    const role = getUserRole(user)
    return role === 'admin' || role === 'editor'
  },
  
  canPublish: (user: any) => {
    const role = getUserRole(user)
    return role === 'admin' || role === 'editor'
  },
}

// Media permissions
export const mediaPermissions = {
  canUpload: (user: any) => {
    const role = getUserRole(user)
    return rolePermissions[role].canManageMedia
  },
  
  canDelete: (user: any) => {
    const role = getUserRole(user)
    return role === 'admin' || role === 'editor'
  },
  
  maxFileSize: (user: any) => {
    const role = getUserRole(user)
    
    // Different file size limits based on role
    switch (role) {
      case 'admin':
      case 'editor':
        return 10 * 1024 * 1024 // 10MB
      case 'author':
        return 5 * 1024 * 1024 // 5MB
      case 'contributor':
        return 2 * 1024 * 1024 // 2MB
      default:
        return 1 * 1024 * 1024 // 1MB
    }
  },
}

// Export permission checker functions
export const checkPermission = {
  canCreateDocument: (user: any, documentType: string) => {
    const permissions = documentPermissions[documentType as keyof typeof documentPermissions]
    return permissions?.create?.(user) || false
  },
  
  canUpdateDocument: (user: any, documentType: string, document: any) => {
    const permissions = documentPermissions[documentType as keyof typeof documentPermissions]
    return permissions?.update?.(user, document) || false
  },
  
  canDeleteDocument: (user: any, documentType: string, document: any) => {
    const permissions = documentPermissions[documentType as keyof typeof documentPermissions]
    return permissions?.delete?.(user, document) || false
  },
  
  canPublishDocument: (user: any, documentType: string) => {
    const permissions = documentPermissions[documentType as keyof typeof documentPermissions]
    return permissions?.publish?.(user) || false
  },
}

// User management utilities
export const userManagement = {
  getUserRole,
  
  canAccessStudio: (user: any) => {
    // All authenticated users can access the studio
    return !!user
  },
  
  getAccessibleDocumentTypes: (user: any) => {
    const role = getUserRole(user)
    const permissions = rolePermissions[role]
    
    const documentTypes = ['post'] // Everyone can access posts
    
    if (permissions.canManageCategories) {
      documentTypes.push('category')
    }
    
    if (permissions.canManageCourses) {
      documentTypes.push('course')
    }
    
    if (role === 'admin' || role === 'editor') {
      documentTypes.push('author')
    }
    
    return documentTypes
  },
  
  getRestrictedFields: (user: any, documentType: string) => {
    const role = getUserRole(user)
    
    // Fields that are restricted based on role
    const restrictedFields: Record<string, string[]> = {
      post: {
        contributor: ['publishedAt', 'featured', 'workflowStatus'],
        author: ['featured', 'workflowStatus'],
        editor: [],
        admin: [],
      }[role] || [],
      
      category: {
        contributor: ['*'], // No access
        author: ['*'], // No access
        editor: [],
        admin: [],
      }[role] || [],
      
      course: {
        contributor: ['*'], // No access
        author: ['*'], // No access
        editor: ['*'], // No access
        admin: [],
      }[role] || [],
    }
    
    return restrictedFields[documentType] || []
  },
}