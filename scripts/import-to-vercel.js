#!/usr/bin/env node

/**
 * Script pour importer les questions dans la base de données Vercel
 * Utilise la base de données PostgreSQL de Vercel
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importQuestions() {
  try {
    console.log('🔄 Import des questions vers Vercel...');
    
    // Lire le fichier questions.json
    const questionsPath = path.join(__dirname, '../config/data/questions.json');
    const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    
    console.log(`📊 ${questionsData.length} questions trouvées`);
    
    // Vider la table des questions existantes
    console.log('🗑️  Suppression des anciennes questions...');
    await prisma.question.deleteMany({});
    
    // Importer les nouvelles questions
    console.log('📥 Import des nouvelles questions...');
    let imported = 0;
    
    for (const question of questionsData) {
      try {
        await prisma.question.create({
          data: {
            id: question.id,
            questionnaire: question.questionnaire,
            question: question.question,
            enonce: question.enonce,
            optionA: question.options?.a || null,
            optionB: question.options?.b || null,
            optionC: question.options?.c || null,
            optionD: question.options?.d || null,
            bonneReponse: question.bonne_reponse,
            imagePath: question.image_path,
            categorie: question.categorie || null,
            astag: question["astag D/F/I "] || null
          }
        });
        imported++;
        
        if (imported % 50 === 0) {
          console.log(`✅ ${imported}/${questionsData.length} questions importées`);
        }
      } catch (error) {
        console.error(`❌ Erreur pour la question ${question.id}:`, error.message);
      }
    }
    
    console.log(`✅ Import terminé : ${imported}/${questionsData.length} questions`);
    
    // Vérifier l'import
    const count = await prisma.question.count();
    console.log(`📊 Total des questions en base : ${count}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter l'import
importQuestions();
