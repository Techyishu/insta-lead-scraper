import { NextRequest, NextResponse } from 'next/server'

// Country phone codes mapping
const COUNTRY_PHONE_CODES = {
  "United States": "+1",
  "United Kingdom": "+44", 
  "Australia": "+61",
  "India": "+91"
}

function formatPhoneWithCountryCode(phone: string, countryCode: string): string {
  // Remove all non-digit characters except +
  let cleanPhone = phone.replace(/[^\d+]/g, '')
  
  // If phone already starts with +, return as is
  if (cleanPhone.startsWith('+')) {
    return cleanPhone
  }
  
  // If phone starts with country code digits, add + prefix
  if (countryCode === '+1' && cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
    return '+' + cleanPhone
  }
  if (countryCode === '+44' && cleanPhone.length >= 10 && cleanPhone.startsWith('44')) {
    return '+' + cleanPhone
  }
  if (countryCode === '+61' && cleanPhone.length >= 10 && cleanPhone.startsWith('61')) {
    return '+' + cleanPhone
  }
  if (countryCode === '+91' && cleanPhone.length >= 11 && cleanPhone.startsWith('91')) {
    return '+' + cleanPhone
  }
  
  // Remove leading 0 for UK numbers
  if (countryCode === '+44' && cleanPhone.startsWith('0')) {
    cleanPhone = cleanPhone.substring(1)
  }
  
  // Add country code prefix
  return countryCode + cleanPhone
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumbers, selectedCountry } = body

    if (!phoneNumbers || !Array.isArray(phoneNumbers)) {
      return NextResponse.json(
        { error: 'Missing required parameter: phoneNumbers (array)' },
        { status: 400 }
      )
    }

    // Get country code
    const countryCode = COUNTRY_PHONE_CODES[selectedCountry as keyof typeof COUNTRY_PHONE_CODES] || '+1'

    // Filter out empty or invalid phone numbers and format with country code
    const validPhoneNumbers = phoneNumbers
      .filter(phone => phone && typeof phone === 'string' && phone.trim().length > 0)
      .map(phone => formatPhoneWithCountryCode(phone.trim(), countryCode))

    if (validPhoneNumbers.length === 0) {
      return NextResponse.json({
        success: true,
        results: [],
        message: 'No valid phone numbers provided'
      })
    }

    // Prepare the input for WhatsApp validator Apify API
    const apifyInput = {
      PhoneNumbersArray: validPhoneNumbers
    }

    // Make request to Apify WhatsApp validator API
    const token = process.env.APIFY_TOKEN_WHATSAPP
    if (!token) {
      return NextResponse.json({ error: 'APIFY_TOKEN_WHATSAPP is not configured' }, { status: 500 })
    }
    const apifyUrl = `https://api.apify.com/v2/acts/thinkerpro~whatsapp-number-validator/run-sync-get-dataset-items?token=${token}`
    
    const response = await fetch(apifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apifyInput),
    })

    if (!response.ok) {
      throw new Error(`Apify WhatsApp validator API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Debug log to see the actual response structure
    console.log('WhatsApp validator raw response:', JSON.stringify(data, null, 2))

    // Transform the data to a more usable format
    const results = data.map((item: any) => {
      // Check all possible field names for WhatsApp status
      const hasWhatsApp = item.hasWhatsApp || 
                         item.isValid || 
                         item.valid || 
                         item.isWhatsAppValid ||
                         item.whatsappValid ||
                         item.result === true ||
                         item.result === 'true' ||
                         item.status === 'valid' ||
                         item.status === 'active' ||
                         false
      
      console.log(`Phone ${item.phoneNumber || item.phone}: hasWhatsApp=${hasWhatsApp}, raw item:`, item)
      
      return {
        phoneNumber: item.phoneNumber || item.phone || item.number || item.phoneNo,
        hasWhatsApp: hasWhatsApp,
        status: hasWhatsApp ? 'active' : 'inactive',
        lastSeen: item.lastSeen || null,
        profilePicture: item.profilePicture || null
      }
    })

    return NextResponse.json({
      success: true,
      results: results,
      total: results.length,
      validatedCount: results.filter((r: any) => r.hasWhatsApp).length
    })

  } catch (error) {
    console.error('WhatsApp validator error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to validate WhatsApp numbers',
        success: false 
      },
      { status: 500 }
    )
  }
}
