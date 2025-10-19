import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('id')
    
    // Si un ID spécifique est demandé
    if (questionId) {
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: {
          attempts: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      })
      
      if (!question) {
        return NextResponse.json(
          { error: 'Question non trouvée' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(question)
    }
    
    // Sinon, retourner toutes les questions
    const questions = await prisma.question.findMany({
      include: {
        attempts: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        questionnaire: 'asc'
      }
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error('Erreur lors de la récupération des questions:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des questions' },
      { status: 500 }
    )
  }
}
