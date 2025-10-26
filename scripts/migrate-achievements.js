const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function migrateAchievements() {
  try {
    console.log('🚀 Migration de achievements.json vers PostgreSQL...')
    
    const achievementsFile = path.join(process.cwd(), 'data', 'achievements.json')
    
    if (!fs.existsSync(achievementsFile)) {
      console.log('⚠️  Fichier achievements.json non trouvé')
      return
    }
    
    const achievements = JSON.parse(fs.readFileSync(achievementsFile, 'utf-8'))
    console.log(`📋 ${achievements.length} achievements trouvés`)
    
    let migrated = 0
    for (const achievement of achievements) {
      try {
        // Vérifier que l'utilisateur existe
        const user = await prisma.user.findUnique({
          where: { id: achievement.userId }
        })
        
        if (!user) {
          console.log(`⚠️  Utilisateur ${achievement.userId} non trouvé, création...`)
          await prisma.user.create({
            data: {
              id: achievement.userId,
              email: `${achievement.userId}@google.oauth`,
              name: `Utilisateur ${achievement.userId}`,
              role: 'STUDENT',
              emailVerified: new Date()
            }
          })
        }
        
        // Migrer l'achievement (upsert pour éviter les doublons)
        await prisma.achievement.upsert({
          where: { id: achievement.id },
          update: {},
          create: {
            id: achievement.id,
            userId: achievement.userId,
            type: achievement.type,
            level: achievement.level,
            value: achievement.value,
            unlockedAt: new Date(achievement.unlockedAt)
          }
        })
        
        migrated++
        console.log(`✅ Achievement ${achievement.type}/${achievement.level} migré pour ${achievement.userId}`)
      } catch (error) {
        console.error(`❌ Erreur migration achievement ${achievement.id}:`, error.message)
      }
    }
    
    console.log(`🎉 ${migrated}/${achievements.length} achievements migrés avec succès!`)
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateAchievements()
