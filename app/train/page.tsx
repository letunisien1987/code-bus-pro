'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, RotateCcw, Menu, Filter, X } from 'lucide-react'

interface Question {
  id: string
  questionnaire: number
  question: string
  categorie: string | null
  astag: string | null
  enonce: string | null
  optionA: string | null
  optionB: string | null
  optionC: string | null
  optionD: string | null
  bonneReponse: string
  imagePath: string
}

interface Attempt {
  id: string
  questionId: string
  choix: string
  correct: boolean
  createdAt: string
}

export default function TrainPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [questions, setQuestions] = useState<Question[]>([])
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    questionnaire: 'all',
    categorie: 'all',
    astag: 'all',
    statut: 'all'
  })
  const [smartMode, setSmartMode] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const fetchQuestions = useCallback(async () => {
    try {
      console.log('🔄 Chargement des questions...')
      const questionId = searchParams.get('questionId')
      
      if (questionId) {
        console.log('📝 Chargement question spécifique:', questionId)
        const response = await fetch(`/api/questions?id=${questionId}`)
        if (response.ok) {
          const data = await response.json()
          console.log('✅ Question spécifique chargée:', data)
          setQuestions(Array.isArray(data) ? data : [data])
          setLoading(false)
          return
        }
      }
      
      console.log('📚 Chargement de toutes les questions')
      const response = await fetch('/api/questions')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('✅ Questions chargées:', data.length)
      setQuestions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('❌ Erreur lors du chargement des questions:', error)
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  // Initialiser les filtres depuis les paramètres URL
  useEffect(() => {
    const questionnaire = searchParams.get('questionnaire')
    const categorie = searchParams.get('categorie')
    const questionId = searchParams.get('questionId')
    
    if (questionnaire || categorie || questionId) {
      setFilters(prev => ({
        ...prev,
        questionnaire: questionnaire || 'all',
        categorie: categorie || 'all'
      }))
      
      if (questionId) {
        setSmartMode(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (showFeedback && event.key === 'ArrowRight') {
        handleNext()
      } else if (event.key === 'ArrowLeft') {
        handlePrevious()
      } else if (!showFeedback && ['a', 'b', 'c', 'd'].includes(event.key.toLowerCase())) {
        handleAnswerSelect(event.key.toLowerCase())
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFeedback])

  const filteredQuestions = questions.filter(q => {
    if (filters.questionnaire !== 'all' && q.questionnaire.toString() !== filters.questionnaire) return false
    if (filters.categorie !== 'all' && q.categorie !== filters.categorie) return false
    if (filters.astag !== 'all' && q.astag !== filters.astag) return false
    
    if (filters.statut !== 'all') {
      const questionAttempts = attempts.filter(a => a.questionId === q.id)
      if (filters.statut === 'not-seen' && questionAttempts.length > 0) return false
      if (filters.statut === 'success' && (questionAttempts.length === 0 || !questionAttempts.some(a => a.correct))) return false
      if (filters.statut === 'failed' && (questionAttempts.length === 0 || !questionAttempts.some(a => !a.correct))) return false
    }
    
    return true
  })

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return
    setSelectedAnswer(answer)
    setShowFeedback(true)
    
    const currentQuestion = filteredQuestions[currentIndex]
    const isCorrect = answer === currentQuestion.bonneReponse
    
    saveAttempt(currentQuestion.id, answer, isCorrect)
  }

  const saveAttempt = async (questionId: string, choix: string, correct: boolean) => {
    try {
      await fetch('/api/attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questionId, choix, correct })
      })
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la tentative:', error)
    }
  }

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    }
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setShowFeedback(false)
    fetchQuestions()
  }

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des questions...</p>
        </div>
      </div>
    )
  }

  if (filteredQuestions.length === 0) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8">
            <p className="text-gray-600 mb-4">Aucune question trouvée avec ces filtres.</p>
            <Button onClick={() => setFilters({
              questionnaire: 'all',
              categorie: 'all',
              astag: 'all',
              statut: 'all'
            })}>
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = filteredQuestions[currentIndex]

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header épuré - Fixe en haut */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-600"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">Entraînement</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
              className="text-gray-600"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filtres
            </Button>
            <Badge variant="outline" className="text-xs">
              {currentIndex + 1} / {filteredQuestions.length}
            </Badge>
          </div>
        </div>

        {/* Menu et filtres dépliables */}
        {(showMenu || showFilters) && (
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex-shrink-0">
            {showMenu && (
              <div className="mb-3 p-3 bg-white rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Menu</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowMenu(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push('/')}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Accueil
                  </Button>
                  <Button 
                    variant={smartMode ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setSmartMode(!smartMode)}
                  >
                    {smartMode ? "🧠 Intelligent" : "📚 Standard"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>
            )}

            {showFilters && (
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Filtres</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Select value={filters.questionnaire} onValueChange={(value) => setFilters({...filters, questionnaire: value})}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Questionnaire" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      {Array.from(new Set(questions.map(q => q.questionnaire).filter(Boolean))).sort().map(num => (
                        <SelectItem key={num} value={num.toString()}>Questionnaire {num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.categorie} onValueChange={(value) => setFilters({...filters, categorie: value})}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      {Array.from(new Set(questions.map(q => q.categorie).filter(Boolean))).map(cat => (
                        <SelectItem key={cat} value={cat!}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.astag} onValueChange={(value) => setFilters({...filters, astag: value})}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="ASTAG" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      {Array.from(new Set(questions.map(q => q.astag).filter(Boolean))).map(astag => (
                        <SelectItem key={astag} value={astag!}>{astag}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.statut} onValueChange={(value) => setFilters({...filters, statut: value})}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="not-seen">Non vu</SelectItem>
                      <SelectItem value="success">Réussi</SelectItem>
                      <SelectItem value="failed">Échoué</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contenu principal - Layout côte à côte sans scroll */}
        <div className="flex-1 flex gap-4 p-4 min-h-0">
          {/* Image - 50% */}
          <div className="w-1/2">
            <Card className="h-full">
              <CardContent className="p-4 h-full flex items-center justify-center">
                <img 
                  src={currentQuestion.imagePath} 
                  alt={`Question ${currentQuestion.question}`}
                  className="max-w-full max-h-full object-contain"
                />
              </CardContent>
            </Card>
          </div>

          {/* Question et options - 50% */}
          <div className="w-1/2 flex flex-col">
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Question {currentQuestion.question}
                  </CardTitle>
                  <div className="flex gap-2">
                    {currentQuestion.categorie && (
                      <Badge variant="secondary" className="text-xs">
                        {currentQuestion.categorie}
                      </Badge>
                    )}
                    {currentQuestion.astag && (
                      <Badge variant="outline" className="text-xs">
                        {currentQuestion.astag}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 font-medium break-words whitespace-pre-wrap">
                  {currentQuestion.enonce}
                </p>

                <div className="space-y-2">
                  {['A', 'B', 'C', 'D'].map((option, index) => {
                    const optionKey = `option${option}` as keyof Question
                    const optionValue = currentQuestion[optionKey] as string
                    const answerKey = option.toLowerCase()
                    
                    if (!optionValue) return null
                    
                    const isSelected = selectedAnswer === answerKey
                    const isCorrect = answerKey === currentQuestion.bonneReponse
                    const showCorrect = showFeedback && isCorrect
                    const showIncorrect = showFeedback && isSelected && !isCorrect

                    return (
                      <Button
                        key={option}
                        variant={isSelected ? "default" : "outline"}
                        className={`w-full justify-start h-auto p-3 ${
                          showCorrect ? 'bg-green-100 border-green-500 text-green-700' :
                          showIncorrect ? 'bg-red-100 border-red-500 text-red-700' :
                          isSelected ? 'bg-blue-100 border-blue-500 text-blue-700' :
                          'hover:bg-gray-50'
                        }`}
                        onClick={() => handleAnswerSelect(answerKey)}
                        disabled={showFeedback}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                            showCorrect ? 'bg-green-500 text-white' :
                            showIncorrect ? 'bg-red-500 text-white' :
                            isSelected ? 'bg-blue-500 text-white' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {option}
                          </div>
                          <span className="text-left break-words whitespace-pre-wrap flex-1">{optionValue}</span>
                          {showFeedback && (
                            <div className="ml-auto">
                              {showCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
                              {showIncorrect && <XCircle className="h-5 w-5 text-red-600" />}
                            </div>
                          )}
                        </div>
                      </Button>
                    )
                  })}
                </div>

                {showFeedback && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {selectedAnswer === currentQuestion.bonneReponse ? (
                        <span className="text-green-600 font-medium">✓ Correct !</span>
                      ) : (
                        <span className="text-red-600 font-medium">
                          ✗ Incorrect. La bonne réponse était {currentQuestion.bonneReponse.toUpperCase()}.
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between mt-4">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Précédent
              </Button>
              
              <Button 
                onClick={handleNext}
                disabled={currentIndex === filteredQuestions.length - 1}
                className="flex items-center gap-2"
              >
                Suivant
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
