# 📚 Guide de Mise à Jour des Questions - Code Bus Pro

Ce guide explique comment mettre à jour le fichier `questions.json` sur Vercel **sans utiliser Cursor**.

## 🎯 Vue d'ensemble

Pour mettre à jour les questions sur votre application déployée :
1. **Modifier** le fichier `config/config/data/questions.json` 
2. **Déployer** automatiquement via Vercel
3. **Importer** les données via l'API

---

## 🔄 Méthode 1 : Interface GitHub (Recommandée)

### ✅ Avantages
- Pas besoin d'installer Git
- Interface intuitive et visuelle
- Déploiement automatique
- Idéal pour les modifications ponctuelles

### 📋 Étapes

1. **Accéder au repository**
   - Allez sur [github.com/letunisien1987/code-bus-pro](https://github.com/letunisien1987/code-bus-pro)

2. **Sélectionner la branche**
   - Cliquez sur la branche `vercel-prod` (en haut à gauche)

3. **Modifier le fichier**
   - Naviguez vers `config/data/questions.json`
   - Cliquez sur l'icône crayon ✏️ "Edit this file"

4. **Éditer le contenu**
   - Modifiez le contenu du fichier JSON
   - Respectez la structure existante

5. **Sauvegarder**
   - En bas, ajoutez un message de commit (ex: "Update questions.json")
   - Cliquez sur "Commit changes"

6. **Attendre le déploiement**
   - Vercel déploie automatiquement en 1-2 minutes
   - Surveillez dans [vercel.com/dashboard](https://vercel.com/dashboard)

7. **Importer les données**
   ```bash
   curl -X POST https://code.elghoudi.net/api/import
   ```
   Ou via l'interface : https://code.elghoudi.net/import

---

## 🔄 Méthode 2 : Terminal Git

### ✅ Avantages
- Contrôle total du processus
- Historique des modifications
- Idéal pour les développeurs
- Gestion des conflits

### 📋 Étapes

1. **Cloner le repository**
   ```bash
   git clone https://github.com/letunisien1987/code-bus-pro.git
   cd code-bus-pro
   ```

2. **Basculer sur la branche**
   ```bash
   git checkout vercel-prod
   ```

3. **Modifier le fichier**
   ```bash
   # Utilisez votre éditeur préféré
   nano config/data/questions.json
   # ou
   vim config/data/questions.json
   # ou
   code config/data/questions.json
   ```

4. **Ajouter les modifications**
   ```bash
   git add config/data/questions.json
   ```

5. **Commiter**
   ```bash
   git commit -m "Update questions.json"
   ```

6. **Pousser vers GitHub**
   ```bash
   git push origin vercel-prod
   ```

7. **Importer les données**
   ```bash
   curl -X POST https://code.elghoudi.net/api/import
   ```

---

## 🔄 Méthode 3 : Éditeur en ligne GitHub

### ✅ Avantages
- Interface de développement complète
- Pas d'installation requise
- Fonctionnalités avancées
- Prévisualisation en temps réel

### 📋 Étapes

1. **Accéder à l'éditeur**
   - Allez sur [github.dev/letunisien1987/code-bus-pro](https://github.dev/letunisien1987/code-bus-pro)

2. **Sélectionner la branche**
   - Cliquez sur la branche `vercel-prod`

3. **Ouvrir le fichier**
   - Naviguez vers `config/data/questions.json`
   - Cliquez pour ouvrir

4. **Modifier le contenu**
   - Utilisez l'éditeur avec coloration syntaxique
   - Validation JSON automatique

5. **Sauvegarder et commiter**
   - `Ctrl+S` pour sauvegarder
   - Cliquez sur l'icône Git (branche)
   - Ajoutez un message de commit
   - Cliquez sur "Commit & Push"

6. **Importer les données**
   ```bash
   curl -X POST https://code.elghoudi.net/api/import
   ```

---

## 📊 Comparaison des méthodes

| Critère | GitHub Web | Git Terminal | GitHub.dev |
|---------|------------|--------------|------------|
| **Simplicité** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Contrôle** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Rapidité** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Fonctionnalités** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Apprentissage** | ⭐⭐⭐ | ⭐ | ⭐⭐ |

---

## 🚨 Points importants

### ⚠️ Structure du fichier JSON
```json
[
  {
    "id": "1_0001",
    "questionnaire": 1,
    "question": "0001",
    "categorie": "Signalisation",
    "astag D/F/I ": "1/10",
    "enonce": "Que signifie ce panneau ?",
    "options": {
      "a": "Route prioritaire",
      "b": "Cédez le passage",
      "c": "Fin de priorité"
    },
    "bonne_reponse": "a",
    "image_path": "images/questionnaire_1/Question (1).jpg"
  }
]
```

### ✅ Vérifications avant déploiement
- [ ] JSON valide (pas d'erreurs de syntaxe)
- [ ] Tous les champs requis présents
- [ ] Chemins d'images corrects
- [ ] IDs uniques

### 🔄 Workflow recommandé
1. **Modifier** le fichier localement
2. **Tester** la validité JSON
3. **Déployer** via une des 3 méthodes
4. **Vérifier** le déploiement Vercel
5. **Importer** via l'API
6. **Tester** l'application

---

## 🆘 Dépannage

### Problème : "Erreur d'import"
- Vérifiez que le déploiement Vercel est terminé
- Attendez 2-3 minutes après le commit
- Vérifiez les logs Vercel

### Problème : "JSON invalide"
- Utilisez un validateur JSON en ligne
- Vérifiez les virgules et guillemets
- Respectez la structure exacte

### Problème : "Images non trouvées"
- Vérifiez les chemins dans `image_path`
- Assurez-vous que les images sont dans `public/images/`
- Respectez la casse des noms de fichiers

---

## 📞 Support

Pour toute question ou problème :
- Consultez les logs Vercel : [vercel.com/dashboard](https://vercel.com/dashboard)
- Vérifiez les logs de l'API : Functions → `/api/import`
- Testez l'API : `curl -X POST https://code.elghoudi.net/api/import`

---

**Code Bus Pro** - Guide de mise à jour des questions 🚌✨
