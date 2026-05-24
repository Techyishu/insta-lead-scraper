import type { Metadata } from 'next'
import ContactPageClient from '@/components/contact-page-client'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the LeadMapper team. We typically respond within a few hours. Ask about plans, integrations, or anything else.',
  alternates: { canonical: 'https://leadmapper.pro/contact' },
  robots: { index: true, follow: true },
}

export default function ContactPage() {
  return <ContactPageClient />
}
