"use client"

import type React from "react"

import { useMemo, useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, Upload, Download } from "lucide-react"

// Countries & Cities with High Potential for $500 Website Clients
const COUNTRIES_CITIES = {
  "United States": [
    "Boise, Idaho",
    "Des Moines, Iowa", 
    "Tulsa, Oklahoma",
    "Chattanooga, Tennessee",
    "Spokane, Washington",
    "Little Rock, Arkansas"
  ],
  "United Kingdom": [
    "Leicester",
    "Nottingham",
    "Plymouth", 
    "Sunderland",
    "Wolverhampton",
    "Derby"
  ],
  "Australia": [
    "Hobart, Tasmania",
    "Townsville, Queensland",
    "Cairns, Queensland",
    "Launceston, Tasmania", 
    "Darwin, Northern Territory",
    "Rockhampton, Queensland"
  ],
  "Canada": [
    "Saskatoon, Saskatchewan",
    "Regina, Saskatchewan",
    "Kelowna, British Columbia",
    "Moncton, New Brunswick",
    "St. John's, Newfoundland and Labrador",
    "Kamloops, British Columbia"
  ],
  "New Zealand": [
    "Hamilton",
    "Tauranga",
    "Napier",
    "Hastings",
    "Nelson", 
    "Palmerston North"
  ],
  "Ireland": [
    "Limerick",
    "Galway",
    "Waterford",
    "Kilkenny",
    "Sligo",
    "Dundalk"
  ],
  "India": [
    "Mumbai, Maharashtra",
    "Delhi",
    "Bangalore, Karnataka",
    "Hyderabad, Telangana",
    "Chennai, Tamil Nadu",
    "Kolkata, West Bengal",
    "Pune, Maharashtra",
    "Ahmedabad, Gujarat",
    "Jaipur, Rajasthan",
    "Surat, Gujarat",
    "Lucknow, Uttar Pradesh",
    "Kanpur, Uttar Pradesh",
    "Nagpur, Maharashtra",
    "Indore, Madhya Pradesh",
    "Thane, Maharashtra",
    "Bhopal, Madhya Pradesh",
    "Visakhapatnam, Andhra Pradesh",
    "Pimpri-Chinchwad, Maharashtra",
    "Patna, Bihar",
    "Vadodara, Gujarat",
    "Ghaziabad, Uttar Pradesh",
    "Ludhiana, Punjab",
    "Agra, Uttar Pradesh",
    "Nashik, Maharashtra",
    "Faridabad, Haryana"
  ]
} as const

// Keyword suggestions for different professions and services
const KEYWORD_SUGGESTIONS = {
  "dentist": ["dental", "dentistry", "orthodontist", "oral surgeon", "periodontist", "endodontist", "dental hygienist", "cosmetic dentist", "pediatric dentist", "dental clinic"],
  "doctor": ["physician", "medical", "healthcare", "clinic", "surgeon", "specialist", "cardiologist", "dermatologist", "neurologist", "pediatrician", "family medicine"],
  "lawyer": ["attorney", "legal", "law firm", "legal services", "litigation", "criminal lawyer", "family lawyer", "corporate lawyer", "personal injury lawyer", "immigration lawyer"],
  "photographer": ["photography", "wedding photographer", "portrait photographer", "event photographer", "commercial photographer", "photo studio", "headshots", "family photographer"],
  "plumber": ["plumbing", "plumbing services", "drain cleaning", "pipe repair", "water heater", "emergency plumber", "residential plumber", "commercial plumber"],
  "electrician": ["electrical", "electrical services", "electrical repair", "wiring", "electrical contractor", "residential electrician", "commercial electrician", "electrical installation"],
  "realtor": ["real estate", "property", "homes", "real estate agent", "broker", "property sales", "residential realtor", "commercial realtor", "listing agent"],
  "restaurant": ["food", "dining", "cuisine", "chef", "catering", "fine dining", "fast food", "local restaurant", "family restaurant", "takeout"],
  "salon": ["beauty", "hair salon", "hairstylist", "barber", "beauty salon", "nail salon", "spa", "hair cutting", "hair coloring", "beauty services"],
  "gym": ["fitness", "personal trainer", "workout", "fitness center", "health club", "crossfit", "yoga studio", "pilates", "strength training"],
  "bakery": ["baking", "pastry", "bread", "cakes", "cookies", "custom cakes", "wedding cakes", "fresh bread", "pastries", "desserts"],
  "mechanic": ["auto repair", "car repair", "automotive", "auto service", "engine repair", "brake repair", "oil change", "transmission repair"],
  "consultant": ["consulting", "business consultant", "marketing consultant", "financial consultant", "strategy consultant", "management consultant"],
  "coach": ["coaching", "life coach", "business coach", "sports coach", "fitness coach", "career coach", "wellness coach"],
  "therapist": ["therapy", "counseling", "mental health", "psychologist", "marriage counselor", "family therapist", "behavioral therapist"],
  "accountant": ["accounting", "bookkeeping", "tax preparation", "financial services", "CPA", "tax accountant", "business accounting"],
  "architect": ["architecture", "building design", "residential architect", "commercial architect", "interior design", "structural design"],
  "contractor": ["construction", "home improvement", "general contractor", "renovation", "remodeling", "building contractor"],
  "florist": ["flowers", "floral design", "wedding flowers", "flower arrangements", "flower shop", "event flowers", "bouquets"],
  "veterinarian": ["vet", "animal hospital", "pet care", "veterinary clinic", "animal doctor", "pet health", "emergency vet"],
  "chiropractor": ["chiropractic", "spine care", "back pain", "neck pain", "sports chiropractor", "wellness center"],
  "massage": ["massage therapy", "therapeutic massage", "deep tissue massage", "relaxation massage", "sports massage", "spa services"],
  "tutor": ["tutoring", "education", "academic support", "test prep", "math tutor", "english tutor", "private tutor"],
  "insurance": ["insurance agent", "auto insurance", "home insurance", "life insurance", "health insurance", "insurance broker"],
  "travel": ["travel agent", "vacation planning", "tour guide", "travel services", "cruise specialist", "destination wedding"],
  "cleaning": ["cleaning service", "house cleaning", "commercial cleaning", "carpet cleaning", "window cleaning", "deep cleaning"],
  "landscaping": ["landscape design", "lawn care", "gardening", "tree service", "irrigation", "hardscaping", "outdoor design"],
  "pest": ["pest control", "exterminator", "bug control", "rodent control", "termite control", "wildlife removal"],
  "security": ["security services", "security guard", "alarm systems", "surveillance", "home security", "security company"],
  "moving": ["moving company", "movers", "relocation", "packing services", "local moving", "long distance moving"],
  "catering": ["caterer", "event catering", "wedding catering", "corporate catering", "party catering", "food service"],
  "wedding": ["wedding planner", "bridal", "wedding services", "wedding venue", "wedding coordinator", "event planning"],
  "music": ["musician", "band", "DJ", "music teacher", "wedding music", "live music", "entertainment"],
  "construction": ["builder", "home builder", "commercial construction", "residential construction", "building services"],
  "painting": ["painter", "house painting", "commercial painting", "interior painting", "exterior painting", "paint contractor"],
  "roofing": ["roofer", "roof repair", "roof replacement", "commercial roofing", "residential roofing", "roof contractor"],
  "hvac": ["heating", "cooling", "air conditioning", "furnace repair", "HVAC contractor", "climate control"],
  "pool": ["pool service", "pool cleaning", "pool maintenance", "pool repair", "swimming pool", "pool contractor"],
  "handyman": ["home repair", "maintenance", "fix", "installation", "repair services", "home services"],
  "locksmith": ["lock repair", "key service", "lock installation", "emergency locksmith", "automotive locksmith"],
  "jeweler": ["jewelry", "custom jewelry", "jewelry repair", "engagement rings", "wedding rings", "fine jewelry"],
  "optometrist": ["eye doctor", "vision care", "eye exam", "glasses", "contact lenses", "optical"],
  "pharmacist": ["pharmacy", "medication", "prescription", "drug store", "clinical pharmacist"],
  "nutritionist": ["nutrition", "dietitian", "meal planning", "weight loss", "health coaching", "wellness"],
  "yoga": ["yoga instructor", "meditation", "mindfulness", "wellness", "spiritual", "holistic health"],
  "art": ["artist", "art gallery", "custom art", "portraits", "paintings", "art studio", "creative services"],
  "web": ["web developer", "website design", "digital marketing", "SEO", "web design", "online marketing"],
  "graphic": ["graphic designer", "logo design", "branding", "marketing materials", "print design", "digital design"],
  "event": ["event planner", "party planning", "corporate events", "special events", "event coordination"],
  "fashion": ["fashion designer", "clothing", "boutique", "custom clothing", "alterations", "fashion stylist"],
  "finance": ["financial advisor", "investment", "retirement planning", "wealth management", "financial planning"],
  "tech": ["technology", "IT services", "computer repair", "tech support", "software", "hardware"],
  "auto": ["car dealer", "auto sales", "used cars", "automotive sales", "car lot", "vehicle sales"],
  "cafe": ["coffee shop", "coffee house", "bistro", "espresso bar", "coffee roaster", "tea house", "local cafe", "specialty coffee", "breakfast cafe"],
  "retail": ["boutique", "store", "shop", "retail store", "gift shop", "specialty store", "local business", "merchant", "retailer"],
  "hotel": ["accommodation", "bed and breakfast", "inn", "motel", "guest house", "resort", "hospitality", "lodging", "vacation rental"],
  "logistics": ["shipping", "freight", "delivery service", "courier", "transportation", "moving company", "logistics company", "warehouse"],
  "fitness": ["personal trainer", "gym", "fitness center", "crossfit", "yoga studio", "pilates", "martial arts", "wellness center", "health club"],
  "medical": ["clinic", "medical center", "healthcare", "urgent care", "family practice", "medical office", "health services", "wellness clinic"],
  "dental": ["dentist", "dental office", "orthodontist", "dental clinic", "oral health", "dental care", "dental practice", "dental hygienist"],
  "automotive_repair": ["auto repair", "car service", "mechanic", "auto shop", "tire service", "oil change", "brake repair", "automotive service"],
  "building": ["contractor", "builder", "construction company", "home improvement", "renovation", "remodeling", "handyman", "building services"],
  "beauty": ["salon", "spa", "beauty parlor", "nail salon", "hair salon", "barber shop", "beauty services", "cosmetics", "skincare"],
  "education": ["tutoring", "school", "learning center", "training", "education services", "academic support", "private lessons", "coaching"],
  "childcare": ["daycare", "preschool", "childcare center", "babysitting", "nursery", "kids care", "early childhood", "child development"],
  "pet": ["veterinarian", "pet grooming", "pet store", "animal hospital", "pet care", "dog training", "pet boarding", "animal clinic"],
  "home": ["cleaning service", "maid service", "housekeeping", "home maintenance", "lawn care", "landscaping", "gardening", "yard work"],
  "food": ["restaurant", "catering", "food truck", "bakery", "deli", "pizzeria", "food service", "meal delivery", "chef services"],
  "professional": ["consultant", "accountant", "lawyer", "financial advisor", "business services", "professional services", "coaching", "training"],
  "creative": ["photographer", "videographer", "graphic designer", "marketing", "advertising", "creative services", "branding", "content creator"],
  "entertainment": ["DJ", "musician", "band", "entertainment", "event services", "party planning", "wedding services", "performer"],
  "repair": ["repair service", "appliance repair", "computer repair", "phone repair", "electronics repair", "small engine repair", "tool repair"],
  "wellness": ["massage therapy", "acupuncture", "naturopath", "wellness coach", "life coach", "mental health", "counseling", "therapy"],
  "outdoor": ["landscaping", "tree service", "lawn care", "pest control", "pool service", "outdoor services", "gardening", "yard maintenance"],
  "specialty": ["locksmith", "jeweler", "watch repair", "shoe repair", "tailor", "alterations", "custom services", "specialty repair"],
  "transport": ["taxi", "rideshare", "delivery", "courier", "transportation service", "logistics", "moving service", "freight"],
  "event_planning": ["wedding planner", "event coordinator", "party rental", "catering", "florist", "event services", "celebration planning"],
  "senior": ["senior care", "elderly care", "home care", "assisted living", "senior services", "caregiving", "elder care", "nursing"],
  "storage": ["self storage", "storage facility", "warehouse", "mini storage", "storage solutions", "moving storage", "secure storage"],
  "printing": ["print shop", "printing services", "copy center", "custom printing", "business cards", "marketing materials", "signage"],
  "security_services": ["security services", "alarm company", "surveillance", "security systems", "guard services", "protection services"],
  "waste": ["junk removal", "waste management", "recycling", "dumpster rental", "cleanup services", "debris removal", "hauling"],
  "water": ["plumbing", "water damage", "restoration", "water treatment", "well services", "septic", "drain cleaning", "pipe repair"],
  "electrical": ["electrician", "electrical contractor", "lighting", "electrical repair", "wiring", "electrical installation", "power solutions"],
  "hvac_services": ["heating", "cooling", "air conditioning", "furnace", "HVAC contractor", "climate control", "ventilation", "ductwork"],
  "roofing_services": ["roofer", "roofing contractor", "roof repair", "roof replacement", "gutter services", "siding", "exterior services"],
  "window": ["window cleaning", "window replacement", "glass repair", "window installation", "glass services", "glazier"],
  "furniture": ["furniture store", "custom furniture", "furniture repair", "upholstery", "antique restoration", "furniture refinishing"],
  "appliance": ["appliance repair", "appliance sales", "refrigerator repair", "washer repair", "dryer repair", "appliance service"],
  "computer": ["computer repair", "IT services", "tech support", "computer sales", "laptop repair", "data recovery", "network services"],
  "mobile": ["phone repair", "cell phone store", "mobile device repair", "screen repair", "phone unlocking", "mobile accessories"]
} as const

type ResultItem = {
  title: string
  url: string
  username?: string
  fullName?: string
  bio?: string
  followers?: number
  following?: number
  posts?: number
  verified?: boolean
  businessAccount?: boolean
  profilePicUrl?: string
  externalUrl?: string
  contactInfo?: {
    email?: string
    phone?: string
    address?: string
  }
}

export default function LeadScraper() {
  const [who, setWho] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedCity, setSelectedCity] = useState("")

  const [limit, setLimit] = useState(50)
  const [results, setResults] = useState<ResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enrichProfiles, setEnrichProfiles] = useState(false)

  // Keyword suggestions state
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMorePages, setHasMorePages] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [seenUrls, setSeenUrls] = useState<Set<string>>(new Set())

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const suggestionsRef = useRef<HTMLDivElement | null>(null)

  const composedQuery = useMemo(() => {
    const w = who.trim()
    const l = selectedCity.trim()
    if (!w || !l) return ""
    return `site:instagram.com ${w} ${l}`
  }, [who, selectedCity])

  // Generate suggestions based on user input
  const generateSuggestions = (input: string): string[] => {
    if (!input.trim()) return []
    
    const inputLower = input.toLowerCase().trim()
    const allSuggestions: string[] = []
    
    // First, check for exact key matches
    Object.entries(KEYWORD_SUGGESTIONS).forEach(([key, keywords]) => {
      if (key.toLowerCase().includes(inputLower)) {
        allSuggestions.push(key, ...keywords)
      }
    })
    
    // Then, check for keyword matches within suggestions
    Object.entries(KEYWORD_SUGGESTIONS).forEach(([key, keywords]) => {
      keywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(inputLower) && !allSuggestions.includes(keyword)) {
          allSuggestions.push(keyword)
        }
      })
    })
    
    // Remove duplicates and filter out the current input
    const uniqueSuggestions = [...new Set(allSuggestions)]
      .filter(suggestion => suggestion.toLowerCase() !== inputLower)
      .slice(0, 8) // Limit to 8 suggestions
    
    return uniqueSuggestions
  }

  // Handle input change with suggestions
  const handleWhoChange = (value: string) => {
    setWho(value)
    const newSuggestions = generateSuggestions(value)
    setSuggestions(newSuggestions)
    setShowSuggestions(newSuggestions.length > 0)
    setActiveSuggestionIndex(-1)
  }

  // Handle suggestion selection
  const selectSuggestion = (suggestion: string) => {
    setWho(suggestion)
    setShowSuggestions(false)
    setSuggestions([])
    setActiveSuggestionIndex(-1)
    inputRef.current?.focus()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        if (activeSuggestionIndex >= 0) {
          e.preventDefault()
          selectSuggestion(suggestions[activeSuggestionIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setActiveSuggestionIndex(-1)
        break
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setActiveSuggestionIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setResults([])
    setCurrentPage(1)
    setHasMorePages(false)
    setSeenUrls(new Set())

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minute timeout

      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          who,
          location: selectedCity,
          limit,
          enrichProfiles,
          page: 1,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const text = await res.text()
        if (res.status === 408) {
          throw new Error(`Request timeout. Large result sets (${limit} leads) can take too long to process. Try with a smaller limit or check your network connection.`)
        }
        throw new Error(text || "Failed to fetch results")
      }

      const data = (await res.json()) as { 
        results: ResultItem[]; 
        query: string;
        hasMorePages?: boolean;
        totalFound?: number;
        page?: number;
      }
      console.log('Frontend received data:', { 
        resultsLength: data.results?.length, 
        limit,
        hasMorePages: data.hasMorePages,
        page: data.page || 1,
        data: data 
      })
      
      const newResults = data.results || []
      const newSeenUrls = new Set<string>()
      
      // Track seen URLs
      newResults.forEach(result => {
        newSeenUrls.add(result.url)
      })
      
      setResults(newResults)
      setSeenUrls(newSeenUrls)
      setHasMorePages(data.hasMorePages || false)
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError(`Request timeout after 2 minutes. Large result sets (${limit} leads) may take too long. Try with a smaller limit.`)
      } else {
        setError(err?.message || "Something went wrong while fetching results.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Load more results function
  async function loadMoreResults() {
    if (loadingMore || !hasMorePages) return
    
    setLoadingMore(true)
    setError(null)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000)

      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          who,
          location: selectedCity,
          limit,
          enrichProfiles,
          page: currentPage + 1,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const text = await res.text()
        if (res.status === 408) {
          throw new Error(`Request timeout while loading more results. Try with a smaller limit.`)
        }
        throw new Error(text || "Failed to load more results")
      }

      const data = (await res.json()) as { 
        results: ResultItem[]; 
        hasMorePages?: boolean;
        totalFound?: number;
        page?: number;
      }
      
      // Filter out duplicate URLs and log the process
      const allNewResults = data.results || []
      const newResults = allNewResults.filter(result => !seenUrls.has(result.url))
      const duplicateCount = allNewResults.length - newResults.length
      
      console.log('Load more results:', {
        totalReceived: allNewResults.length,
        duplicatesFiltered: duplicateCount,
        filteredNewResults: newResults.length,
        currentResultsCount: results.length,
        hasMorePages: data.hasMorePages,
        requestedPage: currentPage + 1,
        sampleNewUrls: newResults.slice(0, 3).map(r => r.url),
        sampleExistingUrls: Array.from(seenUrls).slice(0, 3)
      })

      if (newResults.length > 0) {
        // Update seen URLs
        const updatedSeenUrls = new Set(seenUrls)
        newResults.forEach(result => {
          updatedSeenUrls.add(result.url)
        })
        
        // Append new results to existing ones
        setResults(prev => [...prev, ...newResults])
        setSeenUrls(updatedSeenUrls)
        setCurrentPage(prev => prev + 1)
      } else {
        // No new results found - could be all duplicates or end of results
        console.warn('No new results found on page', currentPage + 1, {
          totalReceived: allNewResults.length,
          duplicatesFiltered: duplicateCount,
          hasMorePages: data.hasMorePages
        })
        
        if (allNewResults.length === 0) {
          // No results at all from API - end of results
          setHasMorePages(false)
        } else if (duplicateCount === allNewResults.length) {
          // All results were duplicates - we might still have more unique results on next page
          console.log('All results were duplicates, trying next page...')
          // Don't increment page since we didn't get new results
        }
      }
      
      setHasMorePages(data.hasMorePages || false)
      
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timeout while loading more results.')
      } else {
        setError(err?.message || "Failed to load more results.")
      }
    } finally {
      setLoadingMore(false)
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  function handleDownloadCSV() {
    if (results.length === 0) return

    // Create CSV content
    const headers = enrichProfiles 
      ? ['Name/Title', 'URL', 'Username', 'Full Name', 'Followers', 'Email', 'Phone', 'Website']
      : ['Name/Title', 'URL'];
      
    const csvContent = [
      headers.join(','),
      ...results.map(result => {
        const basicData = [
          `"${result.title.replace(/"/g, '""')}"`,
          `"${result.url}"`
        ];
        
        if (enrichProfiles) {
          return [
            ...basicData,
            `"${result.username || ''}"`,
            `"${result.fullName || ''}"`,
            `"${result.followers || ''}"`,
            `"${result.contactInfo?.email || ''}"`,
            `"${result.contactInfo?.phone || ''}"`,
            `"${result.externalUrl || ''}"`
          ].join(',');
        }
        
        return basicData.join(',');
      })
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `instagram-leads-${who.replace(/[^a-z0-9]/gi, '-')}-${selectedCity.replace(/[^a-z0-9]/gi, '-')}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function normalizeItems(items: any[]): ResultItem[] {
    return (items || [])
      .map((it) => {
        const title = it?.title ?? it?.pageTitle ?? it?.heading ?? it?.name ?? ""
        const url = it?.url ?? it?.link ?? it?.finalUrl ?? it?.pageUrl ?? it?.resultUrl ?? it?.destinationUrl ?? ""
        return { title, url } as ResultItem
      })
      .filter((r) => r.title && r.url)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    try {
      const text = await file.text()
      let json: any
      try {
        json = JSON.parse(text)
      } catch {
        // attempt NDJSON
        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean)
        json = lines.map((l) => JSON.parse(l))
      }
      let items: any[] = Array.isArray(json?.items)
        ? json.items
        : Array.isArray(json?.data?.items)
          ? json.data.items
          : Array.isArray(json)
            ? json
            : Array.isArray(json?.organicResults)
              ? json.organicResults
              : []

      if (items.length === 1 && Array.isArray(items[0]?.organicResults)) {
        items = items[0].organicResults
      }

      const normalized = normalizeItems(items)
      setResults(normalized)
    } catch (err: any) {
      setError("Invalid JSON file. Please provide a valid Apify dataset JSON.")
    } finally {
      // reset input so the same file can be re-selected
      e.target.value = ""
    }
  }

  const searchDisabled = !who.trim() || !selectedCity.trim()

  // Get available cities for selected country
  const availableCities = selectedCountry ? COUNTRIES_CITIES[selectedCountry as keyof typeof COUNTRIES_CITIES] || [] : []

  // Handle country change and reset city selection
  const handleCountryChange = (country: string) => {
    setSelectedCountry(country)
    setSelectedCity("") // Reset city when country changes
  }

  return (
    <div className="grid gap-4 sm:gap-6">
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="grid gap-2 relative">
            <Label htmlFor="who">Who are you looking for?</Label>
            <div className="relative">
              <Input
                ref={inputRef}
                id="who"
                placeholder="e.g., dentist, photographer, lawyer..."
                value={who}
                onChange={(e) => handleWhoChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setShowSuggestions(true)
                  }
                }}
                required
                className="text-base"
                autoComplete="off"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
                >
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={suggestion}
                      className={`px-3 py-2 cursor-pointer text-sm hover:bg-muted transition-colors ${
                        index === activeSuggestionIndex ? 'bg-muted' : ''
                      }`}
                      onClick={() => selectSuggestion(suggestion)}
                      onMouseEnter={() => setActiveSuggestionIndex(index)}
                    >
                      <span className="font-medium">{suggestion}</span>
                      {/* Show if it's a main category */}
                      {Object.keys(KEYWORD_SUGGESTIONS).includes(suggestion.toLowerCase()) && (
                        <span className="text-xs text-muted-foreground ml-2">(category)</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Select value={selectedCountry} onValueChange={handleCountryChange}>
              <SelectTrigger id="country" className="text-base">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(COUNTRIES_CITIES).map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Select 
              value={selectedCity} 
              onValueChange={setSelectedCity}
              disabled={!selectedCountry}
            >
              <SelectTrigger id="city" className="text-base">
                <SelectValue placeholder={selectedCountry ? "Select city" : "Select country first"} />
              </SelectTrigger>
              <SelectContent>
                {availableCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="limit">Max Results</Label>
            <Input
              id="limit"
              type="number"
              min="1"
              max="200"
              placeholder="50"
              value={limit}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1
                setLimit(Math.min(Math.max(value, 1), 200))
              }}
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              Maximum 200 results
              {limit > 100 && (
                <span className="block text-orange-600 mt-1">
                  ⚠️ Large limits (100+) may take longer and could timeout
                </span>
              )}
            </p>
          </div>
        </div>



        <div className="flex items-start space-x-2 p-3 bg-muted/30 rounded-lg border">
          <input
            id="enrichProfiles"
            type="checkbox"
            checked={enrichProfiles}
            onChange={(e) => setEnrichProfiles(e.target.checked)}
            className="h-4 w-4 mt-0.5 flex-shrink-0"
          />
          <div className="space-y-1">
            <Label htmlFor="enrichProfiles" className="text-sm font-medium cursor-pointer">
              Enrich with Instagram profile data
            </Label>
            <p className="text-xs text-muted-foreground">
              Get detailed profiles including follower counts, contact info, and websites
            </p>
          </div>
        </div>

        {composedQuery && (
          <div className="text-xs sm:text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg border">
            <div className="font-medium mb-1">Search Query:</div>
            <code className="text-xs break-all">{composedQuery}</code>
            <div className="text-xs mt-1 opacity-75">
              Searching Google for Instagram profiles
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-3 sm:items-center">
          <Button type="submit" disabled={loading || searchDisabled} className="w-full sm:w-auto flex-shrink-0">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            {loading ? 'Searching...' : 'Search Leads'}
          </Button>

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 w-full sm:w-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleImportClick}
              className="w-full sm:w-auto bg-transparent"
              title="Import Apify results JSON"
            >
              <Upload className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Import Results JSON</span>
              <span className="sm:hidden">Import JSON</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadCSV}
              disabled={results.length === 0}
              className="w-full sm:w-auto bg-transparent"
              title="Download leads as CSV"
            >
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Download CSV</span>
              <span className="sm:hidden">Download</span>
            </Button>
          </div>
        </div>
      </form>

      {loading && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Loading...</AlertTitle>
          <AlertDescription>Fetching results from Apify. This may take a few seconds.</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Request failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="p-3 sm:p-4 border-b">
            <h2 className="text-base sm:text-lg font-medium">Results</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Showing Google results filtered to Instagram.
              {enrichProfiles && " Profile data enriched when available."}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                Total: {results.length}
              </span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                Limit: {limit}
              </span>
              {currentPage > 1 && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  Page: {currentPage}
                </span>
              )}
              {enrichProfiles && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  ✓ Profile enrichment enabled
                </span>
              )}
              {hasMorePages && (
                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                  📄 More pages available
                </span>
              )}

            </div>
          </div>
          
          {/* Mobile/Tablet Card Layout */}
          <div className="block xl:hidden">
            <div className="max-h-[70vh] overflow-y-auto">
              {results.length === 0 && !loading ? (
                <div className="p-6 text-center text-muted-foreground">
                  <div className="text-sm">No results yet.</div>
                  <div className="text-xs mt-1">Try a search above or import a results JSON file.</div>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {results.map((r, idx) => (
                    <div key={`${r.url}-${idx}`} className="p-3 sm:p-4 space-y-3">
                      <div className="space-y-1">
                        <div className="font-medium text-sm leading-tight break-words">
                          {r.title}
                        </div>
                        {r.fullName && r.fullName !== r.title && (
                          <div className="text-xs text-muted-foreground">{r.fullName}</div>
                        )}
                        <div className="text-xs">
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground underline underline-offset-2 break-all hover:text-foreground"
                          >
                            {r.url}
                          </a>
                        </div>
                      </div>
                      {enrichProfiles && (
                        <div className="space-y-2 pt-2 border-t border-muted">
                          {r.username && (
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-medium">@{r.username}</span>
                              {r.verified && <span className="text-blue-500">✓</span>}
                              {r.followers && (
                                <span className="text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                  {r.followers.toLocaleString()} followers
                                </span>
                              )}
                            </div>
                          )}
                          
                          {(r.contactInfo?.email || r.contactInfo?.phone) && (
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-muted-foreground">Contact:</div>
                              <div className="text-xs space-y-1 pl-2">
                                {r.contactInfo.email && (
                                  <div className="flex items-center gap-1">
                                    <span>📧</span>
                                    <a href={`mailto:${r.contactInfo.email}`} className="underline break-all">
                                      {r.contactInfo.email}
                                    </a>
                                  </div>
                                )}
                                {r.contactInfo.phone && (
                                  <div className="flex items-center gap-1">
                                    <span>📞</span>
                                    <a href={`tel:${r.contactInfo.phone}`} className="underline">
                                      {r.contactInfo.phone}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {r.externalUrl && (
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-muted-foreground">Website:</div>
                              <div className="text-xs pl-2">
                                <div className="flex items-center gap-1">
                                  <span>🌐</span>
                                  <a href={r.externalUrl} target="_blank" className="underline break-all hover:text-foreground">
                                    {r.externalUrl}
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden xl:block">
            <div className="max-h-[70vh] overflow-y-auto">
              <Table className="relative w-full table-fixed">
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-1/4">Name/Title</TableHead>
                      <TableHead className="w-1/4">URL</TableHead>
                      {enrichProfiles && (
                        <>
                          <TableHead className="w-1/8">Username</TableHead>
                          <TableHead className="w-1/12 text-center">Followers</TableHead>
                          <TableHead className="w-1/6">Contact</TableHead>
                          <TableHead className="w-1/6">Website</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.length === 0 && !loading ? (
                      <TableRow>
                        <TableCell colSpan={enrichProfiles ? 6 : 2} className="text-center text-muted-foreground py-8">
                          <div className="text-sm">No results yet.</div>
                          <div className="text-xs mt-1">Try a search above or import a results JSON file.</div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      results.map((r, idx) => (
                        <TableRow key={`${r.url}-${idx}`} className="hover:bg-muted/50">
                          <TableCell className="align-top py-3">
                            <div className="space-y-1 overflow-hidden">
                              <div className="font-medium text-sm leading-tight truncate" title={r.title}>{r.title}</div>
                              {r.fullName && r.fullName !== r.title && (
                                <div className="text-xs text-muted-foreground truncate" title={r.fullName}>{r.fullName}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="align-top py-3">
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-foreground underline underline-offset-2 hover:text-primary block truncate"
                              title={r.url}
                            >
                              {r.url}
                            </a>
                          </TableCell>
                          {enrichProfiles && (
                            <>
                              <TableCell className="align-top py-3">
                                {r.username && (
                                  <div className="flex items-center gap-1 text-sm overflow-hidden">
                                    <span className="font-medium truncate" title={`@${r.username}`}>@{r.username}</span>
                                    {r.verified && <span className="text-blue-500 text-xs flex-shrink-0">✓</span>}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="align-top py-3 text-center">
                                {r.followers && (
                                  <div className="text-xs font-medium">
                                    {r.followers >= 1000000 ? 
                                      `${(r.followers / 1000000).toFixed(1)}M` :
                                      r.followers >= 1000 ?
                                      `${(r.followers / 1000).toFixed(1)}K` :
                                      r.followers.toLocaleString()
                                    }
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="align-top py-3">
                                {r.contactInfo && (
                                  <div className="text-xs space-y-1 overflow-hidden">
                                    {r.contactInfo.email && (
                                      <div className="flex items-center gap-1 min-w-0">
                                        <span className="flex-shrink-0">📧</span>
                                        <a href={`mailto:${r.contactInfo.email}`} className="underline hover:text-primary truncate" title={r.contactInfo.email}>
                                          {r.contactInfo.email}
                                        </a>
                                      </div>
                                    )}
                                    {r.contactInfo.phone && (
                                      <div className="flex items-center gap-1">
                                        <span className="flex-shrink-0">📞</span>
                                        <a href={`tel:${r.contactInfo.phone}`} className="underline hover:text-primary" title={r.contactInfo.phone}>
                                          {r.contactInfo.phone}
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="align-top py-3">
                                {r.externalUrl && (
                                  <a href={r.externalUrl} target="_blank" className="text-xs underline hover:text-primary block truncate" title={r.externalUrl}>
                                    {r.externalUrl}
                                  </a>
                                )}
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
          </div>

          {/* Load More Button */}
          {hasMorePages && results.length > 0 && (
            <div className="p-6 border-t bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex flex-col items-center gap-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    More results available
                  </p>
                  <p className="text-xs text-gray-600">
                    Click to load additional Instagram profiles
                  </p>
                </div>
                <Button
                  onClick={loadMoreResults}
                  disabled={loadingMore || loading}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg shadow-sm transition-all duration-200"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Loading More Results...
                    </>
                  ) : (
                    <>
                      <Search className="mr-3 h-5 w-5" />
                      Load More Results
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
          

        </CardContent>
      </Card>
    </div>
  )
}
