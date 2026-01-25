// app/api/strava/sync/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { format } from 'date-fns'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { activities } = await request.json()

    if (!activities || !Array.isArray(activities)) {
      return NextResponse.json(
        { error: 'Invalid activities data' },
        { status: 400 }
      )
    }

    let imported = 0
    let skipped = 0

    for (const activity of activities) {
      // Check if activity already exists
      const { data: existingRun } = await supabase
        .from('runs')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', format(new Date(activity.start_date), 'yyyy-MM-dd'))
        .eq('distance', (activity.distance / 1000).toFixed(2))
        .maybeSingle()

      if (existingRun) {
        skipped++
        continue
      }

      // Convert Strava activity to run
      const distance = activity.distance / 1000 // meters to km
      const duration = activity.moving_time // already in seconds
      const pace = duration / 60 / distance // min/km

      const runData = {
        user_id: user.id,
        date: format(new Date(activity.start_date), 'yyyy-MM-dd'),
        distance: parseFloat(distance.toFixed(2)),
        duration,
        notes: `Imported from Strava: ${activity.name}`,
      }

      const { error } = await supabase.from('runs').insert(runData)

      if (error) {
        console.error('Error importing activity:', error)
        skipped++
      } else {
        imported++
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: activities.length,
    })
  } catch (error: any) {
    console.error('Error syncing Strava activities:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync activities' },
      { status: 500 }
    )
  }
}