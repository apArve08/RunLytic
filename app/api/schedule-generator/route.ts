// app/api/schedule-generator/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { addDays, addWeeks, format, startOfWeek } from 'date-fns'

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

    const body = await request.json()
    const {
      goal_type,
      weeks,
      target_date,
      current_weekly_km,
      running_days_per_week,
      experience_level, // 'beginner', 'intermediate', 'advanced'
    } = body

    // Fetch user's recent runs for context
    const { data: recentRuns } = await supabase
      .from('runs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(20)

    const avgDistance = recentRuns && recentRuns.length > 0
      ? recentRuns.reduce((sum, run) => sum + parseFloat(run.distance), 0) / recentRuns.length
      : current_weekly_km / running_days_per_week

    const avgPace = recentRuns && recentRuns.length > 0
      ? recentRuns.reduce((sum, run) => sum + run.pace, 0) / recentRuns.length
      : 6.0 // default

    // Generate AI training plan
    const prompt = `Create a ${weeks}-week training plan for a ${experience_level} runner targeting a ${goal_type} race.

**Runner Profile:**
- Current weekly distance: ${current_weekly_km} km
- Running days per week: ${running_days_per_week}
- Average run distance: ${avgDistance.toFixed(2)} km
- Average pace: ${avgPace.toFixed(2)} min/km
- Target date: ${target_date || 'Not specified'}

**Requirements:**
1. Generate exactly ${weeks} weeks of training
2. Each week should have ${running_days_per_week} running days
3. Include variety: Easy runs, Tempo runs, Intervals, Long runs, Recovery runs
4. Follow proper progression (10% rule)
5. Include rest days
6. Build to a peak week, then taper if race-focused

**Output Format (CRITICAL - Must be valid JSON):**
Return ONLY a JSON object with this exact structure:
{
  "schedule_name": "Descriptive name",
  "description": "Brief overview",
  "weeks": [
    {
      "week_number": 1,
      "weekly_distance": 25,
      "runs": [
        {
          "day_of_week": 1,
          "run_type": "EASY",
          "distance": 5.0,
          "notes": "Easy pace, focus on form"
        }
      ]
    }
  ]
}

Run types: EASY, TEMPO, INTERVAL, LONG, RECOVERY, REST
Days: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday

Generate the plan now:`

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    let aiResponse = result.response.text()

    // Clean up response to extract JSON
    aiResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim()
    
    let scheduleData
    try {
      scheduleData = JSON.parse(aiResponse)
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse)
      throw new Error('AI generated invalid schedule format')
    }

    // Create schedule in database
    const { data: schedule, error: scheduleError } = await supabase
      .from('training_schedules')
      .insert({
        user_id: user.id,
        name: scheduleData.schedule_name || `${goal_type} Training Plan`,
        goal_type,
        target_date: target_date || null,
        weeks,
        is_active: true,
        ai_generated: true,
        description: scheduleData.description,
      })
      .select()
      .single()

    if (scheduleError) throw scheduleError

    // Calculate start date (next Monday)
    const startDate = startOfWeek(addDays(new Date(), 1), { weekStartsOn: 1 })

    // Create scheduled runs
    const scheduledRuns = []
    for (const week of scheduleData.weeks) {
      for (const run of week.runs) {
        const weekStart = addWeeks(startDate, week.week_number - 1)
        const runDate = addDays(weekStart, run.day_of_week - 1)

        scheduledRuns.push({
          schedule_id: schedule.id,
          week_number: week.week_number,
          day_of_week: run.day_of_week,
          scheduled_date: format(runDate, 'yyyy-MM-dd'),
          run_type: run.run_type,
          target_distance: run.distance || null,
          target_duration: null,
          notes: run.notes || null,
          completed: false,
        })
      }
    }

    const { error: runsError } = await supabase
      .from('scheduled_runs')
      .insert(scheduledRuns)

    if (runsError) throw runsError

    return NextResponse.json({
      schedule,
      scheduled_runs: scheduledRuns.length,
    })
  } catch (error: any) {
    console.error('Schedule generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate schedule' },
      { status: 500 }
    )
  }
}