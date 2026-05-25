import type { Metadata } from 'next'
import { Inter, Bricolage_Grotesque, Kalam, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import CookieBanner from '@/components/cookie-banner'
import Script from 'next/script'
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

const kalam = Kalam({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-kalam',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
})

const BASE_URL = 'https://leadmapper.pro'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'LeadMapper — Find Local Business Leads Instantly',
    template: '%s | LeadMapper',
  },
  description:
    'Search businesses by keyword and location. Get verified names, phones, websites & ratings. Export leads to CSV in under 30 seconds. Trusted by agencies, SDRs, and cold emailers.',
  keywords: [
    'lead generation',
    'local business leads',
    'business lead scraper',
    'Google Maps lead finder',
    'B2B leads',
    'cold email leads',
    'lead export CSV',
    'sales prospecting tool',
    'agency lead generation',
    'LeadMapper',
  ],
  authors: [{ name: 'LeadMapper', url: BASE_URL }],
  creator: 'LeadMapper',
  publisher: 'LeadMapper',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'LeadMapper',
    title: 'LeadMapper — Find Local Business Leads Instantly',
    description:
      'Search businesses by keyword and location. Export verified leads to CSV in under 30 seconds. Trusted by agencies, SDRs, and cold emailers.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LeadMapper — Find Local Business Leads Instantly',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LeadMapper — Find Local Business Leads Instantly',
    description:
      'Search businesses by keyword and location. Export verified leads to CSV in under 30 seconds.',
    images: ['/og-image.png'],
    creator: '@leadmapper',
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${bricolage.variable} ${kalam.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1940456086597353');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1940456086597353&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
        <CookieBanner />
      </body>
    </html>
  )
}
