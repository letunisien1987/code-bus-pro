# 🚀 Guide de Déploiement Vercel - Code Bus Pro

## ✅ Préparation effectuée

Les modifications suivantes ont été appliquées sur la branche `vercel-prod` :

- ✅ Schéma Prisma configuré pour **PostgreSQL**
- ✅ Compilation testée et réussie
- ✅ Code poussé vers `origin/vercel-prod`

---

## 🎯 Étapes de déploiement sur Vercel

### 1️⃣ Créer un compte et connecter le repository

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Sign Up"** ou **"Login"**
3. Connectez-vous avec **GitHub**
4. Autorisez Vercel à accéder à vos repositories

### 2️⃣ Importer le projet

1. Sur le dashboard Vercel, cliquez sur **"Add New..."** → **"Project"**
2. Trouvez le repository `code-bus-pro`
3. Cliquez sur **"Import"**

### 3️⃣ Configurer le projet

**Framework Preset:** Next.js (détecté automatiquement)

**Root Directory:** `./` (racine du projet)

**Build Command:**
```bash
prisma generate && next build
```

**Install Command:**
```bash
npm install
```

**Branch:** Sélectionnez `vercel-prod` (⚠️ IMPORTANT)

**Environment Variables:** Laissez vide pour l'instant, on les ajoutera après

Cliquez sur **"Deploy"**

> ⚠️ Le premier déploiement échouera car la base de données n'est pas encore configurée. C'est normal !

### 4️⃣ Créer la base de données PostgreSQL

1. Dans le dashboard Vercel, allez dans l'onglet **"Storage"**
2. Cliquez sur **"Create Database"**
3. Sélectionnez **"Postgres"**
4. Nommez la base : `code-bus-db` (ou autre nom)
5. Choisissez la région la plus proche (ex: `fra1` pour Europe)
6. Cliquez sur **"Create"**

### 5️⃣ Connecter la base au projet

1. Sur la page de la base de données, allez dans l'onglet **"Projects"**
2. Cliquez sur **"Connect Project"**
3. Sélectionnez votre projet `code-bus-pro`
4. Cochez toutes les environnements : **Production**, **Preview**, **Development**
5. Cliquez sur **"Connect"**

Vercel ajoute automatiquement ces variables d'environnement :
- `DATABASE_URL`
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

### 6️⃣ Redéployer le projet

1. Retournez dans **"Deployments"**
2. Cliquez sur le dernier déploiement échoué
3. Cliquez sur **"Redeploy"** → **"Redeploy"**

Le build devrait maintenant réussir ! ✅

### 7️⃣ Initialiser la base de données

**Option A - Via API Setup (Recommandé)**

1. Une fois le déploiement réussi, ouvrez votre application (URL fournie par Vercel)
2. Ajoutez `/api/setup` à la fin de l'URL
   ```
   https://votre-app.vercel.app/api/setup
   ```
3. Cela va :
   - Créer toutes les tables
   - Importer les questions depuis `data/questions.json`
   - Corriger les chemins d'images

**Option B - Via Vercel CLI (Avancé)**

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Lier le projet
vercel link

# Récupérer les variables d'environnement
vercel env pull .env.local

# Pousser le schéma
npx prisma db push

# Peupler la base
npx prisma db seed
```

### 8️⃣ Vérifier le déploiement

1. Ouvrez l'URL de votre application
2. Vérifiez que les pages fonctionnent :
   - **Page d'accueil** : `/`
   - **Tableau de bord** : `/dashboard`
   - **Entraînement** : `/train`
   - **Examens** : `/exam`
   - **Import** : `/import`
3. Testez une question pour vérifier que l'image s'affiche

---

## 🔧 Configuration des domaines (Optionnel)

### Ajouter un domaine personnalisé

1. Dans le dashboard Vercel, allez dans **"Settings"** → **"Domains"**
2. Ajoutez votre domaine (ex: `codebus.fr`)
3. Suivez les instructions pour configurer les DNS

---

## 📊 Variables d'environnement additionnelles

Si vous avez besoin d'autres variables :

1. Allez dans **"Settings"** → **"Environment Variables"**
2. Ajoutez vos variables :
   ```
   NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app
   ```

---

## 🔄 Déploiements automatiques

Vercel déploie automatiquement à chaque push sur `vercel-prod` :

- **Push sur `vercel-prod`** → Déploiement en production
- **Pull Request** → Déploiement preview
- **Push sur autre branche** → Pas de déploiement (configurable)

---

## 🐛 Dépannage

### Erreur : "Cannot find module '@prisma/client'"

**Solution :** Vérifiez que le build command est bien :
```bash
prisma generate && next build
```

### Erreur : "Database connection failed"

**Solution :** 
1. Vérifiez que `DATABASE_URL` est bien défini dans les variables d'environnement
2. Vérifiez que la base de données est bien connectée au projet

### Les images ne s'affichent pas

**Solution :**
1. Les images doivent être dans le dossier `public/images/`
2. Appelez `/api/setup` pour corriger les chemins
3. Vérifiez que les chemins commencent par `/images/` (sans `public/`)

### Erreur 500 sur les pages

**Solution :**
1. Allez dans **"Deployments"** → Cliquez sur votre déploiement
2. Consultez les **"Runtime Logs"** pour voir l'erreur exacte
3. Vérifiez que `/api/setup` a bien été appelé

---

## 📈 Monitoring et Analytics

### Vercel Analytics (Gratuit)

1. Allez dans **"Analytics"**
2. Activez Vercel Analytics pour voir :
   - Nombre de visiteurs
   - Pages les plus visitées
   - Performance (Web Vitals)

### Logs

- **Build Logs** : Logs de compilation
- **Runtime Logs** : Erreurs en production (temps réel)

---

## 🔐 Sécurité et limites

### Plan Gratuit Vercel

- **Bande passante** : 100 GB/mois
- **Builds** : 6000 minutes/mois
- **Fonctions Serverless** : 100 GB-heures
- **Base de données** : Postgres gratuit (256 MB, 10K lignes)

### Recommandations

- ✅ Activez HTTPS (automatique)
- ✅ Configurez CSP si besoin
- ✅ Limitez l'accès à `/api/setup` (une seule fois)
- ✅ Ajoutez un système d'authentification si nécessaire

---

## 🎉 Félicitations !

Votre application **Code Bus Pro** est maintenant en ligne ! 🚀

**URL de production :** `https://votre-app.vercel.app`

### Prochaines étapes suggérées

1. ✅ Tester toutes les fonctionnalités
2. ✅ Ajouter un système d'authentification (Clerk, Auth.js, etc.)
3. ✅ Configurer un domaine personnalisé
4. ✅ Activer les analytics
5. ✅ Configurer les backups de la base de données

---

## 📞 Support

- **Documentation Vercel** : [vercel.com/docs](https://vercel.com/docs)
- **Documentation Next.js** : [nextjs.org/docs](https://nextjs.org/docs)
- **Documentation Prisma** : [prisma.io/docs](https://prisma.io/docs)

---

**Version Stable** : v1.0 - Next.js 15.5.6  
**Date** : Octobre 2025

