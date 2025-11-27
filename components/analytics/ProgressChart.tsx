'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface ChartDataPoint {
  date: string
  value: number
}

interface ProgressChartProps {
  data: ChartDataPoint[]
  title: string
  subtitle?: string
  unit?: string
  color?: string
  showTrend?: boolean
}

export default function ProgressChart({
  data,
  title,
  subtitle,
  unit = '',
  color = 'hsl(var(--primary))',
  showTrend = true
}: ProgressChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Dimensions du graphique
  const width = 100
  const height = 60
  const padding = 5
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2 - 10

  // Calculer les valeurs min et max
  const values = data.map(d => d.value)
  const minValue = Math.min(...values, 0)
  const maxValue = Math.max(...values)
  const valueRange = maxValue - minValue || 1

  // Normaliser les données pour le graphique
  const normalizedData = useMemo(() => {
    return data.map((point, index) => {
      const normalizedY = valueRange > 0
        ? ((point.value - minValue) / valueRange) * chartHeight
        : chartHeight / 2
      const x = (index / Math.max(data.length - 1, 1)) * chartWidth + padding
      const y = chartHeight - normalizedY + padding + 5

      return {
        ...point,
        x,
        y,
        normalizedY
      }
    })
  }, [data, chartWidth, chartHeight, minValue, valueRange, padding])

  // Calculer la ligne de tendance (régression linéaire simple)
  const trendLine = useMemo(() => {
    if (!showTrend || data.length < 2) return null

    const n = data.length
    const sumX = data.reduce((sum, _, i) => sum + i, 0)
    const sumY = data.reduce((sum, d) => sum + d.value, 0)
    const sumXY = data.reduce((sum, d, i) => sum + i * d.value, 0)
    const sumXX = data.reduce((sum, _, i) => sum + i * i, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    return data.map((_, index) => {
      const trendValue = slope * index + intercept
      const normalizedY = valueRange > 0
        ? ((trendValue - minValue) / valueRange) * chartHeight
        : chartHeight / 2
      const x = (index / Math.max(data.length - 1, 1)) * chartWidth + padding
      const y = chartHeight - normalizedY + padding + 5

      return { x, y }
    })
  }, [data, chartWidth, chartHeight, minValue, valueRange, padding, showTrend])

  // Créer le chemin SVG pour la ligne
  const pathData = useMemo(() => {
    if (normalizedData.length === 0) return ''
    if (normalizedData.length === 1) {
      return `M ${normalizedData[0].x} ${normalizedData[0].y}`
    }

    return normalizedData.reduce((path, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`
      }
      return `${path} L ${point.x} ${point.y}`
    }, '')
  }, [normalizedData])

  // Créer le chemin pour la ligne de tendance
  const trendPathData = useMemo(() => {
    if (!trendLine || trendLine.length === 0) return ''
    if (trendLine.length === 1) {
      return `M ${trendLine[0].x} ${trendLine[0].y}`
    }

    return trendLine.reduce((path, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`
      }
      return `${path} L ${point.x} ${point.y}`
    }, '')
  }, [trendLine])

  // Formater les dates pour l'affichage
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    } catch {
      return dateString
    }
  }

  // Valeurs pour l'axe Y
  const yAxisLabels = useMemo(() => {
    const steps = 4
    const labels: number[] = []
    for (let i = 0; i <= steps; i++) {
      labels.push(Math.round(minValue + (valueRange * i) / steps))
    }
    return labels
  }, [minValue, valueRange])

  if (data.length === 0) {
    return (
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucune donnée disponible</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-elegant">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Graphique SVG */}
          <div className="relative">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-48"
              preserveAspectRatio="none"
            >
              {/* Grille horizontale */}
              {yAxisLabels.map((label, index) => {
                const y = padding + 5 + (chartHeight * (yAxisLabels.length - 1 - index)) / (yAxisLabels.length - 1)
                return (
                  <g key={index}>
                    <line
                      x1={padding}
                      y1={y}
                      x2={width - padding}
                      y2={y}
                      stroke="currentColor"
                      strokeWidth="0.5"
                      opacity="0.1"
                    />
                    <text
                      x={padding - 2}
                      y={y + 2}
                      textAnchor="end"
                      fontSize="8"
                      fill="currentColor"
                      opacity="0.5"
                      className="text-xs"
                    >
                      {label}{unit}
                    </text>
                  </g>
                )
              })}

              {/* Ligne de tendance (pointillés) */}
              {trendPathData && (
                <path
                  d={trendPathData}
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  opacity="0.4"
                />
              )}

              {/* Ligne principale */}
              <path
                d={pathData}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points */}
              {normalizedData.map((point, index) => (
                <g key={index}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={hoveredIndex === index ? 4 : 2.5}
                    fill={color}
                    stroke="white"
                    strokeWidth={hoveredIndex === index ? 1.5 : 1}
                    style={{ transition: 'all 0.2s' }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                </g>
              ))}

              {/* Tooltip au survol */}
              {hoveredIndex !== null && normalizedData[hoveredIndex] && (
                <g>
                  <rect
                    x={normalizedData[hoveredIndex].x - 25}
                    y={normalizedData[hoveredIndex].y - 35}
                    width="50"
                    height="20"
                    fill="rgba(0, 0, 0, 0.8)"
                    rx="4"
                  />
                  <text
                    x={normalizedData[hoveredIndex].x}
                    y={normalizedData[hoveredIndex].y - 20}
                    textAnchor="middle"
                    fontSize="9"
                    fill="white"
                  >
                    {normalizedData[hoveredIndex].value.toFixed(1)}{unit}
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Labels des dates en bas */}
          <div className="flex justify-between text-xs text-muted-foreground px-2">
            {data.length > 0 && (
              <>
                <span>{formatDate(data[0].date)}</span>
                {data.length > 1 && <span>{formatDate(data[data.length - 1].date)}</span>}
              </>
            )}
          </div>

          {/* Statistiques rapides */}
          {data.length >= 2 && (
            <div className="flex justify-between text-sm pt-2 border-t">
              <div>
                <span className="text-muted-foreground">Premier: </span>
                <span className="font-semibold">{data[0].value.toFixed(1)}{unit}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Dernier: </span>
                <span className="font-semibold">{data[data.length - 1].value.toFixed(1)}{unit}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Tendance: </span>
                <span className={`font-semibold ${
                  data[data.length - 1].value > data[0].value
                    ? 'text-primary'
                    : data[data.length - 1].value < data[0].value
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                }`}>
                  {data[data.length - 1].value > data[0].value ? '↗' : 
                   data[data.length - 1].value < data[0].value ? '↘' : '→'}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

