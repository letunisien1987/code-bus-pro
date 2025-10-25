import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma-singleton'
import { signupSchema, formatZodError } from '@/lib/validations/auth'
import { authRateLimit, getClientIP, checkRateLimit } from '@/lib/rate-limit'
import { createSecureErrorResponse, logError } from '@/lib/error-handler'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting pour l'authentification
    const ip = getClientIP(request)
    const { success: rateLimitSuccess } = await checkRateLimit(authRateLimit, ip)
    
    if (!rateLimitSuccess) {
      return createSecureErrorResponse(
        new Error('Trop de tentatives de création de compte'),
        {
          request,
          action: 'signup',
          type: 'RATE_LIMIT' as any,
          statusCode: 429
        }
      )
    }

    const body = await request.json()
    
    // Validation avec Zod
    const validationResult = signupSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = formatZodError(validationResult.error)
      return NextResponse.json(
        { 
          error: 'Données invalides',
          details: errors 
        },
        { status: 400 }
      )
    }

    const { name, email, password } = validationResult.data

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'STUDENT' // Par défaut, tous les nouveaux utilisateurs sont des étudiants
      }
    })

    // Retourner les données sans le mot de passe
    const { password: _, ...userData } = user

    return NextResponse.json({
      message: 'Compte créé avec succès',
      user: userData
    })

  } catch (error) {
    logError(error, {
      request,
      action: 'signup'
    })
    
    return createSecureErrorResponse(error, {
      request,
      action: 'signup'
    })
  }
}
