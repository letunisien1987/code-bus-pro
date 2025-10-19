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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-2xl font-bold">Importer des données</h1>
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
                <p className="text-sm text-gray-600 mb-2">
                  Remplacez le fichier <code className="bg-gray-100 px-2 py-1 rounded">data/questions.json</code> 
                  par votre propre fichier de questions.
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Ajoutez vos images dans le dossier <code className="bg-gray-100 px-2 py-1 rounded">public/images/</code>.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Format des questions</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Chaque question doit contenir :
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• <code>id</code> : Identifiant unique</li>
                  <li>• <code>questionnaire</code> : Numéro du questionnaire</li>
                  <li>• <code>question</code> : Numéro de la question</li>
                  <li>• <code>categorie</code> : Catégorie (ex: "Signalisation")</li>
                  <li>• <code>enonce</code> : Énoncé de la question</li>
                  <li>• <code>options</code> : Options A, B, C, D</li>
                  <li>• <code>bonne_reponse</code> : Lettre de la bonne réponse</li>
                  <li>• <code>image_path</code> : Chemin vers l&apos;image</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Images</h3>
                <p className="text-sm text-gray-600">
                  Placez vos images dans <code className="bg-gray-100 px-2 py-1 rounded">public/images/</code> 
                  et référencez-les dans le champ <code className="bg-gray-100 px-2 py-1 rounded">image_path</code>.
                </p>
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
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Prêt pour l&apos;import</span>
                </div>
                <p className="text-sm text-blue-700">
                  Le fichier <code className="bg-blue-100 px-2 py-1 rounded">data/questions.json</code> 
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
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`font-medium ${
                      result.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {result.success ? 'Import réussi !' : 'Erreur d\'import'}
                    </span>
                  </div>

                  {result.success ? (
                    <div className="space-y-3">
                      {/* Statistiques d'import */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded border border-green-200">
                          <div className="text-2xl font-bold text-green-600">{result.imported}</div>
                          <div className="text-xs text-gray-600">Questions importées</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-green-200">
                          <div className="text-2xl font-bold text-blue-600">{result.total}</div>
                          <div className="text-xs text-gray-600">Questions dans le JSON</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-green-200">
                          <div className="text-2xl font-bold text-purple-600">{result.imagesFound}</div>
                          <div className="text-xs text-gray-600">Images trouvées</div>
                        </div>
                      </div>

                      {/* Message de succès */}
                      <div className="bg-white p-3 rounded border border-green-200">
                        <p className="text-sm text-green-700 font-medium">
                          ✅ {result.message}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Les données ont été importées depuis <code className="bg-gray-100 px-1 rounded">data/questions.json</code>
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
                      <p className="text-sm text-red-700">
                        {result.message}
                      </p>
                      {result.error && (
                        <p className="text-xs text-red-600 bg-red-100 p-2 rounded">
                          {result.error}
                        </p>
                      )}
                      {result.errors && result.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-red-700 mb-1">Erreurs détaillées :</p>
                          <ul className="text-xs text-red-700 space-y-1 bg-red-100 p-2 rounded">
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