import { z } from 'zod'

// Schema pour les paramètres de pagination
export const paginationSchema = z.object({
  page: z
    .number()
    .int('La page doit être un entier')
    .min(1, 'La page doit être supérieure à 0')
    .default(1),
  
  limit: z
    .number()
    .int('La limite doit être un entier')
    .min(1, 'La limite doit être supérieure à 0')
    .max(100, 'La limite ne peut pas dépasser 100')
    .default(20)
})

// Schema pour les filtres de questions
export const questionFiltersSchema = z.object({
  questionnaire: z
    .number()
    .int('Le numéro de questionnaire doit être un entier')
    .min(1, 'Le numéro de questionnaire doit être supérieur à 0')
    .max(10, 'Le numéro de questionnaire ne peut pas dépasser 10')
    .optional(),
  
  categorie: z
    .string()
    .max(50, 'La catégorie ne peut pas dépasser 50 caractères')
    .optional(),
  
  astag: z
    .string()
    .max(10, 'L\'astag ne peut pas dépasser 10 caractères')
    .optional(),
  
  search: z
    .string()
    .max(100, 'La recherche ne peut pas dépasser 100 caractères')
    .optional()
})

// Schema pour les paramètres de recherche
export const searchParamsSchema = z.object({
  q: z
    .string()
    .max(100, 'La requête de recherche ne peut pas dépasser 100 caractères')
    .optional(),
  
  type: z
    .enum(['question', 'category', 'astag'])
    .optional(),
  
  sort: z
    .enum(['asc', 'desc'])
    .default('asc')
})

// Schema pour les IDs (UUID)
export const idSchema = z
  .string()
  .uuid('L\'ID doit être un UUID valide')

// Schema pour les paramètres de route
export const routeParamsSchema = z.object({
  id: idSchema
})

// Schema pour les statistiques
export const statsSchema = z.object({
  period: z
    .enum(['day', 'week', 'month', 'year'])
    .default('month'),
  
  userId: idSchema.optional()
})

// Schema pour les tentatives d'examen
export const attemptSchema = z.object({
  questionId: idSchema,
  answer: z
    .enum(['a', 'b', 'c'])
    .optional(),
  
  isCorrect: z
    .boolean()
    .optional(),
  
  timeSpent: z
    .number()
    .int('Le temps passé doit être un entier')
    .min(0, 'Le temps passé ne peut pas être négatif')
    .optional()
})

// Schema pour les paramètres d'analyse IA
export const aiAnalysisSchema = z.object({
  imagePath: z
    .string()
    .min(1, 'Le chemin de l\'image est requis')
    .regex(
      /^\/images\/questionnaire_\d+\/app_zone\/Question\s*\(\d+\)\.jpg$/,
      'Le chemin de l\'image doit suivre le format /images/questionnaire_X/app_zone/Question (Y).jpg'
    ),
  
  questionId: idSchema.optional()
})

// Types TypeScript dérivés des schémas
export type PaginationParams = z.infer<typeof paginationSchema>
export type QuestionFilters = z.infer<typeof questionFiltersSchema>
export type SearchParams = z.infer<typeof searchParamsSchema>
export type RouteParams = z.infer<typeof routeParamsSchema>
export type StatsParams = z.infer<typeof statsSchema>
export type AttemptData = z.infer<typeof attemptSchema>
export type AIAnalysisParams = z.infer<typeof aiAnalysisSchema>

// Fonction utilitaire pour valider les paramètres de requête
export function validateQueryParams<T>(
  schema: z.ZodSchema<T>,
  params: Record<string, unknown>
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const data = schema.parse(params)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => err.message)
      }
    }
    return {
      success: false,
      errors: ['Erreur de validation inconnue']
    }
  }
}

// Fonction utilitaire pour valider les paramètres de route
export function validateRouteParams<T>(
  schema: z.ZodSchema<T>,
  params: Record<string, string | string[]>
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    // Convertir les paramètres de route en types appropriés
    const convertedParams: Record<string, unknown> = {}
    
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        convertedParams[key] = value[0] // Prendre le premier élément
      } else {
        convertedParams[key] = value
      }
    }
    
    const data = schema.parse(convertedParams)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => err.message)
      }
    }
    return {
      success: false,
      errors: ['Erreur de validation inconnue']
    }
  }
}
