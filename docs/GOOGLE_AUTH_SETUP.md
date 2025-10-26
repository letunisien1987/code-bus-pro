# 🔐 Configuration de l'authentification Google

Ce guide vous explique comment configurer la connexion Google avec NextAuth.js dans votre application Code Bus.

## 📋 Prérequis

- Un compte Google
- Accès à Google Cloud Console
- Application NextAuth.js configurée

## 🚀 Configuration Google Cloud Console

### 1. Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Cliquez sur "Sélectionner un projet" → "Nouveau projet"
3. Nommez votre projet (ex: "Code Bus Auth")
4. Cliquez sur "Créer"

### 2. Activer l'API Google Identity

1. Dans le menu latéral, allez dans "APIs et services" → "Bibliothèque"
2. Recherchez "Google Identity" ou "Google+ API"
3. Cliquez sur "Google Identity" et activez l'API

### 3. Créer des identifiants OAuth 2.0

1. Allez dans "APIs et services" → "Identifiants"
2. Cliquez sur "Créer des identifiants" → "ID client OAuth"
3. Sélectionnez "Application web"
4. Configurez les paramètres :
   - **Nom** : Code Bus Auth
   - **URI de redirection autorisés** :
     - `http://localhost:3000/api/auth/callback/google` (développement)
     - `https://votre-domaine.vercel.app/api/auth/callback/google` (production)

### 4. Récupérer les identifiants

Après création, vous obtiendrez :
- **ID client** : `123456789-abcdefg.apps.googleusercontent.com`
- **Secret client** : `GOCSPX-abcdefghijklmnop`

## 🔧 Configuration de l'application

### 1. Variables d'environnement

Ajoutez ces variables dans `.env.local` :

```bash
# Google OAuth
GOOGLE_CLIENT_ID="votre-id-client-google"
GOOGLE_CLIENT_SECRET="votre-secret-client-google"

# NextAuth (déjà configuré)
NEXTAUTH_SECRET="votre-secret-nextauth"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Configuration NextAuth

Le provider Google est déjà configuré dans `app/api/auth/[...nextauth]/route.ts` :

```typescript
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
})
```

### 3. Pages d'authentification

Les boutons Google sont déjà ajoutés dans :
- `app/auth/signin/page.tsx` - Page de connexion
- `app/auth/signup/page.tsx` - Page d'inscription

## 🎯 Fonctionnement

### Utilisateur se connecte avec Google

1. **Clic sur "Continuer avec Google"**
2. **Redirection vers Google** pour autorisation
3. **Retour à l'application** avec les données utilisateur
4. **Création automatique du compte** (rôle STUDENT par défaut)
5. **Connexion automatique** à l'application

### Données récupérées de Google

- **Nom** : Nom complet de l'utilisateur
- **Email** : Adresse email Google
- **Image** : Photo de profil Google
- **Rôle** : STUDENT (par défaut)

## 🔄 Gestion des utilisateurs Google

### Comptes existants

Si un utilisateur se connecte avec Google et qu'un compte avec le même email existe déjà :
- **Connexion réussie** avec le compte existant
- **Rôle conservé** (ADMIN ou STUDENT)
- **Données mises à jour** (nom, image)

### Nouveaux comptes

Pour les nouveaux utilisateurs Google :
- **Compte créé automatiquement**
- **Rôle STUDENT** par défaut
- **Pas de mot de passe** (authentification Google uniquement)

## 🛠️ Déploiement en production

### 1. Variables d'environnement Vercel

Ajoutez sur Vercel :
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_URL` (URL de production)

### 2. Configuration Google Cloud

Ajoutez l'URL de production dans Google Cloud Console :
- **URI de redirection autorisés** :
  - `https://votre-app.vercel.app/api/auth/callback/google`

## 🐛 Dépannage

### Erreurs courantes

**"Invalid client"**
- Vérifiez que `GOOGLE_CLIENT_ID` est correct
- Vérifiez que l'URL de redirection est configurée

**"Access denied"**
- Vérifiez que `GOOGLE_CLIENT_SECRET` est correct
- Vérifiez que l'API Google Identity est activée

**"Redirect URI mismatch"**
- Vérifiez que l'URL de redirection dans Google Cloud correspond à votre domaine

### Logs utiles

```bash
# Vérifier les variables d'environnement
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET

# Tester la connexion
curl -I http://localhost:3000/api/auth/providers
```

## 📚 Ressources

- [Google Cloud Console](https://console.cloud.google.com/)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
- [Google Identity Documentation](https://developers.google.com/identity)

---

**Note :** La connexion Google est maintenant intégrée à votre application ! Les utilisateurs peuvent se connecter avec leur compte Google ou créer un compte avec email/mot de passe.
