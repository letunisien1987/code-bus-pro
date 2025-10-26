import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { checkAndUnlockAchievements } from '../../../lib/achievements/checker'
import fs from 'fs'
import path from 'path'

const ATTEMPTS_FILE = path.join(process.cwd(), 'data', 'user-attempts.json')

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { questionId, choix, correct } = await request.json()
    const userId = session.user.id

    // Lire les tentatives existantes
    let attempts = []
    if (fs.existsSync(ATTEMPTS_FILE)) {
      const data = fs.readFileSync(ATTEMPTS_FILE, 'utf-8')
      attempts = JSON.parse(data)
    }

    // Créer la nouvelle tentative
    const attempt = {
      id: `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      questionId,
      choix,
      correct,
      userId,
      createdAt: new Date().toISOString()
    }

    // Ajouter la tentative
    attempts.push(attempt)

    // Sauvegarder
    fs.writeFileSync(ATTEMPTS_FILE, JSON.stringify(attempts, null, 2))

    // Vérifier les trophées
    let newAchievements: any[] = []
    try {
      newAchievements = await checkAndUnlockAchievements(userId)
    } catch (error) {
      console.error('Erreur lors de la vérification des trophées:', error)
    }

    return NextResponse.json({
      attempt,
      newAchievements
    })
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la tentative:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement de la tentative' },
      { status: 500 }
    )
  }
}
