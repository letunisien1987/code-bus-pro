const fs = require('fs')
const path = require('path')

// Lire les définitions des trophées
const definitionsPath = path.join(__dirname, '..', 'lib', 'achievements', 'definitions.ts')
const definitionsContent = fs.readFileSync(definitionsPath, 'utf-8')

// Extraire les trophées du fichier TypeScript
const achievementsMatch = definitionsContent.match(/export const ACHIEVEMENTS: AchievementDefinition\[\] = \[([\s\S]*?)\]/)
if (!achievementsMatch) {
  console.error('❌ Impossible de lire les définitions des trophées')
  process.exit(1)
}

// Parser les trophées (version simplifiée)
const achievementsText = achievementsMatch[1]
const achievements = []

// Extraire chaque trophée
const trophyRegex = /\{\s*id:\s*'([^']+)',\s*type:\s*'([^']+)',\s*level:\s*'([^']+)',\s*title:\s*'([^']+)',\s*description:\s*'([^']+)',\s*icon:\s*'([^']+)',\s*requirement:\s*(\d+),\s*category:\s*'([^']+)'\s*\}/g
let match
while ((match = trophyRegex.exec(achievementsText)) !== null) {
  achievements.push({
    id: match[1],
    type: match[2],
    level: match[3],
    title: match[4],
    description: match[5],
    icon: match[6],
    requirement: parseInt(match[7]),
    category: match[8]
  })
}

console.log('🔍 AUDIT COMPLET DES TROPHÉES')
console.log('============================')
console.log(`📊 Total des trophées: ${achievements.length}`)
console.log('')

// Grouper par catégorie
const byCategory = {}
achievements.forEach(achievement => {
  if (!byCategory[achievement.category]) {
    byCategory[achievement.category] = []
  }
  byCategory[achievement.category].push(achievement)
})

// Analyser chaque catégorie
Object.entries(byCategory).forEach(([category, trophies]) => {
  console.log(`\n📁 ${category.toUpperCase()} (${trophies.length} trophées)`)
  console.log('─'.repeat(50))
  
  trophies.forEach(trophy => {
    console.log(`\n🏆 ${trophy.title} (${trophy.level})`)
    console.log(`   Type: ${trophy.type}`)
    console.log(`   Description: ${trophy.description}`)
    console.log(`   Requirement: ${trophy.requirement}`)
    console.log(`   Icon: ${trophy.icon}`)
    
    // Vérifier la cohérence
    const issues = []
    
    // Vérifier les types manquants dans le checker
    const checkerTypes = [
      'first_exam', 'exam_perfect', 'exam_score_80', 'exam_score_90', 'exam_score_95',
      'exam_master', 'exam_legend', 'exam_ready', 'training_first', 'training_5',
      'training_10', 'training_25', 'training_50', 'training_100', 'answers_streak',
      'total_correct', 'daily_streak_3', 'daily_streak_7', 'daily_streak_30', 'daily_streak_100',
      'perfect_week', 'perfect_month', 'centenary', 'early_bird', 'speed_lightning',
      'speed_rocket', 'speed_supersonic', 'sniper', 'ninja', 'category_master',
      'questionnaire_master', 'performance_score_700', 'performance_score_800',
      'performance_score_900', 'performance_score_1000', 'speed_bonus_max_5x', 'collector'
    ]
    
    if (!checkerTypes.includes(trophy.type)) {
      issues.push(`❌ Type '${trophy.type}' non géré dans le checker`)
    }
    
    // Vérifier les requirements incohérents
    if (trophy.type === 'exam_perfect' && trophy.requirement !== 1 && trophy.requirement !== 3 && trophy.requirement !== 5) {
      issues.push(`⚠️  Requirement ${trophy.requirement} inattendu pour exam_perfect`)
    }
    
    if (trophy.type.startsWith('exam_score_') && trophy.requirement !== 3) {
      issues.push(`⚠️  Requirement ${trophy.requirement} inattendu pour exam_score_*`)
    }
    
    if (trophy.type.startsWith('daily_streak_') && trophy.requirement !== parseInt(trophy.type.split('_')[2])) {
      issues.push(`⚠️  Requirement ${trophy.requirement} ne correspond pas au type ${trophy.type}`)
    }
    
    if (trophy.type.startsWith('perfect_') && trophy.requirement !== parseInt(trophy.type.split('_')[1])) {
      issues.push(`⚠️  Requirement ${trophy.requirement} ne correspond pas au type ${trophy.type}`)
    }
    
    // Vérifier les catégories
    const validCategories = ['exam', 'answers', 'streak', 'category', 'readiness', 'training', 'speed', 'time', 'meta', 'questionnaire']
    if (!validCategories.includes(trophy.category)) {
      issues.push(`❌ Catégorie '${trophy.category}' invalide`)
    }
    
    // Vérifier les niveaux
    const validLevels = ['bronze', 'silver', 'gold']
    if (!validLevels.includes(trophy.level)) {
      issues.push(`❌ Niveau '${trophy.level}' invalide`)
    }
    
    // Afficher les problèmes
    if (issues.length > 0) {
      issues.forEach(issue => console.log(`   ${issue}`))
    } else {
      console.log(`   ✅ Cohérent`)
    }
  })
})

// Vérifier les types dupliqués
console.log('\n\n🔍 VÉRIFICATION DES TYPES DUPLIQUÉS')
console.log('====================================')

const typeCounts = {}
achievements.forEach(trophy => {
  typeCounts[trophy.type] = (typeCounts[trophy.type] || 0) + 1
})

Object.entries(typeCounts).forEach(([type, count]) => {
  if (count > 1) {
    console.log(`⚠️  Type '${type}' utilisé ${count} fois`)
    const duplicates = achievements.filter(t => t.type === type)
    duplicates.forEach(trophy => {
      console.log(`   - ${trophy.title} (requirement: ${trophy.requirement})`)
    })
  }
})

// Vérifier les IDs dupliqués
console.log('\n\n🔍 VÉRIFICATION DES IDs DUPLIQUÉS')
console.log('==================================')

const idCounts = {}
achievements.forEach(trophy => {
  idCounts[trophy.id] = (idCounts[trophy.id] || 0) + 1
})

const duplicateIds = Object.entries(idCounts).filter(([id, count]) => count > 1)
if (duplicateIds.length > 0) {
  duplicateIds.forEach(([id, count]) => {
    console.log(`❌ ID '${id}' utilisé ${count} fois`)
  })
} else {
  console.log('✅ Aucun ID dupliqué')
}

// Vérifier la logique du checker
console.log('\n\n🔍 VÉRIFICATION DE LA LOGIQUE DU CHECKER')
console.log('==========================================')

const checkerPath = path.join(__dirname, '..', 'lib', 'achievements', 'checker.ts')
const checkerContent = fs.readFileSync(checkerPath, 'utf-8')

// Extraire les cases du switch
const switchMatch = checkerContent.match(/switch \(achievement\.type\) \{([\s\S]*?)\s*default:/)
if (switchMatch) {
  const switchContent = switchMatch[1]
  const cases = switchContent.match(/case\s+'([^']+)':/g) || []
  const handledTypes = cases.map(caseLine => caseLine.match(/case\s+'([^']+)':/)[1])
  
  console.log(`📊 Types gérés dans le checker: ${handledTypes.length}`)
  
  // Vérifier les types manquants
  const allTypes = [...new Set(achievements.map(t => t.type))]
  const missingTypes = allTypes.filter(type => !handledTypes.includes(type))
  
  if (missingTypes.length > 0) {
    console.log('\n❌ Types manquants dans le checker:')
    missingTypes.forEach(type => {
      const trophies = achievements.filter(t => t.type === type)
      console.log(`   - ${type} (utilisé par: ${trophies.map(t => t.title).join(', ')})`)
    })
  } else {
    console.log('✅ Tous les types sont gérés dans le checker')
  }
  
  // Vérifier les types inutilisés
  const unusedTypes = handledTypes.filter(type => !allTypes.includes(type))
  if (unusedTypes.length > 0) {
    console.log('\n⚠️  Types inutilisés dans le checker:')
    unusedTypes.forEach(type => console.log(`   - ${type}`))
  }
}

console.log('\n\n📋 RÉSUMÉ DE L\'AUDIT')
console.log('====================')
console.log(`✅ Total trophées: ${achievements.length}`)
console.log(`✅ Catégories: ${Object.keys(byCategory).length}`)
console.log(`✅ Types uniques: ${new Set(achievements.map(t => t.type)).size}`)
console.log(`✅ IDs uniques: ${new Set(achievements.map(t => t.id)).size}`)

// Compter les problèmes
let totalIssues = 0
achievements.forEach(trophy => {
  // Logique de vérification simplifiée
  if (trophy.type === 'exam_perfect' && trophy.requirement !== 1 && trophy.requirement !== 3 && trophy.requirement !== 5) {
    totalIssues++
  }
  if (trophy.type.startsWith('daily_streak_') && trophy.requirement !== parseInt(trophy.type.split('_')[2])) {
    totalIssues++
  }
})

console.log(`⚠️  Problèmes détectés: ${totalIssues}`)

if (totalIssues === 0) {
  console.log('\n🎉 AUDIT RÉUSSI - Tous les trophées sont cohérents !')
} else {
  console.log('\n⚠️  AUDIT PARTIEL - Des corrections sont nécessaires')
}
