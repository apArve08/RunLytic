import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { runId, distance, duration, pace, notes } = body

    // 1. Initialize Gemini with explicit check
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    
    if (!apiKey) {
      console.error("CRITICAL: GOOGLE_GEMINI_API_KEY is missing from process.env")
      return NextResponse.json({ error: 'Server configuration error: Missing API Key' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `Analyze this run:
      Distance: ${distance}km
      Duration: ${duration} seconds
      Pace: ${pace} min/km
      Notes: ${notes || 'None'}
      
      Provide a brief (3-4 sentence) analysis. Is the pace consistent? 
      Give one tip for the next run. Keep it conversational.`

    const result = await model.generateContent(prompt)
    const analysis = result.response.text()

    // 2. Save to Supabase
    const supabase = await createClient()
    const { error: updateError } = await supabase
      .from('runs')
      .update({ ai_analysis: analysis })
      .eq('id', runId)

    if (updateError) throw updateError

    return NextResponse.json({ analysis })

  } catch (error: any) {
    console.error('AI Error Trace:', error)
    
    // Check for 404/model errors specifically
    if (error.message?.includes('not found')) {
       return NextResponse.json({ error: 'AI Model configuration error. Try using gemini-pro.' }, { status: 500 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to analyze run' },
      { status: 500 }
    )
  }
}