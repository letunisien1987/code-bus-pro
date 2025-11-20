#!/usr/bin/env tsx

import { list } from '@vercel/blob';

/**
 * Script pour vérifier quelles images app_zone et reponse sont sur Vercel Blob
 */
async function checkBlobImages() {
  console.log('🔍 Vérification des images sur Vercel Blob...\n');

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ BLOB_READ_WRITE_TOKEN non configuré');
    console.log('💡 Configurez le token : export BLOB_READ_WRITE_TOKEN="votre_token"');
    process.exit(1);
  }

  try {
    const blobs = await list();
    
    // Compter les images par catégorie
    const appZoneImages: string[] = [];
    const reponseImages: string[] = [];
    const otherImages: string[] = [];

    for (const blob of blobs.blobs) {
      const path = blob.pathname.replace(/^\/+/, '');
      
      if (path.includes('/app_zone/')) {
        appZoneImages.push(path);
      } else if (path.startsWith('images/reponse/')) {
        reponseImages.push(path);
      } else {
        otherImages.push(path);
      }
    }

    console.log('📊 Résultats de la vérification:\n');
    
    console.log(`📁 Images app_zone/: ${appZoneImages.length}`);
    if (appZoneImages.length > 0) {
      console.log('   Exemples:');
      appZoneImages.slice(0, 5).forEach(path => {
        console.log(`   - ${path}`);
      });
      if (appZoneImages.length > 5) {
        console.log(`   ... et ${appZoneImages.length - 5} autres`);
      }
    } else {
      console.log('   ⚠️  Aucune image app_zone trouvée sur Blob');
      console.log('   💡 Exécutez: npx tsx scripts/sync-to-blob.ts');
    }

    console.log(`\n📁 Images reponse/: ${reponseImages.length}`);
    if (reponseImages.length > 0) {
      console.log('   Exemples:');
      reponseImages.slice(0, 5).forEach(path => {
        console.log(`   - ${path}`);
      });
      if (reponseImages.length > 5) {
        console.log(`   ... et ${reponseImages.length - 5} autres`);
      }
    } else {
      console.log('   ⚠️  Aucune image reponse trouvée sur Blob');
      console.log('   💡 Exécutez: npx tsx scripts/sync-to-blob.ts');
    }

    console.log(`\n📁 Autres images: ${otherImages.length}`);
    
    console.log(`\n✅ Total: ${blobs.blobs.length} images sur Vercel Blob`);

    // Vérifier les patterns attendus
    const hasAppZone = appZoneImages.length > 0;
    const hasReponse = reponseImages.length > 0;

    console.log('\n📋 Statut de synchronisation:');
    console.log(`   app_zone/: ${hasAppZone ? '✅ Présent' : '❌ Manquant'}`);
    console.log(`   reponse/: ${hasReponse ? '✅ Présent' : '❌ Manquant'}`);

    if (!hasAppZone || !hasReponse) {
      console.log('\n💡 Pour synchroniser les images manquantes:');
      console.log('   npx tsx scripts/sync-to-blob.ts');
      process.exit(1);
    } else {
      console.log('\n🎉 Toutes les images sont synchronisées sur Blob!');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    if (error instanceof Error) {
      console.error('   Détails:', error.message);
    }
    process.exit(1);
  }
}

checkBlobImages();

