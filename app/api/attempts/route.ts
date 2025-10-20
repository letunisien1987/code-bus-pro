import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { computeAccuracy, computeConsecutiveCorrect, updateSM2 } from '../../../lib/learningMetrics'

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

    // Mettre à jour QuestionProgress (userId null pour l'instant)
    const userId: string | null = null
    const allAttempts = await prisma.attempt.findMany({
      where: { questionId, userId },
      orderBy: { createdAt: 'asc' }
    })

    const recent = allAttempts.slice(-5)
    const accuracy = computeAccuracy(recent)
    const consecutiveCorrect = computeConsecutiveCorrect(allAttempts)

    // Récupérer ou créer le progress
    // Avec userId nullable, on ne peut pas utiliser un unique composite
    const existing = await prisma.questionProgress.findFirst({
      where: { userId, questionId }
    }).catch(() => null)

    const prev = existing ?? { repetitions: 0, intervalDays: 0, easiness: 2.5 }
    const sm2 = updateSM2({
      repetitions: prev.repetitions,
      intervalDays: prev.intervalDays,
      easiness: prev.easiness
    }, correct)

    const now = new Date()
    const nextDueAt = new Date(now)
    nextDueAt.setDate(now.getDate() + sm2.intervalDays)

    // Statut
    let status: 'not_seen' | 'learning' | 'to_review' | 'mastered' = 'learning'
    if (consecutiveCorrect >= 3 || accuracy >= 0.85) status = 'mastered'
    else if (sm2.intervalDays <= 1) status = 'to_review'

    if (existing) {
      await prisma.questionProgress.update({
        where: { id: existing.id },
        data: {
          repetitions: sm2.repetitions,
          intervalDays: sm2.intervalDays,
          easiness: sm2.easiness,
          accuracy,
          consecutiveCorrect,
          lastAttemptAt: now,
          nextDueAt,
          status
        }
      })
    } else {
      await prisma.questionProgress.create({
        data: {
          userId,
          questionId,
          repetitions: sm2.repetitions,
          intervalDays: sm2.intervalDays,
          easiness: sm2.easiness,
          accuracy,
          consecutiveCorrect,
          lastAttemptAt: now,
          nextDueAt,
          status
        }
      })
    }

    return NextResponse.json(attempt)
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la tentative:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement de la tentative' },
      { status: 500 }
    )
  }
}
