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
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
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
