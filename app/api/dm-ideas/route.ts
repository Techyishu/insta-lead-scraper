import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: "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",
})

export async function POST(request: NextRequest) {
  try {
    const { industry, businessType, tone, dmType } = await request.json()
    
    console.log('DM Ideas API - Received request:', { industry, businessType, tone, dmType })

    if (!industry || !businessType || !tone || !dmType) {
      return NextResponse.json(
        { error: "All fields are required: industry, businessType, tone, and dmType" },
        { status: 400 }
      )
    }

    const prompt = `Generate 6 natural and conversational Instagram DM ideas for reaching out to ${businessType} businesses in the ${industry} industry who don't have a website yet.

    Context:
    - You offer web development services specifically for businesses without websites
    - Target: ${businessType} in the ${industry} industry
    - Desired Tone: ${tone}
    - DM Approach: ${dmType}

    Requirements:
    - Make messages 200-300 characters (longer and more natural)
    - Use the specified tone: ${tone}
    - Follow the ${dmType} approach
    - Sound human and conversational, not robotic
    - Focus on helping businesses without websites get online
    - Mention the benefits of having a website for their specific industry
    - Be genuinely helpful and consultative
    - Avoid overly salesy or pushy language
    - Make them personalized for ${industry} ${businessType} businesses
    - Ensure compliance with Instagram's messaging guidelines
    
    Tone Guidelines:
    - Professional: Formal, business-focused language
    - Casual & Friendly: Relaxed, approachable tone
    - Direct & Straightforward: Clear, concise, to-the-point
    - Conversational: Natural, dialogue-style
    - Warm & Personal: Friendly, empathetic approach
    - Confident & Bold: Assertive, strong value proposition
    - Helpful & Supportive: Focus on assistance and guidance
    - Curious & Inquisitive: Question-based, discovery-oriented

    DM Approach Guidelines:
    - Straight to the Point: Direct value proposition about website benefits upfront
    - Question-Based Approach: Start with engaging questions about their online presence
    - Value Proposition First: Lead with clear benefits of having a website
    - Problem-Solution Format: Identify lack of website as pain point, offer solution
    - Compliment + Offer: Start with genuine compliment about their business, then mention website benefits
    - Story/Case Study Approach: Brief success story of similar business getting a website
    - Collaboration Proposal: Frame as partnership to help them grow online
    - Educational/Tips Based: Offer valuable insights about online presence for their industry

    Important: Make the messages sound natural and human. Use conversational language, include specific benefits for their industry, and avoid generic templates. Each message should feel personally crafted.
    
    Format the response as a JSON array with objects containing 'id' (number) and 'message' (string) fields.
    
    Example format for web development services:
    [
      {"id": 1, "message": "Hey! I noticed your amazing ${businessType} and love what you're doing in the ${industry} space. I help businesses like yours get online with professional websites. Having a strong web presence can really boost customer trust and reach for ${industry} businesses. Would you be interested in chatting about how a website could help grow your business?"},
      {"id": 2, "message": "Hi there! Your ${businessType} looks fantastic! I specialize in creating websites for ${industry} businesses and I've seen how much it can transform their growth. Most customers today search online first before visiting or buying. Would you like to know how a website could help you reach more customers in your area?"}
    ]`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional marketing expert who specializes in Instagram outreach and lead generation. You understand Instagram's policies and best practices for ethical business outreach."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    console.log('OpenAI raw response:', content)

    // Try to parse the JSON response
    let dmIdeas
    try {
      dmIdeas = JSON.parse(content)
      console.log('Parsed JSON successfully:', dmIdeas)
    } catch (parseError) {
      console.log('JSON parsing failed, processing as text')
      // If JSON parsing fails, create a structured response from the text
      const lines = content.split('\n').filter(line => line.trim() && !line.includes('```'))
      console.log('Filtered lines:', lines)
      
      dmIdeas = lines.map((line, index) => {
        // Remove numbering and clean up the line
        const cleanedLine = line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim()
        return {
          id: index + 1,
          title: `DM Template ${index + 1}`,
          message: cleanedLine
        }
      }).filter(idea => idea.message.length > 10).slice(0, 6) // Filter out very short lines
    }

    console.log('Final dmIdeas:', dmIdeas)

    // Ensure we have exactly 6 ideas
    if (!Array.isArray(dmIdeas) || dmIdeas.length === 0) {
      throw new Error('Invalid response format from OpenAI')
    }

    // Limit to 6 ideas and ensure proper structure
    const formattedIdeas = dmIdeas.slice(0, 6).map((idea, index) => ({
      id: idea.id || index + 1,
      title: idea.title || `DM Template ${index + 1}`,
      message: idea.message || idea.content || idea.toString()
    }))

    return NextResponse.json({
      ideas: formattedIdeas,
      industry,
      businessType,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error generating DM ideas:', error)
    
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'OpenAI API quota exceeded. Please check your billing.' },
        { status: 429 }
      )
    }
    
    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key. Please check your configuration.' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate DM ideas' },
      { status: 500 }
    )
  }
}
