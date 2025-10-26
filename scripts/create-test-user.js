const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db"
    }
  }
})

async function createTestUser() {
  try {
    console.log('🔄 Création d\'un utilisateur de test...')
    
    // Créer un utilisateur de test
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Utilisateur Test',
        role: 'STUDENT'
      }
    })
    
    console.log('✅ Utilisateur créé:', user.email)
    
    // Créer quelques tentatives de test
    const questions = await prisma.question.findMany({ take: 5 })
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      const isCorrect = Math.random() > 0.3 // 70% de réussite
      
      await prisma.attempt.create({
        data: {
          userId: user.id,
          questionId: question.id,
          choix: isCorrect ? question.bonneReponse : (question.bonneReponse === 'A' ? 'B' : 'A'),
          correct: isCorrect
        }
      })
    }
    
    console.log('✅ Tentatives de test créées')
    
    // Vérifier les données
    const attemptCount = await prisma.attempt.count({ where: { userId: user.id } })
    console.log(`📊 ${attemptCount} tentatives créées pour l'utilisateur`)
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
