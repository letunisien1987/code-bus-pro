'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Clock, RotateCcw } from 'lucide-react'

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

interface ExamResult {
  score: number
  total: number
  correct: number
  incorrect: number
  timeSpent: number
  answers: Array<{
    questionId: string
    answer: string
    correct: boolean
  }>
}

export default function ExamPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [examQuestions, setExamQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [state, setState] = useState<'setup' | 'running' | 'finished'>('setup')
  const [result, setResult] = useState<ExamResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviewIndex, setReviewIndex] = useState(0)
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchQuestions()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (state === 'running' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (state === 'running' && timeLeft === 0) {
      finishExam()
    }
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, timeLeft])

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/questions')
      const data = await response.json()
      setQuestions(data)
    } catch (error) {
      console.error('Erreur lors du chargement des questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const startExam = async (questionCount: number) => {
    try {
      // Utiliser la sélection intelligente au lieu du mélange aléatoire
      const response = await fetch('/api/questions/smart-select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'exam',
          count: questionCount
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la sélection des questions')
      }

      const data = await response.json()
      
      if (data.success) {
        setExamQuestions(data.questions)
        setTimeLeft(questionCount * 60) // 1 minute par question
        setState('running')
        setCurrentIndex(0)
        setAnswers({})
        setSelectedAnswer(null)
        
        // Log des métadonnées pour le debug (optionnel)
        console.log('Questions sélectionnées intelligemment:', data.metadata)
      } else {
        throw new Error(data.error || 'Erreur lors de la sélection')
      }
    } catch (error) {
      console.error('Erreur lors de la sélection intelligente, fallback vers sélection aléatoire:', error)
      
      // Fallback vers la sélection aléatoire en cas d'erreur
      const shuffled = [...questions].sort(() => Math.random() - 0.5)
      const selected = shuffled.slice(0, questionCount)
      setExamQuestions(selected)
      setTimeLeft(questionCount * 60)
      setState('running')
      setCurrentIndex(0)
      setAnswers({})
      setSelectedAnswer(null)
    }
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
    setAnswers(prev => ({
      ...prev,
      [examQuestions[currentIndex].id]: answer
    }))
  }

  const handleNext = () => {
    if (currentIndex < examQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(answers[examQuestions[currentIndex + 1].id] || null)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setSelectedAnswer(answers[examQuestions[currentIndex - 1].id] || null)
    }
  }

  const goToQuestion = (index: number) => {
    setCurrentIndex(index)
    const question = examQuestions[index]
    setSelectedAnswer(answers[question.id] || null)
  }

  const toggleMarkForReview = (questionId: string) => {
    const newMarked = new Set(markedForReview)
    if (newMarked.has(questionId)) {
      newMarked.delete(questionId)
    } else {
      newMarked.add(questionId)
    }
    setMarkedForReview(newMarked)
  }

  const finishExam = async () => {
    const correct = examQuestions.filter(q => answers[q.id] === q.bonneReponse).length
    const incorrect = examQuestions.length - correct
    const score = Math.round((correct / examQuestions.length) * 100)
    const timeSpent = (examQuestions.length * 60) - timeLeft

    const examResult: ExamResult = {
      score,
      total: examQuestions.length,
      correct,
      incorrect,
      timeSpent,
      answers: examQuestions.map(q => ({
        questionId: q.id,
        answer: answers[q.id] || '',
        correct: answers[q.id] === q.bonneReponse
      }))
    }

    // Enregistrer toutes les tentatives dans la base de données
    try {
      const savePromises = examQuestions.map(q => {
        const userAnswer = answers[q.id] || ''
        const isCorrect = userAnswer === q.bonneReponse
        
        return fetch('/api/attempts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionId: q.id,
            choix: userAnswer,
            correct: isCorrect
          })
        })
      })

      await Promise.all(savePromises)
      console.log('✅ Toutes les tentatives ont été enregistrées')
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement des tentatives:', error)
    }

    setResult(examResult)
    setState('finished')
  }

  const resetExam = () => {
    setState('setup')
    setExamQuestions([])
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setAnswers({})
    setResult(null)
    setTimeLeft(0)
    setReviewIndex(0)
    setMarkedForReview(new Set())
  }

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (state === 'running') {
        if (e.key === 'a' || e.key === 'A') handleAnswerSelect('a')
        else if (e.key === 'b' || e.key === 'B') handleAnswerSelect('b')
        else if (e.key === 'c' || e.key === 'C') handleAnswerSelect('c')
        else if (e.key === 'd' || e.key === 'D') handleAnswerSelect('d')
        else if (e.key === 'ArrowRight' && currentIndex < examQuestions.length - 1) {
          handleNext()
        } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
          handlePrevious()
        }
      } else if (state === 'finished' && result) {
        if (e.key === 'ArrowRight') {
          setReviewIndex(Math.min(examQuestions.length - 1, reviewIndex + 1))
        } else if (e.key === 'ArrowLeft') {
          setReviewIndex(Math.max(0, reviewIndex - 1))
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, currentIndex, examQuestions.length, reviewIndex, result])

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

  if (state === 'setup') {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Configuration de l&apos;examen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Choisissez le nombre de questions pour votre examen
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => startExam(10)} variant="outline">
                  10 questions
                </Button>
                <Button onClick={() => startExam(20)} variant="outline">
                  20 questions
                </Button>
                <Button onClick={() => startExam(30)} variant="outline">
                  30 questions
                </Button>
                <Button onClick={() => startExam(50)} variant="outline">
                  50 questions
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => router.push('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (state === 'finished' && result) {
    const currentReviewQuestion = examQuestions[reviewIndex]
    const currentAnswer = result.answers.find(a => a.questionId === currentReviewQuestion.id)

    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col">
          {/* Header avec score et navigation */}
          <Card className="m-2 md:m-4 mb-2">
            <CardContent className="p-2 md:p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2 md:mb-3 gap-3 md:gap-0">
                <div className="flex items-center gap-2 md:gap-3">
                  <Button variant="outline" size="sm" onClick={() => router.push('/')}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    <span className="hidden md:inline">Retour</span>
                  </Button>
                  <h1 className="text-base md:text-xl font-bold">Revue de l&apos;examen</h1>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="text-center">
                    <div className="text-xl md:text-3xl font-bold text-accent">{result.score}%</div>
                    <p className="text-xs text-muted-foreground">Score final</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg md:text-2xl font-bold text-success">{result.correct}</div>
                    <p className="text-xs text-muted-foreground">Correctes</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg md:text-2xl font-bold text-destructive">{result.incorrect}</div>
                    <p className="text-xs text-muted-foreground">Incorrectes</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs md:text-sm text-muted-foreground">Question {reviewIndex + 1} sur {examQuestions.length}</span>
                  <div className="flex gap-0.5 md:gap-1">
                    {examQuestions.map((_, index) => (
                      <div
                        key={index}
                        className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
                          result.answers.find(a => a.questionId === examQuestions[index].id)?.correct
                            ? 'bg-success'
                            : 'bg-destructive'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {/* Navigation masquée sur mobile (sera fixe en bas) */}
                <div className="hidden md:flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))}
                    disabled={reviewIndex === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setReviewIndex(Math.min(examQuestions.length - 1, reviewIndex + 1))}
                    disabled={reviewIndex === examQuestions.length - 1}
                  >
                    Suivant
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contenu principal - Layout responsive */}
          <div className="flex-1 flex flex-col md:flex-row mx-2 md:mx-4 mb-20 md:mb-4 gap-4">
            {/* Image - responsive */}
            <div className="w-full md:w-1/2">
              <Card className="h-48 md:h-full">
                <CardContent className="p-2 md:p-4 h-full flex items-center justify-center">
                  <img 
                    src={currentReviewQuestion.imagePath} 
                    alt={`Question ${currentReviewQuestion.question}`}
                    className="max-w-full max-h-48 md:max-h-full object-contain"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Question et réponses - responsive */}
            <div className="w-full md:w-1/2 flex flex-col">
              <Card className="flex-1">
                <CardHeader className="pb-2 md:pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base md:text-lg">
                      Question {currentReviewQuestion.question}
                    </CardTitle>
                    <div className="flex gap-1 md:gap-2">
                      {currentReviewQuestion.categorie && (
                        <Badge variant="secondary" className="text-xs">
                          {currentReviewQuestion.categorie}
                        </Badge>
                      )}
                      {currentReviewQuestion.astag && (
                        <Badge variant="outline" className="text-xs">
                          {currentReviewQuestion.astag}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 md:space-y-4 p-2 md:p-6">
                  <p className="text-sm md:text-base text-foreground font-medium break-words whitespace-pre-wrap">
                    {currentReviewQuestion.enonce}
                  </p>

                  <div className="space-y-1 md:space-y-2">
                    {['A', 'B', 'C', 'D'].map((option, index) => {
                      const optionKey = `option${option}` as keyof Question
                      const optionValue = currentReviewQuestion[optionKey] as string
                      const answerKey = option.toLowerCase()
                      
                      // Ne pas afficher l'option si elle n'existe pas
                      if (!optionValue) return null
                      
                      const isCorrect = answerKey === currentReviewQuestion.bonneReponse
                      const isUserAnswer = currentAnswer?.answer === answerKey
                      const isWrong = isUserAnswer && !isCorrect

                      return (
                        <div
                          key={option}
                          className={`p-2 md:p-3 rounded-lg border-2 ${
                            isCorrect 
                              ? 'question-option-correct' 
                              : isWrong 
                              ? 'question-option-incorrect' 
                              : 'bg-muted border-border'
                          }`}
                        >
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${
                              isCorrect 
                            ? 'bg-emerald text-emerald-foreground'
                            : isWrong
                            ? 'bg-rose text-rose-foreground'
                            : 'bg-muted text-muted-foreground'
                            }`}>
                              {option}
                            </div>
                            <span className="text-left flex-1 break-words whitespace-pre-wrap text-sm md:text-base">{optionValue}</span>
                            <div className="flex items-center gap-1 md:gap-2">
                              {isCorrect && (
                                <div className="flex items-center gap-1 text-emerald">
                                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
                                  <span className="text-xs font-medium">Correcte</span>
                                </div>
                              )}
                              {isWrong && (
                                <div className="flex items-center gap-1 text-rose">
                                  <XCircle className="h-3 w-3 md:h-4 md:w-4" />
                                  <span className="text-xs font-medium">Votre réponse</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Résumé de la réponse */}
                  <div className="mt-2 md:mt-4 p-2 md:p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs md:text-sm font-medium">
                          {currentAnswer?.correct ? (
                            <span className="text-emerald">✓ Réponse correcte</span>
                          ) : (
                            <span className="text-rose">✗ Réponse incorrecte</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Votre réponse : <span className="font-medium">{currentAnswer?.answer.toUpperCase() || 'Non répondue'}</span>
                          {!currentAnswer?.correct && (
                            <span className="ml-2">
                              • Bonne réponse : <span className="font-medium">{currentReviewQuestion.bonneReponse.toUpperCase()}</span>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions - masquées sur mobile */}
              <div className="hidden md:flex justify-between mt-4">
                <Button onClick={resetExam} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Nouvel examen
                </Button>
                <Button onClick={() => router.push('/')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à l&apos;accueil
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation fixe mobile */}
          <div className="fixed md:hidden bottom-0 left-0 right-0 bg-background border-t border-border p-3 z-50">
            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))}
                disabled={reviewIndex === 0}
                className="flex items-center gap-2 flex-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Précédent
              </Button>

              <Button
                onClick={() => setReviewIndex(Math.min(examQuestions.length - 1, reviewIndex + 1))}
                disabled={reviewIndex === examQuestions.length - 1}
                className="flex items-center gap-2 flex-1"
              >
                Suivant
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Actions mobile */}
            <div className="flex gap-2 mt-2">
              <Button onClick={resetExam} variant="outline" className="flex-1 text-xs">
                <RotateCcw className="h-3 w-3 mr-1" />
                Nouvel examen
              </Button>
              <Button onClick={() => router.push('/')} className="flex-1 text-xs">
                <ArrowLeft className="h-3 w-3 mr-1" />
                Accueil
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'running' && examQuestions.length > 0) {
    const currentQuestion = examQuestions[currentIndex]
    const progress = ((currentIndex + 1) / examQuestions.length) * 100
    
    // Calculer le nombre de questions répondues
    const answeredCount = Object.keys(answers).length
    const allAnswered = answeredCount === examQuestions.length

    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col">
          {/* Header avec timer et navigation par numéros */}
          <Card className="sticky top-0 z-40 bg-background shadow-md m-2 md:m-4 mb-2">
            <CardContent className="p-2 md:p-4">
              <div className="flex items-center justify-between">
                {/* Timer à gauche */}
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-accent-foreground" />
                  <span className="font-mono text-sm font-semibold">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                
                {/* Compteur au centre */}
                <Badge variant={allAnswered ? "default" : "secondary"} className="text-xs font-semibold">
                  {answeredCount} / {examQuestions.length}
                </Badge>
                
                {/* Titre masqué sur mobile, visible desktop */}
                <h1 className="hidden md:block text-base md:text-xl font-bold">Examen en cours</h1>
              </div>

              {/* Navigation par numéros de questions */}
              <div className="mt-2 md:mt-3">
                <div className="text-[10px] md:text-xs text-muted-foreground mb-1">
                  Cliquez sur un numéro :
                </div>
                <div className="flex flex-wrap gap-0.5 md:gap-2">
                  {examQuestions.map((q, index) => {
                    const isAnswered = !!answers[q.id]
                    const isMarked = markedForReview.has(q.id)
                    const isCurrent = index === currentIndex
                    
                    return (
                      <button
                        key={q.id}
                        onClick={() => goToQuestion(index)}
                        className={`w-5 h-5 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-sm font-medium transition-all ${
                          isCurrent
                            ? 'ring-1 ring-blue-500 ring-offset-1'
                            : ''
                        } ${
                          isMarked
                            ? 'bg-accent text-accent-foreground hover:bg-accent/80'
                            : isAnswered
                            ? 'bg-emerald text-emerald-foreground hover:bg-emerald/80'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {index + 1}
                      </button>
                    )
                  })}
                </div>
                
                {/* Légende masquée sur mobile */}
                <div className="hidden md:flex gap-4 mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-emerald"></div>
                    <span>Répondue</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-accent"></div>
                    <span>À revoir</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-muted"></div>
                    <span>Non répondue</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contenu principal - Layout responsive */}
          <div className="flex-1 flex flex-col md:flex-row mx-2 md:mx-4 mb-20 md:mb-4 gap-4">
            {/* Image - responsive */}
            <div className="w-full md:w-1/2">
              <Card className="h-48 md:h-full">
                <CardContent className="p-2 md:p-4 h-full flex items-center justify-center">
                  <img 
                    src={currentQuestion.imagePath} 
                    alt={`Question ${currentQuestion.question}`}
                    className="max-w-full max-h-48 md:max-h-full object-contain"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Question et options - responsive */}
            <div className="w-full md:w-1/2 flex flex-col">
              <Card className="flex-1">
                <CardHeader className="pb-2 md:pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base md:text-lg">
                      Question {currentQuestion.question}
                    </CardTitle>
                    <div className="flex gap-1 md:gap-2">
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
                <CardContent className="space-y-2 md:space-y-4 p-2 md:p-6">
                  <p className="text-sm md:text-base text-foreground font-medium break-words whitespace-pre-wrap">
                    {currentQuestion.enonce}
                  </p>

                  <div className="space-y-1 md:space-y-2">
                    {['A', 'B', 'C', 'D'].map((option, index) => {
                      const optionKey = `option${option}` as keyof Question
                      const optionValue = currentQuestion[optionKey] as string
                      const answerKey = option.toLowerCase()
                      
                      // Ne pas afficher l'option si elle n'existe pas
                      if (!optionValue) return null
                      
                      const isSelected = selectedAnswer === answerKey

                      return (
                        <Button
                          key={option}
                          variant={isSelected ? "default" : "outline"}
                          className={`w-full justify-start h-auto p-2 md:p-3 ${
                            isSelected ? 'bg-secondary/10 border-secondary text-secondary-foreground' : 'hover:bg-muted/30'
                          }`}
                          onClick={() => handleAnswerSelect(answerKey)}
                        >
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${
                              isSelected ? 'bg-purple text-purple-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                              {option}
                            </div>
                            <span className="text-xs md:text-sm text-left break-words whitespace-pre-wrap">{optionValue}</span>
                          </div>
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Bouton marquer pour révision - Version desktop */}
              <div className="hidden md:block mt-2 md:mt-4">
                <Button 
                  variant="outline"
                  onClick={() => toggleMarkForReview(currentQuestion.id)}
                  className={`w-full text-xs md:text-sm ${
                    markedForReview.has(currentQuestion.id)
                      ? 'bg-accent/10 border-accent text-accent-foreground hover:bg-accent/20'
                      : 'hover:bg-muted/30'
                  }`}
                >
                  {markedForReview.has(currentQuestion.id) ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marquée pour révision
                    </>
                  ) : (
                    <>
                      <span className="text-accent-foreground mr-2">⚠️</span>
                      Marquer pour révision
                    </>
                  )}
                </Button>
              </div>

              {/* Navigation - masquée sur mobile (sera fixe en bas) */}
              <div className="hidden md:flex justify-between mt-4">
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
                  disabled={currentIndex === examQuestions.length - 1}
                  className="flex items-center gap-2"
                >
                  Suivant
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Bouton finir l'examen - Visible seulement si toutes les questions sont répondues */}
              {allAnswered && (
                <div className="hidden md:block mt-4 text-center">
                  <Button 
                    onClick={finishExam}
                    className="w-full bg-accent hover:bg-accent/80 text-accent-foreground"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Terminer l&apos;examen
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation fixe mobile */}
          <div className="fixed md:hidden bottom-0 left-0 right-0 bg-background border-t border-border p-3 z-50">
            <div className="flex justify-between gap-2">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 flex-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Précédent
              </Button>
              
              <Button 
                onClick={handleNext}
                disabled={currentIndex === examQuestions.length - 1}
                className="flex items-center gap-2 flex-1"
              >
                Suivant
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Bouton terminer l'examen mobile */}
            {allAnswered && (
              <div className="mt-2">
                <Button 
                  onClick={finishExam}
                  className="w-full bg-primary hover:bg-primary/80 text-primary-foreground"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Terminer l&apos;examen
                </Button>
              </div>
            )}
          </div>

          {/* Version mobile - bouton flottant pour marquer les questions */}
          <button
            onClick={() => toggleMarkForReview(currentQuestion.id)}
            className={`md:hidden fixed bottom-20 right-4 z-30 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
              markedForReview.has(currentQuestion.id)
                ? 'bg-accent text-accent-foreground'
                : 'bg-background text-accent-foreground border-2 border-accent'
            }`}
            aria-label="Marquer pour révision"
          >
            {markedForReview.has(currentQuestion.id) ? (
              <CheckCircle className="h-6 w-6" />
            ) : (
              <span className="text-2xl">⚠️</span>
            )}
          </button>
        </div>
      </div>
    )
  }

  return null
}