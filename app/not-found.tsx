import Link from 'next/link'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-destructive">404</CardTitle>
          <p className="text-muted-foreground">Page non trouvée</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            La page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
          <div className="flex gap-3">
            <Button asChild className="flex-1">
              <Link href="/">
                Retour à l&apos;accueil
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1 interactive-hover">
              <Link href="/dashboard">
                Tableau de bord
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
