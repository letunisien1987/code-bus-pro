#!/bin/bash

echo "🔄 Import forcé des questions depuis config/data/questions.json..."
echo ""

# Vérifier que le fichier existe
if [ ! -f "config/data/questions.json" ]; then
  echo "❌ Erreur : config/data/questions.json n'existe pas"
  exit 1
fi

# Compter les questions dans le JSON AVANT import
echo "📊 Analyse du fichier JSON..."
QUESTION_COUNT=$(cat config/data/questions.json | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data))")
echo "   - Questions trouvées dans le JSON : $QUESTION_COUNT"

# Afficher les IDs des questions
echo "   - IDs des questions :"
cat config/data/questions.json | python3 -c "
import sys, json
data = json.load(sys.stdin)
for i, q in enumerate(data, 1):
    print(f'     {i}. {q[\"id\"]} - {q[\"enonce\"][:50]}...' if q[\"enonce\"] else f'     {i}. {q[\"id\"]} - (pas d\'énoncé)')
"

# Compter les images
if [ -d "public/images/questionnaire_1" ]; then
  IMAGE_COUNT=$(ls -1 public/images/questionnaire_1/ | wc -l)
  echo "🖼️  Images trouvées : $IMAGE_COUNT"
else
  IMAGE_COUNT=0
  echo "⚠️  Dossier public/images/questionnaire_1 n'existe pas"
fi

echo ""
echo "🗑️  Suppression de l'ancienne base de données..."
rm -f prisma/dev.db
rm -f prisma/dev.db-journal

echo "📊 Création de la nouvelle base de données..."
npx prisma db push --force-reset > /dev/null 2>&1

echo "🌱 Import des questions..."
npm run db:seed > /dev/null 2>&1

# Vérifier le nombre de questions importées
IMPORTED_COUNT=$(echo "SELECT COUNT(*) FROM Question;" | sqlite3 prisma/dev.db 2>/dev/null || echo "0")

echo ""
echo "✅ Import terminé !"
echo "📈 Statistiques finales :"
echo "   - Questions dans le JSON : $QUESTION_COUNT"
echo "   - Questions importées : $IMPORTED_COUNT"
echo "   - Images trouvées : $IMAGE_COUNT"

if [ "$IMPORTED_COUNT" -eq "$QUESTION_COUNT" ]; then
  echo "🎉 SUCCÈS : Toutes les questions ont été importées !"
else
  echo "⚠️  ATTENTION : $((QUESTION_COUNT - IMPORTED_COUNT)) questions n'ont pas été importées"
fi

echo ""
echo "🔍 Vérification des questions importées :"
echo "SELECT id, question, enonce FROM Question;" | sqlite3 prisma/dev.db | while read line; do
  echo "   - $line"
done

# Retourner les statistiques au format JSON
echo ""
echo "{\"success\": true, \"imported\": $IMPORTED_COUNT, \"total\": $QUESTION_COUNT, \"imagesFound\": $IMAGE_COUNT}"
