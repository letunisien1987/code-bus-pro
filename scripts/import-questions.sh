#!/bin/bash

# Script pour importer les questions via l'interface web
# Ce script sera appelé par l'API route

echo "🔄 Import des questions depuis data/questions.json..."

# Vérifier que le fichier existe
if [ ! -f "data/questions.json" ]; then
  echo "❌ Erreur : data/questions.json n'existe pas"
  exit 1
fi

# Compter les questions dans le JSON
QUESTION_COUNT=$(cat data/questions.json | python3 -c "import sys, json; print(len(json.load(sys.stdin)))")
echo "📊 Questions trouvées dans le JSON : $QUESTION_COUNT"

# Compter les images
if [ -d "questionnaire_1/images" ]; then
  IMAGE_COUNT=$(ls -1 questionnaire_1/images/ | wc -l)
  echo "🖼️  Images trouvées : $IMAGE_COUNT"
else
  IMAGE_COUNT=0
  echo "⚠️  Dossier questionnaire_1/images n'existe pas"
fi

# Réinitialiser la base de données
echo "🗑️  Suppression des anciennes données..."
rm -f prisma/dev.db
rm -f prisma/dev.db-journal

# Créer la nouvelle base
echo "📊 Création de la nouvelle base de données..."
npx prisma db push --force-reset > /dev/null 2>&1

# Importer les questions
echo "🌱 Import des questions..."
npm run db:seed > /dev/null 2>&1

# Vérifier le nombre de questions importées
IMPORTED_COUNT=$(echo "SELECT COUNT(*) FROM Question;" | sqlite3 prisma/dev.db 2>/dev/null || echo "0")

echo "✅ Import terminé !"
echo "📈 Statistiques :"
echo "   - Questions dans le JSON : $QUESTION_COUNT"
echo "   - Questions importées : $IMPORTED_COUNT"
echo "   - Images trouvées : $IMAGE_COUNT"

# Retourner les statistiques au format JSON
echo "{\"success\": true, \"imported\": $IMPORTED_COUNT, \"total\": $QUESTION_COUNT, \"imagesFound\": $IMAGE_COUNT}"
