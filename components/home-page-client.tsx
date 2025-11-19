'use client'

import Link from 'next/link'
import Image from 'next/image'
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
        
        {/* Actions rapides pour utilisateur connecté */}
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Actions rapides</h2>
            <p className="text-lg text-muted-foreground">
              Continuez votre apprentissage ou testez vos connaissances
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Link href="/train">
              <Card className="card-elegant hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">Entraînement</h3>
                      <p className="text-sm text-muted-foreground">Questions adaptatives</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/exam">
              <Card className="card-elegant hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">Examen</h3>
                      <p className="text-sm text-muted-foreground">Test chronométré</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/dashboard">
              <Card className="card-elegant hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">Tableau de bord</h3>
                      <p className="text-sm text-muted-foreground">Statistiques détaillées</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
        
        {/* Statistiques pour utilisateur connecté */}
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Vos statistiques</h2>
            <p className="text-lg text-muted-foreground">
              Suivez votre progression et vos performances
            </p>
          </div>
          
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
        
        {/* Section derniers trophées */}
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Derniers trophées</h2>
            <p className="text-lg text-muted-foreground">
              Vos récents succès et accomplissements
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="card-elegant">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-2xl">
                    🏆
                  </div>
                  <div>
                    <h3 className="font-semibold">Premier pas</h3>
                    <p className="text-sm text-muted-foreground">Continuez votre progression</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-elegant">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-2xl">
                    🔥
                  </div>
                  <div>
                    <h3 className="font-semibold">Série en cours</h3>
                    <p className="text-sm text-muted-foreground">Maintenez votre élan</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-elegant">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-2xl">
                    📚
                  </div>
                  <div>
                    <h3 className="font-semibold">Apprentissage</h3>
                    <p className="text-sm text-muted-foreground">Chaque question compte</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-6">
            <Link href="/achievements">
              <Button variant="outline" className="interactive-hover">
                <Trophy className="h-4 w-4 mr-2" />
                Voir tous les trophées
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Section recommandations */}
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Recommandations</h2>
            <p className="text-lg text-muted-foreground">
              Optimisez votre apprentissage avec nos suggestions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="card-elegant">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Entraînement quotidien</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Pratiquez 15-20 minutes par jour pour maintenir vos acquis
                    </p>
                    <Link href="/train">
                      <Button size="sm" variant="outline" className="interactive-hover">
                        Commencer
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-elegant">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Test rapide</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Évaluez vos connaissances avec un examen de 10 questions
                    </p>
                    <Link href="/exam">
                      <Button size="sm" variant="outline" className="interactive-hover">
                        Tester
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-elegant">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Points faibles</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Concentrez-vous sur les domaines qui nécessitent plus d&apos;attention
                    </p>
                    <Link href="/dashboard">
                      <Button size="sm" variant="outline" className="interactive-hover">
                        Analyser
                      </Button>
                    </Link>
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
          <h2 className="text-3xl font-bold mb-4">Pourquoi choisir Code Bus ?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            L'application la plus complète pour réussir votre code de la route catégorie Bus
          </p>
        </div>

        {/* Section Entraînement avec capture d'écran */}
        <div className="mb-16">
          <div className="grid md:grid-cols-2 gap-8 md:gap-8 gap-y-6 items-center">
            <div className="order-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold">Mode Entraînement Intelligent</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Star className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Sélection adaptative</strong> : L'algorithme sélectionne les questions selon vos faiblesses</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Feedback immédiat</strong> : Apprenez de vos erreurs avec des explications détaillées</span>
                </li>
                <li className="flex items-start gap-2">
                  <Brain className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Zoom sur images</strong> : Analysez chaque détail des panneaux routiers</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Filtres avancés</strong> : Par questionnaire, catégorie ou difficulté</span>
                </li>
              </ul>
            </div>
            <div className="order-2 relative w-full">
              {/* Desktop */}
              <div className="hidden md:block relative rounded-lg overflow-hidden shadow-2xl border border-border">
                <Image 
                  src="/images/screenshot-training-desktop.jpg" 
                  alt="Mode Entraînement - Code Bus"
                  width={1200}
                  height={675}
                  className="w-full h-auto"
                  priority
                />
              </div>
              {/* Mobile */}
              <div className="md:hidden relative w-full max-w-[320px] mx-auto">
                <div className="rounded-[1.5rem] p-1.5 shadow-2xl border-2 border-black">
                  <Image 
                    src="/images/screenshot-training-mobile.jpg" 
                    alt="Mode Entraînement Mobile - Code Bus"
                    width={300}
                    height={533}
                    className="w-full h-auto rounded-[1.25rem]"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Examens avec capture d'écran */}
        <div className="mb-16">
          <div className="grid md:grid-cols-2 gap-8 md:gap-8 gap-y-6 items-center">
            <div className="order-2 md:order-1 relative w-full">
              {/* Desktop */}
              <div className="hidden md:block relative rounded-lg overflow-hidden shadow-2xl border border-border">
                <Image 
                  src="/images/screenshot-exam-desktop.jpg" 
                  alt="Mode Examen - Code Bus"
                  width={1200}
                  height={675}
                  className="w-full h-auto"
                  priority
                />
              </div>
              {/* Mobile */}
              <div className="md:hidden relative w-full max-w-[320px] mx-auto">
                <div className="rounded-[1.5rem] p-1.5 shadow-2xl border-2 border-black">
                  <Image 
                    src="/images/screenshot-exam-mobile.jpg" 
                    alt="Mode Examen Mobile - Code Bus"
                    width={300}
                    height={533}
                    className="w-full h-auto rounded-[1.25rem]"
                    priority
                  />
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold">Examens Blancs Réalistes</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Zap className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Conditions réelles</strong> : Timer, score et notation identiques à l'examen officiel</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Revue complète</strong> : Analysez chaque erreur avec l'image et la correction</span>
                </li>
                <li className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Sauvegarde automatique</strong> : Consultez votre historique d'examens passés</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Préparation optimale</strong> : Familiarisez-vous avec le format et la pression</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section Tableau de bord avec capture d'écran */}
        <div className="mb-16">
          <div className="grid md:grid-cols-2 gap-8 md:gap-8 gap-y-6 items-center">
            <div className="order-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold">Suivi de Progression Détaillé</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Trophy className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Statistiques globales</strong> : Taux de réussite, temps d'étude, série en cours</span>
                </li>
                <li className="flex items-start gap-2">
                  <Brain className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Analyse par catégorie</strong> : Identifiez vos forces et faiblesses par domaine</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Questions problématiques</strong> : Listez les questions à réviser en priorité</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Évolution temporelle</strong> : Visualisez vos progrès au fil du temps</span>
                </li>
              </ul>
            </div>
            <div className="order-2 relative w-full">
              {/* Desktop */}
              <div className="hidden md:block relative rounded-lg overflow-hidden shadow-2xl border border-border">
                <Image 
                  src="/images/screenshot-dashboard-desktop.jpg" 
                  alt="Tableau de bord - Code Bus"
                  width={1200}
                  height={675}
                  className="w-full h-auto"
                  priority
                />
              </div>
              {/* Mobile */}
              <div className="md:hidden relative w-full max-w-[320px] mx-auto">
                <div className="rounded-[1.5rem] p-1.5 shadow-2xl border-2 border-black">
                  <Image 
                    src="/images/screenshot-dashboard-mobile.jpg" 
                    alt="Tableau de bord Mobile - Code Bus"
                    width={300}
                    height={533}
                    className="w-full h-auto rounded-[1.25rem]"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Trophées et Succès */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4">Système de Trophées et Succès</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="card-elegant text-center">
              <CardContent className="p-6">
                <div className="text-4xl mb-3">🏆</div>
                <h4 className="font-semibold mb-2">Trophées d'Examen</h4>
                <p className="text-sm text-muted-foreground">Débloquez des succès en réussissant vos examens</p>
              </CardContent>
            </Card>
            <Card className="card-elegant text-center">
              <CardContent className="p-6">
                <div className="text-4xl mb-3">🔥</div>
                <h4 className="font-semibold mb-2">Séries Consécutives</h4>
                <p className="text-sm text-muted-foreground">Maintenez vos séries de bonnes réponses</p>
              </CardContent>
            </Card>
            <Card className="card-elegant text-center">
              <CardContent className="p-6">
                <div className="text-4xl mb-3">📅</div>
                <h4 className="font-semibold mb-2">Régularité</h4>
                <p className="text-sm text-muted-foreground">Entraînez-vous quotidiennement pour progresser</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Avantages techniques */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="card-elegant text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-purple-500" />
              </div>
              <h4 className="font-semibold mb-2">Interface Rapide</h4>
              <p className="text-sm text-muted-foreground">Navigation fluide et réactive</p>
            </CardContent>
          </Card>

          <Card className="card-elegant text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-green-500" />
              </div>
              <h4 className="font-semibold mb-2">Données Sécurisées</h4>
              <p className="text-sm text-muted-foreground">Votre progression sauvegardée</p>
            </CardContent>
          </Card>

          <Card className="card-elegant text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-orange-500" />
              </div>
              <h4 className="font-semibold mb-2">Thème Adaptatif</h4>
              <p className="text-sm text-muted-foreground">Clair ou sombre selon vos préférences</p>
            </CardContent>
          </Card>

          <Card className="card-elegant text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="h-6 w-6 text-blue-500" />
              </div>
              <h4 className="font-semibold mb-2">Intelligence Artificielle</h4>
              <p className="text-sm text-muted-foreground">Sélection de questions adaptative</p>
            </CardContent>
          </Card>
        </div>

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
