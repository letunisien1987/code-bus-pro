const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function migrate() {
  try {
    console.log('🚀 Début de la migration des données JSON vers PostgreSQL...')
    
    // 1. Créer les utilisateurs manquants EN PREMIER
    console.log('👤 Création des utilisateurs manquants...')
    const attemptsFile = path.join(process.cwd(), 'data', 'user-attempts.json')
    const examHistoryFile = path.join(process.cwd(), 'data', 'exam-history.json')
    
    const userIds = new Set()
    
    // Collecter tous les userId depuis les tentatives
    if (fs.existsSync(attemptsFile)) {
      const attempts = JSON.parse(fs.readFileSync(attemptsFile, 'utf-8'))
      attempts.forEach(attempt => userIds.add(attempt.userId))
    }
    
    // Collecter tous les userId depuis l'historique des examens
    if (fs.existsSync(examHistoryFile)) {
      const examHistory = JSON.parse(fs.readFileSync(examHistoryFile, 'utf-8'))
      examHistory.forEach(exam => userIds.add(exam.userId))
    }
    
    console.log(`🔍 ${userIds.size} utilisateurs uniques trouvés`)
    
    // Créer les utilisateurs manquants
    for (const userId of userIds) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { id: userId }
        })
        
        if (!existingUser) {
          // Créer un utilisateur avec des données par défaut
          await prisma.user.create({
            data: {
              id: userId,
              email: `${userId}@google.oauth`, // Email fictif pour les utilisateurs Google
              name: `Utilisateur ${userId}`,
              role: 'STUDENT',
              emailVerified: new Date()
            }
          })
          console.log(`✅ Utilisateur créé: ${userId}`)
        }
      } catch (error) {
        console.error(`❌ Erreur création utilisateur ${userId}:`, error.message)
      }
    }
    
    // 2. Maintenant migrer les tentatives
    console.log('📊 Migration des tentatives...')
    
    if (fs.existsSync(attemptsFile)) {
      const attempts = JSON.parse(fs.readFileSync(attemptsFile, 'utf-8'))
      console.log(`📋 ${attempts.length} tentatives trouvées`)
      
      let migratedAttempts = 0
      for (const attempt of attempts) {
        try {
          await prisma.attempt.upsert({
            where: { id: attempt.id },
            update: {},
            create: {
              id: attempt.id,
              userId: attempt.userId,
              questionId: attempt.questionId,
              choix: attempt.choix,
              correct: attempt.correct,
              createdAt: new Date(attempt.createdAt)
            }
          })
          migratedAttempts++
          
          if (migratedAttempts % 100 === 0) {
            console.log(`✅ ${migratedAttempts}/${attempts.length} tentatives migrées`)
          }
        } catch (error) {
          console.error(`❌ Erreur migration tentative ${attempt.id}:`, error.message)
        }
      }
      
      console.log(`🎉 ${migratedAttempts} tentatives migrées avec succès`)
    } else {
      console.log('⚠️  Fichier user-attempts.json non trouvé')
    }
    
    // 3. Vérifier les données migrées
    console.log('🔍 Vérification des données migrées...')
    const totalAttempts = await prisma.attempt.count()
    const totalUsers = await prisma.user.count()
    
    console.log(`📊 Total tentatives dans PostgreSQL: ${totalAttempts}`)
    console.log(`👥 Total utilisateurs dans PostgreSQL: ${totalUsers}`)
    
    console.log('🎉 Migration terminée avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrate()
