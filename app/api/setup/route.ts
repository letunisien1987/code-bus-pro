import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * API Route pour initialiser la base de données PostgreSQL sur Vercel
 * À appeler une seule fois après le déploiement
 * URL: https://your-app.vercel.app/api/setup
 */
export async function POST() {
  try {
    console.log('🚀 Initialisation de la base de données PostgreSQL...')
    
    // Push le schéma Prisma vers la base
    const { stdout: pushOutput, stderr: pushError } = await execAsync('npx prisma db push --accept-data-loss')
    console.log('📋 Push output:', pushOutput)
    if (pushError) console.log('⚠️ Push stderr:', pushError)
    
    // Seed la base avec les données
    const { stdout: seedOutput, stderr: seedError } = await execAsync('npx prisma db seed')
    console.log('🌱 Seed output:', seedOutput)
    if (seedError) console.log('⚠️ Seed stderr:', seedError)
    
    return NextResponse.json({
      success: true,
      message: 'Base de données initialisée avec succès !',
      details: {
        push: pushOutput,
        seed: seedOutput
      }
    })
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error)
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de l\'initialisation de la base de données',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API Setup - Utilisez POST pour initialiser la base de données',
    instructions: [
      '1. Créez une base Postgres sur Vercel',
      '2. Connectez-la à votre projet',
      '3. Appelez POST /api/setup',
      '4. La base sera initialisée avec le schéma et les données'
    ]
  })
}

