import { Question, Attempt } from '@prisma/client'

/**
 * Calcule le taux de réussite d'une question
 */
export function calculateSuccessRate(questionId: string, attempts: Attempt[]): number {
  const questionAttempts = attempts.filter(a => a.questionId === questionId)
  if (questionAttempts.length === 0) return 0
  
  const correctAttempts = questionAttempts.filter(a => a.correct).length
  return correctAttempts / questionAttempts.length
}

/**
 * Calcule le nombre de jours depuis la dernière tentative
 */
export function getDaysSinceLastAttempt(questionId: string, attempts: Attempt[]): number {
  const questionAttempts = attempts.filter(a => a.questionId === questionId)
  if (questionAttempts.length === 0) return 999 // Jamais tenté
  
  const lastAttempt = questionAttempts[questionAttempts.length - 1]
  const now = new Date()
  const lastAttemptDate = new Date(lastAttempt.createdAt)
  const diffTime = now.getTime() - lastAttemptDate.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Compte le nombre de tentatives pour une question
 */
export function getAttemptCount(questionId: string, attempts: Attempt[]): number {
  return attempts.filter(a => a.questionId === questionId).length
}

/**
 * Obtient la répartition par catégorie des questions
 */
export function getCategoryDistribution(questions: Question[]): Record<string, number> {
  const distribution: Record<string, number> = {}
  
  questions.forEach(question => {
    const category = question.categorie || 'Autre'
    distribution[category] = (distribution[category] || 0) + 1
  })
  
  return distribution
}

/**
 * Obtient les statistiques d'apprentissage pour une question spécifique
 */
export function getQuestionStats(questionId: string, attempts: Attempt[]) {
  const questionAttempts = attempts.filter(a => a.questionId === questionId)
  
  return {
    attemptCount: questionAttempts.length,
    successRate: calculateSuccessRate(questionId, attempts),
    daysSinceLastAttempt: getDaysSinceLastAttempt(questionId, attempts),
    neverSeen: questionAttempts.length === 0,
    lastAttempt: questionAttempts.length > 0 ? questionAttempts[questionAttempts.length - 1] : null,
    recentAttempts: questionAttempts.slice(-5), // 5 dernières tentatives
    isStruggling: questionAttempts.length > 3 && calculateSuccessRate(questionId, attempts) < 0.5,
    isMastered: questionAttempts.length > 2 && calculateSuccessRate(questionId, attempts) > 0.8
  }
}

/**
 * Obtient les métriques globales d'apprentissage
 */
export function getGlobalLearningMetrics(questions: Question[], attempts: Attempt[]) {
  const totalQuestions = questions.length
  const totalAttempts = attempts.length
  const uniqueQuestionsAttempted = new Set(attempts.map(a => a.questionId)).size
  const neverSeenCount = totalQuestions - uniqueQuestionsAttempted
  
  const correctAttempts = attempts.filter(a => a.correct).length
  const overallSuccessRate = totalAttempts > 0 ? correctAttempts / totalAttempts : 0
  
  // Questions par statut
  const questionStats = questions.map(q => getQuestionStats(q.id, attempts))
  const masteredQuestions = questionStats.filter(s => s.isMastered).length
  const strugglingQuestions = questionStats.filter(s => s.isStruggling).length
  const newQuestions = questionStats.filter(s => s.neverSeen).length
  
  // Répartition par catégorie
  const categoryDistribution = getCategoryDistribution(questions)
  
  // Tentatives par jour (derniers 30 jours)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const recentAttempts = attempts.filter(a => 
    new Date(a.createdAt) >= thirtyDaysAgo
  )
  
  return {
    totalQuestions,
    totalAttempts,
    uniqueQuestionsAttempted,
    neverSeenCount,
    overallSuccessRate,
    masteredQuestions,
    strugglingQuestions,
    newQuestions,
    categoryDistribution,
    recentAttempts: recentAttempts.length,
    averageAttemptsPerQuestion: totalAttempts / totalQuestions,
    learningProgress: {
      new: newQuestions,
      struggling: strugglingQuestions,
      mastered: masteredQuestions,
      total: totalQuestions
    }
  }
}

/**
 * Identifie les questions prioritaires pour la révision
 */
export function getPriorityQuestions(questions: Question[], attempts: Attempt[], limit = 10) {
  const questionStats = questions.map(q => ({
    question: q,
    stats: getQuestionStats(q.id, attempts)
  }))
  
  // Score de priorité basé sur plusieurs facteurs
  const prioritized = questionStats.map(({ question, stats }) => {
    let priorityScore = 0
    
    // Questions jamais vues = priorité maximale
    if (stats.neverSeen) priorityScore += 100
    
    // Questions en difficulté = haute priorité
    if (stats.isStruggling) priorityScore += 80
    
    // Questions pas vues récemment = priorité moyenne
    if (stats.daysSinceLastAttempt > 7) priorityScore += 60
    
    // Questions avec taux d'échec élevé = priorité
    if (stats.successRate < 0.5 && stats.attemptCount > 0) priorityScore += 40
    
    return {
      question,
      stats,
      priorityScore
    }
  })
  
  return prioritized
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, limit)
    .map(item => item.question)
}

/**
 * Calcule la progression d'apprentissage
 */
export function calculateLearningProgress(questions: Question[], attempts: Attempt[]) {
  const questionStats = questions.map(q => getQuestionStats(q.id, attempts))
  
  const total = questions.length
  const newQuestions = questionStats.filter(s => s.neverSeen).length
  const inProgress = questionStats.filter(s => !s.neverSeen && !s.isMastered && !s.isStruggling).length
  const mastered = questionStats.filter(s => s.isMastered).length
  const struggling = questionStats.filter(s => s.isStruggling).length
  
  return {
    total,
    new: newQuestions,
    inProgress,
    mastered,
    struggling,
    percentages: {
      new: Math.round((newQuestions / total) * 100),
      inProgress: Math.round((inProgress / total) * 100),
      mastered: Math.round((mastered / total) * 100),
      struggling: Math.round((struggling / total) * 100)
    }
  }
}
