import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import fs from 'fs'
import path from 'path'

export async function POST() {
  try {
    console.log('🔄 Import des questions via Prisma (compatible Vercel) - v3...')

    const questionsPath = path.join(process.cwd(), 'data', 'questions.json')
    if (!fs.existsSync(questionsPath)) {
      throw new Error('data/questions.json introuvable')
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

    // Nettoyer l'ancienne donnée
    await prisma.attempt.deleteMany()
    await prisma.question.deleteMany()

    // Importer les questions
    let imported = 0
    for (const q of questionsData) {
      await prisma.question.create({
        data: {
          id: q.id,
          questionnaire: q.questionnaire,
          question: q.question,
          categorie: q.categorie || null,
          astag: q['astag D/F/I '] || null,
          enonce: q.enonce || q.question,
          optionA: (q.options as any)?.a || null,
          optionB: (q.options as any)?.b || null,
          optionC: (q.options as any)?.c || null,
          optionD: (q.options as any)?.d || null,
          bonneReponse: q.bonne_reponse,
          imagePath: `/${q.image_path}`
        }
      })
      imported++
    }

    console.log(`✅ Import terminé : ${imported}/${questionsData.length}`)
    return NextResponse.json({
      success: true,
      message: `${imported} questions importées avec succès`,
      imported,
      total: questionsData.length,
      imagesFound
    })
  } catch (error) {
    console.error('Erreur lors de l\'importation:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erreur lors de l\'importation des données',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
