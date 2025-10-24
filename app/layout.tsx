import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import React from 'react'
import ConditionalNavigation from '../components/conditional-navigation'
import { ThemeProvider } from '../components/theme-provider'
import AuthSessionProvider from '../components/session-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Code Bus - Entraînement au code de la route',
  description: 'Application d\'entraînement au code de la route pour la catégorie bus',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon-192x192.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-192x192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/favicon-512x512.png" type="image/png" sizes="512x512" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <AuthSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ConditionalNavigation />
            {children}
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
