'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs'
import { ThemeToggle } from '../../components/theme-toggle'
import { ArrowLeft, ArrowRight, CheckCircle, Clock, RotateCcw, LogOut, ChevronLeft, ChevronRight, XCircle } from 'lucide-react'
import { getImageUrlSync } from '@/lib/blob-helper'

// Fonction de calcul du score de performance
function calculatePerformanceScore(correct: number, total: number, timeSpent: number) {
  // Score de justesse (70% du total = 700 points)
  const accuracyScore = Math.round((correct / total) * 700)
  
  // Calcul du temps moyen par question
  const avgTimePerQuestion = timeSpent / total
  
  // Bonus de vitesse (30% du total = 300 points)
  let speedBonus = 0
  if (avgTimePerQuestion <= 30) {
    speedBonus = 300 // Éclair
  } else if (avgTimePerQuestion <= 45) {
    speedBonus = 200 // Rapide
  } else if (avgTimePerQuestion <= 60) {
    speedBonus = 100 // Normal
  }
  // Sinon 0 (Lent)
  
  // Score final
  const performanceScore = accuracyScore + speedBonus
  
  // Badge
  let performanceBadge: 'gold' | 'silver' | 'bronze' | 'standard'
  if (performanceScore >= 900) {
    performanceBadge = 'gold'
  } else if (performanceScore >= 800) {
    performanceBadge = 'silver'
  } else if (performanceScore >= 700) {
    performanceBadge = 'bronze'
  } else {
    performanceBadge = 'standard'
  }
  
  return {
    performanceScore,
    accuracyScore,
    speedBonus,
    avgTimePerQuestion: Math.round(avgTimePerQuestion),
    performanceBadge
  }
}

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

interface ExamHistoryEntry {
  id: string
  userId: string
  score: number
  percentage: number
  total: number
  correct: number
  incorrect: number
  timeSpent: number // en secondes
  // NOUVEAUX CHAMPS
  performanceScore?: number  // Score sur 1000
  accuracyScore?: number     // Score de justesse (700 max)
  speedBonus?: number        // Bonus de vitesse (300 max)
  avgTimePerQuestion?: number // Temps moyen par question en secondes
  performanceBadge?: 'gold' | 'silver' | 'bronze' | 'standard'
  completedAt: string // ISO date
  answers: Array<{
    questionId: string
    answer: string
    correct: boolean
  }>
}

// Composant pour afficher l'historique des examens
function ExamHistoryView({ history, onExamClick, questions }: { history: ExamHistoryEntry[], onExamClick: (exam: ExamHistoryEntry) => void, questions: Question[] }) {
  if (history.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-sm md:text-base text-muted-foreground">
          Aucun examen terminé pour le moment
        </p>
      </div>
    )
  }

  const chartData = history.slice(0, 8).reverse().map((exam, index) => ({
    index: index + 1,
    percentage: exam.percentage,
    performanceScore: exam.performanceScore || 0,
    passed: exam.percentage >= 90
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Graphique de progression */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-sm md:text-base">Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 relative">
            {/* Axe Y avec typographie responsive */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground">
              <span>100%</span>
              <span>80%</span>
              <span>60%</span>
              <span>40%</span>
              <span>20%</span>
              <span>0%</span>
            </div>
            
            {/* Ligne objectif 90% - utiliser couleur info du theme */}
            <div className="absolute left-12 right-0 top-[10%] border-t-2 border-info border-dashed">
              <span className="text-xs text-info ml-2">But</span>
            </div>
            
            {/* Barres - utiliser couleurs semantiques du theme */}
            <div className="absolute left-12 right-0 top-0 bottom-8 flex items-end justify-around gap-2">
              {chartData.map((data) => {
                // Calculer la hauteur en pixels (h-64 = 256px, moins 32px pour les labels = 224px)
                const maxHeight = 224
                const barHeight = Math.max((data.percentage / 100) * maxHeight, 4) // Minimum 4px pour visibilité
                
                return (
                  <div key={data.index} className="flex-1 flex flex-col items-center">
                    <div 
                      className={`w-full rounded-t transition-all ${
                        data.percentage >= 95 ? 'bg-success dark:bg-success' :
                        data.percentage >= 90 ? 'bg-success/80 dark:bg-success/80' :
                        data.percentage >= 80 ? 'bg-warning dark:bg-warning' :
                        'bg-destructive dark:bg-destructive'
                      }`}
                      style={{ height: `${barHeight}px` }}
                    />
                    <span className="text-xs mt-2 text-foreground">{data.index}</span>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Légende pour le score de performance */}
          <div className="text-xs text-muted-foreground mt-2 flex gap-4">
            <span>📊 Pourcentage de réussite</span>
            <span>⭐ Score de performance (sur 1000)</span>
          </div>
        </CardContent>
      </Card>

      {/* Grille de resultats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.map((exam) => (
          <ExamHistoryCard key={exam.id} exam={exam} onExamClick={onExamClick} questions={questions} />
        ))}
      </div>
    </div>
  )
}

// Composant pour afficher une carte d'examen dans l'historique
function ExamHistoryCard({ exam, onExamClick, questions }: { exam: ExamHistoryEntry, onExamClick: (exam: ExamHistoryEntry) => void, questions: Question[] }) {
  const getResultMessage = (percentage: number) => {
    if (percentage >= 95) return 'Résultat fantastique!'
    if (percentage >= 90) return 'Félicitations, tu as réussi'
    if (percentage >= 80) return 'Tu as échoué, travaille plus!'
    if (percentage >= 60) return 'Raté, plus d\'efforts!'
    return 'Raté, plus d\'efforts!'
  }

  const getBadgeVariant = (percentage: number): 'default' | 'secondary' | 'destructive' => {
    if (percentage >= 90) return 'default' // Utilisera bg-primary (jaune)
    if (percentage >= 80) return 'secondary'
    return 'destructive'
  }

  const getBackgroundImage = (percentage: number) => {
    return percentage >= 90 
      ? '/images/succes.jpg' 
      : '/images/bus1.jpg'
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  }

  const getBadgeIcon = (badge: string) => {
    switch(badge) {
      case 'gold': return '🥇'
      case 'silver': return '🥈'
      case 'bronze': return '🥉'
      default: return '⭐'
    }
  }
  
  const getSpeedLabel = (avgTime: number) => {
    if (avgTime <= 30) return 'Éclair ⚡'
    if (avgTime <= 45) return 'Rapide 🚀'
    if (avgTime <= 60) return 'Normal ⏱️'
    return 'Lent 🐢'
  }

  // Vérifier si les questions sont encore disponibles
  const questionsAvailable = exam.answers.some(answer => 
    questions.find(q => q.id === answer.questionId)
  )

  return (
    <Card 
      className={`overflow-hidden transition-all border-2 border-transparent ${
        questionsAvailable 
          ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02] interactive-hover hover:border-primary' 
          : 'cursor-not-allowed opacity-60'
      }`}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (questionsAvailable) {
          console.log('Clic sur la carte d\'examen:', exam.id)
          onExamClick(exam)
        }
      }}
    >
      <div className="relative h-40">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${getBackgroundImage(exam.percentage)})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 dark:from-black/80 dark:to-black/40" />
        
        {/* Badge de performance */}
        {exam.performanceBadge && (
          <div className="absolute top-2 left-2 bg-background/90 px-2 py-1 rounded text-lg">
            {getBadgeIcon(exam.performanceBadge)}
          </div>
        )}
        
        <Badge 
          variant={getBadgeVariant(exam.percentage)}
          className="absolute top-2 right-2"
        >
          {Math.round(exam.percentage)}%
        </Badge>
        
        {!questionsAvailable && (
          <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs">
            Détails non disponibles
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold mb-2 text-sm md:text-base text-foreground">
          {getResultMessage(exam.percentage)}
        </h3>
        
        {/* Affichage du score de performance */}
        {exam.performanceScore !== undefined && (
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">
                {exam.performanceScore}
              </span>
              <span className="text-xs text-muted-foreground">/1000 pts</span>
            </div>
            <div className="flex gap-2 text-xs text-muted-foreground mt-1">
              <span>Justesse: {exam.accuracyScore}/700</span>
              <span>•</span>
              <span>Vitesse: {exam.speedBonus}/300</span>
            </div>
          </div>
        )}
        
        <p className="text-xs md:text-sm text-muted-foreground">
          Score {exam.score} | {formatDuration(exam.timeSpent)}
          {exam.avgTimePerQuestion && ` (${exam.avgTimePerQuestion}s/q)`}
          {' | '}{formatDate(exam.completedAt)}
        </p>
        
        {exam.avgTimePerQuestion && (
          <p className="text-xs text-muted-foreground mt-1">
            {getSpeedLabel(exam.avgTimePerQuestion)}
          </p>
        )}
        
        {questionsAvailable && (
          <p className="text-xs text-primary mt-2 cursor-pointer hover:underline">
            Cliquez pour voir les détails
          </p>
        )}
      </CardContent>
    </Card>
  )
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
  const [activeTab, setActiveTab] = useState<'setup' | 'history'>('history') // Par défaut sur l'historique
  const [examHistory, setExamHistory] = useState<ExamHistoryEntry[]>([])
  const [result, setResult] = useState<ExamResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviewIndex, setReviewIndex] = useState(0)
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set())
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [isManualPageChange, setIsManualPageChange] = useState(false)
  const [isImageZoomed, setIsImageZoomed] = useState(false)
  const [examStartTime, setExamStartTime] = useState<number | null>(null)
  const [showRestorePrompt, setShowRestorePrompt] = useState(false)
  const [savedExamState, setSavedExamState] = useState<any>(null)

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
  
  // Charger l'historique des examens
  useEffect(() => {
    if (activeTab === 'history') {
      fetch('/api/exam-history')
        .then(res => res.json())
        .then(data => setExamHistory(data.history || []))
        .catch(err => console.error('Erreur chargement historique:', err))
    }
  }, [activeTab])

  // Réinitialiser le zoom quand on change de question
  useEffect(() => {
    setIsImageZoomed(false)
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

  // Fonction de sauvegarde avec useCallback
  const saveExamState = useCallback(() => {
    if (state === 'running') {
      const examState = {
        examQuestions: examQuestions.map(q => ({
          id: q.id,
          questionnaire: q.questionnaire,
          question: q.question,
          categorie: q.categorie,
          imagePath: q.imagePath,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          bonneReponse: q.bonneReponse
        })),
        currentIndex,
        answers,
        timeLeft,
        totalTime: examStartTime ? (Date.now() - examStartTime) / 1000 : 0,
        markedForReview: Array.from(markedForReview),
        startTime: examStartTime,
        savedAt: Date.now()
      }
      localStorage.setItem('exam_state', JSON.stringify(examState))
    }
  }, [state, examQuestions, currentIndex, answers, timeLeft, examStartTime, markedForReview])

  // Sauvegarde automatique sur événements
  useEffect(() => {
    if (state === 'running' && Object.keys(answers).length > 0) {
      saveExamState()
    }
  }, [answers, saveExamState, state])

  useEffect(() => {
    if (state === 'running' && markedForReview.size > 0) {
      saveExamState()
    }
  }, [markedForReview, saveExamState, state])

  useEffect(() => {
    if (state === 'running') {
      saveExamState()
    }
  }, [currentIndex, saveExamState, state])

  useEffect(() => {
    if (state === 'running') {
      saveExamState()
    }
  }, [state, saveExamState])

  // Protections contre les sorties accidentelles
  useEffect(() => {
    if (state === 'running') {
      window.history.pushState(null, '', window.location.href)
      
      const handlePopState = () => {
        window.history.pushState(null, '', window.location.href)
        // Pas de confirmation, juste empêcher le retour
        // L'examen est sauvegardé automatiquement
      }
      
      window.addEventListener('popstate', handlePopState)
      return () => window.removeEventListener('popstate', handlePopState)
    }
  }, [state])

  useEffect(() => {
    if (state === 'running') {
      const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        event.preventDefault()
        event.returnValue = 'Votre examen sera automatiquement sauvegardé. Vous pourrez le reprendre à tout moment.'
        return event.returnValue
      }
      
      window.addEventListener('beforeunload', handleBeforeUnload)
      return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [state])

  useEffect(() => {
    if (state === 'running') {
      const handleKeyDown = (event: KeyboardEvent) => {
        // Bloquer F5 et Ctrl+R mais permettre le rechargement
        if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
          // L'examen sera sauvegardé et rechargé
          return true
        }
      }
      
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [state])
  
  // Type et état pour les filtres de questions
  type QuestionFilter = 'all' | 'answered' | 'review' | 'unanswered'
  const [questionFilter, setQuestionFilter] = useState<QuestionFilter>('all')

  useEffect(() => {
    const initializeExam = async () => {
      await fetchQuestions()
      
      // Vérifier s'il y a un examen sauvegardé immédiatement au chargement
      const saved = restoreExamState()
      if (saved) {
        setSavedExamState(saved)
        setShowRestorePrompt(true)
      }
      setLoading(false)
    }
    
    initializeExam()
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

  // Fonction utilitaire pour calculer la pagination - Toujours 10 par page
  const getQuestionsPerPage = (totalQuestions: number, isMobile: boolean) => {
    return 10 // Toujours 10 questions par page
  }

  // Naviguer automatiquement à la page contenant la question actuelle SEULEMENT quand currentIndex change
  useEffect(() => {
    if (examQuestions.length === 0 || isManualPageChange) return
    
    const answeredIds = new Set(Object.keys(answers))
    const reviewIds = markedForReview

    const filteredQuestions = examQuestions.filter((q) => {
      if (questionFilter === 'all') return true
      if (questionFilter === 'answered') return answeredIds.has(q.id)
      if (questionFilter === 'review') return reviewIds.has(q.id)
      return !answeredIds.has(q.id)
    })

    if (filteredQuestions.length === 0) return
    
    const currentQuestionId = examQuestions[currentIndex]?.id
    const filteredIndex = filteredQuestions.findIndex(q => q.id === currentQuestionId)
    
    // Si la question courante n'est pas dans le filtre, ne rien faire
    if (filteredIndex === -1) return
    
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const perPage = getQuestionsPerPage(filteredQuestions.length, isMobile)
    const questionPage = Math.floor(filteredIndex / perPage)
    
    // Changer de page seulement si nécessaire
    if (questionPage !== currentPage && questionPage >= 0) {
      setCurrentPage(questionPage)
    }
  }, [currentIndex, examQuestions, isManualPageChange, answers, markedForReview, questionFilter, currentPage])

  // Reset du flag de changement manuel après un délai
  useEffect(() => {
    if (isManualPageChange) {
      const timer = setTimeout(() => setIsManualPageChange(false), 200)
      return () => clearTimeout(timer)
    }
  }, [isManualPageChange])

  // Réinitialiser la page quand le filtre change
  useEffect(() => {
    setCurrentPage(0)
    setIsManualPageChange(false)
  }, [questionFilter])


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
      const response = await fetch('/api/questions', {
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
        setExamStartTime(Date.now()) // Enregistrer l'heure de début
        
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

    // Sauvegarder dans l'historique
    try {
      const performanceData = calculatePerformanceScore(
        examResult.correct,
        examResult.total,
        examResult.timeSpent
      )

      const examData = {
        score: examResult.score,
        percentage: (examResult.correct / examResult.total) * 100,
        total: examResult.total,
        correct: examResult.correct,
        incorrect: examResult.incorrect,
        timeSpent: examResult.timeSpent,
        answers: examResult.answers,
        // NOUVEAUX CHAMPS
        ...performanceData
      }

      await fetch('/api/exam-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examData)
      })
      console.log('✅ Examen sauvegardé dans l\'historique')
    } catch (error) {
      console.error('❌ Erreur sauvegarde historique:', error)
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
    clearExamState() // Supprimer la sauvegarde
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
    setExamStartTime(null)
  }

  // Fonctions de sauvegarde et restauration

  const restoreExamState = () => {
    const saved = localStorage.getItem('exam_state')
    if (saved) {
      try {
        const examState = JSON.parse(saved)
        return examState
      } catch (e) {
        return null
      }
    }
    return null
  }

  const clearExamState = () => {
    localStorage.removeItem('exam_state')
  }

  const handleRestoreExam = () => {
    if (!savedExamState) return
    
    // Restaurer toutes les questions avec leurs données complètes
    setExamQuestions(savedExamState.examQuestions)
    setCurrentIndex(savedExamState.currentIndex)
    setAnswers(savedExamState.answers)
    setTimeLeft(savedExamState.timeLeft)
    setMarkedForReview(new Set(savedExamState.markedForReview))
    setExamStartTime(savedExamState.startTime)
    setState('running')
    setShowRestorePrompt(false)
  }

  const handleNewExam = () => {
    clearExamState()
    setSavedExamState(null)
    setShowRestorePrompt(false)
    // L'utilisateur peut maintenant choisir le nombre de questions
    // L'état reste en 'setup' pour permettre la sélection
  }

  const getExamStats = () => {
    if (!savedExamState) return null
    
    const totalQuestions = savedExamState.examQuestions.length
    const answeredQuestions = Object.keys(savedExamState.answers).length
    const timeSpentSeconds = savedExamState.totalTime
    const timeSpentMinutes = Math.floor(timeSpentSeconds / 60)
    const startDate = new Date(savedExamState.startTime)
    
    return {
      totalQuestions,
      answeredQuestions,
      unansweredQuestions: totalQuestions - answeredQuestions,
      timeSpentMinutes,
      timeSpentSeconds: Math.floor(timeSpentSeconds % 60),
      startDate: startDate.toLocaleDateString('fr-FR'),
      startTime: startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      markedCount: savedExamState.markedForReview.length
    }
  }

  const handleExitExam = () => {
    setShowExitConfirm(true)
  }

  const confirmExitExam = () => {
    // NE PLUS appeler clearExamState() ici
    // L'examen reste sauvegardé par défaut
    // NE PLUS appeler resetExam() non plus pour garder la sauvegarde
    setShowExitConfirm(false)
    router.push('/')
  }

  const abandonExam = () => {
    clearExamState() // Supprimer la sauvegarde
    resetExam()
    setShowExitConfirm(false)
    router.push('/')
  }

  const cancelExitExam = () => {
    setShowExitConfirm(false)
  }

  // Fonction pour détecter si le contenu est scrollable et si on n'est pas en bas
  const checkScrollable = () => {
    const mainContent = document.querySelector('.exam-main-content')
    if (mainContent) {
      const isScrollable = mainContent.scrollHeight > mainContent.clientHeight
      const isAtBottom = mainContent.scrollTop + mainContent.clientHeight >= mainContent.scrollHeight - 20 // 20px de tolérance
      setShowScrollIndicator(isScrollable && !isAtBottom)
    }
  }

  // Vérifier le scroll au chargement et au redimensionnement
  useEffect(() => {
    // Attendre que le DOM soit mis à jour
    const timer = setTimeout(() => {
      checkScrollable()
    }, 100)
    
    const mainContent = document.querySelector('.exam-main-content')
    
    // Ajouter listener pour le scroll
    if (mainContent) {
      mainContent.addEventListener('scroll', checkScrollable)
    }
    
    window.addEventListener('resize', checkScrollable)
    return () => {
      clearTimeout(timer)
      if (mainContent) {
        mainContent.removeEventListener('scroll', checkScrollable)
      }
      window.removeEventListener('resize', checkScrollable)
    }
  }, [examQuestions, currentIndex, reviewIndex])

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

  // Barre de navigation
  const NavigationBar = () => (
    <nav className="bg-background border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Retour</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Tableau de bord
            </button>
            <button
              onClick={() => router.push('/train')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Entraînement
            </button>
            <button
              onClick={() => router.push('/achievements')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Trophées
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )

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

  // Afficher un écran de chargement si on vérifie la sauvegarde
  if (state === 'setup' && loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (state === 'setup') {
    return (
      <div className="min-h-screen bg-background">
        <NavigationBar />
        <div className="pb-20 md:pb-0">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'setup' | 'history')}>
          <div className="bg-card border-b">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between">
                {/* Titre principal */}
                <div className="flex flex-col">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    Mes Examens
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Consultez votre historique et commencez un nouveau test
                  </p>
                </div>
                
                {/* Bouton Nouveau test stylé à droite */}
                <Button
                  onClick={() => setActiveTab('setup')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  <span>Nouveau test</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <TabsContent value="setup" className="mt-0">
            <div className="h-screen bg-background flex items-center justify-center">
              <Card className="w-full max-w-md card-elegant">
                <CardHeader>
                  <CardTitle className="text-center">Configuration de l&apos;examen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">
                      Choisissez le nombre de questions pour votre examen
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={() => startExam(10)} variant="outline" className="interactive-hover">
                        10 questions
                      </Button>
                      <Button onClick={() => startExam(20)} variant="outline" className="interactive-hover">
                        20 questions
                      </Button>
                      <Button onClick={() => startExam(30)} variant="outline" className="interactive-hover">
                        30 questions
                      </Button>
                      <Button onClick={() => startExam(50)} variant="outline" className="interactive-hover">
                        50 questions
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Button variant="outline" onClick={() => router.push('/')} className="interactive-hover">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Retour
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Modal de reprise d'examen */}
              {showRestorePrompt && savedExamState && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <Card className="w-full max-w-lg card-elegant">
                    <CardHeader>
                      <CardTitle className="text-center text-xl">
                        Examen en cours détecté
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <p className="text-sm font-medium text-center mb-3">
                          Vous avez un examen non terminé. Voulez-vous le reprendre ?
                        </p>
                        
                        {(() => {
                          const stats = getExamStats()
                          if (!stats) return null
                          
                          return (
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="bg-background rounded p-2">
                                <div className="text-muted-foreground text-xs">Questions répondues</div>
                                <div className="font-bold text-lg text-primary">
                                  {stats.answeredQuestions} / {stats.totalQuestions}
                                </div>
                              </div>
                              
                              <div className="bg-background rounded p-2">
                                <div className="text-muted-foreground text-xs">Questions restantes</div>
                                <div className="font-bold text-lg">
                                  {stats.unansweredQuestions}
                                </div>
                              </div>
                              
                              <div className="bg-background rounded p-2">
                                <div className="text-muted-foreground text-xs">Temps passé</div>
                                <div className="font-bold text-lg">
                                  {stats.timeSpentMinutes}min {stats.timeSpentSeconds}s
                                </div>
                              </div>
                              
                              <div className="bg-background rounded p-2">
                                <div className="text-muted-foreground text-xs">Marquées pour révision</div>
                                <div className="font-bold text-lg text-primary">
                                  {stats.markedCount}
                                </div>
                              </div>
                              
                              <div className="bg-background rounded p-2 col-span-2">
                                <div className="text-muted-foreground text-xs">Début de l&apos;examen</div>
                                <div className="font-bold">
                                  {stats.startDate} à {stats.startTime}
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button 
                          onClick={handleRestoreExam}
                          className="w-full h-12 text-base"
                        >
                          Reprendre l&apos;examen
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={handleNewExam}
                          className="w-full"
                        >
                          Commencer un nouvel examen
                        </Button>
                      </div>
                      
                      <p className="text-xs text-muted-foreground text-center">
                        Si vous commencez un nouvel examen, l&apos;examen en cours sera définitivement perdu.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <ExamHistoryView 
              history={examHistory} 
              questions={questions}
              onExamClick={(exam) => {
                console.log('onExamClick appelé avec:', exam.id)
                // Récupérer les questions correspondantes à cet examen
                const examQuestionsFromHistory = exam.answers.map(answer => 
                  questions.find(q => q.id === answer.questionId)
                ).filter(Boolean) as Question[]
                
                // Si on ne peut pas récupérer les questions, afficher un message
                if (examQuestionsFromHistory.length === 0) {
                  alert('Les détails de cet examen ne sont plus disponibles. Vous pouvez recommencer un nouvel examen.')
                  return
                }
                
                // Simuler un résultat d'examen terminé
                const examResult: ExamResult = {
                  score: exam.score,
                  correct: exam.correct,
                  incorrect: exam.incorrect,
                  total: exam.total,
                  timeSpent: exam.timeSpent,
                  answers: exam.answers
                }
                
                setExamQuestions(examQuestionsFromHistory)
                setResult(examResult)
                setState('finished')
                setReviewIndex(0)
                console.log('Redirection vers la page de révision des résultats')
              }}
            />
          </TabsContent>
        </Tabs>
        </div>
      </div>
    )
  }

  if (state === 'finished' && result) {
    const currentReviewQuestion = examQuestions[reviewIndex]
    const currentAnswer = result.answers.find(a => a.questionId === currentReviewQuestion.id)

    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <NavigationBar />
        <div className="flex-1 flex flex-col">
          {/* Header avec score et navigation */}
          <Card className="m-2 md:m-4 mb-2 card-elegant">
            <CardContent className="p-2 md:p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2 md:mb-3 gap-3 md:gap-0">
                <div className="flex items-center gap-2 md:gap-3">
                  <Button variant="outline" size="sm" onClick={() => router.push('/')} className="interactive-hover">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    <span className="hidden md:inline">Retour</span>
                  </Button>
                  <h1 className="text-base md:text-xl font-bold">Revue de l&apos;examen</h1>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="text-center">
                    <div className="text-xl md:text-3xl font-bold text-primary">{result.score}%</div>
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
              </div>
            </CardContent>
          </Card>

          {/* Contenu principal - Layout responsive */}
          <div className="flex-1 flex flex-col md:flex-row mx-2 md:mx-4 pb-20 md:pb-24 gap-4">
            {/* Image - responsive */}
            <div className="w-full md:w-1/2">
              <Card className="h-64 md:h-full card-elegant relative">
                <CardContent className="p-2 md:p-4 h-full flex items-center justify-center">
                  <Image 
                    src={getImageUrlSync(currentReviewQuestion.imagePath)} 
                    alt={`Question ${currentReviewQuestion.question}`}
                    width={800}
                    height={600}
                    className="max-w-full max-h-60 md:max-h-full object-contain cursor-pointer transition-all duration-300"
                    onClick={() => setIsImageZoomed(!isImageZoomed)}
                  />
                  
                  {/* Badge principal avec numéro de question */}
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-2 rounded-full text-sm font-bold shadow-2xl backdrop-blur-md border border-primary-foreground/30 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                    <div className="font-black text-xl leading-none">{extractImageNumber(currentReviewQuestion.imagePath) || '?'}/{getTotalQuestionsInQuestionnaire(currentReviewQuestion.questionnaire)}</div>
                  </div>
                  
                  {/* Badge de notification pour le questionnaire (position sûre) */}
                  <div className="badge-questionnaire-absolute">
                    {currentReviewQuestion.questionnaire}
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
                      src={getImageUrlSync(currentReviewQuestion.imagePath)} 
                      alt={`Question ${currentReviewQuestion.question} - Zoom`}
                      width={1200}
                      height={900}
                      className="max-w-full max-h-full object-contain cursor-pointer"
                      onClick={() => setIsImageZoomed(false)}
                    />
                    
                    {/* Badge avec numéro d'image et questionnaire dans le zoom */}
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-2 rounded-full text-sm font-bold shadow-2xl backdrop-blur-md border border-primary-foreground/30 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                      <div className="flex items-center gap-2">
                        <div className="font-black text-xl leading-none">{currentReviewQuestion.questionnaire}</div>
                        <div className="text-[11px] opacity-80 font-bold">{extractImageNumber(currentReviewQuestion.imagePath) || '?'}/{getTotalQuestionsInQuestionnaire(currentReviewQuestion.questionnaire)}</div>
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

            {/* Question et réponses - responsive */}
            <div className="w-full md:w-1/2 flex flex-col">
              <Card className="flex-1 card-elegant">
                <CardHeader className="pb-2 md:pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base md:text-lg">
                      Question {currentReviewQuestion.question}
                    </CardTitle>
                    <div className="flex gap-1 md:gap-2">
                      {currentReviewQuestion.categorie && (
                        <Badge variant="secondary" className="text-xs badge-questionnaire">
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
                                ? 'bg-success text-success-foreground' 
                                : isWrong 
                                ? 'bg-destructive text-destructive-foreground' 
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {option}
                            </div>
                            <span className="text-left flex-1 break-words whitespace-pre-wrap text-sm md:text-base">{optionValue}</span>
                            <div className="flex items-center gap-1 md:gap-2">
                              {isCorrect && (
                                <div className="flex items-center gap-1 text-success">
                                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
                                  <span className="text-xs font-medium">Correcte</span>
                                </div>
                              )}
                              {isWrong && (
                                <div className="flex items-center gap-1 text-destructive">
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
                            <span className="text-success">✓ Réponse correcte</span>
                          ) : (
                            <span className="text-destructive">✗ Réponse incorrecte</span>
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
                <Button onClick={resetExam} variant="outline" className="interactive-hover">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Nouvel examen
                </Button>
                <Button onClick={() => router.push('/')} className="interactive-hover">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à l&apos;accueil
                </Button>
              </div>
            </div>
          </div>

          {/* Indicateur de scroll intelligent */}
          {showScrollIndicator && (
            <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40">
              <div className="bg-primary/50 text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center shadow-md animate-bounce">
                ↑
              </div>
            </div>
          )}

          {/* Navigation fixe - visible sur toutes les tailles d'écran */}
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-3 z-50">
            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))}
                disabled={reviewIndex === 0}
                className="flex items-center gap-2 flex-1 interactive-hover"
              >
                <ArrowLeft className="h-4 w-4" />
                Précédent
              </Button>

              <Button
                onClick={() => setReviewIndex(Math.min(examQuestions.length - 1, reviewIndex + 1))}
                disabled={reviewIndex === examQuestions.length - 1}
                className="flex items-center gap-2 flex-1 interactive-hover"
              >
                Suivant
                <ArrowRight className="h-4 w-4" />
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

    // Configuration optimisée pour 10 questions par page
    const getButtonConfig = (totalQuestions: number) => {
      // Toujours optimisé pour 10 questions
      return {
        size: 'w-9 h-9 md:w-10 md:h-10',      // Boutons confortables
        text: 'text-xs md:text-sm',            // Texte lisible
        gap: 'gap-2 md:gap-3',                 // Espacement généreux
        shape: 'rounded-lg'                    // Forme arrondie
      }
    }

    // Déterminer l'ensemble filtré
    const answeredIds = new Set(Object.keys(answers))
    const reviewIds = markedForReview

    const filteredQuestions = examQuestions.filter((q) => {
      if (questionFilter === 'all') return true
      if (questionFilter === 'answered') return answeredIds.has(q.id)
      if (questionFilter === 'review') return reviewIds.has(q.id)
      // 'unanswered'
      return !answeredIds.has(q.id)
    })

    const buttonConfig = getButtonConfig(filteredQuestions.length)

    // IMPORTANT: mapping index global ←→ index filtré
    // index global pour une question visible
    const getGlobalIndex = (qId: string) => examQuestions.findIndex(eq => eq.id === qId)

    // Calculer le nombre de questions par page (responsive) - basé sur les questions filtrées
    const totalForPagination = filteredQuestions.length
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const questionsPerPage = getQuestionsPerPage(totalForPagination, isMobile)

    // Calculer le nombre total de pages
    const totalPages = Math.ceil(totalForPagination / questionsPerPage)

    // Questions visibles sur la page actuelle
    const startIndex = currentPage * questionsPerPage
    const endIndex = Math.min(startIndex + questionsPerPage, totalForPagination)
    const visibleQuestions = filteredQuestions.slice(startIndex, endIndex)

    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <NavigationBar />
        <div className="flex-1 flex flex-col exam-main-content overflow-y-auto">
          {/* Header avec timer et navigation par numéros */}
          <Card className="sticky top-0 z-40 bg-background shadow-md m-2 md:m-4 mb-2 card-elegant">
            <CardContent className="p-2 md:p-4">
              {/* Header principal - une seule ligne */}
              <div className="flex items-center justify-between gap-2 md:gap-4 flex-wrap md:flex-nowrap">
                {/* Zone 1: Contrôles gauche */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExitExam}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden md:inline ml-1">Sortir</span>
                  </Button>
                  <ThemeToggle />
                </div>
                
                {/* Zone 2: Chrono */}
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  <span className="font-mono text-lg md:text-2xl font-bold text-primary">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                
                {/* Zone 3: Filtres - Desktop (boutons) */}
                <div className="hidden md:flex gap-2" role="tablist" aria-label="Filtres de questions">
                  {([
                    { key: 'all', label: 'Toutes', count: examQuestions.length },
                    { key: 'answered', label: 'Répondues', count: answeredIds.size },
                    { key: 'review', label: 'À revoir', count: reviewIds.size },
                    { key: 'unanswered', label: 'Non répondues', count: examQuestions.length - answeredIds.size },
                  ] as const).map(({ key, label, count }) => (
                    <Button
                      key={key}
                      variant={questionFilter === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setQuestionFilter(key)}
                      aria-pressed={questionFilter === key}
                      aria-label={`${label} (${count})`}
                      className="h-8 px-3"
                    >
                      <span className="mr-2">{label}</span>
                      <Badge variant={questionFilter === key ? 'secondary' : 'outline'} className={`text-[10px] h-5 px-2 ${questionFilter === key ? 'badge-questionnaire' : ''}`}>
                        {count}
                      </Badge>
                    </Button>
                  ))}
                </div>
                
                {/* Zone 3: Filtres - Mobile (select) */}
                <div className="flex md:hidden">
                  <Select value={questionFilter} onValueChange={(value) => setQuestionFilter(value as QuestionFilter)}>
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes ({examQuestions.length})</SelectItem>
                      <SelectItem value="answered">Répondues ({answeredIds.size})</SelectItem>
                      <SelectItem value="review">À revoir ({reviewIds.size})</SelectItem>
                      <SelectItem value="unanswered">Non répondues ({examQuestions.length - answeredIds.size})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Zone 4: Compteur */}
                <Badge variant={allAnswered ? "default" : "secondary"} className={`text-xs font-semibold ${allAnswered ? 'badge-status-success' : 'badge-questionnaire'}`}>
                  {answeredCount} / {examQuestions.length}
                </Badge>
              </div>

              {/* Navigation par numéros de questions */}
              <div className="mt-3 md:mt-4">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-4">
                    Aucune question dans ce filtre
                  </div>
                ) : (
                  <div className="flex w-full gap-2 px-2">
                    {/* Flèche gauche - taille fixe */}
                    <button
                      onClick={() => {
                        if (currentPage > 0) {
                          setIsManualPageChange(true)
                          setCurrentPage(currentPage - 1)
                        }
                      }}
                      disabled={currentPage === 0}
                      className={`w-9 h-9 md:w-10 md:h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-all bg-gradient-to-r from-primary/20 to-primary/30 border-2 border-primary/40 shadow-lg ${
                        currentPage === 0 
                          ? 'opacity-30 cursor-not-allowed' 
                          : 'hover:from-primary/30 hover:to-primary/40 hover:border-primary/60 hover:shadow-xl hover:scale-105'
                      }`}
                      aria-label="Page précédente"
                    >
                      <ArrowLeft className="h-5 w-5 text-primary font-bold" />
                    </button>
                    
                    {/* Numéros de questions - prend tout l'espace restant */}
                    <div className="flex-1 flex gap-1 md:gap-2">
                      {visibleQuestions.map((q) => {
                        const index = getGlobalIndex(q.id)
                        const isAnswered = !!answers[q.id]
                        const isMarked = markedForReview.has(q.id)
                        const isCurrent = index === currentIndex
                        
                        return (
                          <button
                            key={q.id}
                            onClick={() => goToQuestion(index)}
                            className={`flex-1 min-w-[28px] max-w-[48px] md:min-w-[32px] md:max-w-[60px] h-9 md:h-10 ${buttonConfig.shape} flex items-center justify-center ${buttonConfig.text} font-bold transition-all shadow-sm hover:shadow-md ${
                              isCurrent
                                ? 'ring-2 ring-primary ring-offset-2 scale-105'
                                : 'hover:scale-105'
                            } ${
                              isMarked
                                ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                                : isAnswered
                                ? 'bg-success text-success-foreground hover:bg-success/80'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                          >
                            {index + 1}
                          </button>
                        )
                      })}
                    </div>
                    
                    {/* Flèche droite - taille fixe */}
                    <button
                      onClick={() => {
                        if (currentPage < totalPages - 1) {
                          setIsManualPageChange(true)
                          setCurrentPage(currentPage + 1)
                        }
                      }}
                      disabled={currentPage === totalPages - 1}
                      className={`w-9 h-9 md:w-10 md:h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-all bg-gradient-to-r from-primary/20 to-primary/30 border-2 border-primary/40 shadow-lg ${
                        currentPage === totalPages - 1 
                          ? 'opacity-30 cursor-not-allowed' 
                          : 'hover:from-primary/30 hover:to-primary/40 hover:border-primary/60 hover:shadow-xl hover:scale-105'
                      }`}
                      aria-label="Page suivante"
                    >
                      <ArrowRight className="h-5 w-5 text-primary font-bold" />
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contenu principal - Layout responsive */}
          <div className="flex-1 flex flex-col md:flex-row mx-2 md:mx-4 pb-20 md:pb-24 gap-4">
            {/* Image - responsive */}
            <div className="w-full md:w-1/2">
              <Card className="h-64 md:h-full card-elegant relative">
                <CardContent className="p-2 md:p-4 h-full flex flex-col">
                  {/* Légende des états en haut */}
                  <div className="flex gap-2 mb-2 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-success"></div>
                      <span>Répondue</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>À revoir</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-muted"></div>
                      <span>Non rép.</span>
                    </div>
                  </div>
                  
                  {/* Image centrée */}
                  <div className="flex-1 flex items-center justify-center relative">
                    <Image 
                      src={getImageUrlSync(currentQuestion.imagePath)} 
                      alt={`Question ${currentQuestion.question}`}
                      width={800}
                      height={600}
                      className="max-w-full max-h-full object-contain cursor-pointer transition-all duration-300"
                      onClick={() => setIsImageZoomed(!isImageZoomed)}
                    />
                    
                    {/* Badge principal avec numéro de question */}
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-2 rounded-full text-sm font-bold shadow-2xl backdrop-blur-md border border-primary-foreground/30 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                      <div className="font-black text-xl leading-none">{extractImageNumber(currentQuestion.imagePath) || '?'}/{getTotalQuestionsInQuestionnaire(currentQuestion.questionnaire)}</div>
                    </div>
                    
                    {/* Badge de notification pour le questionnaire (position sûre) */}
                    <div className="badge-questionnaire-absolute">
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
                        <div className="text-[11px] opacity-80 font-bold">{currentQuestion.questionnaire}</div>
                        <div className="font-black text-xl leading-none">{extractImageNumber(currentQuestion.imagePath) || '?'}/{getTotalQuestionsInQuestionnaire(currentQuestion.questionnaire)}</div>
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

            {/* Question et options - responsive */}
            <div className="w-full md:w-1/2 flex flex-col">
              <Card className="flex-1 card-elegant">
                <CardHeader className="pb-2 md:pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base md:text-lg">
                      Question {currentQuestion.question}
                    </CardTitle>
                    <div className="flex gap-1 md:gap-2">
                      {currentQuestion.categorie && (
                        <Badge variant="secondary" className="text-xs badge-questionnaire">
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
                <CardContent className="space-y-4 md:space-y-6 p-3 md:p-6">
                  <p className="text-sm md:text-base text-foreground font-medium break-words whitespace-pre-wrap leading-relaxed">
                    {currentQuestion.enonce}
                  </p>

                  <div className="space-y-3 md:space-y-4">
                    {['A', 'B', 'C', 'D'].map((option, index) => {
                      const optionKey = `option${option}` as keyof Question
                      const optionValue = currentQuestion[optionKey] as string
                      const answerKey = option.toLowerCase()
                      
                      // Ne pas afficher l'option si elle n'existe pas
                      if (!optionValue) return null
                      
                      const isSelected = selectedAnswer === answerKey

                      return (
                        <div
                          key={option}
                          className={`p-3 md:p-4 rounded-lg border-2 cursor-pointer question-option transition-all hover:shadow-md ${
                            isSelected 
                              ? 'question-option-selected shadow-lg' 
                              : 'bg-muted border-border hover:bg-muted/50 interactive-hover'
                          }`}
                          onClick={() => handleAnswerSelect(answerKey)}
                        >
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-sm md:text-base font-bold transition-all ${
                              isSelected 
                                ? 'bg-primary text-primary-foreground scale-110' 
                                : 'bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground'
                            }`}>
                              {option}
                            </div>
                            <span className="text-sm md:text-base text-left break-words whitespace-pre-wrap leading-relaxed">{optionValue}</span>
                          </div>
                        </div>
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
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'hover:bg-muted/50 hover:text-primary'
                  }`}
                >
                  {markedForReview.has(currentQuestion.id) ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marquée pour révision
                    </>
                  ) : (
                    <>
                      <span className="mr-2">⚠️</span>
                      Marquer pour révision
                    </>
                  )}
                </Button>
              </div>


              {/* Bouton finir l'examen - Visible seulement si toutes les questions sont répondues */}
              {allAnswered && (
                <div className="mt-4 text-center">
                  <Button 
                    onClick={finishExam}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg" // Pas de hover jaune car fond jaune
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Terminer l&apos;examen
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Indicateur de scroll intelligent */}
          {showScrollIndicator && (
            <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40">
              <div className="bg-primary/50 text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center shadow-md animate-bounce">
                ↑
              </div>
            </div>
          )}

          {/* Navigation fixe - visible sur toutes les tailles d'écran */}
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-3 z-50">
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
            
          </div>

          {/* Version mobile - bouton flottant pour marquer les questions */}
          <button
            onClick={() => toggleMarkForReview(currentQuestion.id)}
            className={`fixed bottom-20 right-4 z-30 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
              markedForReview.has(currentQuestion.id)
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-primary border-2 border-primary'
            }`}
            aria-label="Marquer pour révision"
          >
            {markedForReview.has(currentQuestion.id) ? (
              <CheckCircle className="h-6 w-6" />
            ) : (
              <span className="text-2xl">⚠️</span>
            )}
          </button>


          {/* Modal de confirmation pour sortir de l'examen */}
          {showExitConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md card-elegant">
                <CardHeader>
                  <CardTitle className="text-center">Quitter l&apos;examen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-center text-muted-foreground">
                    Que souhaitez-vous faire ?
                  </p>
                  <p className="text-center text-sm text-muted-foreground">
                    Vous avez répondu à {Object.keys(answers).length} question(s) sur {examQuestions.length}.
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={confirmExitExam}
                      className="w-full h-12 flex flex-col items-center justify-center py-2"
                    >
                      <span className="font-semibold">Sauvegarder et quitter</span>
                      <span className="text-xs opacity-90">Reprendre l&apos;examen plus tard</span>
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      onClick={abandonExam}
                      className="w-full h-12 flex flex-col items-center justify-center py-2"
                    >
                      <span className="font-semibold">Abandonner l&apos;examen</span>
                      <span className="text-xs opacity-90">Perdre toutes les réponses</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={cancelExitExam}
                      className="w-full"
                    >
                      Annuler
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    💾 Si vous sauvegardez, l&apos;examen sera disponible au prochain démarrage.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}