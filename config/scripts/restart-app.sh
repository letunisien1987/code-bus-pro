#!/bin/bash

echo "🔄 Redémarrage de l'application après import..."

# Arrêter l'application en cours
echo "⏹️  Arrêt de l'application..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "prisma studio" 2>/dev/null || true

# Attendre un peu
sleep 2

# Nettoyer le cache
echo "🧹 Nettoyage du cache..."
rm -rf .next 2>/dev/null || true

# Redémarrer l'application
echo "🚀 Redémarrage de l'application..."
npm run dev &
echo "✅ Application redémarrée !"

# Attendre que l'application soit prête
sleep 5

# Tester l'API
echo "🧪 Test de l'API..."
API_RESPONSE=$(curl -s http://localhost:3000/api/questions 2>/dev/null || echo "[]")
QUESTION_COUNT=$(echo "$API_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data))" 2>/dev/null || echo "0")

echo "📊 Questions disponibles dans l'API : $QUESTION_COUNT"

if [ "$QUESTION_COUNT" -gt 0 ]; then
  echo "✅ Application prête avec $QUESTION_COUNT questions !"
else
  echo "⚠️  L'application n'est pas encore prête, attendez quelques secondes..."
fi
