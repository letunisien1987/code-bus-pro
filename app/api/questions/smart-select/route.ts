import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { 
  selectQuestionsForExam, 
  sortQuestionsForTraining, 
  getLearningMetrics,
  SelectionOptions 
} from '../../../../lib/questionSelector'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { mode, count, filters, weights } = body as {
      mode: 'exam' | 'training'
      count?: number
      filters?: {
        questionnaire?: string
        categorie?: string
        astag?: string
        statut?: string
      }
      weights?: {
        neverSeen: number
        failureRate: number
        timeSinceLastAttempt: number
        categoryBalance: number
      }
    }

    // Récupérer toutes les questions
    const questions = await prisma.question.findMany({
      orderBy: {
        questionnaire: 'asc'
      }
    })

    // Récupérer toutes les tentatives
    const attempts = await prisma.attempt.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Options de sélection
    const options: SelectionOptions = {
      mode,
      count,
      filters,
      weights
    }

    let selectedQuestions
    let metadata = {}

    if (mode === 'exam') {
      if (!count || count <= 0) {
        return NextResponse.json(
          { error: 'Le nombre de questions est requis pour le mode examen' },
          { status: 400 }
        )
      }

      // Sélection intelligente pour l'examen
      selectedQuestions = selectQuestionsForExam(questions, attempts, count, options)
      
      // Métadonnées pour l'examen
      const categoryDistribution = selectedQuestions.reduce((acc, q) => {
        const category = q.metrics.category
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      metadata = {
        totalSelected: selectedQuestions.length,
        categoryDistribution,
        averageScore: selectedQuestions.reduce((sum, q) => sum + q.score, 0) / selectedQuestions.length,
        priorityBreakdown: {
          neverSeen: selectedQuestions.filter(q => q.metrics.neverSeen).length,
          struggling: selectedQuestions.filter(q => q.metrics.successRate < 0.5 && q.metrics.attemptCount > 0).length,
          recent: selectedQuestions.filter(q => q.metrics.daysSinceLastAttempt <= 7).length
        }
      }
    } else {
      // Tri intelligent pour l'entraînement
      selectedQuestions = sortQuestionsForTraining(questions, attempts, options)
      
      // Métadonnées pour l'entraînement
      const learningProgress = {
        total: questions.length,
        neverSeen: selectedQuestions.filter(q => q.metrics.neverSeen).length,
        struggling: selectedQuestions.filter(q => q.metrics.successRate < 0.5 && q.metrics.attemptCount > 0).length,
        mastered: selectedQuestions.filter(q => q.metrics.successRate > 0.8 && q.metrics.attemptCount > 2).length
      }

      metadata = {
        totalQuestions: selectedQuestions.length,
        learningProgress,
        topPriorities: selectedQuestions.slice(0, 10).map(q => ({
          id: q.id,
          score: q.score,
          category: q.metrics.category,
          reason: q.metrics.neverSeen ? 'Jamais vue' : 
                  q.metrics.successRate < 0.5 ? 'En difficulté' : 
                  q.metrics.daysSinceLastAttempt > 7 ? 'Pas vue récemment' : 'Révision'
        }))
      }
    }

    // Obtenir les métriques globales d'apprentissage
    const globalMetrics = getLearningMetrics(questions, attempts)

    return NextResponse.json({
      success: true,
      questions: selectedQuestions.map(q => ({
        id: q.id,
        questionnaire: q.questionnaire,
        question: q.question,
        categorie: q.categorie,
        astag: q.astag,
        enonce: q.enonce,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        bonneReponse: q.bonneReponse,
        imagePath: q.imagePath,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt
      })),
      metadata,
      globalMetrics
    })

  } catch (error) {
    console.error('Erreur lors de la sélection intelligente:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la sélection intelligente des questions',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

// Endpoint GET pour obtenir les métriques d'apprentissage
export async function GET() {
  try {
    const questions = await prisma.question.findMany()
    const attempts = await prisma.attempt.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    const globalMetrics = getLearningMetrics(questions, attempts)

    return NextResponse.json({
      success: true,
      metrics: globalMetrics
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des métriques:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la récupération des métriques d\'apprentissage'
      },
      { status: 500 }
    )
  }
}
