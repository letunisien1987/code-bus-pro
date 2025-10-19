'use client'

import { usePathname } from 'next/navigation'
import Navigation from './navigation'

export default function ConditionalNavigation() {
  const pathname = usePathname()
  
  // Ne pas afficher la navigation sur la page d'examen
  if (pathname === '/exam') {
    return null
  }
  
  return <Navigation />
}

