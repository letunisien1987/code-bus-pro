import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

const JSON_PATH = path.join(process.cwd(), 'config', 'data', 'questions.json')

// Sauvegarder toutes les questions (PROTÉGÉ - Admin uniquement)
export async function POST(request: NextRequest) {
  try {
    // Vérification authentification admin
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    if ((session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

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




