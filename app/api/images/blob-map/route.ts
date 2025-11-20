import { NextResponse } from 'next/server'
import { list } from '@vercel/blob'

/**
 * API Route pour récupérer le mapping des URLs Blob
 * Retourne un objet { "chemin/image": "https://blob.vercel-storage.com/..." }
 */
export async function GET() {
  try {
    // En développement local, retourner un mapping vide (les images locales fonctionnent)
    if (process.env.NODE_ENV === 'development' || !process.env.VERCEL) {
      console.log('📋 Mode développement local - mapping Blob vide')
      return NextResponse.json({})
    }

    // Vérifier que le token Blob est configuré
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ BLOB_READ_WRITE_TOKEN non configuré en production')
      return NextResponse.json(
        { error: 'BLOB_READ_WRITE_TOKEN non configuré', urlMap: {} },
        { status: 500 }
      )
    }

    console.log('📋 Récupération des URLs depuis Vercel Blob...')
    // En production, récupérer toutes les URLs depuis Vercel Blob
    const blobs = await list()
    const urlMap: Record<string, string> = {}

    for (const blob of blobs.blobs) {
      // Extraire le chemin sans le domaine
      const path = blob.pathname.replace(/^\/+/, '')
      // Stocker avec le chemin complet incluant "images/"
      urlMap[path] = blob.downloadUrl
    }

    console.log(`✅ ${Object.keys(urlMap).length} URLs Blob récupérées`)
    console.log('📊 Exemples de chemins:', Object.keys(urlMap).slice(0, 5))

    return NextResponse.json(urlMap)
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des URLs Blob:', error)
    console.error('❌ Détails de l\'erreur:', error instanceof Error ? error.message : String(error))
    
    // En cas d'erreur, retourner un mapping vide (fallback vers images locales)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des URLs Blob',
        details: error instanceof Error ? error.message : String(error),
        urlMap: {} 
      },
      { status: 500 }
    )
  }
}

