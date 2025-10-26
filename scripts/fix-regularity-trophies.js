const fs = require('fs')
const path = require('path')

const ACHIEVEMENTS_FILE = path.join(__dirname, '..', 'data', 'achievements.json')

console.log('🔧 Correction des trophées de régularité...')

// Lire les trophées existants
let achievements = []
if (fs.existsSync(ACHIEVEMENTS_FILE)) {
  const data = fs.readFileSync(ACHIEVEMENTS_FILE, 'utf-8')
  achievements = JSON.parse(data)
}

// Supprimer tous les trophées de régularité (daily_streak_*)
const regularityTypes = ['daily_streak_3', 'daily_streak_7', 'daily_streak_30', 'daily_streak_100']
const filteredAchievements = achievements.filter(achievement => 
  !regularityTypes.includes(achievement.type)
)

console.log(`📊 Trophées avant: ${achievements.length}`)
console.log(`📊 Trophées après: ${filteredAchievements.length}`)
console.log(`🗑️  Supprimés: ${achievements.length - filteredAchievements.length}`)

// Sauvegarder
fs.writeFileSync(ACHIEVEMENTS_FILE, JSON.stringify(filteredAchievements, null, 2))

console.log('✅ Trophées de régularité supprimés - ils seront recalculés correctement')
