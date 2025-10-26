'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { Trophy } from 'lucide-react'
import { Card } from './ui/card'

interface Achievement {
  id: string
  type: string
  level: 'bronze' | 'silver' | 'gold'
  title: string
  description: string
  icon: string
  requirement: number
  category: 'exam' | 'answers' | 'streak' | 'category' | 'readiness'
}

interface AchievementNotificationProps {
  achievement: Achievement
  onClose: () => void
}

export function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  useEffect(() => {
    // Lancer les confettis
    const duration = 3000
    const end = Date.now() + duration
    
    const colors = achievement.level === 'gold' ? ['#FFD700', '#FFA500'] :
                   achievement.level === 'silver' ? ['#C0C0C0', '#808080'] :
                   ['#CD7F32', '#8B4513']
    
    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors
      })
      
      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
    
    // Toast disparaît après 5 secondes
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [achievement, onClose])
  
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary p-6 shadow-2xl max-w-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-primary">Nouveau trophée débloqué !</h3>
            <p className="text-sm text-muted-foreground font-medium">{achievement.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
          </div>
          <div className="text-3xl">
            {achievement.icon}
          </div>
        </div>
      </Card>
    </div>
  )
}
