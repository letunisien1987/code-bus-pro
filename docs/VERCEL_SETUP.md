# 🚀 Guide de Déploiement Vercel

Ce projet utilise **PostgreSQL partout** (local ET production) via **Neon**. Suivez ce guide pour configurer votre environnement de production.

> Branche de déploiement: `vercel-prod` (Prisma: postgresql). Déployez cette branche sur Vercel.

## 🧭 Vue d'ensemble
- Local (dev): `provider = "postgresql"` et `DATABASE_URL` Neon
- Prod (Vercel): `provider = "postgresql"` et `DATABASE_URL` Neon (même base)
- Les images sont servies depuis Vercel Blob avec synchronisation automatique

---

## 1️⃣ Configurer Neon (Base de données PostgreSQL)
1. Allez sur [neon.tech](https://neon.tech) et créez un compte
2. Créez un nouveau projet (ex: `code-bus-pro`)
3. Récupérez la `DATABASE_URL` depuis le dashboard Neon
4. Cette URL sera utilisée pour le développement local ET la production

## 2️⃣ Configurer les variables d'environnement
1. Copiez la `DATABASE_URL` de Neon
2. Ajoutez-la dans votre `.env.local` pour le développement local
3. Ajoutez-la dans Vercel Dashboard → Settings → Environment Variables pour la production

## 3️⃣ Le schéma Prisma est déjà configuré
Le fichier `prisma/schema.prisma` est déjà configuré pour PostgreSQL :

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Aucune modification nécessaire !

## 4️⃣ Initialiser la base de données
Deux options s'offrent à vous:

### Option A — Commandes Prisma (recommandé)
```bash
# Générer le client Prisma
npx prisma generate

# Appliquer le schéma à la base
npx prisma db push

# Peupler avec les questions
npx prisma db seed
```

### Option B — Route API de setup
- Déployez le projet, puis appelez `/api/setup` une fois
- Cette route crée les tables et importe les questions depuis `config/data/questions.json`

## 5️⃣ Déployer
1. Committez vos changements et poussez vers `vercel-prod`
2. Vercel build et utilise `DATABASE_URL` (Neon PostgreSQL)
3. Votre application est en ligne 🎉

## 6️⃣ Développement local (PostgreSQL Neon)
- `.env.local`: `DATABASE_URL="postgresql://..."` (URL Neon)
- Scripts utiles:
  - `npm run dev` — lancer l'app
  - `npx prisma studio` — interface base de données
  - `npx prisma db push` — synchroniser le schéma
  - `npx prisma db seed` — peupler les questions

## 🧪 Vérifications rapides
- API: `GET /api/questions` doit renvoyer une liste (ex. ~119)
- Page Entraînement: `http://localhost:3000/train` affiche les questions
- Si “Aucune question…”: utilisez “Réinitialiser les filtres” pour remettre tout à “Tous”.

## 🆘 Dépannage
- En prod:
  - Vérifiez `DATABASE_URL` dans Vercel → Project → Settings → Environment Variables
  - Consultez les **Runtime Logs** et les logs de build
- En local:
  - Vérifiez `.env.local` (Neon PostgreSQL) et relancez `npx prisma db push && npx prisma db seed`
  - Vérifiez que votre URL Neon est correcte

## 📝 Notes
- Neon PostgreSQL est gratuit avec un quota généreux
- La même base est utilisée pour le développement et la production
- Les images sont synchronisées automatiquement vers Vercel Blob
- Pensez à effectuer des backups réguliers

