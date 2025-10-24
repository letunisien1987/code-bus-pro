import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as readline from 'readline'

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function createAdmin() {
  try {
    console.log('🔐 Création du compte administrateur')
    console.log('=====================================\n')

    const name = await question('Nom complet de l\'administrateur: ')
    const email = await question('Email de l\'administrateur: ')
    const password = await question('Mot de passe (min 6 caractères): ')

    if (!name || !email || !password) {
      console.log('❌ Tous les champs sont requis')
      process.exit(1)
    }

    if (password.length < 6) {
      console.log('❌ Le mot de passe doit contenir au moins 6 caractères')
      process.exit(1)
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('❌ Un utilisateur avec cet email existe déjà')
      process.exit(1)
    }

    // Hasher le mot de passe
    console.log('🔒 Hachage du mot de passe...')
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'administrateur
    console.log('👤 Création du compte administrateur...')
    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    console.log('\n✅ Compte administrateur créé avec succès!')
    console.log('=====================================')
    console.log(`👤 Nom: ${admin.name}`)
    console.log(`📧 Email: ${admin.email}`)
    console.log(`🔑 Rôle: ${admin.role}`)
    console.log(`🆔 ID: ${admin.id}`)
    console.log('\n🌐 Vous pouvez maintenant vous connecter à l\'application')

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

// Exécuter le script
createAdmin()
