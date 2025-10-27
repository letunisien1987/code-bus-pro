## 2.1 Créer SYSTEM_REFERENCE.md - Le fichier de référence complet


```markdown
# 📚 Référence Complète du Système Code Bus

> **Document de référence ultime** - Ce fichier contient TOUTE l'information nécessaire pour comprendre, maintenir et développer l'application Code Bus. À lire en cas de perte de contexte ou pour onboarding.

---

## 🏗️ Section 1: Architecture Générale

### Stack Technique Complet
- **Frontend**: Next.js 15.5.6 (App Router) + TypeScript
- **Styling**: TailwindCSS + shadcn/ui + Radix UI
- **Base de données**: PostgreSQL (Neon) + Prisma ORM
- **Authentification**: NextAuth.js (Credentials + Google OAuth)
- **Stockage images**: Vercel Blob (sync automatique)
- **Déploiement**: Vercel (branche `vercel-prod`)
- **Validation**: react-hook-form + zod
- **Icônes**: Lucide React
- **Linting**: ESLint + Prettier

### Structure des Dossiers (Détaillée)
```
/Users/elghoudi/routebus 3/
├── app/                           # Next.js App Router
│   ├── achievements/             # Page trophées
│   ├── api/                      # API Routes
│   │   ├── achievements/         # Gestion trophées
│   │   ├── ai-analyze/          # Analyse IA
│   │   ├── attempts/            # Tentatives utilisateur
│   │   ├── auth/                # NextAuth.js
│   │   │   └── [...nextauth]/   # Routes auth dynamiques
│   │   ├── exam-history/        # Historique examens
│   │   ├── import/              # Import questions
│   │   ├── json-editor/         # Éditeur JSON (ADMIN)
│   │   ├── questions/           # Questions + smart-select
│   │   ├── setup/               # Configuration initiale
│   │   └── stats/               # Statistiques utilisateur
│   ├── auth/                    # Pages authentification
│   │   ├── error/               # Erreurs auth
│   │   ├── signin/              # Connexion
│   │   └── signup/              # Inscription
│   ├── dashboard/               # Tableau de bord
│   ├── exam/                    # Page examen
│   ├── import/                  # Page import
│   ├── json-editor/             # Éditeur JSON (ADMIN)
│   ├── settings/                # Paramètres
│   ├── test-achievements/       # Test trophées
│   ├── train/                   # Page entraînement
│   ├── globals.css              # Styles globaux
│   ├── layout.tsx               # Layout principal
│   ├── not-found.tsx            # Page 404
│   └── page.tsx                 # Page d'accueil
├── components/                   # Composants React
│   ├── analytics/               # Composants analytics
│   │   ├── SimpleChart.tsx      # Graphiques simples
│   │   └── StatsCard.tsx        # Cartes statistiques
│   ├── layout/                  # Composants layout
│   │   ├── conditional-navigation.tsx
│   │   ├── navigation.tsx
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── ui/                      # Composants UI (shadcn)
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── loading.tsx
│   │   ├── progress.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   └── toast.tsx
│   ├── achievement-notification.tsx
│   ├── conditional-navigation.tsx
│   ├── fixed-bottom-navigation.tsx
│   ├── home-page-client.tsx
│   ├── navigation.tsx
│   ├── session-provider.tsx
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── config/                      # Configuration
│   ├── data/                    # Données statiques
│   │   └── questions.json       # Questions du code (6829 lignes)
│   └── scripts/                 # Scripts utilitaires
│       ├── auto-import.sh
│       ├── force-import.sh
│       ├── import-questions.sh
│       ├── reset-db.sh
│       └── restart-app.sh
├── lib/                         # Bibliothèques utilitaires
│   ├── achievements/            # Logique trophées
│   │   ├── checker.ts           # Vérification trophées
│   │   └── definitions.ts       # Définitions trophées
│   ├── learning/                # Algorithmes d'apprentissage
│   │   ├── metrics.ts           # Métriques d'apprentissage
│   │   └── selector.ts          # Sélection intelligente
│   ├── database/                # Configuration DB
│   │   └── prisma.ts            # Client Prisma (UNUSED)
│   ├── utils/                   # Utilitaires généraux
│   │   └── utils.ts             # Fonctions utilitaires
│   ├── auth.ts                  # Configuration NextAuth
│   ├── blob-helper.ts           # Helpers Vercel Blob (UNUSED)
│   ├── learningMetrics.ts       # Métriques d'apprentissage (USED)
│   ├── prisma.ts                # Client Prisma (USED)
│   ├── questionSelector.ts      # Sélecteur questions (USED)
│   ├── user-progress.ts         # Progression utilisateur (UNUSED)
│   └── utils.ts                 # Utilitaires généraux (USED)
├── prisma/                      # Configuration Prisma
│   ├── schema.prisma            # Schéma PostgreSQL
│   └── seed.ts                  # Script de seed
├── public/                      # Assets statiques
│   ├── images/                  # Images questions (1220+ fichiers)
│   │   ├── questionnaire_1/     # Images questionnaire 1
│   │   ├── questionnaire_2/     # Images questionnaire 2
│   │   └── ... (10 questionnaires)
│   ├── favicon.ico
│   ├── logo_with_circle.png
│   └── manifest.json
├── scripts/                     # Scripts de maintenance
│   ├── audit-trophies.js
│   ├── check-trophy-categories.js
│   ├── cleanup-old-trophies.js
│   ├── copy-to-app-zone.js
│   ├── create-admin-auto.ts
│   ├── create-admin-simple.js
│   ├── create-admin.js
│   ├── create-admin.ts
│   ├── create-test-user.js
│   ├── debug-achievements-ui.js
│   ├── final-audit-report.js
│   ├── fix-regularity-trophies.js
│   ├── fix-trophy-types.js
│   ├── force-unlock-trophies.js
│   ├── import-questions-to-db.js
│   ├── import-questions.sh
│   ├── import-to-vercel.js
│   ├── reset-db.sh
│   ├── restart-app.sh
│   ├── setup.sh
│   ├── sync-to-blob.ts
│   ├── test-achievements-count.js
│   ├── test-daily-streak.js
│   ├── test-quality-streak.js
│   ├── test-real-trophies.js
│   └── test-trophy-logic.js
├── themes/                      # Thèmes CSS
│   └── blue-theme.css
├── types/                       # Types TypeScript
│   └── next-auth.d.ts           # Types NextAuth
├── .github/                     # GitHub Actions
│   └── workflows/
│       └── sync-images.yml      # Sync images vers Vercel Blob
├── docs/                        # Documentation
│   ├── ANALYSE_FICHIERS.md
│   ├── ARCHITECTURE.md
│   ├── AUTH_SETUP.md
│   ├── COLOR_GUIDE.md
│   ├── DEPLOIEMENT_VERCEL.md
│   ├── DEPLOYMENT_WORKFLOW.md
│   ├── GOOGLE_AUTH_SETUP.md
│   ├── PAGINATION_DEBUG.md
│   ├── README.md
│   ├── README_BRANCHES.md
│   ├── README_UPLOAD_QUESTIONS.md
│   ├── REORGANISATION_COMPLETE.md
│   ├── SYSTEM_REFERENCE.md      # Ce fichier
│   ├── VERCEL_BLOB_SETUP.md
│   ├── VERCEL_SETUP.md
│   └── VERSION_STABLE.md
├── admin-user.json              # Utilisateur admin (UNUSED)
├── env.example                  # Exemple variables d'environnement
├── middleware.ts                # Middleware Next.js
├── next.config.js               # Configuration Next.js
├── next-env.d.ts                # Types Next.js
├── package.json                 # Dépendances npm
├── postcss.config.js            # Configuration PostCSS
├── tailwind.config.js           # Configuration TailwindCSS
└── tsconfig.json                # Configuration TypeScript
```

### Flux de Données
```
Utilisateur → NextAuth.js → Session → API Routes → Prisma → PostgreSQL (Neon)
                ↓
            Middleware (Protection routes)
                ↓
            Pages React → Components → UI (shadcn)
                ↓
            Images → Vercel Blob (sync automatique)
```

### Diagramme Conceptuel (Texte)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Components    │    │   NextAuth.js   │    │   Prisma ORM    │
│   (React)       │    │   (Auth)        │    │   (ORM)         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI (shadcn)   │    │   Middleware    │    │   Neon Cloud    │
│   (Styling)     │    │   (Protection)  │    │   (Hosting)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🗄️ Section 2: Base de Données PostgreSQL (Neon)

### Configuration Neon
- **Provider**: Neon (neon.tech)
- **Type**: PostgreSQL Serverless
- **Région**: Europe (recommandé)
- **Plan**: Free tier (généreux)
- **URL Format**: `postgresql://user:password@host:port/database?sslmode=require`

### Variables d'Environnement
```env
# Base de données
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="your-blob-token"
```

### Tables Prisma avec Descriptions

#### 1. User (Authentification)
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  role          UserRole  @default(STUDENT)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  attempts      Attempt[]
  userProgress  UserProgress[]
  examHistory   ExamHistory[]
  achievements  Achievement[]
}
```
**Description**: Utilisateurs de l'application (étudiants + admin)
**Rôles**: `STUDENT`, `ADMIN`

#### 2. Question (Questions du Code)
```prisma
model Question {
  id            String    @id @default(cuid())
  questionnaire Int
  question      String
  choix         String[]
  correct       String
  explanation   String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  attempts      Attempt[]
  userProgress  UserProgress[]
  questionProgress QuestionProgress[]
  examAnswers   ExamAnswer[]
}
```
**Description**: Questions du code de la route (6829 questions)
**Questionnaires**: 1-10 (différents thèmes)

#### 3. Attempt (Tentatives Utilisateur)
```prisma
model Attempt {
  id            String    @id @default(cuid())
  userId        String
  questionId    String
  answer        String
  correct       Boolean
  timeSpent     Int?      // Temps en millisecondes
  createdAt     DateTime  @default(now())
  
  // Relations
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  question      Question  @relation(fields: [questionId], references: [id])
}
```
**Description**: Chaque tentative d'un utilisateur sur une question
**Usage**: Calcul des statistiques et progression

#### 4. UserProgress (Progression par Question)
```prisma
model UserProgress {
  id            String    @id @default(cuid())
  userId        String
  questionId    String
  attempts      Int       @default(0)
  correct       Int       @default(0)
  lastAttempt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  question      Question  @relation(fields: [questionId], references: [id])
  
  @@unique([userId, questionId])
}
```
**Description**: Suivi de la progression de chaque utilisateur par question
**Usage**: Algorithmes d'apprentissage adaptatif

#### 5. QuestionProgress (Algorithme d'Apprentissage)
```prisma
model QuestionProgress {
  id            String    @id @default(cuid())
  questionId    String
  difficulty    Float     @default(0.5)
  successRate   Float     @default(0.0)
  totalAttempts Int       @default(0)
  lastUpdated   DateTime  @default(now())
  
  // Relations
  question      Question  @relation(fields: [questionId], references: [id])
  
  @@unique([questionId])
}
```
**Description**: Métriques d'apprentissage pour chaque question
**Usage**: Sélection intelligente des questions

#### 6. ExamHistory (Historique Examens)
```prisma
model ExamHistory {
  id              String    @id @default(cuid())
  userId          String
  score           Int
  percentage      Float
  total           Int
  correct         Int
  incorrect       Int
  timeSpent       Int?      // Temps total en millisecondes
  performanceScore Float?
  accuracyScore   Float?
  speedBonus      Float?
  avgTimePerQuestion Float?
  performanceBadge String?
  createdAt       DateTime  @default(now())
  
  // Relations
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  answers         ExamAnswer[]
}
```
**Description**: Résultats des examens passés par les utilisateurs
**Usage**: Historique et statistiques d'examens

#### 7. ExamAnswer (Réponses Détaillées Examens)
```prisma
model ExamAnswer {
  id            String      @id @default(cuid())
  examHistoryId String
  questionId    String
  choix         String
  correct       Boolean
  createdAt     DateTime    @default(now())
  
  // Relations
  examHistory   ExamHistory @relation(fields: [examHistoryId], references: [id], onDelete: Cascade)
  question      Question    @relation(fields: [questionId], references: [id])
  
  @@index([examHistoryId])
  @@index([questionId])
}
```
**Description**: Réponses individuelles pour chaque examen
**Usage**: Révision détaillée des examens passés

#### 8. Achievement (Trophées/Succès)
```prisma
model Achievement {
  id            String    @id @default(cuid())
  userId        String
  type          String    // Type de trophée
  level         Int       // Niveau du trophée
  value         Float     // Valeur atteinte
  unlockedAt    DateTime  @default(now())
  
  // Relations
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```
**Description**: Trophées et succès débloqués par les utilisateurs
**Usage**: Système de gamification

### Relations entre Tables
```
User (1) ──→ (N) Attempt
User (1) ──→ (N) UserProgress
User (1) ──→ (N) ExamHistory
User (1) ──→ (N) Achievement

Question (1) ──→ (N) Attempt
Question (1) ──→ (N) UserProgress
Question (1) ──→ (1) QuestionProgress
Question (1) ──→ (N) ExamAnswer

ExamHistory (1) ──→ (N) ExamAnswer
```

### Commandes Prisma Utiles
```bash
# Générer le client Prisma
npx prisma generate

# Appliquer le schéma à la base
npx prisma db push

# Peupler avec les questions
npx prisma db seed

# Interface graphique
npx prisma studio

# Réinitialiser la base
npx prisma db reset

# Valider le schéma
npx prisma validate

# Créer une migration
npx prisma migrate dev --name migration-name
```

---

## 🔐 Section 3: Authentification NextAuth.js

### Configuration Complète
**Fichier**: `lib/auth.ts`

```typescript
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Logique d'authentification par email/mot de passe
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error"
  },
  callbacks: {
    async jwt({ token, user }) {
      // Logique JWT
    },
    async session({ session, token }) {
      // Logique session
    }
  }
}
```

### Providers Disponibles

#### 1. Credentials (Email/Mot de Passe)
- **Route**: `/api/auth/signin`
- **Page**: `/auth/signin`
- **Validation**: bcrypt pour les mots de passe
- **Usage**: Comptes étudiants et admin

#### 2. Google OAuth
- **Route**: `/api/auth/signin/google`
- **Page**: `/auth/signin` (bouton Google)
- **Configuration**: Google Cloud Console
- **Usage**: Connexion rapide avec Google

### Rôles Utilisateur
```typescript
enum UserRole {
  STUDENT = "STUDENT",  // Utilisateur standard
  ADMIN = "ADMIN"       // Administrateur (accès JSON editor)
}
```

### Pages d'Authentification
- **`/auth/signin`**: Page de connexion
- **`/auth/signup`**: Page d'inscription
- **`/auth/error`**: Page d'erreur d'authentification

### Protection des Routes
**Fichier**: `middleware.ts`

```typescript
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Logique de protection
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Vérification des autorisations
      }
    }
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/train/:path*", "/exam/:path*", "/settings/:path*"]
}
```

### Middleware
- **Protection**: Routes `/dashboard`, `/train`, `/exam`, `/settings`
- **Redirection**: Vers `/auth/signin` si non authentifié
- **Rôles**: Vérification des rôles ADMIN pour certaines routes

### Variables d'Environnement Requises
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

---

## 🛠️ Section 4: APIs et Routes

### Liste Complète des API Routes

#### 1. `/api/auth/[...nextauth]` - NextAuth Endpoints
- **Méthode**: GET, POST
- **Authentification**: Non requise
- **Description**: Routes d'authentification NextAuth.js
- **Endpoints**:
  - `/api/auth/signin` - Connexion
  - `/api/auth/signout` - Déconnexion
  - `/api/auth/session` - Session actuelle
  - `/api/auth/csrf` - Token CSRF
  - `/api/auth/providers` - Providers disponibles

#### 2. `/api/auth/signup` - Création Compte
- **Méthode**: POST
- **Authentification**: Non requise
- **Paramètres**: `{ email, password, name }`
- **Description**: Création d'un nouveau compte utilisateur
- **Exemple**:
```typescript
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe'
  })
})
```

#### 3. `/api/questions` - Récupération Questions
- **Méthode**: GET
- **Authentification**: Requise
- **Paramètres**: `?questionnaire=1&limit=10`
- **Description**: Récupère les questions selon les filtres
- **Exemple de réponse**:
```json
{
  "questions": [
    {
      "id": "question-1",
      "questionnaire": 1,
      "question": "Quelle est la vitesse maximale en ville?",
      "choix": ["30 km/h", "50 km/h", "70 km/h"],
      "correct": "50 km/h",
      "explanation": "En ville, la vitesse est limitée à 50 km/h",
      "image": "/images/questionnaire_1/question1.jpg"
    }
  ],
  "total": 6829
}
```

#### 4. `/api/questions/smart-select` - Sélection Intelligente
- **Méthode**: POST
- **Authentification**: Requise
- **Paramètres**: `{ userId, limit, questionnaire }`
- **Description**: Sélection intelligente des questions basée sur l'algorithme d'apprentissage
- **Exemple**:
```typescript
const response = await fetch('/api/questions/smart-select', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-id',
    limit: 10,
    questionnaire: 1
  })
})
```

#### 5. `/api/attempts` - Enregistrement Tentatives
- **Méthode**: POST
- **Authentification**: Requise
- **Paramètres**: `{ questionId, answer, timeSpent }`
- **Description**: Enregistre une tentative d'un utilisateur
- **Exemple**:
```typescript
const response = await fetch('/api/attempts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    questionId: 'question-1',
    answer: '50 km/h',
    timeSpent: 5000
  })
})
```

#### 6. `/api/stats` - Statistiques Utilisateur
- **Méthode**: GET
- **Authentification**: Requise
- **Description**: Récupère les statistiques complètes de l'utilisateur
- **Exemple de réponse**:
```json
{
  "byQuestion": [
    {
      "questionId": "question-1",
      "questionnaire": 1,
      "attempts": 3,
      "correct": 2,
      "percentage": 66.7,
      "lastAttempt": "2024-01-15T10:30:00Z"
    }
  ],
  "byCategory": [
    {
      "questionnaire": 1,
      "attempted": 50,
      "correct": 40,
      "percentage": 80.0
    }
  ],
  "global": {
    "totalAttempts": 150,
    "totalCorrect": 120,
    "averageScore": 80.0,
    "totalTimeSpent": 3600000
  }
}
```

#### 7. `/api/exam-history` - Historique Examens
- **Méthode**: GET, POST
- **Authentification**: Requise
- **GET**: Récupère l'historique des examens
- **POST**: Enregistre un nouvel examen
- **Exemple POST**:
```typescript
const response = await fetch('/api/exam-history', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    score: 8,
    total: 10,
    percentage: 80.0,
    correct: 8,
    incorrect: 2,
    timeSpent: 1800000,
    answers: [
      {
        questionId: 'question-1',
        answer: '50 km/h',
        correct: true
      }
    ]
  })
})
```

#### 8. `/api/achievements` - Gestion Trophées
- **Méthode**: GET, POST
- **Authentification**: Requise
- **GET**: Récupère les trophées de l'utilisateur
- **POST**: Débloque un nouveau trophée
- **Exemple de réponse**:
```json
{
  "achievements": [
    {
      "id": "achievement-1",
      "type": "streak",
      "level": 3,
      "value": 7,
      "unlockedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### 9. `/api/import` - Import Questions
- **Méthode**: POST
- **Authentification**: Requise (ADMIN)
- **Description**: Importe les questions depuis `config/data/questions.json`
- **Usage**: Configuration initiale ou mise à jour

#### 10. `/api/json-editor` - Éditeur JSON (ADMIN)
- **Méthode**: GET, POST
- **Authentification**: Requise (ADMIN)
- **Description**: Interface pour éditer les questions JSON
- **Usage**: Modification des questions par l'admin

#### 11. `/api/setup` - Configuration Initiale
- **Méthode**: GET
- **Authentification**: Non requise
- **Description**: Initialise la base de données et importe les questions
- **Usage**: Premier déploiement

---

## 📱 Section 5: Pages et Fonctionnalités

### Pages Principales

#### 1. `/` - Accueil
- **Fichier**: `app/page.tsx`
- **Description**: Page d'accueil avec navigation
- **Fonctionnalités**:
  - Navigation vers les différentes sections
  - Affichage des statistiques rapides
  - Boutons d'action principaux

#### 2. `/dashboard` - Tableau de Bord
- **Fichier**: `app/dashboard/page.tsx`
- **Description**: Vue d'ensemble des statistiques utilisateur
- **Fonctionnalités**:
  - Statistiques globales
  - Progression par questionnaire
  - Progression par question
  - Graphiques de performance
  - Recommandations d'étude

#### 3. `/train` - Entraînement
- **Fichier**: `app/train/page.tsx`
- **Description**: Mode entraînement avec feedback
- **Fonctionnalités**:
  - Questions aléatoires ou intelligentes
  - Feedback immédiat
  - Suivi du temps
  - Filtres par questionnaire
  - Mode révision des erreurs

#### 4. `/exam` - Examen
- **Fichier**: `app/exam/page.tsx`
- **Description**: Examen officiel avec timer
- **Fonctionnalités**:
  - Examen chronométré
  - Questions sélectionnées intelligemment
  - Sauvegarde automatique
  - Correction à la fin
  - Historique des examens passés
  - Révision détaillée des examens

#### 5. `/achievements` - Trophées
- **Fichier**: `app/achievements/page.tsx`
- **Description**: Système de gamification
- **Fonctionnalités**:
  - Liste des trophées débloqués
  - Progression vers les trophées suivants
  - Notifications de nouveaux trophées
  - Statistiques de réussite

#### 6. `/settings` - Paramètres
- **Fichier**: `app/settings/page.tsx`
- **Description**: Configuration de l'application
- **Fonctionnalités**:
  - Changement de thème (clair/sombre)
  - Paramètres de notification
  - Gestion du compte
  - Déconnexion

#### 7. `/json-editor` - Éditeur JSON (ADMIN)
- **Fichier**: `app/json-editor/page.tsx`
- **Description**: Interface d'administration
- **Fonctionnalités**:
  - Édition des questions JSON
  - Sauvegarde des modifications
  - Validation des données
  - Accès restreint aux admins

#### 8. `/auth/signin` - Connexion
- **Fichier**: `app/auth/signin/page.tsx`
- **Description**: Page de connexion
- **Fonctionnalités**:
  - Connexion par email/mot de passe
  - Connexion Google OAuth
  - Gestion des erreurs
  - Redirection après connexion

#### 9. `/auth/signup` - Inscription
- **Fichier**: `app/auth/signup/page.tsx`
- **Description**: Page d'inscription
- **Fonctionnalités**:
  - Création de compte
  - Validation des données
  - Connexion automatique après inscription

---

## 💻 Section 6: Workflow de Développement

### Développement Local
```bash
# Cloner le projet
git clone <repository-url>
cd routebus-3

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp env.example .env.local
# Éditer .env.local avec vos valeurs

# Initialiser la base de données
npx prisma generate
npx prisma db push
npx prisma db seed

# Lancer le serveur de développement
npm run dev
```

### Variables d'Environnement (.env.local)
```env
# Base de données PostgreSQL (Neon)
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Vercel Blob (optionnel pour le développement)
BLOB_READ_WRITE_TOKEN="your-blob-token"
```

### Commandes NPM Utiles
```bash
# Développement
npm run dev              # Serveur de développement
npm run build            # Build de production
npm run start            # Serveur de production
npm run lint             # Linting ESLint
npm run type-check       # Vérification TypeScript

# Base de données
npx prisma generate      # Générer le client Prisma
npx prisma db push       # Synchroniser le schéma
npx prisma db seed       # Peupler la base
npx prisma studio        # Interface graphique
npx prisma db reset      # Réinitialiser la base
npx prisma validate      # Valider le schéma
```

### Commandes Prisma
```bash
# Génération et synchronisation
npx prisma generate      # Génère le client Prisma
npx prisma db push       # Applique le schéma à la base
npx prisma db seed       # Exécute le script de seed

# Interface et outils
npx prisma studio        # Interface graphique de la base
npx prisma validate      # Valide le schéma Prisma
npx prisma format        # Formate le fichier schema.prisma

# Migrations (si nécessaire)
npx prisma migrate dev --name migration-name
npx prisma migrate deploy
```

### Tests
```bash
# Tests unitaires (si configurés)
npm test

# Tests de type
npm run type-check

# Linting
npm run lint
```

---

## 🚀 Section 7: Workflow de Déploiement

### Branche vercel-prod
- **Branche principale**: `vercel-prod`
- **Déploiement automatique**: Vercel surveille cette branche
- **Base de données**: PostgreSQL (Neon) - même base que le développement
- **Variables d'environnement**: Configurées dans Vercel Dashboard

### GitHub Actions
**Fichier**: `.github/workflows/sync-images.yml`

```yaml
name: Sync Images to Vercel Blob
on:
  push:
    branches: [vercel-prod]
jobs:
  sync-images:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Sync images to Vercel Blob
        run: |
          # Script de synchronisation des images
```

### Vercel Blob (Images)
- **Configuration**: Automatique via GitHub Actions
- **Trigger**: Push sur `vercel-prod`
- **Synchronisation**: `public/images/` → Vercel Blob
- **URLs**: Images servies depuis Vercel Blob en production

### Synchronisation Automatique
1. **Push vers `vercel-prod`**
2. **GitHub Actions** se déclenche
3. **Images synchronisées** vers Vercel Blob
4. **Vercel déploie** l'application
5. **Application en ligne** avec images optimisées

### Variables d'Environnement Production
```env
# Vercel Dashboard → Project → Settings → Environment Variables
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-production-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
BLOB_READ_WRITE_TOKEN="your-blob-token"
```

---

## 🖼️ Section 8: Stockage et Assets

### Vercel Blob Configuration
- **Service**: Vercel Blob Storage
- **Usage**: Stockage des images des questions
- **Avantages**: CDN global, optimisation automatique
- **Coût**: Gratuit jusqu'à 1GB

### Sync Automatique Images
**Script**: `scripts/sync-to-blob.ts`

```typescript
import { put } from '@vercel/blob'

async function syncImages() {
  // Synchronise public/images/ vers Vercel Blob
  // Met à jour les URLs dans la base de données
}
```

### Structure Dossier public/images/
```
public/images/
├── questionnaire_1/     # Images questionnaire 1
│   ├── question1.jpg
│   ├── question2.jpg
│   └── ...
├── questionnaire_2/     # Images questionnaire 2
│   ├── question1.jpg
│   └── ...
└── ... (10 questionnaires)
```

### Workflow GitHub Actions
1. **Push sur `vercel-prod`**
2. **Action déclenchée**
3. **Scan de `public/images/`**
4. **Upload vers Vercel Blob**
5. **Mise à jour des URLs** dans la base
6. **Déploiement Vercel**

---

## 🧩 Section 9: Composants et Lib

### Composants UI (shadcn)
**Dossier**: `components/ui/`

- **`button.tsx`**: Boutons avec variants
- **`card.tsx`**: Cartes de contenu
- **`badge.tsx`**: Badges et étiquettes
- **`progress.tsx`**: Barres de progression
- **`select.tsx`**: Sélecteurs
- **`tabs.tsx`**: Onglets
- **`toast.tsx`**: Notifications
- **`loading.tsx`**: États de chargement

### Composants Layout
**Dossier**: `components/layout/`

- **`navigation.tsx`**: Navigation principale
- **`conditional-navigation.tsx`**: Navigation conditionnelle
- **`theme-provider.tsx`**: Provider de thème
- **`theme-toggle.tsx`**: Bouton de changement de thème

### Lib Learning (Algorithmes)
**Dossier**: `lib/learning/`

#### `metrics.ts` - Métriques d'Apprentissage
```typescript
export interface LearningMetrics {
  difficulty: number
  successRate: number
  totalAttempts: number
  lastUpdated: Date
}

export function calculateDifficulty(attempts: Attempt[]): number
export function calculateSuccessRate(attempts: Attempt[]): number
export function updateQuestionProgress(questionId: string): Promise<void>
```

#### `selector.ts` - Sélection Intelligente
```typescript
export interface QuestionSelector {
  selectQuestions(userId: string, limit: number): Promise<Question[]>
  getWeakAreas(userId: string): Promise<Question[]>
  getReviewQuestions(userId: string): Promise<Question[]>
}
```

### Lib Database (Prisma)
**Fichier**: `lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Lib Achievements (Logique Trophées)
**Dossier**: `lib/achievements/`

#### `definitions.ts` - Définitions Trophées
```typescript
export interface AchievementDefinition {
  type: string
  levels: AchievementLevel[]
  checkFunction: (userId: string) => Promise<boolean>
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Définitions des trophées
]
```

#### `checker.ts` - Vérification Trophées
```typescript
export class AchievementChecker {
  async checkAllAchievements(userId: string): Promise<void>
  async unlockAchievement(userId: string, type: string, level: number): Promise<void>
  async getAchievements(userId: string): Promise<Achievement[]>
}
```

---

## ⚙️ Section 10: Configuration et Scripts

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['blob.vercel-storage.com'],
  },
}

module.exports = nextConfig
```

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs personnalisées
      },
    },
  },
  plugins: [],
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Scripts Utiles (config/scripts/)
- **`auto-import.sh`**: Import automatique des questions
- **`force-import.sh`**: Import forcé des questions
- **`import-questions.sh`**: Script d'import des questions
- **`reset-db.sh`**: Réinitialisation de la base
- **`restart-app.sh`**: Redémarrage de l'application
- **`setup.sh`**: Configuration initiale

---

## 🔧 Section 11: Dépannage Courant

### Problèmes Fréquents et Solutions

#### 1. Erreur "Cannot read properties of undefined"
**Cause**: Données non chargées depuis PostgreSQL
**Solution**:
```typescript
// Ajouter des vérifications null/undefined
if (stats?.byQuestion && Array.isArray(stats.byQuestion)) {
  stats.byQuestion.forEach(q => {
    // Logique
  })
}
```

#### 2. Erreur "Unknown argument timeSpent"
**Cause**: Client Prisma non synchronisé
**Solution**:
```bash
npx prisma generate
npx prisma db push
# Redémarrer Next.js
```

#### 3. Erreur "ENOENT: no such file or directory"
**Cause**: Cache Next.js corrompu
**Solution**:
```bash
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

#### 4. Erreur "Foreign key constraint violated"
**Cause**: Tentative d'insertion avec clé étrangère inexistante
**Solution**:
```bash
# Vérifier que les utilisateurs existent avant les tentatives
npx prisma studio
```

#### 5. Erreur "Invariant: Expected clientReferenceManifest"
**Cause**: Cache Next.js corrompu
**Solution**:
```bash
rm -rf .next
rm -rf node_modules/.cache
npx prisma generate
npm run dev
```

### Commandes de Debug
```bash
# Vérifier la base de données
npx prisma studio

# Vérifier les logs
npm run dev
# Regarder les logs dans le terminal

# Vérifier les variables d'environnement
echo $DATABASE_URL

# Vérifier la connexion à la base
npx prisma db push --preview-feature
```

### Logs à Vérifier
1. **Terminal Next.js**: Erreurs de compilation et runtime
2. **Prisma Studio**: État de la base de données
3. **Vercel Dashboard**: Logs de production
4. **Neon Dashboard**: Logs de base de données

---

## 📋 Section 12: Checklist Maintenance

### Tâches Régulières
- [ ] **Vérifier les logs** de production (Vercel Dashboard)
- [ ] **Monitorer l'usage** de la base de données (Neon Dashboard)
- [ ] **Vérifier les performances** de l'application
- [ ] **Tester les fonctionnalités** principales
- [ ] **Mettre à jour les dépendances** si nécessaire

### Backups
- [ ] **Base de données**: Neon gère automatiquement les backups
- [ ] **Code**: Git avec branches `main` et `vercel-prod`
- [ ] **Images**: Vercel Blob avec réplication automatique
- [ ] **Configuration**: Variables d'environnement dans Vercel

### Monitoring
- [ ] **Performance**: Vercel Analytics
- [ ] **Erreurs**: Vercel Error Tracking
- [ ] **Base de données**: Neon Metrics
- [ ] **Images**: Vercel Blob Usage

### Mises à Jour
- [ ] **Next.js**: Vérifier les nouvelles versions
- [ ] **Prisma**: Mettre à jour le client
- [ ] **Dépendances**: `npm audit` et `npm update`
- [ ] **Sécurité**: Vérifier les vulnérabilités

---

## 🎯 Section 13: Points Clés à Retenir

### Architecture
- **PostgreSQL partout** (développement ET production)
- **NextAuth.js** pour l'authentification (Credentials + Google)
- **Vercel Blob** pour les images (sync automatique)
- **Branche `vercel-prod`** pour le déploiement

### Base de Données
- **8 tables principales** avec relations complètes
- **Neon PostgreSQL** comme provider
- **Prisma ORM** pour les interactions
- **Seed automatique** avec 6829 questions

### APIs
- **11 routes API** principales
- **Authentification requise** pour la plupart
- **Rôles utilisateur** (STUDENT, ADMIN)
- **Protection des routes** via middleware

### Déploiement
- **GitHub Actions** pour la sync des images
- **Vercel** pour l'hébergement
- **Variables d'environnement** dans Vercel Dashboard
- **Déploiement automatique** sur push `vercel-prod`

### Développement
- **TypeScript strict** partout
- **TailwindCSS + shadcn/ui** pour le styling
- **Composants réutilisables** dans `components/ui/`
- **Libs spécialisées** dans `lib/`

---

## 📞 Section 14: Contacts et Ressources

### Documentation Externe
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **NextAuth.js**: https://next-auth.js.org
- **Neon**: https://neon.tech/docs
- **Vercel**: https://vercel.com/docs
- **TailwindCSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com

### Fichiers de Configuration Importants
- **`prisma/schema.prisma`**: Schéma de base de données
- **`lib/auth.ts`**: Configuration NextAuth.js
- **`middleware.ts`**: Protection des routes
- **`.env.local`**: Variables d'environnement locales
- **`next.config.js`**: Configuration Next.js
- **`tailwind.config.js`**: Configuration TailwindCSS

### Commandes de Sauvegarde Rapide
```bash
# Sauvegarde complète du projet
git add .
git commit -m "Backup complet"
git push origin vercel-prod

# Vérification de la base
npx prisma studio

# Test de l'application
npm run dev
```