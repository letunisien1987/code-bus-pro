const fs = require('fs')
const path = require('path')

// Lire les définitions
const definitionsFile = path.join(__dirname, '..', 'lib', 'achievements', 'definitions.ts')
const definitionsContent = fs.readFileSync(definitionsFile, 'utf-8')

// Extraire les trophées des définitions
const achievementsMatch = definitionsContent.match(/export const ACHIEVEMENTS = \[([\s\S]*?)\]/)
if (!achievementsMatch) {
  console.log('❌ Impossible de lire les définitions')
  process.exit(1)
}

// Simuler la logique de l'API
const userId = '102775192659809274711'

// Lire les trophées débloqués
const achievementsFile = path.join(__dirname, '..', 'data', 'achievements.json')
let unlockedAchievements = []
if (fs.existsSync(achievementsFile)) {
  const data = fs.readFileSync(achievementsFile, 'utf-8')
  unlockedAchievements = JSON.parse(data).filter(a => a.userId === userId)
}

console.log('🔍 Debug de l\'interface des trophées')
console.log('=====================================')
console.log('')

// Simuler les définitions (version simplifiée)
const mockDefinitions = [
  { id: 'first_exam', type: 'first_exam', level: 'bronze', category: 'exam', title: 'Premier pas' },
  { id: 'training_first', type: 'training_first', level: 'bronze', category: 'training', title: 'Premier entraînement' },
  { id: 'training_5', type: 'training_5', level: 'bronze', category: 'training', title: 'Débutant' },
  { id: 'training_10', type: 'training_10', level: 'bronze', category: 'training', title: 'Régulier' }
]

// Simuler la logique de l'API
const achievements = mockDefinitions.map(def => {
  const unlocked = unlockedAchievements.find(
    a => a.type === def.type && a.level === def.level
  )
  return {
    ...def,
    unlocked: !!unlocked,
    unlockedAt: unlocked?.unlockedAt
  }
})

console.log(`📊 Total trophées définis: ${mockDefinitions.length}`)
console.log(`🏆 Trophées débloqués: ${achievements.filter(a => a.unlocked).length}`)
console.log('')

// Grouper par catégorie (comme dans l'interface)
const groupedByCategory = achievements.reduce((acc, ach) => {
  if (!acc[ach.category]) acc[ach.category] = []
  acc[ach.category].push(ach)
  return acc
}, {})

console.log('📋 Groupement par catégorie:')
Object.keys(groupedByCategory).forEach(category => {
  const categoryAchievements = groupedByCategory[category]
  const unlockedInCategory = categoryAchievements.filter(a => a.unlocked)
  
  console.log(`   • ${category}: ${unlockedInCategory.length}/${categoryAchievements.length} débloqués`)
  unlockedInCategory.forEach(achievement => {
    console.log(`     - ${achievement.title} (${achievement.level})`)
  })
})

console.log('')
console.log('🎯 Trophées qui devraient être visibles:')
achievements.filter(a => a.unlocked).forEach(achievement => {
  console.log(`   • ${achievement.title} (${achievement.category})`)
})
