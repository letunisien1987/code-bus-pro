const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function migrateExamHistory() {
  try {
    console.log('🚀 Migration de exam-history.json vers PostgreSQL...')
    
    const examHistoryFile = path.join(process.cwd(), 'data', 'exam-history.json')
    
    if (!fs.existsSync(examHistoryFile)) {
      console.log('⚠️  Fichier exam-history.json non trouvé')
      return
    }
    
    const examHistory = JSON.parse(fs.readFileSync(examHistoryFile, 'utf-8'))
    console.log(`📋 ${examHistory.length} examens trouvés`)
    
    let migrated = 0
    for (const exam of examHistory) {
      try {
        // Vérifier que l'utilisateur existe
        const user = await prisma.user.findUnique({
          where: { id: exam.userId }
        })
        
        if (!user) {
          // Créer l'utilisateur s'il n'existe pas
          await prisma.user.create({
            data: {
              id: exam.userId,
              email: `${exam.userId}@google.oauth`,
              name: `Utilisateur ${exam.userId}`,
              role: 'STUDENT',
              emailVerified: new Date()
            }
          })
          console.log(`✅ Utilisateur créé: ${exam.userId}`)
        }
        
        // Migrer l'examen
        await prisma.examHistory.create({
          data: {
            id: exam.id,
            userId: exam.userId,
            score: exam.score,
            percentage: exam.percentage,
            total: exam.total,
            correct: exam.correct,
            incorrect: exam.incorrect,
            timeSpent: exam.timeSpent || 0,
            completedAt: new Date(exam.completedAt),
            performanceScore: exam.performanceScore,
            accuracyScore: exam.accuracyScore,
            speedBonus: exam.speedBonus,
            avgTimePerQuestion: exam.avgTimePerQuestion,
            performanceBadge: exam.performanceBadge
          }
        })
        
        migrated++
        console.log(`✅ Examen ${exam.id} migré`)
      } catch (error) {
        console.error(`❌ Erreur migration examen ${exam.id}:`, error.message)
      }
    }
    
    console.log(`🎉 ${migrated}/${examHistory.length} examens migrés avec succès!`)
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateExamHistory()
