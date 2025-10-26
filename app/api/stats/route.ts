import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔄 Début du calcul des statistiques...')
    
    // Pour le moment, utiliser l'utilisateur de test
    // TODO: Implémenter l'authentification réelle
    const testUserEmail = 'test@example.com'

    // Récupérer l'utilisateur depuis la base de données
    console.log('🔍 Recherche de l\'utilisateur:', testUserEmail)
    const user = await prisma.user.findUnique({
      where: { email: testUserEmail },
      include: {
        attempts: {
          include: {
            question: true
          }
        },
        progresses: {
          include: {
            question: true
          }
        }
      }
    })

    if (!user) {
      console.log('❌ Utilisateur non trouvé')
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    console.log('✅ Utilisateur trouvé:', user.email)
    console.log('📊 Tentatives:', user.attempts.length)
    console.log('📈 Progressions:', user.progresses.length)

    // Récupérer toutes les questions
    const allQuestions = await prisma.question.findMany()

    // Calculer les statistiques globales
    const totalQuestions = allQuestions.length
    const totalAttempts = user.attempts.length
    const correctAttempts = user.attempts.filter(a => a.correct).length
    const attemptedQuestions = new Set(user.attempts.map(a => a.questionId)).size
    const averageScore = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0
    const studyTime = Math.round(totalAttempts * 0.5) // Estimation: 30 secondes par tentative
    const streak = 0 // À implémenter si nécessaire

    // Calculer les statistiques par catégorie
    const categoryStats = new Map<string, {
      total: number
      attempted: number
      correct: number
      mastered: number
      toReview: number
      notSeen: number
    }>()

    allQuestions.forEach(q => {
      const category = q.categorie || 'Non catégorisé'
      if (!categoryStats.has(category)) {
        categoryStats.set(category, {
          total: 0,
          attempted: 0,
          correct: 0,
          mastered: 0,
          toReview: 0,
          notSeen: 0
        })
      }
      const stats = categoryStats.get(category)!
      stats.total++
    })

    // Analyser les tentatives par catégorie
    user.attempts.forEach(attempt => {
      const category = attempt.question.categorie || 'Non catégorisé'
      const stats = categoryStats.get(category)
      if (stats) {
        stats.attempted++
        if (attempt.correct) {
          stats.correct++
        }
      }
    })

    // Analyser les progressions par catégorie
    user.progresses.forEach(progress => {
      const category = progress.question.categorie || 'Non catégorisé'
      const stats = categoryStats.get(category)
      if (stats) {
        if (progress.status === 'mastered') {
          stats.mastered++
        } else if (progress.status === 'to_review') {
          stats.toReview++
        }
      }
    })

    const byCategory = Array.from(categoryStats.entries()).map(([name, stats]) => ({
      name,
      total: stats.total,
      attempted: stats.attempted,
      correct: stats.correct,
      percentage: stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0,
      notSeen: stats.total - stats.attempted,
      toReview: stats.toReview,
      mastered: stats.mastered
    })).sort((a, b) => b.total - a.total)

    // Calculer les statistiques par questionnaire
    const questionnaireStats = new Map<number, {
      total: number
      attempted: number
      correct: number
    }>()

    allQuestions.forEach(q => {
      if (!questionnaireStats.has(q.questionnaire)) {
        questionnaireStats.set(q.questionnaire, {
          total: 0,
          attempted: 0,
          correct: 0
        })
      }
      const stats = questionnaireStats.get(q.questionnaire)!
      stats.total++
    })

    user.attempts.forEach(attempt => {
      const stats = questionnaireStats.get(attempt.question.questionnaire)
      if (stats) {
        stats.attempted++
        if (attempt.correct) {
          stats.correct++
        }
      }
    })

    const byQuestionnaire = Array.from(questionnaireStats.entries()).map(([number, stats]) => ({
      number,
      total: stats.total,
      attempted: stats.attempted,
      percentage: stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0
    })).sort((a, b) => a.number - b.number)

    // Calculer les statistiques par question
    const questionStats = new Map<string, {
      attempts: number
      correctAttempts: number
      lastAttempt: Date | null
      status: string
    }>()

    user.attempts.forEach(attempt => {
      const questionId = attempt.questionId
      if (!questionStats.has(questionId)) {
        questionStats.set(questionId, {
          attempts: 0,
          correctAttempts: 0,
          lastAttempt: null,
          status: 'not_seen'
        })
      }
      const stats = questionStats.get(questionId)!
      stats.attempts++
      if (attempt.correct) {
        stats.correctAttempts++
      }
      if (!stats.lastAttempt || attempt.createdAt > stats.lastAttempt) {
        stats.lastAttempt = attempt.createdAt
      }
    })

    // Mettre à jour les statuts depuis les progressions
    user.progresses.forEach(progress => {
      const stats = questionStats.get(progress.questionId)
      if (stats) {
        stats.status = progress.status
      }
    })

    const byQuestion = allQuestions.map(q => {
      const stats = questionStats.get(q.id) || {
        attempts: 0,
        correctAttempts: 0,
        lastAttempt: null,
        status: 'not_seen'
      }
      
      return {
        id: q.id,
        enonce: q.enonce || 'Pas d\'énoncé',
        categorie: q.categorie || 'Non catégorisé',
        questionnaire: q.questionnaire,
        attempts: stats.attempts,
        correctAttempts: stats.correctAttempts,
        successRate: stats.attempts > 0 ? Math.round((stats.correctAttempts / stats.attempts) * 100) : 0,
        lastAttempt: stats.lastAttempt?.toISOString() || null,
        status: stats.status as 'not_seen' | 'to_review' | 'mastered'
      }
    })

    // Questions problématiques (taux de réussite < 50% et > 3 tentatives)
    const problematicQuestions = byQuestion
      .filter(q => q.attempts >= 3 && q.successRate < 50)
      .sort((a, b) => a.successRate - b.successRate)
      .slice(0, 10)

    // Activité récente (dernières tentatives)
    const recentActivity = user.attempts
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10)
      .map(attempt => ({
        date: attempt.createdAt.toLocaleDateString('fr-FR'),
        type: 'training' as const,
        score: attempt.correct ? 100 : 0,
        questions: 1
      }))

    return NextResponse.json({
      global: {
        totalQuestions,
        attemptedQuestions,
        totalAttempts,
        correctAttempts,
        averageScore,
        studyTime,
        streak,
        completedQuestions: attemptedQuestions,
        correctAnswers: correctAttempts,
        incorrectAnswers: totalAttempts - correctAttempts
      },
      byCategory,
      byQuestionnaire,
      byQuestion,
      problematicQuestions,
      recentActivity
    })
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error)
    return NextResponse.json(
      { error: 'Erreur lors du calcul des statistiques' },
      { status: 500 }
    )
  }
}