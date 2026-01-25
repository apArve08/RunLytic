// app/api/ai-progress/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { startOfMonth, subMonths, format } from 'date-fns'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { months = 3 } = await request.json()

    // Fetch runs for the last N months
    const endDate = new Date()
    const startDate = subMonths(endDate, months)

    const { data: runs, error } = await supabase
      .from('runs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .lte('date', format(endDate, 'yyyy-MM-dd'))
      .order('date', { ascending: true })

    if (error) throw error

    if (!runs || runs.length === 0) {
      return NextResponse.json({
        error: 'Not enough data. Need at least some runs to generate progress report.',
      }, { status: 400 })
    }

    // Calculate monthly trends
    const monthlyData: { [key: string]: any } = {}

    runs.forEach(run => {
      const monthKey = format(new Date(run.date), 'yyyy-MM')
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          distance: 0,
          runs: 0,
          totalDuration: 0,
          paces: [],
        }
      }
      monthlyData[monthKey].distance += parseFloat(run.distance)
      monthlyData[monthKey].runs += 1
      monthlyData[monthKey].totalDuration += run.duration
      monthlyData[monthKey].paces.push(run.pace)
    })

    // Format trends for AI
    const trends = Object.entries(monthlyData)
      .map(([month, data]: [string, any]) => ({
        month,
        distance: data.distance.toFixed(2),
        runs: data.runs,
        avgPace: (data.paces.reduce((a: number, b: number) => a + b, 0) / data.paces.length).toFixed(2),
        totalDuration: data.totalDuration,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // Calculate overall stats
    const totalDistance = runs.reduce((sum, run) => sum + parseFloat(run.distance), 0)
    const totalRuns = runs.length
    const avgDistance = totalDistance / totalRuns
    const allPaces = runs.map(r => r.pace)
    const avgPace = allPaces.reduce((a, b) => a + b, 0) / allPaces.length
    const bestPace = Math.min(...allPaces)

    // Generate AI prompt
    const prompt = `Analyze this runner's progress over the last ${months} months and provide a comprehensive progress report.

**Monthly Trends:**
${trends.map(t => `- ${t.month}: ${t.distance}km over ${t.runs} runs (avg pace: ${t.avgPace} min/km)`).join('\n')}

**Overall Stats (${months} months):**
- Total Distance: ${totalDistance.toFixed(2)} km
- Total Runs: ${totalRuns}
- Average Distance per Run: ${avgDistance.toFixed(2)} km
- Average Pace: ${avgPace.toFixed(2)} min/km
- Best Pace: ${bestPace.toFixed(2)} min/km

**Analysis Requirements:**
1. Identify the overall trend (improving, declining, or stable)
2. Highlight 2-3 key strengths or positive patterns
3. Identify 2-3 areas for improvement
4. Provide 3-4 specific, actionable recommendations
5. Comment on consistency and volume trends
6. Note any concerning patterns (injuries, burnout signs, etc.)

**Format:**
Provide a warm, encouraging analysis (300-400 words) that:
- Starts with an overall assessment
- Discusses specific trends with data
- Ends with motivating recommendations

Be specific, data-driven, honest but encouraging. Write in second person ("you", "your").`

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    const analysis = result.response.text()

    // Extract structured insights (simple keyword extraction)
    const lowerAnalysis = analysis.toLowerCase()
    const trend = lowerAnalysis.includes('improv') || lowerAnalysis.includes('progress') 
      ? 'improving' 
      : lowerAnalysis.includes('declin') || lowerAnalysis.includes('decreas')
      ? 'declining'
      : 'stable'

    const key_insights = {
      improvement_areas: [],
      strengths: [],
      recommendations: [],
      trend,
    }

    // Save report to database
    const { data: report, error: reportError } = await supabase
      .from('progress_reports')
      .insert({
        user_id: user.id,
        report_date: format(new Date(), 'yyyy-MM-dd'),
        report_type: 'monthly',
        analysis_text: analysis,
        key_insights,
      })
      .select()
      .single()

    if (reportError) throw reportError

    return NextResponse.json({
      report,
      trends,
      stats: {
        totalDistance: totalDistance.toFixed(2),
        totalRuns,
        avgDistance: avgDistance.toFixed(2),
        avgPace: avgPace.toFixed(2),
        bestPace: bestPace.toFixed(2),
      },
    })
  } catch (error: any) {
    console.error('AI progress analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate progress report' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: reports, error } = await supabase
      .from('progress_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('report_date', { ascending: false })
      .limit(10)

    if (error) throw error

    return NextResponse.json({ reports: reports || [] })
  } catch (error) {
    console.error('Error fetching progress reports:', error)
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}

// app/api/ai-progress/route.ts (ADD DELETE method to existing file)

// ... existing POST and GET methods ...

export async function DELETE(request: Request) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
  
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
  
      const { searchParams } = new URL(request.url)
      const reportId = searchParams.get('id')
  
      if (!reportId) {
        return NextResponse.json({ error: 'Report ID required' }, { status: 400 })
      }
  
      const { error } = await supabase
        .from('progress_reports')
        .delete()
        .eq('id', reportId)
        .eq('user_id', user.id)
  
      if (error) throw error
  
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error deleting report:', error)
      return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 })
    }
  }