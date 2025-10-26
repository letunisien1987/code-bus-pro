const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testTimeTracking() {
  try {
    console.log('🧪 TEST DU TRACKING DU TEMPS');
    console.log('============================\n');
    
    // Test 1: Vérifier que le champ timeSpent existe dans Attempt
    console.log('1️⃣ Test du champ timeSpent dans Attempt...');
    const attemptSchema = await prisma.attempt.findFirst();
    if (attemptSchema) {
      console.log('✅ Champ timeSpent disponible dans Attempt');
      console.log(`   Exemple: timeSpent = ${attemptSchema.timeSpent}`);
    } else {
      console.log('⚠️  Aucune tentative trouvée');
    }
    
    // Test 2: Vérifier ExamHistory
    console.log('\n2️⃣ Test du modèle ExamHistory...');
    const examCount = await prisma.examHistory.count();
    console.log(`✅ ${examCount} examens dans ExamHistory`);
    
    if (examCount > 0) {
      const exam = await prisma.examHistory.findFirst();
      console.log(`   Exemple: timeSpent = ${exam.timeSpent}s`);
      console.log(`   Performance: ${exam.performanceScore || 'N/A'}`);
    }
    
    // Test 3: Calculer le temps total par utilisateur
    console.log('\n3️⃣ Calcul du temps total par utilisateur...');
    const users = await prisma.user.findMany({
      include: {
        attempts: true,
        examHistory: true
      }
    });
    
    users.forEach(user => {
      const trainingTime = user.attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
      const examTime = user.examHistory.reduce((sum, e) => sum + e.timeSpent, 0);
      const totalTime = trainingTime + examTime;
      
      console.log(`👤 ${user.email}:`);
      console.log(`   ⏱️  Entraînement: ${trainingTime}s`);
      console.log(`   ⏱️  Examens: ${examTime}s`);
      console.log(`   ⏱️  Total: ${totalTime}s (${Math.round(totalTime / 60)}min)`);
    });
    
    console.log('\n✅ Tests terminés avec succès!');
    console.log('\n📋 PROCHAINES ÉTAPES:');
    console.log('1. Connectez-vous sur http://localhost:3000');
    console.log('2. Allez dans l\'entraînement et répondez à une question');
    console.log('3. Vérifiez que timeSpent est enregistré');
    console.log('4. Faites un examen et vérifiez qu\'il est dans PostgreSQL');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testTimeTracking();
