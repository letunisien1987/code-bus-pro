const fs = require('fs')
const path = require('path')

const achievementsFile = path.join(__dirname, '..', 'data', 'achievements.json')

console.log('🧹 Nettoyage des trophées obsolètes...')

// Lire les trophées actuels
let achievements = []
if (fs.existsSync(achievementsFile)) {
  const data = fs.readFileSync(achievementsFile, 'utf-8')
  achievements = JSON.parse(data)
}

console.log(`📊 Trophées avant nettoyage: ${achievements.length}`)

// Types obsolètes à supprimer
const obsoleteTypes = [
  'daily_streak', // Remplacé par daily_streak_3, daily_streak_7, etc.
  'answers_streak', // Remplacé par answers_streak_5, answers_streak_10, etc.
  'total_correct', // Remplacé par total_correct_50, total_correct_250, etc.
  'category_master', // Remplacé par category_signalisation_bronze, etc.
  'questionnaire_master', // Remplacé par questionnaire_1, questionnaire_2, etc.
  'exam_perfect', // Remplacé par exam_perfect_1, exam_perfect_3, etc.
  'training_5', // Remplacé par training_5 (mais vérifier la logique)
  'training_10', // Remplacé par training_10
  'training_25', // Remplacé par training_25
  'training_50', // Remplacé par training_50
  'training_100' // Remplacé par training_100
]

// Filtrer les trophées obsolètes
const validAchievements = achievements.filter(achievement => {
  const isObsolete = obsoleteTypes.includes(achievement.type)
  if (isObsolete) {
    console.log(`🗑️  Suppression: ${achievement.type} (${achievement.level})`)
  }
  return !isObsolete
})

console.log(`📊 Trophées après nettoyage: ${validAchievements.length}`)
console.log(`🗑️  Trophées supprimés: ${achievements.length - validAchievements.length}`)

// Sauvegarder
fs.writeFileSync(achievementsFile, JSON.stringify(validAchievements, null, 2))

console.log('✅ Nettoyage terminé !')
console.log('')
console.log('📋 Trophées restants:')
validAchievements.forEach(achievement => {
  console.log(`   • ${achievement.type} (${achievement.level})`)
})
