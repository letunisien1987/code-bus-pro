const fs = require('fs')
const path = require('path')

// Simuler la logique de déblocage avec vos vraies données
async function testRealTrophies() {
  console.log('🧪 Test des trophées avec vos données réelles')
  console.log('==============================================')
  
  const userId = '102775192659809274711'
  
  // Lire vos tentatives
  const attemptsFile = path.join(__dirname, '..', 'data', 'user-attempts.json')
  let attempts = []
  if (fs.existsSync(attemptsFile)) {
    const data = fs.readFileSync(attemptsFile, 'utf-8')
    attempts = JSON.parse(data).filter(a => a.userId === userId)
  }
  
  // Lire votre historique d'examens
  const examHistoryFile = path.join(__dirname, '..', 'data', 'exam-history.json')
  let examHistory = []
  if (fs.existsSync(examHistoryFile)) {
    const data = fs.readFileSync(examHistoryFile, 'utf-8')
    examHistory = JSON.parse(data).filter(e => e.userId === userId)
  }
  
  console.log(`📊 Vos données:`)
  console.log(`   • Tentatives: ${attempts.length}`)
  console.log(`   • Examens: ${examHistory.length}`)
  console.log('')
  
  // Calculer les stats comme le fait le checker
  const totalExams = examHistory.length
  const perfectExams = examHistory.filter(e => e.percentage === 100).length
  const examScore80 = examHistory.filter(e => e.percentage >= 80).length
  const examScore90 = examHistory.filter(e => e.percentage >= 90).length
  const examScore95 = examHistory.filter(e => e.percentage >= 95).length
  
  const trainingSessions = attempts.length
  const totalCorrectAnswers = attempts.filter(a => a.correct).length
  const currentAnswersStreak = 0 // À calculer proprement
  
  // Calculer la série quotidienne
  const allDates = new Set()
  attempts.forEach(attempt => {
    if (attempt.createdAt) {
      const date = new Date(attempt.createdAt).toISOString().split('T')[0]
      allDates.add(date)
    }
  })
  examHistory.forEach(exam => {
    if (exam.completedAt) {
      const date = new Date(exam.completedAt).toISOString().split('T')[0]
      allDates.add(date)
    }
  })
  
  const sortedDates = Array.from(allDates).sort().reverse()
  let dailyStreak = 0
  if (sortedDates.length > 0) {
    const today = new Date().toISOString().split('T')[0]
    let currentDate = new Date(today)
    
    if (sortedDates.includes(today)) {
      dailyStreak = 1
    } else {
      currentDate.setDate(currentDate.getDate() - 1)
      const yesterday = currentDate.toISOString().split('T')[0]
      if (sortedDates.includes(yesterday)) {
        dailyStreak = 1
      }
    }
    
    for (let i = 1; i < 100; i++) {
      currentDate.setDate(currentDate.getDate() - 1)
      const checkDate = currentDate.toISOString().split('T')[0]
      if (sortedDates.includes(checkDate)) {
        dailyStreak++
      } else {
        break
      }
    }
  }
  
  console.log(`📈 Vos statistiques:`)
  console.log(`   • Examens totaux: ${totalExams}`)
  console.log(`   • Examens parfaits: ${perfectExams}`)
  console.log(`   • Examens ≥80%: ${examScore80}`)
  console.log(`   • Examens ≥90%: ${examScore90}`)
  console.log(`   • Sessions d'entraînement: ${trainingSessions}`)
  console.log(`   • Réponses correctes: ${totalCorrectAnswers}`)
  console.log(`   • Série quotidienne: ${dailyStreak} jours`)
  console.log('')
  
  // Tester les trophées qui devraient être débloqués
  const testTrophies = [
    { type: 'first_exam', condition: totalExams >= 1, name: 'Premier pas' },
    { type: 'training_first', condition: trainingSessions >= 1, name: 'Premier entraînement' },
    { type: 'training_5', condition: trainingSessions >= 5, name: 'Débutant (5 sessions)' },
    { type: 'training_10', condition: trainingSessions >= 10, name: 'Régulier (10 sessions)' },
    { type: 'daily_streak_3', condition: dailyStreak >= 3, name: '3 jours consécutifs' },
    { type: 'daily_streak_7', condition: dailyStreak >= 7, name: '7 jours consécutifs' },
    { type: 'total_correct_50', condition: totalCorrectAnswers >= 50, name: '50 réponses correctes' },
    { type: 'exam_perfect_1', condition: perfectExams >= 1, name: 'Tour sans erreur' },
    { type: 'exam_score_80', condition: examScore80 >= 3, name: 'Bien joué (3 examens ≥80%)' },
    { type: 'exam_score_90', condition: examScore90 >= 3, name: 'Excellent (3 examens ≥90%)' }
  ]
  
  console.log(`🏆 Trophées qui devraient être débloqués:`)
  console.log('─'.repeat(50))
  
  let shouldBeUnlocked = 0
  testTrophies.forEach(trophy => {
    const isUnlocked = trophy.condition
    const status = isUnlocked ? '✅ DÉBLOQUÉ' : '❌ VERROUILLÉ'
    console.log(`${status} ${trophy.name.padEnd(30)} | ${trophy.type}`)
    if (isUnlocked) shouldBeUnlocked++
  })
  
  console.log('')
  console.log(`📊 Résumé:`)
  console.log(`   • Trophées qui devraient être débloqués: ${shouldBeUnlocked}`)
  console.log(`   • Trophées actuellement débloqués: 2`)
  
  if (shouldBeUnlocked > 2) {
    console.log('')
    console.log('⚠️  Il semble que certains trophées ne se débloquent pas correctement')
    console.log('🔧 Vérifiez la logique du checker')
  } else {
    console.log('')
    console.log('✅ Le nombre de trophées semble cohérent avec vos statistiques')
  }
}

testRealTrophies()
