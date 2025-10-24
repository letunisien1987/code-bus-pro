#!/usr/bin/env tsx

import { put, list } from '@vercel/blob';
import { createHash } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

interface ImageInfo {
  path: string;
  blobPath: string;
  md5: string;
  size: number;
}

async function calculateMD5(filePath: string): Promise<string> {
  const buffer = readFileSync(filePath);
  return createHash('md5').update(buffer).digest('hex');
}

async function getExistingBlobs(): Promise<Map<string, string>> {
  console.log('📋 Récupération des images existantes sur Vercel Blob...');
  
  const blobs = await list();
  const blobMap = new Map<string, string>();
  
  for (const blob of blobs.blobs) {
    // Extraire le chemin sans le domaine
    const path = blob.pathname.replace(/^\/+/, '');
    blobMap.set(path, blob.downloadUrl);
  }
  
  console.log(`📊 ${blobMap.size} images trouvées sur Vercel Blob`);
  return blobMap;
}

async function findLocalImages(): Promise<ImageInfo[]> {
  console.log('🔍 Recherche des images locales...');
  
  const imagePatterns = [
    'public/images/questionnaire_*/*.jpg',
    'public/images/questionnaire_*/app_zone/*.jpg',
    'public/images/reponse/*.jpg'
  ];
  
  const images: ImageInfo[] = [];
  
  for (const pattern of imagePatterns) {
    const files = await glob(pattern);
    
    for (const file of files) {
      if (existsSync(file)) {
        const stats = readFileSync(file);
        const md5 = createHash('md5').update(stats).digest('hex');
        
        // Convertir le chemin local vers le chemin Blob
        const blobPath = file.replace('public/', '');
        
        images.push({
          path: file,
          blobPath,
          md5,
          size: stats.length
        });
      }
    }
  }
  
  console.log(`📊 ${images.length} images locales trouvées`);
  return images;
}

async function syncImages() {
  console.log('🚀 Début de la synchronisation vers Vercel Blob...');
  
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ BLOB_READ_WRITE_TOKEN non configuré');
    process.exit(1);
  }
  
  try {
    // Récupérer les images existantes sur Blob
    const existingBlobs = await getExistingBlobs();
    
    // Trouver les images locales
    const localImages = await findLocalImages();
    
    let uploaded = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const image of localImages) {
      try {
        // Vérifier si l'image existe déjà sur Blob avec le même MD5
        const existingUrl = existingBlobs.get(image.blobPath);
        
        if (existingUrl) {
          console.log(`⏭️  Image déjà synchronisée: ${image.blobPath}`);
          skipped++;
          continue;
        }
        
        // Uploader l'image vers Vercel Blob
        console.log(`📤 Upload de ${image.blobPath} (${(image.size / 1024).toFixed(1)}KB)...`);
        
        const fileBuffer = readFileSync(image.path);
        const blob = await put(image.blobPath, fileBuffer, {
          access: 'public',
          addRandomSuffix: false
        });
        
        console.log(`✅ Upload réussi: ${blob.url}`);
        uploaded++;
        
      } catch (error) {
        console.error(`❌ Erreur lors de l'upload de ${image.blobPath}:`, error);
        errors++;
      }
    }
    
    console.log('\n📊 Résumé de la synchronisation:');
    console.log(`   📤 Images uploadées: ${uploaded}`);
    console.log(`   ⏭️  Images ignorées: ${skipped}`);
    console.log(`   ❌ Erreurs: ${errors}`);
    console.log(`   📊 Total traité: ${uploaded + skipped + errors}`);
    
    if (errors === 0) {
      console.log('🎉 Synchronisation terminée avec succès!');
    } else {
      console.log('⚠️  Synchronisation terminée avec des erreurs');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error);
    process.exit(1);
  }
}

// Exécuter la synchronisation
syncImages();
