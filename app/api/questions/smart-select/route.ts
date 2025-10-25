import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-singleton'
import { 
  selectQuestionsForExam, 
  sortQuestionsForTraining, 
  getLearningMetrics,
  SelectionOptions 
} from '@/lib/learning/selector'
// ProgressStatus est maintenant un string dans SQLite

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { mode, count, filters, weights, userId, avoidRecentN } = body as {
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
      userId?: string | null
      avoidRecentN?: number
    }

    // Récupérer toutes les questions
    const questions = await prisma.question.findMany({
      orderBy: {
        questionnaire: 'asc'
      }
    })

    // Récupérer toutes les tentatives (scopées utilisateur si fourni)
    const attempts = await prisma.attempt.findMany({
      where: { userId: userId ?? null },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Progress par question (utilisateur si fourni)
    const progresses = await prisma.questionProgress.findMany({
      where: { userId: userId ?? null }
    })

    // Options de sélection
    const options: SelectionOptions = {
      mode,
      count,
      filters,
      weights,
      userId: userId ?? null,
      avoidRecentN: avoidRecentN ?? 40
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

      // Sélection adaptative basée sur QuestionProgress
      const recentToAvoidIds = new Set(
        attempts.slice(0, options.avoidRecentN!).map(a => a.questionId)
      )

      // Map progresses par question
      const progressByQ = new Map(progresses.map(p => [p.questionId, p]))

      // Helper filtre commun (filtres questionnaire/categorie)
      const passFilters = (q: any) => {
        if (filters?.questionnaire && filters.questionnaire !== 'all' && q.questionnaire.toString() !== filters.questionnaire) return false
        if (filters?.categorie && filters.categorie !== 'all' && q.categorie !== filters.categorie) return false
        if (filters?.astag && filters.astag !== 'all' && q.astag !== filters.astag) return false
        return true
      }

      const notSeen = questions.filter(q => !progressByQ.has(q.id) && passFilters(q) && !recentToAvoidIds.has(q.id))

      const dueToReview = questions.filter(q => {
        const p = progressByQ.get(q.id)
        if (!p) return false
        if (!passFilters(q)) return false
        if (recentToAvoidIds.has(q.id)) return false
        if (!p.nextDueAt) return false
        return new Date(p.nextDueAt) <= new Date()
      })

      const weak = questions.filter(q => {
        const p = progressByQ.get(q.id)
        if (!p) return false
        if (!passFilters(q)) return false
        if (recentToAvoidIds.has(q.id)) return false
        // faiblesse: accuracy basse ou peu de bonnes d'affilée
        return (p.accuracy < 0.6 || p.consecutiveCorrect < 1)
      })

      const take = (arr: any[], n: number) => arr
        .slice() // copy
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.max(0, n))

      const targetNotSeen = Math.round(count * 0.4)
      const targetReview = Math.round(count * 0.4)
      const targetWeak = count - targetNotSeen - targetReview

      const bucketNotSeen = take(notSeen, targetNotSeen)
      const bucketReview = take(dueToReview, targetReview)
      const bucketWeak = take(weak, targetWeak)

      let combined = [...bucketNotSeen, ...bucketReview, ...bucketWeak]

      // Compléter si insuffisant: fallback au sélecteur existant (score-based)
      if (combined.length < count) {
        const fallback = selectQuestionsForExam(
          questions.filter(q => !recentToAvoidIds.has(q.id) && passFilters(q) && !combined.find(c => c.id === q.id)),
          attempts,
          count - combined.length,
          options
        ).map(q => ({ ...q }))
        combined = [...combined, ...fallback]
      }

      selectedQuestions = combined.slice(0, count).map(q => ({
        ...q,
        score: 0,
        metrics: {
          successRate: 0,
          attemptCount: 0,
          daysSinceLastAttempt: 0,
          neverSeen: !progressByQ.has(q.id),
          category: q.categorie || 'Autre'
        }
      }))
      
      // Métadonnées pour l'examen
      const categoryDistribution = selectedQuestions.reduce((acc, q) => {
        const category = q.metrics.category
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      metadata = {
        totalSelected: selectedQuestions.length,
        categoryDistribution,
        buckets: {
          notSeen: bucketNotSeen.length,
          toReview: bucketReview.length,
          weak: bucketWeak.length
        },
        avoidedRecent: recentToAvoidIds.size
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
