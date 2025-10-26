import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

const HISTORY_FILE = path.join(process.cwd(), 'data', 'exam-history.json')

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  const userId = session.user.id
  
  try {
    let history = []
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, 'utf-8')
      const allHistory = JSON.parse(data)
      history = allHistory.filter((h: any) => h.userId === userId)
    }
    
    // Trier par date décroissante
    history.sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    
    return NextResponse.json({ history })
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  const userId = session.user.id
  const examData = await request.json()
  
  try {
    let history = []
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, 'utf-8')
      history = JSON.parse(data)
    }
    
    const newEntry = {
      id: `${userId}_${Date.now()}`,
      userId,
      ...examData,
      completedAt: new Date().toISOString()
    }
    
    history.push(newEntry)
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2))
    
    return NextResponse.json({ success: true, entry: newEntry })
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'historique:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
