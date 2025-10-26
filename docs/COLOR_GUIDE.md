# Guide de Style - Système de Couleurs

## Introduction

Ce guide définit les règles de couleurs pour l'application Code Bus, garantissant une cohérence visuelle et une accessibilité optimale en mode clair et sombre.

## Philosophie des Couleurs

### Principes Fondamentaux
- **Contraste garanti** : Tous les textes sont visibles en mode clair ET sombre
- **Cohérence** : Utilisation systématique des variables CSS
- **Accessibilité** : Respect des standards WCAG AA (contraste 4.5:1 minimum)
- **Maintenabilité** : Classes utilitaires réutilisables

### Palette Principale
- **Jaune** (`#fec800`) : Actions principales, badges questionnaire
- **Gris** : Textes et fonds neutres
- **Vert** : Succès et validations
- **Rouge** : Erreurs et échecs
- **Orange** : Avertissements
- **Bleu** : Informations

## Variables CSS Disponibles

### Mode Clair (`:root`)
```css
--primary: 47 100% 50%;           /* Jaune vif */
--primary-foreground: 0 0% 0%;   /* Noir sur jaune */
--secondary: 47 100% 50%;         /* Jaune vif */
--secondary-foreground: 0 0% 0%;  /* Noir sur jaune */
--accent: 47 100% 50%;            /* Jaune vif */
--accent-foreground: 0 0% 0%;    /* Noir sur jaune */
--success: 142.1 76.2% 36.3%;     /* Vert */
--success-foreground: 355.7 100% 97.3%; /* Blanc sur vert */
--destructive: 0 72% 51%;         /* Rouge */
--destructive-foreground: 0 0% 98%; /* Blanc sur rouge */
--warning: 38 92% 50%;            /* Orange */
--warning-foreground: 48 96% 89%; /* Texte sur orange */
--info: 221.2 83.2% 53.3%;       /* Bleu */
--info-foreground: 210 40% 98%;   /* Blanc sur bleu */
```

### Mode Sombre (`.dark`)
```css
--primary: 47 100% 50%;           /* Jaune vif */
--primary-foreground: 0 0% 0%;   /* Noir sur jaune */
--secondary: 47 100% 50%;         /* Jaune vif */
--secondary-foreground: 0 0% 0%;  /* Noir sur jaune */
--accent: 47 100% 50%;            /* Jaune vif */
--accent-foreground: 0 0% 0%;    /* Noir sur jaune */
--success: 142.1 70.6% 45.3%;     /* Vert plus clair */
--success-foreground: 144.9 80.4% 10%; /* Gris foncé sur vert */
--destructive: 0 84.2% 60.2%;     /* Rouge plus clair */
--destructive-foreground: 0 0% 98%; /* Blanc sur rouge */
--warning: 38 92% 50%;            /* Orange */
--warning-foreground: 48 96% 89%; /* Texte sur orange */
--info: 217.2 91.2% 59.8%;       /* Bleu plus clair */
--info-foreground: 222.2 84% 4.9%; /* Gris foncé sur bleu */
```

## Classes Utilitaires

### Interactions et Hover

#### Texte Cliquable avec Hover Jaune
```css
.text-clickable {
  @apply cursor-pointer transition-colors duration-200;
}
.text-clickable:hover {
  @apply text-primary;
}
```
**Usage** : Textes cliquables qui ne sont pas sur fond jaune
**Règle** : Devient jaune au survol

#### Liens avec Hover Jaune
```css
.link-hover-yellow {
  @apply text-foreground hover:text-primary transition-colors duration-200;
}
```
**Usage** : Liens de navigation, liens internes
**Règle** : Texte normal, jaune au survol

#### Boutons de Navigation avec Hover Jaune
```css
.nav-link-hover {
  @apply text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors duration-200;
}
```
**Usage** : Boutons de navigation, liens de menu
**Règle** : Texte gris, jaune au survol avec fond subtil

#### Éléments Interactifs avec Hover Jaune
```css
.interactive-hover {
  @apply cursor-pointer hover:text-primary transition-colors duration-200;
}
```
**Usage** : Options de réponses, boutons d'action, éléments cliquables
**Règle** : Texte normal, jaune au survol

### Boutons Standardisés

#### Bouton Primaire (Jaune)
```css
.btn-primary {
  @apply bg-primary text-primary-foreground hover:bg-primary/90;
}
```
**Usage** : Actions principales, boutons d'import, validation
**Règle** : TOUJOURS avec texte noir

#### Bouton Secondaire (Gris)
```css
.btn-secondary {
  @apply bg-secondary text-secondary-foreground hover:bg-secondary/80;
}
```
**Usage** : Actions secondaires, navigation
**Règle** : Texte adaptatif selon le thème

#### Bouton de Succès (Vert)
```css
.btn-success {
  @apply bg-success text-success-foreground hover:bg-success/90;
}
```
**Usage** : Confirmations, validations réussies
**Règle** : Texte blanc en mode clair, gris foncé en mode sombre

#### Bouton de Danger (Rouge)
```css
.btn-danger {
  @apply bg-destructive text-destructive-foreground hover:bg-destructive/90;
}
```
**Usage** : Suppressions, erreurs
**Règle** : Texte blanc

#### Bouton d'Avertissement (Orange)
```css
.btn-warning {
  @apply bg-warning text-warning-foreground hover:bg-warning/90;
}
```
**Usage** : Avertissements, actions risquées
**Règle** : Texte adaptatif selon le thème

#### Bouton d'Information (Bleu)
```css
.btn-info {
  @apply bg-info text-info-foreground hover:bg-info/90;
}
```
**Usage** : Informations, aide
**Règle** : Texte blanc en mode clair, gris foncé en mode sombre

#### Bouton Fantôme
```css
.btn-ghost {
  @apply hover:bg-muted/50 hover:text-foreground;
}
```
**Usage** : Actions discrètes, navigation
**Règle** : Texte adaptatif selon le thème

### Badges Standardisés

#### Badge de Questionnaire
```css
.badge-questionnaire {
  @apply bg-primary text-primary-foreground border-primary/20;
}
```
**Usage** : Numéros de questionnaire
**Règle** : Jaune avec texte noir

#### Badge de Statut - Succès
```css
.badge-status-success {
  @apply bg-success text-success-foreground border-success/20;
}
```
**Usage** : Questions validées, réponses correctes
**Règle** : Vert avec texte adaptatif

#### Badge de Statut - Erreur
```css
.badge-status-error {
  @apply bg-destructive text-destructive-foreground border-destructive/20;
}
```
**Usage** : Erreurs, échecs
**Règle** : Rouge avec texte blanc

#### Badge de Statut - Avertissement
```css
.badge-status-warning {
  @apply bg-warning text-warning-foreground border-warning/20;
}
```
**Usage** : Questions à corriger, avertissements
**Règle** : Orange avec texte adaptatif

#### Badge de Statut - Information
```css
.badge-status-info {
  @apply bg-info text-info-foreground border-info/20;
}
```
**Usage** : Questions non vérifiées, informations
**Règle** : Bleu avec texte adaptatif

#### Badge de Numéro de Question
```css
.badge-question-number {
  @apply bg-info text-info-foreground border-info/20;
}
```
**Usage** : Numéros de questions dans l'éditeur JSON
**Règle** : Bleu avec texte adaptatif

### Textes Standardisés

#### Texte Primaire Sécurisé
```css
.text-primary-safe {
  @apply text-primary-foreground;
}
```
**Usage** : Texte sur fond jaune
**Règle** : TOUJOURS noir

#### Texte sur Fond Sombre
```css
.text-on-dark {
  @apply text-foreground;
}
```
**Usage** : Texte en mode sombre
**Règle** : Blanc ou gris clair

#### Texte sur Fond Clair
```css
.text-on-light {
  @apply text-foreground;
}
```
**Usage** : Texte en mode clair
**Règle** : Gris foncé ou noir

#### Texte pour Labels
```css
.text-label {
  @apply text-foreground;
}
```
**Usage** : Labels et titres
**Règle** : Toujours visible

#### Texte pour Labels Secondaires
```css
.text-label-muted {
  @apply text-muted-foreground;
}
```
**Usage** : Descriptions, sous-titres
**Règle** : Gris selon le thème

### Fonds Standardisés

#### Fond de Carte Sécurisé
```css
.bg-card-safe {
  @apply bg-card text-card-foreground;
}
```
**Usage** : Cartes avec contraste garanti
**Règle** : Fond et texte adaptatifs

#### Fond de Mise en Évidence
```css
.bg-highlight {
  @apply bg-accent/10 border border-accent/20;
}
```
**Usage** : Éléments mis en évidence
**Règle** : Fond jaune transparent

#### Fond de Notification
```css
.bg-notification {
  @apply bg-primary/10 border border-primary/20;
}
```
**Usage** : Notifications, alertes
**Règle** : Fond jaune transparent

### Classes Spécialisées

#### Badge de Questionnaire Absolu
```css
.badge-questionnaire-absolute {
  @apply absolute top-1 right-1 bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center text-[14px] font-black border-2 border-white shadow-lg transform -rotate-2 hover:rotate-0 transition-transform duration-300 z-10;
}
```
**Usage** : Badge de questionnaire en position absolue
**Règle** : Jaune avec texte noir, position fixe

#### Bouton de Fermeture Modal
```css
.btn-close-modal {
  @apply absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold transition-colors;
}
```
**Usage** : Boutons de fermeture des modales
**Règle** : Fond noir semi-transparent avec texte blanc

#### Zone de Contrôle d'Image
```css
.image-control-overlay {
  @apply absolute top-2 right-2 bg-black/70 text-white px-3 py-2 rounded text-xs font-medium;
}
```
**Usage** : Instructions sur les images
**Règle** : Fond noir semi-transparent avec texte blanc

## Règles par Type d'Élément

### Interactions et Hover
- **Textes cliquables** : `.text-clickable` (hover jaune)
- **Liens de navigation** : `.link-hover-yellow` (hover jaune)
- **Boutons de navigation** : `.nav-link-hover` (hover jaune + fond)
- **Éléments interactifs** : `.interactive-hover` (hover jaune)
- **Options de réponses** : `.interactive-hover` (hover jaune)
- **Boutons d'action** : `.interactive-hover` (hover jaune)

### Boutons
- **Actions principales** : `.btn-primary` (jaune)
- **Actions secondaires** : `.btn-secondary` (gris)
- **Succès** : `.btn-success` (vert)
- **Danger** : `.btn-danger` (rouge)
- **Avertissement** : `.btn-warning` (orange)
- **Information** : `.btn-info` (bleu)
- **Actions discrètes** : `.btn-ghost` (transparent)

### Badges
- **Questionnaire** : `.badge-questionnaire` (jaune)
- **Succès** : `.badge-status-success` (vert)
- **Erreur** : `.badge-status-error` (rouge)
- **Avertissement** : `.badge-status-warning` (orange)
- **Information** : `.badge-status-info` (bleu)
- **Numéro de question** : `.badge-question-number` (bleu)

### Textes
- **Titres** : `text-foreground`
- **Labels** : `text-label`
- **Descriptions** : `text-label-muted`
- **Sur fond jaune** : `text-primary-safe`
- **En mode sombre** : `text-on-dark`
- **En mode clair** : `text-on-light`

### Fonds
- **Cartes** : `bg-card-safe`
- **Mise en évidence** : `bg-highlight`
- **Notifications** : `bg-notification`

## Exemples de Code

### Bouton d'Action Principale
```tsx
<Button className="btn-primary">
  Importer les données
</Button>
```

### Badge de Questionnaire
```tsx
<div className="badge-questionnaire-absolute">
  {questionnaireNumber}
</div>
```

### Badge de Statut
```tsx
<Badge className="badge-status-success">
  ✓ Validée
</Badge>
```

### Texte sur Fond Jaune
```tsx
<div className="bg-primary text-primary-safe p-4 rounded">
  Texte toujours visible
</div>
```

### Carte avec Contraste Garanti
```tsx
<Card className="bg-card-safe">
  <CardContent>
    <h3 className="text-label">Titre</h3>
    <p className="text-label-muted">Description</p>
  </CardContent>
</Card>
```

## Checklist de Validation

### Pour Chaque Élément
- [ ] **Mode clair** : Élément visible et lisible
- [ ] **Mode sombre** : Élément visible et lisible
- [ ] **Contraste** : Minimum 4.5:1 pour texte normal, 3:1 pour texte large
- [ ] **Survol** : État hover visible
- [ ] **Focus** : État focus visible (ring)
- [ ] **Désactivé** : État disabled visible
- [ ] **Cohérence** : Utilise les classes utilitaires
- [ ] **Accessibilité** : Respecte les standards WCAG AA

### Tests Obligatoires
- [ ] Tester en mode clair
- [ ] Tester en mode sombre
- [ ] Vérifier le contraste avec un outil (ex: WebAIM)
- [ ] Tester avec un lecteur d'écran
- [ ] Vérifier la navigation au clavier

## Règles d'Interdiction

### ❌ Ne Jamais Utiliser
- `bg-yellow-500` → Utiliser `.badge-questionnaire`
- `text-white` sur fond jaune → Utiliser `text-primary-foreground`
- `text-secondary-foreground` sur fond sombre → Utiliser `text-foreground`
- `text-accent-foreground` sur fond sombre → Utiliser `text-foreground`
- Couleurs Tailwind directes → Utiliser les variables CSS

### ✅ Toujours Utiliser
- Variables CSS pour les couleurs
- Classes utilitaires pour les éléments récurrents
- `text-foreground` pour les textes principaux
- `text-primary-foreground` pour les textes sur fond jaune
- Classes spécialisées pour les éléments complexes

## Maintenance

### Ajout de Nouvelles Couleurs
1. Définir la variable CSS dans `:root` et `.dark`
2. Créer la classe utilitaire correspondante
3. Documenter l'usage dans ce guide
4. Tester en mode clair et sombre

### Modification de Couleurs Existantes
1. Modifier la variable CSS
2. Tester tous les éléments utilisant cette couleur
3. Vérifier le contraste
4. Mettre à jour la documentation

### Débogage
1. Vérifier les variables CSS dans les DevTools
2. Tester le contraste avec un outil
3. Vérifier la cohérence avec les autres éléments
4. Consulter ce guide pour les bonnes pratiques

---

**Dernière mise à jour** : Janvier 2025
**Version** : 1.0
**Mainteneur** : Équipe Code Bus
