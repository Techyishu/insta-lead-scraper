"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, Download, MapPin, Phone, Building, MessageCircle, CheckCircle, XCircle, Clock } from "lucide-react"

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

// India: States with all major cities
const INDIA_STATES_CITIES: Record<string, string[]> = {
  "Andhra Pradesh": [
    "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool",
    "Tirupati", "Rajahmundry", "Kadapa", "Kakinada", "Anantapur",
    "Eluru", "Ongole", "Nandyal", "Bhimavaram", "Machilipatnam",
    "Vizianagaram", "Chittoor", "Proddatur", "Srikakulam", "Hindupur"
  ],
  "Arunachal Pradesh": [
    "Itanagar", "Naharlagun", "Pasighat", "Tezpur", "Bomdila",
    "Ziro", "Along", "Changlang", "Tezu", "Seppa"
  ],
  "Assam": [
    "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon",
    "Tinsukia", "Tezpur", "Bongaigaon", "Dhubri", "Diphu",
    "Sivasagar", "Goalpara", "Karimganj", "Golaghat", "Hailakandi",
    "North Lakhimpur", "Haflong", "Mangaldoi", "Nalbari", "Barpeta"
  ],
  "Bihar": [
    "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga",
    "Purnia", "Arrah", "Begusarai", "Katihar", "Munger",
    "Chapra", "Bihar Sharif", "Saharsa", "Hajipur", "Sitamarhi",
    "Motihari", "Bettiah", "Supaul", "Siwan", "Nawada",
    "Aurangabad", "Kishanganj", "Jehanabad", "Buxar", "Samastipur"
  ],
  "Chhattisgarh": [
    "Raipur", "Bhilai", "Bilaspur", "Korba", "Durg",
    "Rajnandgaon", "Jagdalpur", "Raigarh", "Ambikapur", "Dhamtari",
    "Chirmiri", "Bhatapara", "Mahasamund", "Kondagaon", "Kanker"
  ],
  "Goa": [
    "Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda",
    "Bicholim", "Curchorem", "Sanquelim", "Cuncolim", "Quepem"
  ],
  "Gujarat": [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar",
    "Jamnagar", "Gandhinagar", "Junagadh", "Anand", "Navsari",
    "Morbi", "Mehsana", "Bharuch", "Valsad", "Surendranagar",
    "Porbandar", "Amreli", "Godhra", "Nadiad", "Gandhidham",
    "Botad", "Veraval", "Gondal", "Jetpur", "Palanpur",
    "Dahod", "Patan", "Kalol", "Kadi", "Dwarka"
  ],
  "Haryana": [
    "Faridabad", "Gurgaon", "Panipat", "Ambala", "Yamunanagar",
    "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula",
    "Bhiwani", "Bahadurgarh", "Jind", "Thanesar", "Kaithal",
    "Rewari", "Palwal", "Sirsa", "Fatehabad", "Narnaul",
    "Hansi", "Mahendragarh", "Nuh", "Hodal", "Pataudi",
    "Ballabhgarh", "Manesar", "Dharuhera", "Jhajjar", "Charkhi Dadri"
  ],
  "Himachal Pradesh": [
    "Shimla", "Dharamsala", "Solan", "Mandi", "Palampur",
    "Baddi", "Nahan", "Kullu", "Chamba", "Una",
    "Bilaspur", "Hamirpur", "Sundernagar", "Kangra", "Nurpur",
    "Rampur", "Rohru", "Manali", "Kasauli", "Parwanoo"
  ],
  "Jharkhand": [
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh",
    "Deoghar", "Giridih", "Ramgarh", "Phusro", "Chirkunda",
    "Medininagar", "Chaibasa", "Dumka", "Pakur", "Gumla",
    "Simdega", "Lohardaga", "Jamtara", "Sahibganj", "Koderma"
  ],
  "Karnataka": [
    "Bangalore", "Mysuru", "Hubli", "Mangalore", "Belgaum",
    "Davangere", "Bellary", "Shimoga", "Tumkur", "Gulbarga",
    "Bidar", "Hassan", "Udupi", "Raichur", "Bijapur",
    "Hospet", "Gadag", "Chitradurga", "Kolar", "Bagalkot",
    "Mandya", "Chikmagalur", "Dharwad", "Robertsonpet", "Gangavati",
    "Ranibennur", "Yadgir", "Chamarajanagar", "Haveri", "Karwar"
  ],
  "Kerala": [
    "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam",
    "Palakkad", "Alappuzha", "Malappuram", "Kannur", "Kasaragod",
    "Kottayam", "Pathanamthitta", "Idukki", "Wayanad", "Ernakulam",
    "Thalassery", "Kalpetta", "Manjeri", "Tirur", "Ponnani",
    "Chalakudy", "Irinjalakuda", "Perinthalmanna", "Vatakara", "Kayamkulam"
  ],
  "Madhya Pradesh": [
    "Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain",
    "Sagar", "Dewas", "Satna", "Ratlam", "Rewa",
    "Murwara", "Singrauli", "Burhanpur", "Khandwa", "Bhind",
    "Chhindwara", "Guna", "Shivpuri", "Vidisha", "Chhatarpur",
    "Damoh", "Mandsaur", "Khargone", "Neemuch", "Pithampur",
    "Hoshangabad", "Itarsi", "Sehore", "Betul", "Seoni"
  ],
  "Maharashtra": [
    "Mumbai", "Pune", "Nagpur", "Thane", "Nashik",
    "Pimpri-Chinchwad", "Kalyan-Dombivli", "Vasai-Virar", "Aurangabad", "Navi Mumbai",
    "Solapur", "Mira-Bhayandar", "Bhiwandi", "Amravati", "Nanded",
    "Kolhapur", "Sangli", "Jalgaon", "Akola", "Latur",
    "Dhule", "Ahmednagar", "Ichalkaranji", "Chandrapur", "Parbhani",
    "Jalna", "Osmanabad", "Bid", "Yavatmal", "Ratnagiri",
    "Wardha", "Gondia", "Bhandara", "Buldhana", "Washim"
  ],
  "Manipur": [
    "Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Senapati",
    "Ukhrul", "Chandel", "Tamenglong", "Jiribam", "Kakching"
  ],
  "Meghalaya": [
    "Shillong", "Tura", "Nongstoin", "Jowai", "Baghmara",
    "Resubelpara", "Williamnagar", "Nongpoh", "Mairang", "Cherrapunji"
  ],
  "Mizoram": [
    "Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib",
    "Serchhip", "Lawngtlai", "Mamit", "Khawzawl", "Hnahthial"
  ],
  "Nagaland": [
    "Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha",
    "Zunheboto", "Mon", "Phek", "Kiphire", "Longleng"
  ],
  "Odisha": [
    "Bhubaneswar", "Cuttack", "Rourkela", "Brahmapur", "Sambalpur",
    "Puri", "Balasore", "Bhadrak", "Baripada", "Jharsuguda",
    "Jeypore", "Bargarh", "Kendujhar", "Angul", "Dhenkanal",
    "Sundargarh", "Bolangir", "Koraput", "Rayagada", "Parlakhemundi",
    "Phulbani", "Nabarangpur", "Malkangiri", "Nuapada", "Kalahandi"
  ],
  "Punjab": [
    "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda",
    "Pathankot", "Hoshiarpur", "Batala", "Moga", "Abohar",
    "Malerkotla", "Khanna", "Phagwara", "Muktsar", "Barnala",
    "Rajpura", "Firozpur", "Kapurthala", "Sangrur", "Fatehgarh Sahib",
    "Gurdaspur", "Rupnagar", "Nawanshahr", "Tarn Taran", "Faridkot",
    "Fazilka", "Mohali", "Zirakpur", "Derabassi", "Morinda"
  ],
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer",
    "Udaipur", "Bhilwara", "Alwar", "Sikar", "Sri Ganganagar",
    "Pali", "Bharatpur", "Barmer", "Nagaur", "Churu",
    "Jhunjhunu", "Kishangarh", "Beawar", "Hanumangarh", "Tonk",
    "Sawai Madhopur", "Bundi", "Chittorgarh", "Jhalawar", "Baran",
    "Dholpur", "Karauli", "Dausa", "Rajsamand", "Dungarpur",
    "Banswara", "Pratapgarh", "Jaisalmer", "Sirohi", "Jalore"
  ],
  "Sikkim": [
    "Gangtok", "Namchi", "Mangan", "Gyalshing", "Rangpo",
    "Jorethang", "Singtam", "Ravangla", "Yuksom", "Lachung"
  ],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
    "Tirunelveli", "Tiruppur", "Erode", "Vellore", "Thoothukudi",
    "Dindigul", "Thanjavur", "Ranipet", "Sivakasi", "Karur",
    "Hosur", "Nagercoil", "Kancheepuram", "Kumarapalayam", "Pudukkottai",
    "Cuddalore", "Kumbakonam", "Nagapattinam", "Villupuram", "Tiruvannamalai",
    "Dharmapuri", "Krishnagiri", "Namakkal", "Ariyalur", "Perambalur",
    "Ramanathapuram", "Virudhunagar", "Theni", "Nilgiris", "Tirupattur"
  ],
  "Telangana": [
    "Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam",
    "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet",
    "Miryalaguda", "Siddipet", "Mancherial", "Jagtial", "Nirmal",
    "Kothagudem", "Bhongir", "Sangareddy", "Vikarabad", "Narayanpet",
    "Medak", "Narasaraopet", "Kamareddy", "Jangaon", "Yadadri"
  ],
  "Tripura": [
    "Agartala", "Udaipur", "Dharmanagar", "Kailashahar", "Belonia",
    "Ambassa", "Khowai", "Teliamura", "Melaghar", "Sonamura"
  ],
  "Uttar Pradesh": [
    "Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut",
    "Varanasi", "Allahabad", "Bareilly", "Aligarh", "Moradabad",
    "Saharanpur", "Gorakhpur", "Noida", "Mathura", "Rampur",
    "Shahjahanpur", "Muzaffarnagar", "Firozabad", "Jhansi", "Hapur",
    "Etawah", "Mirzapur", "Bulandshahr", "Sambhal", "Amroha",
    "Hardoi", "Fatehpur", "Raebareli", "Orai", "Sitapur",
    "Lakhimpur", "Unnao", "Jaunpur", "Azamgarh", "Sultanpur",
    "Faizabad", "Ballia", "Deoria", "Gonda", "Bahraich",
    "Shravasti", "Basti", "Maharajganj", "Siddharthnagar", "Kushinagar"
  ],
  "Uttarakhand": [
    "Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur",
    "Kashipur", "Rishikesh", "Kotdwar", "Ramnagar", "Pithoragarh",
    "Almora", "Nainital", "Mussoorie", "Pauri", "Tehri",
    "Uttarkashi", "Chamoli", "Champawat", "Bageshwar", "Udham Singh Nagar"
  ],
  "West Bengal": [
    "Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri",
    "Maheshtala", "Rajpur Sonarpur", "South Dumdum", "Bardhaman", "Malda",
    "Barasat", "Krishnanagar", "North Dumdum", "Medinipur", "Berhampore",
    "Habra", "Kharagpur", "Shantipur", "Darjeeling", "Jalpaiguri",
    "Cooch Behar", "Balurghat", "Raiganj", "Haldia", "Bankura",
    "Purulia", "Bishnupur", "Bolpur", "Tamluk", "Alipurduar"
  ],
  "Delhi": [
    "New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi",
    "Central Delhi", "Dwarka", "Rohini", "Janakpuri", "Laxmi Nagar",
    "Pitampura", "Saket", "Vasant Kunj", "Karol Bagh", "Nehru Place",
    "Connaught Place", "Shahdara", "Preet Vihar", "Mayur Vihar", "Noida Extension"
  ],
  "Jammu & Kashmir": [
    "Srinagar", "Jammu", "Anantnag", "Sopore", "Baramulla",
    "Udhampur", "Kathua", "Pulwama", "Pampore", "Rajouri",
    "Poonch", "Reasi", "Doda", "Kishtwar", "Ramban"
  ],
  "Ladakh": [
    "Leh", "Kargil", "Nubra", "Zanskar", "Drass"
  ],
  "Chandigarh": [
    "Chandigarh", "Sector 17", "Sector 22", "Panchkula", "Mohali"
  ],
  "Puducherry": [
    "Puducherry", "Karaikal", "Mahe", "Yanam", "Oulgaret"
  ],
  "Andaman & Nicobar": [
    "Port Blair", "Rangat", "Diglipur", "Car Nicobar", "Mayabunder"
  ],
  "Dadra & Nagar Haveli": [
    "Silvassa", "Amli", "Khanvel", "Naroli", "Rakholi"
  ],
  "Daman & Diu": [
    "Daman", "Diu", "Nani Daman", "Moti Daman", "Vanakbara"
  ],
  "Lakshadweep": [
    "Kavaratti", "Agatti", "Amini", "Andrott", "Minicoy"
  ]
}

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
  "India": []
}

export default function GoogleMapsScraper() {
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedState, setSelectedState] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [businessCategory, setBusinessCategory] = useState("")
  const [customCategory, setCustomCategory] = useState("")
  const [maxResults, setMaxResults] = useState("50")
  const [websiteFilter, setWebsiteFilter] = useState("any")
  const [validateWhatsApp, setValidateWhatsApp] = useState(true)
  const [leads, setLeads] = useState<GoogleMapsLead[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isValidatingWhatsApp, setIsValidatingWhatsApp] = useState(false)
  const [error, setError] = useState("")

  const isIndia = selectedCountry === "India"
  const availableStates = isIndia ? Object.keys(INDIA_STATES_CITIES) : []
  const availableCities = isIndia
    ? (selectedState ? INDIA_STATES_CITIES[selectedState] || [] : [])
    : (selectedCountry ? COUNTRIES_CITIES[selectedCountry as keyof typeof COUNTRIES_CITIES] || [] : [])

  const effectiveCategory = businessCategory === "custom" ? customCategory.trim() : businessCategory

  const filteredLeads = leads.filter((lead) => {
    if (websiteFilter === "with") return !!lead.website
    if (websiteFilter === "without") return !lead.website
    return true
  })

  const handleScrape = async () => {
    if (!selectedCountry || (isIndia && !selectedState) || !selectedCity || !effectiveCategory) {
      setError(isIndia ? "Please select country, state, city, and business category" : "Please select country, city, and business category")
      return
    }

    setIsLoading(true)
    setError("")
    setLeads([])

    try {
      const locationQuery = selectedCountry === "United States"
        ? selectedCity
        : isIndia
          ? `${selectedCity}, ${selectedState}, India`
          : `${selectedCity}, ${selectedCountry}`
      
      const response = await fetch("/api/google-maps-scraper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locationQuery: locationQuery,
          searchStringsArray: [effectiveCategory],
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

  const exportToCSV = () => {
    if (filteredLeads.length === 0) return

    const headers = ["Business Name", "Address", "Phone", "WhatsApp Active", "Website", "Rating", "Reviews Count", "Category"]
    const csvContent = [
      headers.join(","),
      ...filteredLeads.map(lead => [
        `"${lead.title || ""}"`,
        `"${lead.address || ""}"`,
        `"${lead.phone || ""}"`,
        lead.rating || "",
        lead.reviewsCount || "",
        `"${lead.category || ""}"`,
        lead.hasWhatsApp ? "Yes" : "No",
        `"${lead.website || ""}"`,
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
          <div className={`grid grid-cols-1 gap-4 ${isIndia ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Select value={selectedCountry} onValueChange={(value) => {
                setSelectedCountry(value)
                setSelectedState("")
                setSelectedCity("")
              }}>
                <SelectTrigger>
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

            {isIndia && (
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select
                  value={selectedState}
                  onValueChange={(value) => {
                    setSelectedState(value)
                    setSelectedCity("")
                  }}
                  disabled={!selectedCountry}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Select
                value={selectedCity}
                onValueChange={setSelectedCity}
                disabled={isIndia ? !selectedState : !selectedCountry}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    isIndia
                      ? (selectedState ? "Select city" : "Select state first")
                      : (selectedCountry ? "Select city" : "Select country first")
                  } />
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

            <div className="space-y-2">
              <Label htmlFor="business-category">Business Category *</Label>
              <Select value={businessCategory} onValueChange={(val) => {
                setBusinessCategory(val)
                if (val !== "custom") setCustomCategory("")
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business category" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">✏️ Custom (type your own)</SelectItem>
                </SelectContent>
              </Select>
              {businessCategory === "custom" && (
                <Input
                  placeholder="e.g. printing press, tent house, astrologer..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="website-filter">Website Filter</Label>
              <Select value={websiteFilter} onValueChange={setWebsiteFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">🌐 Any (with or without)</SelectItem>
                  <SelectItem value="with">✅ With website only</SelectItem>
                  <SelectItem value="without">❌ Without website only</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Filter results by website presence
              </p>
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
            disabled={isLoading || !selectedCountry || (isIndia && !selectedState) || !selectedCity || !effectiveCategory}
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

      {/* Results */}
      {leads.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Found {filteredLeads.length}{filteredLeads.length !== leads.length ? ` of ${leads.length}` : ""} Business{filteredLeads.length !== 1 ? 'es' : ''}
              {validateWhatsApp && filteredLeads.some(lead => lead.hasWhatsApp) && (
                <span className="text-sm font-normal text-green-600">
                  ({filteredLeads.filter(lead => lead.hasWhatsApp).length} with WhatsApp)
                </span>
              )}
              {isValidatingWhatsApp && (
                <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Validating WhatsApp...
                </span>
              )}
            </CardTitle>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
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
                  {filteredLeads.map((lead, index) => (
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
