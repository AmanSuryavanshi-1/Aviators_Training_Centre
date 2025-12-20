# Authentication & Security

> **JWT authentication, route protection, and security headers**

Last Updated: December 20, 2025

---

## Overview

The authentication system provides:
- JWT-based admin authentication
- Route protection via middleware
- Role-based access control
- Security headers for all routes

---

## Current Implementation

### Architecture

```
Authentication System
├── JWT Service
│   ├── Token generation
│   ├── Token validation
│   ├── Token refresh
│   └── Role/permission encoding
│
├── Middleware
│   ├── Route protection
│   ├── Cookie validation
│   └── Redirect handling
│
├── Session Management
│   ├── Cookie storage
│   ├── Expiry handling
│   └── Logout
│
└── Security Headers
    ├── X-Frame-Options
    ├── X-Content-Type-Options
    ├── CSP
    └── CORS
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/auth/jwtService.ts` | JWT token operations |
| `middleware.ts` | Route protection |
| `src/lib/auth/adminAuth.ts` | Admin auth helpers |
| `src/lib/auth/sessionService.ts` | Session management |
| `next.config.mjs` | Security headers |

---

## Core Logic

### JWT Service

```typescript
// src/lib/auth/jwtService.ts
import { SignJWT, jwtVerify } from 'jose';

// Types
export type UserRole = 'administrator' | 'editor';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions: string[];
  iat: number;
  exp: number;
}

// Secret key (from environment)
const getSecret = () => {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error('ADMIN_JWT_SECRET not configured');
  return new TextEncoder().encode(secret);
};

// Generate access token
export async function generateAccessToken(user: {
  id: string;
  email: string;
  role: UserRole;
  permissions: string[];
}): Promise<string> {
  return new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')  // 7 days
    .sign(getSecret());
}

// Generate refresh token (longer expiry)
export async function generateRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')  // 30 days
    .sign(getSecret());
}

// Verify token
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as TokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Check if token is expired
export function isTokenExpired(payload: TokenPayload): boolean {
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now;
}

// Check user permission
export function hasPermission(
  payload: TokenPayload, 
  permission: string
): boolean {
  // Administrators have all permissions
  if (payload.role === 'administrator') return true;
  return payload.permissions.includes(permission);
}
```

### Middleware Route Protection

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip auth for login page and API endpoints
  if (path === '/studio/admin/login' || path.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Get session cookie
  const sessionCookie = request.cookies.get('admin-session');

  if (!sessionCookie?.value) {
    return redirectToLogin(request);
  }

  try {
    // Verify JWT
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET);
    const { payload } = await jwtVerify(sessionCookie.value, secret);

    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && (payload.exp as number) <= now) {
      return redirectToLogin(request);
    }

    // Add security headers
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');

    return response;
  } catch (error) {
    console.error('Auth middleware error:', error);
    return redirectToLogin(request);
  }
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/studio/admin/login', request.url);
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);

  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete('admin-session');  // Clear invalid cookie

  return response;
}

// Only run on admin routes
export const config = {
  matcher: ['/studio/admin/:path*'],
};
```

### Login API Route

```typescript
// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateAccessToken } from '@/lib/auth/jwtService';
import { verifySanityMember } from '@/lib/auth/sanityMemberService';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Verify credentials against Sanity members
    const member = await verifySanityMember(email, password);

    if (!member) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = await generateAccessToken({
      id: member._id,
      email: member.email,
      role: member.role as UserRole,
      permissions: member.permissions || [],
    });

    // Create response with cookie
    const response = NextResponse.json({ success: true });
    
    response.cookies.set('admin-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
```

### Logout API Route

```typescript
// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  response.cookies.set('admin-session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire immediately
    path: '/',
  });

  return response;
}
```

---

## Security Headers

### Next.js Configuration

```javascript
// next.config.mjs
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
  ];
},
```

### Vercel Security Headers

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

---

## Role-Based Access

### User Roles

| Role | Permissions |
|------|-------------|
| `administrator` | Full access to all features |
| `editor` | Blog management, limited analytics |

### Permission Checking

```typescript
// In protected component or API
import { verifyToken, hasPermission } from '@/lib/auth/jwtService';

async function protectedAction(token: string) {
  const payload = await verifyToken(token);
  
  if (!payload) {
    throw new Error('Unauthorized');
  }
  
  if (!hasPermission(payload, 'manage_blog')) {
    throw new Error('Insufficient permissions');
  }
  
  // Proceed with action
}
```

---

## How to Use

### Check Auth in Server Component

```typescript
// src/app/admin/page.tsx
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwtService';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const cookieStore = cookies();
  const session = cookieStore.get('admin-session');

  if (!session?.value) {
    redirect('/studio/admin/login');
  }

  const user = await verifyToken(session.value);
  
  if (!user) {
    redirect('/studio/admin/login');
  }

  return <AdminDashboard user={user} />;
}
```

### Check Auth in Client Component

```typescript
// src/components/admin/AuthGuard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function AuthGuard({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const response = await fetch('/api/auth/verify');
      
      if (!response.ok) {
        router.push('/studio/admin/login');
      } else {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, [router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return children;
}
```

---

## Environment Variables

```bash
# Required: JWT signing secret (32+ characters)
ADMIN_JWT_SECRET=your-very-long-random-secret-key-here
```

**Important**: Generate a strong secret:
```bash
openssl rand -base64 32
```

---

## Extension Guide

### Adding New Permission

```typescript
// 1. Define permission in types
type Permission = 
  | 'manage_blog'
  | 'manage_users'
  | 'view_analytics'
  | 'export_data';  // New

// 2. Assign to role
const rolePermissions = {
  administrator: ['manage_blog', 'manage_users', 'view_analytics', 'export_data'],
  editor: ['manage_blog', 'view_analytics'],
};

// 3. Check in protected route
if (!hasPermission(user, 'export_data')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| "Unauthorized" on every request | Check `ADMIN_JWT_SECRET` is set |
| Cookie not being set | Verify `secure: true` only in production |
| Token expired immediately | Check server time is correct |
| CORS errors on login | Add CORS headers to auth routes |

---

## Related Documentation

- [Admin Dashboard](admin-dashboard.md)
- [API Integration](../API_INTEGRATION.md)
- [Deployment Runbook](../DEPLOYMENT_RUNBOOK.md)
