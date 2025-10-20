import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import React from 'react'
import ConditionalNavigation from '../components/conditional-navigation'
import { ThemeProvider } from '../components/theme-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Code Bus - Entraînement au code de la route',
  description: 'Application d\'entraînement au code de la route pour la catégorie bus',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConditionalNavigation />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
