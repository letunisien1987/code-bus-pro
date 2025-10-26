import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const JSON_PATH = path.join(process.cwd(), 'config', 'data', 'questions.json')

export async function GET() {
  try {
    // Lire le fichier JSON
    const data = fs.readFileSync(JSON_PATH, 'utf-8')
    const questions = JSON.parse(data)

    // Calculer les statistiques globales (version simplifiée)
    const totalQuestions = questions.length
    const attemptedQuestions = 0 // Pas de tentatives stockées dans JSON
    const totalAttempts = 0
    const correctAttempts = 0
    const averageScore = 0
    const studyTime = 0
    const streak = 0

    // Calculer les statistiques par catégorie (version simplifiée)
    const categoryMap = new Map<string, number>()
    questions.forEach((q: any) => {
      const category = q.categorie || 'Non catégorisé'
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
    })

    const byCategory = Array.from(categoryMap.entries()).map(([name, total]) => ({
      name,
      total,
      attempted: 0,
      correct: 0,
      percentage: 0,
      notSeen: total,
      toReview: 0,
      mastered: 0
    })).sort((a, b) => b.total - a.total)

    // Calculer les statistiques par questionnaire (version simplifiée)
    const questionnaireMap = new Map<number, number>()
    questions.forEach((q: any) => {
      const qNum = q.questionnaire
      questionnaireMap.set(qNum, (questionnaireMap.get(qNum) || 0) + 1)
    })

    const byQuestionnaire = Array.from(questionnaireMap.entries()).map(([number, total]) => ({
      number,
      total,
      attempted: 0,
      percentage: 0
    })).sort((a, b) => a.number - b.number)

    // Calculer les statistiques par question (version simplifiée)
    const byQuestion = questions.map((q: any) => ({
      id: q.id,
      enonce: q.enonce || 'Pas d\'énoncé',
      categorie: q.categorie || 'Non catégorisé',
      questionnaire: q.questionnaire,
      attempts: 0,
      correctAttempts: 0,
      successRate: 0,
      lastAttempt: null,
      status: 'not_seen' as const
    }))

    const problematicQuestions: any[] = []
    const recentActivity: any[] = []

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