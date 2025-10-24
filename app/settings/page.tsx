'use client'

import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Sun, Moon, Monitor, Upload, FileJson } from 'lucide-react'
import Link from 'next/link'
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

      <Card className="mt-6 card-elegant">
        <CardHeader>
          <CardTitle>Gestion des données</CardTitle>
          <CardDescription>
            Importez et gérez les questions de l&apos;application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/import">
            <Button className="w-full h-16 flex items-center gap-3">
              <Upload className="h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold">Importer des questions</div>
                <div className="text-sm text-muted-foreground">
                  Ajoutez de nouvelles questions à la base de données
                </div>
              </div>
            </Button>
          </Link>
          
          <Link href="/json-editor">
            <Button variant="outline" className="w-full h-16 flex items-center gap-3">
              <FileJson className="h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold">Éditeur JSON</div>
                <div className="text-sm text-muted-foreground">
                  Modifier, corriger et valider les questions avec IA
                </div>
              </div>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

