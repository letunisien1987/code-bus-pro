const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function deleteOldExams() {
  console.log('🔍 Recherche des anciens examens sans détails...')
  
  try {
    // Trouver les examens sans réponses
    const examsWithoutAnswers = await prisma.examHistory.findMany({
      where: {
        answers: {
          none: {}  // Aucune réponse associée
        }
      },
      include: {
        answers: true,
        user: {
          select: {
            email: true
          }
        }
      }
    })
    
    console.log(`📋 ${examsWithoutAnswers.length} anciens examens trouvés`)
    
    if (examsWithoutAnswers.length === 0) {
      console.log('✅ Aucun ancien examen à supprimer')
      return
    }
    
    // Afficher les détails des examens qui vont être supprimés
    console.log('\n📝 Détails des examens à supprimer:')
    examsWithoutAnswers.forEach((exam, index) => {
      console.log(`${index + 1}. ID: ${exam.id}`)
      console.log(`   Utilisateur: ${exam.user?.email || 'Inconnu'}`)
      console.log(`   Score: ${exam.score}/${exam.total} (${exam.percentage}%)`)
      console.log(`   Date: ${exam.createdAt ? exam.createdAt.toLocaleDateString('fr-FR') : 'Non définie'}`)
      console.log(`   Réponses: ${exam.answers.length}`)
      console.log('')
    })
    
    // Demander confirmation
    console.log('⚠️  ATTENTION: Cette opération est irréversible!')
    console.log('Les examens sans réponses détaillées seront définitivement supprimés.')
    console.log('')
    
    // Supprimer ces examens
    const deleted = await prisma.examHistory.deleteMany({
      where: {
        id: {
          in: examsWithoutAnswers.map(e => e.id)
        }
      }
    })
    
    console.log(`🗑️  ${deleted.count} anciens examens supprimés`)
    console.log('✅ Nettoyage terminé!')
    
    // Vérifier le résultat
    const remainingExams = await prisma.examHistory.count({
      where: {
        answers: {
          some: {}  // Au moins une réponse
        }
      }
    })
    
    console.log(`📊 Il reste ${remainingExams} examens avec détails complets`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error)
    throw error
  }
}

// Fonction pour supprimer par utilisateur spécifique
async function deleteOldExamsForUser(userId) {
  console.log(`🔍 Recherche des anciens examens pour l'utilisateur: ${userId}`)
  
  const examsWithoutAnswers = await prisma.examHistory.findMany({
    where: {
      userId: userId,
      answers: {
        none: {}
      }
    },
    include: {
      answers: true
    }
  })
  
  console.log(`📋 ${examsWithoutAnswers.length} anciens examens trouvés pour cet utilisateur`)
  
  if (examsWithoutAnswers.length === 0) {
    console.log('✅ Aucun ancien examen à supprimer pour cet utilisateur')
    return
  }
  
  const deleted = await prisma.examHistory.deleteMany({
    where: {
      userId: userId,
      answers: {
        none: {}
      }
    }
  })
  
  console.log(`🗑️  ${deleted.count} anciens examens supprimés pour cet utilisateur`)
  console.log('✅ Nettoyage terminé!')
}

// Vérifier les arguments de ligne de commande
const args = process.argv.slice(2)
const userId = args[0]

if (userId) {
  console.log(`🎯 Mode utilisateur spécifique: ${userId}`)
  deleteOldExamsForUser(userId)
    .catch(console.error)
    .finally(() => prisma.$disconnect())
} else {
  console.log('🌍 Mode global: suppression de tous les anciens examens')
  deleteOldExams()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
}
