import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const JSON_PATH = path.join(process.cwd(), 'config', 'data', 'questions.json')

// Lire le fichier JSON
export async function GET() {
  try {
    const data = fs.readFileSync(JSON_PATH, 'utf-8')
    const questions = JSON.parse(data)
    
    // Transformer les chemins d'image vers le nouveau format
    const transformedQuestions = questions.map((question: any) => ({
      ...question,
      image_path: question.image_path.replace('images/questionnaire_1/', 'images/questionnaire_1/app_zone/')
                                      .replace('images/questionnaire_2/', 'images/questionnaire_2/app_zone/')
                                      .replace('images/questionnaire_3/', 'images/questionnaire_3/app_zone/')
                                      .replace('images/questionnaire_4/', 'images/questionnaire_4/app_zone/')
                                      .replace('images/questionnaire_5/', 'images/questionnaire_5/app_zone/')
                                      .replace('images/questionnaire_6/', 'images/questionnaire_6/app_zone/')
                                      .replace('images/questionnaire_7/', 'images/questionnaire_7/app_zone/')
                                      .replace('images/questionnaire_8/', 'images/questionnaire_8/app_zone/')
                                      .replace('images/questionnaire_9/', 'images/questionnaire_9/app_zone/')
                                      .replace('images/questionnaire_10/', 'images/questionnaire_10/app_zone/')
    }))
    
    return NextResponse.json(transformedQuestions)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lecture fichier' },
      { status: 500 }
    )
  }
}

// Mettre à jour une question dans le fichier
export async function PUT(request: NextRequest) {
  try {
    const updatedQuestion = await request.json()
    
    // Transformer le chemin d'image vers l'ancien format pour la sauvegarde
    const questionToSave = {
      ...updatedQuestion,
      image_path: updatedQuestion.image_path.replace('/app_zone/', '/')
    }
    
    // Lire le fichier actuel
    const data = fs.readFileSync(JSON_PATH, 'utf-8')
    const questions = JSON.parse(data)
    
    // Trouver la question par son ID UUID (permanent et unique)
    const index = questions.findIndex((q: any) => q.id === questionToSave.id)
    
    if (index !== -1) {
      questions[index] = questionToSave
      
      // Sauvegarder dans le fichier
      fs.writeFileSync(JSON_PATH, JSON.stringify(questions, null, 2), 'utf-8')
      
      return NextResponse.json({ success: true, message: 'Question mise à jour avec succès' })
    }
    
    return NextResponse.json(
      { error: 'Question non trouvée' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Erreur API:', error)
    return NextResponse.json(
      { error: 'Erreur mise à jour' },
      { status: 500 }
    )
  }
}




