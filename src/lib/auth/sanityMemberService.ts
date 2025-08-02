/**
 * Sanity Member Service
 * Handles validation and management of Sanity project members
 */

import { createClient } from '@sanity/client';

export interface SanityMember {
  id: string;
  email: string;
  displayName: string;
  role: 'administrator' | 'editor';
  isActive: boolean;
  addedDate: string;
  lastActive: string;
}

export interface SanityMemberValidationResult {
  isValid: boolean;
  member?: SanityMember;
  error?: string;
}

export class SanityMemberService {
  private static instance: SanityMemberService;
  private client: any;
  private membersCache: SanityMember[] | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
      token: process.env.SANITY_API_TOKEN!,
      useCdn: false, // Don't use CDN for member data
    });
  }

  static getInstance(): SanityMemberService {
    if (!SanityMemberService.instance) {
      SanityMemberService.instance = new SanityMemberService();
    }
    return SanityMemberService.instance;
  }

  /**
   * Get all project members from Sanity
   */
  async getProjectMembers(forceRefresh = false): Promise<SanityMember[]> {
    const now = Date.now();
    
    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && this.membersCache && now < this.cacheExpiry) {
      return this.membersCache;
    }

    try {
      // Use Sanity Management API to get project members
      const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
      const token = process.env.SANITY_API_TOKEN!;

      const response = await fetch(`https://api.sanity.io/v2021-06-07/projects/${projectId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch members: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform the response to our interface
      const members: SanityMember[] = data.map((member: any) => ({
        id: member.id,
        email: member.email,
        displayName: member.displayName || member.email,
        role: member.role === 'administrator' ? 'administrator' : 'editor',
        isActive: member.isActive !== false, // Default to true if not specified
        addedDate: member.createdAt || new Date().toISOString(),
        lastActive: member.lastSeenAt || new Date().toISOString(),
      }));

      // Update cache
      this.membersCache = members;
      this.cacheExpiry = now + this.CACHE_DURATION;

      console.log(`✅ Fetched ${members.length} Sanity project members`);
      return members;

    } catch (error) {
      console.error('Error fetching Sanity project members:', error);
      
      // Return hardcoded authorized members as fallback
      const fallbackMembers: SanityMember[] = [
        {
          id: 'aman-admin',
          email: 'amanduggyanshi000@gmail.com',
          displayName: 'Aman',
          role: 'administrator',
          isActive: true,
          addedDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        },
        {
          id: 'myst-admin',
          email: 'adude890@gmail.com',
          displayName: 'Myst',
          role: 'administrator',
          isActive: true,
          addedDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        },
      ];

      console.warn('Using fallback member list due to API error');
      this.membersCache = fallbackMembers;
      this.cacheExpiry = now + this.CACHE_DURATION;
      
      return fallbackMembers;
    }
  }

  /**
   * Validate if an email belongs to a Sanity project member
   */
  async validateMemberEmail(email: string): Promise<SanityMemberValidationResult> {
    try {
      const members = await this.getProjectMembers();
      const member = members.find(m => 
        m.email.toLowerCase() === email.toLowerCase() && m.isActive
      );

      if (member) {
        return {
          isValid: true,
          member,
        };
      } else {
        return {
          isValid: false,
          error: 'Email is not associated with an active Sanity project member',
        };
      }
    } catch (error) {
      console.error('Error validating member email:', error);
      return {
        isValid: false,
        error: 'Failed to validate member email',
      };
    }
  }

  /**
   * Get member role by email
   */
  async getMemberRole(email: string): Promise<'administrator' | 'editor' | null> {
    try {
      const validation = await this.validateMemberEmail(email);
      return validation.member?.role || null;
    } catch (error) {
      console.error('Error getting member role:', error);
      return null;
    }
  }

  /**
   * Check if member is active
   */
  async isMemberActive(email: string): Promise<boolean> {
    try {
      const validation = await this.validateMemberEmail(email);
      return validation.isValid && validation.member?.isActive === true;
    } catch (error) {
      console.error('Error checking member status:', error);
      return false;
    }
  }

  /**
   * Get member by email
   */
  async getMemberByEmail(email: string): Promise<SanityMember | null> {
    try {
      const validation = await this.validateMemberEmail(email);
      return validation.member || null;
    } catch (error) {
      console.error('Error getting member by email:', error);
      return null;
    }
  }

  /**
   * Clear the members cache
   */
  clearCache(): void {
    this.membersCache = null;
    this.cacheExpiry = 0;
    console.log('Sanity members cache cleared');
  }

  /**
   * Get cache status
   */
  getCacheStatus(): { isCached: boolean; expiresIn: number; memberCount: number } {
    const now = Date.now();
    return {
      isCached: this.membersCache !== null && now < this.cacheExpiry,
      expiresIn: Math.max(0, this.cacheExpiry - now),
      memberCount: this.membersCache?.length || 0,
    };
  }

  /**
   * Perform health check on the service
   */
  async performHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      canFetchMembers: boolean;
      memberCount: number;
      cacheStatus: any;
      error?: string;
    };
  }> {
    try {
      const members = await this.getProjectMembers(true); // Force refresh for health check
      const cacheStatus = this.getCacheStatus();

      return {
        status: 'healthy',
        details: {
          canFetchMembers: true,
          memberCount: members.length,
          cacheStatus,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          canFetchMembers: false,
          memberCount: 0,
          cacheStatus: this.getCacheStatus(),
          error: (error as Error).message,
        },
      };
    }
  }
}

// Export singleton instance
export const sanityMemberService = SanityMemberService.getInstance();