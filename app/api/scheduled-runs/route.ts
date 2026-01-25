// app/api/scheduled-runs/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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
    const scheduleId = searchParams.get('schedule_id')
    const upcoming = searchParams.get('upcoming') === 'true'

    let query = supabase
      .from('scheduled_runs')
      .select(`
        *,
        schedule:training_schedules!inner(user_id)
      `)
      .eq('schedule.user_id', user.id)

    if (scheduleId) {
      query = query.eq('schedule_id', scheduleId)
    }

    if (upcoming) {
      const today = new Date().toISOString().split('T')[0]
      query = query.gte('scheduled_date', today).eq('completed', false)
    }

    const { data: scheduledRuns, error } = await query.order('scheduled_date', { ascending: true })

    if (error) throw error

    return NextResponse.json({ scheduled_runs: scheduledRuns || [] })
  } catch (error) {
    console.error('Error fetching scheduled runs:', error)
    return NextResponse.json({ error: 'Failed to fetch scheduled runs' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const runId = searchParams.get('id')
    const body = await request.json()

    const { error } = await supabase
      .from('scheduled_runs')
      .update(body)
      .eq('id', runId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating scheduled run:', error)
    return NextResponse.json({ error: 'Failed to update scheduled run' }, { status: 500 })
  }
}