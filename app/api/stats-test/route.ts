import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db"
    }
  }
})

export async function GET() {
  try {
    console.log('🔄 Test API stats...')
    
    // Compter les questions
    const questionCount = await prisma.question.count()
    console.log('📚 Questions:', questionCount)
    
    // Compter les utilisateurs
    const userCount = await prisma.user.count()
    console.log('👥 Utilisateurs:', userCount)
    
    // Compter les tentatives
    const attemptCount = await prisma.attempt.count()
    console.log('🎯 Tentatives:', attemptCount)
    
    return NextResponse.json({
      success: true,
      questionCount,
      userCount,
      attemptCount,
      message: 'API fonctionne !'
    })
    
  } catch (error) {
    console.error('❌ Erreur:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors du test',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
