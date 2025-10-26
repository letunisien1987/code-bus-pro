import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { ACHIEVEMENTS } from '@/lib/achievements/definitions'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  const userId = session.user.id
  
  try {
    // Lire les trophées depuis PostgreSQL
    const unlockedAchievements = await prisma.achievement.findMany({
      where: { userId }
    })
    
    // Mapper avec les définitions
    const achievements = ACHIEVEMENTS.map(def => {
      const unlocked = unlockedAchievements.find(
        a => a.type === def.type && a.level === def.level
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
