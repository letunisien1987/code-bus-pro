const fs = require('fs')
const path = require('path')

// Simuler la fonction calculateQualityDailyStreak
function calculateQualityDailyStreak(attempts, examHistory) {
  // Récupérer toutes les dates d'activité avec qualité
  const qualityActivityDates = new Set()
  
  // Ajouter les dates des tentatives avec au moins 70% de bonnes réponses
  const attemptsByDate = {}
  attempts.forEach(attempt => {
    if (attempt.createdAt) {
      const date = new Date(attempt.createdAt).toISOString().split('T')[0]
      if (!attemptsByDate[date]) {
        attemptsByDate[date] = { correct: 0, total: 0 }
      }
      attemptsByDate[date].total++
      if (attempt.correct) {
        attemptsByDate[date].correct++
      }
    }
  })
  
  // Vérifier les dates avec au moins 70% de bonnes réponses
  Object.entries(attemptsByDate).forEach(([date, stats]) => {
    const successRate = (stats.correct / stats.total) * 100
    if (successRate >= 70) {
      qualityActivityDates.add(date)
    }
  })
  
  // Ajouter les dates des examens avec au moins 80% de réussite
  examHistory.forEach(exam => {
    if (exam.completedAt && exam.percentage >= 80) {
      const date = new Date(exam.completedAt).toISOString().split('T')[0]
      qualityActivityDates.add(date)
    }
  })
  
  // Trier les dates par ordre décroissant
  const sortedDates = Array.from(qualityActivityDates).sort().reverse()
  
  if (sortedDates.length === 0) return 0
  
  // Calculer la série en partant d'aujourd'hui
  const today = new Date().toISOString().split('T')[0]
  let streak = 0
  let currentDate = new Date(today)
  
  // Vérifier si l'utilisateur a eu une bonne performance aujourd'hui
  if (!sortedDates.includes(today)) {
    // Si pas de bonne performance aujourd'hui, vérifier hier
    currentDate.setDate(currentDate.getDate() - 1)
    const yesterday = currentDate.toISOString().split('T')[0]
    if (!sortedDates.includes(yesterday)) {
      return 0 // Pas de série si pas de bonne performance aujourd'hui ni hier
    }
    streak = 1 // Commencer à 1 si bonne performance hier mais pas aujourd'hui
  } else {
    streak = 1 // Bonne performance aujourd'hui
  }
  
  // Continuer à compter les jours précédents
  for (let i = 1; i < 100; i++) { // Limite à 100 jours pour éviter les boucles infinies
    currentDate.setDate(currentDate.getDate() - 1)
    const checkDate = currentDate.toISOString().split('T')[0]
    
    if (sortedDates.includes(checkDate)) {
      streak++
    } else {
      break // Série brisée
    }
  }
  
  return streak
}

// Lire les données réelles
const ATTEMPTS_FILE = path.join(__dirname, '..', 'data', 'user-attempts.json')
const EXAM_HISTORY_FILE = path.join(__dirname, '..', 'data', 'exam-history.json')

let attempts = []
let examHistory = []

if (fs.existsSync(ATTEMPTS_FILE)) {
  const data = fs.readFileSync(ATTEMPTS_FILE, 'utf-8')
  attempts = JSON.parse(data)
}

if (fs.existsSync(EXAM_HISTORY_FILE)) {
  const data = fs.readFileSync(EXAM_HISTORY_FILE, 'utf-8')
  examHistory = JSON.parse(data)
}

console.log('📊 Test de la logique de série quotidienne AVEC QUALITÉ')
console.log('=====================================================')

// Analyser les tentatives par date
const attemptsByDate = {}
attempts.forEach(attempt => {
  if (attempt.createdAt) {
    const date = new Date(attempt.createdAt).toISOString().split('T')[0]
    if (!attemptsByDate[date]) {
      attemptsByDate[date] = { correct: 0, total: 0 }
    }
    attemptsByDate[date].total++
    if (attempt.correct) {
      attemptsByDate[date].correct++
    }
  }
})

console.log('\n📅 Analyse des performances par date:')
Object.entries(attemptsByDate).forEach(([date, stats]) => {
  const successRate = (stats.correct / stats.total) * 100
  const quality = successRate >= 70 ? '✅ Bonne' : '❌ Mauvaise'
  console.log(`   ${date}: ${stats.correct}/${stats.total} (${successRate.toFixed(1)}%) - ${quality}`)
})

// Analyser les examens
console.log('\n📝 Analyse des examens:')
examHistory.forEach(exam => {
  if (exam.completedAt) {
    const date = new Date(exam.completedAt).toISOString().split('T')[0]
    const quality = exam.percentage >= 80 ? '✅ Bon' : '❌ Mauvais'
    console.log(`   ${date}: ${exam.percentage}% - ${quality}`)
  }
})

// Calculer la série de qualité
const qualityStreak = calculateQualityDailyStreak(attempts, examHistory)
console.log(`\n🔥 Série quotidienne AVEC QUALITÉ: ${qualityStreak} jours`)

// Vérifier les trophées de régularité avec qualité
console.log('\n🏆 État des trophées de régularité AVEC QUALITÉ:')
console.log(`   Semaine parfaite (7 jours): ${qualityStreak >= 7 ? '✅ Débloqué' : '❌ Verrouillé'}`)
console.log(`   Mois parfait (30 jours): ${qualityStreak >= 30 ? '✅ Débloqué' : '❌ Verrouillé'}`)
console.log(`   Centenaire (100 jours): ${qualityStreak >= 100 ? '✅ Débloqué' : '❌ Verrouillé'}`)

console.log('\n📝 Explication:')
console.log('- Série de qualité = jours consécutifs avec de BONNES performances')
console.log('- Bonnes performances = 70%+ de bonnes réponses en entraînement OU 80%+ en examen')
console.log('- Si vous faites 4 examens avec de mauvaises notes, la série de qualité reste à 0')
console.log('- Seules les performances de qualité comptent pour les trophées "parfaits"')
