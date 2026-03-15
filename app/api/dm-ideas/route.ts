import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'DM Ideas feature is currently unavailable.' },
    { status: 503 }
  )
}
