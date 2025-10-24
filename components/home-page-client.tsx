'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
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
  Trophy,
  LogIn,
  LogOut,
  User
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

export default function HomePageClient() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error)
    } finally {
      setLoading(false)
    }
  }

  // Si l'utilisateur est connecté, afficher le dashboard
  if (status === 'authenticated') {
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
          
          {/* Overlay sombre */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Contenu centré */}
          <div className="relative z-10 text-center text-white px-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 bg-primary/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Bus className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold">
                Code Bus
              </h1>
            </div>
            <p className="text-lg md:text-xl mb-6 opacity-90">
              Bienvenue, {session?.user?.name} !
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Tableau de bord
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => signOut()}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Se déconnecter
              </Button>
            </div>
          </div>
        </div>
        
        {/* Statistiques pour utilisateur connecté */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="card-elegant">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.global?.totalQuestions || 0}</p>
                    <p className="text-sm text-muted-foreground">Questions étudiées</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-elegant">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.global?.correctAnswers || 0}</p>
                    <p className="text-sm text-muted-foreground">Bonnes réponses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-elegant">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                    <Award className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.global?.streak || 0}</p>
                    <p className="text-sm text-muted-foreground">Série en cours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-elegant">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{Math.round(stats?.global?.averageScore || 0)}%</p>
                    <p className="text-sm text-muted-foreground">Score moyen</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <FixedBottomNavigation />
      </div>
    )
  }

  // Page d'accueil pour utilisateurs non connectés
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
        
        {/* Overlay sombre */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Contenu centré */}
        <div className="relative z-10 text-center text-white px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-primary/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Bus className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold">
              Code Bus
            </h1>
          </div>
          <p className="text-lg md:text-xl mb-6 opacity-90">
            Plateforme d&apos;entraînement pour le code de la route
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <LogIn className="h-5 w-5 mr-2" />
                Se connecter
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <User className="h-5 w-5 mr-2" />
                S&apos;inscrire
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Section des fonctionnalités */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Préparez-vous efficacement</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Maîtrisez le code de la route avec notre plateforme d&apos;entraînement intelligente
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card className="card-elegant text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Entraînement adaptatif</h3>
              <p className="text-muted-foreground">
                Questions ciblées basées sur vos points faibles pour un apprentissage optimisé
              </p>
            </CardContent>
          </Card>

          <Card className="card-elegant text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Examens blancs</h3>
              <p className="text-muted-foreground">
                Simulez les conditions réelles d&apos;examen avec nos tests chronométrés
              </p>
            </CardContent>
          </Card>

          <Card className="card-elegant text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Suivi de progression</h3>
              <p className="text-muted-foreground">
                Visualisez vos améliorations et identifiez les domaines à renforcer
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques globales */}
        {stats && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="card-elegant">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.global?.totalQuestions || 0}</p>
                    <p className="text-sm text-muted-foreground">Questions disponibles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-elegant">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.global?.correctAnswers || 0}</p>
                    <p className="text-sm text-muted-foreground">Bonnes réponses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-elegant">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                    <Award className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.global?.streak || 0}</p>
                    <p className="text-sm text-muted-foreground">Série en cours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-elegant">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{Math.round(stats.global?.averageScore || 0)}%</p>
                    <p className="text-sm text-muted-foreground">Score moyen</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Boutons d'authentification pour utilisateurs non connectés */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Commencez votre entraînement</h2>
          <p className="text-muted-foreground mb-6">
            Créez un compte pour sauvegarder votre progression et accéder à toutes les fonctionnalités
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <LogIn className="h-5 w-5 mr-2" />
                Se connecter
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline" size="lg">
                <User className="h-5 w-5 mr-2" />
                S&apos;inscrire
              </Button>
            </Link>
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
      
      <FixedBottomNavigation />
    </div>
  )
}
