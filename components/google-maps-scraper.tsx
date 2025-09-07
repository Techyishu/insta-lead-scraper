"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, Download, MapPin, Phone, Building, MessageCircle, CheckCircle, XCircle, Clock, Database } from "lucide-react"

// Types
interface GoogleMapsLead {
  title: string
  address: string
  phone?: string
  website?: string
  rating?: number
  reviewsCount?: number
  category?: string
  hasWhatsApp?: boolean
  whatsAppStatus?: 'checking' | 'active' | 'inactive' | 'error'
}

// Business categories for Google Maps scraping
const BUSINESS_CATEGORIES = [
  "restaurant",
  "cafe",
  "hotel",
  "gym",
  "spa",
  "salon",
  "dentist",
  "doctor",
  "lawyer",
  "accountant",
  "real estate agent",
  "insurance agent",
  "auto repair",
  "plumber",
  "electrician",
  "contractor",
  "bakery",
  "pharmacy",
  "veterinarian",
  "chiropractor",
  "massage therapist",
  "nail salon",
  "barber shop",
  "clothing store",
  "jewelry store",
  "florist",
  "pet store",
  "bookstore",
  "electronics store",
  "furniture store",
  "home improvement",
  "landscaping",
  "cleaning service",
  "catering",
  "photography",
  "wedding planner",
  "travel agency",
  "car dealership",
  "bank",
  "credit union",
  "tax service",
  "consulting",
  "marketing agency",
  "web design",
  "IT services",
  "tutoring",
  "daycare",
  "senior care",
  "fitness trainer",
  "yoga studio",
  "dance studio",
  "music lessons",
  "art gallery",
  "museum",
  "library",
  "church",
  "nonprofit"
]

// Countries & States/Cities with High Potential for Business Scraping
const COUNTRIES_CITIES = {
  "United States": [
    "Alabama",
    "Alaska", 
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming"
  ],
  "United Kingdom": [
    "London",
    "Birmingham",
    "Manchester",
    "Glasgow",
    "Liverpool",
    "Leeds",
    "Sheffield",
    "Edinburgh",
    "Bristol",
    "Cardiff",
    "Leicester",
    "Coventry",
    "Bradford",
    "Belfast",
    "Nottingham",
    "Kingston upon Hull",
    "Newcastle upon Tyne",
    "Stoke-on-Trent",
    "Southampton",
    "Derby",
    "Portsmouth",
    "Brighton",
    "Plymouth",
    "Northampton",
    "Reading",
    "Luton",
    "Wolverhampton",
    "Bolton",
    "Bournemouth",
    "Norwich",
    "Swindon",
    "Swansea",
    "Southend-on-Sea",
    "Middlesbrough",
    "Milton Keynes",
    "Peterborough",
    "Warrington",
    "Huddersfield",
    "York",
    "Poole",
    "Stockport",
    "Preston",
    "Dundee",
    "Aberdeen",
    "Blackpool",
    "Oxford",
    "Cambridge",
    "Ipswich",
    "Slough",
    "Exeter"
  ],
  "Australia": [
    "Sydney, New South Wales",
    "Melbourne, Victoria",
    "Brisbane, Queensland",
    "Perth, Western Australia",
    "Adelaide, South Australia",
    "Gold Coast, Queensland",
    "Newcastle, New South Wales",
    "Canberra, Australian Capital Territory",
    "Sunshine Coast, Queensland",
    "Wollongong, New South Wales",
    "Hobart, Tasmania",
    "Geelong, Victoria",
    "Townsville, Queensland",
    "Cairns, Queensland",
    "Darwin, Northern Territory",
    "Toowoomba, Queensland",
    "Ballarat, Victoria",
    "Bendigo, Victoria",
    "Albury, New South Wales",
    "Launceston, Tasmania",
    "Mackay, Queensland",
    "Rockhampton, Queensland",
    "Bunbury, Western Australia",
    "Bundaberg, Queensland",
    "Coffs Harbour, New South Wales",
    "Wagga Wagga, New South Wales",
    "Hervey Bay, Queensland",
    "Mildura, Victoria",
    "Shepparton, Victoria",
    "Port Macquarie, New South Wales"
  ],
  "India": [
    "Mumbai, Maharashtra",
    "Delhi, Delhi",
    "Bangalore, Karnataka",
    "Hyderabad, Telangana",
    "Chennai, Tamil Nadu",
    "Kolkata, West Bengal",
    "Pune, Maharashtra",
    "Ahmedabad, Gujarat",
    "Surat, Gujarat",
    "Jaipur, Rajasthan",
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
    "Faridabad, Haryana",
    "Meerut, Uttar Pradesh",
    "Rajkot, Gujarat",
    "Kalyan-Dombivli, Maharashtra",
    "Vasai-Virar, Maharashtra",
    "Varanasi, Uttar Pradesh"
  ]
}

export default function GoogleMapsScraper() {
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [businessCategory, setBusinessCategory] = useState("")
  const [maxResults, setMaxResults] = useState("50")
  const [validateWhatsApp, setValidateWhatsApp] = useState(true)
  const [leads, setLeads] = useState<GoogleMapsLead[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isValidatingWhatsApp, setIsValidatingWhatsApp] = useState(false)
  const [error, setError] = useState("")
  const [savingToDatabase, setSavingToDatabase] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  const availableCities = selectedCountry ? COUNTRIES_CITIES[selectedCountry as keyof typeof COUNTRIES_CITIES] || [] : []

  const handleScrape = async () => {
    if (!selectedCountry || !selectedCity || !businessCategory) {
      setError("Please select country, city, and business category")
      return
    }

    setIsLoading(true)
    setError("")
    setLeads([])

    try {
      const locationQuery = selectedCountry === "United States" ? selectedCity : `${selectedCity}, ${selectedCountry}`
      
      const response = await fetch("/api/google-maps-scraper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locationQuery: locationQuery,
          searchStringsArray: [businessCategory],
          maxCrawledPlacesPerSearch: parseInt(maxResults)
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      const initialLeads = data.leads || []
      setLeads(initialLeads)

      // Validate WhatsApp numbers if enabled and there are phone numbers
      if (validateWhatsApp && initialLeads.length > 0) {
        await validateWhatsAppNumbers(initialLeads)
      }
    } catch (err) {
      console.error("Error scraping Google Maps:", err)
      setError(err instanceof Error ? err.message : "An error occurred while scraping")
    } finally {
      setIsLoading(false)
    }
  }

  const validateWhatsAppNumbers = async (leadsToValidate: GoogleMapsLead[]) => {
    const phoneNumbers = leadsToValidate
      .filter(lead => lead.phone)
      .map(lead => lead.phone!)
    
    if (phoneNumbers.length === 0) return

    setIsValidatingWhatsApp(true)
    
    // Update leads to show checking status
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.phone ? { ...lead, whatsAppStatus: 'checking' as const } : lead
      )
    )

    try {
      const response = await fetch('/api/whatsapp-validator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumbers,
          selectedCountry 
        }),
      })

      if (!response.ok) {
        throw new Error(`WhatsApp validation failed: ${response.status}`)
      }

      const validationData = await response.json()
      
      if (validationData.success && validationData.results) {
        // Update leads with WhatsApp validation results
        setLeads(prevLeads => 
          prevLeads.map(lead => {
            if (!lead.phone) return lead
            
            // Normalize phone numbers for comparison
            const normalizePhone = (phone: string) => phone.replace(/[^\d]/g, '')
            const leadPhoneNormalized = normalizePhone(lead.phone)
            
            const validation = validationData.results.find(
              (result: any) => {
                const resultPhoneNormalized = normalizePhone(result.phoneNumber || '')
                return resultPhoneNormalized === leadPhoneNormalized
              }
            )
            
            console.log(`Matching phone ${lead.phone} (${leadPhoneNormalized}) with validation result:`, validation)
            
            return {
              ...lead,
              hasWhatsApp: validation?.hasWhatsApp || false,
              whatsAppStatus: validation?.hasWhatsApp ? 'active' as const : 'inactive' as const
            }
          })
        )
      }
    } catch (error) {
      console.error('WhatsApp validation error:', error)
      // Update leads to show error status
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.phone ? { ...lead, whatsAppStatus: 'error' as const } : lead
        )
      )
    } finally {
      setIsValidatingWhatsApp(false)
    }
  }

  // Save results to Supabase database
  const saveToDatabase = async () => {
    if (leads.length === 0) return
    
    setSavingToDatabase(true)
    setSaveSuccess(null)
    setError("")
    
    try {
      // Transform leads to match database schema
      const leadsToSave = leads.map(lead => ({
        business_name: lead.title || '',
        address: lead.address || null,
        phone: lead.phone || null,
        website: lead.website || null,
        rating: lead.rating || null,
        reviews_count: lead.reviewsCount || null,
        category: businessCategory || lead.category || null,
        location_searched: selectedCountry === "United States" ? selectedCity : `${selectedCity}, ${selectedCountry}`,
        latitude: null, // This info isn't available from current scraping
        longitude: null, // This info isn't available from current scraping
        place_id: null, // This info isn't available from current scraping
        is_open: null, // This info isn't available from current scraping
        opening_hours: null // This info isn't available from current scraping
      }))
      
      const response = await fetch('/api/save-google-maps-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leads: leadsToSave,
          location: selectedCountry === "United States" ? selectedCity : `${selectedCity}, ${selectedCountry}`,
          category: businessCategory
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save leads')
      }
      
      setSaveSuccess(`Successfully saved ${data.savedLeads} Google Maps leads to database!`)
      
      // Clear success message after 5 seconds
      setTimeout(() => setSaveSuccess(null), 5000)
      
    } catch (error) {
      console.error('Error saving to database:', error)
      setError(error instanceof Error ? error.message : 'Failed to save leads to database')
    } finally {
      setSavingToDatabase(false)
    }
  }

  const exportToCSV = () => {
    if (leads.length === 0) return

    const headers = ["Business Name", "Address", "Phone", "WhatsApp Active", "Website", "Rating", "Reviews Count", "Category"]
    const csvContent = [
      headers.join(","),
      ...leads.map(lead => [
        `"${lead.title || ""}",`,
        `"${lead.address || ""}",`,
        `"${lead.phone || ""}",`,
        lead.hasWhatsApp ? "Yes" : "No",
        `"${lead.website || ""}",`,
        lead.rating || "",
        lead.reviewsCount || "",
        `"${lead.category || businessCategory || ""}",`
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `google-maps-leads-${businessCategory}-${selectedCity.replace(/[^a-zA-Z0-9]/g, "-")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Google Maps Business Scraper
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Select value={selectedCountry} onValueChange={(value) => {
                setSelectedCountry(value)
                setSelectedCity("") // Reset city when country changes
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(COUNTRIES_CITIES).filter(country => country.trim() !== "").map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Select 
                value={selectedCity} 
                onValueChange={setSelectedCity}
                disabled={!selectedCountry}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedCountry ? "Select city" : "Select country first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.filter(city => city.trim() !== "").map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-category">Business Category *</Label>
              <Select value={businessCategory} onValueChange={setBusinessCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business category" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_CATEGORIES.filter(category => category.trim() !== "").map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-results">Max Results</Label>
              <Select value={maxResults} onValueChange={setMaxResults}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 results</SelectItem>
                  <SelectItem value="50">50 results</SelectItem>
                  <SelectItem value="100">100 results</SelectItem>
                  <SelectItem value="200">200 results</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={validateWhatsApp}
                  onChange={(e) => setValidateWhatsApp(e.target.checked)}
                  className="rounded"
                />
                <MessageCircle className="h-4 w-4" />
                Validate WhatsApp Numbers
              </Label>
              <p className="text-xs text-muted-foreground">
                Check if phone numbers have active WhatsApp accounts
              </p>
            </div>
          </div>

          <Button 
            onClick={handleScrape} 
            disabled={isLoading || !selectedCountry || !selectedCity || !businessCategory}
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scraping Google Maps...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Scrape Google Maps
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Success Alert */}
      {saveSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">{saveSuccess}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {leads.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Found {leads.length} Business{leads.length !== 1 ? 'es' : ''}
              {validateWhatsApp && leads.some(lead => lead.hasWhatsApp) && (
                <span className="text-sm font-normal text-green-600">
                  ({leads.filter(lead => lead.hasWhatsApp).length} with WhatsApp)
                </span>
              )}
              {isValidatingWhatsApp && (
                <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Validating WhatsApp...
                </span>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={saveToDatabase} 
                variant="outline" 
                size="sm"
                disabled={savingToDatabase}
                className="bg-transparent text-blue-700 border-blue-300 hover:bg-blue-50"
              >
                {savingToDatabase ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Save to Database
                  </>
                )}
              </Button>
              
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Reviews</TableHead>
                    <TableHead>Website</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {lead.title || "N/A"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {lead.address || "N/A"}
                      </TableCell>
                      <TableCell>
                        {lead.phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span className="text-sm">{lead.phone}</span>
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.phone ? (
                          <div className="flex items-center gap-1">
                            {lead.whatsAppStatus === 'checking' && (
                              <>
                                <Clock className="h-3 w-3 animate-spin" />
                                <span className="text-xs text-muted-foreground">Checking...</span>
                              </>
                            )}
                            {lead.whatsAppStatus === 'active' && (
                              <>
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span className="text-xs text-green-600">Active</span>
                              </>
                            )}
                            {lead.whatsAppStatus === 'inactive' && (
                              <>
                                <XCircle className="h-3 w-3 text-red-600" />
                                <span className="text-xs text-red-600">Inactive</span>
                              </>
                            )}
                            {lead.whatsAppStatus === 'error' && (
                              <>
                                <XCircle className="h-3 w-3 text-orange-600" />
                                <span className="text-xs text-orange-600">Error</span>
                              </>
                            )}
                            {!lead.whatsAppStatus && !validateWhatsApp && (
                              <span className="text-xs text-muted-foreground">Not checked</span>
                            )}
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.rating ? (
                          <span className="text-sm">
                            ⭐ {lead.rating}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.reviewsCount ? (
                          <span className="text-sm text-muted-foreground">
                            {lead.reviewsCount} reviews
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.website ? (
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Visit
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📋 Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• <strong>Location Selection:</strong> Choose country first, then select from available cities</p>
          <p>• <strong>Business Categories:</strong> Choose the most relevant category for better results</p>
          <p>• <strong>Contact Information:</strong> Not all businesses may have phone numbers or websites listed</p>
          <p>• <strong>Data Usage:</strong> Use scraped data responsibly and respect business privacy</p>
          <p>• <strong>Rate Limits:</strong> Large scraping requests may take longer to process</p>
        </CardContent>
      </Card>
    </div>
  )
}
