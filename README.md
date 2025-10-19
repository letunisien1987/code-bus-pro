# Code Bus Pro - Application d'entraînement au code de la route

## 🚌 Description
Application Next.js moderne pour s'entraîner au code de la route, spécialement conçue pour la catégorie bus. Interface épurée et fonctionnalités avancées d'analyse des performances.

## ✨ Fonctionnalités

### 🎯 Entraînement
- Mode intelligent avec sélection adaptative des questions
- Filtrage par questionnaire, catégorie, ASTAG et statut
- Interface côte à côte (image + question)
- Feedback immédiat et navigation fluide
- Raccourcis clavier (←/→/A/B/C/D)

### 📊 Examens
- Sélection de lots de questions chronométrés
- Timer intégré et score final
- Revue détaillée des erreurs avec images
- Navigation par numéros de questions
- Marquage des questions à revoir

### 📈 Tableau de bord
- Statistiques globales et par catégorie
- Analyse des performances par questionnaire
- Questions problématiques identifiées
- Structure dépliante hiérarchique
- Liens directs vers l'entraînement

### 🔧 Import de données
- Import automatique depuis JSON
- Gestion des images dynamique
- Statistiques d'import détaillées
- Cache automatique

## 🛠️ Stack technique

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Base de données**: Prisma + SQLite (prêt pour PostgreSQL)
- **Validation**: react-hook-form + zod
- **Icônes**: Lucide React
- **Linting**: ESLint + Prettier

## 🚀 Installation

```bash
# Cloner le repository
git clone https://github.com/votre-username/code-bus-pro.git
cd code-bus-pro

# Installer les dépendances
npm install

# Configurer la base de données
cp .env.example .env
# Éditer .env avec vos paramètres

# Initialiser la base de données
npm run db:push
npm run db:seed

# Lancer l'application
npm run dev
```

## 📁 Structure du projet

```
code-bus-pro/
├── app/                    # Pages Next.js (App Router)
│   ├── api/               # Routes API
│   ├── dashboard/         # Tableau de bord
│   ├── exam/              # Mode examen
│   ├── train/             # Mode entraînement
│   └── import/            # Import de données
├── components/            # Composants réutilisables
├── lib/                   # Utilitaires et configuration
├── prisma/                # Schéma et migrations
├── public/                # Assets statiques
├── data/                  # Données d'exemple
└── scripts/               # Scripts utilitaires
```

## 🎨 Interface

- **Design épuré** : Interface moderne sans scroll
- **Responsive** : Adapté à tous les écrans
- **Animations fluides** : Transitions et effets visuels
- **Accessibilité** : Navigation clavier et ARIA

## 📊 Données

- **Questions** : Format JSON structuré
- **Images** : Support JPG/PNG avec chemins dynamiques
- **Statistiques** : Calculs en temps réel
- **Import** : Processus automatisé

## 🔧 Scripts disponibles

```bash
npm run dev          # Développement
npm run build        # Production
npm run start        # Serveur de production
npm run db:push      # Synchroniser la DB
npm run db:seed      # Peupler la DB
npm run reset-db     # Réinitialiser la DB
```

## 📝 Configuration

### Variables d'environnement

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Structure des questions

```json
{
  "id": "1_0001",
  "questionnaire": 1,
  "question": "0001",
  "categorie": "Signalisation",
  "astag": "1/10",
  "enonce": "Que signifie ce panneau ?",
  "options": {
    "a": "Route prioritaire",
    "b": "Cédez le passage",
    "c": "Fin de priorité"
  },
  "bonne_reponse": "a",
  "image_path": "images/questionnaire_1/Question (1).jpg"
}
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajouter nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une [issue](https://github.com/votre-username/code-bus-pro/issues)
- Consulter la [documentation](https://github.com/votre-username/code-bus-pro/wiki)

---

**Code Bus Pro** - L'application d'entraînement au code de la route la plus moderne ! 🚌✨
