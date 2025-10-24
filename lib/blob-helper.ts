import { list } from '@vercel/blob';

interface BlobCache {
  urls: Map<string, string>;
  lastUpdate: number;
}

// Cache pour éviter les appels répétés à l'API Blob
let blobCache: BlobCache | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Détecte si on est en environnement de production Vercel
 */
function isProduction(): boolean {
  return process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
}

/**
 * Détecte si on est en environnement de développement local
 */
function isLocalDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || !process.env.VERCEL;
}

/**
 * Récupère toutes les URLs des images depuis Vercel Blob
 */
async function getBlobUrls(): Promise<Map<string, string>> {
  // Vérifier le cache
  if (blobCache && Date.now() - blobCache.lastUpdate < CACHE_DURATION) {
    return blobCache.urls;
  }

  try {
    console.log('📋 Récupération des URLs depuis Vercel Blob...');
    const blobs = await list();
    const urlMap = new Map<string, string>();
    
    for (const blob of blobs.blobs) {
      // Extraire le chemin sans le domaine
      const path = blob.pathname.replace(/^\/+/, '');
      urlMap.set(path, blob.downloadUrl);
    }
    
    // Mettre à jour le cache
    blobCache = {
      urls: urlMap,
      lastUpdate: Date.now()
    };
    
    console.log(`📊 ${urlMap.size} URLs récupérées depuis Vercel Blob`);
    return urlMap;
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des URLs Blob:', error);
    return new Map();
  }
}

/**
 * Obtient l'URL d'une image, avec fallback vers l'image locale
 * @param imagePath - Chemin de l'image (ex: "images/questionnaire_1/Question (1).jpg")
 * @returns URL de l'image (Blob en production, locale en développement)
 */
export async function getImageUrl(imagePath: string): Promise<string> {
  // Nettoyer le chemin (enlever le slash initial si présent)
  const cleanPath = imagePath.replace(/^\/+/, '');
  
  // En développement local, toujours utiliser les images locales
  if (isLocalDevelopment()) {
    return `/${cleanPath}`;
  }
  
  // En production, essayer d'abord Vercel Blob
  if (isProduction()) {
    try {
      const blobUrls = await getBlobUrls();
      const blobUrl = blobUrls.get(cleanPath);
      
      if (blobUrl) {
        console.log(`🌐 Utilisation de Vercel Blob: ${cleanPath}`);
        return blobUrl;
      } else {
        console.warn(`⚠️  Image non trouvée sur Vercel Blob: ${cleanPath}, fallback vers local`);
        return `/${cleanPath}`;
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération depuis Blob: ${cleanPath}`, error);
      return `/${cleanPath}`;
    }
  }
  
  // Fallback par défaut
  return `/${cleanPath}`;
}

/**
 * Version synchrone pour les cas où on ne peut pas utiliser async
 * Utilise uniquement les images locales
 */
export function getImageUrlSync(imagePath: string): string {
  const cleanPath = imagePath.replace(/^\/+/, '');
  return `/${cleanPath}`;
}

/**
 * Vérifie si une image existe sur Vercel Blob
 */
export async function imageExistsOnBlob(imagePath: string): Promise<boolean> {
  if (!isProduction()) {
    return false;
  }
  
  try {
    const blobUrls = await getBlobUrls();
    const cleanPath = imagePath.replace(/^\/+/, '');
    return blobUrls.has(cleanPath);
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de l\'existence:', error);
    return false;
  }
}

/**
 * Obtient les statistiques du cache Blob
 */
export function getBlobCacheStats(): { size: number; lastUpdate: number | null; isStale: boolean } {
  if (!blobCache) {
    return { size: 0, lastUpdate: null, isStale: true };
  }
  
  return {
    size: blobCache.urls.size,
    lastUpdate: blobCache.lastUpdate,
    isStale: Date.now() - blobCache.lastUpdate > CACHE_DURATION
  };
}
