import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  BookOpen, 
  FileText, 
  Upload, 
  Bus, 
  TrendingUp, 
  Target, 
  Clock, 
  Award, 
  BarChart3, 
  Users, 
  Star,
  CheckCircle,
  ArrowRight,
  Brain,
  Zap,
  Shield,
  Globe
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-200/20 to-zinc-300/20 dark:from-zinc-800/20 dark:to-zinc-700/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-lg border border-border">
              <Bus className="h-6 w-6 text-primary" />
              <span className="font-semibold text-foreground">Code Bus Pro</span>
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                <Star className="h-3 w-3 mr-1" />
                Nouveau
              </Badge>
            </div>
            
            <h1 className="text-6xl font-bold text-foreground mb-6">
              Maîtrisez le <span className="text-primary">code de la route</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Plateforme d&apos;entraînement intelligente avec analyses avancées, 
              examens chronométrés et suivi personnalisé de vos progrès.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/dashboard">
                <Button size="lg" className="px-8 py-4 text-lg">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Voir mon tableau de bord
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/train">
                <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Commencer l&apos;entraînement
                </Button>
              </Link>
            </div>

            {/* Stats principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">95%</div>
                <div className="text-muted-foreground">Taux de réussite moyen</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">2,500+</div>
                <div className="text-muted-foreground">Questions disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">15min</div>
                <div className="text-muted-foreground">Temps d&apos;étude quotidien</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fonctionnalités principales */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Fonctionnalités <span className="text-primary">avancées</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Une plateforme complète pour maîtriser le code de la route avec des outils d&apos;analyse professionnels
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="bg-card/80 backdrop-blur-sm border border-border shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-xl">Analyses avancées</CardTitle>
              <CardDescription>
                Tableau de bord complet avec statistiques détaillées, progression par catégorie et insights personnalisés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Suivi des progrès en temps réel
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Analyses par catégorie
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Recommandations personnalisées
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border border-border shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-secondary-foreground" />
              </div>
              <CardTitle className="text-xl">IA d&apos;apprentissage</CardTitle>
              <CardDescription>
                Algorithmes intelligents qui s&apos;adaptent à votre niveau et identifient vos points faibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Questions adaptatives
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Détection des lacunes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Plan d&apos;étude personnalisé
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border border-border shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="h-16 w-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-accent-foreground" />
              </div>
              <CardTitle className="text-xl">Examens chronométrés</CardTitle>
              <CardDescription>
                Simulez les conditions réelles d&apos;examen avec timer, score final et revue détaillée
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Conditions d&apos;examen réelles
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Timer et pression temporelle
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Rapport détaillé des erreurs
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border border-border shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl">Entraînement rapide</CardTitle>
              <CardDescription>
                Sessions courtes et efficaces avec feedback immédiat et navigation optimisée
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Sessions de 15 minutes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Raccourcis clavier
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Feedback instantané
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border border-border shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-xl">Sécurité routière</CardTitle>
              <CardDescription>
                Contenu validé par des experts et mis à jour selon les dernières réglementations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Contenu officiel
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Mises à jour régulières
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Validation experte
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border border-border shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-secondary-foreground" />
              </div>
              <CardTitle className="text-xl">Accessible partout</CardTitle>
              <CardDescription>
                Interface responsive optimisée pour tous les appareils et connexions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Mobile, tablette, desktop
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Mode hors ligne
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Synchronisation cloud
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Prêt à commencer ?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="px-8 py-4 text-lg">
                <BarChart3 className="h-5 w-5 mr-2" />
                Voir mon tableau de bord
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/train">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                <BookOpen className="h-5 w-5 mr-2" />
                Commencer l&apos;entraînement
              </Button>
            </Link>
            <Link href="/exam">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                <FileText className="h-5 w-5 mr-2" />
                Passer un examen
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
