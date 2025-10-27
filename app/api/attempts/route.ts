import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { checkAndUnlockAchievements } from '../../../lib/achievements/checker'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { questionId, choix, correct, timeSpent } = await request.json()
    const userId = session.user.id

    // Créer la tentative dans PostgreSQL
    const attempt = await prisma.attempt.create({
      data: {
        userId,
        questionId,
        choix,
        correct,
        timeSpent: timeSpent || null // Temps en secondes, optionnel
      }
    })

    // Vérifier les trophées
    let newAchievements: any[] = []
    try {
      newAchievements = await checkAndUnlockAchievements(userId)
    } catch (error) {
      console.error('Erreur lors de la vérification des trophées:', error)
    }

    return NextResponse.json({
      attempt,
      newAchievements
    })
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la tentative:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement de la tentative' },
      { status: 500 }
    )
  }
}
