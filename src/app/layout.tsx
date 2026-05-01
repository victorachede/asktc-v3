import type { Metadata } from 'next'
import './globals.css'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'ASKTC — Live Q&A for Modern Events',
  description:
    'Let your audience ask, vote, and engage — while you stay in full control. Built for conferences, churches, universities, and corporate events.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'ASKTC — Live Q&A for Modern Events',
    description:
      'Let your audience ask, vote, and engage — while you stay in full control. Built for conferences, churches, universities, and corporate events.',
    url: 'https://asktc.vercel.app', // 👈 update to your actual domain
    siteName: 'ASKTC',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ASKTC — Live Q&A for Modern Events',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ASKTC — Live Q&A for Modern Events',
    description:
      'Let your audience ask, vote, and engage — while you stay in full control.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}