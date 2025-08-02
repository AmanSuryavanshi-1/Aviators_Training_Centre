/**
 * Authentication Services Index
 * Exports all authentication-related services and types
 */

// Services
export { sanityMemberService, SanityMemberService } from './sanityMemberService';
export { jwtAuthService, JWTAuthService } from './jwtService';
export { memberValidationService, MemberValidationService } from './memberValidationService';
export { sessionService, SessionService } from './sessionService';

// Types
export type { 
  SanityMember, 
  SanityMemberValidationResult 
} from './sanityMemberService';

export type { 
  AuthUser, 
  Permission, 
  JWTPayload, 
  TokenPair 
} from './jwtService';

export type { 
  LoginCredentials, 
  AuthenticationResult, 
  SessionValidationResult 
} from './memberValidationService';

export type { 
  SessionConfig, 
  SessionData 
} from './sessionService';

// Re-export existing auth types for compatibility
export type { 
  AuthContext,
  AuthUser as LegacyAuthUser
} from './studioAdminAuth';

export { 
  studioAdminAuth, 
  useStudioAdminAuth, 
  navigationUtils 
} from './studioAdminAuth';