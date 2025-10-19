'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Award, 
  BookOpen, 
  FileText, 
  BarChart3, 
  PieChart,
  Calendar,
  Zap,
  Brain,
  Trophy,
  ArrowRight,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Folder
} from 'lucide-react'
import Link from 'next/link'

interface Stats {
  global: {
    totalQuestions: number
    attemptedQuestions: number
    totalAttempts: number
    correctAttempts: number
    averageScore: number
    studyTime: number
    streak: number
    completedQuestions: number
    correctAnswers: number
    incorrectAnswers: number
  }
  byCategory: Array<{
    name: string
    total: number
    attempted: number
    correct: number
    percentage: number
    notSeen: number
    toReview: number
    mastered: number
  }>
  byQuestionnaire: Array<{
    number: number
    total: number
    attempted: number
    percentage: number
  }>
  byQuestion: Array<{
    id: string
    enonce: string
    categorie: string
    questionnaire: number
    attempts: number
    correctAttempts: number
    successRate: number
    lastAttempt: string | null
    status: 'not_seen' | 'to_review' | 'mastered'
  }>
  problematicQuestions: Array<{
    id: string
    enonce: string
    categorie: string
    questionnaire: number
    attempts: number
    correctAttempts: number
    successRate: number
    lastAttempt: string | null
    status: 'not_seen' | 'to_review' | 'mastered'
  }>
  recentActivity: Array<{
    date: string
    type: 'training' | 'exam'
    score: number
    questions: number
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    global: {
      totalQuestions: 0,
      attemptedQuestions: 0,
      totalAttempts: 0,
      correctAttempts: 0,
      averageScore: 0,
      studyTime: 0,
      streak: 0,
      completedQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0
    },
    byCategory: [],
    byQuestionnaire: [],
    byQuestion: [],
    problematicQuestions: [],
    recentActivity: []
  })

  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ categorie: '', questionnaire: '', statut: '' })
  
  // États pour la structure dépliante
  const [expandedQuestionnaires, setExpandedQuestionnaires] = useState<Set<number>>(new Set([1])) // Premier ouvert par défaut
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Erreur lors du chargement des statistiques:', error)
        setLoading(false)
      })
  }, [])

  // Structure hiérarchique des questions
  const questionsByHierarchy = useMemo(() => {
    const hierarchy: Record<number, Record<string, typeof stats.byQuestion>> = {}
    
    stats.byQuestion.forEach(q => {
      if (!hierarchy[q.questionnaire]) {
        hierarchy[q.questionnaire] = {}
      }
      if (!hierarchy[q.questionnaire][q.categorie]) {
        hierarchy[q.questionnaire][q.categorie] = []
      }
      hierarchy[q.questionnaire][q.categorie].push(q)
    })
    
    return hierarchy
  }, [stats])

  // Fonctions de calcul des statistiques
  const getQuestionnaireStats = (questionnaireNum: number) => {
    const questions = stats.byQuestion.filter(q => q.questionnaire === questionnaireNum)
    const totalAttempts = questions.reduce((sum, q) => sum + q.attempts, 0)
    const correctAttempts = questions.reduce((sum, q) => sum + q.correctAttempts, 0)
    const averageRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0
    
    return {
      total: questions.length,
      attempted: questions.filter(q => q.attempts > 0).length,
      averageRate
    }
  }

  const getCategoryStats = (questionnaireNum: number, category: string) => {
    const questions = stats.byQuestion.filter(q => 
      q.questionnaire === questionnaireNum && q.categorie === category
    )
    const totalAttempts = questions.reduce((sum, q) => sum + q.attempts, 0)
    const correctAttempts = questions.reduce((sum, q) => sum + q.correctAttempts, 0)
    const averageRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0
    
    return {
      total: questions.length,
      attempted: questions.filter(q => q.attempts > 0).length,
      averageRate
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-lg">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">Tableau de bord d&apos;apprentissage</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Votre parcours <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Code Bus</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Analysez vos progrès, identifiez vos points forts et optimisez votre préparation 
              au code de la route avec des insights personnalisés.
            </p>
          </div>

          {/* Stats principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Score moyen</p>
                    <p className="text-3xl font-bold text-green-600">{stats.global.averageScore}%</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={stats.global.averageScore} size="sm" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Questions étudiées</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.global.completedQuestions}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    {stats.global.totalQuestions > 0 ? Math.round((stats.global.completedQuestions / stats.global.totalQuestions) * 100) : 0}% du programme
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Série actuelle</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.global.streak} jours</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Zap className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Continuez votre série !</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Temps d&apos;étude</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.global.studyTime}h</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 pb-12">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="categories">Catégories</TabsTrigger>
            <TabsTrigger value="questionnaires">Questionnaires</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="analytics">Analyses</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Performance par catégorie */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance par catégorie
                </CardTitle>
                <CardDescription>
                  Analysez vos résultats dans chaque domaine du code de la route
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.byCategory.length > 0 ? (
                    stats.byCategory.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">{category.name[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-gray-500">
                              {category.attempted}/{category.total} étudiées
                            </p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                {category.mastered} maîtrisées
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                                {category.toReview} à revoir
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700">
                                {category.notSeen} non vues
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{category.percentage}%</p>
                          <Progress value={category.percentage} size="sm" className="w-24" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Aucune donnée disponible</p>
                      <p className="text-sm mt-2">Commencez à vous entraîner pour voir vos statistiques</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Activité récente */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Activité récente
                </CardTitle>
                <CardDescription>
                  Vos dernières sessions d&apos;entraînement et d&apos;examens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          activity.type === 'exam' ? 'bg-purple-100' : 'bg-blue-100'
                        }`}>
                          {activity.type === 'exam' ? (
                            <FileText className="h-5 w-5 text-purple-600" />
                          ) : (
                            <BookOpen className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {activity.type === 'exam' ? 'Examen' : 'Entraînement'}
                          </p>
                          <p className="text-sm text-gray-500">{activity.questions} questions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{activity.score}%</p>
                        <p className="text-sm text-gray-500">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.byCategory.length > 0 ? (
                stats.byCategory.map((category, index) => (
                  <Card 
                    key={index} 
                    className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                    onClick={() => window.open(`/train?categorie=${encodeURIComponent(category.name)}`, '_blank')}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-gray-900 break-words group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        {category.attempted} sur {category.total} questions étudiées
                      </CardDescription>
                      <div className="mt-2 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Cliquez pour vous entraîner sur cette catégorie →
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-6">
                        {/* Score principal */}
                        <div className="text-center">
                          <div className="relative inline-block">
                            <p className="text-5xl font-bold text-blue-600 mb-2">{category.percentage}%</p>
                            <div className="w-24 h-2 bg-gray-200 rounded-full mx-auto">
                              <div 
                                className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                                style={{ width: `${category.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Statistiques détaillées */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium text-green-800">Maîtrisées</span>
                            </div>
                            <span className="text-lg font-bold text-green-700">{category.mastered}</span>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                              <span className="text-sm font-medium text-orange-800">À revoir</span>
                            </div>
                            <span className="text-lg font-bold text-orange-700">{category.toReview}</span>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-700">Non vues</span>
                            </div>
                            <span className="text-lg font-bold text-gray-600">{category.notSeen}</span>
                          </div>
                        </div>
                        
                        {/* Progression */}
                        <div className="pt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progression</span>
                            <span>{category.attempted}/{category.total}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(category.attempted / category.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 text-center py-12 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune catégorie disponible</p>
                  <p className="text-sm mt-2">Commencez à vous entraîner pour voir vos statistiques par catégorie</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="questionnaires" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.byQuestionnaire.length > 0 ? (
                stats.byQuestionnaire.map((questionnaire, index) => (
                  <Card 
                    key={index} 
                    className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                    onClick={() => window.open(`/train?questionnaire=${questionnaire.number}`, '_blank')}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                        Questionnaire {questionnaire.number}
                      </CardTitle>
                      <CardDescription>
                        {questionnaire.attempted} sur {questionnaire.total} questions
                      </CardDescription>
                      <div className="mt-2 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Cliquez pour vous entraîner sur ce questionnaire →
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-4xl font-bold text-purple-600">{questionnaire.percentage}%</p>
                          <Progress value={questionnaire.percentage} className="mt-2" />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total: {questionnaire.total}</span>
                          <span className="text-blue-600">Vues: {questionnaire.attempted}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-4 text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun questionnaire disponible</p>
                  <p className="text-sm mt-2">Commencez à vous entraîner pour voir vos statistiques par questionnaire</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="questions" className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Toutes les questions
                </CardTitle>
                <CardDescription>
                  Organisation par questionnaire et catégorie
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(questionsByHierarchy).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(questionsByHierarchy).map(([questionnaireNum, categories]) => {
                      const qNum = parseInt(questionnaireNum)
                      const qStats = getQuestionnaireStats(qNum)
                      const isExpanded = expandedQuestionnaires.has(qNum)
                      
                      return (
                        <div key={qNum} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* En-tête Questionnaire */}
                          <div 
                            className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 cursor-pointer hover:from-purple-100 hover:to-blue-100 transition-all"
                            onClick={() => {
                              const newExpanded = new Set(expandedQuestionnaires)
                              if (isExpanded) {
                                newExpanded.delete(qNum)
                              } else {
                                newExpanded.add(qNum)
                              }
                              setExpandedQuestionnaires(newExpanded)
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <ChevronRight className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                <FileText className="h-5 w-5 text-purple-600" />
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    Questionnaire {qNum}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {qStats.total} questions • {qStats.attempted} étudiées • {qStats.averageRate}% réussite
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.open(`/train?questionnaire=${qNum}`, '_blank')
                                }}
                              >
                                S&apos;entraîner
                              </Button>
                            </div>
                          </div>
                          
                          {/* Contenu Catégories (avec animation) */}
                          {isExpanded && (
                            <div className="animate-in slide-in-from-top duration-300">
                              {Object.entries(categories).map(([category, questions]) => {
                                const catKey = `${qNum}-${category}`
                                const isCatExpanded = expandedCategories.has(catKey)
                                const catStats = getCategoryStats(qNum, category)
                                
                                return (
                                  <div key={catKey} className="border-t border-gray-200">
                                    {/* En-tête Catégorie */}
                                    <div
                                      className="bg-gray-50 p-3 pl-12 cursor-pointer hover:bg-gray-100 transition-colors"
                                      onClick={() => {
                                        const newExpanded = new Set(expandedCategories)
                                        if (isCatExpanded) {
                                          newExpanded.delete(catKey)
                                        } else {
                                          newExpanded.add(catKey)
                                        }
                                        setExpandedCategories(newExpanded)
                                      }}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <ChevronRight className={`h-4 w-4 transition-transform ${isCatExpanded ? 'rotate-90' : ''}`} />
                                          <Folder className="h-4 w-4 text-blue-600" />
                                          <div>
                                            <h4 className="font-medium text-gray-900">{category}</h4>
                                            <p className="text-xs text-gray-600">
                                              {catStats.total} questions • {catStats.averageRate}% réussite
                                            </p>
                                          </div>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            window.open(`/train?categorie=${encodeURIComponent(category)}`, '_blank')
                                          }}
                                        >
                                          S&apos;entraîner
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    {/* Questions individuelles */}
                                    {isCatExpanded && (
                                      <div className="animate-in slide-in-from-top duration-200">
                                        {questions.map((question) => (
                                          <div
                                            key={question.id}
                                            className="p-3 pl-20 hover:bg-gray-50 cursor-pointer transition-colors border-t border-gray-100 group"
                                            onClick={() => window.open(`/train?questionId=${question.id}`, '_blank')}
                                          >
                                            {/* Même structure que l'ancien design mais plus compact */}
                                            <div className="flex items-start gap-3">
                                              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                                question.status === 'mastered' ? 'bg-green-100 text-green-700' :
                                                question.status === 'to_review' ? 'bg-orange-100 text-orange-700' :
                                                'bg-gray-100 text-gray-700'
                                              }`}>
                                                {question.status === 'mastered' ? '✓' :
                                                 question.status === 'to_review' ? '!' : '?'}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                  {question.enonce || &apos;Pas d&apos;énoncé&apos;}
                                                </p>
                                                <div className="flex gap-4 mt-1 text-xs text-gray-600">
                                                  <span>{question.attempts} tentatives</span>
                                                  <span>{question.successRate}% réussite</span>
                                                  {question.lastAttempt && (
                                                    <span>{new Date(question.lastAttempt).toLocaleDateString('fr-FR')}</span>
                                                  )}
                                                </div>
                                              </div>
                                              <Badge className={
                                                question.status === 'mastered' ? 'bg-green-100 text-green-700' :
                                                question.status === 'to_review' ? 'bg-orange-100 text-orange-700' :
                                                'bg-gray-100 text-gray-700'
                                              }>
                                                {question.status === &apos;mastered&apos; ? &apos;Maîtrisée&apos; :
                                                 question.status === &apos;to_review&apos; ? &apos;À revoir&apos; : &apos;Non vue&apos;}
                                              </Badge>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune question disponible</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="analytics" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Répartition des réponses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Correctes</span>
                      </div>
                      <span className="font-bold text-green-600">{stats.global.correctAnswers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm">Incorrectes</span>
                      </div>
                      <span className="font-bold text-red-600">{stats.global.incorrectAnswers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">Non étudiées</span>
                      </div>
                      <span className="font-bold text-gray-600">{stats.global.totalQuestions - stats.global.completedQuestions}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Statistiques globales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm">Total tentatives</span>
                      <span className="font-bold text-blue-600">{stats.global.totalAttempts}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm">Taux de réussite global</span>
                      <span className="font-bold text-green-600">{stats.global.averageScore}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm">Temps d&apos;étude total</span>
                      <span className="font-bold text-purple-600">{stats.global.studyTime}h</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm">Série actuelle</span>
                      <span className="font-bold text-orange-600">{stats.global.streak} jours</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Questions problématiques */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Questions à travailler
                </CardTitle>
                <CardDescription>
                  Questions avec le taux de réussite le plus faible
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.problematicQuestions.length > 0 ? (
                  <div className="space-y-3">
                    {stats.problematicQuestions.map((question, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="h-8 w-8 bg-red-200 rounded-full flex items-center justify-center text-xs font-bold text-red-700">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{question.enonce}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{question.categorie}</Badge>
                              <Badge variant="outline" className="text-xs">Q{question.questionnaire}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 ml-4">
                          <div className="text-right">
                            <p className="text-sm font-bold text-red-600">{question.successRate}%</p>
                            <p className="text-xs text-gray-500">{question.attempts} tentatives</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
                    <p>Aucune question problématique</p>
                    <p className="text-sm mt-2">Continuez votre excellent travail !</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions rapides */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Prêt pour la suite ?</h3>
                  <p className="text-blue-100">
                    Continuez votre apprentissage avec des exercices personnalisés
                  </p>
                </div>
                <div className="flex gap-4">
                  <Link href="/train">
                    <Button variant="secondary" size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Entraînement
                    </Button>
                  </Link>
                  <Link href="/exam">
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                      <FileText className="h-5 w-5 mr-2" />
                      Examen
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
