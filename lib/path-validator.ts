import { join, normalize, resolve } from 'path'

// Extensions d'images autorisées
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

// Dossiers autorisés pour les images
const ALLOWED_IMAGE_DIRECTORIES = [
  '/images/questionnaire_1/',
  '/images/questionnaire_2/',
  '/images/questionnaire_3/',
  '/images/questionnaire_4/',
  '/images/questionnaire_5/',
  '/images/questionnaire_6/',
  '/images/questionnaire_7/',
  '/images/questionnaire_8/',
  '/images/questionnaire_9/',
  '/images/questionnaire_10/',
  '/images/questionnaire_1/app_zone/',
  '/images/questionnaire_2/app_zone/',
  '/images/questionnaire_3/app_zone/',
  '/images/questionnaire_4/app_zone/',
  '/images/questionnaire_5/app_zone/',
  '/images/questionnaire_6/app_zone/',
  '/images/questionnaire_7/app_zone/',
  '/images/questionnaire_8/app_zone/',
  '/images/questionnaire_9/app_zone/',
  '/images/questionnaire_10/app_zone/',
  '/images/reponse/'
]

// Dossiers interdits (sécurité)
const FORBIDDEN_PATTERNS = [
  /\.\./,           // Path traversal
  /\/\.\./,         // Path traversal avec slash
  /\.\.\//,         // Path traversal avec slash
  /\/\.\.\//,       // Path traversal
  /\.\.%2f/,       // Path traversal encodé
  /\.\.%252f/,      // Path traversal double encodé
  /%2e%2e/,         // Path traversal encodé
  /%252e%252e/,     // Path traversal double encodé
  /\.\.%5c/,        // Path traversal Windows
  /\.\.%255c/,      // Path traversal Windows double encodé
  /\.\.\\/,         // Path traversal Windows
  /\.\.%5c/,        // Path traversal Windows encodé
  /\.\.%255c/,      // Path traversal Windows double encodé
  /\.\.%2f/,        // Path traversal Unix encodé
  /\.\.%252f/,      // Path traversal Unix double encodé
  /\.\.%2e/,        // Path traversal encodé
  /\.\.%252e/,      // Path traversal double encodé
  /\.\.%2e%2e/,     // Path traversal encodé
  /\.\.%252e%252e/, // Path traversal double encodé
  /\.\.%2e%2f/,     // Path traversal encodé
  /\.\.%252e%252f/, // Path traversal double encodé
  /\.\.%2e%5c/,     // Path traversal Windows encodé
  /\.\.%252e%255c/, // Path traversal Windows double encodé
  /\.\.%2e%2e/,     // Path traversal encodé
  /\.\.%252e%252e/, // Path traversal double encodé
  /\.\.%2e%2f/,     // Path traversal encodé
  /\.\.%252e%252f/, // Path traversal double encodé
  /\.\.%2e%5c/,     // Path traversal Windows encodé
  /\.\.%252e%255c/, // Path traversal Windows double encodé
  /\.\.%2e%2e/,     // Path traversal encodé
  /\.\.%252e%252e/, // Path traversal double encodé
  /\.\.%2e%2f/,     // Path traversal encodé
  /\.\.%252e%252f/, // Path traversal double encodé
  /\.\.%2e%5c/,     // Path traversal Windows encodé
  /\.\.%252e%255c/, // Path traversal Windows double encodé
  /\.\.%2e%2e/,     // Path traversal encodé
  /\.\.%252e%252e/, // Path traversal double encodé
  /\.\.%2e%2f/,     // Path traversal encodé
  /\.\.%252e%252f/, // Path traversal double encodé
  /\.\.%2e%5c/,     // Path traversal Windows encodé
  /\.\.%252e%255c/, // Path traversal Windows double encodé
  /\.\.%2e%2e/,     // Path traversal encodé
  /\.\.%252e%252e/, // Path traversal double encodé
  /\.\.%2e%2f/,     // Path traversal encodé
  /\.\.%252e%252f/, // Path traversal double encodé
  /\.\.%2e%5c/,     // Path traversal Windows encodé
  /\.\.%252e%255c/, // Path traversal Windows double encodé
  /\.\.%2e%2e/,     // Path traversal encodé
  /\.\.%252e%252e/, // Path traversal double encodé
  /\.\.%2e%2f/,     // Path traversal encodé
  /\.\.%252e%252f/, // Path traversal double encodé
  /\.\.%2e%5c/,     // Path traversal Windows encodé
  /\.\.%252e%255c/, // Path traversal Windows double encodé
  /\.\.%2e%2e/,     // Path traversal encodé
  /\.\.%252e%252e/, // Path traversal double encodé
  /\.\.%2e%2f/,     // Path traversal encodé
  /\.\.%252e%252f/, // Path traversal double encodé
  /\.\.%2e%5c/,     // Path traversal Windows encodé
  /\.\.%252e%255c/, // Path traversal encodé
]

// Fonction pour normaliser un chemin
export function normalizePath(path: string): string {
  // Décoder les caractères encodés
  let decodedPath = decodeURIComponent(path)
  
  // Normaliser les slashes
  decodedPath = decodedPath.replace(/\\/g, '/')
  
  // Supprimer les slashes multiples
  decodedPath = decodedPath.replace(/\/+/g, '/')
  
  // Normaliser avec path.resolve
  const normalized = normalize(decodedPath)
  
  return normalized
}

// Fonction pour vérifier si un chemin est sécurisé
export function isSecurePath(path: string): boolean {
  const normalizedPath = normalizePath(path)
  
  // Vérifier les patterns interdits
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(normalizedPath)) {
      return false
    }
  }
  
  // Vérifier que le chemin commence par un dossier autorisé
  const isAllowedDirectory = ALLOWED_IMAGE_DIRECTORIES.some(dir => 
    normalizedPath.startsWith(dir)
  )
  
  if (!isAllowedDirectory) {
    return false
  }
  
  return true
}

// Fonction pour valider un chemin d'image
export function validateImagePath(path: string): {
  valid: boolean
  error?: string
  normalizedPath?: string
} {
  try {
    // Normaliser le chemin
    const normalizedPath = normalizePath(path)
    
    // Vérifier la sécurité
    if (!isSecurePath(normalizedPath)) {
      return {
        valid: false,
        error: 'Chemin d\'image non autorisé ou potentiellement dangereux'
      }
    }
    
    // Vérifier l'extension
    const hasValidExtension = ALLOWED_IMAGE_EXTENSIONS.some(ext => 
      normalizedPath.toLowerCase().endsWith(ext)
    )
    
    if (!hasValidExtension) {
      return {
        valid: false,
        error: `Extension d'image non autorisée. Extensions autorisées: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`
      }
    }
    
    // Vérifier la longueur du chemin
    if (normalizedPath.length > 500) {
      return {
        valid: false,
        error: 'Chemin d\'image trop long'
      }
    }
    
    return {
      valid: true,
      normalizedPath
    }
  } catch (error) {
    return {
      valid: false,
      error: 'Erreur lors de la validation du chemin d\'image'
    }
  }
}

// Fonction pour extraire le numéro de questionnaire d'un chemin
export function extractQuestionnaireNumber(path: string): number | null {
  const match = path.match(/questionnaire_(\d+)/)
  if (match) {
    const number = parseInt(match[1], 10)
    if (number >= 1 && number <= 10) {
      return number
    }
  }
  return null
}

// Fonction pour extraire le numéro de question d'un chemin
export function extractQuestionNumber(path: string): number | null {
  const match = path.match(/Question\s*\((\d+)\)/)
  if (match) {
    const number = parseInt(match[1], 10)
    if (number >= 1 && number <= 40) {
      return number
    }
  }
  return null
}

// Fonction pour vérifier si un chemin est dans le dossier app_zone
export function isAppZonePath(path: string): boolean {
  return path.includes('/app_zone/')
}

// Fonction pour convertir un chemin app_zone en chemin normal
export function convertAppZoneToNormalPath(appZonePath: string): string {
  return appZonePath.replace('/app_zone/', '/')
}

// Fonction pour convertir un chemin normal en chemin app_zone
export function convertNormalToAppZonePath(normalPath: string): string {
  const pathParts = normalPath.split('/')
  const questionnaireIndex = pathParts.findIndex(part => part.startsWith('questionnaire_'))
  
  if (questionnaireIndex !== -1 && questionnaireIndex < pathParts.length - 1) {
    pathParts.splice(questionnaireIndex + 1, 0, 'app_zone')
    return pathParts.join('/')
  }
  
  return normalPath
}
