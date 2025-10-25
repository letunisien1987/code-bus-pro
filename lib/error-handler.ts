import { NextRequest } from 'next/server'

// Types d'erreurs
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  CSRF = 'CSRF',
  DATABASE = 'DATABASE',
  EXTERNAL_API = 'EXTERNAL_API',
  INTERNAL = 'INTERNAL'
}

// Interface pour les erreurs sécurisées
export interface SecureError {
  type: ErrorType
  message: string
  code: string
  statusCode: number
  timestamp: string
  requestId?: string
}

// Configuration de logging
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

// Fonction pour logger les erreurs de manière sécurisée
export function logError(
  error: Error | unknown,
  context: {
    request?: NextRequest
    userId?: string
    action?: string
    metadata?: Record<string, unknown>
  } = {}
): void {
  const timestamp = new Date().toISOString()
  const requestId = context.request?.headers.get('x-request-id') || 'unknown'
  
  // Informations de base
  const logData = {
    timestamp,
    requestId,
    userId: context.userId || 'anonymous',
    action: context.action || 'unknown',
    url: context.request?.url,
    method: context.request?.method,
    userAgent: context.request?.headers.get('user-agent'),
    ip: getClientIP(context.request),
    ...context.metadata
  }
  
  if (error instanceof Error) {
    // En développement, logger tous les détails
    if (isDevelopment) {
      console.error('Erreur détaillée:', {
        ...logData,
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    } else {
      // En production, logger seulement les informations sécurisées
      console.error('Erreur:', {
        ...logData,
        message: error.message,
        name: error.name
        // Pas de stack trace en production
      })
    }
  } else {
    console.error('Erreur inconnue:', logData)
  }
  
  // Ici, vous pourriez envoyer les logs vers un service externe
  // comme Sentry, LogRocket, etc.
  if (isProduction) {
    // sendToExternalLoggingService(logData)
  }
}

// Fonction pour obtenir l'IP du client
function getClientIP(request?: NextRequest): string {
  if (!request) return 'unknown'
  
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

// Fonction pour créer une réponse d'erreur sécurisée
export function createSecureErrorResponse(
  error: Error | unknown,
  context: {
    request?: NextRequest
    userId?: string
    action?: string
    type?: ErrorType
    statusCode?: number
  } = {}
): Response {
  const timestamp = new Date().toISOString()
  const requestId = context.request?.headers.get('x-request-id') || 'unknown'
  
  // Déterminer le type d'erreur
  let errorType = context.type || ErrorType.INTERNAL
  let statusCode = context.statusCode || 500
  let message = 'Une erreur est survenue'
  
  if (error instanceof Error) {
    // Messages d'erreur spécifiques selon le type
    if (error.message.includes('validation')) {
      errorType = ErrorType.VALIDATION
      statusCode = 400
      message = isDevelopment ? error.message : 'Données invalides'
    } else if (error.message.includes('authentification') || error.message.includes('Non authentifié')) {
      errorType = ErrorType.AUTHENTICATION
      statusCode = 401
      message = 'Authentification requise'
    } else if (error.message.includes('autorisation') || error.message.includes('droits')) {
      errorType = ErrorType.AUTHORIZATION
      statusCode = 403
      message = 'Accès refusé'
    } else if (error.message.includes('non trouvé')) {
      errorType = ErrorType.NOT_FOUND
      statusCode = 404
      message = 'Ressource non trouvée'
    } else if (error.message.includes('rate limit')) {
      errorType = ErrorType.RATE_LIMIT
      statusCode = 429
      message = 'Trop de requêtes'
    } else if (error.message.includes('CSRF')) {
      errorType = ErrorType.CSRF
      statusCode = 403
      message = 'Token CSRF invalide'
    } else if (error.message.includes('database') || error.message.includes('Prisma')) {
      errorType = ErrorType.DATABASE
      statusCode = 500
      message = 'Erreur de base de données'
    } else if (error.message.includes('OpenAI') || error.message.includes('API')) {
      errorType = ErrorType.EXTERNAL_API
      statusCode = 502
      message = 'Service temporairement indisponible'
    }
  }
  
  // Logger l'erreur
  logError(error, {
    request: context.request,
    userId: context.userId,
    action: context.action,
    metadata: { errorType, statusCode }
  })
  
  // Créer la réponse d'erreur
  const errorResponse: SecureError = {
    type: errorType,
    message,
    code: `ERR_${errorType}`,
    statusCode,
    timestamp,
    requestId
  }
  
  // En développement, ajouter plus de détails
  if (isDevelopment && error instanceof Error) {
    (errorResponse as any).details = {
      originalMessage: error.message,
      stack: error.stack
    }
  }
  
  return new Response(
    JSON.stringify(errorResponse),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId
      }
    }
  )
}

// Fonction pour gérer les erreurs de validation Zod
export function handleValidationError(
  error: unknown,
  context: {
    request?: NextRequest
    userId?: string
    action?: string
  } = {}
): Response {
  return createSecureErrorResponse(
    new Error('Erreur de validation des données'),
    {
      ...context,
      type: ErrorType.VALIDATION,
      statusCode: 400
    }
  )
}

// Fonction pour gérer les erreurs d'authentification
export function handleAuthError(
  error: unknown,
  context: {
    request?: NextRequest
    userId?: string
    action?: string
  } = {}
): Response {
  return createSecureErrorResponse(
    new Error('Erreur d\'authentification'),
    {
      ...context,
      type: ErrorType.AUTHENTICATION,
      statusCode: 401
    }
  )
}

// Fonction pour gérer les erreurs d'autorisation
export function handleAuthorizationError(
  error: unknown,
  context: {
    request?: NextRequest
    userId?: string
    action?: string
  } = {}
): Response {
  return createSecureErrorResponse(
    new Error('Erreur d\'autorisation'),
    {
      ...context,
      type: ErrorType.AUTHORIZATION,
      statusCode: 403
    }
  )
}

// Wrapper pour les handlers d'API avec gestion d'erreurs
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args)
    } catch (error) {
      // Le contexte sera déterminé par le handler appelant
      return createSecureErrorResponse(error)
    }
  }
}
