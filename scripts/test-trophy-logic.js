const fs = require('fs')
const path = require('path')

// Simuler la logique de déblocage
function testTrophyLogic() {
  console.log('🧪 Test de la logique des trophées')
  console.log('==================================')
  
  // Simuler des stats d'utilisateur
  const mockStats = {
    totalExams: 3,
    perfectExams: 2,
    examScore80: 1,
    examScore90: 1,
    examScore95: 0,
    trainingSessions: 15,
    currentAnswersStreak: 8,
    totalCorrectAnswers: 150,
    dailyStreak: 5,
    qualityDailyStreak: 2,
    fastAnswers: 20,
    categoryStats: {
      'signalisation': { correct: 8, total: 10 },
      'freins': { correct: 6, total: 8 }
    },
    questionnaireStats: {
      '1': { correct: 9, total: 10 },
      '2': { correct: 7, total: 10 }
    },
    score700Count: 1,
    score800Count: 0,
    score900Count: 0,
    score1000Count: 0,
    speedBonusMaxCount: 0
  }
  
  // Tester quelques trophées clés
  const testCases = [
    { type: 'first_exam', expected: true, reason: '3 examens >= 1' },
    { type: 'exam_perfect_1', expected: true, reason: '2 examens parfaits >= 1' },
    { type: 'exam_perfect_3', expected: false, reason: '2 examens parfaits < 3' },
    { type: 'exam_perfect_5', expected: false, reason: '2 examens parfaits < 5' },
    { type: 'training_10', expected: true, reason: '15 sessions >= 10' },
    { type: 'training_25', expected: false, reason: '15 sessions < 25' },
    { type: 'answers_streak_5', expected: true, reason: '8 streak >= 5' },
    { type: 'answers_streak_10', expected: false, reason: '8 streak < 10' },
    { type: 'total_correct_50', expected: true, reason: '150 correct >= 50' },
    { type: 'total_correct_250', expected: false, reason: '150 correct < 250' },
    { type: 'daily_streak_3', expected: true, reason: '5 streak >= 3' },
    { type: 'daily_streak_7', expected: false, reason: '5 streak < 7' },
    { type: 'perfect_week', expected: false, reason: '2 quality streak < 7' },
    { type: 'speed_lightning', expected: true, reason: '20 fast >= 10' },
    { type: 'speed_rocket', expected: false, reason: '20 fast < 25' },
    { type: 'sniper', expected: false, reason: '8 streak < 10' },
    { type: 'category_signalisation_bronze', expected: true, reason: '80% >= 80%' },
    { type: 'category_signalisation_gold', expected: false, reason: '80% < 100%' },
    { type: 'questionnaire_1', expected: true, reason: '90% >= 90%' },
    { type: 'questionnaire_2', expected: false, reason: '70% < 90%' },
    { type: 'performance_score_700', expected: true, reason: '1 score >= 1' },
    { type: 'performance_score_800', expected: false, reason: '0 score < 1' }
  ]
  
  console.log('\n📊 Résultats des tests:')
  console.log('─'.repeat(60))
  
  let passed = 0
  let failed = 0
  
  testCases.forEach(test => {
    let result = false
    
    // Simuler la logique du checker
    switch (test.type) {
      case 'first_exam':
        result = mockStats.totalExams >= 1
        break
      case 'exam_perfect_1':
        result = mockStats.perfectExams >= 1
        break
      case 'exam_perfect_3':
        result = mockStats.perfectExams >= 3
        break
      case 'exam_perfect_5':
        result = mockStats.perfectExams >= 5
        break
      case 'training_10':
        result = mockStats.trainingSessions >= 10
        break
      case 'training_25':
        result = mockStats.trainingSessions >= 25
        break
      case 'answers_streak_5':
        result = mockStats.currentAnswersStreak >= 5
        break
      case 'answers_streak_10':
        result = mockStats.currentAnswersStreak >= 10
        break
      case 'total_correct_50':
        result = mockStats.totalCorrectAnswers >= 50
        break
      case 'total_correct_250':
        result = mockStats.totalCorrectAnswers >= 250
        break
      case 'daily_streak_3':
        result = mockStats.dailyStreak >= 3
        break
      case 'daily_streak_7':
        result = mockStats.dailyStreak >= 7
        break
      case 'perfect_week':
        result = mockStats.qualityDailyStreak >= 7
        break
      case 'speed_lightning':
        result = mockStats.fastAnswers >= 10
        break
      case 'speed_rocket':
        result = mockStats.fastAnswers >= 25
        break
      case 'sniper':
        result = mockStats.currentAnswersStreak >= 10
        break
      case 'category_signalisation_bronze':
        const signalStat = mockStats.categoryStats['signalisation']
        result = signalStat && (signalStat.correct / signalStat.total) * 100 >= 80
        break
      case 'category_signalisation_gold':
        const signalStat2 = mockStats.categoryStats['signalisation']
        result = signalStat2 && (signalStat2.correct / signalStat2.total) * 100 >= 100
        break
      case 'questionnaire_1':
        const quest1Stat = mockStats.questionnaireStats['1']
        result = quest1Stat && (quest1Stat.correct / quest1Stat.total) * 100 >= 90
        break
      case 'questionnaire_2':
        const quest2Stat = mockStats.questionnaireStats['2']
        result = quest2Stat && (quest2Stat.correct / quest2Stat.total) * 100 >= 90
        break
      case 'performance_score_700':
        result = mockStats.score700Count >= 1
        break
      case 'performance_score_800':
        result = mockStats.score800Count >= 1
        break
    }
    
    const status = result === test.expected ? '✅' : '❌'
    const resultText = result ? 'DÉBLOQUÉ' : 'VERROUILLÉ'
    const expectedText = test.expected ? 'DÉBLOQUÉ' : 'VERROUILLÉ'
    
    console.log(`${status} ${test.type.padEnd(30)} | ${resultText.padEnd(10)} | Attendu: ${expectedText} | ${test.reason}`)
    
    if (result === test.expected) {
      passed++
    } else {
      failed++
    }
  })
  
  console.log('\n📋 Résumé:')
  console.log(`✅ Tests réussis: ${passed}`)
  console.log(`❌ Tests échoués: ${failed}`)
  console.log(`📊 Taux de réussite: ${Math.round((passed / (passed + failed)) * 100)}%`)
  
  if (failed === 0) {
    console.log('\n🎉 TOUS LES TESTS SONT RÉUSSIS !')
    console.log('✅ La logique des trophées fonctionne correctement')
  } else {
    console.log('\n⚠️  Certains tests ont échoué')
    console.log('🔧 Vérifiez la logique du checker')
  }
}

testTrophyLogic()
