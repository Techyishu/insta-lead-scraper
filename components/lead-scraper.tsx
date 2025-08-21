"use client"

import React, { useMemo, useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Search, Download, Lightbulb, Copy, CheckCircle } from "lucide-react"

// Types
interface DMIdea {
  id: number
  title: string
  message: string
}

// Industries for AI DM Ideas
const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Real Estate",
  "E-commerce",
  "Food & Beverage",
  "Fashion & Beauty",
  "Fitness & Wellness",
  "Education",
  "Legal Services",
  "Marketing & Advertising",
  "Consulting",
  "Manufacturing",
  "Retail",
  "Hospitality",
  "Construction",
  "Automotive",
  "Entertainment",
  "Non-profit",
  "Professional Services"
]

// Industry-specific Business Types for AI DM Ideas
const INDUSTRY_BUSINESS_TYPES = {
  "Technology": ["Software Company", "SaaS Startup", "IT Services", "Web Development Agency", "Mobile App Developer", "Tech Consultant", "AI/ML Company", "Cybersecurity Firm"],
  "Healthcare": ["Medical Practice", "Dental Clinic", "Pharmacy", "Medical Device Company", "Telehealth Service", "Mental Health Practice", "Physical Therapy Clinic", "Healthcare Consultant"],
  "Finance": ["Bank", "Credit Union", "Investment Firm", "Insurance Company", "Financial Advisor", "Accounting Firm", "Tax Service", "Fintech Startup"],
  "Real Estate": ["Real Estate Agency", "Property Management", "Real Estate Developer", "Mortgage Broker", "Property Inspector", "Real Estate Investor", "Commercial Real Estate", "Real Estate Attorney"],
  "E-commerce": ["Online Store", "Marketplace Seller", "Dropshipping Business", "Digital Products", "Subscription Box", "E-commerce Agency", "Online Marketplace", "Digital Marketing Agency"],
  "Food & Beverage": ["Restaurant", "Cafe", "Bar", "Food Truck", "Catering Service", "Bakery", "Brewery", "Food Delivery Service"],
  "Fashion & Beauty": ["Clothing Brand", "Beauty Salon", "Spa", "Cosmetics Company", "Fashion Designer", "Jewelry Store", "Hair Salon", "Nail Salon"],
  "Fitness & Wellness": ["Gym", "Personal Trainer", "Yoga Studio", "Nutrition Coach", "Wellness Center", "Sports Club", "Fitness Equipment", "Health Coach"],
  "Education": ["School", "Online Course Provider", "Tutoring Service", "Educational Technology", "Training Institute", "Language School", "Coaching Center", "Educational Consultant"],
  "Legal Services": ["Law Firm", "Solo Practitioner", "Legal Consultant", "Paralegal Service", "Legal Technology", "Court Reporter", "Legal Document Service", "Mediation Service"],
  "Marketing & Advertising": ["Digital Marketing Agency", "Social Media Agency", "PR Firm", "Content Creator", "Graphic Design Studio", "Video Production", "SEO Agency", "Influencer Marketing"],
  "Consulting": ["Business Consultant", "Management Consultant", "Strategy Consultant", "HR Consultant", "IT Consultant", "Marketing Consultant", "Financial Consultant", "Operations Consultant"],
  "Manufacturing": ["Manufacturing Company", "Product Designer", "Supply Chain", "Quality Control", "Industrial Equipment", "Packaging Company", "Assembly Service", "Contract Manufacturer"],
  "Retail": ["Retail Store", "Boutique", "Department Store", "Specialty Shop", "Pop-up Store", "Franchise", "Wholesale Distributor", "Retail Chain"],
  "Hospitality": ["Hotel", "Resort", "Bed & Breakfast", "Event Venue", "Travel Agency", "Tour Operator", "Vacation Rental", "Hospitality Management"],
  "Construction": ["General Contractor", "Specialty Contractor", "Architecture Firm", "Interior Design", "Construction Company", "Home Builder", "Renovation Service", "Engineering Firm"],
  "Automotive": ["Car Dealership", "Auto Repair Shop", "Car Rental", "Auto Parts Store", "Automotive Service", "Car Wash", "Tire Shop", "Auto Insurance"],
  "Entertainment": ["Event Planning", "Music Venue", "Entertainment Agency", "Production Company", "Talent Agency", "Gaming Company", "Streaming Service", "Content Creator"],
  "Non-profit": ["Charity Organization", "Foundation", "Social Service", "Religious Organization", "Educational Non-profit", "Healthcare Non-profit", "Environmental Group", "Community Organization"],
  "Professional Services": ["Consulting Firm", "Professional Service", "Business Service", "Administrative Service", "Professional Association", "Service Provider", "B2B Service", "Corporate Service"]
}

// DM Tones
const DM_TONES = [
  "Professional",
  "Casual & Friendly", 
  "Direct & Straightforward",
  "Conversational",
  "Warm & Personal",
  "Confident & Bold",
  "Helpful & Supportive",
  "Curious & Inquisitive"
]

// DM Types
const DM_TYPES = [
  "Straight to the Point",
  "Question-Based Approach",
  "Value Proposition First",
  "Problem-Solution Format",
  "Compliment + Offer",
  "Story/Case Study Approach",
  "Collaboration Proposal",
  "Educational/Tips Based"
]

// Countries & Cities with High Potential for $500 Website Clients
const COUNTRIES_CITIES = {
  "United States": [
    // T1 Cities (Major metropolitan areas)
    "New York, New York",
    "Los Angeles, California",
    "Chicago, Illinois",
    "Houston, Texas",
    "Phoenix, Arizona",
    "Philadelphia, Pennsylvania",
    "San Antonio, Texas",
    "San Diego, California",
    "Dallas, Texas",
    "San Jose, California",
    "Austin, Texas",
    "Jacksonville, Florida",
    "Fort Worth, Texas",
    "Columbus, Ohio",
    "Charlotte, North Carolina",
    "San Francisco, California",
    "Indianapolis, Indiana",
    "Seattle, Washington",
    "Denver, Colorado",
    "Washington, DC",
    "Boston, Massachusetts",
    "El Paso, Texas",
    "Nashville, Tennessee",
    "Detroit, Michigan",
    "Oklahoma City, Oklahoma",
    "Portland, Oregon",
    "Las Vegas, Nevada",
    "Memphis, Tennessee",
    "Louisville, Kentucky",
    "Baltimore, Maryland",
    "Milwaukee, Wisconsin",
    "Albuquerque, New Mexico",
    "Tucson, Arizona",
    "Fresno, California",
    "Sacramento, California",
    "Mesa, Arizona",
    "Kansas City, Missouri",
    "Atlanta, Georgia",
    "Long Beach, California",
    "Colorado Springs, Colorado",
    "Raleigh, North Carolina",
    "Miami, Florida",
    "Virginia Beach, Virginia",
    "Omaha, Nebraska",
    "Oakland, California",
    "Minneapolis, Minnesota",
    "Tulsa, Oklahoma",
    "Arlington, Texas",
    "Tampa, Florida",
    "New Orleans, Louisiana",
    // T2 Cities (Secondary markets with good potential)
    "Wichita, Kansas",
    "Bakersfield, California",
    "Aurora, Colorado",
    "Anaheim, California",
    "Santa Ana, California",
    "Riverside, California",
    "Corpus Christi, Texas",
    "Lexington, Kentucky",
    "Stockton, California",
    "Henderson, Nevada",
    "Saint Paul, Minnesota",
    "St. Louis, Missouri",
    "Cincinnati, Ohio",
    "Pittsburgh, Pennsylvania",
    "Greensboro, North Carolina",
    "Plano, Texas",
    "Lincoln, Nebraska",
    "Orlando, Florida",
    "Irvine, California",
    "Newark, New Jersey",
    "Durham, North Carolina",
    "Chula Vista, California",
    "Toledo, Ohio",
    "Fort Wayne, Indiana",
    "St. Petersburg, Florida",
    "Laredo, Texas",
    "Jersey City, New Jersey",
    "Chandler, Arizona",
    "Madison, Wisconsin",
    "Lubbock, Texas",
    "Scottsdale, Arizona",
    "Reno, Nevada",
    "Buffalo, New York",
    "Gilbert, Arizona",
    "Glendale, Arizona",
    "North Las Vegas, Nevada",
    "Winston-Salem, North Carolina",
    "Chesapeake, Virginia",
    "Norfolk, Virginia",
    "Fremont, California",
    "Garland, Texas",
    "Irving, Texas",
    "Hialeah, Florida",
    "Richmond, Virginia",
    "Boise, Idaho",
    "Spokane, Washington",
    "Des Moines, Iowa",
    "Modesto, California",
    "Fayetteville, North Carolina",
    "Tacoma, Washington",
    "Oxnard, California",
    "Fontana, California",
    "Columbus, Georgia",
    "Montgomery, Alabama",
    "Moreno Valley, California",
    "Shreveport, Louisiana",
    "Aurora, Illinois",
    "Yonkers, New York",
    "Akron, Ohio",
    "Huntington Beach, California",
    "Little Rock, Arkansas",
    "Augusta, Georgia",
    "Amarillo, Texas",
    "Glendale, California",
    "Mobile, Alabama",
    "Grand Rapids, Michigan",
    "Salt Lake City, Utah",
    "Tallahassee, Florida",
    "Huntsville, Alabama",
    "Grand Prairie, Texas",
    "Knoxville, Tennessee",
    "Worcester, Massachusetts",
    "Newport News, Virginia",
    "Brownsville, Texas",
    "Overland Park, Kansas",
    "Santa Clarita, California",
    "Providence, Rhode Island",
    "Garden Grove, California",
    "Chattanooga, Tennessee",
    "Oceanside, California",
    "Jackson, Mississippi",
    "Fort Lauderdale, Florida",
    "Santa Rosa, California",
    "Rancho Cucamonga, California",
    "Port St. Lucie, Florida",
    "Tempe, Arizona",
    "Ontario, California",
    "Vancouver, Washington",
    "Cape Coral, Florida",
    "Sioux Falls, South Dakota",
    "Springfield, Missouri",
    "Peoria, Arizona",
    "Pembroke Pines, Florida",
    "Elk Grove, California",
    "Salem, Oregon",
    "Lancaster, California",
    "Corona, California",
    "Eugene, Oregon",
    "Palmdale, California",
    "Salinas, California",
    "Springfield, Massachusetts",
    "Pasadena, Texas",
    "Fort Collins, Colorado",
    "Hayward, California",
    "Pomona, California",
    "Cary, North Carolina",
    "Rockford, Illinois",
    "Alexandria, Virginia",
    "Escondido, California",
    "Torrance, California",
    "Bridgeport, Connecticut",
    "Paterson, New Jersey",
    "Sunnyvale, California",
    "Macon, Georgia",
    "Lakewood, Colorado",
    "Syracuse, New York",
    "Pasadena, California",
    "Naperville, Illinois",
    "Bellevue, Washington",
    "Joliet, Illinois",
    "Murfreesboro, Tennessee",
    "Midland, Texas",
    "Rockville, Maryland",
    "Lowell, Massachusetts",
    "Concord, California",
    "Cedar Rapids, Iowa",
    "Charleston, South Carolina",
    "Dayton, Ohio",
    "Thousand Oaks, California",
    "McAllen, Texas",
    "Olathe, Kansas",
    "Waco, Texas",
    "Fargo, North Dakota",
    "Hillsboro, Oregon",
    "Warren, Michigan",
    "Thornton, Colorado",
    "Fullerton, California",
    "Edmond, Oklahoma",
    "Mesquite, Texas",
    "Carson, California",
    "Visalia, California",
    "Gainesville, Florida",
    "Coral Springs, Florida",
    "Sterling Heights, Michigan",
    "New Haven, Connecticut",
    "Stamford, Connecticut",
    "Concord, North Carolina",
    "Santa Clara, California",
    "Elizabeth, New Jersey",
    "Roseville, California",
    "Hartford, Connecticut",
    "Savannah, Georgia",
    "Surprise, Arizona",
    "Carrollton, Texas",
    "Denton, Texas",
    // T3 Cities (Smaller markets with potential)
    "Evansville, Indiana",
    "Ann Arbor, Michigan",
    "Columbia, South Carolina",
    "Clearwater, Florida",
    "Richmond, California",
    "Pearland, Texas",
    "Vallejo, California",
    "Arvada, Colorado",
    "Miami Gardens, Florida",
    "Westminster, Colorado",
    "Temecula, California",
    "Murrieta, California",
    "Antioch, California",
    "High Point, North Carolina",
    "Manchester, New Hampshire",
    "Pueblo, Colorado",
    "Wilmington, North Carolina",
    "Elgin, Illinois",
    "Waterbury, Connecticut",
    "Gresham, Oregon",
    "Fairfield, California",
    "Billings, Montana",
    "Lorain, Ohio",
    "San Mateo, California",
    "Lewisville, Texas",
    "South Bend, Indiana",
    "Lakeland, Florida",
    "Erie, Pennsylvania",
    "Tyler, Texas",
    "College Station, Texas",
    "Kenosha, Wisconsin",
    "Sandy Springs, Georgia",
    "Clovis, California",
    "Rialto, California",
    "Davenport, Iowa",
    "Spokane Valley, Washington",
    "Las Cruces, New Mexico",
    "Burbank, California",
    "Renton, Washington",
    "Vista, California",
    "Davie, Florida",
    "Marietta, Georgia",
    "Boulder, Colorado",
    "Yuma, Arizona",
    "West Covina, California",
    "Brick, New Jersey",
    "Carlsbad, California",
    "Germantown, Tennessee",
    "Centennial, Colorado",
    "Green Bay, Wisconsin",
    "Missoula, Montana",
    "Richardson, Texas",
    "Broken Arrow, Oklahoma",
    "Abilene, Texas",
    "Wilmington, Delaware",
    "Joplin, Missouri",
    "Beaumont, Texas",
    "Nashua, New Hampshire",
    "Daytona Beach, Florida",
    "Boca Raton, Florida",
    "Carmel, Indiana",
    "Tuscaloosa, Alabama",
    "Fishers, Indiana",
    "Sugar Land, Texas",
    "Toms River, New Jersey",
    "Lafayette, Louisiana",
    "Kennewick, Washington",
    "Baldwin Park, California",
    "Chico, California",
    "Duluth, Minnesota",
    "Miramar, Florida",
    "Fall River, Massachusetts",
    "Newton, Massachusetts",
    "Lawrence, Massachusetts",
    "Roswell, Georgia",
    "Pompano Beach, Florida",
    "Wichita Falls, Texas",
    "Dearborn, Michigan",
    "Bend, Oregon",
    "Redding, California",
    "Bethlehem, Pennsylvania",
    "Longmont, Colorado",
    "Rapid City, South Dakota",
    "Bellingham, Washington",
    "Yakima, Washington",
    "Gastonia, North Carolina",
    "Appleton, Wisconsin",
    "Warwick, Rhode Island",
    "Livermore, California",
    "Schaumburg, Illinois",
    "Bloomington, Illinois",
    "Plymouth, Minnesota",
    "Santa Maria, California",
    "Largo, Florida",
    "Roseville, Michigan",
    "Beaumont, California",
    "Topeka, Kansas",
    "Vacaville, California",
    "Lee's Summit, Missouri",
    "Sparks, Nevada",
    "Lakewood, Washington",
    "Buena Park, California",
    "Everett, Washington",
    "Orem, Utah",
    "Hawthorne, California",
    "Chino, California",
    "Roanoke, Virginia",
    "Hamilton, Ohio",
    "Whittier, California",
    "Alhambra, California",
    "Kirkland, Washington",
    "Littleton, Colorado",
    "Greenville, South Carolina",
    "Medford, Oregon",
    "Sioux City, Iowa",
    "Springdale, Arkansas",
    "Smyrna, Tennessee",
    "Sandy, Utah",
    "Westland, Michigan",
    "Bloomington, Minnesota",
    "Decatur, Illinois",
    "Concord, New Hampshire",
    "Casper, Wyoming",
    "Cheyenne, Wyoming",
    "Burlington, Vermont",
    "Portsmouth, New Hampshire",
    "Bangor, Maine",
    "Portland, Maine",
    "Frederick, Maryland",
    "Annapolis, Maryland",
    "Hagerstown, Maryland",
    "Winchester, Virginia",
    "Harrisonburg, Virginia",
    "Lynchburg, Virginia",
    "Asheville, North Carolina",
    "Greenville, North Carolina",
    "Hickory, North Carolina",
    "Spartanburg, South Carolina",
    "Florence, South Carolina",
    "Myrtle Beach, South Carolina",
    "Valdosta, Georgia",
    "Albany, Georgia",
    "Warner Robins, Georgia",
    "Dothan, Alabama",
    "Florence, Alabama",
    "Decatur, Alabama",
    "Meridian, Mississippi",
    "Hattiesburg, Mississippi",
    "Gulfport, Mississippi",
    "Biloxi, Mississippi",
    "Monroe, Louisiana",
    "Lake Charles, Louisiana",
    "Alexandria, Louisiana",
    "Houma, Louisiana",
    "Pensacola, Florida",
    "Panama City, Florida",
    "Ocala, Florida",
    "Kissimmee, Florida",
    "Melbourne, Florida",
    "Deltona, Florida",
    "Palm Bay, Florida",
    "West Palm Beach, Florida",
    "Boynton Beach, Florida",
    "Delray Beach, Florida",
    "Deerfield Beach, Florida",
    "Margate, Florida",
    "Coconut Creek, Florida",
    "Tamarac, Florida",
    "North Lauderdale, Florida",
    "Oakland Park, Florida",
    "Lauderhill, Florida",
    "Sunrise, Florida",
    "Plantation, Florida",
    "Cooper City, Florida",
    "Weston, Florida",
    "Southwest Ranches, Florida"
  ],
  "United Kingdom": [
    // T1 Cities (Major metropolitan areas)
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
    "Exeter",
    "Cheltenham",
    "Gloucester",
    "Saint Helens",
    "Sutton Coldfield",
    "Scunthorpe",
    "Basildon",
    "Hemel Hempstead",
    "Chelmsford",
    "Basingstoke",
    "Shrewsbury",
    "Colchester",
    "Redditch",
    "Burnley",
    "Grimsby",
    "Rhondda",
    "Chesterfield",
    "Crewe",
    "Watford",
    "Worthing",
    "Maidstone",
    "Royal Tunbridge Wells",
    "Doncaster",
    "Telford",
    "Darlington",
    "Stevenage",
    "Rotherham",
    "Wigan",
    "Mansfield",
    "Hartlepool",
    "Bedford",
    "St Albans",
    "Woking",
    "Nuneaton",
    "Lowestoft",
    "Bath",
    "Hastings",
    "Aylesbury",
    "Weymouth",
    "Kidderminster",
    "Barnsley",
    "Tamworth",
    "Eastbourne",
    "Folkestone",
    "Lincoln",
    "Taunton",
    "Blackburn",
    "Carlisle",
    "Worcester",
    "Great Yarmouth",
    "Margate",
    "Newbury",
    "Kettering",
    "Paignton",
    "Lancaster",
    "Salisbury",
    "Torquay",
    "Oldham",
    "Fulham",
    "Walsall",
    "Wellingborough",
    "Hillingdon",
    "Fareham",
    "Farnborough",
    "Bognor Regis",
    "Christchurch",
    "Burton upon Trent",
    "Warwick",
    "Scarborough",
    "Rochdale",
    "Solihull",
    "Birkenhead",
    "Stockton-on-Tees",
    "Harrogate",
    "Loughborough",
    "Guildford",
    "Bridgwater",
    "Hereford",
    "Harlow",
    "Stafford",
    "Bracknell",
    "Runcorn",
    "Canterbury",
    "Wrexham",
    "Bangor",
    "Stirling",
    "Perth",
    "Inverness",
    "Falkirk",
    "Paisley",
    "East Kilbride",
    "Hamilton",
    "Livingston",
    "Cumbernauld",
    "Kirkcaldy",
    "Dunfermline",
    "Ayr",
    "Kilmarnock",
    "Greenock",
    "Coatbridge",
    "Glenrothes",
    "Airdrie",
    "Wishaw",
    "Rutherglen",
    "Dumfries",
    "Motherwell",
    "Irvine",
    "Clydebank",
    "Bearsden",
    "Cambuslang",
    "Newton Mearns",
    "Bishopbriggs",
    "Musselburgh",
    "Arbroath",
    "Elgin",
    "Dumbarton",
    "Bathgate",
    "Alloa",
    "Forfar",
    "Inverurie",
    "Grangemouth",
    "Peebles",
    "Hawick",
    "Galashiels",
    "Selkirk",
    "Jedburgh",
    "Kelso",
    "Melrose",
    "Duns",
    "Eyemouth",
    "Coldstream",
    "Lauder",
    "Newtown St Boswells",
    "Innerleithen",
    "Walkerburn",
    "West Linton",
    "Penicuik",
    "Bonnyrigg",
    "Dalkeith",
    "Loanhead",
    "Roslin",
    "Lasswade",
    "Newtongrange",
    "Gorebridge",
    "Rosewell",
    "Temple",
    "Carrington",
    "Middleton",
    "Borthwick",
    "Heriot",
    "Stow",
    "Fountainhall",
    "Oxton",
    "Lauderdale",
    "Earlston",
    "Gordon",
    "Greenlaw",
    "Polwarth",
    "Longformacus",
    "Abbey St Bathans",
    "Chirnside",
    "Berwick-upon-Tweed",
    "Wooler",
    "Alnwick",
    "Morpeth",
    "Hexham",
    "Haltwhistle",
    "Brampton",
    "Longtown",
    "Gretna",
    "Annan",
    "Lockerbie",
    "Moffat",
    "Sanquhar",
    "Thornhill",
    "Moniaive",
    "Castle Douglas",
    "Dalbeattie",
    "Kirkcudbright",
    "Gatehouse of Fleet",
    "Newton Stewart",
    "Wigtown",
    "Whithorn",
    "Stranraer",
    "Portpatrick",
    "Girvan",
    "Maybole",
    "Crosshill",
    "Straiton",
    "Kirkmichael",
    "Ballantrae",
    "Barrhill",
    "Pinwherry",
    "Colmonell",
    "Lendalfoot",
    "Turnberry",
    "Maidens",
    "Kirkoswald",
    "Crossraguel",
    "Dailly",
    "Old Dailly",
    "Bargany",
    "Pinmore",
    "New Luce",
    "Glenluce",
    "Dunragit",
    "Innermessan",
    "Kirkcolm",
    "Leswalt",
    "Stoneykirk",
    "Sandhead",
    "Ardwell",
    "Drummore",
    "Mull of Galloway"
  ],
  "Australia": [
    // T1 Cities (Major metropolitan areas)
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
    "Port Macquarie, New South Wales",
    "Gladstone, Queensland",
    "Tamworth, New South Wales",
    "Traralgon, Victoria",
    "Orange, New South Wales",
    "Dubbo, New South Wales",
    "Geraldton, Western Australia",
    "Kalgoorlie, Western Australia",
    "Warrnambool, Victoria",
    "Kempsey, New South Wales",
    "Devonport, Tasmania",
    "Mount Gambier, South Australia",
    "Lismore, New South Wales",
    "Nelson Bay, New South Wales",
    "Forster, New South Wales",
    "Burnie, Tasmania",
    "Grafton, New South Wales",
    "Armidale, New South Wales",
    "Bathurst, New South Wales",
    "Horsham, Victoria",
    "Sale, Victoria",
    "Whyalla, South Australia",
    "Taree, New South Wales",
    "Nowra, New South Wales",
    "Warwick, Queensland",
    "Alice Springs, Northern Territory",
    "Goulburn, New South Wales",
    "Ulverstone, Tasmania",
    "Morwell, Victoria",
    "Cessnock, New South Wales",
    "Maitland, New South Wales",
    "Mudgee, New South Wales",
    "Singleton, New South Wales",
    "Muswellbrook, New South Wales",
    "Lithgow, New South Wales",
    "Katoomba, New South Wales",
    "Penrith, New South Wales",
    "Campbelltown, New South Wales",
    "Blacktown, New South Wales",
    "Liverpool, New South Wales",
    "Parramatta, New South Wales",
    "Bankstown, New South Wales",
    "Fairfield, New South Wales",
    "Sutherland, New South Wales",
    "Hornsby, New South Wales",
    "Manly, New South Wales",
    "Chatswood, New South Wales",
    "Bondi, New South Wales",
    "Cronulla, New South Wales",
    "Dee Why, New South Wales",
    "Epping, New South Wales",
    "Castle Hill, New South Wales",
    "Ryde, New South Wales",
    "Burwood, New South Wales",
    "Strathfield, New South Wales",
    "Auburn, New South Wales",
    "Granville, New South Wales",
    "Merrylands, New South Wales",
    "Westmead, New South Wales",
    "Seven Hills, New South Wales",
    "Mount Druitt, New South Wales",
    "St Marys, New South Wales",
    "Richmond, New South Wales",
    "Windsor, New South Wales",
    "Hawkesbury, New South Wales",
    "Gosford, New South Wales",
    "Wyong, New South Wales",
    "The Entrance, New South Wales",
    "Tuggerah, New South Wales",
    "Bateau Bay, New South Wales",
    "Toukley, New South Wales",
    "Woy Woy, New South Wales",
    "Umina Beach, New South Wales",
    "Ettalong Beach, New South Wales",
    "Kincumber, New South Wales",
    "Terrigal, New South Wales",
    "Avoca Beach, New South Wales",
    "Copacabana, New South Wales",
    "MacMasters Beach, New South Wales",
    "Davistown, New South Wales",
    "Saratoga, New South Wales",
    "Wamberal, New South Wales",
    "Forresters Beach, New South Wales",
    "Barrack Point, New South Wales",
    "Shell Cove, New South Wales",
    "Albion Park, New South Wales",
    "Oak Flats, New South Wales",
    "Warilla, New South Wales",
    "Port Kembla, New South Wales",
    "Unanderra, New South Wales",
    "Figtree, New South Wales",
    "Fairy Meadow, New South Wales",
    "Towradgi, New South Wales",
    "Corrimal, New South Wales",
    "Bellambi, New South Wales",
    "Woonona, New South Wales",
    "Bulli, New South Wales",
    "Thirroul, New South Wales",
    "Austinmer, New South Wales",
    "Coledale, New South Wales",
    "Scarborough, New South Wales",
    "Wombarra, New South Wales",
    "Coalcliff, New South Wales",
    "Stanwell Park, New South Wales",
    "Helensburgh, New South Wales",
    "Otford, New South Wales",
    "Audley, New South Wales",
    "Loftus, New South Wales",
    "Engadine, New South Wales",
    "Heathcote, New South Wales",
    "Waterfall, New South Wales",
    "Menai, New South Wales",
    "Bangor, New South Wales",
    "Woronora, New South Wales",
    "Bonnet Bay, New South Wales",
    "Jannali, New South Wales",
    "Como, New South Wales",
    "Oyster Bay, New South Wales",
    "Kirrawee, New South Wales",
    "Gymea, New South Wales",
    "Miranda, New South Wales",
    "Caringbah, New South Wales",
    "Port Hacking, New South Wales",
    "Lilli Pilli, New South Wales",
    "Sylvania, New South Wales",
    "Taren Point, New South Wales",
    "Woolooware, New South Wales",
    "Burraneer, New South Wales",
    "Dolans Bay, New South Wales",
    "Yowie Bay, New South Wales",
    "Grays Point, New South Wales",
    "Kangaroo Point, New South Wales",
    "Matraville, New South Wales",
    "Phillip Bay, New South Wales",
    "Little Bay, New South Wales",
    "Malabar, New South Wales",
    "Long Bay, New South Wales",
    "Chifley, New South Wales",
    "Hillsdale, New South Wales",
    "Eastgardens, New South Wales",
    "Pagewood, New South Wales",
    "Mascot, New South Wales",
    "Botany, New South Wales",
    "Banksmeadow, New South Wales",
    "Brighton-Le-Sands, New South Wales",
    "Kyeemagh, New South Wales",
    "Rockdale, New South Wales",
    "Kogarah, New South Wales",
    "Carlton, New South Wales",
    "Allawah, New South Wales",
    "Hurstville, New South Wales",
    "Penshurst, New South Wales",
    "Mortdale, New South Wales",
    "Oatley, New South Wales",
    "Lugarno, New South Wales",
    "Peakhurst, New South Wales",
    "Riverwood, New South Wales",
    "Narwee, New South Wales",
    "Beverly Hills, New South Wales",
    "Kingsgrove, New South Wales",
    "Bexley, New South Wales",
    "Arncliffe, New South Wales",
    "Wolli Creek, New South Wales",
    "Tempe, New South Wales",
    "St Peters, New South Wales",
    "Sydenham, New South Wales",
    "Marrickville, New South Wales",
    "Dulwich Hill, New South Wales",
    "Hurlstone Park, New South Wales",
    "Canterbury, New South Wales",
    "Campsie, New South Wales",
    "Belmore, New South Wales",
    "Lakemba, New South Wales",
    "Wiley Park, New South Wales",
    "Punchbowl, New South Wales",
    "Yagoona, New South Wales",
    "Birrong, New South Wales",
    "Regents Park, New South Wales",
    "Berala, New South Wales",
    "Lidcombe, New South Wales",
    "Rookwood, New South Wales",
    "Potts Hill, New South Wales",
    "Chullora, New South Wales",
    "Greenacre, New South Wales",
    "Mount Lewis, New South Wales",
    "Bass Hill, New South Wales",
    "Georges Hall, New South Wales",
    "Lansdowne, New South Wales",
    "Canley Vale, New South Wales",
    "Fairfield East, New South Wales",
    "Fairfield West, New South Wales",
    "Smithfield, New South Wales",
    "Wetherill Park, New South Wales",
    "Edensor Park, New South Wales",
    "Bonnyrigg, New South Wales",
    "Bonnyrigg Heights, New South Wales",
    "Cecil Hills, New South Wales",
    "Horningsea Park, New South Wales",
    "Hoxton Park, New South Wales",
    "Prestons, New South Wales",
    "Casula, New South Wales",
    "Lurnea, New South Wales",
    "Cartwright, New South Wales",
    "Sadleir, New South Wales",
    "Heckenberg, New South Wales",
    "Busby, New South Wales",
    "Miller, New South Wales",
    "Ashcroft, New South Wales",
    "Warwick Farm, New South Wales",
    "Cabramatta West, New South Wales",
    "Cabramatta, New South Wales",
    "Lansvale, New South Wales",
    "Carramar, New South Wales",
    "Villawood, New South Wales",
    "Leightonfield, New South Wales",
    "Sefton, New South Wales",
    "Chester Hill, New South Wales",
    "Bankstown Airport, New South Wales",
    "Condell Park, New South Wales",
    "Revesby Heights, New South Wales",
    "Revesby, New South Wales",
    "Padstow Heights, New South Wales",
    "Padstow, New South Wales",
    "Picnic Point, New South Wales",
    "East Hills, New South Wales",
    "Panania, New South Wales",
    "Milperra, New South Wales",
    "Moorebank, New South Wales",
    "Chipping Norton, New South Wales",
    "Hammondville, New South Wales",
    "Voyager Point, New South Wales",
    "Pleasure Point, New South Wales",
    "Alfords Point, New South Wales",
    "Illawong, New South Wales",
    "Barden Ridge, New South Wales",
    "Lucas Heights, New South Wales",
    "Gymea Bay, New South Wales",
    "Caringbah South, New South Wales",
    "Kurnell, New South Wales"
  ],
  "Canada": [
    // T1 Cities (Major metropolitan areas)
    "Toronto, Ontario",
    "Montreal, Quebec",
    "Vancouver, British Columbia",
    "Calgary, Alberta",
    "Edmonton, Alberta",
    "Ottawa, Ontario",
    "Winnipeg, Manitoba",
    "Quebec City, Quebec",
    "Hamilton, Ontario",
    "Kitchener, Ontario",
    "London, Ontario",
    "Victoria, British Columbia",
    "Halifax, Nova Scotia",
    "Oshawa, Ontario",
    "Windsor, Ontario",
    "Saskatoon, Saskatchewan",
    "St. Catharines, Ontario",
    "Regina, Saskatchewan",
    "Sherbrooke, Quebec",
    "Kelowna, British Columbia",
    "Barrie, Ontario",
    "Abbotsford, British Columbia",
    "Kingston, Ontario",
    "Sudbury, Ontario",
    "Saguenay, Quebec",
    "Trois-Rivières, Quebec",
    "Guelph, Ontario",
    "Cambridge, Ontario",
    "Whitby, Ontario",
    "Coquitlam, British Columbia",
    "Saanich, British Columbia",
    "Burlington, Ontario",
    "Richmond, British Columbia",
    "Oakville, Ontario",
    "Burnaby, British Columbia",
    "Richmond Hill, Ontario",
    "Thunder Bay, Ontario",
    "Vaughan, Ontario",
    "Markham, Ontario",
    "Gatineau, Quebec",
    "Longueuil, Quebec",
    "Laval, Quebec",
    "North Vancouver, British Columbia",
    "Mississauga, Ontario",
    "Brampton, Ontario",
    "Surrey, British Columbia",
    "Langley, British Columbia",
    "New Westminster, British Columbia",
    "West Vancouver, British Columbia",
    "Port Coquitlam, British Columbia",
    "Delta, British Columbia",
    "White Rock, British Columbia",
    "Maple Ridge, British Columbia",
    "Pitt Meadows, British Columbia",
    "Mission, British Columbia",
    "Chilliwack, British Columbia",
    "Langley City, British Columbia",
    "Port Moody, British Columbia",
    "Anmore, British Columbia",
    "Belcarra, British Columbia",
    "Lions Bay, British Columbia",
    "Bowen Island, British Columbia",
    "Squamish, British Columbia",
    "Whistler, British Columbia",
    "Pemberton, British Columbia",
    "Lillooet, British Columbia",
    "100 Mile House, British Columbia",
    "Williams Lake, British Columbia",
    "Quesnel, British Columbia",
    "Prince George, British Columbia",
    "Dawson Creek, British Columbia",
    "Fort St. John, British Columbia",
    "Terrace, British Columbia",
    "Prince Rupert, British Columbia",
    "Kitimat, British Columbia",
    "Smithers, British Columbia",
    "Burns Lake, British Columbia",
    "Vanderhoof, British Columbia",
    "Fort St. James, British Columbia",
    "Mackenzie, British Columbia",
    "Chetwynd, British Columbia",
    "Hudson's Hope, British Columbia",
    "Taylor, British Columbia",
    "Charlie Lake, British Columbia",
    "Fort Nelson, British Columbia",
    "Tumbler Ridge, British Columbia",
    "Pouce Coupe, British Columbia",
    "Dawson Creek, British Columbia",
    "Grande Prairie, Alberta",
    "Peace River, Alberta",
    "High Prairie, Alberta",
    "Slave Lake, Alberta",
    "Athabasca, Alberta",
    "Lac La Biche, Alberta",
    "Cold Lake, Alberta",
    "Bonnyville, Alberta",
    "St. Paul, Alberta",
    "Vegreville, Alberta",
    "Vermilion, Alberta",
    "Lloydminster, Alberta",
    "Wainwright, Alberta",
    "Provost, Alberta",
    "Consort, Alberta",
    "Coronation, Alberta",
    "Hardisty, Alberta",
    "Sedgewick, Alberta",
    "Killam, Alberta",
    "Daysland, Alberta",
    "Camrose, Alberta",
    "Wetaskiwin, Alberta",
    "Ponoka, Alberta",
    "Lacombe, Alberta",
    "Blackfalds, Alberta",
    "Red Deer, Alberta",
    "Sylvan Lake, Alberta",
    "Rocky Mountain House, Alberta",
    "Drayton Valley, Alberta",
    "Whitecourt, Alberta",
    "Mayerthorpe, Alberta",
    "Barrhead, Alberta",
    "Westlock, Alberta",
    "Morinville, Alberta",
    "Legal, Alberta",
    "Redwater, Alberta",
    "Smoky Lake, Alberta",
    "Lamont, Alberta",
    "Mundare, Alberta",
    "Two Hills, Alberta",
    "Willingdon, Alberta",
    "Myrnam, Alberta",
    "Andrew, Alberta",
    "Chipman, Alberta",
    "Fort Saskatchewan, Alberta",
    "Bruderheim, Alberta",
    "Gibbons, Alberta",
    "Bon Accord, Alberta",
    "Sturgeon County, Alberta",
    "St. Albert, Alberta",
    "Spruce Grove, Alberta",
    "Stony Plain, Alberta",
    "Parkland County, Alberta",
    "Leduc, Alberta",
    "Beaumont, Alberta",
    "Devon, Alberta",
    "Calmar, Alberta",
    "Thorsby, Alberta",
    "Warburg, Alberta",
    "Breton, Alberta",
    "Winfield, Alberta",
    "Buck Lake, Alberta",
    "Pigeon Lake, Alberta",
    "Ma-Me-O Beach, Alberta",
    "Mulhurst Bay, Alberta",
    "Norris Beach, Alberta",
    "Crystal Springs, Alberta",
    "Grandview, Alberta",
    "Itaska Beach, Alberta",
    "Sundance Beach, Alberta",
    "Silver Beach, Alberta",
    "Bonnie Doon Beach, Alberta",
    "Pelican Narrows, Alberta",
    "Wabamun, Alberta",
    "Seba Beach, Alberta",
    "Fallis, Alberta",
    "Gainford, Alberta",
    "Sangudo, Alberta",
    "Mayerthorpe, Alberta",
    "Whitecourt, Alberta",
    "Fox Creek, Alberta",
    "Valleyview, Alberta",
    "Grande Cache, Alberta",
    "Hinton, Alberta",
    "Edson, Alberta",
    "Robb, Alberta",
    "Cadomin, Alberta",
    "Mountain Park, Alberta",
    "Luscar, Alberta",
    "Coalspur, Alberta",
    "Marlboro, Alberta",
    "Evansburg, Alberta",
    "Entwistle, Alberta",
    "Wildwood, Alberta",
    "Tomahawk, Alberta",
    "Spruce Grove, Alberta",
    "Stony Plain, Alberta",
    "Onoway, Alberta",
    "Alberta Beach, Alberta",
    "Nakamun Park, Alberta",
    "South View, Alberta",
    "Sunset Point, Alberta",
    "West Cove, Alberta",
    "Birch Cove, Alberta",
    "Kapasiwin, Alberta",
    "Ross Haven, Alberta",
    "Betula Beach, Alberta",
    "Lakeview, Alberta",
    "Poplar Bay, Alberta",
    "Castle Island, Alberta",
    "Point Alison, Alberta",
    "Yellowstone, Alberta",
    "Mewassin, Alberta",
    "Grandview, Alberta",
    "Whispering Hills, Alberta",
    "Larkspur, Alberta",
    "Sunset Beach, Alberta",
    "Sundance Beach, Alberta",
    "Val Quentin, Alberta",
    "Wabamun, Alberta",
    "Duffield, Alberta",
    "Calahoo, Alberta",
    "Villeneuve, Alberta",
    "Rich Valley, Alberta",
    "Perryvale, Alberta",
    "Clyde, Alberta",
    "Newbrook, Alberta",
    "Radway, Alberta",
    "Thorhild, Alberta",
    "Redwater, Alberta",
    "Smoky Lake, Alberta",
    "Vilna, Alberta",
    "Elk Point, Alberta",
    "St. Paul, Alberta",
    "Bonnyville, Alberta",
    "Cold Lake, Alberta",
    "Grand Centre, Alberta",
    "Medley, Alberta",
    "Iron River, Alberta",
    "Glendon, Alberta",
    "St. Edouard, Alberta",
    "St. Vincent, Alberta",
    "Fishing Lake, Alberta",
    "Therien, Alberta",
    "St. Lina, Alberta",
    "Heinsburg, Alberta",
    "Lindbergh, Alberta",
    "Dewberry, Alberta",
    "Clandonald, Alberta",
    "Mannville, Alberta",
    "Vermilion, Alberta",
    "Kitscoty, Alberta",
    "Marwayne, Alberta",
    "Islay, Alberta",
    "Wainwright, Alberta",
    "Irma, Alberta",
    "Kinsella, Alberta",
    "Fabyan, Alberta",
    "Hairy Hill, Alberta",
  ],
  "New Zealand": [
    // T1 Cities (Major metropolitan areas)
    "Auckland",
    "Wellington",
    "Christchurch",
    "Hamilton",
    "Tauranga",
    "Napier-Hastings",
    "Dunedin",
    "Palmerston North",
    "Nelson",
    "Rotorua",
    "New Plymouth",
    "Whangarei",
    "Invercargill",
    "Whanganui",
    "Gisborne",
    "Kapiti",
    "Timaru",
    "Levin",
    "Oamaru",
    "Blenheim",
    "Pukekohe",
    "Masterton",
    "Greymouth",
    "Westport",
    "Rangiora",
    "Ashburton",
    "Fielding",
    "Te Awamutu",
    "Cambridge",
    "Morrinsville",
    "Matamata",
    "Te Aroha",
    "Huntly",
    "Ngaruawahia",
    "Raglan",
    "Otorohanga",
    "Te Kuiti",
    "Taumarunui",
    "Te Puke",
    "Katikati",
    "Waihi",
    "Paeroa",
    "Thames",
    "Coromandel",
    "Whitianga",
    "Tairua",
    "Pauanui",
    "Whangamata",
    "Waiuku",
    "Tuakau",
    "Pokeno",
    "Mercer",
    "Te Kauwhata",
    "Kawhia",
    "National Park",
    "Ohakune",
    "Raetihi",
    "Taihape",
    "Marton",
    "Bulls",
    "Sanson",
    "Foxton",
    "Shannon",
    "Otaki",
    "Waikanae",
    "Paraparaumu",
    "Raumati",
    "Paekakariki",
    "Pukerua Bay",
    "Plimmerton",
    "Porirua",
    "Whitby",
    "Paremata",
    "Mana",
    "Camborne",
    "Elsdon",
    "Takapuna",
    "Aotea",
    "Ascot Park",
    "Cannons Creek",
    "Waitangirua",
    "Ranui Heights",
    "Eastern Porirua",
    "Titahi Bay",
    "Onepoto",
    "Karehana Bay",
    "Pauatahanui",
    "Judgeford",
    "Horokiwi",
    "Moonshine",
    "Belmont",
    "Kelson",
    "Korokoro",
    "Petone",
    "Alicetown",
    "Moera",
    "Seaview",
    "Gracefield",
    "Taita",
    "Pomare",
    "Epuni",
    "Avalon",
    "Naenae",
    "Waterloo",
    "Boulcott",
    "Woburn",
    "Fairfield",
    "Manor Park",
    "Days Bay",
    "Lowry Bay",
    "York Bay",
    "Mahina Bay",
    "Rona Bay",
    "Sunshine Bay",
    "Robinson Bay",
    "Burdan's Gate",
    "Wainuiomata",
    "Homedale",
    "Parkway",
    "Konini",
    "Aoraki",
    "Wanaka",
    "Queenstown",
    "Arrowtown",
    "Cromwell",
    "Alexandra",
    "Roxburgh",
    "Lawrence",
    "Milton",
    "Balclutha",
    "Gore",
    "Mataura",
    "Winton",
    "Riverton",
    "Stewart Island",
    "Bluff",
    "Te Anau",
    "Manapouri",
    "Lumsden",
    "Otautau",
    "Nightcaps",
    "Dipton",
    "Tapanui",
    "Clinton",
    "Owaka",
    "Kaitangata",
    "Stirling",
    "Port Chalmers",
    "Mosgiel",
    "Green Island",
    "Brighton",
    "Taieri Mouth",
    "Henley",
    "Allanton",
    "Outram",
    "Middlemarch",
    "Ranfurly",
    "Naseby",
    "Wedderburn",
    "Omakau",
    "Ophir",
    "St. Bathans",
    "Tarras",
    "Luggate",
    "Albert Town",
    "Hawea",
    "Makarora",
    "Fox Glacier",
    "Franz Josef",
    "Hokitika",
    "Runanga",
    "Blackball",
    "Moana",
    "Arthur's Pass",
    "Otira",
    "Kumara",
    "Ross",
    "Hari Hari",
    "Whataroa",
    "Okarito",
    "Punakaiki",
    "Karamea",
    "Granity",
    "Ngakawau",
    "Hector",
    "Little Wanganui",
    "Kahurangi",
    "Takaka",
    "Collingwood",
    "Pohara",
    "Ligar Bay",
    "Tata Beach",
    "Golden Bay",
    "Farewell Spit",
    "Puponga",
    "Pakawau",
    "Onekaka",
    "Patons Rock",
    "Milnthorpe",
    "Upper Takaka",
    "Uruwhenua",
    "Cobb Valley",
    "Mount Arthur",
    "Kahurangi Point",
    "Healthy Track",
    "Heaphy Track",
    "Oparara",
    "Kohaihai",
    "Wangapeka",
    "Tapawera",
    "Motueka",
    "Riwaka",
    "Kaiteriteri",
    "Marahau",
    "Abel Tasman",
    "Totaranui",
    "Wainui",
    "Pohara Beach",
    "Bainham",
    "Parapara",
    "Rockville",
    "Puramahoi",
    "Waitapu",
    "Te Hapu",
    "Whakarewa",
    "East Takaka",
    "Kotinga",
    "Hamama",
    "Rangihaeata",
    "Upper Moutere",
    "Lower Moutere",
    "Mapua",
    "Ruby Bay",
    "Tasman",
    "Appleby",
    "Hope",
    "Brightwater",
    "Wakefield",
    "Belgrove",
    "Spring Grove",
    "Kohatu",
    "Motupiko",
    "Ngatimoti",
    "Brooklyn",
    "Ranzau",
    "Redwood Valley",
    "Murchison",
    "Kawatiri",
    "Maruia",
    "Springs Junction",
    "Reefton",
    "Inangahua",
    "Cronadun",
    "Ikamatua",
    "Blackwater",
    "Ahaura",
    "Ngahere",
    "Dobson",
    "Taylorville",
    "Lake Brunner",
    "Kumara Junction",
    "Jacksons",
    "Bealey",
    "Cass",
    "Sheffield",
    "Springfield",
    "Darfield",
    "Kirwee",
    "West Melton",
    "Rolleston",
    "Prebbleton",
    "Lincoln",
    "Tai Tapu",
    "Motukarara",
    "Dunsandel",
    "Rakaia",
    "Methven",
    "Mount Somers",
    "Staveley",
    "Mayfield",
    "Hinds",
    "Hakatere",
    "Lake Heron",
    "Lake Clearwater",
    "Erewhon",
    "Mount Potts",
    "Rangitata",
    "Geraldine",
    "Woodbury",
    "Orari",
    "Saint Andrews",
    "Temuka",
    "Pleasant Point",
    "Pareora",
    "Saint Stephens",
    "Washdyke",
    "Levels",
    "Winchester",
    "Seadown",
    "Gleniti",
    "Marchwiel",
    "Woodend Beach",
    "Caroline Bay",
    "Dashing Rocks",
    "Otipua",
    "Saltwater Creek",
    "Makikihi",
    "Hook",
    "Waimate",
    "Studholme",
    "Morven",
    "Glenavy",
    "Ikawai",
    "Kurow",
    "Duntroon",
    "Windsor",
    "Tokarahi",
    "Maheno",
    "Kakanui",
    "Hampden",
    "Moeraki",
    "Palmerston",
    "Waikouaiti",
    "Karitane",
    "Seacliff",
    "Warrington",
    "Purakanui",
    "Long Beach",
    "Aramoana",
    "Portobello",
    "Macandrew Bay",
    "Company Bay",
    "Broad Bay",
    "Papanui Inlet",
    "Hoopers Inlet",
    "Allans Beach",
    "Sandfly Bay",
    "Pilots Beach",
    "Taiaroa Head",
    "Otago Peninsula",
    "Larnach Castle",
    "Glenfalloch"
  ],
  "Ireland": [
    // T1 Cities (Major metropolitan areas)
    "Dublin",
    "Cork",
    "Limerick",
    "Galway",
    "Waterford",
    "Drogheda",
    "Dundalk",
    "Swords",
    "Bray",
    "Navan",
    "Ennis",
    "Kilkenny",
    "Carlow",
    "Naas",
    "Athlone",
    "Sligo",
    "Newbridge",
    "Mullingar",
    "Wexford",
    "Letterkenny",
    "Celbridge",
    "Clonmel",
    "Malahide",
    "Portlaoise",
    "Balbriggan",
    "Tralee",
    "Arklow",
    "Greystones",
    "Cobh",
    "Castlebar",
    "Midleton",
    "Mallow",
    "Ballina",
    "Enniscorthy",
    "Wicklow",
    "Laytown-Bettystown",
    "Tullamore",
    "Killarney",
    "Carrigaline",
    "New Ross",
    "Thomastown",
    "Longford",
    "Dungarvan",
    "Nenagh",
    "Trim",
    "Shannon",
    "Gorey",
    "Tuam",
    "Edenderry",
    "Bandon",
    "Leixlip",
    "Westport",
    "Ballinasloe",
    "Monaghan",
    "Thurles",
    "Youghal",
    "Ardee",
    "Mountmellick",
    "Fermoy",
    "Donegal",
    "Kinsale",
    "Listowel",
    "Cavan",
    "Roscommon",
    "Birr",
    "Dunshaughlin",
    "Cashel",
    "Macroom",
    "Castleconnell",
    "Kilrush",
    "Skibbereen",
    "Bundoran",
    "Templemore",
    "Clones",
    "Newmarket",
    "Ballybay",
    "Ballyshannon",
    "Belturbet",
    "Boyle",
    "Carrick-on-Shannon",
    "Charleville",
    "Clonakilty",
    "Cootehill",
    "Granard",
    "Kells",
    "Kingscourt",
    "Loughrea",
    "Manorhamilton",
    "Mitchelstown",
    "Mountrath",
    "Muine Bheag",
    "Newcastle West",
    "Oldcastle",
    "Portumna",
    "Roscrea",
    "Strokestown",
    "Swinford",
    "Virginia",
    "Abbeyfeale",
    "Abbeyleix",
    "Adare",
    "Ahascragh",
    "Annascaul",
    "Ardfert",
    "Athboy",
    "Athea",
    "Athy",
    "Augher",
    "Bailieborough",
    "Ballaghaderreen",
    "Ballybunion",
    "Ballyconnell",
    "Ballyduff",
    "Ballygar",
    "Ballyhaunis",
    "Ballyheigue",
    "Ballyjamesduff",
    "Ballylanders",
    "Ballylongford",
    "Ballymahon",
    "Ballymore",
    "Ballymote",
    "Ballyporeen",
    "Ballyragget",
    "Ballyvary",
    "Banagher",
    "Bantry",
    "Beaufort",
    "Belmullet",
    "Blackwater",
    "Blennerville",
    "Borris",
    "Borrisokane",
    "Borrisoleigh",
    "Buncrana",
    "Bunclody",
    "Buttevant",
    "Caherciveen",
    "Cahir",
    "Callan",
    "Camp",
    "Cappamore",
    "Carrickmacross",
    "Carrick-on-Suir",
    "Carrigtwohill",
    "Castleblaney",
    "Castlecomer",
    "Castlegregory",
    "Castleisland",
    "Castlemaine",
    "Castlemartyr",
    "Castlepollard",
    "Castlerea",
    "Castletownbere",
    "Castletownroche",
    "Causeway",
    "Clane",
    "Clara",
    "Claremorris",
    "Clifden",
    "Cloghan",
    "Cloghane",
    "Clogherhead",
    "Clonbullogue",
    "Clondalkin",
    "Clonea",
    "Clonfert",
    "Clonmines",
    "Clonroche",
    "Cloyne",
    "Collooney",
    "Convoy",
    "Coolaney",
    "Corofin",
    "Courtmacsherry",
    "Crosshaven",
    "Crossmolina",
    "Crumlin",
    "Currow",
    "Daingean",
    "Dingle",
    "Doneraile",
    "Doon",
    "Doolin",
    "Droichead Nua",
    "Drumcollogher",
    "Drumcondra",
    "Drumkeerin",
    "Drumshanbo",
    "Duagh",
    "Duleek",
    "Dunboyne",
    "Duncannon",
    "Dundrum",
    "Dunfanaghy",
    "Dunkineely",
    "Dunlavin",
    "Dunmanway",
    "Dunmore",
    "Dunmore East",
    "Dunquin",
    "Durrow",
    "Easkey",
    "Elphin",
    "Emly",
    "Enniskillen",
    "Eyeries",
    "Falcarragh",
    "Fanore",
    "Farranfore",
    "Fenit",
    "Ferbane",
    "Fethard",
    "Firies",
    "Fossa",
    "Foxford",
    "Freshford",
    "Galbally",
    "Galmoy",
    "Garristown",
    "Glenbeigh",
    "Glencolmcille",
    "Glenealy",
    "Glengarriff",
    "Glenties",
    "Glin",
    "Golden",
    "Gort",
    "Gortahork",
    "Graiguenamanagh",
    "Grangecon",
    "Gweedore",
    "Headford",
    "Herbertstown",
    "Hollywood",
    "Hospital",
    "Inchigeelagh",
    "Inistioge",
    "Innishannon",
    "Jenkinstown",
    "Johnstown",
    "Kanturk",
    "Keadue",
    "Keel",
    "Kenmare",
    "Kilbeggan",
    "Kilcock",
    "Kilcolgan",
    "Kilcormac",
    "Kildare",
    "Kilfenora",
    "Kilfinane",
    "Kilgarvan",
    "Kilkee",
    "Kill",
    "Killaloe",
    "Killeshandra",
    "Killeagh",
    "Killorglin",
    "Killybegs",
    "Kilmacthomas",
    "Kilmallock",
    "Kilmihil",
    "Kilmore Quay",
    "Kilmuckridge",
    "Kilnamartyra",
    "Kilpedder",
    "Kilrush",
    "Kiltimagh",
    "Kinlough",
    "Kinvara",
    "Knock",
    "Knocklong",
    "Lahinch",
    "Laragh",
    "Leenane",
    "Lifford",
    "Liscannor",
    "Lisdoonvarna",
    "Lispole",
    "Lixnaw",
    "Louisburgh",
    "Lusk",
    "Malin",
    "Malin Head",
    "Mallow",
    "Manorcunningham",
    "Maynooth",
    "Milford",
    "Millstreet",
    "Milltown",
    "Moate",
    "Mohill",
    "Monasterboice",
    "Monasterevin",
    "Mooncoin",
    "Mount Bellew",
    "Mountcharles",
    "Moville",
    "Moyvane",
    "Mucklagh",
    "Mullagh",
    "Multyfarnham",
    "Murroe",
    "Naas",
    "Narraghmore",
    "Newmarket-on-Fergus",
    "Newport",
    "Newtownards",
    "Newtownforbes",
    "Newtownmountkennedy",
    "Oranmore",
    "Pallasgreen",
    "Passage East",
    "Patrickswell",
    "Piltown",
    "Portarlington",
    "Portmagee",
    "Prosperous",
    "Ramelton",
    "Raphoe",
    "Rathangan",
    "Rathcoole",
    "Rathdrum",
    "Rathkeale",
    "Rathluirc",
    "Rathmolyon",
    "Rathnew",
    "Recess",
    "Redcross",
    "Rhode",
    "Ringaskiddy",
    "Riverstown",
    "Roundstone",
    "Roundwood",
    "Rush",
    "Saggart",
    "Schull",
    "Shercock",
    "Sixmilebridge",
    "Sneem",
    "Spa",
    "Spiddal",
    "Stradbally",
    "Strandhill",
    "Strokestown",
    "Summerhill",
    "Swords",
    "Tarbert",
    "Taghmon",
    "Templeglantine",
    "Thomastown",
    "Thurles",
    "Timoleague",
    "Tipp Town",
    "Tipperary",
    "Tobercurry",
    "Tournafulla",
    "Tramore",
    "Trim",
    "Tubbercurry",
    "Tulla",
    "Tullow",
    "Tuosist",
    "Tyrellspass",
    "Urlingford",
    "Valencia Island",
    "Ventry",
    "Watergrasshill",
    "Waterville",
    "Wellington Bridge",
    "Westport",
    "Whitegate",
    "Wicklow",
    "Woodenbridge",
    "Youghal"
  ],
  "South Africa": [
    // T1 Cities (Major metropolitan areas)
    "Cape Town",
    "Johannesburg",
    "Durban",
    "Pretoria",
    "Port Elizabeth",
    "Bloemfontein",
    "East London",
    "Nelspruit",
    "Polokwane",
    "Kimberley",
    "Rustenburg",
    "George",
    "Pietermaritzburg",
    "Welkom",
    "Klerksdorp",
    "Potchefstroom",
    "Witbank",
    "Vereeniging",
    "Benoni",
    "Boksburg",
    "Germiston",
    "Randburg",
    "Sandton",
    "Roodepoort",
    "Soweto",
    "Centurion",
    "Vanderbijlpark",
    "Krugersdorp",
    "Alberton",
    "Springs",
    "Brakpan",
    "Kempton Park",
    "Edenvale",
    "Midrand",
    "Fourways",
    "Rosebank",
    "Bedfordview",
    "Observatory",
    "Woodstock",
    "Green Point",
    "Sea Point",
    "Camps Bay",
    "Hout Bay",
    "Constantia",
    "Claremont",
    "Rondebosch",
    "Newlands",
    "Wynberg",
    "Muizenberg",
    "Fish Hoek",
    "Simon's Town",
    "Stellenbosch",
    "Paarl",
    "Wellington",
    "Franschhoek",
    "Somerset West",
    "Strand",
    "Gordon's Bay",
    "Hermanus",
    "Knysna",
    "Plettenberg Bay",
    "Mossel Bay",
    "Oudtshoorn",
    "Beaufort West",
    "Worcester",
    "Robertson",
    "Montagu",
    "Swellendam",
    "Caledon",
    "Bredasdorp",
    "Grabouw",
    "Elgin",
    "Bot River",
    "Kleinmond",
    "Betty's Bay",
    "Pringle Bay",
    "Arniston",
    "Gansbaai",
    "Franskraal",
    "Pearly Beach",
    "Stilbaai",
    "Riversdale",
    "Ladismith",
    "Calitzdorp",
    "Prince Albert",
    "Graaff-Reinet",
    "Middelburg",
    "Cradock",
    "Queenstown",
    "Aliwal North",
    "Somerset East",
    "Adelaide",
    "Bedford",
    "Fort Beaufort",
    "Grahamstown",
    "King William's Town",
    "Stutterheim",
    "Cathcart",
    "Whittlesea",
    "Dordrecht",
    "Barkly East",
    "Lady Grey",
    "Rhodes",
    "Elliot",
    "Maclear",
    "Ugie",
    "Mount Fletcher",
    "Kokstad",
    "Underberg",
    "Himeville",
    "Bulwer",
    "Boston",
    "Ixopo",
    "Richmond",
    "Howick",
    "Mooi River",
    "Estcourt",
    "Weenen",
    "Ladysmith",
    "Newcastle",
    "Dundee",
    "Glencoe",
    "Vryheid",
    "Paulpietersburg",
    "Utrecht",
    "Wakkerstroom",
    "Volksrust",
    "Charlestown",
    "Balfour",
    "Standerton",
    "Ermelo",
    "Piet Retief",
    "Amsterdam",
    "Carolina",
    "Dullstroom",
    "Lydenburg",
    "Sabie",
    "Graskop",
    "Pilgrim's Rest",
    "Barberton",
    "Malelane",
    "Komatipoort",
    "Hazyview",
    "White River",
    "Tzaneen",
    "Phalaborwa",
    "Hoedspruit",
    "Lephalale",
    "Mokopane",
    "Bela-Bela",
    "Modimolle",
    "Vaalwater",
    "Thabazimbi",
    "Lichtenburg",
    "Zeerust",
    "Groot Marico",
    "Swartruggens",
    "Koster",
    "Ventersdorp",
    "Carletonville",
    "Westonaria",
    "Randfontein",
    "Magaliesburg",
    "Brits",
    "Hartbeespoort",
    "Sun City",
    "Pilanesberg",
    "Mafikeng",
    "Mmabatho",
    "Vryburg",
    "Kuruman",
    "Postmasburg",
    "Kathu",
    "Upington",
    "Keimoes",
    "Kakamas",
    "Kenhardt",
    "Prieska",
    "De Aar",
    "Hanover",
    "Victoria West",
    "Carnarvon",
    "Williston",
    "Calvinia",
    "Nieuwoudtville",
    "Vanrhynsdorp",
    "Klawer",
    "Vredendal",
    "Citrusdal",
    "Ceres",
    "Tulbagh",
    "Wolseley",
    "Ashton",
    "Bonnievale",
    "McGregor",
    "Greyton",
    "Villiersdorp"
  ],
  "Singapore": [
    // T1 Areas (Major districts and neighborhoods)
    "Orchard",
    "Marina Bay",
    "Raffles Place",
    "Tanjong Pagar",
    "Chinatown",
    "Little India",
    "Kampong Glam",
    "Clarke Quay",
    "Boat Quay",
    "Robertson Quay",
    "Sentosa",
    "Jurong East",
    "Tampines",
    "Woodlands",
    "Yishun",
    "Ang Mo Kio",
    "Bishan",
    "Toa Payoh",
    "Novena",
    "Newton",
    "Bukit Timah",
    "Holland Village",
    "Dempsey Hill",
    "Tanglin",
    "River Valley",
    "Tiong Bahru",
    "Outram",
    "Bugis",
    "Rochor",
    "Kallang",
    "Geylang",
    "Katong",
    "East Coast",
    "Marine Parade",
    "Bedok",
    "Changi",
    "Pasir Ris",
    "Hougang",
    "Punggol",
    "Sengkang",
    "Serangoon",
    "Potong Pasir",
    "Tanjong Rhu",
    "Mountbatten",
    "Dakota",
    "Paya Lebar",
    "Eunos",
    "Kembangan",
    "Chai Chee",
    "Siglap",
    "Frankel",
    "Joo Chiat",
    "Tanjong Katong",
    "Amber Road",
    "Meyer Road",
    "East Coast Road",
    "Parkway Parade",
    "Katong Point",
    "Katong V",
    "Wisma Atria",
    "Ngee Ann City",
    "ION Orchard",
    "Paragon",
    "Takashimaya",
    "Shaw House",
    "Far East Plaza",
    "Lucky Plaza",
    "Centrepoint",
    "Plaza Singapura",
    "Dhoby Ghaut",
    "City Hall",
    "Esplanade",
    "Promenade",
    "Bayfront",
    "Downtown",
    "Telok Ayer",
    "Amoy Street",
    "Club Street",
    "Ann Siang Hill",
    "Duxton Hill",
    "Everton Park",
    "Cantonment",
    "Keppel",
    "Harbourfront",
    "Telok Blangah",
    "Mount Faber",
    "Henderson Waves",
    "Southern Ridges",
    "Kent Ridge",
    "Pasir Panjang",
    "Labrador Park",
    "Vivocity",
    "Resorts World Sentosa",
    "Universal Studios",
    "Siloso Beach",
    "Palawan Beach",
    "Tanjong Beach",
    "Fort Canning",
    "Somerset",
    "Cairnhill",
    "Scotts Road",
    "Nassim Road",
    "Cluny Park",
    "Botanic Gardens",
    "Stevens Road",
    "Dunearn Road",
    "Sixth Avenue",
    "Buona Vista",
    "Commonwealth",
    "Queenstown",
    "Redhill",
    "Anson Road",
    "Shenton Way",
    "Robinson Road",
    "Cecil Street",
    "Collyer Quay",
    "Fullerton",
    "One Raffles Place",
    "UOB Plaza",
    "OUB Centre",
    "Republic Plaza",
    "Maybank Tower",
    "Ocean Financial Centre",
    "Marina One",
    "Marina Bay Financial Centre",
    "Asia Square",
    "One George Street",
    "The Sail",
    "Marina Bay Residences",
    "The Oceanfront",
    "The Interlace",
    "Reflections at Keppel Bay",
    "Caribbean at Keppel Bay",
    "Corals at Keppel Bay",
    "The Pinnacle@Duxton",
    "Skyville@Dawson",
    "Tanjong Pagar Centre",
    "Guoco Tower",
    "Wallich Residence"
  ],
} as const

// Business categories with comprehensive keyword lists
const BUSINESS_CATEGORIES = {
  "Healthcare & Medical": {
    "Doctor/Physician": ["doctor", "physician", "medical", "healthcare", "clinic", "surgeon", "specialist", "cardiologist", "dermatologist", "neurologist", "pediatrician", "family medicine", "internal medicine", "general practitioner"],
    "Dentist": ["dentist", "dental", "dentistry", "orthodontist", "oral surgeon", "periodontist", "endodontist", "dental hygienist", "cosmetic dentist", "pediatric dentist", "dental clinic", "oral health"],
    "Veterinarian": ["vet", "veterinarian", "animal hospital", "pet care", "veterinary clinic", "animal doctor", "pet health", "emergency vet", "animal clinic", "pet hospital"],
    "Chiropractor": ["chiropractor", "chiropractic", "spine care", "back pain", "neck pain", "sports chiropractor", "wellness center", "spinal adjustment"],
    "Optometrist": ["optometrist", "eye doctor", "vision care", "eye exam", "glasses", "contact lenses", "optical", "eye care", "vision center"],
    "Pharmacist": ["pharmacist", "pharmacy", "medication", "prescription", "drug store", "clinical pharmacist", "compounding pharmacy"],
    "Therapist/Counselor": ["therapist", "therapy", "counseling", "mental health", "psychologist", "marriage counselor", "family therapist", "behavioral therapist", "counselor"]
  },
  "Legal & Professional Services": {
    "Lawyer/Attorney": ["lawyer", "attorney", "legal", "law firm", "legal services", "litigation", "criminal lawyer", "family lawyer", "corporate lawyer", "personal injury lawyer", "immigration lawyer", "estate planning"],
    "Accountant": ["accountant", "accounting", "bookkeeping", "tax preparation", "financial services", "CPA", "tax accountant", "business accounting", "tax services"],
    "Financial Advisor": ["financial advisor", "finance", "investment", "retirement planning", "wealth management", "financial planning", "insurance agent", "financial consultant"],
    "Insurance Agent": ["insurance agent", "insurance", "auto insurance", "home insurance", "life insurance", "health insurance", "insurance broker", "insurance services"],
    "Consultant": ["consultant", "consulting", "business consultant", "marketing consultant", "financial consultant", "strategy consultant", "management consultant", "business advisor"]
  },
  "Home & Construction Services": {
    "Contractor": ["contractor", "construction", "home improvement", "general contractor", "renovation", "remodeling", "building contractor", "builder", "home builder"],
    "Plumber": ["plumber", "plumbing", "plumbing services", "drain cleaning", "pipe repair", "water heater", "emergency plumber", "residential plumber", "commercial plumber"],
    "Electrician": ["electrician", "electrical", "electrical services", "electrical repair", "wiring", "electrical contractor", "residential electrician", "commercial electrician", "electrical installation"],
    "HVAC Technician": ["hvac", "heating", "cooling", "air conditioning", "furnace repair", "HVAC contractor", "climate control", "ventilation", "ductwork"],
    "Roofer": ["roofer", "roofing", "roof repair", "roof replacement", "commercial roofing", "residential roofing", "roof contractor", "gutter services"],
    "Painter": ["painter", "painting", "house painting", "commercial painting", "interior painting", "exterior painting", "paint contractor"],
    "Handyman": ["handyman", "home repair", "maintenance", "fix", "installation", "repair services", "home services", "odd jobs"],
    "Landscaper": ["landscaping", "landscape design", "lawn care", "gardening", "tree service", "irrigation", "hardscaping", "outdoor design", "yard work"]
  },
  "Beauty & Wellness": {
    "Hair Salon/Barber": ["salon", "hair salon", "hairstylist", "barber", "beauty salon", "hair cutting", "hair coloring", "beauty services", "barber shop"],
    "Spa/Massage": ["spa", "massage", "massage therapy", "therapeutic massage", "deep tissue massage", "relaxation massage", "sports massage", "spa services"],
    "Nail Salon": ["nail salon", "nails", "manicure", "pedicure", "nail art", "nail care", "gel nails", "acrylic nails"],
    "Fitness/Gym": ["gym", "fitness", "personal trainer", "workout", "fitness center", "health club", "crossfit", "yoga studio", "pilates", "strength training"],
    "Yoga Instructor": ["yoga", "yoga instructor", "meditation", "mindfulness", "wellness", "spiritual", "holistic health", "yoga studio"],
    "Nutritionist": ["nutritionist", "nutrition", "dietitian", "meal planning", "weight loss", "health coaching", "wellness", "diet coach"]
  },
  "Food & Hospitality": {
    "Restaurant": ["restaurant", "food", "dining", "cuisine", "chef", "fine dining", "fast food", "local restaurant", "family restaurant", "takeout"],
    "Cafe/Coffee Shop": ["cafe", "coffee shop", "coffee house", "bistro", "espresso bar", "coffee roaster", "tea house", "local cafe", "specialty coffee", "breakfast cafe"],
    "Bakery": ["bakery", "baking", "pastry", "bread", "cakes", "cookies", "custom cakes", "wedding cakes", "fresh bread", "pastries", "desserts"],
    "Catering": ["catering", "caterer", "event catering", "wedding catering", "corporate catering", "party catering", "food service"],
    "Hotel/Accommodation": ["hotel", "accommodation", "bed and breakfast", "inn", "motel", "guest house", "resort", "hospitality", "lodging", "vacation rental"]
  },
  "Automotive Services": {
    "Auto Repair/Mechanic": ["mechanic", "auto repair", "car repair", "automotive", "auto service", "engine repair", "brake repair", "oil change", "transmission repair", "tire service"],
    "Car Dealer": ["car dealer", "auto", "auto sales", "used cars", "automotive sales", "car lot", "vehicle sales", "car dealership"]
  },
  "Creative & Media Services": {
    "Photographer": ["photographer", "photography", "wedding photographer", "portrait photographer", "event photographer", "commercial photographer", "photo studio", "headshots", "family photographer"],
    "Graphic Designer": ["graphic designer", "graphic", "logo design", "branding", "marketing materials", "print design", "digital design", "creative services"],
    "Web Developer": ["web developer", "web", "website design", "digital marketing", "SEO", "web design", "online marketing", "web services"],
    "Artist": ["artist", "art", "art gallery", "custom art", "portraits", "paintings", "art studio", "creative services"],
    "Musician/DJ": ["musician", "music", "band", "DJ", "music teacher", "wedding music", "live music", "entertainment", "performer"]
  },
  "Real Estate & Property": {
    "Real Estate Agent": ["realtor", "real estate", "property", "homes", "real estate agent", "broker", "property sales", "residential realtor", "commercial realtor", "listing agent"],
    "Property Management": ["property management", "property manager", "rental properties", "landlord services", "tenant management", "real estate management"]
  },
  "Education & Training": {
    "Tutor": ["tutor", "tutoring", "education", "academic support", "test prep", "math tutor", "english tutor", "private tutor", "learning center"],
    "Coach": ["coach", "coaching", "life coach", "business coach", "sports coach", "fitness coach", "career coach", "wellness coach"],
    "Childcare": ["childcare", "daycare", "preschool", "childcare center", "babysitting", "nursery", "kids care", "early childhood", "child development"]
  },
  "Event & Wedding Services": {
    "Wedding Planner": ["wedding planner", "wedding", "bridal", "wedding services", "wedding venue", "wedding coordinator", "event planning"],
    "Event Planner": ["event planner", "event", "party planning", "corporate events", "special events", "event coordination", "celebration planning"],
    "Florist": ["florist", "flowers", "floral design", "wedding flowers", "flower arrangements", "flower shop", "event flowers", "bouquets"]
  },
  "Technology Services": {
    "Computer Repair": ["computer repair", "computer", "IT services", "tech support", "computer sales", "laptop repair", "data recovery", "network services"],
    "Phone Repair": ["phone repair", "mobile", "cell phone store", "mobile device repair", "screen repair", "phone unlocking", "mobile accessories"],
    "Tech Support": ["tech", "technology", "IT services", "tech support", "software", "hardware", "computer services"]
  },
  "Retail & Shopping": {
    "Retail Store": ["retail", "boutique", "store", "shop", "retail store", "gift shop", "specialty store", "local business", "merchant", "retailer"],
    "Fashion/Clothing": ["fashion", "fashion designer", "clothing", "boutique", "custom clothing", "alterations", "fashion stylist", "apparel"],
    "Jewelry Store": ["jeweler", "jewelry", "custom jewelry", "jewelry repair", "engagement rings", "wedding rings", "fine jewelry", "watch repair"]
  },
  "Transportation & Logistics": {
    "Moving Company": ["moving", "moving company", "movers", "relocation", "packing services", "local moving", "long distance moving"],
    "Delivery Service": ["logistics", "shipping", "freight", "delivery service", "courier", "transportation", "logistics company", "warehouse"],
    "Travel Agent": ["travel", "travel agent", "vacation planning", "tour guide", "travel services", "cruise specialist", "destination wedding"]
  },
  "Specialized Services": {
    "Cleaning Service": ["cleaning", "cleaning service", "house cleaning", "commercial cleaning", "carpet cleaning", "window cleaning", "deep cleaning", "maid service"],
    "Security Services": ["security", "security services", "security guard", "alarm systems", "surveillance", "home security", "security company"],
    "Pest Control": ["pest", "pest control", "exterminator", "bug control", "rodent control", "termite control", "wildlife removal"],
    "Locksmith": ["locksmith", "lock repair", "key service", "lock installation", "emergency locksmith", "automotive locksmith"],
    "Pool Service": ["pool", "pool service", "pool cleaning", "pool maintenance", "pool repair", "swimming pool", "pool contractor"]
  }
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
  const [selectedBusinessCategory, setSelectedBusinessCategory] = useState("")
  const [selectedBusinessType, setSelectedBusinessType] = useState("")

  const [limit, setLimit] = useState(100)
  const [results, setResults] = useState<ResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMorePages, setHasMorePages] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [seenUsernames, setSeenUsernames] = useState<Set<string>>(() => {
    // Load seen Usernames from localStorage on component mount
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lead-scraper-seen-usernames')
        if (saved) {
          return new Set(JSON.parse(saved))
        }
      } catch (error) {
        console.warn('Failed to load seen Usernames from localStorage:', error)
      }
    }
    return new Set()
  })
  const [duplicatesFiltered, setDuplicatesFiltered] = useState(0)

  // AI DM Ideas state
  const [selectedIndustry, setSelectedIndustry] = useState("")
  const [selectedDMBusinessType, setSelectedDMBusinessType] = useState("")
  const [selectedTone, setSelectedTone] = useState("")
  const [selectedDMType, setSelectedDMType] = useState("")
  const [dmIdeas, setDmIdeas] = useState<DMIdea[]>([])
  const [loadingDMIdeas, setLoadingDMIdeas] = useState(false)
  const [dmError, setDmError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Get keywords for selected business type
  const getSelectedKeywords = (): string[] => {
    if (!selectedBusinessCategory || !selectedBusinessType) return []
    const category = BUSINESS_CATEGORIES[selectedBusinessCategory as keyof typeof BUSINESS_CATEGORIES]
    if (!category) return []
    return category[selectedBusinessType as keyof typeof category] || []
  }

  const composedQuery = useMemo(() => {
    const keywords = getSelectedKeywords()
    const keywordString = keywords.length > 0 ? keywords.slice(0, 3).join(' OR ') : who.trim()
    const w = keywordString || who.trim()
    const l = selectedCity ? `"${selectedCity}"` : ""
    return `site:instagram.com ${w} ${l}`
  }, [who, selectedCity, selectedBusinessCategory, selectedBusinessType])

  // Save seen Usernames to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && seenUsernames.size > 0) {
      try {
        localStorage.setItem('lead-scraper-seen-usernames', JSON.stringify(Array.from(seenUsernames)))
      } catch (error) {
        console.warn('Failed to save seen Usernames to localStorage:', error)
      }
    }
  }, [seenUsernames])

  // Function to extract Instagram username from a URL
  const extractInstagramUsername = (url: string): string | null => {
    try {
      // Remove query params and fragments
      const cleanUrl = url.split('?')[0].split('#')[0]
      // Match profile or post URLs
      // Examples:
      // https://www.instagram.com/username/
      // https://instagram.com/username
      // https://www.instagram.com/username/p/POSTID
      // https://www.instagram.com/username/reel/REELID
      // https://www.instagram.com/username/channel/CHANNELID
      // https://www.instagram.com/username/tagged/
      // https://www.instagram.com/p/POSTID
      // https://www.instagram.com/reel/REELID
      // We want to extract 'username' from profile and post URLs
      const match = cleanUrl.match(/instagram\.com\/(?!p\/|reel\/|tv\/|explore\/|stories\/|directory\/|about\/|developer\/|press\/|blog\/|about\/|legal\/|privacy\/|terms\/|accounts\/|challenge\/|create\/|email\/|api\/|business\/|directory\/|topics\/|tags\/|hashtag\/|web\/|a\/|n\/|s\/|t\/|v\/|z\/|\d+)([A-Za-z0-9_.]+)(?:\/|$)/)
      if (match && match[1]) {
        return match[1].toLowerCase()
      }
      return null
    } catch {
      return null
    }
  }

  // Helper to check if a URL is a profile (not post, reel, tv, stories, etc)
  const isInstagramProfileUrl = (url: string) => {
    const cleanUrl = url.split('?')[0].split('#')[0]
    // Matches only profile URLs: https://instagram.com/username or https://instagram.com/username/
    // Excludes: /p/, /reel/, /tv/, /stories/, /channel/, /tagged/, etc
    return /instagram\.com\/[A-Za-z0-9_.]+\/?$/.test(cleanUrl)
  }

  // Improved duplicate filtering: only one result per Instagram username (profile URLs only)
  const filterDuplicates = (newResults: ResultItem[], existingUsernames: Set<string> = new Set()) => {
    const filteredResults: ResultItem[] = []
    const seenUsernames = new Set(existingUsernames)
    let duplicateCount = 0

    for (const result of newResults) {
      // Filter out post, reel, tv, stories, channel, tagged, etc
      if (!isInstagramProfileUrl(result.url)) {
        duplicateCount++
        continue
      }
      const username = result.username?.toLowerCase() || extractInstagramUsername(result.url)
      if (!username) {
        // If we can't extract a username, treat as unique (or optionally skip)
        filteredResults.push(result)
        continue
      }
      if (!seenUsernames.has(username)) {
        filteredResults.push(result)
        seenUsernames.add(username)
      } else {
        duplicateCount++
      }
    }
    return { filteredResults, duplicateCount, updatedUsernames: seenUsernames }
  }

  // Function to clear the duplicate history
  const clearDuplicateHistory = () => {
    setSeenUsernames(new Set())
    setDuplicatesFiltered(0)
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('lead-scraper-seen-usernames')
      } catch (error) {
        console.warn('Failed to clear seen Usernames from localStorage:', error)
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setResults([])
    setCurrentPage(1)
    setHasMorePages(false)
    setSeenUsernames(new Set())
    setDuplicatesFiltered(0)

    // Get the search keywords from business selection or manual input
    const keywords = getSelectedKeywords()
    const searchWho = keywords.length > 0 ? keywords.slice(0, 3).join(' OR ') : who.trim()

    // Validate that we have both search terms and location
    if (!searchWho || !selectedCity.trim()) {
      setError("Please select a business type and city, or enter manual keywords.")
      setLoading(false)
      return
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minute timeout

      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          who: searchWho,
          location: selectedCity,
          limit,
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
      
      const rawResults = data.results || []
      
      // Filter duplicates from initial results
      const { filteredResults, duplicateCount, updatedUsernames } = filterDuplicates(rawResults)
      
      console.log('Initial search results filtering:', {
        totalReceived: rawResults.length,
        duplicatesFiltered: duplicateCount,
        uniqueResults: filteredResults.length
      })
      
      setResults(filteredResults)
      setSeenUsernames(updatedUsernames)
      setDuplicatesFiltered(duplicateCount)
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

    // Get the search keywords from business selection or manual input
    const keywords = getSelectedKeywords()
    const searchWho = keywords.length > 0 ? keywords.slice(0, 3).join(' OR ') : who.trim()

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000)

      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          who: searchWho,
          location: selectedCity,
          limit,
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
      
      // Filter out duplicate URLs using the new filtering function
      const allNewResults = data.results || []
      const { filteredResults: newResults, duplicateCount, updatedUsernames } = filterDuplicates(allNewResults, new Set(seenUsernames))
      
      console.log('Load more results:', {
        totalReceived: allNewResults.length,
        duplicatesFiltered: duplicateCount,
        filteredNewResults: newResults.length,
        currentResultsCount: results.length,
        hasMorePages: data.hasMorePages,
        requestedPage: currentPage + 1,
        sampleNewUsernames: newResults.slice(0, 3).map(r => r.username),
        sampleExistingUsernames: Array.from(seenUsernames).slice(0, 3)
      })

      if (newResults.length > 0) {
        // Append new results to existing ones
        setResults(prev => [...prev, ...newResults])
        setSeenUsernames(updatedUsernames)
        setDuplicatesFiltered(prev => prev + duplicateCount)
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
          setDuplicatesFiltered(prev => prev + duplicateCount)
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

  // Get available business types for selected industry
  const getAvailableBusinessTypes = (): string[] => {
    if (!selectedIndustry) return []
    return INDUSTRY_BUSINESS_TYPES[selectedIndustry as keyof typeof INDUSTRY_BUSINESS_TYPES] || []
  }

  // Generate DM Ideas function
  async function generateDMIdeas() {
    if (!selectedIndustry || !selectedDMBusinessType || !selectedTone || !selectedDMType) {
      setDmError("Please fill in all required fields.")
      return
    }

    setLoadingDMIdeas(true)
    setDmError(null)
    setDmIdeas([])

    try {
      const res = await fetch("/api/dm-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry: selectedIndustry,
          businessType: selectedDMBusinessType,
          tone: selectedTone,
          dmType: selectedDMType,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to generate DM ideas")
      }

      const data = await res.json()
      setDmIdeas(data.ideas || [])
    } catch (err: any) {
      setDmError(err?.message || "Something went wrong while generating DM ideas.")
    } finally {
      setLoadingDMIdeas(false)
    }
  }

  // Copy DM idea to clipboard
  async function copyToClipboard(text: string, id: number) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  function handleDownloadCSV() {
    if (results.length === 0) return

    // Create CSV content
    const headers = ['Name/Title', 'URL'];
      
    const csvContent = [
      headers.join(','),
      ...results.map(result => {
        const basicData = [
          `"${result.title.replace(/"/g, '""')}"`,
          `"${result.url}"`
        ];
        
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
      
      // Filter duplicates from imported results  
      const { filteredResults, duplicateCount } = filterDuplicates(normalized)
      
      console.log('Import results filtering:', {
        totalImported: normalized.length,
        duplicatesFiltered: duplicateCount,
        uniqueResults: filteredResults.length
      })
      
      setResults(filteredResults)
      setDuplicatesFiltered(duplicateCount)
      
      // Update seen Usernames
      const newSeenUsernames = new Set<string>()
      filteredResults.forEach(result => {
        const username = result.username?.toLowerCase() || extractInstagramUsername(result.url)
        if (username) {
          newSeenUsernames.add(username)
        }
      })
      setSeenUsernames(newSeenUsernames)
    } catch (err: any) {
      setError("Invalid JSON file. Please provide a valid Apify dataset JSON.")
    } finally {
      // reset input so the same file can be re-selected
      e.target.value = ""
    }
  }

  const searchDisabled = !who.trim() || !selectedCity.trim()

  // Get available cities for selected country
  const availableCities: string[] = React.useMemo(() => {
    if (!selectedCountry) return []
    const cities = COUNTRIES_CITIES[selectedCountry as keyof typeof COUNTRIES_CITIES]
    return Array.isArray(cities) ? [...cities] : []
  }, [selectedCountry])

  // Handle country change and reset city selection
  const handleCountryChange = (country: string) => {
    setSelectedCountry(country)
    setSelectedCity("") // Reset city when country changes
    setResults([]) // Reset results when country changes
    setSeenUsernames(new Set()) // Reset seen usernames when country changes
  }

  // Download results as CSV
  const downloadCSV = () => {
    if (results.length === 0) return

    const headers = ['Title', 'URL', 'Username', 'Full Name', 'Bio', 'Followers', 'Following', 'Posts', 'Verified', 'Business Account', 'Profile Pic URL', 'External URL', 'Email', 'Phone', 'Address']
    const csvContent = [
      headers.join(','),
      ...results.map(result => [
        `"${result.title || ''}",`,
        `"${result.url || ''}",`,
        `"${result.username || ''}",`,
        `"${result.fullName || ''}",`,
        `"${(result.bio || '').replace(/"/g, '""')}",`,
        result.followers || 0,
        result.following || 0,
        result.posts || 0,
        result.verified || false,
        result.businessAccount || false,
        `"${result.profilePicUrl || ''}",`,
        `"${result.externalUrl || ''}",`,
        `"${result.contactInfo?.email || ''}",`,
        `"${result.contactInfo?.phone || ''}",`,
        `"${result.contactInfo?.address || ''}"`
      ].join(''))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `instagram-leads-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="grid gap-4 sm:gap-6">
      <Tabs defaultValue="lead-scraper" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lead-scraper">Lead Scraper</TabsTrigger>
          <TabsTrigger value="ai-dm-ideas">
            <Lightbulb className="mr-2 h-4 w-4" />
            AI DM Ideas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="lead-scraper" className="space-y-4">
          <div className="grid gap-4 sm:gap-6">
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="business-category">Business Category</Label>
            <Select value={selectedBusinessCategory} onValueChange={(value) => {
              setSelectedBusinessCategory(value)
              setSelectedBusinessType("") // Reset business type when category changes
            }}>
              <SelectTrigger id="business-category" className="text-base">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(BUSINESS_CATEGORIES).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="business-type">Business Type</Label>
            <Select 
              value={selectedBusinessType} 
              onValueChange={setSelectedBusinessType}
              disabled={!selectedBusinessCategory}
            >
              <SelectTrigger id="business-type" className="text-base">
                <SelectValue placeholder={selectedBusinessCategory ? "Select type" : "Select category first"} />
              </SelectTrigger>
              <SelectContent>
                {selectedBusinessCategory && Object.keys(BUSINESS_CATEGORIES[selectedBusinessCategory as keyof typeof BUSINESS_CATEGORIES] || {}).map((businessType) => (
                  <SelectItem key={businessType} value={businessType}>
                    {businessType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                {availableCities.map((city: string) => (
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
              placeholder="100"
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
        
        {/* Show selected keywords */}
        {selectedBusinessType && getSelectedKeywords().length > 0 && (
          <div className="p-4 bg-muted/50 rounded-lg border">
            <h4 className="text-sm font-medium mb-2">Search Keywords for {selectedBusinessType}:</h4>
            <div className="flex flex-wrap gap-1">
              {getSelectedKeywords().slice(0, 10).map((keyword) => (
                <span key={keyword} className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                  {keyword}
                </span>
              ))}
              {getSelectedKeywords().length > 10 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs">
                  +{getSelectedKeywords().length - 10} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Optional manual keyword input */}
        <div className="grid gap-2">
          <Label htmlFor="manual-keywords">Additional Keywords (Optional)</Label>
          <Input
            id="manual-keywords"
            placeholder="Add custom keywords separated by commas..."
            value={who}
            onChange={(e) => setWho(e.target.value)}
            className="text-base"
          />
          <p className="text-xs text-muted-foreground">
            Use this field to add custom keywords or override the business type selection
          </p>
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
        
        <Button 
          type="submit" 
          disabled={loading || !selectedCountry || !selectedCity || (!who.trim() && !selectedBusinessType)}
          className="w-full sm:w-auto justify-self-start"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Search Instagram
            </>
          )}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Request failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-3 sm:items-center mb-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={downloadCSV}
                disabled={results.length === 0}
                className="w-full sm:w-auto bg-transparent text-green-700 border-green-300 hover:bg-green-50"
              >
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Download CSV</span>
                <span className="sm:hidden">Download</span>
              </Button>
            
            {seenUsernames.size > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={clearDuplicateHistory}
                className="w-full sm:w-auto bg-transparent text-yellow-700 border-yellow-300 hover:bg-yellow-50"
                title={`Clear duplicate history (${seenUsernames.size} Usernames tracked)`}
              >
                <span className="mr-2">🔄</span>
                <span className="hidden sm:inline">Clear Duplicates ({seenUsernames.size})</span>
                <span className="sm:hidden">Clear ({seenUsernames.size})</span>
              </Button>
            )}
          </div>
        </div>
        </CardContent>
      </Card>

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
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                Total: {results.length}
              </span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                Limit: {limit}
              </span>
              {duplicatesFiltered > 0 && (
                <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full border border-yellow-200">
                  🔄 {duplicatesFiltered} duplicates filtered
                </span>
              )}
              {currentPage > 1 && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  Page: {currentPage}
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
                  {Array.isArray(results) && results.map((r, idx) => (
                    <div key={r.url || `result-${idx}`} className="p-3 sm:p-4 space-y-3">
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
                    <TableHead className="w-1/2">Name/Title</TableHead>
                    <TableHead className="w-1/2">URL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.length === 0 && !loading ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                        <div className="text-sm">No results yet.</div>
                        <div className="text-xs mt-1">Try a search above or import a results JSON file.</div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    Array.isArray(results) && results.map((r, idx) => (
                      <TableRow key={r.url || `table-result-${idx}`} className="hover:bg-muted/50">
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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

        </CardContent>
      </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="ai-dm-ideas" className="space-y-4">
          <div className="grid gap-4 sm:gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold">AI-Powered Instagram DM Ideas</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Generate personalized Instagram DM templates for reaching out to businesses without websites. 
                    These AI-generated messages focus on web development services and are designed to be natural, 
                    conversational, and compliant with Instagram's guidelines.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="industry">Industry *</Label>
                      <Select value={selectedIndustry} onValueChange={(value) => {
                        setSelectedIndustry(value)
                        setSelectedDMBusinessType("") // Reset business type when industry changes
                      }}>
                        <SelectTrigger id="industry" className="text-base">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDUSTRIES.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="dm-business-type">Business Type *</Label>
                      <Select 
                        value={selectedDMBusinessType} 
                        onValueChange={setSelectedDMBusinessType}
                        disabled={!selectedIndustry}
                      >
                        <SelectTrigger id="dm-business-type" className="text-base">
                          <SelectValue placeholder={selectedIndustry ? "Select business type" : "Select industry first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableBusinessTypes().map((type: string) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="tone">Tone *</Label>
                      <Select value={selectedTone} onValueChange={setSelectedTone}>
                        <SelectTrigger id="tone" className="text-base">
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          {DM_TONES.map((tone) => (
                            <SelectItem key={tone} value={tone}>
                              {tone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="dm-type">DM Approach *</Label>
                      <Select value={selectedDMType} onValueChange={setSelectedDMType}>
                        <SelectTrigger id="dm-type" className="text-base">
                          <SelectValue placeholder="Select approach" />
                        </SelectTrigger>
                        <SelectContent>
                          {DM_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={generateDMIdeas} 
                    disabled={loadingDMIdeas || !selectedIndustry || !selectedDMBusinessType}
                    className="w-full sm:w-auto"
                  >
                    {loadingDMIdeas ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Ideas...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Generate DM Ideas
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {dmError && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{dmError}</AlertDescription>
              </Alert>
            )}
            
            {dmIdeas.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Generated DM Ideas</h3>
                      <span className="text-sm text-muted-foreground">
                        {selectedIndustry} • {selectedDMBusinessType}
                      </span>
                    </div>
                    
                    <div className="grid gap-4">
                      {dmIdeas.map((idea) => (
                        <Card key={idea.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm">{idea.title}</h4>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(idea.message, idea.id)}
                                  className="h-8"
                                >
                                  {copiedId === idea.id ? (
                                    <>
                                      <CheckCircle className="mr-1 h-3 w-3 text-green-600" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="mr-1 h-3 w-3" />
                                      Copy
                                    </>
                                  )}
                                </Button>
                              </div>
                              <Textarea
                                value={idea.message}
                                readOnly
                                className="min-h-[80px] text-sm resize-none"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <Alert>
                      <Lightbulb className="h-4 w-4" />
                      <AlertTitle>Best Practices</AlertTitle>
                      <AlertDescription className="text-sm">
                        • Respect Instagram's daily DM limits (20-50 for new accounts, 100-150 for established accounts)
                        • Personalize each message before sending
                        • Only message users who might genuinely benefit from your services
                        • Follow up respectfully if you don't get a response
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
