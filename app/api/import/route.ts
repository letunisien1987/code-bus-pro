import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

// Validation des données JSON (PROTÉGÉ - Admin uniquement)
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

    console.log('🔄 Vérification des données JSON...')

    const questionsPath = path.join(process.cwd(), 'config', 'data', 'questions.json')
    if (!fs.existsSync(questionsPath)) {
      throw new Error('config/data/questions.json introuvable')
    }
    
    const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'))
    console.log(`📊 ${questionsData.length} questions trouvées dans questions.json`)

    // Compter les images disponibles dans public/images
    let imagesFound = 0
    const imagesBaseDir = path.join(process.cwd(), 'public', 'images')
    if (fs.existsSync(imagesBaseDir)) {
      const entries = fs.readdirSync(imagesBaseDir, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const subdir = path.join(imagesBaseDir, entry.name)
          const files = fs.readdirSync(subdir, { withFileTypes: true }).filter(f => f.isFile())
          imagesFound += files.length
        }
      }
    }

    // Valider la structure des questions
    let validQuestions = 0
    let invalidQuestions = 0
    
    for (const q of questionsData) {
      if (q.id && q.question && q.bonne_reponse && q.options) {
        validQuestions++
      } else {
        invalidQuestions++
        console.warn(`Question invalide: ${q.id || 'sans ID'}`)
      }
    }

    console.log(`✅ Validation terminée : ${validQuestions} questions valides, ${invalidQuestions} invalides`)
    
    return NextResponse.json({
      success: true,
      message: `${validQuestions} questions validées avec succès`,
      imported: validQuestions,
      total: questionsData.length,
      invalid: invalidQuestions,
      imagesFound
    })
  } catch (error) {
    console.error('Erreur lors de la validation:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erreur lors de la validation des données',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
