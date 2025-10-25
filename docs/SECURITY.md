# Guide de Sécurité - Code Bus

## Vue d'ensemble

Ce document décrit les mesures de sécurité implémentées dans l'application Code Bus et fournit des instructions pour maintenir un environnement sécurisé.

## Configuration de Sécurité

### 1. Variables d'Environnement

#### Variables Critiques

```bash
# NextAuth Secret - CRITIQUE
NEXTAUTH_SECRET="votre_secret_ultra_securise_ici"

# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# OAuth Google (optionnel)
GOOGLE_CLIENT_ID="votre_client_id"
GOOGLE_CLIENT_SECRET="votre_client_secret"

# OpenAI (pour éditeur JSON uniquement)
OPENAI_API_KEY="sk-..."
```

#### Génération du Secret NextAuth

```bash
# Générer un secret sécurisé
openssl rand -base64 32

# Ou utiliser Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Configuration de la Base de Données

#### PostgreSQL (Production)

```bash
# URL de connexion sécurisée
DATABASE_URL="postgresql://username:password@hostname:5432/database_name?sslmode=require"
```

#### Bonnes Pratiques

- Utiliser SSL/TLS pour toutes les connexions
- Limiter les privilèges utilisateur
- Changer les mots de passe par défaut
- Activer l'audit des connexions

### 3. Configuration OAuth Google

#### Création des Identifiants

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet ou sélectionner un existant
3. Activer l'API Google+ et Google OAuth2
4. Créer des identifiants OAuth2
5. Configurer les URI de redirection autorisées

#### URI de Redirection

```
http://localhost:3000/api/auth/callback/google
https://votre-domaine.com/api/auth/callback/google
```

## Mesures de Sécurité Implémentées

### 1. Rate Limiting

#### Limites Globales
- **Requêtes générales** : 100 req/10min par IP
- **Authentification** : 5 tentatives/15min par IP
- **IA** : 10 requêtes/heure par IP
- **JSON Editor** : 20 requêtes/minute par IP

#### Configuration

```typescript
// lib/rate-limit.ts
export const globalRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '10 m'),
  analytics: true,
  prefix: 'global',
})
```

### 2. Validation des Données

#### Schémas Zod

```typescript
// lib/validations/auth.ts
export const signupSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
})
```

#### Validation des Chemins

```typescript
// lib/path-validator.ts
export function validateImagePath(path: string): {
  valid: boolean
  error?: string
  normalizedPath?: string
}
```

### 3. Protection CSRF

#### Génération de Tokens

```typescript
// lib/csrf.ts
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex')
}
```

#### Vérification

```typescript
export async function validateCSRF(request: NextRequest): Promise<{
  valid: boolean
  error?: string
}>
```

### 4. Authentification et Autorisation

#### Vérification des Rôles

```typescript
// lib/auth-helpers.ts
export async function requireAdmin(request: NextRequest): Promise<AuthenticatedUser>
export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser>
```

#### Protection des Routes

```typescript
// middleware.ts
export function withAuth(handler: Function)
export function withAdminAuth(handler: Function)
```

### 5. Headers de Sécurité

#### Configuration CSP

```typescript
// middleware/security-headers.ts
const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.openai.com https://*.upstash.io"
  ].join('; ')
}
```

### 6. Gestion des Erreurs

#### Logging Sécurisé

```typescript
// lib/error-handler.ts
export function logError(
  error: Error | unknown,
  context: {
    request?: NextRequest
    userId?: string
    action?: string
    metadata?: Record<string, unknown>
  } = {}
): void
```

#### Réponses d'Erreur

```typescript
export function createSecureErrorResponse(
  error: Error | unknown,
  context: {
    request?: NextRequest
    userId?: string
    action?: string
    type?: ErrorType
    statusCode?: number
  } = {}
): Response
```

## Déploiement Sécurisé

### 1. Vercel

#### Variables d'Environnement

```bash
# Production
NEXTAUTH_SECRET="votre_secret_production"
NEXTAUTH_URL="https://votre-domaine.com"
DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require"
```

#### Configuration

- Activer HTTPS uniquement
- Configurer les domaines autorisés
- Activer les logs de sécurité
- Configurer les alertes de sécurité

### 2. Base de Données

#### PostgreSQL

```sql
-- Créer un utilisateur avec privilèges limités
CREATE USER app_user WITH PASSWORD 'mot_de_passe_securise';
GRANT CONNECT ON DATABASE code_bus TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
```

#### Sécurité

- Activer SSL/TLS
- Configurer les IP autorisées
- Activer l'audit des connexions
- Changer les mots de passe par défaut

## Monitoring et Alertes

### 1. Logs de Sécurité

#### Types d'Événements

- Tentatives de connexion échouées
- Accès non autorisés
- Dépassement de limites de taux
- Erreurs de validation
- Tentatives d'injection

#### Configuration

```typescript
// lib/error-handler.ts
export function logError(
  error: Error | unknown,
  context: {
    request?: NextRequest
    userId?: string
    action?: string
    metadata?: Record<string, unknown>
  } = {}
): void
```

### 2. Alertes

#### Configuration

- Configurer des alertes pour les tentatives de connexion échouées
- Surveiller les dépassements de limites de taux
- Alerter sur les erreurs de validation fréquentes
- Surveiller les accès non autorisés

## Tests de Sécurité

### 1. Tests Automatisés

#### Validation des Données

```typescript
// Tests de validation Zod
describe('Validation des données', () => {
  it('devrait rejeter les emails invalides', () => {
    const result = signupSchema.safeParse({
      name: 'Test',
      email: 'email-invalide',
      password: 'Password123!'
    })
    expect(result.success).toBe(false)
  })
})
```

#### Protection CSRF

```typescript
// Tests CSRF
describe('Protection CSRF', () => {
  it('devrait rejeter les requêtes sans token CSRF', async () => {
    const response = await fetch('/api/json-editor', {
      method: 'POST',
      body: JSON.stringify({ data: 'test' })
    })
    expect(response.status).toBe(403)
  })
})
```

### 2. Tests Manuels

#### Checklist de Sécurité

- [ ] Tester le rate limiting
- [ ] Vérifier la validation des données
- [ ] Tester la protection CSRF
- [ ] Vérifier l'authentification
- [ ] Tester l'autorisation
- [ ] Vérifier les headers de sécurité
- [ ] Tester la gestion des erreurs
- [ ] Vérifier la validation des chemins

## Maintenance

### 1. Mises à Jour

#### Dépendances

```bash
# Vérifier les vulnérabilités
npm audit

# Mettre à jour les dépendances
npm update

# Mettre à jour les dépendances de sécurité
npm audit fix
```

#### Base de Données

```bash
# Sauvegarder la base de données
pg_dump -h hostname -U username -d database_name > backup.sql

# Restaurer la base de données
psql -h hostname -U username -d database_name < backup.sql
```

### 2. Surveillance

#### Métriques

- Nombre de tentatives de connexion échouées
- Dépassements de limites de taux
- Erreurs de validation
- Accès non autorisés
- Temps de réponse des API

#### Alertes

- Configurer des alertes pour les métriques critiques
- Surveiller les logs de sécurité
- Alerter sur les anomalies
- Surveiller les performances

## Contact

Pour toute question de sécurité, contactez l'équipe de développement.

---

**Dernière mise à jour** : $(date)
**Version** : 1.0.0
