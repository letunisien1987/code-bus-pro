import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  const userId = session.user.id
  
  try {
    // Lire depuis PostgreSQL avec les réponses détaillées
    const history = await prisma.examHistory.findMany({
      where: { userId },
      include: {
        answers: true  // Inclure les réponses détaillées
      },
      orderBy: { completedAt: 'desc' }
    })
    
    return NextResponse.json({ history })
  } catch (error) {
    console.error('Erreur lecture historique:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  const userId = session.user.id
  const data = await request.json()
  
  try {
    // Enregistrer dans PostgreSQL avec les réponses détaillées
    const examHistory = await prisma.examHistory.create({
      data: {
        userId,
        score: data.score,
        percentage: data.percentage,
        total: data.total,
        correct: data.correct,
        incorrect: data.incorrect,
        timeSpent: data.timeSpent || 0,
        performanceScore: data.performanceScore,
        accuracyScore: data.accuracyScore,
        speedBonus: data.speedBonus,
        avgTimePerQuestion: data.avgTimePerQuestion,
        performanceBadge: data.performanceBadge
      }
    })
    
    // Sauvegarder les réponses individuelles
    if (data.answers && Array.isArray(data.answers)) {
      await prisma.examAnswer.createMany({
        data: data.answers.map((answer: any) => ({
          examHistoryId: examHistory.id,
          questionId: answer.questionId,
          choix: answer.answer || answer.choix,
          correct: answer.correct
        }))
      })
    }
    
    return NextResponse.json({ success: true, entry: examHistory })
  } catch (error) {
    console.error('Erreur sauvegarde historique:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
