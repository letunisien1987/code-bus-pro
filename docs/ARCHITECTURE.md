# 🏗️ Architecture de Code Bus

**Date de réorganisation :** 21 octobre 2025  
**Version :** v1.0-stable-nextjs15 (réorganisée)

---

## 📐 Structure du projet

```
routebus/
├── app/                            # Routes et pages Next.js
│   ├── api/                       # API Routes
│   │   ├── attempts/             # Gestion des tentatives
│   │   ├── import/               # Import de questions
│   │   ├── questions/            # API questions
│   │   │   └── smart-select/     # Sélection intelligente
│   │   ├── setup/                # Configuration initiale
│   │   └── stats/                # Statistiques
│   ├── dashboard/                # Page tableau de bord
│   ├── exam/                     # Page examen
│   ├── import/                   # Page import
│   ├── settings/                 # Page paramètres
│   ├── train/                    # Page entraînement
│   ├── layout.tsx                # Layout racine
│   ├── page.tsx                  # Page d'accueil
│   ├── not-found.tsx             # Page 404
│   └── globals.css               # Styles globaux
│
├── components/                    # Composants réutilisables
│   ├── layout/                   # Composants de mise en page
│   │   ├── navigation.tsx        # Menu de navigation principal
│   │   ├── conditional-navigation.tsx  # Navigation conditionnelle
│   │   ├── theme-toggle.tsx      # Bouton toggle thème
│   │   └── theme-provider.tsx    # Provider thème
│   └── ui/                       # Composants UI génériques
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── progress.tsx
│       ├── select.tsx
│       └── tabs.tsx
│
├── lib/                          # Logique métier
│   ├── database/                 # Gestion base de données
│   │   └── prisma.ts            # Client Prisma singleton
│   ├── learning/                 # Logique d'apprentissage
│   │   ├── metrics.ts           # Métriques d'apprentissage
│   │   └── selector.ts          # Sélection intelligente
│   └── utils/                    # Utilitaires
│       └── utils.ts             # Fonctions utilitaires (cn, etc.)
│
├── features/                     # Fonctionnalités métier (à développer)
│   ├── exam/                    # [PRÉVU] Composants spécifiques examen
│   ├── training/                # [PRÉVU] Composants spécifiques entraînement
│   ├── dashboard/               # [PRÉVU] Composants spécifiques dashboard
│   └── import/                  # [PRÉVU] Composants spécifiques import
│
├── config/                       # Configuration et données
│   ├── data/                    # Données statiques
│   │   └── questions.json       # Base de questions
│   └── scripts/                 # Scripts shell d'administration
│       ├── auto-import.sh
│       ├── force-import.sh
│       ├── import-questions.sh
│       ├── reset-db.sh
│       ├── restart-app.sh
│       └── setup.sh
│
├── prisma/                       # Configuration Prisma
│   ├── schema.prisma            # Schéma de base de données
│   └── seed.ts                  # Script de seed
│
├── public/                       # Assets statiques
│   └── images/                  # Images des questions
│       ├── questionnaire_1/
│       ├── questionnaire_2/
│       └── ... (10 questionnaires)
│
└── [fichiers de configuration racine]
    ├── next.config.js
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.js
    └── ...
```

---

## 🎯 Principes d'organisation

### 1. Séparation des responsabilités

- **`app/`** : Routes et pages uniquement (logique de routage Next.js)
- **`components/`** : Composants réutilisables partagés
- **`lib/`** : Logique métier et utilitaires
- **`features/`** : Composants spécifiques à une fonctionnalité
- **`config/`** : Configuration et données statiques

### 2. Imports avec alias `@/`

Tous les imports utilisent l'alias `@/` défini dans `tsconfig.json` :

```typescript
// ✅ BON
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/database/prisma'
import { selectQuestions } from '@/lib/learning/selector'

// ❌ MAUVAIS (chemins relatifs)
import { Button } from '../../components/ui/button'
import { prisma } from '../../../lib/prisma'
```

### 3. Organisation par domaine

#### `/lib/database/`
- `prisma.ts` : Client Prisma singleton

#### `/lib/learning/`
- `metrics.ts` : Métriques d'apprentissage (SM2, accuracy, etc.)
- `selector.ts` : Sélection intelligente de questions

#### `/lib/utils/`
- `utils.ts` : Utilitaires génériques (classNames, formatters, etc.)

#### `/components/layout/`
- Composants de mise en page globale
- Navigation, headers, footers, theme

#### `/components/ui/`
- Composants UI génériques réutilisables
- Basés sur shadcn/ui

---

## 📍 Guide de navigation

### Où trouver quoi ?

#### Je veux modifier une page
→ `app/[nom-page]/page.tsx`

#### Je veux modifier la navigation
→ `components/layout/navigation.tsx`

#### Je veux modifier un composant UI
→ `components/ui/[composant].tsx`

#### Je veux modifier la logique de base de données
→ `lib/database/prisma.ts`

#### Je veux modifier l'algorithme de sélection
→ `lib/learning/selector.ts`

#### Je veux modifier les métriques d'apprentissage
→ `lib/learning/metrics.ts`

#### Je veux modifier une API
→ `app/api/[nom-api]/route.ts`

#### Je veux ajouter des questions
→ `config/data/questions.json`

#### Je veux lancer un script
→ `config/scripts/[script].sh`

---

## 🔄 Migrations effectuées

### Fichiers déplacés

| Ancien chemin | Nouveau chemin |
|---------------|----------------|
| `components/navigation.tsx` | `components/layout/navigation.tsx` |
| `components/conditional-navigation.tsx` | `components/layout/conditional-navigation.tsx` |
| `components/theme-toggle.tsx` | `components/layout/theme-toggle.tsx` |
| `components/theme-provider.tsx` | `components/layout/theme-provider.tsx` |
| `lib/prisma.ts` | `lib/database/prisma.ts` |
| `lib/learningMetrics.ts` | `lib/learning/metrics.ts` |
| `lib/questionSelector.ts` | `lib/learning/selector.ts` |
| `lib/utils.ts` | `lib/utils/utils.ts` |
| `data/questions.json` | `config/data/questions.json` |
| `scripts/*.sh` | `config/scripts/*.sh` |

### Imports mis à jour

Tous les imports ont été mis à jour pour utiliser les alias `@/` et pointer vers les nouveaux emplacements.

---

## ✅ Avantages de la nouvelle architecture

### 1. Navigation intuitive
- Besoin de modifier l'examen ? → `app/exam/page.tsx`
- Besoin de modifier la navigation ? → `components/layout/`
- Besoin de modifier la logique BDD ? → `lib/database/`

### 2. Code groupé logiquement
- Tout ce qui concerne la mise en page dans `components/layout/`
- Toute la logique d'apprentissage dans `lib/learning/`
- Tous les composants UI dans `components/ui/`

### 3. Imports clairs
- Plus de chemins relatifs complexes comme `../../../lib/utils`
- Tout est préfixé par `@/` et explicite

### 4. Scalabilité
- Facile d'ajouter de nouvelles features dans `features/`
- Structure cohérente et prévisible
- Séparation claire des responsabilités

### 5. Maintenance facilitée
- Trouver un fichier est intuitif
- Les dépendances sont claires
- Le refactoring est plus sûr

---

## 🚀 Prochaines étapes

### Phase 2 : Extraction des features

Les pages actuelles (`exam`, `train`, `dashboard`) contiennent beaucoup de logique.  
La prochaine étape serait d'extraire cette logique dans des composants dédiés :

#### `features/exam/`
```
features/exam/
├── components/
│   ├── ExamSetup.tsx       # Configuration de l'examen
│   ├── ExamQuestion.tsx    # Affichage d'une question
│   ├── ExamTimer.tsx       # Timer de l'examen
│   ├── ExamResults.tsx     # Résultats finaux
│   └── ExamNavigation.tsx  # Navigation entre questions
├── hooks/
│   ├── useExamState.ts     # État de l'examen
│   └── useExamTimer.ts     # Gestion du timer
└── types.ts                # Types TypeScript
```

#### `features/training/`
```
features/training/
├── components/
│   ├── TrainingQuestion.tsx   # Question d'entraînement
│   ├── TrainingFilters.tsx    # Filtres de sélection
│   └── TrainingProgress.tsx   # Progression
├── hooks/
│   └── useTrainingState.ts    # État de l'entraînement
└── types.ts
```

#### `features/dashboard/`
```
features/dashboard/
├── components/
│   ├── StatsOverview.tsx      # Vue d'ensemble stats
│   ├── CategoryStats.tsx      # Stats par catégorie
│   ├── QuestionTree.tsx       # Arbre des questions
│   └── ProgressChart.tsx      # Graphique de progression
└── utils/
    └── statsCalculations.ts   # Calculs statistiques
```

---

## 📚 Conventions de code

### Imports
- Toujours utiliser l'alias `@/`
- Grouper les imports par type (React, Next, composants, lib, etc.)

### Composants
- Un composant par fichier
- Nommage en PascalCase
- Export default pour les composants de page
- Export named pour les composants réutilisables

### Fichiers
- Pages : `page.tsx`
- Composants : `ComponentName.tsx`
- Hooks : `useHookName.ts`
- Utils : `functionName.ts`
- Types : `types.ts` ou `[feature].types.ts`

---

## 🔧 Scripts utiles

```bash
# Lancer l'application
npm run dev

# Build de production
npm run build

# Lancer les tests
npm run test

# Seed la base de données
npx prisma db seed

# Importer des questions
./config/scripts/import-questions.sh

# Reset la base de données
./config/scripts/reset-db.sh
```

---

## 📖 Documentation

- [README principal](./README.md)
- [Guide d'upload de questions](./README_UPLOAD_QUESTIONS.md)
- [Guide de déploiement Vercel](./DEPLOIEMENT_VERCEL.md)
- [Analyse des fichiers](./ANALYSE_FICHIERS.md)
- [Version stable](./VERSION_STABLE.md)

---

**Architecture maintenue et documentée**  
**Version :** 1.0 (réorganisée)  
**Dernière mise à jour :** 21 octobre 2025

