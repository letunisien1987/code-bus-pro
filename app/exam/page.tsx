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
  }, [state, currentIndex, examQuestions.length, reviewIndex, result])

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

  if (state === 'setup') {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Configuration de l'examen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
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
      <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col">
          {/* Header avec score et navigation */}
          <Card className="m-4 mb-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={() => router.push('/')}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Retour
                  </Button>
                  <h1 className="text-xl font-bold">Revue de l'examen</h1>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{result.score}%</div>
                    <p className="text-xs text-gray-600">Score final</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{result.correct}</div>
                    <p className="text-xs text-gray-600">Correctes</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{result.incorrect}</div>
                    <p className="text-xs text-gray-600">Incorrectes</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Question {reviewIndex + 1} sur {examQuestions.length}</span>
                  <div className="flex gap-1">
                    {examQuestions.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          result.answers.find(a => a.questionId === examQuestions[index].id)?.correct
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
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

          {/* Contenu principal - Layout côte à côte */}
          <div className="flex-1 flex mx-4 mb-4 gap-4">
            {/* Image - 50% */}
            <div className="w-1/2">
              <Card className="h-full">
                <CardContent className="p-4 h-full flex items-center justify-center">
                  <img 
                    src={currentReviewQuestion.imagePath} 
                    alt={`Question ${currentReviewQuestion.question}`}
                    className="max-w-full max-h-full object-contain"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Question et réponses - 50% */}
            <div className="w-1/2 flex flex-col">
              <Card className="flex-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Question {currentReviewQuestion.question}
                    </CardTitle>
                    <div className="flex gap-2">
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
                <CardContent className="space-y-4">
                  <p className="text-gray-700 font-medium break-words whitespace-pre-wrap">
                    {currentReviewQuestion.enonce}
                  </p>

                  <div className="space-y-2">
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
                          className={`p-3 rounded-lg border-2 ${
                            isCorrect 
                              ? 'bg-green-50 border-green-500' 
                              : isWrong 
                              ? 'bg-red-50 border-red-500' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                              isCorrect 
                                ? 'bg-green-500 text-white' 
                                : isWrong 
                                ? 'bg-red-500 text-white' 
                                : 'bg-gray-200 text-gray-700'
                            }`}>
                              {option}
                            </div>
                            <span className="text-left flex-1 break-words whitespace-pre-wrap">{optionValue}</span>
                            <div className="flex items-center gap-2">
                              {isCorrect && (
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="text-xs font-medium">Correcte</span>
                                </div>
                              )}
                              {isWrong && (
                                <div className="flex items-center gap-1 text-red-600">
                                  <XCircle className="h-4 w-4" />
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
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {currentAnswer?.correct ? (
                            <span className="text-green-600">✓ Réponse correcte</span>
                          ) : (
                            <span className="text-red-600">✗ Réponse incorrecte</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
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

              {/* Actions */}
              <div className="flex justify-between mt-4">
                <Button onClick={resetExam} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Nouvel examen
                </Button>
                <Button onClick={() => router.push('/')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à l'accueil
                </Button>
              </div>
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
      <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col">
          {/* Header avec timer et navigation par numéros */}
          <Card className="m-4 mb-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold">Examen en cours</h1>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="font-mono text-lg">
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <Badge variant={allAnswered ? "default" : "secondary"}>
                    {answeredCount} / {examQuestions.length} répondues
                  </Badge>
                </div>
              </div>

              {/* Navigation par numéros de questions */}
              <div className="mt-3">
                <div className="text-xs text-gray-600 mb-2">Cliquez sur un numéro pour aller à cette question :</div>
                <div className="flex flex-wrap gap-2">
                  {examQuestions.map((q, index) => {
                    const isAnswered = !!answers[q.id]
                    const isMarked = markedForReview.has(q.id)
                    const isCurrent = index === currentIndex
                    
                    return (
                      <button
                        key={q.id}
                        onClick={() => goToQuestion(index)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                          isCurrent
                            ? 'ring-2 ring-blue-500 ring-offset-2'
                            : ''
                        } ${
                          isMarked
                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                            : isAnswered
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                      >
                        {index + 1}
                      </button>
                    )
                  })}
                </div>
                
                {/* Légende */}
                <div className="flex gap-4 mt-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span>Répondue</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                    <span>À revoir</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                    <span>Non répondue</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contenu principal - Layout côte à côte */}
          <div className="flex-1 flex mx-4 mb-4 gap-4">
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
                      
                      // Ne pas afficher l'option si elle n'existe pas
                      if (!optionValue) return null
                      
                      const isSelected = selectedAnswer === answerKey

                      return (
                        <Button
                          key={option}
                          variant={isSelected ? "default" : "outline"}
                          className={`w-full justify-start h-auto p-3 ${
                            isSelected ? 'bg-blue-100 border-blue-500 text-blue-700' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleAnswerSelect(answerKey)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                              isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                            }`}>
                              {option}
                            </div>
                            <span className="text-left break-words whitespace-pre-wrap">{optionValue}</span>
                          </div>
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Bouton marquer pour révision */}
              <div className="mt-4">
                <Button 
                  variant="outline"
                  onClick={() => toggleMarkForReview(currentQuestion.id)}
                  className={`w-full ${
                    markedForReview.has(currentQuestion.id)
                      ? 'bg-orange-100 border-orange-500 text-orange-700 hover:bg-orange-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {markedForReview.has(currentQuestion.id) ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marquée pour révision
                    </>
                  ) : (
                    <>
                      <span className="text-orange-500 mr-2">⚠️</span>
                      Marquer pour révision
                    </>
                  )}
                </Button>
              </div>

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
                  disabled={currentIndex === examQuestions.length - 1}
                  className="flex items-center gap-2"
                >
                  Suivant
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Bouton finir l'examen - Visible seulement si toutes les questions sont répondues */}
              {allAnswered && (
                <div className="mt-4 text-center">
                  <Button 
                    onClick={finishExam}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Terminer l'examen
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}