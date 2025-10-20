'use client'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface ChartData {
  label: string
  value: number
  color?: string
}

interface SimpleChartProps {
  title: string
  data: ChartData[]
  type?: 'bar' | 'line' | 'doughnut'
  className?: string
}

export default function SimpleChart({ 
  title, 
  data, 
  type = 'bar',
  className = ''
}: SimpleChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))

  const renderBarChart = () => (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{item.label}</span>
            <span className="text-muted-foreground">{item.value}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                item.color || 'bg-primary'
              }`}
              style={{ width: `${item.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )

  const renderLineChart = () => (
    <div className="space-y-4">
      <div className="flex items-end justify-between h-32">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center space-y-2">
            <div
              className={`w-8 rounded-t transition-all duration-500 ${
                item.color || 'bg-primary'
              }`}
              style={{ height: `${(item.value / maxValue) * 100}%` }}
            />
            <span className="text-xs text-muted-foreground">{item.label}</span>
            <span className="text-xs font-medium">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )

  const renderDoughnutChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let cumulativePercentage = 0

    return (
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100
              const circumference = 2 * Math.PI * 40
              const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
              const strokeDashoffset = -cumulativePercentage * circumference / 100
              
              cumulativePercentage += percentage

              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={item.color || `hsl(${index * 60}, 70%, 50%)`}
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500"
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{total}%</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return renderLineChart()
      case 'doughnut':
        return renderDoughnutChart()
      default:
        return renderBarChart()
    }
  }

  return (
    <Card className={`bg-card/80 backdrop-blur-sm border border-border shadow-xl ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-card-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  )
}
