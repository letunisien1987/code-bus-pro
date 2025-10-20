'use client'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  description?: string
  progress?: number
  icon?: React.ReactNode
  className?: string
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  description,
  progress,
  icon,
  className = ''
}: StatsCardProps) {
  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-primary" />
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-destructive" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-primary'
      case 'decrease':
        return 'text-destructive'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <Card className={`bg-card/80 backdrop-blur-sm border border-border shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-card-foreground">{title}</CardTitle>
          {icon && (
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>
        {change !== undefined && (
          <div className="flex items-center gap-2">
            {getChangeIcon()}
            <span className={`text-sm font-medium ${getChangeColor()}`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <Badge 
              variant="secondary" 
              className="text-xs"
            >
              {changeType === 'increase' ? 'En hausse' :
               changeType === 'decrease' ? 'En baisse' : 'Stable'}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-3xl font-bold text-card-foreground">{value}</div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progression</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} size="sm" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
