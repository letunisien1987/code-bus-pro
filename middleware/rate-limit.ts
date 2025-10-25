import { NextRequest, NextResponse } from 'next/server'
import { globalRateLimit, getClientIP } from '@/lib/rate-limit'

export async function rateLimitMiddleware(request: NextRequest) {
  const ip = getClientIP(request)
  const { success, limit, remaining, reset } = await globalRateLimit.limit(ip)
  
  if (!success) {
    return new NextResponse(
      JSON.stringify({
        error: 'Trop de requêtes. Veuillez réessayer plus tard.',
        retryAfter: Math.round((reset - Date.now()) / 1000)
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': Math.round((reset - Date.now()) / 1000).toString(),
        },
      }
    )
  }
  
  // Ajouter les headers de rate limiting à la réponse
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', reset.toString())
  
  return response
}
