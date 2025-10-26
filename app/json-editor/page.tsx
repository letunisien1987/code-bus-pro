'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Check, Save, Search, Bot, Sparkles, Loader2, ChevronDown, ChevronRight, Database } from 'lucide-react'
import { getImageUrlSync } from '@/lib/blob-helper'

interface Question {
  id: string // UUID unique et permanent
  old_id?: string // Ancien ID (questionnaire_code) pour affichage
  numero_question: number
  questionnaire: number
  question: string
  categorie: string | null
  "astag D/F/I ": string | null
  enonce: string | null
  options: {
    a: string
    b: string
    c: string
    d?: string
  }
  bonne_reponse: string
  image_path: string
  validation_status?: 'non_verifie' | 'a_corriger' | 'valide'
}

interface AIAnalysisResult {
  hasErrors: boolean
  extractedData?: {
    numero_question: number
    question: string
    categorie: string
    astag: string
    enonce: string
    options: { a: string; b: string; c: string }
    bonne_reponse: string
  }
  suggestions: {
    numero_question?: number
    question?: string
    categorie?: string
    astag?: string
    enonce?: string
    options?: { a?: string; b?: string; c?: string }
    bonne_reponse?: string
  }
  confidence: 'high' | 'medium' | 'low'
  analysis: string
}

export default function JsonEditorPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterProblematic, setFilterProblematic] = useState(false)
  const [validationFilter, setValidationFilter] = useState<'tous' | 'non_verifie' | 'a_corriger' | 'valide'>('tous')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [groupByQuestionnaire, setGroupByQuestionnaire] = useState(true)
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, AIAnalysisResult>>({})
  const [aiLoading, setAiLoading] = useState<string | null>(null)
  const [expandedQuestionnaires, setExpandedQuestionnaires] = useState<Set<number>>(new Set())
  const [appliedChanges, setAppliedChanges] = useState<Record<string, { field: string, oldValue: any, newValue: any }[]>>({})
  // Fonction wrapper pour sauvegarder sans rechargement
  const saveWithScroll = async (updatedQuestion: Question) => {
    const index = questions.findIndex(q => q.id === updatedQuestion.id)
    const newQuestions = [...questions]
    newQuestions[index] = updatedQuestion
    setQuestions(newQuestions)
    
    // Sauvegarder en base (sans rechargement)
    await saveQuestion(updatedQuestion)
  }
  
  const isProblematic = (q: Question) => {
    // Une question est problématique seulement si :
    // 1. Une option est complètement manquante (null/undefined)
    // 2. Une option est vide (chaîne vide)
    // 3. Pas de bonne réponse définie
    return !q.options.a || !q.options.b || !q.options.c ||
           q.options.a === '' || q.options.b === '' || q.options.c === '' ||
           !q.bonne_reponse || q.bonne_reponse === ''
  }
  
  const filterQuestions = useCallback(() => {
    let filtered = questions
    
    if (filterProblematic) {
      filtered = filtered.filter(isProblematic)
    }
    
    if (validationFilter !== 'tous') {
      filtered = filtered.filter(q => (q.validation_status || 'non_verifie') === validationFilter)
    }
    
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.id.includes(searchTerm) ||
        q.question.includes(searchTerm) ||
        q.categorie?.includes(searchTerm)
      )
    }
    
    setFilteredQuestions(filtered)
  }, [questions, filterProblematic, validationFilter, searchTerm])

  useEffect(() => {
    loadQuestions()
  }, [])
  
  useEffect(() => {
    filterQuestions()
  }, [questions, searchTerm, filterProblematic, validationFilter, filterQuestions])
  
  const loadQuestions = async () => {
    try {
      const response = await fetch('/api/json-editor')
      
      if (!response.ok) {
        console.error('Erreur API:', response.status, response.statusText)
        return
      }
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('La réponse n\'est pas du JSON:', contentType)
        return
      }
      
      const data = await response.json()
      setQuestions(data)
    } catch (error) {
      console.error('Erreur lors du chargement des questions:', error)
    }
  }

  const groupQuestionsByQuestionnaire = (questions: Question[]) => {
    const grouped = questions.reduce((acc, question) => {
      const questionnaire = question.questionnaire
      if (!acc[questionnaire]) {
        acc[questionnaire] = []
      }
      acc[questionnaire].push(question)
      return acc
    }, {} as Record<number, Question[]>)
    
    return Object.entries(grouped)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([questionnaire, questions]) => ({
        questionnaire: parseInt(questionnaire),
        questions: questions.sort((a, b) => {
          // Extraire le numéro de la question à partir du nom de l'image
          const getQuestionNumber = (imagePath: string) => {
            const fileName = imagePath.split('/').pop()?.split('.')[0] || ''
            const numberMatch = fileName.match(/(\d+)/)
            return numberMatch ? parseInt(numberMatch[1]) : 999
          }
          
          const numA = getQuestionNumber(a.image_path)
          const numB = getQuestionNumber(b.image_path)
          return numA - numB
        })
      }))
  }
  
  const saveQuestion = async (question: Question) => {
    setSaving(true)
    try {
      const response = await fetch('/api/json-editor', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(question)
      })
      
      if (response.ok) {
        // Silencieux si succès - PAS de rechargement des questions
        setEditingId(null)
        // Les questions sont déjà mises à jour dans l'état local
      } else {
        try {
          const error = await response.json()
          console.error('Erreur lors de la sauvegarde:', error.error || 'Erreur inconnue')
        } catch (parseError) {
          console.error('Erreur lors de la sauvegarde:', response.status, response.statusText)
        }
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
    } finally {
      setSaving(false)
    }
  }
  
  const saveAllToFile = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/json-editor/save-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questions)
      })
      
      // Silencieux - les questions sont sauvegardées automatiquement
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setSaving(false)
    }
  }

  const importToDatabase = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/import', {
        method: 'POST'
      })
      
      const result = await response.json()
      
      if (response.ok) {
        console.log(`✅ Import réussi: ${result.count} questions importées`)
      } else {
        console.error(`Erreur lors de l'import:`, result.error)
      }
    } catch (error) {
      console.error('Erreur lors de l\'import vers la base de données:', error)
    } finally {
      setSaving(false)
    }
  }

  const analyzeWithAI = async (question: Question) => {
    setAiLoading(question.id)
    try {
      const response = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question,
          imagePath: question.image_path
        })
      })
      
      if (response.ok) {
        const analysis = await response.json()
        setAiAnalysis(prev => ({
          ...prev,
          [question.id]: analysis
        }))
      } else {
        try {
          const error = await response.json()
          console.error(`Erreur lors de l'analyse IA:`, error.error || 'Erreur inconnue')
        } catch (parseError) {
          console.error(`Erreur lors de l'analyse IA:`, response.status, response.statusText)
        }
      }
    } catch (error) {
      console.error('Erreur analyse IA:', error)
    } finally {
      setAiLoading(null)
    }
  }

  const analyzeProblematicQuestions = async () => {
    const problematic = questions.filter(isProblematic)
    for (const question of problematic) {
      await analyzeWithAI(question)
      // Attendre un peu entre chaque requête pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const analyzeQuestionnaire = async (questionnaireNumber: number) => {
    // Filtrer les questions du questionnaire qui ne sont PAS validées
    const questionsToAnalyze = questions.filter(q => 
      q.questionnaire === questionnaireNumber && 
      q.validation_status !== 'valide'
    )
    
    if (questionsToAnalyze.length === 0) {
      return // Silencieux si toutes sont déjà validées
    }

    // Analyser chaque question une par une
    for (const question of questionsToAnalyze) {
      await analyzeWithAI(question)
      // Attendre 1 seconde entre chaque requête pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const applyAISuggestion = (questionId: string, field: string, value: any) => {
    const question = questions.find(q => q.id === questionId)
    if (!question) return

    // Sauvegarder l'ancienne valeur pour pouvoir annuler
    let oldValue: any
    switch(field) {
      case 'numero_question':
        oldValue = question.numero_question
        break
      case 'question':
        oldValue = question.question
        break
      case 'categorie':
        oldValue = question.categorie
        break
      case 'astag':
        oldValue = question["astag D/F/I "]
        break
      case 'enonce':
        oldValue = question.enonce
        break
      case 'bonne_reponse':
        oldValue = question.bonne_reponse
        break
      case 'options.a':
      case 'options.b':
      case 'options.c':
        const optionKey = field.split('.')[1] as 'a' | 'b' | 'c'
        oldValue = question.options[optionKey]
        break
    }

    // Enregistrer le changement pour pouvoir l'annuler
    setAppliedChanges(prev => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), { field, oldValue, newValue: value }]
    }))

    const updated = { ...question }
    
    switch(field) {
      case 'numero_question':
        updated.numero_question = value
        break
      case 'question':
        updated.question = value
        break
      case 'categorie':
        updated.categorie = value
        break
      case 'astag':
        updated["astag D/F/I "] = value
        break
      case 'enonce':
        updated.enonce = value
        break
      case 'bonne_reponse':
        updated.bonne_reponse = value
        break
      case 'options.a':
      case 'options.b':
      case 'options.c':
        const optKey = field.split('.')[1] as 'a' | 'b' | 'c'
        updated.options = { ...updated.options, [optKey]: value }
        break
    }

    const questionIndex = questions.findIndex(q => q.id === questionId)
    if (questionIndex !== -1) {
      const newQuestions = [...questions]
      newQuestions[questionIndex] = updated
      setQuestions(newQuestions)
    }

    saveQuestion(updated)
  }

  const undoAISuggestion = (questionId: string, field: string) => {
    const changes = appliedChanges[questionId]
    if (!changes) return

    const changeIndex = changes.findIndex(c => c.field === field)
    if (changeIndex === -1) return

    const change = changes[changeIndex]
    
    // Appliquer l'ancienne valeur
    applyValueToQuestion(questionId, field, change.oldValue)

    // Retirer ce changement de la liste
    setAppliedChanges(prev => {
      const newChanges = [...(prev[questionId] || [])]
      newChanges.splice(changeIndex, 1)
      return {
        ...prev,
        [questionId]: newChanges
      }
    })
  }

  const applyValueToQuestion = (questionId: string, field: string, value: any) => {
    const question = questions.find(q => q.id === questionId)
    if (!question) return

    const updated = { ...question }
    
    switch(field) {
      case 'numero_question':
        updated.numero_question = value
        break
      case 'question':
        updated.question = value
        break
      case 'categorie':
        updated.categorie = value
        break
      case 'astag':
        updated["astag D/F/I "] = value
        break
      case 'enonce':
        updated.enonce = value
        break
      case 'bonne_reponse':
        updated.bonne_reponse = value
        break
      case 'options.a':
      case 'options.b':
      case 'options.c':
        const optKey = field.split('.')[1] as 'a' | 'b' | 'c'
        updated.options = { ...updated.options, [optKey]: value }
        break
    }

    const questionIndex = questions.findIndex(q => q.id === questionId)
    if (questionIndex !== -1) {
      const newQuestions = [...questions]
      newQuestions[questionIndex] = updated
      setQuestions(newQuestions)
    }

    saveQuestion(updated)
  }

  const applyAllSuggestions = async (questionId: string) => {
    const analysis = aiAnalysis[questionId]
    if (!analysis || !analysis.hasErrors) return

    const suggestions = analysis.suggestions
    const question = questions.find(q => q.id === questionId)
    if (!question) return

    // Créer une copie de la question avec toutes les suggestions appliquées
    let updatedQuestion = { ...question }
    
    // Appliquer toutes les suggestions à la fois
    if (suggestions.numero_question !== undefined && suggestions.numero_question !== null) {
      updatedQuestion.numero_question = suggestions.numero_question
    }
    if (suggestions.question) {
      updatedQuestion.question = suggestions.question
    }
    if (suggestions.categorie) {
      updatedQuestion.categorie = suggestions.categorie
    }
    if (suggestions.astag) {
      updatedQuestion["astag D/F/I "] = suggestions.astag
    }
    if (suggestions.enonce) {
      updatedQuestion.enonce = suggestions.enonce
    }
    if (suggestions.options?.a) {
      updatedQuestion.options = { ...updatedQuestion.options, a: suggestions.options.a }
    }
    if (suggestions.options?.b) {
      updatedQuestion.options = { ...updatedQuestion.options, b: suggestions.options.b }
    }
    if (suggestions.options?.c) {
      updatedQuestion.options = { ...updatedQuestion.options, c: suggestions.options.c }
    }
    if (suggestions.bonne_reponse) {
      updatedQuestion.bonne_reponse = suggestions.bonne_reponse
    }

    // Sauvegarder la question avec toutes les modifications
    await saveQuestion(updatedQuestion)

    // Mettre à jour l'état des changements appliqués pour l'affichage
    const appliedChanges: { field: string, oldValue: any, newValue: any }[] = []
    
    if (suggestions.numero_question !== undefined && suggestions.numero_question !== null) {
      appliedChanges.push({ field: 'numero_question', oldValue: question.numero_question, newValue: suggestions.numero_question })
    }
    if (suggestions.question) {
      appliedChanges.push({ field: 'question', oldValue: question.question, newValue: suggestions.question })
    }
    if (suggestions.categorie) {
      appliedChanges.push({ field: 'categorie', oldValue: question.categorie, newValue: suggestions.categorie })
    }
    if (suggestions.astag) {
      appliedChanges.push({ field: 'astag', oldValue: question["astag D/F/I "], newValue: suggestions.astag })
    }
    if (suggestions.enonce) {
      appliedChanges.push({ field: 'enonce', oldValue: question.enonce, newValue: suggestions.enonce })
    }
    if (suggestions.options?.a) {
      appliedChanges.push({ field: 'options.a', oldValue: question.options.a, newValue: suggestions.options.a })
    }
    if (suggestions.options?.b) {
      appliedChanges.push({ field: 'options.b', oldValue: question.options.b, newValue: suggestions.options.b })
    }
    if (suggestions.options?.c) {
      appliedChanges.push({ field: 'options.c', oldValue: question.options.c, newValue: suggestions.options.c })
    }
    if (suggestions.bonne_reponse) {
      appliedChanges.push({ field: 'bonne_reponse', oldValue: question.bonne_reponse, newValue: suggestions.bonne_reponse })
    }

    // Mettre à jour l'état des changements appliqués
    setAppliedChanges(prev => ({
      ...prev,
      [questionId]: appliedChanges
    }))
  }

  const toggleQuestionnaire = (questionnaireNumber: number) => {
    setExpandedQuestionnaires(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionnaireNumber)) {
        newSet.delete(questionnaireNumber)
      } else {
        newSet.add(questionnaireNumber)
      }
      return newSet
    })
  }

  const expandAll = () => {
    const allQuestionnaires = new Set(questions.map(q => q.questionnaire))
    setExpandedQuestionnaires(allQuestionnaires)
  }

  const collapseAll = () => {
    setExpandedQuestionnaires(new Set())
  }
  
  const problematicCount = questions.filter(isProblematic).length
  const nonVerifieCount = questions.filter(q => (q.validation_status || 'non_verifie') === 'non_verifie').length
  const aCorrigerCount = questions.filter(q => q.validation_status === 'a_corriger').length
  const valideCount = questions.filter(q => q.validation_status === 'valide').length
  
  return (
    <div className="min-h-screen bg-background p-4 pb-20 md:pb-4">
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>Éditeur JSON - Questions</CardTitle>
            <div className="flex gap-2">
              <Button onClick={saveAllToFile} disabled={saving} variant="outline" className="interactive-hover">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder dans JSON'}
              </Button>
              <Button onClick={importToDatabase} disabled={saving} variant="default" className="bg-green-600 hover:bg-green-700">
                <Database className="h-4 w-4 mr-2" />
                {saving ? 'Import en cours...' : '💾 Importer dans la base'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Rechercher par ID, numéro, catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Button
              variant={filterProblematic ? 'default' : 'outline'}
              onClick={() => setFilterProblematic(!filterProblematic)}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Problématiques ({problematicCount})
            </Button>
            
            {/* Filtre par statut de validation */}
            <div className="flex gap-2">
              <Button
                variant={validationFilter === 'tous' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setValidationFilter('tous')}
              >
                Tous
              </Button>
              <Button
                variant={validationFilter === 'non_verifie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setValidationFilter('non_verifie')}
                className={validationFilter === 'non_verifie' ? 'bg-gray-500 hover:bg-gray-600' : ''}
              >
                Non vérifiées
              </Button>
              <Button
                variant={validationFilter === 'a_corriger' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setValidationFilter('a_corriger')}
                className={validationFilter === 'a_corriger' ? 'bg-orange-500 hover:bg-orange-600' : ''}
              >
                À corriger
              </Button>
              <Button
                variant={validationFilter === 'valide' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setValidationFilter('valide')}
                className={validationFilter === 'valide' ? 'bg-green-500 hover:bg-green-600' : ''}
              >
                Validées
              </Button>
            </div>
            
            <Button
              variant={groupByQuestionnaire ? 'default' : 'outline'}
              onClick={() => setGroupByQuestionnaire(!groupByQuestionnaire)}
            >
              Grouper par questionnaire
            </Button>
            {groupByQuestionnaire && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={expandAll}
                >
                  Tout déplier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={collapseAll}
                >
                  Tout plier
                </Button>
              </>
            )}
            <Button
              variant="secondary"
              onClick={analyzeProblematicQuestions}
              disabled={aiLoading !== null || problematicCount === 0}
            >
              {aiLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Bot className="h-4 w-4 mr-2" />
              )}
              Analyser avec IA
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
              <span>Total: {questions.length} questions</span>
              <span>Affichées: {filteredQuestions.length}</span>
              <span className="text-destructive">Problématiques: {problematicCount}</span>
              <span className="text-gray-500">Non vérifiées: {nonVerifieCount}</span>
              <span className="text-orange-500">À corriger: {aCorrigerCount}</span>
              <span className="text-green-500">Validées: {valideCount}</span>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>💡 Workflow :</strong> 
                <span className="ml-2">
                  1️⃣ Modifier les questions → 
                  2️⃣ &quot;Sauvegarder dans JSON&quot; → 
                  3️⃣ &quot;💾 Importer dans la base&quot; pour voir les changements dans l&apos;app
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {groupByQuestionnaire ? (
          groupQuestionsByQuestionnaire(filteredQuestions).map(({ questionnaire, questions }) => {
            const isExpanded = expandedQuestionnaires.has(questionnaire)
            return (
              <Card key={questionnaire}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-muted/50 transition-colors py-2 -my-2 rounded"
                      onClick={() => toggleQuestionnaire(questionnaire)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                      <h3 className="text-lg font-semibold">Questionnaire {questionnaire}</h3>
                      <Badge variant="outline">{questions.length} questions</Badge>
                      {questions.filter(q => isProblematic(q)).length > 0 && (
                        <Badge variant="destructive">
                          {questions.filter(q => isProblematic(q)).length} problématiques
                        </Badge>
                      )}
                      {questions.filter(q => q.validation_status !== 'valide').length > 0 && (
                        <Badge className="bg-orange-500">
                          {questions.filter(q => q.validation_status !== 'valide').length} non validées
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        analyzeQuestionnaire(questionnaire)
                      }}
                      disabled={aiLoading !== null || questions.filter(q => q.validation_status !== 'valide').length === 0}
                    >
                      {aiLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Bot className="h-4 w-4 mr-2" />
                      )}
                      Analyser avec IA ({questions.filter(q => q.validation_status !== 'valide').length})
                    </Button>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent className="space-y-3 pt-0">
                    {questions.map(question => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        isProblematic={isProblematic(question)}
                        isEditing={editingId === question.id}
                        onEdit={() => setEditingId(question.id)}
                        onCancel={() => setEditingId(null)}
                        onSave={saveWithScroll}
                        aiAnalysis={aiAnalysis}
                        aiLoading={aiLoading}
                        analyzeWithAI={analyzeWithAI}
                        applyAISuggestion={applyAISuggestion}
                        undoAISuggestion={undoAISuggestion}
                        applyAllSuggestions={applyAllSuggestions}
                        appliedChanges={appliedChanges}
                      />
                    ))}
                  </CardContent>
                )}
              </Card>
            )
          })
        ) : (
          filteredQuestions.map(question => (
            <QuestionCard
              key={question.id}
              question={question}
              isProblematic={isProblematic(question)}
              isEditing={editingId === question.id}
              onEdit={() => setEditingId(question.id)}
              onCancel={() => setEditingId(null)}
              onSave={saveWithScroll}
              aiAnalysis={aiAnalysis}
              aiLoading={aiLoading}
              analyzeWithAI={analyzeWithAI}
              applyAISuggestion={applyAISuggestion}
              undoAISuggestion={undoAISuggestion}
              applyAllSuggestions={applyAllSuggestions}
              appliedChanges={appliedChanges}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface QuestionCardProps {
  question: Question
  isProblematic: boolean
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: (question: Question) => void
  aiAnalysis: Record<string, AIAnalysisResult>
  aiLoading: string | null
  analyzeWithAI: (question: Question) => void
  applyAISuggestion: (questionId: string, field: string, value: any) => void
  undoAISuggestion: (questionId: string, field: string) => void
  applyAllSuggestions: (questionId: string) => void
  appliedChanges: Record<string, { field: string, oldValue: any, newValue: any }[]>
}

function QuestionCard({ question, isProblematic, isEditing, onEdit, onCancel, onSave, aiAnalysis, aiLoading, analyzeWithAI, applyAISuggestion, undoAISuggestion, applyAllSuggestions, appliedChanges }: QuestionCardProps) {
  const [formData, setFormData] = useState(question)
  const [isImageZoomed, setIsImageZoomed] = useState(false)
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState<string>('')
  
  // Synchroniser formData avec les changements de la question
  useEffect(() => {
    setFormData(question)
  }, [question])

  // Fonctions pour l'édition directe
  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field)
    setTempValue(currentValue)
  }

  const saveEdit = () => {
    if (editingField && tempValue !== formData[editingField as keyof Question]) {
      const updated = { ...formData }
      
      if (editingField.startsWith('options.')) {
        const optionKey = editingField.split('.')[1] as 'a' | 'b' | 'c'
        updated.options = { ...updated.options, [optionKey]: tempValue }
      } else {
        (updated as any)[editingField] = tempValue
      }
      
      onSave(updated)
    }
    setEditingField(null)
    setTempValue('')
  }

  const cancelEdit = () => {
    setEditingField(null)
    setTempValue('')
  }

  // Composant pour les options éditables
  const EditableOption = ({ option, value, label }: { option: 'a' | 'b' | 'c', value: string, label: string }) => {
    const [isHovered, setIsHovered] = useState(false)
    
    return (
      <div 
        className="flex items-center gap-2 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Badge 
          variant={question.bonne_reponse === option ? 'default' : 'outline'}
          className={`cursor-pointer hover:bg-green-500 hover:text-white transition-colors ${hoveredOption === option ? 'ring-2 ring-yellow-500 shadow-lg' : ''}`}
          onMouseEnter={() => setHoveredOption(option)}
          onMouseLeave={() => setHoveredOption(null)}
          onClick={() => {
            const updated = { ...question, bonne_reponse: option }
            onSave(updated)
          }}
        >
          {option.toUpperCase()}
        </Badge>
        
        {editingField === `options.${option}` ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="flex-1 px-2 py-1 border rounded text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit()
                if (e.key === 'Escape') cancelEdit()
              }}
            />
            <Button size="sm" onClick={saveEdit} className="bg-green-600 hover:bg-green-700">
              ✓
            </Button>
            <Button size="sm" variant="outline" onClick={cancelEdit} className="interactive-hover">
              ✗
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm">{value}</span>
            {isHovered && (
              <Button
                size="sm"
                variant="outline"
                className="ml-2 opacity-90 hover:opacity-100"
                onClick={() => startEditing(`options.${option}`, value)}
              >
                ✏️
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  // Composant pour les champs éditables au survol
  const EditableField = ({ field, value, label, className = "" }: { field: string, value: string, label: string, className?: string }) => {
    const [isHovered, setIsHovered] = useState(false)
    
    return (
      <div 
        className={`relative group ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {editingField === field ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="flex-1 px-2 py-1 border rounded text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit()
                if (e.key === 'Escape') cancelEdit()
              }}
            />
            <Button size="sm" onClick={saveEdit} className="bg-green-600 hover:bg-green-700">
              ✓
            </Button>
            <Button size="sm" variant="outline" onClick={cancelEdit} className="interactive-hover">
              ✗
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className={className}>{value || label}</span>
            {isHovered && (
              <Button
                size="sm"
                variant="outline"
                className="ml-2 opacity-90 hover:opacity-100"
                onClick={() => startEditing(field, value)}
              >
                ✏️ Modifier
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }
  
  // Extraire le numéro de la question à partir du nom de l'image
  const getQuestionNumber = (imagePath: string) => {
    // Extraire le nom du fichier sans extension
    const fileName = imagePath.split('/').pop()?.split('.')[0] || ''
    
    // Chercher un numéro dans le nom du fichier
    const numberMatch = fileName.match(/(\d+)/)
    return numberMatch ? numberMatch[1] : 'N/A'
  }
  
  const questionNumber = getQuestionNumber(question.image_path)
  
  // Générer le chemin de l'image de réponse
  const getAnswerImagePath = () => {
    const questionnaire = question.questionnaire
    // Utiliser les vrais noms de fichiers avec espaces
    if (questionnaire === 1) {
      return `images/reponse/Reponses ${questionnaire}.jpg`
    } else {
      return `images/reponse/reponses ${questionnaire}.jpg`
    }
  }
  
  // Afficher l'image de réponse si hoveredOption existe
  const currentImagePath = hoveredOption ? getAnswerImagePath() : question.image_path
  
  // Validation de l'URL pour éviter les erreurs
  const isValidImagePath = (path: string) => {
    if (!path) return false
    // Accepter tous les chemins qui commencent par 'images/'
    if (path.startsWith('images/')) return true
    try {
      // Vérifier si c'est une URL valide ou un chemin relatif valide
      if (path.startsWith('/')) return true
      new URL(path)
      return true
    } catch {
      return false
    }
  }
  
  // Calculer la position de zoom selon le numéro de question (1-40)
  const getImageZoomPosition = () => {
    const num = parseInt(questionNumber)
    if (num >= 1 && num <= 13) {
      return 'top' // Questions 1-13 en haut
    } else if (num >= 14 && num <= 26) {
      return 'center' // Questions 14-26 au milieu
    } else if (num >= 27 && num <= 40) {
      return 'bottom' // Questions 27-40 en bas
    }
    return 'center' // Par défaut au milieu
  }
  
  const zoomPosition = getImageZoomPosition()
  
  // Style pour le zoom selon la position
  const getImageStyle = () => {
    if (!hoveredOption) return {} // Pas de zoom si pas de survol
    
    // Zoom 3x sur la section appropriée avec positionnement précis
    const transforms = {
      top: 'scale(3) translate(16%, 33%)', // Zoom HAUT à droite - affiche vraiment le tout début (lignes 1-13)
      center: 'scale(3) translate(16%, 0%)', // Zoom MILIEU à droite
      bottom: 'scale(3) translate(16%, -33%)' // Zoom BAS à droite - affiche vraiment la fin (lignes 27-40)
    }
    
    return {
      transform: transforms[zoomPosition],
      transformOrigin: 'center center',
      transition: 'transform 0.3s ease-in-out'
    }
  }
  
  if (!isEditing) {
    return (
      <>
        <Card className={isProblematic ? 'border-destructive' : ''}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Image de la question */}
              <div className="flex-shrink-0">
                <div 
                  className="w-[28rem] h-[21rem] md:w-[36rem] md:h-[27rem] lg:w-[48rem] lg:h-[36rem] border rounded-lg overflow-hidden bg-muted cursor-pointer relative hover:ring-2 hover:ring-primary/50 transition-all"
                  onClick={() => setIsImageZoomed(true)}
                >
                  {isValidImagePath(currentImagePath) ? (
                    <Image 
                      src={currentImagePath.startsWith('/') ? currentImagePath : `/${currentImagePath}`} 
                      alt={hoveredOption ? `Réponses Questionnaire ${question.questionnaire}` : `Question ${question.id}`}
                      width={800}
                      height={600}
                      className="w-full h-full object-contain"
                      style={getImageStyle()}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                      <div className="text-center">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">Image non disponible</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Contenu de la question */}
              <div className="flex-1">
                {/* Informations de contrôle - Vue réorganisée */}
                <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-green-900/20 border border-blue-300 dark:border-blue-700 rounded-lg p-3 mb-3 shadow-sm">
                  {/* LIGNE 1: Numéro + Nom de l'image */}
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {/* Numéro de question */}
                    <div className="bg-white/50 dark:bg-black/20 rounded p-2 border border-purple-300 dark:border-purple-700">
                      <div className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase mb-0.5">
                        🔢 N°
                      </div>
                      <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                        {questionNumber}
                      </div>
                    </div>
                    
                    {/* Nom de l'image */}
                    <div className="col-span-3 bg-white/50 dark:bg-black/20 rounded p-2 border border-orange-300 dark:border-orange-700">
                      <div className="text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase mb-0.5">
                        📁 Nom de l&apos;image
                      </div>
                      <div className="text-sm font-mono font-bold text-orange-600 dark:text-orange-400">
                        {question.image_path.split('/').pop()}
                      </div>
                    </div>
                  </div>
                  
                  {/* LIGNE 2: Code + Catégorie + Astag */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Code question */}
                    <div className="bg-white/50 dark:bg-black/20 rounded p-2 border border-green-300 dark:border-green-700">
                      <div className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase mb-0.5">
                        🏷️ Code
                      </div>
                      <EditableField 
                        field="question" 
                        value={question.question} 
                        label="Code question"
                        className="text-2xl font-black text-green-600 dark:text-green-400"
                      />
                    </div>
                    
                    {/* Catégorie */}
                    <div className="bg-white/50 dark:bg-black/20 rounded p-2 border border-indigo-300 dark:border-indigo-700">
                      <div className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase mb-0.5">
                        📂 Catégorie
                      </div>
                      <EditableField 
                        field="categorie" 
                        value={question.categorie || ''} 
                        label="Catégorie"
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 truncate"
                      />
                    </div>
                    
                    {/* Astag */}
                    <div className="bg-white/50 dark:bg-black/20 rounded p-2 border border-cyan-300 dark:border-cyan-700">
                      <div className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 uppercase mb-0.5">
                        🏷️ Astag
                      </div>
                      <EditableField 
                        field="astag D/F/I " 
                        value={question["astag D/F/I "] || ''} 
                        label="Astag"
                        className="text-xs font-semibold text-cyan-600 dark:text-cyan-400"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="outline">Question {question.old_id || question.id}</Badge>
                  <Badge variant="default" className="badge-question-number">
                    N° {questionNumber}
                  </Badge>
                  {question.categorie && (
                    <Badge variant="secondary">{question.categorie}</Badge>
                  )}
                  {question["astag D/F/I "] && (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {question["astag D/F/I "]}
                    </Badge>
                  )}
                  {isProblematic && (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Problématique
                    </Badge>
                  )}
                  
                  {/* Badge de statut de validation */}
                  {(question.validation_status === 'valide') && (
                    <Badge className="badge-status-success">
                      <Check className="h-3 w-3 mr-1" />
                      Validée
                    </Badge>
                  )}
                  {(question.validation_status === 'a_corriger') && (
                    <Badge className="badge-status-warning">
                      ⚠️ À corriger
                    </Badge>
                  )}
                  {(!question.validation_status || question.validation_status === 'non_verifie') && (
                    <Badge className="badge-status-info">
                      ❓ Non vérifiée
                    </Badge>
                  )}
                </div>
                
                <EditableField 
                  field="enonce" 
                  value={question.enonce || ''} 
                  label="Énoncé de la question"
                  className="text-sm mb-3 font-medium"
                />
                
                <div className="space-y-1 text-sm">
                  <EditableOption option="a" value={question.options.a} label="Option A" />
                  <EditableOption option="b" value={question.options.b} label="Option B" />
                  <EditableOption option="c" value={question.options.c} label="Option C" />
                </div>
              </div>
              
              <div className="flex-shrink-0 flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => analyzeWithAI(question)}
                    disabled={aiLoading === question.id}
                  >
                    {aiLoading === question.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {/* Boutons de validation */}
                <div className="flex gap-1 flex-col">
                  <Button 
                    size="sm"
                    variant={(question.validation_status || 'non_verifie') === 'non_verifie' ? 'default' : 'outline'}
                    onClick={() => {
                      const updated = { ...question, validation_status: 'non_verifie' as const }
                      onSave(updated)
                    }}
                    className={`text-xs h-7 ${(question.validation_status || 'non_verifie') === 'non_verifie' ? 'bg-gray-500 hover:bg-gray-600' : ''}`}
                  >
                    ❓ Non vérifié
                  </Button>
                  <Button 
                    size="sm"
                    variant={question.validation_status === 'a_corriger' ? 'default' : 'outline'}
                    onClick={() => {
                      const updated = { ...question, validation_status: 'a_corriger' as const }
                      onSave(updated)
                    }}
                    className={`text-xs h-7 ${question.validation_status === 'a_corriger' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                  >
                    ⚠️ À corriger
                  </Button>
                  <Button 
                    size="sm"
                    variant={question.validation_status === 'valide' ? 'default' : 'outline'}
                    onClick={() => {
                      const updated = { ...question, validation_status: 'valide' as const }
                      onSave(updated)
                    }}
                    className={`text-xs h-7 ${question.validation_status === 'valide' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                  >
                    ✓ Validée
                  </Button>
                </div>
              </div>
            </div>

            {/* Résultats de l'analyse IA */}
            {aiAnalysis[question.id] && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-800 dark:text-blue-200">Suggestions IA</span>
                    <Badge variant={aiAnalysis[question.id].hasErrors ? "destructive" : "default"}>
                      {aiAnalysis[question.id].confidence === 'high' ? 'Haute confiance' : 
                       aiAnalysis[question.id].confidence === 'medium' ? 'Confiance moyenne' : 'Faible confiance'}
                    </Badge>
                  </div>
                  {aiAnalysis[question.id].hasErrors && (
                    <Button 
                      size="sm"
                      onClick={() => applyAllSuggestions(question.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      ✓ Tout appliquer
                    </Button>
                  )}
                </div>
                
                {aiAnalysis[question.id].hasErrors ? (
                  <div className="space-y-3">
                    {/* Numéro de question */}
                    {aiAnalysis[question.id].suggestions.numero_question && (
                      <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Numéro de question</span>
                          {appliedChanges[question.id]?.find(c => c.field === 'numero_question') ? (
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-500">✓ Appliqué</Badge>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => undoAISuggestion(question.id, 'numero_question')}
                              >
                                Annuler
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => applyAISuggestion(question.id, 'numero_question', aiAnalysis[question.id].suggestions.numero_question)}
                            >
                              Appliquer
                            </Button>
                          )}
                        </div>
                        <div className="text-xs space-y-1">
                          <div className="text-red-600 dark:text-red-400 line-through">
                            Actuel: {question.numero_question}
                          </div>
                          <div className="text-green-600 dark:text-green-400">
                            Suggéré: {aiAnalysis[question.id].suggestions.numero_question}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Code question */}
                    {aiAnalysis[question.id].suggestions.question && (
                      <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Code question</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => applyAISuggestion(question.id, 'question', aiAnalysis[question.id].suggestions.question)}
                          >
                            Appliquer
                          </Button>
                        </div>
                        <div className="text-xs space-y-1">
                          <div className="text-red-600 dark:text-red-400 line-through">
                            Actuel: {question.question}
                          </div>
                          <div className="text-green-600 dark:text-green-400">
                            Suggéré: {aiAnalysis[question.id].suggestions.question}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Catégorie */}
                    {aiAnalysis[question.id].suggestions.categorie && (
                      <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Catégorie</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => applyAISuggestion(question.id, 'categorie', aiAnalysis[question.id].suggestions.categorie)}
                          >
                            Appliquer
                          </Button>
                        </div>
                        <div className="text-xs space-y-1">
                          <div className="text-red-600 dark:text-red-400 line-through">
                            Actuel: {question.categorie || '(vide)'}
                          </div>
                          <div className="text-green-600 dark:text-green-400">
                            Suggéré: {aiAnalysis[question.id].suggestions.categorie}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Astag D/F/I */}
                    {aiAnalysis[question.id].suggestions.astag && (
                      <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Astag D/F/I</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => applyAISuggestion(question.id, 'astag', aiAnalysis[question.id].suggestions.astag)}
                          >
                            Appliquer
                          </Button>
                        </div>
                        <div className="text-xs space-y-1">
                          <div className="text-red-600 dark:text-red-400 line-through">
                            Actuel: {question["astag D/F/I "] || '(vide)'}
                          </div>
                          <div className="text-green-600 dark:text-green-400">
                            Suggéré: {aiAnalysis[question.id].suggestions.astag}
                          </div>
                        </div>
                      </div>
                    )}

                    {aiAnalysis[question.id].suggestions.enonce && (
                      <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Énoncé</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => applyAISuggestion(question.id, 'enonce', aiAnalysis[question.id].suggestions.enonce)}
                          >
                            Appliquer
                          </Button>
                        </div>
                        <div className="text-xs space-y-1">
                          <div className="text-red-600 dark:text-red-400 line-through">
                            Actuel: {question.enonce || '(vide)'}
                          </div>
                          <div className="text-green-600 dark:text-green-400">
                            Suggéré: {aiAnalysis[question.id].suggestions.enonce}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {aiAnalysis[question.id].suggestions.options?.a && (
                      <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Option A</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => applyAISuggestion(question.id, 'options.a', aiAnalysis[question.id].suggestions.options!.a)}
                          >
                            Appliquer
                          </Button>
                        </div>
                        <div className="text-xs space-y-1">
                          <div className="text-red-600 dark:text-red-400 line-through">
                            Actuel: {question.options.a}
                          </div>
                          <div className="text-green-600 dark:text-green-400">
                            Suggéré: {aiAnalysis[question.id].suggestions.options!.a}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {aiAnalysis[question.id].suggestions.options?.b && (
                      <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Option B</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => applyAISuggestion(question.id, 'options.b', aiAnalysis[question.id].suggestions.options!.b)}
                          >
                            Appliquer
                          </Button>
                        </div>
                        <div className="text-xs space-y-1">
                          <div className="text-red-600 dark:text-red-400 line-through">
                            Actuel: {question.options.b}
                          </div>
                          <div className="text-green-600 dark:text-green-400">
                            Suggéré: {aiAnalysis[question.id].suggestions.options!.b}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {aiAnalysis[question.id].suggestions.options?.c && (
                      <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Option C</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => applyAISuggestion(question.id, 'options.c', aiAnalysis[question.id].suggestions.options!.c)}
                          >
                            Appliquer
                          </Button>
                        </div>
                        <div className="text-xs space-y-1">
                          <div className="text-red-600 dark:text-red-400 line-through">
                            Actuel: {question.options.c}
                          </div>
                          <div className="text-green-600 dark:text-green-400">
                            Suggéré: {aiAnalysis[question.id].suggestions.options!.c}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {aiAnalysis[question.id].suggestions.bonne_reponse && (
                      <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Bonne réponse</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => applyAISuggestion(question.id, 'bonne_reponse', aiAnalysis[question.id].suggestions.bonne_reponse)}
                          >
                            Appliquer
                          </Button>
                        </div>
                        <div className="text-xs space-y-1">
                          <div className="text-red-600 dark:text-red-400 line-through">
                            Actuel: {question.bonne_reponse.toUpperCase()}
                          </div>
                          <div className="text-green-600 dark:text-green-400">
                            Suggéré: {aiAnalysis[question.id].suggestions.bonne_reponse!.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <Check className="h-4 w-4" />
                    <span className="text-sm">Aucune erreur détectée</span>
                  </div>
                )}
                
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                  <strong>Analyse:</strong> {aiAnalysis[question.id].analysis}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Overlay de zoom */}
        {isImageZoomed && (
          <div 
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
            onClick={() => setIsImageZoomed(false)}
          >
            <div 
              className="max-w-[90vw] max-h-[90vh] flex flex-col items-center justify-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Image 
                src={getImageUrlSync(question.image_path)} 
                alt={`Question ${question.id} - Zoom`}
                width={1200}
                height={900}
                className="max-w-full max-h-full object-contain"
              />
              
              
              {/* Bouton de fermeture en haut */}
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
      </>
    )
  }
  
  return (
    <>
      <Card>
        <CardContent className="p-4 space-y-3">
          {/* Informations de contrôle en mode édition - Vue réorganisée */}
          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-green-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-3 mb-3 shadow-md">
            {/* LIGNE 1: Numéro + Nom de l'image */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              {/* Numéro de question */}
              <div className="bg-white/50 dark:bg-black/20 rounded p-2 border border-purple-400 dark:border-purple-600">
                <div className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase mb-0.5 text-center">
                  🔢 N°
                </div>
                <div className="text-3xl font-black text-purple-600 dark:text-purple-400 text-center">
                  {questionNumber}
                </div>
              </div>
              
              {/* Nom de l'image */}
              <div className="col-span-3 bg-white/50 dark:bg-black/20 rounded p-2 border border-orange-400 dark:border-orange-600">
                <div className="text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase mb-0.5">
                  📁 Nom de l&apos;image
                </div>
                <div className="text-base font-mono font-bold text-orange-600 dark:text-orange-400">
                  {formData.image_path.split('/').pop()}
                </div>
              </div>
            </div>
            
            {/* LIGNE 2: Code + Catégorie + Astag */}
            <div className="grid grid-cols-3 gap-2">
              {/* Code question */}
              <div className="bg-white/50 dark:bg-black/20 rounded p-2 border border-green-400 dark:border-green-600">
                <div className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase mb-0.5 text-center">
                  🏷️ Code
                </div>
                <div className="text-3xl font-black text-green-600 dark:text-green-400 text-center">
                  {formData.question}
                </div>
              </div>
              
              {/* Catégorie */}
              <div className="bg-white/50 dark:bg-black/20 rounded p-2 border border-indigo-400 dark:border-indigo-600">
                <div className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase mb-0.5">
                  📂 Catégorie
                </div>
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 truncate">
                  {formData.categorie || '-'}
                </div>
              </div>
              
              {/* Astag */}
              <div className="bg-white/50 dark:bg-black/20 rounded p-2 border border-cyan-400 dark:border-cyan-600">
                <div className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 uppercase mb-0.5">
                  🏷️ Astag
                </div>
                <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                  {formData["astag D/F/I "] || '-'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{question.old_id || question.id}</Badge>
            <Badge variant="default" className="bg-blue-500 text-white">
              N° {questionNumber}
            </Badge>
            {question.categorie && (
              <Badge variant="secondary">{question.categorie}</Badge>
            )}
            {isProblematic && (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Problématique
              </Badge>
            )}
          </div>
          
          {/* Image de la question en mode édition - en haut et en grand */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Image de la question</label>
            <div className="w-full max-w-6xl mx-auto border rounded-lg overflow-visible bg-muted cursor-pointer relative">
              <div 
                className="w-full h-[48rem] overflow-visible relative"
                onWheel={(e) => {
                  e.preventDefault()
                  const delta = e.deltaY > 0 ? -0.1 : 0.1
                  const img = e.currentTarget.querySelector('img') as HTMLImageElement
                  const currentScale = parseFloat(img?.dataset.scale || '1')
                  const newScale = Math.max(1, Math.min(3, currentScale + delta))
                  if (img) {
                    const currentX = parseFloat(img.dataset.x || '0')
                    const currentY = parseFloat(img.dataset.y || '0')
                    img.style.transform = `scale(${newScale}) translate(${currentX}px, ${currentY}px)`
                    img.dataset.scale = newScale.toString()
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.currentTarget.dataset.dragging = 'true'
                  e.currentTarget.dataset.startX = e.clientX.toString()
                  e.currentTarget.dataset.startY = e.clientY.toString()
                }}
                onMouseMove={(e) => {
                  const container = e.currentTarget
                  const img = container.querySelector('img') as HTMLImageElement
                  if (container.dataset.dragging === 'true' && img) {
                    e.preventDefault()
                    const scale = parseFloat(img.dataset.scale || '1')
                    const startX = parseFloat(container.dataset.startX || '0')
                    const startY = parseFloat(container.dataset.startY || '0')
                    const deltaX = e.clientX - startX
                    const deltaY = e.clientY - startY
                    const currentX = parseFloat(img.dataset.x || '0')
                    const currentY = parseFloat(img.dataset.y || '0')
                    const newX = currentX + deltaX
                    const newY = currentY + deltaY
                    img.style.transform = `scale(${scale}) translate(${newX}px, ${newY}px)`
                    img.dataset.x = newX.toString()
                    img.dataset.y = newY.toString()
                    container.dataset.startX = e.clientX.toString()
                    container.dataset.startY = e.clientY.toString()
                  }
                }}
                onMouseUp={(e) => {
                  e.currentTarget.dataset.dragging = 'false'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.dataset.dragging = 'false'
                }}
              >
                <Image
                  src={getImageUrlSync(question.image_path)}
                  alt={`Question ${question.id}`}
                  width={800}
                  height={600}
                  className="w-full h-full object-contain transition-transform duration-200 cursor-grab active:cursor-grabbing"
                  style={{ transform: 'scale(1) translate(0px, 0px)' }}
                  data-scale="1"
                  data-x="0"
                  data-y="0"
                  onDoubleClick={(e) => {
                    const img = e.currentTarget as HTMLImageElement
                    img.style.transform = 'scale(1) translate(0px, 0px)'
                    img.dataset.scale = '1'
                    img.dataset.x = '0'
                    img.dataset.y = '0'
                  }}
                />
              </div>
              <div className="image-control-overlay">
                🔍 Molette: zoom • 🖱️ Clic-drag: déplacer • 🔄 Double-clic: reset
              </div>
            </div>
            
          </div>
          
          {/* Champs de modification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Numéro de question */}
            <div>
              <label className="text-sm font-medium mb-2 block">Numéro de question</label>
              <input
                type="number"
                value={formData.numero_question}
                onChange={(e) => {
                  const newData = { ...formData, numero_question: parseInt(e.target.value) || 0 }
                  setFormData(newData)
                }}
                className="w-full px-3 py-2 border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
              />
            </div>

            {/* Code question */}
            <div>
              <label className="text-sm font-medium mb-2 block">Code question</label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
              />
              <p className="text-xs text-muted-foreground mt-1">
                ID permanent: {formData.id.substring(0, 8)}...
              </p>
            </div>

            {/* Catégorie */}
            <div>
              <label className="text-sm font-medium mb-2 block">Catégorie</label>
              <input
                type="text"
                value={formData.categorie || ''}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
              />
            </div>

            {/* Astag D/F/I */}
            <div>
              <label className="text-sm font-medium mb-2 block">Astag D/F/I</label>
              <input
                type="text"
                value={formData["astag D/F/I "] || ''}
                onChange={(e) => setFormData({ ...formData, "astag D/F/I ": e.target.value })}
                placeholder="Ex: 2/24"
                className="w-full px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Énoncé</label>
              <textarea
                value={formData.enonce || ''}
                onChange={(e) => setFormData({...formData, enonce: e.target.value})}
                rows={3}
                className="mt-1 w-full px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        
        <div className="space-y-4">
          <label className="text-sm font-medium">Réponses</label>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge 
                variant={formData.bonne_reponse === 'a' ? 'default' : 'outline'}
                className="cursor-pointer min-w-8 h-8 flex items-center justify-center text-sm font-bold"
                onClick={() => setFormData({...formData, bonne_reponse: 'a'})}
              >
                A
              </Badge>
              <textarea
                value={formData.options.a}
                onChange={(e) => setFormData({
                  ...formData,
                  options: {...formData.options, a: e.target.value}
                })}
                rows={2}
                className="flex-1 px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Réponse A"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <Badge 
                variant={formData.bonne_reponse === 'b' ? 'default' : 'outline'}
                className="cursor-pointer min-w-8 h-8 flex items-center justify-center text-sm font-bold"
                onClick={() => setFormData({...formData, bonne_reponse: 'b'})}
              >
                B
              </Badge>
              <textarea
                value={formData.options.b}
                onChange={(e) => setFormData({
                  ...formData,
                  options: {...formData.options, b: e.target.value}
                })}
                rows={2}
                className="flex-1 px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Réponse B"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <Badge 
                variant={formData.bonne_reponse === 'c' ? 'default' : 'outline'}
                className="cursor-pointer min-w-8 h-8 flex items-center justify-center text-sm font-bold"
                onClick={() => setFormData({...formData, bonne_reponse: 'c'})}
              >
                C
              </Badge>
              <textarea
                value={formData.options.c}
                onChange={(e) => setFormData({
                  ...formData,
                  options: {...formData.options, c: e.target.value}
                })}
                rows={2}
                className="flex-1 px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Réponse C"
              />
            </div>
          </div>
        </div>
        
        {/* Statut de validation */}
        <div className="border-t pt-4 mt-4">
          <label className="text-sm font-medium mb-3 block">Statut de validation</label>
          <div className="flex gap-2">
            <Button 
              size="sm"
              variant={(formData.validation_status || 'non_verifie') === 'non_verifie' ? 'default' : 'outline'}
              onClick={() => setFormData({ ...formData, validation_status: 'non_verifie' })}
              className={(formData.validation_status || 'non_verifie') === 'non_verifie' ? 'bg-gray-500 hover:bg-gray-600' : ''}
            >
              ❓ Non vérifiée
            </Button>
            <Button 
              size="sm"
              variant={formData.validation_status === 'a_corriger' ? 'default' : 'outline'}
              onClick={() => setFormData({ ...formData, validation_status: 'a_corriger' })}
              className={formData.validation_status === 'a_corriger' ? 'bg-orange-500 hover:bg-orange-600' : ''}
            >
              ⚠️ À corriger
            </Button>
            <Button 
              size="sm"
              variant={formData.validation_status === 'valide' ? 'default' : 'outline'}
              onClick={() => setFormData({ ...formData, validation_status: 'valide' })}
              className={formData.validation_status === 'valide' ? 'bg-green-500 hover:bg-green-600' : ''}
            >
              ✓ Validée
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button onClick={() => onSave(formData)}>
            Sauvegarder
          </Button>
        </div>
      </CardContent>
    </Card>
    
    {/* Overlay de zoom pour le mode édition */}
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
            src={getImageUrlSync(question.image_path)} 
            alt={`Question ${question.id} - Zoom`}
            width={1200}
            height={900}
            className="max-w-full max-h-full object-contain cursor-pointer"
            onClick={() => setIsImageZoomed(false)}
          />
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
  </>
  )
}

