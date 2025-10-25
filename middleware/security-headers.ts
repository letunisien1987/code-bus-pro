import { NextRequest, NextResponse } from 'next/server'

// Configuration des headers de sécurité
const securityHeaders = {
  // Protection contre le clickjacking
  'X-Frame-Options': 'DENY',
  
  // Protection contre le MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Politique de référent
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Protection XSS
  'X-XSS-Protection': '1; mode=block',
  
  // Politique de permissions
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()'
  ].join(', '),
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.openai.com https://*.upstash.io",
    "frame-src 'self' https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')
}

// Headers spécifiques pour les API
const apiHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Surrogate-Control': 'no-store'
}

// Headers pour les pages statiques
const staticHeaders = {
  'Cache-Control': 'public, max-age=31536000, immutable'
}

// Fonction pour déterminer le type de ressource
function getResourceType(request: NextRequest): 'api' | 'static' | 'page' {
  const url = new URL(request.url)
  const pathname = url.pathname
  
  // API routes
  if (pathname.startsWith('/api/')) {
    return 'api'
  }
  
  // Ressources statiques
  if (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)
  ) {
    return 'static'
  }
  
  // Pages
  return 'page'
}

// Middleware principal pour les headers de sécurité
export function securityHeadersMiddleware(request: NextRequest): NextResponse {
  const response = NextResponse.next()
  const resourceType = getResourceType(request)
  
  // Ajouter les headers de sécurité de base
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // Ajouter des headers spécifiques selon le type de ressource
  switch (resourceType) {
    case 'api':
      Object.entries(apiHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      break
      
    case 'static':
      Object.entries(staticHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      break
      
    case 'page':
      // Headers pour les pages
      response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate')
      break
  }
  
  // Headers spécifiques pour l'authentification
  if (request.nextUrl.pathname.startsWith('/auth/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }
  
  // Headers pour les pages sensibles (admin, json-editor)
  if (
    request.nextUrl.pathname.startsWith('/json-editor') ||
    request.nextUrl.pathname.startsWith('/admin')
  ) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }
  
  return response
}

// Fonction pour créer une réponse avec headers de sécurité
export function createSecureResponse(
  body: string | object,
  status: number = 200,
  additionalHeaders: Record<string, string> = {}
): NextResponse {
  const response = new NextResponse(
    typeof body === 'string' ? body : JSON.stringify(body),
    {
      status,
      headers: {
        'Content-Type': typeof body === 'string' ? 'text/plain' : 'application/json',
        ...securityHeaders,
        ...additionalHeaders
      }
    }
  )
  
  return response
}

// Fonction pour créer une réponse d'erreur sécurisée
export function createSecureErrorResponse(
  message: string,
  status: number = 500,
  additionalHeaders: Record<string, string> = {}
): NextResponse {
  return createSecureResponse(
    {
      error: message,
      timestamp: new Date().toISOString()
    },
    status,
    {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      ...additionalHeaders
    }
  )
}
