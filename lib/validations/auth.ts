import { z } from 'zod'

// Schema pour l'inscription
export const signupSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Le nom ne peut contenir que des lettres et espaces'),
  
  email: z
    .string()
    .email('Adresse email invalide')
    .max(100, 'L\'email ne peut pas dépasser 100 caractères'),
  
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(100, 'Le mot de passe ne peut pas dépasser 100 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'
    ),
  
  role: z
    .enum(['STUDENT', 'ADMIN'])
    .default('STUDENT')
    .optional()
})

// Schema pour la connexion
export const signinSchema = z.object({
  email: z
    .string()
    .email('Adresse email invalide'),
  
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
})

// Schema pour la réinitialisation de mot de passe
export const resetPasswordSchema = z.object({
  email: z
    .string()
    .email('Adresse email invalide')
})

// Schema pour le changement de mot de passe
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Le mot de passe actuel est requis'),
  
  newPassword: z
    .string()
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .max(100, 'Le nouveau mot de passe ne peut pas dépasser 100 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'
    )
})

// Types TypeScript dérivés des schémas
export type SignupData = z.infer<typeof signupSchema>
export type SigninData = z.infer<typeof signinSchema>
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>
export type ChangePasswordData = z.infer<typeof changePasswordSchema>

// Fonction utilitaire pour formater les erreurs Zod
export function formatZodError(error: z.ZodError): string[] {
  return error.errors.map(err => {
    const path = err.path.join('.')
    return path ? `${path}: ${err.message}` : err.message
  })
}
