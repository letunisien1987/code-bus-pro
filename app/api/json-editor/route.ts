import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { withAdminAuth } from '@/lib/auth-helpers'
import { questionSchema } from '@/lib/validations/json-editor'
import { formatZodError } from '@/lib/validations/auth'
import { validateImagePath } from '@/lib/path-validator'
import { jsonEditorRateLimit, getClientIP, checkRateLimit } from '@/lib/rate-limit'
import { validateCSRF } from '@/lib/csrf'
import { createSecureErrorResponse, logError } from '@/lib/error-handler'

const JSON_PATH = path.join(process.cwd(), 'config', 'data', 'questions.json')

// Lire le fichier JSON
export const GET = withAdminAuth(async (request: NextRequest, user) => {
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
    logError(error, {
      request,
      action: 'get_questions'
    })
    
    return createSecureErrorResponse(error, {
      request,
      action: 'get_questions'
    })
  }
})

// Mettre à jour une question dans le fichier
export const PUT = withAdminAuth(async (request: NextRequest, user) => {
  try {
    // Rate limiting pour le JSON Editor
    const ip = getClientIP(request)
    const { success: rateLimitSuccess } = await checkRateLimit(jsonEditorRateLimit, ip)
    
    if (!rateLimitSuccess) {
      return createSecureErrorResponse(
        new Error('Trop de requêtes vers l\'éditeur JSON'),
        {
          request,
          action: 'update_question',
          type: 'RATE_LIMIT' as any,
          statusCode: 429
        }
      )
    }

    // Vérification CSRF
    const csrfValidation = await validateCSRF(request)
    if (!csrfValidation.valid) {
      return createSecureErrorResponse(
        new Error(csrfValidation.error || 'Token CSRF invalide'),
        {
          request,
          action: 'update_question',
          type: 'CSRF' as any,
          statusCode: 403
        }
      )
    }

    const body = await request.json()
    
    // Validation avec Zod
    const validationResult = questionSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = formatZodError(validationResult.error)
      return NextResponse.json(
        { 
          error: 'Données de question invalides',
          details: errors 
        },
        { status: 400 }
      )
    }

    const updatedQuestion = validationResult.data

    // Validation du chemin d'image
    const imageValidation = validateImagePath(updatedQuestion.image_path)
    if (!imageValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Chemin d\'image invalide',
          details: imageValidation.error 
        },
        { status: 400 }
      )
    }
    
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
    logError(error, {
      request,
      action: 'update_question'
    })
    
    return createSecureErrorResponse(error, {
      request,
      action: 'update_question'
    })
  }
})




