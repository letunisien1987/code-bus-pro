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
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Importer des données</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Instructions
              </CardTitle>
              <CardDescription>
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
                      Utilisez l&apos;éditeur JSON pour valider et corriger vos données
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import des données
              </CardTitle>
              <CardDescription>
                Importez les questions depuis le fichier JSON
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="font-medium text-primary">Prêt pour l&apos;import</span>
                </div>
                <p className="text-sm text-primary">
                  Le fichier <code className="bg-primary/20 px-2 py-1 rounded">config/data/questions.json</code> 
                  est prêt à être importé dans la base de données.
                </p>
              </div>

              <Button 
                onClick={handleImport} 
                disabled={isImporting}
                className="w-full"
                size="lg"
              >
                {isImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Import en cours...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Importer les données
                  </>
                )}
              </Button>

              {result && (
                <div className={`p-4 rounded-lg ${
                  result.success 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'bg-destructive/10 border border-destructive/20'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                    <span className={`font-medium ${
                      result.success ? 'text-primary' : 'text-destructive'
                    }`}>
                      {result.success ? 'Import réussi !' : 'Erreur d\'import'}
                    </span>
                  </div>

                  {result.success ? (
                    <div className="space-y-3">
                      {/* Statistiques d'import */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-card p-3 rounded border border-border">
                          <div className="text-2xl font-bold text-primary">{result.imported}</div>
                          <div className="text-xs text-muted-foreground">Questions importées</div>
                        </div>
                        <div className="bg-card p-3 rounded border border-border">
                          <div className="text-2xl font-bold text-secondary-foreground">{result.total}</div>
                          <div className="text-xs text-muted-foreground">Questions dans le JSON</div>
                        </div>
                        <div className="bg-card p-3 rounded border border-border">
                          <div className="text-2xl font-bold text-accent-foreground">{result.imagesFound}</div>
                          <div className="text-xs text-muted-foreground">Images trouvées</div>
                        </div>
                      </div>

                      {/* Message de succès */}
                      <div className="bg-card p-3 rounded border border-border">
                        <p className="text-sm text-primary font-medium">
                          ✅ {result.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Les données ont été importées depuis <code className="bg-muted px-1 rounded">config/data/questions.json</code>
                        </p>
                      </div>

                      {/* Bouton pour tester */}
                      <Button 
                        onClick={() => router.push('/train')}
                        className="w-full"
                        variant="outline"
                      >
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