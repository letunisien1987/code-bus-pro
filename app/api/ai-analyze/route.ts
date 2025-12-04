import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'
import { getImageUrl } from '@/lib/blob-helper'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
})

// SÉCURITÉ: Validation du chemin d'image pour éviter path traversal
function isValidImagePath(imagePath: string): boolean {
  // Normaliser le chemin et vérifier qu'il ne contient pas de traversal
  const normalized = path.normalize(imagePath)
  if (normalized.includes('..') || normalized.startsWith('/')) {
    return false
  }
  // Vérifier que c'est bien un chemin d'image valide
  if (!normalized.match(/^images\/questionnaire_\d+\/.*\.(jpg|jpeg|png)$/i)) {
    return false
  }
  return true
}

interface Question {
  id: string
  numero_question: number
  questionnaire: number
  question: string
  categorie: string | null
  "astag D/F/I ": string | null
  enonce: string | null
  options: {
    a: string
    b: string
    c: string
    d?: string
  }
  bonne_reponse: string
  image_path: string
}

interface AIAnalysisResult {
  hasErrors: boolean
  extractedData?: {
    numero_question: number
    question: string
    categorie: string
    astag: string
    enonce: string
    options: { a: string; b: string; c: string }
    bonne_reponse: string
  }
  suggestions: {
    numero_question?: number
    question?: string
    categorie?: string
    astag?: string
    enonce?: string
    options?: { a?: string; b?: string; c?: string }
    bonne_reponse?: string
  }
  confidence: 'high' | 'medium' | 'low'
  analysis: string
}

export async function POST(request: NextRequest) {
  try {
    // SÉCURITÉ: Authentification admin requise (coûts OpenAI)
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 })
    }
    if ((session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    // Vérifier si l'API key est configurée
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key-for-build') {
      return NextResponse.json({
        error: 'OpenAI API key not configured'
      }, { status: 500 })
    }

    const { question, imagePath } = await request.json() as { question: Question; imagePath: string }

    // SÉCURITÉ: Validation du chemin d'image (anti path traversal)
    if (!isValidImagePath(imagePath)) {
      return NextResponse.json({
        error: 'Chemin d\'image invalide'
      }, { status: 400 })
    }
    
    // Extraire le numéro de question du nom de fichier (ex: "Question (25).jpg" -> 25)
    const imageFilename = imagePath.split('/').pop() || ''
    const numeroMatch = imageFilename.match(/Question\s*\((\d+)\)/)
    const numeroFromFilename = numeroMatch ? parseInt(numeroMatch[1]) : question.numero_question

    // Obtenir l'URL de l'image (Blob en production, locale en développement)
    const imageUrl = await getImageUrl(imagePath)
    
    // Variables pour l'image
    let base64Image: string
    let mimeType: string
    
    // En développement local, utiliser le système de fichiers
    if (imageUrl.startsWith('/')) {
      const fullImagePath = path.join(process.cwd(), 'public', imagePath)
      
      // Vérifier que l'image existe
      if (!fs.existsSync(fullImagePath)) {
        return NextResponse.json(
          { error: `Image non trouvée: ${fullImagePath}` },
          { status: 404 }
        )
      }

      // Lire l'image de la question et la convertir en base64
      const imageBuffer = fs.readFileSync(fullImagePath)
      base64Image = imageBuffer.toString('base64')
      const imageExtension = path.extname(fullImagePath).toLowerCase()
      mimeType = imageExtension === '.png' ? 'image/png' : 'image/jpeg'
    } else {
      // En production, télécharger depuis Vercel Blob
      try {
        const response = await fetch(imageUrl)
        if (!response.ok) {
          throw new Error(`Erreur lors du téléchargement: ${response.status}`)
        }
        
        const imageBuffer = await response.arrayBuffer()
        base64Image = Buffer.from(imageBuffer).toString('base64')
        const imageExtension = path.extname(imagePath).toLowerCase()
        mimeType = imageExtension === '.png' ? 'image/png' : 'image/jpeg'
      } catch (error) {
        return NextResponse.json(
          { error: `Erreur lors du téléchargement de l'image depuis Blob: ${error}` },
          { status: 500 }
        )
      }
    }
    
    // Obtenir l'URL de l'image de réponse
    const answerImagePath = `images/reponse/reponses ${question.questionnaire}.jpg`
    const answerImageUrl = await getImageUrl(answerImagePath)
    
    // Lire l'image de réponse si elle existe
    let base64AnswerImage: string | null = null
    if (answerImageUrl.startsWith('/')) {
      // En développement local
      const fullAnswerPath = path.join(process.cwd(), 'public', answerImagePath)
      if (fs.existsSync(fullAnswerPath)) {
        const answerBuffer = fs.readFileSync(fullAnswerPath)
        base64AnswerImage = answerBuffer.toString('base64')
      }
    } else {
      // En production, télécharger depuis Vercel Blob
      try {
        const response = await fetch(answerImageUrl)
        if (response.ok) {
          const answerBuffer = await response.arrayBuffer()
          base64AnswerImage = Buffer.from(answerBuffer).toString('base64')
        }
      } catch (error) {
        console.warn(`Image de réponse non trouvée: ${answerImagePath}`)
      }
    }

    // Créer le prompt pour OpenAI
    const prompt = `Tu es un assistant d'extraction de données pour des questions d'examen de conduite.

NOM DU FICHIER IMAGE: ${imageFilename}
LE NUMÉRO DE QUESTION EST: ${numeroFromFilename} (extrait du nom du fichier)

${base64AnswerImage ? 'Tu vas recevoir DEUX images :' : 'Tu vas recevoir UNE image :'}
${base64AnswerImage ? '1. IMAGE DE QUESTION : Contient la question et les options A, B, C' : '1. IMAGE DE QUESTION : Contient la question et les options A, B, C'}
${base64AnswerImage ? '2. IMAGE DE RÉPONSES : Feuille de correction montrant les bonnes réponses (cases cochées ou surlignées)' : ''}

EXTRACTION REQUISE :
1. NUMÉRO DE QUESTION: ${numeroFromFilename} (DÉJÀ EXTRAIT DU NOM DU FICHIER - utilise cette valeur)
2. CODE QUESTION: Le code à 4 chiffres en haut de l'image question (ex: "0004", "0188", "3107")
3. CATÉGORIE: Le thème visible dans l'image (ex: "Signalisation routière et vitesse", "Freins")
4. ASTAG D/F/I: Le code de référence au format "X/XX" ou "X/XXX" visible en haut (ex: "2/24", "16/180")
5. ÉNONCÉ: Le texte complet de la question (peut être vide si question uniquement visuelle)
6. OPTIONS A, B, C: Les trois réponses possibles avec leur texte complet
    7. BONNE RÉPONSE: ${base64AnswerImage ? 'LA PLUS IMPORTANTE - Identifie quelle option (a, b, ou c) est cochée/surlignée dans l\'IMAGE DE RÉPONSES' : 'Quelle option est marquée comme correcte'}

${base64AnswerImage ? `
⚠️ ATTENTION POUR LA BONNE RÉPONSE - INSTRUCTIONS PRÉCISES :
1. Regarde l'IMAGE DE RÉPONSES (la 2ème image - feuille de correction)
2. Cette feuille contient plusieurs lignes numérotées (1, 2, 3, 4, 5, ..., 40)
3. Trouve la ligne numéro ${numeroFromFilename} (c'est LE NUMÉRO DE CETTE QUESTION)
4. Sur cette ligne ${numeroFromFilename}, regarde les 3 cases : A, B, C
5. Identifie quelle case est COCHÉE (✓), SURLIGNÉE, ou MARQUÉE
6. Retourne UNIQUEMENT la lettre en minuscule : "a", "b", ou "c"

EXEMPLES DE CE QUE TU VERRAS :
- Ligne ${numeroFromFilename}: [ ] A  [✓] B  [ ] C  → Bonne réponse = "b"
- Ligne ${numeroFromFilename}: [✓] A  [ ] B  [ ] C  → Bonne réponse = "a"
- Ligne ${numeroFromFilename}: [ ] A  [ ] B  [✓] C  → Bonne réponse = "c"

⚠️ CRITIQUE: Tu dois chercher spécifiquement la ligne ${numeroFromFilename} sur la feuille de réponses !
` : ''}

DONNÉES ACTUELLEMENT EN BASE (peuvent être incorrectes) :
- Numéro: ${question.numero_question}
- Code: "${question.question}"
- Catégorie: "${question.categorie || 'vide'}"
- Astag: "${question["astag D/F/I "] || 'vide'}"
- Énoncé: "${question.enonce || 'vide'}"
- Option A: "${question.options.a}"
- Option B: "${question.options.b}"
- Option C: "${question.options.c}"
- Bonne réponse: "${question.bonne_reponse}" ${base64AnswerImage ? '← VÉRIFIE AVEC IMAGE RÉPONSES' : ''}

TÂCHE :
- Extrait TOUS les champs visibles dans les images
- ${base64AnswerImage ? 'Utilise l\'IMAGE DE RÉPONSES pour identifier la bonne réponse avec certitude' : ''}
- Compare avec les données enregistrées
- Identifie TOUTES les différences, même minimes
- Si les données en base sont génériques/vides, fournis le texte réel des images
- La bonne réponse est PRIORITAIRE - vérifie-la deux fois

IMPORTANT: Réponds UNIQUEMENT avec du JSON pur, sans backticks markdown, sans texte avant ou après.

Format de réponse attendu (JSON brut uniquement):
{
  "hasErrors": true or false,
  "extractedData": {
    "numero_question": ${numeroFromFilename},
    "question": "0004",
    "categorie": "Signalisation routière et vitesse",
    "astag": "2/24",
    "enonce": "texte de la question ou null si absent",
    "options": {
      "a": "texte exact de l'option A",
      "b": "texte exact de l'option B",
      "c": "texte exact de l'option C"
    },
    "bonne_reponse": "a"
  },
  "suggestions": {
    "numero_question": null (toujours null car déjà correct: ${numeroFromFilename}),
    "question": "0004" ou null si identique,
    "categorie": "nouveau texte" ou null si identique,
    "astag": "2/24" ou null si identique,
    "enonce": "nouveau texte" ou null si identique,
    "options": {
      "a": "nouveau texte" ou null si identique,
      "b": "nouveau texte" ou null si identique,
      "c": "nouveau texte" ou null si identique
    },
    "bonne_reponse": "a" ou null si identique (VÉRIFIE LIGNE ${numeroFromFilename} IMAGE RÉPONSES)
  },
  "confidence": "high",
  "analysis": "explication des différences ou confirmation. ${base64AnswerImage ? 'MENTIONNE si tu as trouvé la ligne ' + numeroFromFilename + ' dans l\'image de réponses et quelle case était cochée.' : ''}"
}

NE PAS utiliser de backticks markdown. Retourne SEULEMENT le JSON brut.`

    // Construire le contenu avec les images
    const messageContent: any[] = [
      {
        type: 'text',
        text: prompt,
      },
      {
        type: 'image_url',
        image_url: {
          url: `data:${mimeType};base64,${base64Image}`,
        },
      },
    ]
    
    // Ajouter l'image de réponse si elle existe
    if (base64AnswerImage) {
      messageContent.push({
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${base64AnswerImage}`,
        },
      })
    }

    // Appeler OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: messageContent,
        },
      ],
      max_tokens: 1500,
      temperature: 0.1,
      response_format: { type: "json_object" },
    })

    const responseContent = response.choices[0].message.content
    if (!responseContent) {
      throw new Error('Pas de réponse de OpenAI')
    }

    // Parser la réponse JSON
    let aiResult: AIAnalysisResult
    try {
      // Nettoyer la réponse : enlever les backticks markdown et les balises json
      let cleanedContent = responseContent
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim()
      
      // Extraire le JSON de la réponse
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Pas de JSON trouvé dans la réponse')
      }
      
      // Remplacer les undefined par null pour que ce soit du JSON valide
      let jsonString = jsonMatch[0].replace(/:\s*undefined/g, ': null')
      
      aiResult = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('Erreur parsing JSON:', responseContent)
      console.error('Parse error:', parseError)
      throw new Error('Erreur parsing de la réponse IA')
    }

    return NextResponse.json(aiResult)
  } catch (error: any) {
    console.error('Erreur analyse IA:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Erreur lors de l\'analyse IA',
        details: error.toString()
      },
      { status: 500 }
    )
  }
}

