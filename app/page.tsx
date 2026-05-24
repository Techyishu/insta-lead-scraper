import { JsonLd } from '@/components/json-ld'
import LandingPage from '@/components/landing-page-client'

const BASE_URL = 'https://leadmapper.pro'

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'LeadMapper',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description:
    'LeadMapper helps agencies, SDRs, and freelancers find verified local business leads instantly using Google Maps data.',
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    url: `${BASE_URL}/contact`,
  },
}

const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'LeadMapper',
  url: BASE_URL,
  description:
    'Search businesses by keyword and location. Export verified leads — names, phones, websites, and ratings — to CSV in under 30 seconds.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: [
    {
      '@type': 'Offer',
      name: 'Free Plan',
      price: '0',
      priceCurrency: 'USD',
      description: '50 lifetime credits, CSV export, basic search',
    },
    {
      '@type': 'Offer',
      name: 'Starter Plan',
      price: '49',
      priceCurrency: 'USD',
      description: '5,000 credits/month, CSV export, email support',
    },
    {
      '@type': 'Offer',
      name: 'Growth Plan',
      price: '89',
      priceCurrency: 'USD',
      description: '10,000 credits/month, bulk processing, priority support',
    },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What data does LeadMapper provide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LeadMapper provides business name, address, phone number, website URL, Google Maps link, star rating, and review count.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do credits work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Each business lead you retrieve costs 1 credit. Credits are consumed when results are returned. Exporting does not consume additional credits.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is there a free plan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The free plan includes 50 credits — enough to test the product and find your first leads. No credit card required to sign up.',
      },
    },
    {
      '@type': 'Question',
      name: 'What countries are supported?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LeadMapper works in 50+ countries including USA, UK, Canada, Australia, India, UAE, Germany, France, Spain, Brazil, and more.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I export leads to CSV?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. LeadMapper supports CSV and Excel exports. You can export all results or select specific rows. Export history is saved in your dashboard for easy re-download.',
      },
    },
    {
      '@type': 'Question',
      name: 'How quickly are exports generated?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Exports are generated instantly once your search completes. Click Export CSV and your file downloads immediately.',
      },
    },
  ],
}

export default function Page() {
  return (
    <>
      <JsonLd data={organizationSchema} />
      <JsonLd data={webApplicationSchema} />
      <JsonLd data={faqSchema} />
      <LandingPage />
    </>
  )
}
