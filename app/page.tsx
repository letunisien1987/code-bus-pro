'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { FixedBottomNavigation } from '@/components/fixed-bottom-navigation'
import { 
  BookOpen, 
  FileText, 
  BarChart3, 
  Bus, 
  TrendingUp, 
  Target, 
  Clock, 
  Award,
  ArrowRight,
  Brain,
  Zap,
  Shield,
  Star,
  Trophy
} from 'lucide-react'

interface Stats {
  global: {
    totalQuestions: number
    correctAnswers: number
    incorrectAnswers: number
    streak: number
    studyTime: number
    averageScore: number
  }
  recent: {
    lastScore: number
    lastDate: string
    improvement: number
  }
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Hero Section - 30vh avec image de fond */}
      <div className="relative h-[30vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        {/* Image de fond */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/bus1.jpg)',
          }}
        />
        
        {/* Overlay sombre pour la lisibilité */}
        <div className="absolute inset-0 bg-black/50 dark:bg-black/70"></div>
        
        {/* Contenu Hero */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-full px-6 py-2 mb-6 shadow-lg border border-border/50">
            <Bus className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Formation Professionnelle</span>
            
            <Badge variant="secondary" className="bg-primary/20 text-primary border border-primary/30 px-4 py-2 text-sm font-medium">
          
              <Star className="h-3 w-3 mr-1" />
              Nouveau </Badge>

          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
            Maîtrisez le <span className="text-primary">code de la route</span>
          </h1>
          
          {/* Catégories D */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Badge variant="secondary" className="bg-primary/20 text-primary border border-primary/30 px-4 py-2 text-sm font-medium">
              Permis D
            </Badge>
            <Badge variant="secondary" className="bg-primary/20 text-primary border border-primary/30 px-4 py-2 text-sm font-medium">
              Transport de voyageurs
            </Badge>
            <Badge variant="secondary" className="bg-primary/20 text-primary border border-primary/30 px-4 py-2 text-sm font-medium">
              Formation professionnelle
            </Badge>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Boutons principaux */}
        <div className="max-w-5xl mx-auto mb-12">
          {/* 2 boutons principaux côte à côte */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Entraînement */}
            <Link href="/train">
              <Card className="h-full card-elegant border-2 border-primary/50 hover:border-primary group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">Entraînement</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Pratiquez avec feedback immédiat et sélection intelligente
                  </p>
                  <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Commencer
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Examen */}
            <Link href="/exam">
              <Card className="h-full card-elegant border-2 border-primary/50 hover:border-primary group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">Passer l&apos;Examen</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Conditions réelles avec timer et notation automatique
                  </p>
                  <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Commencer
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Bouton Statistiques en dessous */}
          <Link href="/dashboard">
            <Card className="card-elegant hover:bg-muted/50 cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Tableau de bord</h3>
                    <p className="text-sm text-muted-foreground">Consultez vos statistiques détaillées</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Statistiques rapides */}
        {!loading && stats && (
          <div className="max-w-5xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Vos Statistiques</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Progression globale */}
              <Card className="card-elegant">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Progression</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-muted-foreground">Score moyen</span>
                      <span className="text-3xl font-bold text-primary">{stats.global?.averageScore || 0}%</span>
                    </div>
                    <Progress value={stats.global?.averageScore || 0} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {stats.global?.correctAnswers || 0} / {stats.global?.totalQuestions || 0} questions
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Série actuelle */}
              <Card className="card-elegant">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                      <Zap className="h-5 w-5 text-amber-500" />
                    </div>
                    <h3 className="font-semibold text-foreground">Série</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-amber-500">
                        {stats.global?.streak || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">réponses consécutives</p>
                    </div>
                    <div className="flex items-center justify-center gap-2 bg-amber-500/10 rounded-lg py-2">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                        {(stats.global?.streak || 0) >= 7 ? 'Excellent !' : 
                         (stats.global?.streak || 0) >= 3 ? 'Bien !' : 'Continuez !'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Temps d'étude */}
              <Card className="card-elegant">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-blue-500" />
                    </div>
                    <h3 className="font-semibold text-foreground">Temps d&apos;Étude</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-500">
                        {stats.global?.studyTime || 0}h
                      </div>
                      <p className="text-xs text-muted-foreground">temps total</p>
                    </div>
                    <div className="flex items-center justify-center gap-2 bg-blue-500/10 rounded-lg py-2">
                      <Brain className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                        {(stats.global?.studyTime || 0) >= 10 ? 'Expert !' : 
                         (stats.global?.studyTime || 0) >= 5 ? 'Avancé !' : 'Débutant'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Section fonctionnalités */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Fonctionnalités</h2>
            <p className="text-sm text-muted-foreground">
              Tout ce dont vous avez besoin pour réussir
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-lg bg-card border border-border hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">Sélection Intelligente</h3>
              <p className="text-sm text-muted-foreground">
                Questions adaptées à vos besoins
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-card border border-border hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">Examens Chronométrés</h3>
              <p className="text-sm text-muted-foreground">
                Conditions réelles d&apos;examen
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-card border border-border hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Award className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">Suivi Personnalisé</h3>
              <p className="text-sm text-muted-foreground">
                Analysez vos performances
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 mt-12 border-t border-border">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Bus className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Code Bus Pro</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Plateforme d&apos;entraînement pour le code de la route
          </p>
        </div>
      </div>
      
      <FixedBottomNavigation />
    </div>
  )
}