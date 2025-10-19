# 🚀 Guide de Déploiement Vercel

## Étapes pour déployer Code Bus Pro sur Vercel

### 1️⃣ Créer une base de données Postgres

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Cliquez sur **"Storage"** dans le menu de gauche
3. Cliquez sur **"Create Database"**
4. Sélectionnez **"Postgres"**
5. Nommez-la `code-bus-db`
6. Choisissez la région la plus proche
7. Cliquez sur **"Create"**

### 2️⃣ Connecter la base au projet

1. Dans la page de la base de données
2. Cliquez sur l'onglet **"Projects"**
3. Cliquez sur **"Connect Project"**
4. Sélectionnez votre projet `code-bus-pro`
5. Vercel ajoutera automatiquement les variables d'environnement :
   - `DATABASE_URL`
   - `POSTGRES_URL`
   - etc.

### 3️⃣ Initialiser la base de données

Une fois la base connectée, vous devez créer les tables :

**Option A : Via Vercel CLI (Recommandé)**
```bash
# Installer Vercel CLI si ce n'est pas fait
npm i -g vercel

# Se connecter
vercel login

# Lier le projet
vercel link

# Pusher le schéma Prisma vers la base
vercel env pull .env.local
npx prisma db push
npx prisma db seed
```

**Option B : Via API Route**
1. Créez une route `/api/setup` dans votre projet
2. Appelez cette route une fois déployé
3. Elle exécutera `prisma db push` et `prisma db seed`

### 4️⃣ Redéployer

1. Vercel détectera automatiquement le nouveau commit
2. Le build utilisera PostgreSQL au lieu de SQLite
3. L'application sera fonctionnelle ! 🎉

## 🔧 Fichiers modifiés

- ✅ `prisma/schema.prisma` : Provider changé de `sqlite` à `postgresql`
- ✅ `package.json` : Scripts avec `prisma generate`

## 📝 Notes importantes

- SQLite ne fonctionne pas sur Vercel (système de fichiers en lecture seule)
- PostgreSQL est gratuit jusqu'à 256 MB sur Vercel
- Les données seront persistées en production
- Pensez à faire un backup régulier de vos données

## 🆘 En cas de problème

Si l'application ne fonctionne toujours pas :
1. Vérifiez que `DATABASE_URL` est bien défini dans Vercel
2. Vérifiez les logs de déploiement
3. Vérifiez les Runtime Logs dans Vercel Dashboard

