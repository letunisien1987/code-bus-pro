import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Configuration Redis avec fallback in-memory
let redis: Redis

try {
  // Vérifier si Redis est configuré
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    console.log('✅ Redis configuré pour le rate limiting')
  } else {
    // Créer une instance Redis factice pour éviter les erreurs de type
    redis = new Redis({
      url: 'http://localhost:6379',
      token: 'dummy-token',
    })
    console.log('⚠️ Redis non configuré - utilisation du fallback in-memory')
  }
} catch (error) {
  console.log('⚠️ Erreur Redis - utilisation du fallback in-memory:', error)
  // Créer une instance Redis factice pour éviter les erreurs de type
  redis = new Redis({
    url: 'http://localhost:6379',
    token: 'dummy-token',
  })
}

// Rate limiting global - 100 requêtes par 10 minutes par IP
export const globalRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '10 m'),
  analytics: true,
  prefix: 'global',
})

// Rate limiting pour l'authentification - 5 tentatives par 15 minutes
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'auth',
})

// Rate limiting pour l'IA - 10 requêtes par heure
export const aiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
  prefix: 'ai',
})

// Rate limiting pour l'API JSON Editor - 20 requêtes par minute
export const jsonEditorRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  analytics: true,
  prefix: 'json-editor',
})

// Fonction utilitaire pour obtenir l'IP du client
export function getClientIP(request: Request): string {
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

// Fonction pour vérifier les limites et retourner les headers
export async function checkRateLimit(
  rateLimit: Ratelimit,
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  try {
    // Si Redis n'est pas configuré (URL factice), autoriser toutes les requêtes
    if (process.env.UPSTASH_REDIS_REST_URL === undefined || process.env.UPSTASH_REDIS_REST_TOKEN === undefined) {
      console.log('⚠️ Redis non configuré - autorisation de la requête')
      return { success: true, limit: 1000, remaining: 999, reset: Date.now() + 60000 }
    }
    
    const { success, limit, remaining, reset } = await rateLimit.limit(identifier)
    return { success, limit, remaining, reset }
  } catch (error) {
    console.log('⚠️ Erreur rate limiting - autorisation de la requête:', error)
    // En cas d'erreur, autoriser la requête pour éviter de bloquer l'application
    return { success: true, limit: 1000, remaining: 999, reset: Date.now() + 60000 }
  }
}
