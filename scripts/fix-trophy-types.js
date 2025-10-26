const fs = require('fs')
const path = require('path')

const definitionsPath = path.join(__dirname, '..', 'lib', 'achievements', 'definitions.ts')
let content = fs.readFileSync(definitionsPath, 'utf-8')

console.log('🔧 Correction des types de trophées...')

// Remplacer tous les types de catégories
const categoryReplacements = [
  { from: "type: 'category_master'", to: "type: 'category_regles_bronze'" },
  { from: "type: 'category_master'", to: "type: 'category_regles_gold'" },
  { from: "type: 'category_master'", to: "type: 'category_freins_bronze'" },
  { from: "type: 'category_master'", to: "type: 'category_freins_gold'" },
  { from: "type: 'category_master'", to: "type: 'category_poids_bronze'" },
  { from: "type: 'category_master'", to: "type: 'category_poids_gold'" },
  { from: "type: 'category_master'", to: "type: 'category_permis_bronze'" },
  { from: "type: 'category_master'", to: "type: 'category_permis_gold'" },
  { from: "type: 'category_master'", to: "type: 'category_moteur_bronze'" },
  { from: "type: 'category_master'", to: "type: 'category_moteur_gold'" },
  { from: "type: 'category_master'", to: "type: 'category_otr_bronze'" },
  { from: "type: 'category_master'", to: "type: 'category_otr_gold'" },
  { from: "type: 'category_master'", to: "type: 'category_entretien_bronze'" },
  { from: "type: 'category_master'", to: "type: 'category_entretien_gold'" },
  { from: "type: 'category_master'", to: "type: 'category_chargement_bronze'" },
  { from: "type: 'category_master'", to: "type: 'category_chargement_gold'" },
  { from: "type: 'category_master'", to: "type: 'category_roues_bronze'" },
  { from: "type: 'category_master'", to: "type: 'category_roues_gold'" }
]

// Remplacer les types de questionnaires
const questionnaireReplacements = [
  { from: "type: 'questionnaire_master'", to: "type: 'questionnaire_1'" },
  { from: "type: 'questionnaire_master'", to: "type: 'questionnaire_2'" },
  { from: "type: 'questionnaire_master'", to: "type: 'questionnaire_3'" },
  { from: "type: 'questionnaire_master'", to: "type: 'questionnaire_4'" },
  { from: "type: 'questionnaire_master'", to: "type: 'questionnaire_5'" }
]

// Remplacer les types de vitesse
const speedReplacements = [
  { from: "type: 'sniper'", to: "type: 'sniper'" },
  { from: "type: 'ninja'", to: "type: 'ninja'" }
]

// Appliquer les remplacements pour les catégories
let categoryIndex = 0
content = content.replace(/type: 'category_master'/g, (match) => {
  const replacements = [
    'category_regles_bronze', 'category_regles_gold',
    'category_freins_bronze', 'category_freins_gold',
    'category_poids_bronze', 'category_poids_gold',
    'category_permis_bronze', 'category_permis_gold',
    'category_moteur_bronze', 'category_moteur_gold',
    'category_otr_bronze', 'category_otr_gold',
    'category_entretien_bronze', 'category_entretien_gold',
    'category_chargement_bronze', 'category_chargement_gold',
    'category_roues_bronze', 'category_roues_gold'
  ]
  
  if (categoryIndex < replacements.length) {
    const newType = replacements[categoryIndex]
    categoryIndex++
    return `type: '${newType}'`
  }
  return match
})

// Appliquer les remplacements pour les questionnaires
let questionnaireIndex = 0
content = content.replace(/type: 'questionnaire_master'/g, (match) => {
  const replacements = ['questionnaire_1', 'questionnaire_2', 'questionnaire_3', 'questionnaire_4', 'questionnaire_5']
  
  if (questionnaireIndex < replacements.length) {
    const newType = replacements[questionnaireIndex]
    questionnaireIndex++
    return `type: '${newType}'`
  }
  return match
})

// Supprimer les trophées de progression dupliqués (ils sont déjà dans les réponses)
content = content.replace(/  \/\/ ===== TROPHÉES DE PROGRESSION \(5 trophées\) =====[\s\S]*?{ id: 'collector'[\s\S]*?},[\s]*\n/g, '')

// Écrire le fichier corrigé
fs.writeFileSync(definitionsPath, content)

console.log('✅ Types de trophées corrigés !')
console.log('📊 Vérification...')

// Vérifier les types uniques
const typeMatches = content.match(/type: '([^']+)'/g) || []
const types = typeMatches.map(match => match.match(/type: '([^']+)'/)[1])
const uniqueTypes = [...new Set(types)]

console.log(`📈 Types uniques: ${uniqueTypes.length}`)
console.log(`📈 Total types: ${types.length}`)

if (uniqueTypes.length === types.length) {
  console.log('🎉 Tous les types sont uniques !')
} else {
  console.log('⚠️  Il reste des types dupliqués')
  const duplicates = types.filter((type, index) => types.indexOf(type) !== index)
  console.log('Dupliqués:', [...new Set(duplicates)])
}
