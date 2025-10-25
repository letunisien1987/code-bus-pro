#!/usr/bin/env node

/**
 * Script de test de sécurité pour l'application Code Bus
 * Ce script teste les mesures de sécurité implémentées
 */

const https = require('https')
const http = require('http')
const { URL } = require('url')

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@test.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!'

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

// Fonction pour faire des requêtes HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const isHttps = urlObj.protocol === 'https:'
    const client = isHttps ? https : http
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Security-Test-Script/1.0',
        ...options.headers
      }
    }
    
    const req = client.request(requestOptions, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        })
      })
    })
    
    req.on('error', reject)
    
    if (options.body) {
      req.write(JSON.stringify(options.body))
    }
    
    req.end()
  })
}

// Fonction pour logger avec couleur
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

// Fonction pour tester le rate limiting
async function testRateLimiting() {
  log('\n🔒 Test du Rate Limiting', colors.blue)
  
  try {
    // Tester le rate limiting global
    log('  - Test du rate limiting global...')
    const promises = []
    for (let i = 0; i < 105; i++) { // Dépasser la limite de 100
      promises.push(makeRequest(`${BASE_URL}/api/stats`))
    }
    
    const responses = await Promise.all(promises)
    const rateLimitedResponses = responses.filter(r => r.status === 429)
    
    if (rateLimitedResponses.length > 0) {
      log('  ✅ Rate limiting global fonctionne', colors.green)
    } else {
      log('  ❌ Rate limiting global ne fonctionne pas', colors.red)
    }
    
    // Tester le rate limiting d'authentification
    log('  - Test du rate limiting d\'authentification...')
    const authPromises = []
    for (let i = 0; i < 6; i++) { // Dépasser la limite de 5
      authPromises.push(makeRequest(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        body: {
          name: 'Test User',
          email: `test${i}@example.com`,
          password: 'Test123!'
        }
      }))
    }
    
    const authResponses = await Promise.all(authPromises)
    const authRateLimitedResponses = authResponses.filter(r => r.status === 429)
    
    if (authRateLimitedResponses.length > 0) {
      log('  ✅ Rate limiting d\'authentification fonctionne', colors.green)
    } else {
      log('  ❌ Rate limiting d\'authentification ne fonctionne pas', colors.red)
    }
    
  } catch (error) {
    log(`  ❌ Erreur lors du test de rate limiting: ${error.message}`, colors.red)
  }
}

// Fonction pour tester la validation des données
async function testDataValidation() {
  log('\n🔍 Test de la Validation des Données', colors.blue)
  
  try {
    // Tester la validation d'inscription avec données invalides
    log('  - Test de validation d\'inscription...')
    const invalidSignupResponse = await makeRequest(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      body: {
        name: 'A', // Trop court
        email: 'email-invalide', // Email invalide
        password: '123' // Mot de passe trop simple
      }
    })
    
    if (invalidSignupResponse.status === 400) {
      log('  ✅ Validation d\'inscription fonctionne', colors.green)
    } else {
      log('  ❌ Validation d\'inscription ne fonctionne pas', colors.red)
    }
    
    // Tester la validation du JSON Editor
    log('  - Test de validation du JSON Editor...')
    const invalidQuestionResponse = await makeRequest(`${BASE_URL}/api/json-editor`, {
      method: 'PUT',
      body: {
        id: 'invalid-id', // ID invalide
        enonce: '', // Énoncé vide
        image_path: '/invalid/path.jpg', // Chemin invalide
        options: { a: '', b: '', c: '' }, // Options vides
        bonne_reponse: 'd', // Réponse invalide
        categorie: '',
        'astag D/F/I ': '',
        numero_question: 0,
        questionnaire: 0
      }
    })
    
    if (invalidQuestionResponse.status === 400) {
      log('  ✅ Validation du JSON Editor fonctionne', colors.green)
    } else {
      log('  ❌ Validation du JSON Editor ne fonctionne pas', colors.red)
    }
    
  } catch (error) {
    log(`  ❌ Erreur lors du test de validation: ${error.message}`, colors.red)
  }
}

// Fonction pour tester la protection CSRF
async function testCSRFProtection() {
  log('\n🛡️ Test de la Protection CSRF', colors.blue)
  
  try {
    // Tester l'accès sans token CSRF
    log('  - Test d\'accès sans token CSRF...')
    const csrfResponse = await makeRequest(`${BASE_URL}/api/json-editor`, {
      method: 'PUT',
      body: {
        id: 'test-id',
        enonce: 'Test',
        image_path: '/images/questionnaire_1/Question (1).jpg',
        options: { a: 'A', b: 'B', c: 'C' },
        bonne_reponse: 'a',
        categorie: 'Test',
        'astag D/F/I ': 'D',
        numero_question: 1,
        questionnaire: 1
      }
    })
    
    if (csrfResponse.status === 403) {
      log('  ✅ Protection CSRF fonctionne', colors.green)
    } else {
      log('  ❌ Protection CSRF ne fonctionne pas', colors.red)
    }
    
  } catch (error) {
    log(`  ❌ Erreur lors du test CSRF: ${error.message}`, colors.red)
  }
}

// Fonction pour tester l'authentification et l'autorisation
async function testAuthentication() {
  log('\n🔐 Test de l\'Authentification et de l\'Autorisation', colors.blue)
  
  try {
    // Tester l'accès non authentifié
    log('  - Test d\'accès non authentifié...')
    const unauthResponse = await makeRequest(`${BASE_URL}/api/json-editor`)
    
    if (unauthResponse.status === 401) {
      log('  ✅ Protection d\'authentification fonctionne', colors.green)
    } else {
      log('  ❌ Protection d\'authentification ne fonctionne pas', colors.red)
    }
    
    // Tester l'accès avec rôle incorrect
    log('  - Test d\'accès avec rôle incorrect...')
    const studentResponse = await makeRequest(`${BASE_URL}/api/json-editor`, {
      headers: {
        'Authorization': 'Bearer student-token'
      }
    })
    
    if (studentResponse.status === 403) {
      log('  ✅ Protection d\'autorisation fonctionne', colors.green)
    } else {
      log('  ❌ Protection d\'autorisation ne fonctionne pas', colors.red)
    }
    
  } catch (error) {
    log(`  ❌ Erreur lors du test d'authentification: ${error.message}`, colors.red)
  }
}

// Fonction pour tester les headers de sécurité
async function testSecurityHeaders() {
  log('\n🔒 Test des Headers de Sécurité', colors.blue)
  
  try {
    const response = await makeRequest(`${BASE_URL}/`)
    
    const requiredHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'referrer-policy',
      'x-xss-protection',
      'permissions-policy'
    ]
    
    let allHeadersPresent = true
    for (const header of requiredHeaders) {
      if (response.headers[header]) {
        log(`  ✅ Header ${header} présent`, colors.green)
      } else {
        log(`  ❌ Header ${header} manquant`, colors.red)
        allHeadersPresent = false
      }
    }
    
    if (allHeadersPresent) {
      log('  ✅ Tous les headers de sécurité sont présents', colors.green)
    } else {
      log('  ❌ Certains headers de sécurité sont manquants', colors.red)
    }
    
  } catch (error) {
    log(`  ❌ Erreur lors du test des headers: ${error.message}`, colors.red)
  }
}

// Fonction pour tester la validation des chemins
async function testPathValidation() {
  log('\n🛡️ Test de la Validation des Chemins', colors.blue)
  
  try {
    // Tester l'accès à des chemins malveillants
    log('  - Test de protection contre path traversal...')
    const maliciousPaths = [
      '/api/ai-analyze?imagePath=../../../etc/passwd',
      '/api/ai-analyze?imagePath=..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
      '/api/ai-analyze?imagePath=....//....//....//etc//passwd'
    ]
    
    for (const path of maliciousPaths) {
      const response = await makeRequest(`${BASE_URL}${path}`)
      if (response.status === 400) {
        log(`  ✅ Protection contre ${path} fonctionne`, colors.green)
      } else {
        log(`  ❌ Protection contre ${path} ne fonctionne pas`, colors.red)
      }
    }
    
  } catch (error) {
    log(`  ❌ Erreur lors du test de validation des chemins: ${error.message}`, colors.red)
  }
}

// Fonction principale
async function runSecurityTests() {
  log('🔒 Démarrage des Tests de Sécurité - Code Bus', colors.cyan)
  log('=' * 50, colors.cyan)
  
  const startTime = Date.now()
  
  try {
    await testRateLimiting()
    await testDataValidation()
    await testCSRFProtection()
    await testAuthentication()
    await testSecurityHeaders()
    await testPathValidation()
    
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000
    
    log('\n🎉 Tests de Sécurité Terminés', colors.green)
    log(`⏱️ Durée: ${duration}s`, colors.yellow)
    log('\n📋 Résumé:', colors.blue)
    log('  - Rate Limiting: Testé', colors.green)
    log('  - Validation des Données: Testé', colors.green)
    log('  - Protection CSRF: Testé', colors.green)
    log('  - Authentification: Testé', colors.green)
    log('  - Headers de Sécurité: Testé', colors.green)
    log('  - Validation des Chemins: Testé', colors.green)
    
  } catch (error) {
    log(`\n❌ Erreur lors des tests: ${error.message}`, colors.red)
    process.exit(1)
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runSecurityTests().catch(console.error)
}

module.exports = {
  runSecurityTests,
  testRateLimiting,
  testDataValidation,
  testCSRFProtection,
  testAuthentication,
  testSecurityHeaders,
  testPathValidation
}
