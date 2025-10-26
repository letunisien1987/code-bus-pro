const fs = require('fs')
const path = require('path')

const userId = '102775192659809274711'

// Lire les trophées débloqués
const achievementsFile = path.join(__dirname, '..', 'data', 'achievements.json')
let unlockedAchievements = []
if (fs.existsSync(achievementsFile)) {
  const data = fs.readFileSync(achievementsFile, 'utf-8')
  unlockedAchievements = JSON.parse(data).filter(a => a.userId === userId)
}

console.log('🔍 Vérification des catégories de trophées')
console.log('=========================================')
console.log('')

console.log(`🏆 Trophées débloqués: ${unlockedAchievements.length}`)
console.log('')

// Mapper les types aux catégories (basé sur les définitions)
const typeToCategory = {
  'first_exam': 'exam',
  'training_first': 'training', 
  'training_5': 'training',
  'training_10': 'training',
  'training_25': 'training',
  'training_50': 'training',
  'training_100': 'training',
  'answers_streak_5': 'answers',
  'answers_streak_10': 'answers',
  'answers_streak_25': 'answers',
  'answers_streak_50': 'answers',
  'total_correct_50': 'answers',
  'total_correct_250': 'answers',
  'total_correct_500': 'answers',
  'total_correct_1000': 'answers',
  'daily_streak_3': 'streak',
  'daily_streak_7': 'streak',
  'daily_streak_30': 'streak',
  'daily_streak_100': 'streak',
  'perfect_week': 'streak',
  'perfect_month': 'streak',
  'centenary': 'streak',
  'early_bird': 'time',
  'speed_lightning': 'speed',
  'speed_rocket': 'speed',
  'speed_supersonic': 'speed',
  'sniper': 'answers',
  'ninja': 'answers',
  'category_signalisation_bronze': 'category',
  'category_signalisation_gold': 'category',
  'category_regles_bronze': 'category',
  'category_regles_gold': 'category',
  'category_freins_bronze': 'category',
  'category_freins_gold': 'category',
  'category_poids_bronze': 'category',
  'category_poids_gold': 'category',
  'category_permis_bronze': 'category',
  'category_permis_gold': 'category',
  'category_moteur_bronze': 'category',
  'category_moteur_gold': 'category',
  'category_otr_bronze': 'category',
  'category_otr_gold': 'category',
  'category_entretien_bronze': 'category',
  'category_entretien_gold': 'category',
  'category_chargement_bronze': 'category',
  'category_chargement_gold': 'category',
  'category_roues_bronze': 'category',
  'category_roues_gold': 'category',
  'questionnaire_1': 'questionnaire',
  'questionnaire_2': 'questionnaire',
  'questionnaire_3': 'questionnaire',
  'questionnaire_4': 'questionnaire',
  'questionnaire_5': 'questionnaire',
  'performance_score_700': 'exam',
  'performance_score_800': 'exam',
  'performance_score_900': 'exam',
  'performance_score_1000': 'exam',
  'speed_bonus_max_5x': 'speed',
  'collector': 'meta'
}

// Grouper par catégorie
const groupedByCategory = {}
unlockedAchievements.forEach(achievement => {
  const category = typeToCategory[achievement.type] || 'other'
  if (!groupedByCategory[category]) {
    groupedByCategory[category] = []
  }
  groupedByCategory[category].push(achievement)
})

console.log('📋 Vos trophées par catégorie:')
Object.keys(groupedByCategory).forEach(category => {
  const trophies = groupedByCategory[category]
  console.log(`   • ${category}: ${trophies.length} trophée(s)`)
  trophies.forEach(trophy => {
    console.log(`     - ${trophy.type} (${trophy.level})`)
  })
})

console.log('')
console.log('🎯 Total visible dans l\'interface:')
const totalVisible = Object.values(groupedByCategory).reduce((sum, trophies) => sum + trophies.length, 0)
console.log(`   ${totalVisible} trophées devraient être visibles`)

console.log('')
console.log('🔍 Catégories qui s\'affichent dans l\'interface:')
const categoriesInUI = ['exam', 'answers', 'streak', 'category', 'questionnaire', 'training', 'speed', 'time', 'meta']
categoriesInUI.forEach(category => {
  const count = groupedByCategory[category]?.length || 0
  if (count > 0) {
    console.log(`   ✅ ${category}: ${count} trophée(s)`)
  } else {
    console.log(`   ❌ ${category}: 0 trophée(s)`)
  }
})
