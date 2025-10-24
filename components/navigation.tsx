'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
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
  User
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: BarChart3 },
  { name: 'Entraînement', href: '/train', icon: BookOpen },
  { name: 'Examens', href: '/exam', icon: FileText },
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
            <img 
              src="/images/logo_codeBus_claire.png" 
              alt="Code Bus Logo" 
              className="h-16 w-16 object-contain"
            />
            <span className="hidden lg:block font-black text-foreground text-xl tracking-tight" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              Code Bus
            </span>
          </Link>

          {/* Navigation desktop */}
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
                             ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Theme toggle et Auth - visible sur desktop et mobile */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {/* Bouton de connexion/déconnexion */}
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-muted rounded animate-pulse" />
            ) : session ? (
              <div className="flex items-center gap-2">
                {/* Badge utilisateur avec rôle */}
                <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {session.user?.name}
                  {session.user?.role === 'ADMIN' && (
                    <Badge variant="destructive" className="ml-1 text-xs">
                      ADMIN
                    </Badge>
                  )}
                </Badge>
                
                {/* Bouton de déconnexion */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Déconnexion</span>
                </Button>
              </div>
            ) : (
              <Link href="/auth/signin">
                <Button variant="default" size="sm">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Se connecter</span>
                </Button>
              </Link>
            )}
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
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
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={`w-full justify-start ${
                        isActive 
                             ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
              
              {/* Séparateur pour l'authentification */}
              <div className="border-t border-border my-2" />
              
              {/* Options d'authentification mobile */}
              {session ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{session.user?.name}</span>
                    {session.user?.role === 'ADMIN' && (
                      <Badge variant="destructive" className="text-xs">
                        ADMIN
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </Button>
                </div>
              ) : (
                <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="default" size="sm" className="w-full justify-start">
                    <LogIn className="h-4 w-4 mr-2" />
                    Se connecter
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
