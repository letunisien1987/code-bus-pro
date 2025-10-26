const fs = require('fs')
const path = require('path')

// Lire les définitions
const definitionsFile = path.join(__dirname, '..', 'lib', 'achievements', 'definitions.ts')
const definitionsContent = fs.readFileSync(definitionsFile, 'utf-8')

// Extraire le nombre de trophées des définitions
const achievementsMatch = definitionsContent.match(/export const ACHIEVEMENTS = \[([\s\S]*?)\]/)
if (achievementsMatch) {
  const achievementsContent = achievementsMatch[1]
  const trophyCount = (achievementsContent.match(/\{/g) || []).length
  console.log(`📊 Nombre total de trophées définis: ${trophyCount}`)
} else {
  console.log('❌ Impossible de lire les définitions')
}

// Lire les trophées débloqués
const achievementsFile = path.join(__dirname, '..', 'data', 'achievements.json')
let unlockedAchievements = []
if (fs.existsSync(achievementsFile)) {
  const data = fs.readFileSync(achievementsFile, 'utf-8')
  unlockedAchievements = JSON.parse(data)
}

console.log(`🏆 Trophées débloqués: ${unlockedAchievements.length}`)
console.log('')
console.log('📋 Détail des trophées débloqués:')
unlockedAchievements.forEach(achievement => {
  console.log(`   • ${achievement.type} (${achievement.level}) - ${new Date(achievement.unlockedAt).toLocaleDateString()}`)
})

// Simuler la logique de l'API
const userId = '102775192659809274711'
const userAchievements = unlockedAchievements.filter(a => a.userId === userId)
console.log('')
console.log(`👤 Trophées de l'utilisateur ${userId}: ${userAchievements.length}`)

// Compter les trophées uniques par type et level
const uniqueTrophies = new Set()
userAchievements.forEach(achievement => {
  uniqueTrophies.add(`${achievement.type}_${achievement.level}`)
})

console.log(`🎯 Trophées uniques débloqués: ${uniqueTrophies.size}`)
console.log('')
console.log('🔍 Types de trophées débloqués:')
uniqueTrophies.forEach(trophy => {
  console.log(`   • ${trophy}`)
})
