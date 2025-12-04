'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, RotateCcw, Menu, Filter, X } from 'lucide-react'
import { getImageUrlSync } from '@/lib/blob-helper'

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

function TrainPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [questions, setQuestions] = useState<Question[]>([])
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isImageZoomed, setIsImageZoomed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [questionStartTime, setQuestionStartTime] = useState<number>(0)

  // Fonction pour extraire le numéro de l'image depuis le nom de fichier
  const extractImageNumber = (imagePath: string): number | null => {
    // Vérification de sécurité pour éviter les erreurs si imagePath est undefined
    if (!imagePath || typeof imagePath !== 'string') {
      console.warn('extractImageNumber: imagePath is undefined or not a string:', imagePath);
      return null;
    }
    
    const match = imagePath.match(/Question\s*\((\d+)\)\.jpg/i)
    return match ? parseInt(match[1], 10) : null
  }

  // Fonction pour calculer le nombre total de questions dans un questionnaire
  const getTotalQuestionsInQuestionnaire = (questionnaireNumber: number): number => {
    return questions.filter(q => q.questionnaire === questionnaireNumber).length
  }

  // Réinitialiser le zoom et démarrer le timer quand on change de question
  useEffect(() => {
    setIsImageZoomed(false)
    setQuestionStartTime(Date.now())
  }, [currentIndex])

  // Gestion de la touche Échap pour fermer le zoom
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isImageZoomed) {
        setIsImageZoomed(false)
      }
    }

    if (isImageZoomed) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isImageZoomed])
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
    const qParam = searchParams.get('questionnaire')
    const cParam = searchParams.get('categorie')
    const questionId = searchParams.get('questionId')

    const questionnaire = qParam && qParam.trim() !== '' ? qParam : 'all'
    const categorie = cParam && cParam.trim() !== '' ? cParam : 'all'
    
    if (qParam !== null || cParam !== null || questionId) {
      setFilters(prev => ({
        ...prev,
        questionnaire,
        categorie
      }))
      
      if (questionId) {
        setSmartMode(false)
      }
    }
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
      // Calculer le temps passé sur cette question (en secondes)
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
      
      await fetch('/api/attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questionId, choix, correct, timeSpent })
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

  const resetFilters = useCallback(() => {
    setFilters({
      questionnaire: 'all',
      categorie: 'all',
      astag: 'all',
      statut: 'all'
    })
    router.replace('/train')
  }, [router])

  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des questions...</p>
        </div>
      </div>
    )
  }

  if (filteredQuestions.length === 0) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-8">
            <p className="text-muted-foreground mb-4">Aucune question trouvée avec ces filtres.</p>
            <Button onClick={resetFilters} className="interactive-hover">
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = filteredQuestions[currentIndex]

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header épuré - Fixe en haut */}
      <div className="bg-background border-b border-border px-4 sm:px-6 lg:px-8 xl:px-12 py-3 sm:py-3.5 lg:py-4 flex-shrink-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
              className="text-muted-foreground h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold">Entraînement</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-muted-foreground text-sm sm:text-base"
            >
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5" />
              <span className="hidden sm:inline">Filtres</span>
            </Button>
            <Badge variant="outline" className="text-xs sm:text-sm lg:text-base font-semibold px-2 sm:px-3 lg:px-4 py-1 lg:py-1.5">
              {currentIndex + 1} / {filteredQuestions.length}
            </Badge>
          </div>
        </div>

        {/* Menu et filtres dépliables */}
        {(showMenu || showFilters) && (
          <div className="px-4 py-2 bg-muted/50 border-b border-border flex-shrink-0">
            {showMenu && (
              <div className="mb-3 p-3 bg-background rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Menu</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowMenu(false)} className="interactive-hover">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push('/')} className="interactive-hover">
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
                  <Button variant="outline" size="sm" onClick={handleReset} className="interactive-hover">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>
            )}

            {showFilters && (
              <div className="p-3 bg-background rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Filtres</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)} className="interactive-hover">
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
                      {Array.from(new Set(questions.map(q => q.questionnaire).filter(Boolean))).sort((a, b) => a - b).map(num => (
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
      </div>

      {/* Contenu principal - Layout moderne pleine largeur */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-5 lg:gap-6 xl:gap-8 px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-5 lg:py-6 xl:py-8 pb-20 sm:pb-24 lg:pb-8 xl:pb-10 min-h-0 overflow-y-auto w-full">
        {/* Image - responsive avec proportions optimales */}
        <div className="w-full lg:w-[45%] xl:w-[48%] flex-shrink-0">
          <Card className="h-[300px] sm:h-[380px] md:h-[450px] lg:h-full card-elegant relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4 sm:p-5 lg:p-6 xl:p-8 h-full flex flex-col">
              {/* Image centrée dans un conteneur flex-1 */}
              <div className="flex-1 flex items-center justify-center relative min-h-0">
                <Image
                  src={getImageUrlSync(currentQuestion.imagePath)}
                  alt={`Question ${currentQuestion.question}`}
                  width={800}
                  height={600}
                  className="max-w-full max-h-full object-contain cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                  onClick={() => setIsImageZoomed(!isImageZoomed)}
                  priority
                />

                {/* Badge principal avec numéro de question */}
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-2xl backdrop-blur-md border border-primary-foreground/30 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="font-black text-base sm:text-xl leading-none">{extractImageNumber(currentQuestion.imagePath) || '?'}/{getTotalQuestionsInQuestionnaire(currentQuestion.questionnaire)}</div>
                </div>

                {/* Badge de notification pour le questionnaire */}
                <div className="badge-questionnaire-absolute text-xs sm:text-sm">
                  {currentQuestion.questionnaire}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overlay de zoom séparé */}
          {isImageZoomed && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setIsImageZoomed(false)}
            >
              <div
                className="max-w-[90vw] max-h-[90vh] flex items-center justify-center relative"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={getImageUrlSync(currentQuestion.imagePath)}
                  alt={`Question ${currentQuestion.question} - Zoom`}
                  width={1200}
                  height={900}
                  className="max-w-full max-h-full object-contain cursor-pointer"
                  onClick={() => setIsImageZoomed(false)}
                />

                {/* Badge avec numéro d'image et questionnaire dans le zoom */}
                <div className="absolute top-2 left-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-2 rounded-full text-sm font-bold shadow-2xl backdrop-blur-md border border-primary-foreground/30 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center gap-2">
                    <div className="font-black text-xl leading-none">{currentQuestion.questionnaire}</div>
                    <div className="text-[11px] opacity-80 font-bold">{extractImageNumber(currentQuestion.imagePath) || '?'}/{getTotalQuestionsInQuestionnaire(currentQuestion.questionnaire)}</div>
                  </div>
                </div>

                {/* Bouton de fermeture */}
                <button
                  className="btn-close-modal"
                  onClick={() => setIsImageZoomed(false)}
                  aria-label="Fermer le zoom"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Question et options - prend l'espace restant */}
        <div className="w-full lg:w-[55%] xl:w-[52%] flex flex-col min-h-0">
          <Card className="flex-1 card-elegant flex flex-col overflow-hidden shadow-lg">
            <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-5 lg:px-6 xl:px-8 pt-4 sm:pt-5 lg:pt-6 xl:pt-8 flex-shrink-0">
              <div className="flex items-start sm:items-center justify-between gap-2 flex-wrap">
                <CardTitle className="text-base sm:text-lg lg:text-xl font-bold">
                  Question {currentQuestion.question}
                </CardTitle>
                <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                  {currentQuestion.categorie && (
                    <Badge variant="secondary" className="text-xs sm:text-sm bg-primary text-primary-foreground px-2 sm:px-3 py-0.5 sm:py-1">
                      {currentQuestion.categorie}
                    </Badge>
                  )}
                  {currentQuestion.astag && (
                    <Badge variant="outline" className="text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1">
                      {currentQuestion.astag}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5 lg:space-y-6 xl:space-y-7 p-4 sm:p-5 lg:p-6 xl:p-8 flex-1 overflow-y-auto">
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-foreground font-medium break-words whitespace-pre-wrap leading-relaxed">
                {currentQuestion.enonce}
              </p>

              <div className="space-y-3 sm:space-y-3.5 lg:space-y-4">
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
                    <div
                      key={option}
                      className={`p-3 sm:p-4 lg:p-5 xl:p-6 rounded-xl lg:rounded-2xl border-2 ${!showFeedback ? 'cursor-pointer' : 'cursor-default'} question-option transition-all duration-200 ${
                        showCorrect
                          ? 'question-option-correct shadow-md'
                          : showIncorrect
                          ? 'question-option-incorrect shadow-md'
                          : isSelected
                          ? 'question-option-selected shadow-lg scale-[1.02]'
                          : 'bg-muted border-border hover:bg-muted/70 hover:border-primary/50 interactive-hover hover:shadow-md hover:scale-[1.01]'
                      }`}
                      onClick={() => !showFeedback && handleAnswerSelect(answerKey)}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 rounded-full flex items-center justify-center text-sm sm:text-base lg:text-lg xl:text-xl font-bold transition-all flex-shrink-0 ${
                          showCorrect
                            ? 'bg-success text-success-foreground shadow-lg'
                            : showIncorrect
                            ? 'bg-destructive text-destructive-foreground shadow-lg'
                            : isSelected
                            ? 'bg-primary text-primary-foreground scale-110 shadow-lg'
                            : 'bg-muted-foreground/10 text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110'
                        }`}>
                          {option}
                        </div>
                        <span className="text-left flex-1 break-words whitespace-pre-wrap text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed">{optionValue}</span>
                        {showFeedback && (
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                            {showCorrect && (
                              <div className="flex items-center gap-1.5 sm:gap-2 text-success">
                                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                                <span className="text-xs sm:text-sm lg:text-base font-semibold hidden sm:inline">Correcte</span>
                              </div>
                            )}
                            {showIncorrect && (
                              <div className="flex items-center gap-1.5 sm:gap-2 text-destructive">
                                <XCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                                <span className="text-xs sm:text-sm lg:text-base font-semibold hidden sm:inline">Incorrect</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {showFeedback && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 lg:p-5 bg-muted/30 rounded-xl border border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      {selectedAnswer === currentQuestion.bonneReponse ? (
                        <span className="text-success font-semibold text-sm sm:text-base lg:text-lg flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                          Réponse correcte
                        </span>
                      ) : (
                        <span className="text-destructive font-semibold text-sm sm:text-base lg:text-lg flex items-center gap-2">
                          <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                          <span className="flex-1">
                            Réponse incorrecte. La bonne réponse était <span className="font-bold">{currentQuestion.bonneReponse.toUpperCase()}</span>.
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation fixe - Design moderne pleine largeur */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border shadow-2xl z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-3 sm:py-4 lg:py-5">
          <div className="flex justify-between gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center justify-center gap-2 sm:gap-3 flex-1 max-w-md h-12 sm:h-14 lg:h-16 xl:h-18 text-sm sm:text-base lg:text-lg xl:text-xl font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
            >
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
              <span className="hidden sm:inline">Précédent</span>
              <span className="sm:hidden">Préc.</span>
            </Button>

            <Button
              onClick={handleNext}
              disabled={currentIndex === filteredQuestions.length - 1}
              className="flex items-center justify-center gap-2 sm:gap-3 flex-1 max-w-md h-12 sm:h-14 lg:h-16 xl:h-18 text-sm sm:text-base lg:text-lg xl:text-xl font-semibold interactive-hover transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg rounded-xl"
            >
              <span className="hidden sm:inline">Suivant</span>
              <span className="sm:hidden">Suiv.</span>
              <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TrainPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    }>
      <TrainPageContent />
    </Suspense>
  )
}
