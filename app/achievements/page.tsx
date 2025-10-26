'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star, Flame, Calendar, Target, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ACHIEVEMENTS } from '@/lib/achievements/definitions'

interface Achievement {
  id: string
  type: string
  level: 'bronze' | 'silver' | 'gold'
  title: string
  description: string
  icon: string
  requirement: number
  category: 'exam' | 'answers' | 'streak' | 'category' | 'readiness'
  unlocked: boolean
  unlockedAt?: string
}

export default function AchievementsPage() {
  const { data: session, status } = useSession()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetch('/api/achievements')
        .then(res => {
          if (!res.ok) {
            throw new Error('Erreur de chargement')
          }
          return res.json()
        })
        .then(data => {
          setAchievements(data.achievements || [])
          setLoading(false)
        })
        .catch(error => {
          console.error('Erreur lors du chargement des trophées:', error)
          setAchievements([]) // Initialiser avec un tableau vide
          setLoading(false)
        })
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status, session])
  
  const groupedByCategory = achievements.reduce((acc, ach) => {
    if (!acc[ach.category]) acc[ach.category] = []
    acc[ach.category].push(ach)
    return acc
  }, {} as { [key: string]: Achievement[] })
  
  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = ACHIEVEMENTS.length
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des trophées...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Connexion requise</h1>
          <p className="text-muted-foreground mb-6">
            Vous devez être connecté pour voir vos trophées
          </p>
          <Link href="/auth/signin">
            <Button className="interactive-hover">
              Se connecter
            </Button>
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[25vh] min-h-[200px] flex items-center justify-center overflow-hidden">
        {/* Image de fond */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/succes.jpg)',
          }}
        />
        {/* Overlay pour améliorer la lisibilité avec transparence jaune */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/70 to-yellow-800/50" />
        {/* Contenu */}
        <div className="relative z-10 text-center">
          <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4 drop-shadow-lg" />
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">Succès</h1>
          <p className="text-lg text-gray-200 mt-2 drop-shadow-md">
            {unlockedCount} / {totalCount} trophées débloqués
          </p>
          <div className="w-full max-w-xs mx-auto mt-4">
            <div className="bg-white/20 rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Trophées d'examens */}
        {groupedByCategory.exam && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Target className="h-6 w-6 text-primary" />
              Tes trophées d&apos;examens
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {groupedByCategory.exam.map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </section>
        )}
        
        {/* Trophées de réponses */}
        {groupedByCategory.answers && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Flame className="h-6 w-6 text-primary" />
              Tes trophées de réponses
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {groupedByCategory.answers.map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </section>
        )}
        
        {/* Trophées d'entraînement */}
        {groupedByCategory.training && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Target className="h-6 w-6 text-primary" />
              Tes trophées d&apos;entraînement
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {groupedByCategory.training.map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </section>
        )}
        
        {/* Trophées de streak quotidien */}
        {groupedByCategory.streak && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Calendar className="h-6 w-6 text-primary" />
              Tes trophées de régularité
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {groupedByCategory.streak.map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </section>
        )}
        
        {/* Trophées par catégorie */}
        {groupedByCategory.category && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Star className="h-6 w-6 text-primary" />
              Tes trophées de maîtrise
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {groupedByCategory.category.map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </section>
        )}
        
        {/* Trophées de préparation */}
        {groupedByCategory.readiness && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-primary" />
              Préparation à l&apos;examen
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {groupedByCategory.readiness.map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </section>
        )}
        
        {/* Bouton retour */}
        <div className="text-center mt-12">
          <Link href="/dashboard">
            <Button variant="outline" className="interactive-hover">
              Retour au tableau de bord
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const levelColors = {
    bronze: 'from-orange-400 to-orange-600',
    silver: 'from-gray-300 to-gray-500',
    gold: 'from-yellow-400 to-yellow-600'
  }
  
  const levelBorders = {
    bronze: 'border-orange-400',
    silver: 'border-gray-400',
    gold: 'border-yellow-400'
  }
  
  return (
    <Card className={`${achievement.unlocked ? '' : 'opacity-50 grayscale'} transition-all duration-300 hover:scale-105`}>
      <CardContent className="p-4">
        <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${levelColors[achievement.level]} flex items-center justify-center text-3xl border-2 ${levelBorders[achievement.level]}`}>
          {achievement.icon}
        </div>
        <h3 className="font-semibold text-sm text-center mb-1">
          {achievement.title}
        </h3>
        {achievement.unlocked && (
          <div className="text-center mb-2">
            <Badge variant="secondary" className="text-xs">
              Débloqué le {new Date(achievement.unlockedAt!).toLocaleDateString()}
            </Badge>
          </div>
        )}
        <p className="text-xs text-muted-foreground text-center mt-2">
          {achievement.description}
        </p>
        {!achievement.unlocked && (
          <div className="mt-3 text-center">
            <Badge variant="outline" className="text-xs">
              {achievement.requirement} requis
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
