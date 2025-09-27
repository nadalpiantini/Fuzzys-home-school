import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Fuzzy's Home School",
  description: 'Educational platform with AI tutoring and gamified learning',
  keywords: ['education', 'AI tutor', 'learning games', 'Spanish', 'English'],
  authors: [{ name: "Fuzzy's Home School Team" }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#8B5CF6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}