import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface UserProgressData {
  userId: string
  questionId: string
  attempts: number
  lastAttemptCorrect: boolean
  lastAttemptAt: Date
}

export interface UserStats {
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  streak: number
  studyTime: number
  averageScore: number
}

/**
 * Sauvegarde une tentative d'un utilisateur pour une question
 */
export async function saveUserAttempt(data: UserProgressData) {
  try {
    // Vérifier si une progression existe déjà pour cette question
    const existingProgress = await prisma.userProgress.findUnique({
      where: {
        userId_questionId: {
          userId: data.userId,
          questionId: data.questionId
        }
      }
    })

    if (existingProgress) {
      // Mettre à jour la progression existante
      return await prisma.userProgress.update({
        where: {
          userId_questionId: {
            userId: data.userId,
            questionId: data.questionId
          }
        },
        data: {
          attempts: existingProgress.attempts + 1,
          lastAttemptCorrect: data.lastAttemptCorrect,
          lastAttemptAt: data.lastAttemptAt,
          updatedAt: new Date()
        }
      })
    } else {
      // Créer une nouvelle progression
      return await prisma.userProgress.create({
        data: {
          userId: data.userId,
          questionId: data.questionId,
          attempts: 1,
          lastAttemptCorrect: data.lastAttemptCorrect,
          lastAttemptAt: data.lastAttemptAt
        }
      })
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la progression:', error)
    throw error
  }
}

/**
 * Récupère la progression d'un utilisateur pour une question spécifique
 */
export async function getUserProgressForQuestion(userId: string, questionId: string) {
  try {
    return await prisma.userProgress.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId
        }
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération de la progression:', error)
    throw error
  }
}

/**
 * Récupère toutes les progressions d'un utilisateur
 */
export async function getAllUserProgress(userId: string) {
  try {
    return await prisma.userProgress.findMany({
      where: { userId },
      include: {
        question: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des progressions:', error)
    throw error
  }
}

/**
 * Calcule les statistiques d'un utilisateur
 */
export async function calculateUserStats(userId: string): Promise<UserStats> {
  try {
    const progressions = await prisma.userProgress.findMany({
      where: { userId }
    })

    const totalQuestions = progressions.length
    const correctAnswers = progressions.filter(p => p.lastAttemptCorrect).length
    const incorrectAnswers = totalQuestions - correctAnswers
    const averageScore = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0

    // Calculer la série actuelle (consecutive correct answers)
    let streak = 0
    const sortedProgressions = progressions
      .filter(p => p.lastAttemptAt)
      .sort((a, b) => new Date(b.lastAttemptAt!).getTime() - new Date(a.lastAttemptAt!).getTime())

    for (const progression of sortedProgressions) {
      if (progression.lastAttemptCorrect) {
        streak++
      } else {
        break
      }
    }

    // Calculer le temps d'étude (approximatif basé sur les tentatives)
    const studyTime = progressions.reduce((total, p) => total + p.attempts, 0) * 2 // 2 minutes par tentative

    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      streak,
      studyTime,
      averageScore
    }
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error)
    throw error
  }
}

/**
 * Récupère l'historique des tentatives d'un utilisateur
 */
export async function getUserAttemptsHistory(userId: string, limit: number = 50) {
  try {
    return await prisma.attempt.findMany({
      where: { userId },
      include: {
        question: {
          select: {
            id: true,
            question: true,
            questionnaire: true,
            categorie: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error)
    throw error
  }
}

/**
 * Sauvegarde une tentative dans la table Attempt
 */
export async function saveAttempt(userId: string, questionId: string, choix: string, correct: boolean) {
  try {
    return await prisma.attempt.create({
      data: {
        userId,
        questionId,
        choix,
        correct
      }
    })
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la tentative:', error)
    throw error
  }
}
