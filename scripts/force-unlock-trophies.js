const fs = require('fs')
const path = require('path')

const achievementsFile = path.join(__dirname, '..', 'data', 'achievements.json')
const userId = '102775192659809274711'

console.log('🔓 Déblocage forcé des trophées manquants...')

// Lire les trophées actuels
let achievements = []
if (fs.existsSync(achievementsFile)) {
  const data = fs.readFileSync(achievementsFile, 'utf-8')
  achievements = JSON.parse(data)
}

// Trophées qui devraient être débloqués
const missingTrophies = [
  {
    type: 'training_5',
    level: 'bronze',
    value: 5
  },
  {
    type: 'training_10', 
    level: 'bronze',
    value: 10
  }
]

// Vérifier et ajouter les trophées manquants
missingTrophies.forEach(trophy => {
  const existing = achievements.find(a => 
    a.userId === userId && a.type === trophy.type
  )
  
  if (!existing) {
    const newAchievement = {
      id: `${userId}_${trophy.type}_${trophy.level}_${Date.now()}`,
      userId,
      type: trophy.type,
      level: trophy.level,
      value: trophy.value,
      unlockedAt: new Date().toISOString()
    }
    
    achievements.push(newAchievement)
    console.log(`✅ Débloqué: ${trophy.type} (${trophy.level})`)
  } else {
    console.log(`ℹ️  Déjà débloqué: ${trophy.type} (${trophy.level})`)
  }
})

// Sauvegarder
fs.writeFileSync(achievementsFile, JSON.stringify(achievements, null, 2))

console.log('')
console.log(`📊 Total trophées: ${achievements.length}`)
console.log('')
console.log('🏆 Vos trophées actuels:')
achievements.forEach(achievement => {
  console.log(`   • ${achievement.type} (${achievement.level}) - ${new Date(achievement.unlockedAt).toLocaleDateString()}`)
})
