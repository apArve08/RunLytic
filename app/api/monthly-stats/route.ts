// app/api/monthly-stats/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { startOfMonth, endOfMonth, eachWeekOfInterval, format } from 'date-fns'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const monthStr = searchParams.get('month') // YYYY-MM format
    
    if (!monthStr) {
      return NextResponse.json({ error: 'Month parameter required' }, { status: 400 })
    }

    const [year, month] = monthStr.split('-').map(Number)
    const targetDate = new Date(year, month - 1, 1)
    const monthStart = startOfMonth(targetDate)
    const monthEnd = endOfMonth(targetDate)

    // Fetch runs for the month
    const { data: runs, error } = await supabase
      .from('runs')
      .select(`
        *,
        shoes:shoes_id (
          id,
          brand,
          model,
          nickname
        )
      `)
      .eq('user_id', user.id)
      .gte('date', format(monthStart, 'yyyy-MM-dd'))
      .lte('date', format(monthEnd, 'yyyy-MM-dd'))
      .order('date', { ascending: true })

    if (error) throw error

    // Calculate monthly stats
    const totalDistance = runs?.reduce((sum, run) => sum + parseFloat(String(run.distance)), 0) || 0
    const totalDuration = runs?.reduce((sum, run) => sum + run.duration, 0) || 0
    const totalRuns = runs?.length || 0
    const avgPace = totalDistance > 0 ? totalDuration / 60 / totalDistance : 0
    const avgDistance = totalRuns > 0 ? totalDistance / totalRuns : 0
    const longestRun = runs?.reduce((max, run) => Math.max(max, parseFloat(String(run.distance))), 0) || 0
    const fastestPace = runs?.reduce((min, run) => Math.min(min, run.pace), Infinity) || 0
    const totalCalories = Math.round(totalDistance * 62) // Rough estimate: 62 cal/km

    // Weekly breakdown
    const weeks = eachWeekOfInterval(
      { start: monthStart, end: monthEnd },
      { weekStartsOn: 1 }
    )

    const weeklyData = weeks.map((weekStart, index) => {
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const weekRuns = runs?.filter((run) => {
        const runDate = new Date(run.date)
        return runDate >= weekStart && runDate <= weekEnd
      }) || []

      const weekDistance = weekRuns.reduce((sum, run) => sum + parseFloat(String(run.distance)), 0)
      const weekDuration = weekRuns.reduce((sum, run) => sum + run.duration, 0)
      const weekAvgPace = weekDistance > 0 ? weekDuration / 60 / weekDistance : 0

      return {
        weekNumber: index + 1,
        distance: parseFloat(weekDistance.toFixed(2)),
        runs: weekRuns.length,
        avgPace: parseFloat(weekAvgPace.toFixed(2)),
        weekStart: format(weekStart, 'MMM d'),
        weekEnd: format(weekEnd, 'MMM d'),
      }
    })

    // Fetch goal for this month
    const { data: goal } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', format(monthStart, 'yyyy-MM-dd'))
      .single()

    const stats = {
      totalDistance: parseFloat(totalDistance.toFixed(2)),
      totalRuns,
      totalDuration,
      avgPace: parseFloat(avgPace.toFixed(2)),
      avgDistance: parseFloat(avgDistance.toFixed(2)),
      longestRun: parseFloat(longestRun.toFixed(2)),
      fastestPace: fastestPace === Infinity ? 0 : parseFloat(fastestPace.toFixed(2)),
      totalCalories,
      weeklyData,
      runs: runs || [],
      goal: goal || null,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching monthly stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}