import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { securityHeadersMiddleware } from './middleware/security-headers'
import { rateLimitMiddleware } from './middleware/rate-limit'

export default withAuth(
  function middleware(req) {
    // Appliquer les headers de sécurité
    const response = securityHeadersMiddleware(req)
    
    // Appliquer le rate limiting pour les API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return rateLimitMiddleware(req)
    }
    
    // Vérifier si l'utilisateur est admin pour accéder à l'éditeur JSON
    if (req.nextUrl.pathname.startsWith('/json-editor')) {
      if (req.nextauth.token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Vérifier si l'utilisateur est admin pour accéder au panel admin
    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (req.nextauth.token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
    
    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permettre l'accès à la page d'accueil et aux pages d'auth sans token
        if (req.nextUrl.pathname === '/' || req.nextUrl.pathname.startsWith('/auth/')) {
          return true
        }
        
        // Toutes les autres pages nécessitent une authentification
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - images folder
     * - static assets
     */
    '/((?!api|_next/static|_next/image|favicon|images|public|manifest.json).*)',
  ],
}
