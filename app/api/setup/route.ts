import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

/**
 * API Route pour initialiser la base de données PostgreSQL sur Vercel
 * Crée les tables via Prisma et importe les données depuis questions.json
 * À appeler une seule fois après le déploiement
 */
export async function POST() {
  try {
    console.log('🚀 Initialisation de la base de données PostgreSQL...')
    
    // 1. Créer les tables si elles n'existent pas
    console.log('📋 Création des tables...')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Question" (
        "id" TEXT PRIMARY KEY,
        "questionnaire" INTEGER NOT NULL,
        "question" TEXT NOT NULL,
        "categorie" TEXT,
        "astag D/F/I " TEXT,
        "enonce" TEXT,
        "optionA" TEXT,
        "optionB" TEXT,
        "optionC" TEXT,
        "optionD" TEXT,
        "bonneReponse" TEXT NOT NULL,
        "imagePath" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `)
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Attempt" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT,
        "questionId" TEXT NOT NULL,
        "choix" TEXT NOT NULL,
        "correct" BOOLEAN NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `)
    
    console.log('✅ Tables créées ou déjà existantes')
    
    // 2. Lire le fichier questions.json
    const questionsPath = path.join(process.cwd(), 'data', 'questions.json')
    const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'))
    
    console.log(`📊 ${questionsData.length} questions trouvées dans questions.json`)
    
    // 3. Supprimer les anciennes données (maintenant que les tables existent)
    try {
      await prisma.attempt.deleteMany()
      await prisma.question.deleteMany()
      console.log('🗑️  Anciennes données supprimées')
    } catch (e) {
      console.log('ℹ️  Aucune ancienne donnée à supprimer')
    }
    
    // 4. Importer les nouvelles questions
    let imported = 0
    for (const questionData of questionsData) {
      await prisma.question.create({
        data: {
          id: questionData.id,
          questionnaire: questionData.questionnaire,
          question: questionData.question,
          categorie: questionData.categorie || null,
          astag: questionData['astag D/F/I '] || null,
          enonce: questionData.enonce || questionData.question,
          optionA: (questionData.options as any).a || null,
          optionB: (questionData.options as any).b || null,
          optionC: (questionData.options as any).c || null,
          optionD: (questionData.options as any).d || null,
          bonneReponse: questionData.bonne_reponse,
          imagePath: `/${questionData.image_path}`
        }
      })
      imported++
    }
    
    console.log(`✅ ${imported} questions importées`)
    
    return NextResponse.json({
      success: true,
      message: `Base de données initialisée avec succès ! ${imported} questions importées.`,
      imported,
      total: questionsData.length
    })
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error)
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de l\'initialisation de la base de données',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API Setup - Utilisez POST pour initialiser la base de données',
    instructions: [
      '1. Créez une base Postgres sur Vercel',
      '2. Connectez-la à votre projet',
      '3. Appelez POST /api/setup',
      '4. La base sera initialisée avec le schéma et les données'
    ]
  })
}

