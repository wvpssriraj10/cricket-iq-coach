import React from "react"
import type { Metadata } from 'next'
import { Fira_Sans, Fira_Code } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AILayers } from '@/components/ai/ai-layers'
import './globals.css'

const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fira-sans",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fira-code",
});

export const metadata: Metadata = {
  title: 'Cricket IQ Coach - Analytics Dashboard',
  description: 'Cricket coaching analytics with performance tracking, match scenario simulations, and field placement tutor',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png', sizes: 'any' },
      { url: '/icon.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon.png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: '/icon.png',
  },
}

import { AuthProvider } from '@/components/auth-provider'
import { getUserProfile } from '@/utils/auth'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const authData = await getUserProfile();

  return (
    <html lang="en">
      <body className={`${firaSans.variable} ${firaCode.variable} font-sans antialiased`}>
        <AuthProvider user={authData?.user} profile={authData?.profile as any}>
          {children}
          <Analytics />
          <AILayers />
        </AuthProvider>
      </body>
    </html>
  )
}
