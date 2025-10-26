import { ACHIEVEMENTS, AchievementDefinition } from './definitions'
import fs from 'fs'
import path from 'path'

const ACHIEVEMENTS_FILE = path.join(process.cwd(), 'data', 'achievements.json')

// Fonction pour calculer la vraie série quotidienne avec qualité
function calculateDailyStreak(attempts: any[], examHistory: any[]): number {
  // Récupérer toutes les dates d'activité (tentatives + examens)
  const activityDates = new Set<string>()
  
  // Ajouter les dates des tentatives
  attempts.forEach(attempt => {
    if (attempt.createdAt) {
      const date = new Date(attempt.createdAt).toISOString().split('T')[0]
      activityDates.add(date)
    }
  })
  
  // Ajouter les dates des examens
  examHistory.forEach(exam => {
    if (exam.completedAt) {
      const date = new Date(exam.completedAt).toISOString().split('T')[0]
      activityDates.add(date)
    }
  })
  
  // Trier les dates par ordre décroissant
  const sortedDates = Array.from(activityDates).sort().reverse()
  
  if (sortedDates.length === 0) return 0
  
  // Calculer la série en partant d'aujourd'hui
  const today = new Date().toISOString().split('T')[0]
  let streak = 0
  let currentDate = new Date(today)
  
  // Vérifier si l'utilisateur a été actif aujourd'hui
  if (!sortedDates.includes(today)) {
    // Si pas actif aujourd'hui, vérifier hier
    currentDate.setDate(currentDate.getDate() - 1)
    const yesterday = currentDate.toISOString().split('T')[0]
    if (!sortedDates.includes(yesterday)) {
      return 0 // Pas de série si pas actif aujourd'hui ni hier
    }
    streak = 1 // Commencer à 1 si actif hier mais pas aujourd'hui
  } else {
    streak = 1 // Actif aujourd'hui
  }
  
  // Continuer à compter les jours précédents
  for (let i = 1; i < 100; i++) { // Limite à 100 jours pour éviter les boucles infinies
    currentDate.setDate(currentDate.getDate() - 1)
    const checkDate = currentDate.toISOString().split('T')[0]
    
    if (sortedDates.includes(checkDate)) {
      streak++
    } else {
      break // Série brisée
    }
  }
  
  return streak
}

// Fonction pour calculer la série quotidienne avec qualité (bonnes performances)
function calculateQualityDailyStreak(attempts: any[], examHistory: any[]): number {
  // Récupérer toutes les dates d'activité avec qualité
  const qualityActivityDates = new Set<string>()
  
  // Ajouter les dates des tentatives avec au moins 70% de bonnes réponses
  const attemptsByDate: Record<string, { correct: number, total: number }> = {}
  attempts.forEach(attempt => {
    if (attempt.createdAt) {
      const date = new Date(attempt.createdAt).toISOString().split('T')[0]
      if (!attemptsByDate[date]) {
        attemptsByDate[date] = { correct: 0, total: 0 }
      }
      attemptsByDate[date].total++
      if (attempt.correct) {
        attemptsByDate[date].correct++
      }
    }
  })
  
  // Vérifier les dates avec au moins 70% de bonnes réponses
  Object.entries(attemptsByDate).forEach(([date, stats]) => {
    const successRate = (stats.correct / stats.total) * 100
    if (successRate >= 70) {
      qualityActivityDates.add(date)
    }
  })
  
  // Ajouter les dates des examens avec au moins 80% de réussite
  examHistory.forEach(exam => {
    if (exam.completedAt && exam.percentage >= 80) {
      const date = new Date(exam.completedAt).toISOString().split('T')[0]
      qualityActivityDates.add(date)
    }
  })
  
  // Trier les dates par ordre décroissant
  const sortedDates = Array.from(qualityActivityDates).sort().reverse()
  
  if (sortedDates.length === 0) return 0
  
  // Calculer la série en partant d'aujourd'hui
  const today = new Date().toISOString().split('T')[0]
  let streak = 0
  let currentDate = new Date(today)
  
  // Vérifier si l'utilisateur a eu une bonne performance aujourd'hui
  if (!sortedDates.includes(today)) {
    // Si pas de bonne performance aujourd'hui, vérifier hier
    currentDate.setDate(currentDate.getDate() - 1)
    const yesterday = currentDate.toISOString().split('T')[0]
    if (!sortedDates.includes(yesterday)) {
      return 0 // Pas de série si pas de bonne performance aujourd'hui ni hier
    }
    streak = 1 // Commencer à 1 si bonne performance hier mais pas aujourd'hui
  } else {
    streak = 1 // Bonne performance aujourd'hui
  }
  
  // Continuer à compter les jours précédents
  for (let i = 1; i < 100; i++) { // Limite à 100 jours pour éviter les boucles infinies
    currentDate.setDate(currentDate.getDate() - 1)
    const checkDate = currentDate.toISOString().split('T')[0]
    
    if (sortedDates.includes(checkDate)) {
      streak++
    } else {
      break // Série brisée
    }
  }
  
  return streak
}

export async function checkAndUnlockAchievements(userId: string) {
  const newAchievements: AchievementDefinition[] = []
  
  // Récupérer les stats de l'utilisateur
  const userStats = await getUserStats(userId)
  
  // Lire les trophées existants
  let existingAchievements = []
  if (fs.existsSync(ACHIEVEMENTS_FILE)) {
    const data = fs.readFileSync(ACHIEVEMENTS_FILE, 'utf-8')
    existingAchievements = JSON.parse(data)
  }
  
  // Vérifier chaque type de trophée
  for (const achievement of ACHIEVEMENTS) {
    const alreadyUnlocked = existingAchievements.find(
      (a: any) => a.userId === userId && a.type === achievement.type && a.level === achievement.level
    )
    
    if (!alreadyUnlocked && await isAchievementUnlocked(achievement, userStats)) {
      const newAchievement = {
        id: `${userId}_${achievement.type}_${achievement.level}_${Date.now()}`,
        userId,
        type: achievement.type,
        level: achievement.level,
        value: achievement.requirement,
        unlockedAt: new Date().toISOString()
      }
      
      existingAchievements.push(newAchievement)
      newAchievements.push(achievement)
    }
  }
  
  // Sauvegarder les nouveaux trophées
  if (newAchievements.length > 0) {
    fs.writeFileSync(ACHIEVEMENTS_FILE, JSON.stringify(existingAchievements, null, 2))
  }
  
  return newAchievements
}

async function getUserStats(userId: string) {
  // Lire les tentatives de l'utilisateur
  const ATTEMPTS_FILE = path.join(process.cwd(), 'data', 'user-attempts.json')
  const EXAM_HISTORY_FILE = path.join(process.cwd(), 'data', 'exam-history.json')
  
  let attempts = []
  let examHistory = []
  
  if (fs.existsSync(ATTEMPTS_FILE)) {
    const data = fs.readFileSync(ATTEMPTS_FILE, 'utf-8')
    attempts = JSON.parse(data).filter((a: any) => a.userId === userId)
  }
  
  if (fs.existsSync(EXAM_HISTORY_FILE)) {
    const data = fs.readFileSync(EXAM_HISTORY_FILE, 'utf-8')
    examHistory = JSON.parse(data).filter((e: any) => e.userId === userId)
  }
  
  // Calculer les stats d'examens
  const totalExams = examHistory.length
  const perfectExams = examHistory.filter((e: any) => e.percentage === 100).length
  const examScore80 = examHistory.filter((e: any) => e.percentage >= 80).length
  const examScore90 = examHistory.filter((e: any) => e.percentage >= 90).length
  const examScore95 = examHistory.filter((e: any) => e.percentage >= 95).length
  const examScores = examHistory.map((e: any) => e.percentage)
  
  // Calculer les stats de réponses
  const totalAttempts = attempts.length
  const totalCorrectAnswers = attempts.filter((a: any) => a.correct).length
  
  // Calculer la série actuelle de bonnes réponses
  let currentAnswersStreak = 0
  for (let i = attempts.length - 1; i >= 0; i--) {
    if (attempts[i].correct) {
      currentAnswersStreak++
    } else {
      break
    }
  }
  
  // Calculer les stats par catégorie (nécessite de lire les questions)
  const QUESTIONS_FILE = path.join(process.cwd(), 'data', 'questions.json')
  let questions = []
  if (fs.existsSync(QUESTIONS_FILE)) {
    const data = fs.readFileSync(QUESTIONS_FILE, 'utf-8')
    questions = JSON.parse(data)
  }
  
  const categoryStats: Record<string, { correct: number, total: number }> = {}
  const questionnaireStats: Record<string, { correct: number, total: number }> = {}
  
  // Initialiser les stats
  const categories = Array.from(new Set(questions.map((q: any) => q.categorie).filter(Boolean))) as string[]
  const questionnaires = Array.from(new Set(questions.map((q: any) => q.questionnaire.toString()))) as string[]
  
  categories.forEach((cat: string) => {
    categoryStats[cat] = { correct: 0, total: 0 }
  })
  
  questionnaires.forEach((q: string) => {
    questionnaireStats[q] = { correct: 0, total: 0 }
  })
  
  // Calculer les stats par catégorie et questionnaire
  attempts.forEach((attempt: any) => {
    const question = questions.find((q: any) => q.id === attempt.questionId)
    if (question) {
      if (question.categorie) {
        categoryStats[question.categorie].total++
        if (attempt.correct) {
          categoryStats[question.categorie].correct++
        }
      }
      
      const questionnaire = question.questionnaire.toString()
      questionnaireStats[questionnaire].total++
      if (attempt.correct) {
        questionnaireStats[questionnaire].correct++
      }
    }
  })
  
  // Compter les scores de performance
  const performanceScores = examHistory.map((e: any) => e.performanceScore || 0)
  const maxPerformanceScore = Math.max(...performanceScores, 0)
  const score700Count = performanceScores.filter((s: number) => s >= 700).length
  const score800Count = performanceScores.filter((s: number) => s >= 800).length
  const score900Count = performanceScores.filter((s: number) => s >= 900).length
  const score1000Count = performanceScores.filter((s: number) => s >= 1000).length
  const speedBonusMaxCount = examHistory.filter((e: any) => e.speedBonus === 300).length

  return {
    // Stats d'examens
    totalExams,
    perfectExams,
    examScore80,
    examScore90,
    examScore95,
    examScores,
    
    // Stats d'entraînement (approximation basée sur les tentatives)
    trainingSessions: Math.ceil(totalAttempts / 10), // Approximation
    
    // Stats de réponses
    currentAnswersStreak,
    totalCorrectAnswers,
    totalAttempts,
    
    // Stats de régularité (vraie logique)
    dailyStreak: calculateDailyStreak(attempts, examHistory),
    qualityDailyStreak: calculateQualityDailyStreak(attempts, examHistory),
    
    // Stats par catégorie
    categoryStats,
    
    // Stats par questionnaire
    questionnaireStats,
    
    // Stats de performance
    maxPerformanceScore,
    score700Count,
    score800Count,
    score900Count,
    score1000Count,
    speedBonusMaxCount,
    
    // Stats legacy - TOUTES À 0 pour un utilisateur qui n'a pas commencé
    highScoreExams: 0,
    excellentExams: 0,
    fastAnswers: 0, // Pour le trophée "Éclair"
    earlyBirdCount: 0, // Pour le trophée "Lève-tôt"
    unlockedAchievementsCount: 0 // Pour le trophée "Collectionneur"
  }
}

async function isAchievementUnlocked(achievement: AchievementDefinition, stats: any): Promise<boolean> {
  switch (achievement.type) {
    // Trophées d'examens
    case 'first_exam':
      return stats.totalExams >= achievement.requirement
    case 'exam_perfect_1':
      return stats.perfectExams >= 1
    case 'exam_perfect_3':
      return stats.perfectExams >= 3
    case 'exam_perfect_5':
      return stats.perfectExams >= 5
    case 'exam_score_80':
      return stats.examScore80 >= achievement.requirement
    case 'exam_score_90':
      return stats.examScore90 >= achievement.requirement
    case 'exam_score_95':
      return stats.examScore95 >= achievement.requirement
    case 'exam_master':
      return stats.totalExams >= achievement.requirement
    case 'exam_legend':
      return stats.totalExams >= achievement.requirement
    case 'exam_ready':
      // Conditions strictes pour être prêt pour l'examen :
      // 1. Au moins 5 examens passés
      // 2. Au moins 5 examens avec score >= 90%
      // 3. Toutes les catégories avec au moins 80% de réussite
      const hasEnoughExams = stats.totalExams >= 5
      const hasExcellentExams = stats.examScore90 >= 5
      const allCategoriesGood = Object.values(stats.categoryStats).every((cat: any) => 
        cat.total > 0 && (cat.correct / cat.total) * 100 >= 80
      )
      return hasEnoughExams && hasExcellentExams && allCategoriesGood

    // Trophées d'entraînement
    case 'training_first':
      return stats.trainingSessions >= 1
    case 'training_5':
      return stats.trainingSessions >= 5
    case 'training_10':
      return stats.trainingSessions >= 10
    case 'training_25':
      return stats.trainingSessions >= 25
    case 'training_50':
      return stats.trainingSessions >= 50
    case 'training_100':
      return stats.trainingSessions >= 100

    // Trophées de réponses
    case 'answers_streak_5':
      return stats.currentAnswersStreak >= 5
    case 'answers_streak_10':
      return stats.currentAnswersStreak >= 10
    case 'answers_streak_25':
      return stats.currentAnswersStreak >= 25
    case 'answers_streak_50':
      return stats.currentAnswersStreak >= 50
    case 'total_correct_50':
      return stats.totalCorrectAnswers >= 50
    case 'total_correct_250':
      return stats.totalCorrectAnswers >= 250
    case 'total_correct_500':
      return stats.totalCorrectAnswers >= 500
    case 'total_correct_1000':
      return stats.totalCorrectAnswers >= 1000

    // Trophées de temps (série simple - juste activité)
    case 'daily_streak_3':
      return stats.dailyStreak >= 3
    case 'daily_streak_7':
      return stats.dailyStreak >= 7
    case 'daily_streak_30':
      return stats.dailyStreak >= 30
    case 'daily_streak_100':
      return stats.dailyStreak >= 100
    
    // Trophées de régularité (série avec qualité - bonnes performances)
    case 'perfect_week':
      return stats.qualityDailyStreak >= 7
    case 'perfect_month':
      return stats.qualityDailyStreak >= 30
    case 'centenary':
      return stats.qualityDailyStreak >= 100
    case 'early_bird':
      return stats.earlyBirdCount >= achievement.requirement

    // Trophées de vitesse
    case 'speed_lightning':
      return stats.fastAnswers >= 10
    case 'speed_rocket':
      return stats.fastAnswers >= 25
    case 'speed_supersonic':
      return stats.fastAnswers >= 50
    case 'sniper':
      return stats.currentAnswersStreak >= 10
    case 'ninja':
      return stats.currentAnswersStreak >= 20

    // Trophées de catégories
    case 'category_signalisation_bronze':
    case 'category_signalisation_gold':
    case 'category_regles_bronze':
    case 'category_regles_gold':
    case 'category_freins_bronze':
    case 'category_freins_gold':
    case 'category_poids_bronze':
    case 'category_poids_gold':
    case 'category_permis_bronze':
    case 'category_permis_gold':
    case 'category_moteur_bronze':
    case 'category_moteur_gold':
    case 'category_otr_bronze':
    case 'category_otr_gold':
    case 'category_entretien_bronze':
    case 'category_entretien_gold':
    case 'category_chargement_bronze':
    case 'category_chargement_gold':
    case 'category_roues_bronze':
    case 'category_roues_gold':
      const categoryName = achievement.id.split('_')[1] // Extract category name (signalisation, freins, etc.)
      const categoryStat = stats.categoryStats[categoryName]
      if (!categoryStat || categoryStat.total === 0) return false
      const categoryScore = (categoryStat.correct / categoryStat.total) * 100
      return categoryScore >= achievement.requirement

    // Trophées de questionnaires
    case 'questionnaire_1':
    case 'questionnaire_2':
    case 'questionnaire_3':
    case 'questionnaire_4':
    case 'questionnaire_5':
      const questionnaireNumber = achievement.id.split('_')[1] // Extract questionnaire number
      const questionnaireStat = stats.questionnaireStats[questionnaireNumber]
      if (!questionnaireStat || questionnaireStat.total === 0) return false
      const questionnaireScore = (questionnaireStat.correct / questionnaireStat.total) * 100
      return questionnaireScore >= 90 // 90% pour maîtriser un questionnaire

    // Trophées de performance
    case 'performance_score_700':
      return stats.score700Count >= 1
    case 'performance_score_800':
      return stats.score800Count >= 1
    case 'performance_score_900':
      return stats.score900Count >= 1
    case 'performance_score_1000':
      return stats.score1000Count >= 1
    case 'speed_bonus_max_5x':
      return stats.speedBonusMaxCount >= 5

    // Trophées meta
    case 'collector':
      return stats.unlockedAchievementsCount >= achievement.requirement
    default:
      return false
  }
}
