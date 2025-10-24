# 🌿 Gestion des Branches - Code Bus

## 📋 **Structure des Branches**

### 🚀 **`vercel-prod`** - Version Production
- **Objectif :** Déploiement en production sur Vercel
- **Contenu :** Application complète SANS l'éditeur JSON
- **Fonctionnalités :**
  - ✅ Page d'accueil
  - ✅ Dashboard avec statistiques
  - ✅ Examen avec sauvegarde automatique
  - ✅ Entraînement avec zoom d'images
  - ✅ Paramètres et import
  - ✅ Navigation responsive
  - ❌ **Exclu :** Éditeur JSON (outil de développement)

### 🔧 **`dev`** - Version Développement
- **Objectif :** Développement et tests locaux
- **Contenu :** Application complète AVEC l'éditeur JSON
- **Fonctionnalités :**
  - ✅ Toutes les fonctionnalités de production
  - ✅ **Inclus :** Éditeur JSON pour la gestion des questions
  - ✅ **Inclus :** Assistant IA pour l'analyse des questions
  - ✅ **Inclus :** API d'édition JSON

### 📦 **`main`** - Branche Principale
- **Objectif :** Branche de référence
- **Contenu :** Version stable de base

## 🚀 **Déploiement**

### Production (Vercel)
```bash
git checkout vercel-prod
vercel --prod
```

### Développement Local
```bash
git checkout dev
npm run dev
```

## 🔄 **Workflow de Développement**

1. **Développement :** Travailler sur la branche `dev`
2. **Tests :** Tester avec l'éditeur JSON en local
3. **Production :** Merger `dev` vers `vercel-prod` pour le déploiement
4. **Déploiement :** Déployer `vercel-prod` sur Vercel

## 📁 **Fichiers Exclus en Production**

### `.vercelignore` (vercel-prod)
```
# Exclure l'éditeur JSON (outil de développement uniquement)
app/json-editor/
app/api/json-editor/
app/api/ai-analyze/
```

### `.vercelignore` (dev)
```
# Version DEV : Garder l'éditeur JSON pour le développement
# (L'éditeur JSON est disponible en local pour le développement)
```

## 🎯 **Avantages de cette Structure**

- ✅ **Séparation claire** entre développement et production
- ✅ **Déploiement optimisé** (sans outils de développement)
- ✅ **Développement complet** avec tous les outils
- ✅ **Maintenance facile** des deux versions
- ✅ **Sécurité** (pas d'exposition des outils de dev en production)
