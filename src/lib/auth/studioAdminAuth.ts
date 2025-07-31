/**
 * Shared authentication context for Studio and Admin Dashboard
 * Provides seamless navigation and authentication state management
 */

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor' | 'viewer'
  permissions: string[]
}

export interface AuthContext {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  checkPermission: (permission: string) => boolean
}

export interface LoginCredentials {
  email: string
  password?: string
  provider?: 'google' | 'email'
}

class StudioAdminAuth {
  private user: AuthUser | null = null
  private listeners: Array<(user: AuthUser | null) => void> = []

  constructor() {
    this.initializeAuth()
  }

  private async initializeAuth(): Promise<void> {
    try {
      // Check for existing session
      const storedUser = this.getStoredUser()
      if (storedUser && this.isValidSession(storedUser)) {
        this.user = storedUser
        this.notifyListeners()
      } else {
        // Clear invalid session
        this.clearStoredUser()
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      this.clearStoredUser()
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): AuthUser | null {
    return this.user
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.user !== null && this.isValidSession(this.user)
  }

  /**
   * Login with credentials
   */
  async login(credentials: LoginCredentials): Promise<void> {
    try {
      // In a real implementation, this would authenticate with your auth provider
      // For now, we'll simulate authentication
      
      if (credentials.provider === 'google') {
        // Google SSO authentication
        const user = await this.authenticateWithGoogle(credentials)
        this.setUser(user)
      } else {
        // Email/password authentication
        const user = await this.authenticateWithEmail(credentials)
        this.setUser(user)
      }
    } catch (error) {
      console.error('Login error:', error)
      throw new Error('Authentication failed')
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Clear user session
      this.user = null
      this.clearStoredUser()
      this.notifyListeners()
      
      // Redirect to login if needed
      if (typeof window !== 'undefined') {
        // Only redirect if we're in admin area
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/login'
        }
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  /**
   * Check if user has specific permission
   */
  checkPermission(permission: string): boolean {
    if (!this.user) return false
    
    // Admin has all permissions
    if (this.user.role === 'admin') return true
    
    return this.user.permissions.includes(permission)
  }

  /**
   * Subscribe to auth state changes
   */
  subscribe(listener: (user: AuthUser | null) => void): () => void {
    this.listeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * Generate navigation token for seamless Studio-Admin transitions
   */
  generateNavigationToken(): string {
    if (!this.user) return ''
    
    const payload = {
      userId: this.user.id,
      email: this.user.email,
      role: this.user.role,
      timestamp: Date.now()
    }
    
    // In production, this should be properly signed/encrypted
    return btoa(JSON.stringify(payload))
  }

  /**
   * Validate navigation token
   */
  validateNavigationToken(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token))
      
      // Check if token is recent (within 5 minutes)
      const tokenAge = Date.now() - payload.timestamp
      if (tokenAge > 5 * 60 * 1000) return false
      
      // Check if user matches current session
      return this.user?.id === payload.userId
    } catch {
      return false
    }
  }

  private async authenticateWithGoogle(credentials: LoginCredentials): Promise<AuthUser> {
    // Simulate Google authentication
    // In production, integrate with Google OAuth
    
    return {
      id: 'google-user-123',
      email: credentials.email,
      name: 'Google User',
      role: 'admin',
      permissions: ['read', 'write', 'admin', 'analytics']
    }
  }

  private async authenticateWithEmail(credentials: LoginCredentials): Promise<AuthUser> {
    // Simulate email authentication
    // In production, verify with your auth backend
    
    if (!credentials.password) {
      throw new Error('Password required')
    }
    
    return {
      id: 'email-user-123',
      email: credentials.email,
      name: 'Email User',
      role: 'editor',
      permissions: ['read', 'write']
    }
  }

  private setUser(user: AuthUser): void {
    this.user = user
    this.storeUser(user)
    this.notifyListeners()
  }

  private storeUser(user: AuthUser): void {
    if (typeof window !== 'undefined') {
      const userData = {
        ...user,
        sessionExpiry: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }
      localStorage.setItem('studio-admin-auth', JSON.stringify(userData))
    }
  }

  private getStoredUser(): AuthUser | null {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = localStorage.getItem('studio-admin-auth')
      if (!stored) return null
      
      const userData = JSON.parse(stored)
      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        permissions: userData.permissions
      }
    } catch {
      return null
    }
  }

  private clearStoredUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('studio-admin-auth')
    }
  }

  private isValidSession(user: AuthUser): boolean {
    if (typeof window === 'undefined') return true
    
    try {
      const stored = localStorage.getItem('studio-admin-auth')
      if (!stored) return false
      
      const userData = JSON.parse(stored)
      return userData.sessionExpiry > Date.now()
    } catch {
      return false
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.user)
      } catch (error) {
        console.error('Auth listener error:', error)
      }
    })
  }
}

// Global auth instance
export const studioAdminAuth = new StudioAdminAuth()

// React hook for using auth in components
export function useStudioAdminAuth(): AuthContext {
  const [user, setUser] = React.useState<AuthUser | null>(studioAdminAuth.getCurrentUser())
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    const unsubscribe = studioAdminAuth.subscribe(setUser)
    return unsubscribe
  }, [])

  return {
    user,
    isAuthenticated: studioAdminAuth.isAuthenticated(),
    isLoading,
    login: async (credentials) => {
      setIsLoading(true)
      try {
        await studioAdminAuth.login(credentials)
      } finally {
        setIsLoading(false)
      }
    },
    logout: async () => {
      setIsLoading(true)
      try {
        await studioAdminAuth.logout()
      } finally {
        setIsLoading(false)
      }
    },
    checkPermission: studioAdminAuth.checkPermission.bind(studioAdminAuth)
  }
}

// Navigation utilities
export const navigationUtils = {
  /**
   * Navigate from Studio to Admin with auth context
   */
  navigateToAdmin: (path: string = '') => {
    const token = studioAdminAuth.generateNavigationToken()
    const url = `/admin${path}${path.includes('?') ? '&' : '?'}token=${token}`
    window.open(url, '_blank', 'noopener,noreferrer')
  },

  /**
   * Navigate from Admin to Studio with auth context
   */
  navigateToStudio: (path: string = '') => {
    const token = studioAdminAuth.generateNavigationToken()
    const url = `/studio${path}${path.includes('?') ? '&' : '?'}token=${token}`
    window.open(url, '_blank', 'noopener,noreferrer')
  },

  /**
   * Check if navigation token is valid
   */
  validateToken: (token: string) => {
    return studioAdminAuth.validateNavigationToken(token)
  }
}

export default studioAdminAuth

// Add React import for the hook
import React from 'react'
