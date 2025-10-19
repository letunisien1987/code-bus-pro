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
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600'
      case 'decrease':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
          {icon && (
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
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
              className={`text-xs ${
                changeType === 'increase' ? 'bg-green-100 text-green-700' :
                 changeType === 'decrease' ? 'bg-red-100 text-red-700' :
                 'bg-gray-100 text-gray-700'
              }`}
            >
              {changeType === 'increase' ? 'En hausse' :
               changeType === 'decrease' ? 'En baisse' : 'Stable'}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-3xl font-bold text-gray-900">{value}</div>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
          {progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progression</span>
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
