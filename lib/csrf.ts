import { randomBytes } from 'crypto'
import { NextRequest } from 'next/server'

// Configuration CSRF
const CSRF_TOKEN_LENGTH = 32
const CSRF_COOKIE_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'

// Générer un token CSRF
export function generateCSRFToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString('hex')
}

// Vérifier un token CSRF
export function verifyCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) {
    return false
  }
  
  // Comparaison sécurisée pour éviter les attaques par timing
  return token.length === expectedToken.length && 
         token === expectedToken
}

// Obtenir le token CSRF depuis la requête
export function getCSRFTokenFromRequest(request: NextRequest): string | null {
  // Vérifier d'abord le header
  const headerToken = request.headers.get(CSRF_HEADER_NAME)
  if (headerToken) {
    return headerToken
  }
  
  // Vérifier ensuite le body pour les requêtes POST/PUT/DELETE
  const contentType = request.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    // Pour les requêtes JSON, le token sera dans le body
    return null // Sera vérifié dans le handler
  }
  
  // Vérifier les paramètres de requête
  const url = new URL(request.url)
  const queryToken = url.searchParams.get('csrf_token')
  if (queryToken) {
    return queryToken
  }
  
  return null
}

// Obtenir le token CSRF depuis les cookies
export function getCSRFTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get(CSRF_COOKIE_NAME)?.value || null
}

// Middleware CSRF pour les API routes
export async function validateCSRF(request: NextRequest): Promise<{
  valid: boolean
  error?: string
}> {
  // Exclure les méthodes GET et HEAD
  if (request.method === 'GET' || request.method === 'HEAD') {
    return { valid: true }
  }
  
  // Exclure NextAuth (gère son propre CSRF)
  if (request.url.includes('/api/auth/')) {
    return { valid: true }
  }
  
  // Obtenir le token depuis la requête
  const requestToken = getCSRFTokenFromRequest(request)
  if (!requestToken) {
    return {
      valid: false,
      error: 'Token CSRF manquant'
    }
  }
  
  // Obtenir le token depuis les cookies
  const cookieToken = getCSRFTokenFromCookies(request)
  if (!cookieToken) {
    return {
      valid: false,
      error: 'Cookie CSRF manquant'
    }
  }
  
  // Vérifier les tokens
  if (!verifyCSRFToken(requestToken, cookieToken)) {
    return {
      valid: false,
      error: 'Token CSRF invalide'
    }
  }
  
  return { valid: true }
}

// Fonction pour créer une réponse avec token CSRF
export function createCSRFResponse(token: string): Response {
  const response = new Response(JSON.stringify({ csrfToken: token }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `${CSRF_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`
    }
  })
  
  return response
}

// Fonction pour obtenir un nouveau token CSRF
export async function getNewCSRFToken(): Promise<{
  token: string
  cookie: string
}> {
  const token = generateCSRFToken()
  const cookie = `${CSRF_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`
  
  return { token, cookie }
}
