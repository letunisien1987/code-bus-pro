import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const JSON_PATH = path.join(process.cwd(), 'config', 'data', 'questions.json')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('id')
    
    // Lire le fichier JSON
    const data = fs.readFileSync(JSON_PATH, 'utf-8')
    const questions = JSON.parse(data)
    
    // Transformer les champs pour correspondre au format attendu par le frontend
    const transformedQuestions = questions.map((q: any) => ({
      ...q,
      imagePath: q.image_path, // Mapper image_path vers imagePath
      optionA: q.options?.a || null,
      optionB: q.options?.b || null,
      optionC: q.options?.c || null,
      optionD: q.options?.d || null,
      bonneReponse: q.bonne_reponse
    }))
    
    // Si un ID spécifique est demandé
    if (questionId) {
      const question = transformedQuestions.find((q: any) => q.id === questionId)
      
      if (!question) {
        return NextResponse.json(
          { error: 'Question non trouvée' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(question)
    }
    
    // Sinon, retourner toutes les questions transformées
    return NextResponse.json(transformedQuestions)
  } catch (error) {
    console.error('Erreur lors de la récupération des questions:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des questions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mode, count } = body
    
    // Lire le fichier JSON
    const data = fs.readFileSync(JSON_PATH, 'utf-8')
    const questions = JSON.parse(data)
    
    // Transformer les champs pour correspondre au format attendu par le frontend
    const transformedQuestions = questions.map((q: any) => ({
      ...q,
      imagePath: q.image_path, // Mapper image_path vers imagePath
      optionA: q.options?.a || null,
      optionB: q.options?.b || null,
      optionC: q.options?.c || null,
      optionD: q.options?.d || null,
      bonneReponse: q.bonne_reponse
    }))
    
    if (mode === 'exam' && count) {
      // Sélectionner des questions aléatoires pour l'examen
      const shuffled = [...transformedQuestions].sort(() => 0.5 - Math.random())
      const selectedQuestions = shuffled.slice(0, parseInt(count))
      
      return NextResponse.json({
        success: true,
        questions: selectedQuestions,
        total: selectedQuestions.length
      })
    }
    
    // Mode par défaut : retourner toutes les questions
    return NextResponse.json({
      success: true,
      questions: transformedQuestions,
      total: transformedQuestions.length
    })
  } catch (error) {
    console.error('Erreur lors de la sélection des questions:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la sélection des questions' },
      { status: 500 }
    )
  }
}
