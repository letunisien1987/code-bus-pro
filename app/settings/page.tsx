'use client'

import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const themes = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'system', label: 'Système', icon: Monitor },
  ]

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-5xl font-bold mb-6">Paramètres</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Apparence</CardTitle>
          <CardDescription>
            Personnalisez l&apos;apparence de l&apos;application selon vos préférences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themes.map((t) => {
              const Icon = t.icon
              const isActive = theme === t.value
              return (
                <Button
                  key={t.value}
                  variant={isActive ? 'default' : 'outline'}
                  className={`h-24 flex flex-col gap-2 ${
                    isActive ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setTheme(t.value)}
                >
                  <Icon className="h-6 w-6" />
                  <span>{t.label}</span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

