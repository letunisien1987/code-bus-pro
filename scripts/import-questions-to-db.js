const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db"
    }
  }
})

async function importQuestions() {
  try {
    console.log('🔄 Import des questions dans la base de données...')
    
    // Lire le fichier JSON des questions
    const questionsPath = path.join(process.cwd(), 'config', 'data', 'questions.json')
    const questionsData = fs.readFileSync(questionsPath, 'utf-8')
    const questions = JSON.parse(questionsData)
    
    console.log(`📚 ${questions.length} questions trouvées`)
    
    // Vider les tables dans le bon ordre (contraintes de clés étrangères)
    await prisma.attempt.deleteMany()
    await prisma.questionProgress.deleteMany()
    await prisma.userProgress.deleteMany()
    await prisma.question.deleteMany()
    console.log('🗑️  Anciennes données supprimées')
    
    // Importer les questions
    let imported = 0
    for (const q of questions) {
      await prisma.question.create({
        data: {
          id: q.id,
          questionnaire: q.questionnaire,
          question: q.question,
          categorie: q.categorie || null,
          astag: q.astag || null,
          enonce: q.enonce || null,
          optionA: q.optionA || null,
          optionB: q.optionB || null,
          optionC: q.optionC || null,
          optionD: q.optionD || null,
          bonneReponse: q.bonneReponse || 'A',
          imagePath: q.imagePath || ''
        }
      })
      imported++
      if (imported % 100 === 0) {
        console.log(`✅ ${imported}/${questions.length} questions importées`)
      }
    }
    
    console.log(`🎉 ${imported} questions importées avec succès !`)
    
    // Vérifier l'import
    const count = await prisma.question.count()
    console.log(`📊 Total dans la base: ${count} questions`)
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importQuestions()
