import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from './prisma-singleton'

// Interface pour l'utilisateur authentifié
export interface AuthenticatedUser {
  id: string
  email: string
  name: string
  role: 'STUDENT' | 'ADMIN'
}

// Fonction pour obtenir l'utilisateur depuis la requête
export async function getUserFromRequest(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    })
    
    if (!token || !token.sub) {
      return null
    }
    
    // Récupérer l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: { id: token.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })
    
    if (!user) {
      return null
    }
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'STUDENT' | 'ADMIN'
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error)
    return null
  }
}

// Fonction pour exiger une authentification
export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const user = await getUserFromRequest(request)
  
  if (!user) {
    throw new Error('Non authentifié')
  }
  
  return user
}

// Fonction pour exiger le rôle admin
export async function requireAdmin(request: NextRequest): Promise<AuthenticatedUser> {
  const user = await requireAuth(request)
  
  if (user.role !== 'ADMIN') {
    throw new Error('Accès refusé: droits administrateur requis')
  }
  
  return user
}

// Fonction pour vérifier si l'utilisateur est admin
export async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const user = await requireAdmin(request)
    return user.role === 'ADMIN'
  } catch {
    return false
  }
}

// Fonction pour vérifier si l'utilisateur peut accéder à une ressource
export async function canAccessResource(
  request: NextRequest,
  resourceUserId?: string
): Promise<boolean> {
  try {
    const user = await requireAuth(request)
    
    // Les admins peuvent accéder à tout
    if (user.role === 'ADMIN') {
      return true
    }
    
    // Les étudiants ne peuvent accéder qu'à leurs propres ressources
    if (resourceUserId && user.id !== resourceUserId) {
      return false
    }
    
    return true
  } catch {
    return false
  }
}

// Fonction pour créer une réponse d'erreur d'authentification
export function createAuthErrorResponse(message: string, status: number = 401): Response {
  return new Response(
    JSON.stringify({
      error: message,
      code: 'AUTH_ERROR'
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
}

// Fonction pour créer une réponse d'erreur d'autorisation
export function createAuthorizationErrorResponse(message: string): Response {
  return new Response(
    JSON.stringify({
      error: message,
      code: 'AUTHORIZATION_ERROR'
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
}

// Middleware pour protéger les routes API
export async function withAuth(
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<Response>
) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      const user = await requireAuth(request)
      return await handler(request, user)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Non authentifié') {
          return createAuthErrorResponse('Authentification requise', 401)
        }
        if (error.message.includes('droits administrateur')) {
          return createAuthorizationErrorResponse('Droits administrateur requis')
        }
      }
      
      return createAuthErrorResponse('Erreur d\'authentification', 500)
    }
  }
}

// Middleware pour protéger les routes admin
export async function withAdminAuth(
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<Response>
) {
  return async (request: NextRequest): Promise<Response> => {
    try {
      const user = await requireAdmin(request)
      return await handler(request, user)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Non authentifié') {
          return createAuthErrorResponse('Authentification requise', 401)
        }
        if (error.message.includes('droits administrateur')) {
          return createAuthorizationErrorResponse('Droits administrateur requis')
        }
      }
      
      return createAuthErrorResponse('Erreur d\'authentification', 500)
    }
  }
}
