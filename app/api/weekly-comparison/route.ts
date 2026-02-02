// app/api/weekly-comparison/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { startOfWeek, endOfWeek, subWeeks, format } from 'date-fns'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 })
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 })
    const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
    const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })

    // Fetch this week's runs
    const { data: thisWeekRuns, error: thisWeekError } = await supabase
      .from('runs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', format(thisWeekStart, 'yyyy-MM-dd'))
      .lte('date', format(thisWeekEnd, 'yyyy-MM-dd'))

    if (thisWeekError) throw thisWeekError

    // Fetch last week's runs
    const { data: lastWeekRuns, error: lastWeekError } = await supabase
      .from('runs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', format(lastWeekStart, 'yyyy-MM-dd'))
      .lte('date', format(lastWeekEnd, 'yyyy-MM-dd'))

    if (lastWeekError) throw lastWeekError

    const calculateStats = (runs: any[]) => {
      const distance = runs.reduce((sum, run) => sum + parseFloat(String(run.distance)), 0)
      const avgPace = runs.length > 0 
        ? runs.reduce((sum, run) => sum + run.pace, 0) / runs.length 
        : 0

      return {
        distance: parseFloat(distance.toFixed(2)),
        runs: runs.length,
        avgPace: parseFloat(avgPace.toFixed(2)),
      }
    }

    return NextResponse.json({
      thisWeek: calculateStats(thisWeekRuns || []),
      lastWeek: calculateStats(lastWeekRuns || []),
    })
  } catch (error) {
    console.error('Error fetching weekly comparison:', error)
    return NextResponse.json({ error: 'Failed to fetch comparison' }, { status: 500 })
  }
}