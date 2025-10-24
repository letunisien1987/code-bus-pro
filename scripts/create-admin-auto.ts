import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('🔐 Création automatique du compte administrateur')
    console.log('================================================\n')

    const name = 'Administrateur'
    const email = 'admin@codebus.com'
    const password = 'admin123'

    console.log(`👤 Nom: ${name}`)
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Mot de passe: ${password}`)
    console.log('')

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('⚠️  Un utilisateur avec cet email existe déjà')
      console.log(`🆔 ID: ${existingUser.id}`)
      console.log(`🔑 Rôle: ${existingUser.role}`)
      return
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
    console.log('=========================================')
    console.log(`👤 Nom: ${admin.name}`)
    console.log(`📧 Email: ${admin.email}`)
    console.log(`🔑 Rôle: ${admin.role}`)
    console.log(`🆔 ID: ${admin.id}`)
    console.log('\n🌐 Vous pouvez maintenant vous connecter à l\'application')
    console.log('🔗 URL: http://localhost:3000/auth/signin')

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
createAdmin()
