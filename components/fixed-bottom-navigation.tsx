'use client'

import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { BookOpen, FileText } from 'lucide-react'

export function FixedBottomNavigation() {
  const router = useRouter()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg z-40 p-3">
      <div className="flex gap-2">
        <Button 
          onClick={() => router.push('/train')}
          className="flex-1 h-12 text-sm font-semibold"
          variant="outline"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Entraînement
        </Button>
        
        <Button 
          onClick={() => router.push('/exam')}
          className="flex-1 h-12 text-sm font-semibold"
        >
          <FileText className="h-4 w-4 mr-2" />
          Examen
        </Button>
      </div>
    </div>
  )
}










