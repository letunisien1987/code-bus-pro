import { PrismaClient } from '@prisma/client'
import questionsData from '../config/data/questions.json'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.attempt.deleteMany()
  await prisma.question.deleteMany()

  // Insert questions
  for (const questionData of questionsData) {
    await prisma.question.create({
      data: {
        id: questionData.id,
        questionnaire: questionData.questionnaire,
        question: questionData.question,
        categorie: questionData.categorie,
        astag: questionData['astag D/F/I '],
        enonce: questionData.enonce || questionData.question || 'Question sans énoncé',
        optionA: questionData.options.a,
        optionB: questionData.options.b,
        optionC: questionData.options.c,
        optionD: (questionData.options as any).d || null,
        bonneReponse: questionData.bonne_reponse,
        imagePath: questionData.image_path.startsWith('/') ? questionData.image_path : `/${questionData.image_path}`,
      },
    })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
