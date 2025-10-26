'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'

interface ImportResult {
  success: boolean
  message: string
  imported?: number
  total?: number
  imagesFound?: number
  errors?: string[]
  error?: string
}

export default function ImportPage() {
  const router = useRouter()
  const [isImporting, setIsImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleImport = async () => {
    setIsImporting(true)
    setResult(null)

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: 'Erreur lors de l\'importation des données',
        errors: [error instanceof Error ? error.message : 'Erreur inconnue']
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section avec image de fond */}
      <div className="relative h-[25vh] min-h-[200px] flex items-center justify-center overflow-hidden">
        {/* Image de fond */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/bus1.jpg)',
          }}
        />
        
        {/* Overlay sombre */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Contenu centré */}
        <div className="relative z-10 text-center text-white px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Import des données
            </h1>
          </div>
          <p className="text-lg opacity-90">
            Importez vos questions et images dans l'application
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header avec bouton retour */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={() => router.push('/')} className="interactive-hover">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Instructions */}
          <Card className="card-elegant">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/20">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                Guide d'importation
              </CardTitle>
              <CardDescription className="text-base">
                Comment importer vos propres questions et images
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Préparer les données</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Remplacez le fichier <code className="bg-muted px-2 py-1 rounded">config/data/questions.json</code> 
                  par votre propre fichier de questions.
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  Ajoutez vos images dans le dossier <code className="bg-muted px-2 py-1 rounded">public/images/</code>.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Nouveau :</strong> Les images sont maintenant synchronisées automatiquement vers Vercel Blob lors du déploiement.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">🆕 Nouvelles fonctionnalités</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="text-xs">IA</Badge>
                    <p className="text-sm text-muted-foreground">
                      Assistant IA intégré pour analyser et corriger automatiquement les questions
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="text-xs">Éditeur</Badge>
                    <p className="text-sm text-muted-foreground">
                      Éditeur JSON avancé avec zoom, validation et correction des images
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="text-xs">Blob</Badge>
                    <p className="text-sm text-muted-foreground">
                      Stockage optimisé des images sur Vercel Blob pour de meilleures performances
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Format des questions</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Chaque question doit contenir :
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• <code>id</code> : Identifiant unique (UUID généré automatiquement)</li>
                  <li>• <code>numero_question</code> : Numéro de la question</li>
                  <li>• <code>questionnaire</code> : Numéro du questionnaire</li>
                  <li>• <code>question</code> : Code de la question (ex: &quot;0004&quot;)</li>
                  <li>• <code>categorie</code> : Catégorie (ex: &quot;Signalisation&quot;)</li>
                  <li>• <code>astag D/F/I</code> : Code de référence (ex: &quot;2/24&quot;)</li>
                  <li>• <code>enonce</code> : Énoncé de la question</li>
                  <li>• <code>options</code> : Options A, B, C, D</li>
                  <li>• <code>bonne_reponse</code> : Lettre de la bonne réponse</li>
                  <li>• <code>image_path</code> : Chemin vers l&apos;image</li>
                  <li>• <code>validation_status</code> : Statut de validation (optionnel)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Images</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Placez vos images dans <code className="bg-muted px-2 py-1 rounded">public/images/</code> 
                  et référencez-les dans le champ <code className="bg-muted px-2 py-1 rounded">image_path</code>.
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Structure recommandée :</strong>
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 mb-2">
                  <li>• <code>questionnaire_X/Question (Y).jpg</code> : Images principales</li>
                  <li>• <code>questionnaire_X/app_zone/Question (Y).jpg</code> : Images haute résolution (éditeur JSON)</li>
                  <li>• <code>reponse/reponses X.jpg</code> : Images de correction</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  <strong>Automatique :</strong> Les images sont synchronisées vers Vercel Blob lors du déploiement.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">4. Workflow de développement</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs">1</Badge>
                    <p className="text-sm text-muted-foreground">
                      Modifiez vos questions dans <code className="bg-muted px-1 rounded">config/data/questions.json</code>
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs">2</Badge>
                    <p className="text-sm text-muted-foreground">
                      Ajoutez vos images dans <code className="bg-muted px-1 rounded">public/images/</code>
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs">3</Badge>
                    <p className="text-sm text-muted-foreground">
                      Utilisez l'éditeur JSON pour valider et corriger vos données
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs">4</Badge>
                    <p className="text-sm text-muted-foreground">
                      Importez dans la base de données via cette page
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs">5</Badge>
                    <p className="text-sm text-muted-foreground">
                      Déployez : les images sont automatiquement synchronisées vers Vercel Blob
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Import */}
          <Card className="card-elegant">
            <CardHeader className="bg-gradient-to-r from-green-500/5 to-green-500/10 border-b border-green-500/20">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Upload className="h-5 w-5 text-green-500" />
                </div>
                Import des données
              </CardTitle>
              <CardDescription className="text-base">
                Importez les questions depuis le fichier JSON
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Statut d'import */}
              <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-semibold text-primary text-lg">Prêt pour l'import</span>
                </div>
                <p className="text-sm text-primary/80">
                  Le fichier <code className="bg-primary/20 px-2 py-1 rounded text-primary font-mono">config/data/questions.json</code> 
                  est prêt à être importé dans la base de données.
                </p>
              </div>

              {/* Bouton d'import amélioré */}
              <Button 
                onClick={handleImport} 
                disabled={isImporting}
                className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                {isImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-3"></div>
                    Import en cours...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-3" />
                    Importer les données
                  </>
                )}
              </Button>

              {result && (
                <div className={`p-6 rounded-xl border-2 ${
                  result.success 
                    ? 'bg-gradient-to-r from-green-500/10 to-green-500/5 border-green-500/30' 
                    : 'bg-gradient-to-r from-destructive/10 to-destructive/5 border-destructive/30'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      result.success ? 'bg-green-500/20' : 'bg-destructive/20'
                    }`}>
                      {result.success ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-destructive" />
                      )}
                    </div>
                    <span className={`font-bold text-lg ${
                      result.success ? 'text-green-500' : 'text-destructive'
                    }`}>
                      {result.success ? 'Import réussi !' : 'Erreur d\'import'}
                    </span>
                  </div>

                  {result.success ? (
                    <div className="space-y-6">
                      {/* Statistiques d'import améliorées */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-card p-4 rounded-xl border border-primary/20 shadow-sm">
                          <div className="text-3xl font-bold text-primary mb-1">{result.imported}</div>
                          <div className="text-sm text-muted-foreground font-medium">Questions importées</div>
                        </div>
                        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                          <div className="text-3xl font-bold text-foreground mb-1">{result.total}</div>
                          <div className="text-sm text-muted-foreground font-medium">Questions dans le JSON</div>
                        </div>
                        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                          <div className="text-3xl font-bold text-foreground mb-1">{result.imagesFound}</div>
                          <div className="text-sm text-muted-foreground font-medium">Images trouvées</div>
                        </div>
                      </div>

                      {/* Message de succès amélioré */}
                      <div className="bg-gradient-to-r from-green-500/10 to-green-500/5 p-4 rounded-xl border border-green-500/20">
                        <p className="text-base text-green-500 font-semibold mb-2">
                          ✅ {result.message}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Les données ont été importées depuis <code className="bg-muted px-2 py-1 rounded font-mono">config/data/questions.json</code>
                        </p>
                      </div>

                      {/* Bouton pour tester amélioré */}
                      <Button 
                        onClick={() => router.push('/train')}
                        className="w-full h-12 text-base font-semibold bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        variant="outline"
                      >
                        <FileText className="h-5 w-5 mr-2" />
                        Tester les questions importées
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-destructive">
                        {result.message}
                      </p>
                      {result.error && (
                        <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                          {result.error}
                        </p>
                      )}
                      {result.errors && result.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-destructive mb-1">Erreurs détaillées :</p>
                          <ul className="text-xs text-destructive space-y-1 bg-destructive/10 p-2 rounded">
                            {result.errors.map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}