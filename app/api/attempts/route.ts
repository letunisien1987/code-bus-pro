import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { questionId, choix, correct } = await request.json()

    const attempt = await prisma.attempt.create({
      data: {
        questionId,
        choix,
        correct,
        userId: null // Pour l'instant, pas d'utilisateur
      }
    })

    return NextResponse.json(attempt)
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la tentative:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement de la tentative' },
      { status: 500 }
    )
  }
}
