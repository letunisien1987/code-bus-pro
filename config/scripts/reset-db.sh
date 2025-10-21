#!/bin/bash

# Script pour réinitialiser la base de données avec de nouvelles questions

echo "🔄 Réinitialisation de la base de données..."
echo ""

# Supprimer l'ancienne base de données
if [ -f "prisma/dev.db" ]; then
  echo "🗑️  Suppression de l'ancienne base de données..."
  rm -f prisma/dev.db
  rm -f prisma/dev.db-journal
  echo "✅ Base de données supprimée"
else
  echo "ℹ️  Aucune base de données à supprimer"
fi

echo ""
echo "📊 Création de la nouvelle base de données..."
npx prisma db push --force-reset

echo ""
echo "🌱 Import des nouvelles questions depuis config/data/questions.json..."
npm run db:seed

echo ""
echo "✅ Réinitialisation terminée !"
echo ""
echo "📈 Statistiques :"
echo "   - Base de données créée : prisma/dev.db"
echo "   - Questions importées depuis : config/data/questions.json"
echo ""
echo "🚀 Vous pouvez maintenant utiliser l'application avec vos nouvelles questions !"

