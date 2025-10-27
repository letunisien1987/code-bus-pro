#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fonction pour copier les images vers app_zone
function copyImagesToAppZone(questionnaireNumber) {
  const sourceDir = `public/images/questionnaire_${questionnaireNumber}`;
  const targetDir = `public/images/questionnaire_${questionnaireNumber}/app_zone`;
  
  console.log(`📁 Traitement du questionnaire ${questionnaireNumber}...`);
  
  // Vérifier si le dossier source existe
  if (!fs.existsSync(sourceDir)) {
    console.log(`❌ Dossier source non trouvé: ${sourceDir}`);
    return;
  }
  
  // Créer le dossier app_zone s'il n'existe pas
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`✅ Dossier créé: ${targetDir}`);
  }
  
  // Lire tous les fichiers du dossier source
  const files = fs.readdirSync(sourceDir);
  let copiedCount = 0;
  
  files.forEach(file => {
    // Copier seulement les fichiers .jpg qui ne sont pas déjà dans app_zone
    if (file.endsWith('.jpg') && !file.startsWith('Question (')) {
      // Ignorer les fichiers qui ne sont pas des questions
      return;
    }
    
    if (file.endsWith('.jpg') && file.startsWith('Question (')) {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);
      
      // Vérifier si le fichier n'existe pas déjà dans app_zone
      if (!fs.existsSync(targetPath)) {
        try {
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`  📋 Copié: ${file}`);
          copiedCount++;
        } catch (error) {
          console.error(`  ❌ Erreur lors de la copie de ${file}:`, error.message);
        }
      } else {
        console.log(`  ⏭️  Déjà existant: ${file}`);
      }
    }
  });
  
  console.log(`✅ Questionnaire ${questionnaireNumber}: ${copiedCount} images copiées`);
  return copiedCount;
}

// Fonction principale
function main() {
  console.log('🚀 Début de la copie des images vers app_zone...');
  
  const questionnaires = [3, 4, 5, 6, 7, 8, 9];
  let totalCopied = 0;
  
  questionnaires.forEach(num => {
    const copied = copyImagesToAppZone(num);
    if (copied !== undefined) {
      totalCopied += copied;
    }
  });
  
  console.log(`\n📊 Résumé:`);
  console.log(`   📋 Total d'images copiées: ${totalCopied}`);
  console.log(`   📁 Questionnaires traités: ${questionnaires.length}`);
  console.log('🎉 Copie terminée!');
}

// Exécuter le script
main();
