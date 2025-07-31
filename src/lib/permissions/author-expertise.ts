/**
 * Author Expertise Validation Service
 * Validates author credentials and expertise for content areas
 */

export interface CredentialValidation {
  credential: string
  isValid: boolean
  verificationRequired: boolean
  expiryDate?: string
  issuer?: string
  verificationStatus: 'pending' | 'verified' | 'expired' | 'invalid'
}

export interface ExpertiseAssessment {
  contentArea: string
  qualified: boolean
  expertiseLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  requiredCredentials: string[]
  missingCredentials: string[]
  recommendations: string[]
}

export interface AuthorExpertiseProfile {
  authorId: string
  overallExpertiseScore: number
  contentAreaExpertise: Record<string, ExpertiseAssessment>
  credentialValidations: CredentialValidation[]
  lastAssessment: string
  nextReviewDate: string
}

// Credential requirements for different content areas
const contentAreaRequirements: Record<string, {
  requiredCredentials: string[]
  preferredCredentials: string[]
  minimumExperience: {
    flightHours?: number
    yearsExperience?: number
    instructorHours?: number
  }
  expertiseLevel: 'basic' | 'intermediate' | 'advanced' | 'expert'
}> = {
  'technical-general': {
    requiredCredentials: ['PPL', 'CPL', 'ATPL'],
    preferredCredentials: ['Ground Instructor', 'CFI'],
    minimumExperience: {
      flightHours: 250,
      yearsExperience: 2
    },
    expertiseLevel: 'intermediate'
  },
  'technical-specific': {
    requiredCredentials: ['CPL', 'ATPL'],
    preferredCredentials: ['CFI', 'CFII', 'MEI'],
    minimumExperience: {
      flightHours: 1000,
      yearsExperience: 3,
      instructorHours: 100
    },
    expertiseLevel: 'advanced'
  },
  'cpl-ground-school': {
    requiredCredentials: ['CPL', 'ATPL'],
    preferredCredentials: ['Ground Instructor', 'CFI'],
    minimumExperience: {
      flightHours: 250,
      yearsExperience: 2
    },
    expertiseLevel: 'intermediate'
  },
  'atpl-ground-school': {
    requiredCredentials: ['ATPL'],
    preferredCredentials: ['CFI', 'CFII', 'MEI'],
    minimumExperience: {
      flightHours: 1500,
      yearsExperience: 5,
      instructorHours: 200
    },
    expertiseLevel: 'expert'
  },
  'type-rating': {
    requiredCredentials: ['ATPL', 'Type Rating'],
    preferredCredentials: ['CFI', 'MEI'],
    minimumExperience: {
      flightHours: 2000,
      yearsExperience: 5
    },
    expertiseLevel: 'expert'
  },
  'career-guidance': {
    requiredCredentials: [],
    preferredCredentials: ['CPL', 'ATPL', 'CFI'],
    minimumExperience: {
      yearsExperience: 3
    },
    expertiseLevel: 'basic'
  },
  'industry-news': {
    requiredCredentials: [],
    preferredCredentials: ['CPL', 'ATPL'],
    minimumExperience: {
      yearsExperience: 2
    },
    expertiseLevel: 'basic'
  },
  'safety-regulations': {
    requiredCredentials: ['CPL', 'ATPL'],
    preferredCredentials: ['CFI', 'Ground Instructor'],
    minimumExperience: {
      flightHours: 500,
      yearsExperience: 3
    },
    expertiseLevel: 'advanced'
  }
}

// Credential validation rules
const credentialValidationRules: Record<string, {
  requiresVerification: boolean
  validityPeriod?: number // in months
  issuingAuthorities: string[]
  verificationMethod: 'document' | 'database' | 'manual'
}> = {
  'ATPL': {
    requiresVerification: true,
    validityPeriod: 24,
    issuingAuthorities: ['DGCA', 'FAA', 'EASA'],
    verificationMethod: 'document'
  },
  'CPL': {
    requiresVerification: true,
    validityPeriod: 24,
    issuingAuthorities: ['DGCA', 'FAA', 'EASA'],
    verificationMethod: 'document'
  },
  'PPL': {
    requiresVerification: true,
    validityPeriod: 24,
    issuingAuthorities: ['DGCA', 'FAA', 'EASA'],
    verificationMethod: 'document'
  },
  'CFI': {
    requiresVerification: true,
    validityPeriod: 24,
    issuingAuthorities: ['DGCA', 'FAA'],
    verificationMethod: 'document'
  },
  'CFII': {
    requiresVerification: true,
    validityPeriod: 24,
    issuingAuthorities: ['DGCA', 'FAA'],
    verificationMethod: 'document'
  },
  'MEI': {
    requiresVerification: true,
    validityPeriod: 24,
    issuingAuthorities: ['DGCA', 'FAA'],
    verificationMethod: 'document'
  },
  'Type Rating': {
    requiresVerification: true,
    validityPeriod: 12,
    issuingAuthorities: ['DGCA', 'FAA', 'EASA'],
    verificationMethod: 'document'
  },
  'Ground Instructor': {
    requiresVerification: true,
    validityPeriod: 24,
    issuingAuthorities: ['DGCA', 'FAA'],
    verificationMethod: 'document'
  }
}

export class AuthorExpertiseService {
  /**
   * Validate a single credential
   */
  static validateCredential(credential: {
    credential: string
    details?: string
    issueDate?: string
    expiryDate?: string
    verified: boolean
  }): CredentialValidation {
    const rules = credentialValidationRules[credential.credential]
    
    if (!rules) {
      return {
        credential: credential.credential,
        isValid: false,
        verificationRequired: false,
        verificationStatus: 'invalid'
      }
    }

    let verificationStatus: CredentialValidation['verificationStatus'] = 'pending'
    
    if (credential.verified) {
      verificationStatus = 'verified'
    }

    // Check expiry
    if (credential.expiryDate) {
      const expiryDate = new Date(credential.expiryDate)
      const now = new Date()
      
      if (expiryDate < now) {
        verificationStatus = 'expired'
      }
    }

    return {
      credential: credential.credential,
      isValid: verificationStatus === 'verified',
      verificationRequired: rules.requiresVerification,
      expiryDate: credential.expiryDate,
      verificationStatus
    }
  }

  /**
   * Assess author expertise for a specific content area
   */
  static assessContentAreaExpertise(
    author: {
      credentials: Array<{
        credential: string
        details?: string
        verified: boolean
      }>
      experience?: {
        totalFlightHours?: number
        yearsExperience?: number
        instructorHours?: number
      }
    },
    contentArea: string
  ): ExpertiseAssessment {
    const requirements = contentAreaRequirements[contentArea]
    
    if (!requirements) {
      return {
        contentArea,
        qualified: false,
        expertiseLevel: 'beginner',
        requiredCredentials: [],
        missingCredentials: [],
        recommendations: [`Content area '${contentArea}' not recognized`]
      }
    }

    const authorCredentials = author.credentials
      .filter(cred => cred.verified)
      .map(cred => cred.credential)

    // Check required credentials
    const missingRequired = requirements.requiredCredentials.filter(
      req => !authorCredentials.includes(req)
    )

    // Check preferred credentials
    const hasPreferred = requirements.preferredCredentials.some(
      pref => authorCredentials.includes(pref)
    )

    // Check experience requirements
    const experienceQualified = this.checkExperienceRequirements(
      author.experience || {},
      requirements.minimumExperience
    )

    // Determine qualification status
    const hasRequiredCredentials = missingRequired.length === 0
    const qualified = hasRequiredCredentials && experienceQualified.qualified

    // Determine expertise level
    let expertiseLevel: ExpertiseAssessment['expertiseLevel'] = 'beginner'
    
    if (qualified) {
      if (hasPreferred && experienceQualified.exceeds) {
        expertiseLevel = 'expert'
      } else if (hasPreferred || experienceQualified.exceeds) {
        expertiseLevel = 'advanced'
      } else {
        expertiseLevel = 'intermediate'
      }
    }

    // Generate recommendations
    const recommendations: string[] = []
    
    if (missingRequired.length > 0) {
      recommendations.push(`Obtain required credentials: ${missingRequired.join(', ')}`)
    }
    
    if (!hasPreferred && qualified) {
      recommendations.push(`Consider obtaining preferred credentials: ${requirements.preferredCredentials.join(', ')}`)
    }
    
    if (!experienceQualified.qualified) {
      recommendations.push(...experienceQualified.recommendations)
    }

    return {
      contentArea,
      qualified,
      expertiseLevel,
      requiredCredentials: requirements.requiredCredentials,
      missingCredentials: missingRequired,
      recommendations
    }
  }

  /**
   * Generate complete expertise profile for an author
   */
  static generateExpertiseProfile(
    author: {
      _id: string
      credentials: Array<{
        credential: string
        details?: string
        verified: boolean
        issueDate?: string
        expiryDate?: string
      }>
      experience?: {
        totalFlightHours?: number
        yearsExperience?: number
        instructorHours?: number
      }
      contentAreas: string[]
    }
  ): AuthorExpertiseProfile {
    // Validate all credentials
    const credentialValidations = author.credentials.map(cred => 
      this.validateCredential(cred)
    )

    // Assess expertise for each content area
    const contentAreaExpertise: Record<string, ExpertiseAssessment> = {}
    
    for (const area of author.contentAreas) {
      contentAreaExpertise[area] = this.assessContentAreaExpertise(author, area)
    }

    // Calculate overall expertise score
    const overallExpertiseScore = this.calculateOverallExpertiseScore(
      credentialValidations,
      Object.values(contentAreaExpertise),
      author.experience || {}
    )

    // Calculate next review date (6 months from now)
    const nextReviewDate = new Date()
    nextReviewDate.setMonth(nextReviewDate.getMonth() + 6)

    return {
      authorId: author._id,
      overallExpertiseScore,
      contentAreaExpertise,
      credentialValidations,
      lastAssessment: new Date().toISOString(),
      nextReviewDate: nextReviewDate.toISOString()
    }
  }

  /**
   * Check if author meets experience requirements
   */
  private static checkExperienceRequirements(
    experience: {
      totalFlightHours?: number
      yearsExperience?: number
      instructorHours?: number
    },
    requirements: {
      flightHours?: number
      yearsExperience?: number
      instructorHours?: number
    }
  ): {
    qualified: boolean
    exceeds: boolean
    recommendations: string[]
  } {
    const recommendations: string[] = []
    let qualified = true
    let exceeds = true

    if (requirements.flightHours && (!experience.totalFlightHours || experience.totalFlightHours < requirements.flightHours)) {
      qualified = false
      exceeds = false
      const needed = requirements.flightHours - (experience.totalFlightHours || 0)
      recommendations.push(`Gain ${needed} more flight hours (minimum ${requirements.flightHours} required)`)
    }

    if (requirements.yearsExperience && (!experience.yearsExperience || experience.yearsExperience < requirements.yearsExperience)) {
      qualified = false
      exceeds = false
      const needed = requirements.yearsExperience - (experience.yearsExperience || 0)
      recommendations.push(`Gain ${needed} more years of experience (minimum ${requirements.yearsExperience} required)`)
    }

    if (requirements.instructorHours && (!experience.instructorHours || experience.instructorHours < requirements.instructorHours)) {
      qualified = false
      exceeds = false
      const needed = requirements.instructorHours - (experience.instructorHours || 0)
      recommendations.push(`Gain ${needed} more instructor hours (minimum ${requirements.instructorHours} required)`)
    }

    // Check if exceeds requirements significantly
    if (qualified) {
      if (requirements.flightHours && experience.totalFlightHours && experience.totalFlightHours < requirements.flightHours * 2) {
        exceeds = false
      }
      if (requirements.yearsExperience && experience.yearsExperience && experience.yearsExperience < requirements.yearsExperience * 1.5) {
        exceeds = false
      }
    }

    return { qualified, exceeds, recommendations }
  }

  /**
   * Calculate overall expertise score
   */
  private static calculateOverallExpertiseScore(
    credentialValidations: CredentialValidation[],
    contentAreaAssessments: ExpertiseAssessment[],
    experience: {
      totalFlightHours?: number
      yearsExperience?: number
      instructorHours?: number
    }
  ): number {
    let score = 0

    // Credential score (40% of total)
    const validCredentials = credentialValidations.filter(cred => cred.isValid).length
    const totalCredentials = credentialValidations.length
    const credentialScore = totalCredentials > 0 ? (validCredentials / totalCredentials) * 40 : 0
    score += credentialScore

    // Content area expertise score (35% of total)
    const qualifiedAreas = contentAreaAssessments.filter(assessment => assessment.qualified).length
    const totalAreas = contentAreaAssessments.length
    const areaScore = totalAreas > 0 ? (qualifiedAreas / totalAreas) * 35 : 0
    score += areaScore

    // Experience score (25% of total)
    let experienceScore = 0
    if (experience.totalFlightHours) {
      if (experience.totalFlightHours >= 10000) experienceScore += 10
      else if (experience.totalFlightHours >= 5000) experienceScore += 8
      else if (experience.totalFlightHours >= 1000) experienceScore += 6
      else if (experience.totalFlightHours >= 500) experienceScore += 4
      else experienceScore += 2
    }
    
    if (experience.yearsExperience) {
      if (experience.yearsExperience >= 20) experienceScore += 10
      else if (experience.yearsExperience >= 10) experienceScore += 8
      else if (experience.yearsExperience >= 5) experienceScore += 6
      else experienceScore += 4
    }
    
    if (experience.instructorHours) {
      if (experience.instructorHours >= 1000) experienceScore += 5
      else if (experience.instructorHours >= 500) experienceScore += 3
      else if (experience.instructorHours >= 100) experienceScore += 2
      else experienceScore += 1
    }

    score += Math.min(25, experienceScore)

    return Math.round(Math.min(100, score))
  }

  /**
   * Get recommendations for improving expertise
   */
  static getExpertiseRecommendations(profile: AuthorExpertiseProfile): {
    priority: 'high' | 'medium' | 'low'
    category: 'credentials' | 'experience' | 'content'
    recommendation: string
    impact: string
  }[] {
    const recommendations: Array<{
      priority: 'high' | 'medium' | 'low'
      category: 'credentials' | 'experience' | 'content'
      recommendation: string
      impact: string
    }> = []

    // Check for expired credentials
    const expiredCredentials = profile.credentialValidations.filter(
      cred => cred.verificationStatus === 'expired'
    )
    
    if (expiredCredentials.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'credentials',
        recommendation: `Renew expired credentials: ${expiredCredentials.map(c => c.credential).join(', ')}`,
        impact: 'Maintains qualification for current content areas'
      })
    }

    // Check for unverified credentials
    const unverifiedCredentials = profile.credentialValidations.filter(
      cred => cred.verificationStatus === 'pending' && cred.verificationRequired
    )
    
    if (unverifiedCredentials.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'credentials',
        recommendation: `Verify credentials: ${unverifiedCredentials.map(c => c.credential).join(', ')}`,
        impact: 'Enables qualification for restricted content areas'
      })
    }

    // Check content area recommendations
    Object.values(profile.contentAreaExpertise).forEach(assessment => {
      if (!assessment.qualified && assessment.recommendations.length > 0) {
        assessment.recommendations.forEach(rec => {
          recommendations.push({
            priority: 'medium',
            category: 'credentials',
            recommendation: `${assessment.contentArea}: ${rec}`,
            impact: `Qualifies for writing in ${assessment.contentArea}`
          })
        })
      }
    })

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }
}

export default AuthorExpertiseService
