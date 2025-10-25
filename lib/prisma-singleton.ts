import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Fonction pour fermer proprement la connexion
export async function disconnectPrisma() {
  await prisma.$disconnect()
}

// Fonction pour tester la connexion
export async function testPrismaConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error)
    return false
  }
}

// Middleware pour logger les requêtes en développement
if (process.env.NODE_ENV === 'development') {
  prisma.$use(async (params, next) => {
    const before = Date.now()
    const result = await next(params)
    const after = Date.now()
    
    console.log(`Query ${params.model}.${params.action} took ${after - before}ms`)
    return result
  })
}
