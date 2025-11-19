'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ThemeToggle } from './theme-toggle'
import { 
  BarChart3, 
  BookOpen, 
  FileText, 
  Menu,
  X,
  Settings,
  LogIn,
  LogOut,
  User,
  Trophy
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: BarChart3 },
  { name: 'Entraînement', href: '/train', icon: BookOpen },
  { name: 'Examens', href: '/exam', icon: FileText },
  { name: 'Succès', href: '/achievements', icon: Trophy },
  { name: 'Paramètres', href: '/settings', icon: Settings },
]

export default function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session, status } = useSession()

  return (
    <nav className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/images/logo_codeBus_claire.png" 
              alt="Code Bus Logo" 
              width={64}
              height={64}
              className="h-16 w-16 object-contain"
            />
            <span className="hidden lg:block font-black text-foreground text-xl tracking-tight" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              Code Bus
            </span>
          </Link>

          {/* Navigation desktop */}
          {session && (
            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={`${
                        isActive 
                               ? 'bg-primary text-primary-foreground' // Pas de hover sur fond jaune
                          : 'nav-link-hover' // Hover jaune seulement si pas sur fond jaune
                      }`}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Theme toggle et connexion - visible sur desktop et mobile */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {/* Boutons de connexion/déconnexion */}
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : session ? (
              <div className="flex items-center gap-2">
                {/* Informations utilisateur */}
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  {session.user?.image && (
                    <Image 
                      src={session.user.image} 
                      alt="Avatar" 
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="text-muted-foreground">
                    {session.user?.name || session.user?.email}
                  </span>
                  {session.user?.role === 'ADMIN' && (
                    <Badge variant="secondary" className="text-xs">
                      Admin
                    </Badge>
                  )}
                </div>
                
                {/* Bouton déconnexion */}
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => signOut()}
                         className="nav-link-hover"
                       >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </Button>
              </div>
            ) : (
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => signIn()}
                       className="nav-link-hover"
                     >
                <LogIn className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Connexion</span>
              </Button>
            )}
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden interactive-hover"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="space-y-1">
              {session && navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                             className={`w-full justify-start ${
                               isActive 
                                      ? 'bg-primary text-primary-foreground'
                                   : 'nav-link-hover'
                             }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
              
              {/* Séparateur - afficher seulement si connecté */}
              {session && <div className="border-t border-border my-2" />}
              
              {/* Connexion/Déconnexion mobile */}
              {status === 'loading' ? (
                <div className="w-full h-8 rounded bg-muted animate-pulse" />
              ) : session ? (
                <div className="space-y-2">
                  {/* Informations utilisateur mobile */}
                  <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                    {session.user?.image && (
                      <Image 
                        src={session.user.image} 
                        width={24}
                        height={24}
                        alt="Avatar" 
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <div>
                      <div className="font-medium">
                        {session.user?.name || session.user?.email}
                      </div>
                      {session.user?.role === 'ADMIN' && (
                        <Badge variant="secondary" className="text-xs">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Bouton déconnexion mobile */}
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => {
                             signOut()
                             setMobileMenuOpen(false)
                           }}
                           className="w-full justify-start nav-link-hover"
                         >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </Button>
                </div>
              ) : (
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => {
                           signIn()
                           setMobileMenuOpen(false)
                         }}
                         className="w-full justify-start nav-link-hover"
                       >
                  <LogIn className="h-4 w-4 mr-2" />
                  Connexion
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
