import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const JSON_PATH = path.join(process.cwd(), 'config', 'data', 'questions.json')

// Sauvegarder toutes les questions
export async function POST(request: NextRequest) {
  try {
    const questions = await request.json()
    
    // Transformer les chemins d'image vers l'ancien format pour la sauvegarde
    const questionsToSave = questions.map((question: any) => ({
      ...question,
      image_path: question.image_path.replace('/app_zone/', '/')
    }))
    
    // Sauvegarder dans le fichier avec formatage
    fs.writeFileSync(JSON_PATH, JSON.stringify(questionsToSave, null, 2), 'utf-8')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur sauvegarde complète' },
      { status: 500 }
    )
  }
}




