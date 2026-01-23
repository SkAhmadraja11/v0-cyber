import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

// Try to load Google Fonts with fallbacks
const _geist = Geist({
  subsets: ["latin"],
  display: 'swap',
  fallback: ['system-ui', 'arial', 'sans-serif']
})

const _geistMono = Geist_Mono({
  subsets: ["latin"],
  display: 'swap',
  fallback: ['Consolas', 'Monaco', 'monospace']
})

export const metadata: Metadata = {
  title: 'PhishGuard AI | Advanced Cyber Defense',
  description: 'Secure your digital life against evolving crypto & phishing threats with PhishGuard AI.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
  icons: {
    icon: [
      {
        url: '/logo1.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/logo1.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/logo1.png',
  },
}

import { PhiusGuardChat } from "@/components/phiusguard-chat"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${_geist.className} ${_geistMono.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}

          <PhiusGuardChat />
        </ThemeProvider>
      </body>
    </html>
  )
}
