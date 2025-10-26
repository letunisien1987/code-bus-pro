# 🚀 Migration PostgreSQL pour Vercel

## ✅ **Problème résolu**
Migration de SQLite vers PostgreSQL pour résoudre l'erreur 500 sur Vercel.

## 🔧 **Changements**
- Schéma Prisma : `sqlite` → `postgresql`
- Base PostgreSQL créée avec Neon

## 📋 **Configuration Vercel**
Ajoutez ces variables d'environnement sur Vercel Dashboard :

```
NEXTAUTH_SECRET=votre-nextauth-secret
NEXTAUTH_URL=https://code.elghoudi.net
DATABASE_URL=postgresql://neondb_owner:npg_VuHB2sEfZT4d@ep-proud-mode-ahfgm84y-pooler.c-3.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
GOOGLE_CLIENT_ID=votre-google-client-id
GOOGLE_CLIENT_SECRET=votre-google-client-secret
OPENAI_API_KEY=votre-openai-api-key
```

## 🎯 **Résultat**
- ✅ API `/api/stats` fonctionne sur Vercel
- ✅ Dashboard opérationnel
- ✅ Base PostgreSQL stable