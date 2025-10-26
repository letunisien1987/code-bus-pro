const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

async function createAdminUser() {
  try {
    console.log('🔐 Création de l\'utilisateur admin...')
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    // Créer l'objet utilisateur admin
    const adminUser = {
      id: 'admin-user-id',
      email: 'ahmedelghoudi@gmail.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Sauvegarder dans un fichier JSON temporaire
    const adminData = {
      admin: adminUser,
      created: new Date().toISOString()
    }
    
    fs.writeFileSync('admin-user.json', JSON.stringify(adminData, null, 2))
    
    console.log('✅ Utilisateur admin créé!')
    console.log('📧 Email:', adminUser.email)
    console.log('🔐 Mot de passe: admin123')
    console.log('🔑 Rôle: ADMIN')
    console.log('💾 Données sauvegardées dans admin-user.json')
    
    console.log('\n📋 Instructions de connexion:')
    console.log('1. Allez sur: http://localhost:3000/auth/signin')
    console.log('2. Email: ahmedelghoudi@gmail.com')
    console.log('3. Mot de passe: admin123')
    console.log('4. Ou utilisez Google avec le même email')
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

createAdminUser()
