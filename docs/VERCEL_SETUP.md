# 🚀 Guide de Déploiement Vercel

Ce projet utilise **SQLite en développement local** et **PostgreSQL en production (Vercel)**. Suivez ce guide pour basculer proprement vers Postgres avant le déploiement.

> Branche de déploiement: `vercel-prod` (Prisma: postgresql). Déployez cette branche sur Vercel; `main` reste SQLite pour le dev local.

## 🧭 Vue d’ensemble
- Local (dev): `provider = "sqlite"` et `DATABASE_URL="file:./dev.db"`
- Prod (Vercel): `provider = "postgresql"` et `DATABASE_URL` fourni par Vercel Postgres
- Les images sont servies depuis `public/images/...` (aucune configuration supplémentaire requise)

---

## 1️⃣ Créer une base de données Postgres sur Vercel
1. Ouvrez le [Vercel Dashboard](https://vercel.com/dashboard)
2. Dans le menu, cliquez sur **Storage** → **Create Database**
3. Choisissez **Postgres**, nommez-la par ex. `code-bus-db`
4. Choisissez la région proche et cliquez **Create**

## 2️⃣ Connecter la base au projet
1. Sur la page de la base → onglet **Projects**
2. Cliquez **Connect Project** et sélectionnez votre projet
3. Vercel ajoute automatiquement des variables d’environnement, incluant: `DATABASE_URL`, `POSTGRES_URL`, etc.

## 3️⃣ Préparer le schéma Prisma pour la production
En local, le schéma est configuré pour SQLite. Avant de déployer sur Vercel, **modifiez le provider en `postgresql`**.

### Modifier `prisma/schema.prisma`
```prisma
// datasource initial en dev local
// datasource db {
//   provider = "sqlite"
//   url      = env("DATABASE_URL")
// }

// 👉 Basculer en production (Vercel):
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

> Astuce: vous pouvez conserver un schéma SQLite pour le dev local et basculer manuellement vers Postgres avant déploiement. (Option avancée: deux fichiers `schema.sqlite.prisma` et `schema.postgres.prisma` + script de copie en CI.)

## 4️⃣ Initialiser la base (tables + seed)
Deux options s’offrent à vous:

### Option A — Vercel CLI (recommandé)
```bash
# Installer Vercel CLI si nécessaire
npm i -g vercel

# Authentification et lien du projet
vercel login
vercel link

# Récupérer les envs localement (facultatif)
vercel env pull .env.local

# ⚠️ Assurez-vous que `provider = "postgresql"` est commité avant ces commandes
npx prisma db push
npx prisma db seed
```

### Option B — Route API de setup
- Déployez le projet, puis appelez `/api/setup` une fois (depuis votre navigateur ou un curl)
- Cette route crée les tables via SQL et importe les questions depuis `data/questions.json` via Prisma (à appeler une seule fois)

## 5️⃣ Déployer
1. Committez le schéma Postgres et poussez votre branche
2. Vercel build et utilise `DATABASE_URL` (Postgres)
3. Votre application est en ligne 🎉

---

## 👩‍💻 Développement local (PostgreSQL)
- `.env`: `DATABASE_URL="postgresql://..."` (Neon ou PostgreSQL local)
- Scripts utiles:
  - `npm run db:push` — synchroniser le schéma
  - `npm run db:seed` — peupler les questions
  - `npm run db:reset` — réinitialiser (supprime/recrée + seed)
  - `npm run dev` — lancer l’app

> Le seed corrige automatiquement les chemins d’images en `/images/...`.

## 🧪 Vérifications rapides
- API: `GET /api/questions` doit renvoyer une liste (ex. ~119)
- Page Entraînement: `http://localhost:3000/train` affiche les questions
- Si “Aucune question…”: utilisez “Réinitialiser les filtres” pour remettre tout à “Tous”.

## 🆘 Dépannage
- En prod:
  - Vérifiez `DATABASE_URL` dans Vercel → Project → Settings → Environment Variables
  - Consultez les **Runtime Logs** et les logs de build
- En local:
  - Vérifiez `.env` (SQLite) et relancez `npm run db:push && npm run db:seed`
  - Supprimez/réinitialisez via `npm run db:reset` si nécessaire

## 📝 Notes
- Le système de fichiers Vercel est en lecture seule → SQLite n’est pas supporté en production
- Vercel Postgres est gratuit (quota raisonnable) et persistant
- Pensez à effectuer des backups réguliers

