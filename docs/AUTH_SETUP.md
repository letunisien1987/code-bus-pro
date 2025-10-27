# 🔐 Configuration de l'authentification

Ce document explique comment configurer et utiliser le système d'authentification de l'application Code Bus.

## 📋 Vue d'ensemble

L'application utilise **NextAuth.js** avec les fonctionnalités suivantes :

- **Authentification par email/mot de passe** (Credentials Provider)
- **Rôles utilisateur** : ADMIN et STUDENT
- **Protection des routes** avec middleware
- **Sauvegarde de la progression** par utilisateur
- **Session JWT** pour la performance

## 🚀 Installation et configuration

### 1. Variables d'environnement

Ajoutez ces variables dans `.env` :

```bash
# NextAuth
NEXTAUTH_SECRET="votre-secret-ici"
NEXTAUTH_URL="http://localhost:3000"

# Base de données (déjà configurée)
DATABASE_URL="postgresql://..."
```

**Générer NEXTAUTH_SECRET :**
```bash
openssl rand -base64 32
```

### 2. Migration de la base de données

```bash
npx prisma migrate dev --name add-auth
npx prisma generate
```

### 3. Créer le premier administrateur

```bash
npx tsx scripts/create-admin.ts
```

## 👥 Types d'utilisateurs

### 🔑 ADMIN
- Accès complet à l'application
- Accès à l'éditeur JSON (`/json-editor`)
- Accès au panel d'administration (`/admin`)
- Peut gérer les autres utilisateurs

### 🎓 STUDENT
- Accès aux pages d'entraînement et d'examen
- Progression sauvegardée automatiquement
- Statistiques personnalisées
- **Pas d'accès** à l'éditeur JSON

## 🛡️ Protection des routes

### Pages publiques (sans authentification)
- `/` - Page d'accueil
- `/auth/signin` - Connexion
- `/auth/signup` - Inscription

### Pages protégées (authentification requise)
- `/dashboard` - Tableau de bord
- `/train` - Entraînement
- `/exam` - Examen
- `/settings` - Paramètres

### Pages admin uniquement
- `/json-editor` - Éditeur JSON
- `/admin/*` - Panel d'administration

## 📊 Gestion de la progression

### Sauvegarde automatique
- Chaque tentative est sauvegardée en base de données
- Statistiques calculées en temps réel
- Historique des examens conservé

### Tables utilisées
- `UserProgress` : Progression par question
- `Attempt` : Historique des tentatives
- `User` : Informations utilisateur

## 🔄 Workflow d'authentification

### Utilisateur non connecté
1. Accède à la page d'accueil (publique)
2. Clique sur "Se connecter" ou "S'inscrire"
3. Crée un compte ou se connecte
4. Redirection vers le dashboard

### Utilisateur connecté (STUDENT)
1. Accès à toutes les pages d'entraînement
2. Progression sauvegardée automatiquement
3. Statistiques personnalisées
4. **Pas d'accès** à l'éditeur JSON

### Administrateur (ADMIN)
1. Accès complet à l'application
2. Accès à l'éditeur JSON pour gérer les questions
3. Accès au panel d'administration
4. Peut voir les statistiques globales

## 🛠️ API d'authentification

### Endpoints disponibles
- `POST /api/auth/signup` - Création de compte
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

### Exemple de création de compte
```typescript
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Jean Dupont',
    email: 'jean@example.com',
    password: 'motdepasse123'
  })
})
```

## 🔧 Développement

### Tester l'authentification localement
1. Démarrer le serveur : `npm run dev`
2. Aller sur `http://localhost:3000`
3. Créer un compte ou se connecter
4. Tester les différentes pages

### Créer des utilisateurs de test
```bash
# Créer un admin
npx tsx scripts/create-admin.ts

# Ou créer via l'interface d'inscription
# (tous les nouveaux comptes sont STUDENT par défaut)
```

## 🚀 Déploiement

### Variables d'environnement Vercel
Ajoutez sur Vercel :
- `NEXTAUTH_SECRET` (générer avec `openssl rand -base64 32`)
- `NEXTAUTH_URL` (URL de production, ex: `https://votre-app.vercel.app`)
- `DATABASE_URL` (déjà configurée)

### Migration en production
```bash
# Sur Vercel, les migrations s'exécutent automatiquement
# Créer le premier admin via le script ou l'interface
```

## 🐛 Dépannage

### Problèmes courants

**"Invalid credentials"**
- Vérifier l'email et le mot de passe
- Vérifier que l'utilisateur existe en base

**"Access denied to JSON editor"**
- Vérifier que l'utilisateur a le rôle ADMIN
- Se déconnecter et reconnecter si nécessaire

**"Session expired"**
- La session JWT expire après 30 jours par défaut
- Se reconnecter pour renouveler

### Logs utiles
```bash
# Vérifier les utilisateurs en base
npx prisma studio

# Vérifier les sessions
# (via l'interface NextAuth)
```

## 📚 Ressources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

**Note :** Ce système d'authentification est conçu pour être simple et efficace. Pour des besoins plus complexes (OAuth, 2FA, etc.), consultez la documentation NextAuth.js.
