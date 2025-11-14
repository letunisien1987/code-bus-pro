import { Question, Attempt } from '@prisma/client'
import { computeAccuracy } from '@/lib/learningMetrics'

export interface QuestionWithScore extends Question {
  score: number
  metrics: {
    successRate: number
    attemptCount: number
    daysSinceLastAttempt: number
    neverSeen: boolean
    category: string
  }
}

export interface SelectionOptions {
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

const DEFAULT_WEIGHTS = {
  neverSeen: 50,
  failureRate: 30,
  timeSinceLastAttempt: 20,
  categoryBalance: 0.8
}

export function calculateQuestionScore(
  question: Question,
  attempts: Attempt[],
  weights = DEFAULT_WEIGHTS
): QuestionWithScore {
  const questionAttempts = attempts.filter(a => a.questionId === question.id)
  const attemptCount = questionAttempts.length
  const neverSeen = attemptCount === 0
  const successRate = attemptCount > 0 
    ? questionAttempts.filter(a => a.correct).length / attemptCount 
    : 0
  const lastAttempt = questionAttempts.length > 0 
    ? questionAttempts[questionAttempts.length - 1].createdAt
    : null
  const daysSinceLastAttempt = lastAttempt 
    ? Math.floor((Date.now() - new Date(lastAttempt).getTime()) / (1000 * 60 * 60 * 24))
    : 999
  let score = 0
  if (neverSeen) {
    score += weights.neverSeen
  }
  const failureRate = 1 - successRate
  score += failureRate * weights.failureRate
  if (daysSinceLastAttempt > 7) {
    score += Math.min(daysSinceLastAttempt / 7, 10) * weights.timeSinceLastAttempt
  }
  score = Math.min(score, 100)
  return {
    ...question,
    score,
    metrics: {
      successRate,
      attemptCount,
      daysSinceLastAttempt,
      neverSeen,
      category: question.categorie || 'Autre'
    }
  }
}

export function selectQuestionsForExam(
  questions: Question[],
  attempts: Attempt[],
  count: number,
  options: SelectionOptions = { mode: 'exam', count }
): QuestionWithScore[] {
  let filteredQuestions = questions
  if (options.filters) {
    filteredQuestions = questions.filter(question => {
      if (options.filters?.questionnaire && options.filters.questionnaire !== 'all' 
          && question.questionnaire.toString() !== options.filters.questionnaire) {
        return false
      }
      if (options.filters?.categorie && options.filters.categorie !== 'all' 
          && question.categorie !== options.filters.categorie) {
        return false
      }
      if (options.filters?.astag && options.filters.astag !== 'all' 
          && question.astag !== options.filters.astag) {
        return false
      }
      return true
    })
  }
  const questionsWithScores = filteredQuestions.map(question => 
    calculateQuestionScore(question, attempts, options.weights)
  )
  const categoryGroups = new Map<string, QuestionWithScore[]>()
  questionsWithScores.forEach(q => {
    const category = q.metrics.category
    if (!categoryGroups.has(category)) {
      categoryGroups.set(category, [])
    }
    categoryGroups.get(category)!.push(q)
  })
  const selected: QuestionWithScore[] = []
  const categories = Array.from(categoryGroups.keys())
  const questionsPerCategory = Math.ceil(count / categories.length)
  categories.forEach(category => {
    const categoryQuestions = categoryGroups.get(category)!
      .sort((a, b) => b.score - a.score)
      .slice(0, questionsPerCategory)
    selected.push(...categoryQuestions)
  })
  if (selected.length < count) {
    const remaining = questionsWithScores
      .filter(q => !selected.includes(q))
      .sort((a, b) => b.score - a.score)
      .slice(0, count - selected.length)
    selected.push(...remaining)
  }
  return selected
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .sort(() => Math.random() - 0.5)
}

export function computeDifficultyTag(questionId: string, attempts: Attempt[]): string {
  const recent = attempts.filter(a => a.questionId === questionId).slice(-5)
  const acc = computeAccuracy(recent)
  if (recent.length < 3) return 'medium'
  if (acc < 0.6) return 'hard'
  if (acc < 0.8) return 'medium'
  return 'easy'
}

export function sortQuestionsForTraining(
  questions: Question[],
  attempts: Attempt[],
  options: SelectionOptions = { mode: 'training' }
): QuestionWithScore[] {
  let filteredQuestions = questions
  if (options.filters) {
    filteredQuestions = questions.filter(question => {
      if (options.filters?.questionnaire && options.filters.questionnaire !== 'all' 
          && question.questionnaire.toString() !== options.filters.questionnaire) {
        return false
      }
      if (options.filters?.categorie && options.filters.categorie !== 'all' 
          && question.categorie !== options.filters.categorie) {
        return false
      }
      if (options.filters?.astag && options.filters.astag !== 'all' 
          && question.astag !== options.filters.astag) {
        return false
      }
      return true
    })
  }
  return filteredQuestions
    .map(question => calculateQuestionScore(question, attempts, options.weights))
    .sort((a, b) => b.score - a.score)
}

export function getCategoryDistribution(questions: Question[]): Record<string, number> {
  const distribution: Record<string, number> = {}
  questions.forEach(question => {
    const category = question.categorie || 'Autre'
    distribution[category] = (distribution[category] || 0) + 1
  })
  return distribution
}

export function getLearningMetrics(questions: Question[], attempts: Attempt[]) {
  const totalQuestions = questions.length
  const totalAttempts = attempts.length
  const uniqueQuestionsAttempted = new Set(attempts.map(a => a.questionId)).size
  const neverSeenCount = totalQuestions - uniqueQuestionsAttempted
  const correctAttempts = attempts.filter(a => a.correct).length
  const overallSuccessRate = totalAttempts > 0 ? correctAttempts / totalAttempts : 0
  return {
    totalQuestions,
    totalAttempts,
    uniqueQuestionsAttempted,
    neverSeenCount,
    overallSuccessRate,
    categoryDistribution: getCategoryDistribution(questions)
  }
}
