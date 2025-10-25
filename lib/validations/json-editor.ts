import { z } from 'zod'

// Schema pour une option de réponse
export const optionSchema = z.object({
  a: z.string().min(1, 'L\'option A est requise'),
  b: z.string().min(1, 'L\'option B est requise'),
  c: z.string().min(1, 'L\'option C est requise')
})

// Schema pour une question complète
export const questionSchema = z.object({
  id: z
    .string()
    .uuid('L\'ID doit être un UUID valide'),
  
  enonce: z
    .string()
    .min(1, 'L\'énoncé est requis')
    .max(1000, 'L\'énoncé ne peut pas dépasser 1000 caractères'),
  
  image_path: z
    .string()
    .min(1, 'Le chemin de l\'image est requis')
    .regex(
      /^\/images\/questionnaire_\d+\/(app_zone\/)?Question\s*\(\d+\)\.jpg$/,
      'Le chemin de l\'image doit suivre le format /images/questionnaire_X/Question (Y).jpg'
    ),
  
  options: optionSchema,
  
  bonne_reponse: z
    .enum(['a', 'b', 'c'], {
      errorMap: () => ({ message: 'La bonne réponse doit être a, b ou c' })
    }),
  
  categorie: z
    .string()
    .min(1, 'La catégorie est requise')
    .max(50, 'La catégorie ne peut pas dépasser 50 caractères'),
  
  'astag D/F/I ': z
    .string()
    .min(1, 'L\'astag est requis')
    .max(10, 'L\'astag ne peut pas dépasser 10 caractères'),
  
  numero_question: z
    .number()
    .int('Le numéro de question doit être un entier')
    .min(1, 'Le numéro de question doit être supérieur à 0')
    .max(40, 'Le numéro de question ne peut pas dépasser 40'),
  
  questionnaire: z
    .number()
    .int('Le numéro de questionnaire doit être un entier')
    .min(1, 'Le numéro de questionnaire doit être supérieur à 0')
    .max(10, 'Le numéro de questionnaire ne peut pas dépasser 10')
})

// Schema pour un tableau de questions
export const questionsArraySchema = z.array(questionSchema)

// Schema pour la sauvegarde de toutes les questions
export const saveAllQuestionsSchema = z.object({
  questions: questionsArraySchema
})

// Schema pour la recherche/filtrage
export const questionFiltersSchema = z.object({
  questionnaire: z
    .number()
    .int()
    .min(1)
    .max(10)
    .optional(),
  
  categorie: z
    .string()
    .max(50)
    .optional(),
  
  astag: z
    .string()
    .max(10)
    .optional(),
  
  search: z
    .string()
    .max(100)
    .optional(),
  
  page: z
    .number()
    .int()
    .min(1)
    .default(1)
    .optional(),
  
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .optional()
})

// Types TypeScript dérivés des schémas
export type Question = z.infer<typeof questionSchema>
export type QuestionsArray = z.infer<typeof questionsArraySchema>
export type SaveAllQuestionsData = z.infer<typeof saveAllQuestionsSchema>
export type QuestionFilters = z.infer<typeof questionFiltersSchema>

// Fonction utilitaire pour valider un chemin d'image
export function validateImagePath(path: string): boolean {
  const allowedPatterns = [
    /^\/images\/questionnaire_\d+\/Question\s*\(\d+\)\.jpg$/,
    /^\/images\/questionnaire_\d+\/app_zone\/Question\s*\(\d+\)\.jpg$/
  ]
  
  return allowedPatterns.some(pattern => pattern.test(path))
}

// Fonction utilitaire pour normaliser un chemin d'image
export function normalizeImagePath(path: string): string {
  // Supprimer les espaces multiples et normaliser les slashes
  return path.replace(/\s+/g, ' ').replace(/\/+/g, '/')
}
