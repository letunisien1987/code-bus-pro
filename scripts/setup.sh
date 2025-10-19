#!/bin/bash

echo "🚀 Configuration de Code Bus..."

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js 18+ d'abord."
    exit 1
fi

# Vérifier la version de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ requis. Version actuelle: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) détecté"

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances"
    exit 1
fi

# Configurer la base de données
echo "🗄️ Configuration de la base de données..."
npx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la configuration de la base de données"
    exit 1
fi

# Importer les données de démonstration
echo "📊 Importation des données de démonstration..."
npm run db:seed

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'importation des données"
    exit 1
fi

echo ""
echo "✅ Configuration terminée avec succès !"
echo ""
echo "🚀 Pour démarrer l'application :"
echo "   npm run dev"
echo ""
echo "🌐 L'application sera accessible sur :"
echo "   http://localhost:3000"
echo ""
echo "📚 Pour plus d'informations, consultez le README.md"
