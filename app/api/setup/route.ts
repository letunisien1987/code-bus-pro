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
    
    // 1. Lire le fichier questions.json
    const questionsPath = path.join(process.cwd(), 'data', 'questions.json')
    const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'))
    
    console.log(`📊 ${questionsData.length} questions trouvées dans questions.json`)
    
    // 2. Supprimer toutes les anciennes données
    await prisma.attempt.deleteMany()
    await prisma.question.deleteMany()
    console.log('🗑️  Anciennes données supprimées')
    
    // 3. Importer les nouvelles questions
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
      message: `Base de données initialisée avec succès !`,
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

