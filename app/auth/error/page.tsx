'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'Erreur de configuration du serveur'
      case 'AccessDenied':
        return 'Accès refusé'
      case 'Verification':
        return 'Le token a expiré ou a déjà été utilisé'
      default:
        return 'Une erreur inattendue s\'est produite'
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md card-elegant">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Erreur d'authentification</CardTitle>
          </div>
          <CardDescription>
            {getErrorMessage(error)}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Veuillez réessayer ou contacter l'administrateur si le problème persiste.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/auth/signin">
              <Button className="w-full">
                Réessayer la connexion
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
