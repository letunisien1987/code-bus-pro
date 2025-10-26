import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { ACHIEVEMENTS } from '@/lib/achievements/definitions'
import { authOptions } from '../auth/[...nextauth]/route'
import fs from 'fs'
import path from 'path'

const ACHIEVEMENTS_FILE = path.join(process.cwd(), 'data', 'achievements.json')

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  const userId = session.user.id
  
  try {
    // Lire les trophées depuis le fichier JSON
    let unlockedAchievements = []
    if (fs.existsSync(ACHIEVEMENTS_FILE)) {
      const data = fs.readFileSync(ACHIEVEMENTS_FILE, 'utf-8')
      const allAchievements = JSON.parse(data)
      unlockedAchievements = allAchievements.filter((a: any) => a.userId === userId)
    }
    
    // Mapper avec les définitions
    const achievements = ACHIEVEMENTS.map(def => {
      const unlocked = unlockedAchievements.find(
        (a: any) => a.type === def.type && a.level === def.level
      )
      return {
        ...def,
        unlocked: !!unlocked,
        unlockedAt: unlocked?.unlockedAt
      }
    })
    
    return NextResponse.json({ achievements })
  } catch (error) {
    console.error('Erreur lors de la récupération des trophées:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des trophées' }, { status: 500 })
  }
}
