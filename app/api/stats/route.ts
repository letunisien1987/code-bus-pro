import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    // Récupérer toutes les questions avec leurs tentatives
    const questions = await prisma.question.findMany({
      include: { 
        attempts: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    // Calculer les statistiques globales
    const totalQuestions = questions.length
    const questionsWithAttempts = questions.filter(q => q.attempts.length > 0)
    const attemptedQuestions = questionsWithAttempts.length
    const totalAttempts = questions.reduce((sum, q) => sum + q.attempts.length, 0)
    const correctAttempts = questions.reduce((sum, q) => 
      sum + q.attempts.filter(a => a.correct).length, 0
    )
    const averageScore = totalAttempts > 0 
      ? Math.round((correctAttempts / totalAttempts) * 100) 
      : 0

    // Calculer le temps d'étude (estimation: 1 minute par tentative)
    const studyTime = Math.round((totalAttempts / 60) * 10) / 10

    // Calculer la série (jours consécutifs avec au moins une tentative)
    const uniqueDates = [...new Set(
      questions.flatMap(q => 
        q.attempts.map(a => new Date(a.createdAt).toDateString())
      )
    )].sort().reverse()
    
    let streak = 0
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    
    if (uniqueDates.length > 0) {
      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        streak = 1
        for (let i = 1; i < uniqueDates.length; i++) {
          const prevDate = new Date(uniqueDates[i - 1])
          const currDate = new Date(uniqueDates[i])
          const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / 86400000)
          if (diffDays === 1) {
            streak++
          } else {
            break
          }
        }
      }
    }

    // Calculer les statistiques par catégorie
    const categoryMap = new Map<string, {
      total: number
      attempted: number
      attempts: number
      correct: number
      notSeen: number
      toReview: number
      mastered: number
    }>()

    questions.forEach(q => {
      const category = q.categorie || 'Non catégorisé'
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          total: 0,
          attempted: 0,
          attempts: 0,
          correct: 0,
          notSeen: 0,
          toReview: 0,
          mastered: 0
        })
      }
      const stats = categoryMap.get(category)!
      stats.total++
      
      const attempts = q.attempts.length
      const correctCount = q.attempts.filter(a => a.correct).length
      const successRate = attempts > 0 ? (correctCount / attempts) : 0

      if (attempts === 0) {
        stats.notSeen++
      } else {
        stats.attempted++
        stats.attempts += attempts
        stats.correct += correctCount
        
        if (attempts >= 2 && successRate >= 0.8) {
          stats.mastered++
        } else {
          stats.toReview++
        }
      }
    })

    const byCategory = Array.from(categoryMap.entries()).map(([name, stats]) => ({
      name,
      total: stats.total,
      attempted: stats.attempted,
      correct: stats.correct,
      percentage: stats.attempts > 0 
        ? Math.round((stats.correct / stats.attempts) * 100) 
        : 0,
      notSeen: stats.notSeen,
      toReview: stats.toReview,
      mastered: stats.mastered
    })).sort((a, b) => b.total - a.total)

    // Calculer les statistiques par questionnaire
    const questionnaireMap = new Map<number, {
      total: number
      attempted: number
      attempts: number
      correct: number
    }>()

    questions.forEach(q => {
      const qNum = q.questionnaire
      if (!questionnaireMap.has(qNum)) {
        questionnaireMap.set(qNum, {
          total: 0,
          attempted: 0,
          attempts: 0,
          correct: 0
        })
      }
      const stats = questionnaireMap.get(qNum)!
      stats.total++
      
      if (q.attempts.length > 0) {
        stats.attempted++
        stats.attempts += q.attempts.length
        stats.correct += q.attempts.filter(a => a.correct).length
      }
    })

    const byQuestionnaire = Array.from(questionnaireMap.entries()).map(([number, stats]) => ({
      number,
      total: stats.total,
      attempted: stats.attempted,
      percentage: stats.attempts > 0 
        ? Math.round((stats.correct / stats.attempts) * 100) 
        : 0
    })).sort((a, b) => a.number - b.number)

    // Calculer les statistiques par question
    const byQuestion = questions.map(q => {
      const attempts = q.attempts.length
      const correctAttempts = q.attempts.filter(a => a.correct).length
      const successRate = attempts > 0 ? Math.round((correctAttempts / attempts) * 100) : 0
      
      let status: 'not_seen' | 'to_review' | 'mastered' = 'not_seen'
      if (attempts > 0) {
        if (attempts >= 2 && successRate >= 80) {
          status = 'mastered'
        } else {
          status = 'to_review'
        }
      }

      return {
        id: q.id,
        enonce: q.enonce || 'Pas d\'énoncé',
        categorie: q.categorie || 'Non catégorisé',
        questionnaire: q.questionnaire,
        attempts,
        correctAttempts,
        successRate,
        lastAttempt: q.attempts.length > 0 
          ? q.attempts[0].createdAt.toISOString() 
          : null,
        status
      }
    })

    // Trouver les questions problématiques
    const problematicQuestions = byQuestion
      .filter(q => q.attempts > 0 && q.successRate < 50)
      .sort((a, b) => a.successRate - b.successRate)
      .slice(0, 10)

    // Calculer l'activité récente (7 derniers jours)
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000)
    const recentAttempts = questions.flatMap(q => 
      q.attempts
        .filter(a => new Date(a.createdAt) >= sevenDaysAgo)
        .map(a => ({
          date: new Date(a.createdAt).toISOString().split('T')[0],
          correct: a.correct
        }))
    )

    const activityByDate = new Map<string, { total: number, correct: number }>()
    recentAttempts.forEach(({ date, correct }) => {
      if (!activityByDate.has(date)) {
        activityByDate.set(date, { total: 0, correct: 0 })
      }
      const stats = activityByDate.get(date)!
      stats.total++
      if (correct) stats.correct++
    })

    const recentActivity = Array.from(activityByDate.entries())
      .map(([date, stats]) => ({
        date,
        type: 'training' as const,
        score: Math.round((stats.correct / stats.total) * 100),
        questions: stats.total
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10)

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

