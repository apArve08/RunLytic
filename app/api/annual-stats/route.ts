// app/api/annual-stats/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { startOfYear, endOfYear, format, eachMonthOfInterval } from 'date-fns'

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
    const yearParam = searchParams.get('year')
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear()

    const yearStart = startOfYear(new Date(year, 0, 1))
    const yearEnd = endOfYear(new Date(year, 0, 1))

    // Fetch all runs for the year
    const { data: runs, error } = await supabase
      .from('runs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', format(yearStart, 'yyyy-MM-dd'))
      .lte('date', format(yearEnd, 'yyyy-MM-dd'))
      .order('date', { ascending: true })

    if (error) throw error

    // Calculate annual stats
    const totalDistance = runs?.reduce((sum, run) => sum + parseFloat(String(run.distance)), 0) || 0
    const totalDuration = runs?.reduce((sum, run) => sum + run.duration, 0) || 0
    const totalRuns = runs?.length || 0
    const avgPace = totalDistance > 0 ? totalDuration / 60 / totalDistance : 0
    const avgDistance = totalRuns > 0 ? totalDistance / totalRuns : 0
    const longestRun = runs?.reduce((max, run) => Math.max(max, parseFloat(String(run.distance))), 0) || 0
    const fastestPace = runs?.reduce((min, run) => Math.min(min, run.pace), Infinity) || 0
    const totalCalories = Math.round(totalDistance * 62)
    const totalElevationGain = runs?.reduce((sum, run) => sum + (run.elevation_gain || 0), 0) || 0

    // Monthly breakdown
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd })
    const monthlyData = months.map((month) => {
      const monthKey = format(month, 'yyyy-MM')
      const monthRuns = runs?.filter((run) => run.date.startsWith(monthKey)) || []
      const monthDistance = monthRuns.reduce(
        (sum, run) => sum + parseFloat(String(run.distance)),
        0
      )
      const monthDuration = monthRuns.reduce((sum, run) => sum + run.duration, 0)
      const avgPace = monthDistance > 0 ? monthDuration / 60 / monthDistance : 0

      return {
        month: format(month, 'MMM'),
        distance: parseFloat(monthDistance.toFixed(2)),
        runs: monthRuns.length,
        avgPace: parseFloat(avgPace.toFixed(2)),
      }
    })

    // Running streak (consecutive days)
    let currentStreak = 0
    let maxStreak = 0
    let lastDate: Date | null = null

    runs?.forEach((run) => {
      const runDate = new Date(run.date)
      if (!lastDate) {
        currentStreak = 1
      } else {
        const diffDays = Math.floor(
          (runDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        if (diffDays === 1) {
          currentStreak++
        } else {
          maxStreak = Math.max(maxStreak, currentStreak)
          currentStreak = 1
        }
      }
      lastDate = runDate
    })
    maxStreak = Math.max(maxStreak, currentStreak)

    // Most active day of week
    const dayOfWeekCount: { [key: number]: number } = {}
    runs?.forEach((run) => {
      const day = new Date(run.date).getDay()
      dayOfWeekCount[day] = (dayOfWeekCount[day] || 0) + 1
    })
    const mostActiveDay = Object.entries(dayOfWeekCount).reduce(
      (max, [day, count]) => (count > max.count ? { day: parseInt(day), count } : max),
      { day: 0, count: 0 }
    )
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    return NextResponse.json({
      year,
      stats: {
        totalDistance: parseFloat(totalDistance.toFixed(2)),
        totalRuns,
        totalDuration,
        totalHours: parseFloat((totalDuration / 3600).toFixed(1)),
        avgPace: parseFloat(avgPace.toFixed(2)),
        avgDistance: parseFloat(avgDistance.toFixed(2)),
        longestRun: parseFloat(longestRun.toFixed(2)),
        fastestPace: fastestPace === Infinity ? 0 : parseFloat(fastestPace.toFixed(2)),
        totalCalories,
        totalElevationGain: parseFloat(totalElevationGain.toFixed(1)),
        maxStreak,
        currentStreak,
        mostActiveDay: dayNames[mostActiveDay.day],
      },
      monthlyData,
      runs: runs || [],
    })
  } catch (error) {
    console.error('Error fetching annual stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}