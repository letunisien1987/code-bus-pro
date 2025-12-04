import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

/**
 * API Route pour initialiser la base de données PostgreSQL sur Vercel
 * PROTÉGÉE : Réservée aux administrateurs
 * À appeler une seule fois après le déploiement
 */
export async function POST() {
  try {
    // Vérification authentification admin
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    if ((session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    console.log('🚀 Initialisation de la base de données PostgreSQL...')
    console.log('👤 Admin:', session.user.email)
    
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

