# Configuration Vercel Blob

Ce document explique comment configurer et utiliser Vercel Blob pour stocker et servir les images de l'application.

## 1. Obtenir le token Vercel Blob

1. Connectez-vous à votre [dashboard Vercel](https://vercel.com/dashboard)
2. Allez dans **Settings** → **Storage** → **Blob**
3. Créez un nouveau store Blob si nécessaire
4. Copiez le **Read/Write Token**

## 2. Configuration des variables d'environnement

### Local (.env)
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Production (Vercel Dashboard)
1. Allez dans votre projet Vercel
2. **Settings** → **Environment Variables**
3. Ajoutez :
   - **Name**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: `vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Environment**: Production, Preview, Development

## 3. Synchronisation des images

### Synchronisation automatique (recommandée)
Les images sont automatiquement synchronisées vers Vercel Blob via GitHub Actions lors des push vers la branche `vercel-prod`.

### Synchronisation manuelle
```bash
# Installer les dépendances
npm install

# Configurer le token
export BLOB_READ_WRITE_TOKEN=your_token_here

# Exécuter la synchronisation
npx tsx scripts/sync-to-blob.ts
```

## 4. Structure des images sur Vercel Blob

Les images sont organisées comme suit :
```
questionnaire_1/Question (1).jpg
questionnaire_1/Question (2).jpg
...
questionnaire_1/app_zone/Question (1).jpg
questionnaire_1/app_zone/Question (2).jpg
...
questionnaire_2/Question (1).jpg
...
reponse/reponses 1.jpg
reponse/reponses 2.jpg
...
```

## 5. Workflow de développement

### Développement local
1. Modifiez/ajoutez des images dans `public/images/`
2. L'application utilise automatiquement les images locales
3. Testez normalement votre application

### Déploiement
1. Commitez vos changements :
   ```bash
   git add .
   git commit -m "Update images"
   git push origin vercel-prod
   ```

2. GitHub Actions synchronise automatiquement les images vers Vercel Blob
3. Vercel déploie l'application avec les images depuis Blob

## 6. Fonctionnement de l'application

### En développement local
- L'application utilise les images du dossier `public/images/`
- Pas de dépendance à Vercel Blob
- Développement rapide et offline

### En production (Vercel)
- L'application utilise automatiquement Vercel Blob
- Les images sont servies depuis le CDN Vercel
- Taille de la fonction API réduite (< 300mb)
- Fallback vers images locales si nécessaire

## 7. Dépannage

### Images non trouvées
Si une image n'est pas trouvée sur Vercel Blob, l'application utilise automatiquement l'image locale comme fallback.

### Synchronisation échouée
1. Vérifiez que le token `BLOB_READ_WRITE_TOKEN` est correct
2. Vérifiez les logs GitHub Actions
3. Relancez la synchronisation manuellement

### Cache des URLs
Les URLs Blob sont mises en cache pendant 5 minutes pour éviter les appels répétés à l'API.

## 8. Monitoring

### Vérifier les statistiques du cache
```javascript
import { getBlobCacheStats } from '@/lib/blob-helper'

const stats = getBlobCacheStats()
console.log('Cache size:', stats.size)
console.log('Last update:', stats.lastUpdate)
console.log('Is stale:', stats.isStale)
```

### Logs de synchronisation
Les logs de synchronisation sont disponibles dans :
- GitHub Actions (synchronisation automatique)
- Console locale (synchronisation manuelle)

## 9. Coûts

Vercel Blob propose un plan gratuit avec :
- 1 GB de stockage
- 1 GB de bande passante par mois

Pour plus d'informations, consultez la [documentation Vercel Blob](https://vercel.com/docs/storage/vercel-blob).
