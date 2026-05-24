import type { Metadata } from 'next'
import { Inter, Bricolage_Grotesque } from 'next/font/google'
import CookieBanner from '@/components/cookie-banner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LeadMapper — Find Local Business Leads Instantly',
  description: 'Search businesses by keyword and location. Export verified leads instantly for outreach, prospecting, and lead generation. Trusted by agencies, SDRs, and cold emailers.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${bricolage.variable}`}>
      <body className="antialiased">
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
