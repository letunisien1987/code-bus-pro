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
      return NextResponse.json({})
    }

    // En production, récupérer toutes les URLs depuis Vercel Blob
    const blobs = await list()
    const urlMap: Record<string, string> = {}

    for (const blob of blobs.blobs) {
      // Extraire le chemin sans le domaine
      const path = blob.pathname.replace(/^\/+/, '')
      // Stocker avec le chemin complet incluant "images/"
      urlMap[path] = blob.downloadUrl
    }

    return NextResponse.json(urlMap)
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des URLs Blob:', error)
    // En cas d'erreur, retourner un mapping vide (fallback vers images locales)
    return NextResponse.json({})
  }
}

