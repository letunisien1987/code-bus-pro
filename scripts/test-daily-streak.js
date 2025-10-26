const fs = require('fs')
const path = require('path')

// Simuler la fonction calculateDailyStreak
function calculateDailyStreak(attempts, examHistory) {
  // Récupérer toutes les dates d'activité (tentatives + examens)
  const activityDates = new Set()
  
  // Ajouter les dates des tentatives
  attempts.forEach(attempt => {
    if (attempt.createdAt) {
      const date = new Date(attempt.createdAt).toISOString().split('T')[0]
      activityDates.add(date)
    }
  })
  
  // Ajouter les dates des examens
  examHistory.forEach(exam => {
    if (exam.completedAt) {
      const date = new Date(exam.completedAt).toISOString().split('T')[0]
      activityDates.add(date)
    }
  })
  
  // Trier les dates par ordre décroissant
  const sortedDates = Array.from(activityDates).sort().reverse()
  
  if (sortedDates.length === 0) return 0
  
  // Calculer la série en partant d'aujourd'hui
  const today = new Date().toISOString().split('T')[0]
  let streak = 0
  let currentDate = new Date(today)
  
  // Vérifier si l'utilisateur a été actif aujourd'hui
  if (!sortedDates.includes(today)) {
    // Si pas actif aujourd'hui, vérifier hier
    currentDate.setDate(currentDate.getDate() - 1)
    const yesterday = currentDate.toISOString().split('T')[0]
    if (!sortedDates.includes(yesterday)) {
      return 0 // Pas de série si pas actif aujourd'hui ni hier
    }
    streak = 1 // Commencer à 1 si actif hier mais pas aujourd'hui
  } else {
    streak = 1 // Actif aujourd'hui
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

console.log('📊 Test de la logique de série quotidienne')
console.log('=====================================')

// Afficher les dates d'activité
const activityDates = new Set()

attempts.forEach(attempt => {
  if (attempt.createdAt) {
    const date = new Date(attempt.createdAt).toISOString().split('T')[0]
    activityDates.add(date)
  }
})

examHistory.forEach(exam => {
  if (exam.completedAt) {
    const date = new Date(exam.completedAt).toISOString().split('T')[0]
    activityDates.add(date)
  }
})

const sortedDates = Array.from(activityDates).sort().reverse()
console.log(`📅 Dates d'activité: ${sortedDates.join(', ')}`)

// Calculer la série
const streak = calculateDailyStreak(attempts, examHistory)
console.log(`🔥 Série quotidienne: ${streak} jours`)

// Vérifier les trophées de régularité
console.log('\n🏆 État des trophées de régularité:')
console.log(`   3 jours: ${streak >= 3 ? '✅ Débloqué' : '❌ Verrouillé'}`)
console.log(`   7 jours: ${streak >= 7 ? '✅ Débloqué' : '❌ Verrouillé'}`)
console.log(`   30 jours: ${streak >= 30 ? '✅ Débloqué' : '❌ Verrouillé'}`)
console.log(`   100 jours: ${streak >= 100 ? '✅ Débloqué' : '❌ Verrouillé'}`)

console.log('\n📝 Explication:')
console.log('- La série se calcule en partant d\'aujourd\'hui')
console.log('- Elle compte les jours consécutifs d\'activité')
console.log('- L\'activité = tentatives d\'entraînement OU examens')
console.log('- Si pas d\'activité aujourd\'hui, la série est brisée')
