'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { 
  BookOpen, 
  FileText, 
  BarChart3, 
  Bus, 
  TrendingUp, 
  Target, 
  Clock, 
  Award, 
  CheckCircle,
  ArrowRight,
  Brain,
  Zap,
  Shield,
  Star,
  Users,
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

  const getProgressPercentage = () => {
    if (!stats) return 0
    return Math.round((stats.global.correctAnswers / stats.global.totalQuestions) * 100)
  }

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return 'text-success'
    if (streak >= 3) return 'text-warning'
    return 'text-muted-foreground'
  }

  return (
    <div className="min-h-screen relative">
      {/* Image de fond fixe */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat bg-fixed z-0"
        style={{
          backgroundImage: 'url(/images/bus1.jpg)',
        }}
      />
      
      {/* Overlay sombre pour la lisibilité */}
      <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-10"></div>
      
      {/* Contenu principal */}
      <div className="relative z-20 min-h-screen">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-lg border border-border/50">
              <Bus className="h-6 w-6 text-primary" />
              <span className="font-semibold text-foreground">Formation Professionnelle</span>
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                <Star className="h-3 w-3 mr-1" />
                Nouveau
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 drop-shadow-lg">
              Maîtrisez le <span className="text-primary">code de la route</span>
            </h1>
            <p className="text-xl md:text-2xl text-foreground/90 max-w-4xl mx-auto mb-12 drop-shadow-md">
              Plateforme d&apos;entraînement intelligente avec analyses avancées, 
              examens chronométrés et suivi personnalisé de vos progrès.
            </p>
          </div>
        </div>

        {/* Boutons principaux */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {/* Entraînement - Bouton principal */}
            <Link href="/train" className="md:col-span-1">
              <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 border-primary/30 bg-background/90 backdrop-blur-sm hover:bg-primary/10 group">
                <CardContent className="p-8 text-center">
                  <div className="h-20 w-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <BookOpen className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">Entraînement</h3>
                  <p className="text-muted-foreground mb-6">
                    Pratiquez à votre rythme avec feedback immédiat et sélection intelligente des questions
                  </p>
                  <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                    Commencer l&apos;entraînement
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Examen - Bouton principal */}
            <Link href="/exam" className="md:col-span-1">
              <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 border-primary/30 bg-background/90 backdrop-blur-sm hover:bg-primary/10 group">
                <CardContent className="p-8 text-center">
                  <div className="h-20 w-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <FileText className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">Examen</h3>
                  <p className="text-muted-foreground mb-6">
                    Testez vos connaissances avec des examens chronométrés et un système de notation
                  </p>
                  <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                    Passer un examen
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Dashboard - Bouton secondaire */}
            <Link href="/dashboard" className="md:col-span-1">
              <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 border-border/50 bg-background/90 backdrop-blur-sm hover:bg-muted/50 group">
                <CardContent className="p-8 text-center">
                  <div className="h-20 w-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <BarChart3 className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">Tableau de bord</h3>
                  <p className="text-muted-foreground mb-6">
                    Suivez vos progrès avec des statistiques détaillées et des analyses
                  </p>
                  <Button size="lg" variant="outline" className="w-full shadow-lg">
                    Voir les statistiques
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Statistiques dynamiques */}
          {!loading && stats && (
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {/* Progression globale */}
              <Card className="hover:shadow-xl transition-all duration-300 bg-background/90 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Progression Globale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Score moyen</span>
                      <span className="text-2xl font-bold text-primary">{stats.global.averageScore}%</span>
                    </div>
                    <Progress value={stats.global.averageScore} className="h-3" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{stats.global.correctAnswers} bonnes réponses</span>
                      <span>{stats.global.totalQuestions} questions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Série actuelle */}
              <Card className="hover:shadow-xl transition-all duration-300 bg-background/90 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5 text-warning" />
                    Série Actuelle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${getStreakColor(stats.global.streak)}`}>
                        {stats.global.streak}
                      </div>
                      <p className="text-sm text-muted-foreground">réponses consécutives</p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Trophy className="h-4 w-4 text-warning" />
                      <span className="text-sm text-muted-foreground">
                        {stats.global.streak >= 7 ? 'Excellent !' : 
                         stats.global.streak >= 3 ? 'Bien !' : 'Continuez !'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Temps d'étude */}
              <Card className="hover:shadow-xl transition-all duration-300 bg-background/90 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5 text-info" />
                    Temps d&apos;Étude
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-info">
                        {stats.global.studyTime}h
                      </div>
                      <p className="text-sm text-muted-foreground">total d&apos;étude</p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Brain className="h-4 w-4 text-info" />
                      <span className="text-sm text-muted-foreground">
                        {stats.global.studyTime >= 10 ? 'Expert !' : 
                         stats.global.studyTime >= 5 ? 'Avancé !' : 'Débutant'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Section fonctionnalités */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 drop-shadow-lg">
              Fonctionnalités Avancées
            </h2>
            <p className="text-lg text-foreground/90 mb-12 drop-shadow-md">
              Une plateforme complète pour maîtriser le code de la route
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="h-16 w-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Sélection Intelligente</h3>
                <p className="text-foreground/80">
                  L&apos;IA adapte les questions selon vos faiblesses pour un apprentissage optimisé
                </p>
              </div>
              
              <div className="text-center">
                <div className="h-16 w-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <Shield className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Examens Chronométrés</h3>
                <p className="text-foreground/80">
                  Conditions d&apos;examen réelles avec timer et évaluation automatique
                </p>
              </div>
              
              <div className="text-center">
                <div className="h-16 w-16 bg-success/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <Award className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Suivi Personnalisé</h3>
                <p className="text-foreground/80">
                  Statistiques détaillées et recommandations pour améliorer vos performances
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-8 border-t border-border/50">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Bus className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold text-foreground">Code Bus Pro</span>
            </div>
            <p className="text-foreground/80">
              Plateforme d&apos;entraînement professionnelle pour le code de la route
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}