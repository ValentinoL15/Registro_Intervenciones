import React from "react"
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"

const _inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Sistema de Gestión - Centro de Atención',
  description: 'Sistema de gestión de intervenciones para profesionales',
  generator: 'v0.app',
  icons: {
    icon: '/logo-escuela.jpeg', // Apunta directamente a tu archivo en public
    apple: '/logo-escuela.jpeg', // También lo usamos para dispositivos Apple
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
