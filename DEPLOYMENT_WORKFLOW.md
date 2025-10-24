# 🚀 Workflow de Déploiement - Code Bus

## 📋 **Configuration Actuelle**

### ✅ **Déploiement Automatique via GitHub**
- **Branche de production :** `vercel-prod`
- **Déclenchement :** Push automatique sur GitHub
- **Configuration :** Vercel connecté au repository GitHub

### ❌ **Déploiement Manuel Vercel CLI (Désactivé)**
- **Raison :** Éviter les déploiements en double
- **Configuration :** Supprimée (`.vercel/` supprimé)

## 🔄 **Workflow de Déploiement**

### **1. Développement Local**
```bash
# Travailler sur la branche dev
git checkout dev
npm run dev
# L'éditeur JSON est disponible en local
```

### **2. Déploiement en Production**
```bash
# 1. Passer sur la branche de production
git checkout vercel-prod

# 2. Merger les changements depuis dev
git merge dev

# 3. Pousser vers GitHub (déclenche le déploiement automatique)
git push origin vercel-prod
```

### **3. Vérification du Déploiement**
- ✅ **Automatique :** Vercel déploie automatiquement
- ✅ **URL :** https://code-bus-pro.vercel.app
- ✅ **Status :** Visible dans le dashboard Vercel

## 🎯 **Avantages de cette Configuration**

### ✅ **Simplicité**
- Un seul commande : `git push`
- Pas de commandes Vercel CLI
- Workflow GitHub standard

### ✅ **Fiabilité**
- Pas de déploiements en double
- Historique des déploiements dans GitHub
- Rollback facile via GitHub

### ✅ **Sécurité**
- Pas de clés API locales
- Configuration centralisée sur Vercel
- Variables d'environnement sécurisées

## 📊 **Branches et Environnements**

### **Branche `dev`**
- **Usage :** Développement local
- **Fonctionnalités :** Application complète + Éditeur JSON
- **Déploiement :** Local uniquement (`npm run dev`)

### **Branche `vercel-prod`**
- **Usage :** Production
- **Fonctionnalités :** Application sans éditeur JSON
- **Déploiement :** Automatique via Vercel

## 🚨 **Important**

### **Ne plus utiliser :**
```bash
# ❌ Éviter ces commandes
vercel --prod
vercel deploy
vercel link
```

### **Utiliser uniquement :**
```bash
# ✅ Workflow recommandé
git push origin vercel-prod
```

## 🔧 **Configuration Vercel**

### **Variables d'Environnement**
- `DATABASE_URL` : Base de données PostgreSQL
- `storage_*` : Configuration de stockage
- Toutes configurées directement sur Vercel

### **Build Settings**
- **Framework :** Next.js
- **Build Command :** `npm run build`
- **Output Directory :** `.next`
- **Install Command :** `npm install`

## 📈 **Monitoring**

### **Dashboard Vercel**
- URL : https://vercel.com/letunisien1987s-projects/code-bus-pro
- Status des déploiements
- Logs de build
- Métriques de performance

### **GitHub Actions (Optionnel)**
- Historique des commits
- Status des déploiements
- Notifications automatiques
