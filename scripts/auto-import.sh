#!/bin/bash

echo "🚀 Import automatique avec nettoyage du cache"
echo "=============================================="

# Vérifier le fichier JSON
echo "📊 Analyse du fichier JSON..."
QUESTION_COUNT=$(cat data/questions.json | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data))")
echo "   - Questions dans le JSON : $QUESTION_COUNT"

# Lancer l'import
echo ""
echo "🔄 Lancement de l'import..."
curl -X POST http://localhost:3000/api/import -H "Content-Type: application/json" 2>/dev/null | python3 -m json.tool

# Attendre un peu
echo ""
echo "⏳ Attente de la synchronisation..."
sleep 3

# Redémarrer l'application
echo ""
echo "🔄 Redémarrage de l'application..."
pkill -f "next dev" 2>/dev/null || true
sleep 2
npm run dev &
echo "✅ Application redémarrée"

# Attendre que l'application soit prête
echo ""
echo "⏳ Attente du démarrage..."
sleep 8

# Tester l'API
echo ""
echo "🧪 Test final..."
API_RESPONSE=$(curl -s http://localhost:3000/api/questions 2>/dev/null || echo "[]")
FINAL_COUNT=$(echo "$API_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data))" 2>/dev/null || echo "0")

echo "📊 Résultat final :"
echo "   - Questions dans le JSON : $QUESTION_COUNT"
echo "   - Questions dans l'API : $FINAL_COUNT"

if [ "$FINAL_COUNT" -eq "$QUESTION_COUNT" ]; then
  echo "🎉 SUCCÈS : Toutes les questions sont synchronisées !"
  echo "🌐 Application disponible sur : http://localhost:3000"
else
  echo "⚠️  ATTENTION : $((QUESTION_COUNT - FINAL_COUNT)) questions manquantes"
fi
