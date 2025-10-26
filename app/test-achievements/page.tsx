'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

export default function TestAchievementsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const createTestAchievements = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/achievements/test', {
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
        error: 'Erreur lors de la création des trophées de test'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Test des Trophées
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Cette page permet de créer des trophées de test pour vérifier le système.
          </p>
          
          <Button 
            onClick={createTestAchievements}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Création...' : 'Créer des trophées de test'}
          </Button>

          {result && (
            <div className={`p-4 rounded-lg ${
              result.success 
                ? 'bg-green-500/10 border border-green-500/20' 
                : 'bg-red-500/10 border border-red-500/20'
            }`}>
              <p className={`text-sm font-medium ${
                result.success ? 'text-green-500' : 'text-red-500'
              }`}>
                {result.success ? '✅ ' + result.message : '❌ ' + result.error}
              </p>
              {result.created && (
                <p className="text-xs text-muted-foreground mt-1">
                  {result.created} trophées créés
                </p>
              )}
            </div>
          )}

          <div className="text-center">
            <a 
              href="/achievements" 
              className="text-sm text-primary hover:underline"
            >
              Voir les trophées →
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
