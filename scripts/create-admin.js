const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('🔐 Création de l\'utilisateur admin...')
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: 'ahmedelghoudi@gmail.com' }
    })
    
    if (existingUser) {
      console.log('✅ Utilisateur admin existe déjà:', existingUser.email)
      console.log('📧 Email:', existingUser.email)
      console.log('👤 Nom:', existingUser.name)
      console.log('🔑 Rôle:', existingUser.role)
      return
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    // Créer l'utilisateur admin
    const adminUser = await prisma.user.create({
      data: {
        email: 'ahmedelghoudi@gmail.com',
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date()
      }
    })
    
    console.log('✅ Utilisateur admin créé avec succès!')
    console.log('📧 Email:', adminUser.email)
    console.log('👤 Nom:', adminUser.name)
    console.log('🔑 Rôle:', adminUser.role)
    console.log('🔐 Mot de passe: admin123')
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
