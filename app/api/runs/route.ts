// app/api/runs/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// app/api/runs/route.ts (UPDATE POST method only)
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
    const { date, distance, duration, shoes_id, notes, avg_heart_rate, max_heart_rate, elevation_gain, elevation_loss, avg_speed, route_data } = body

    // Fetch weather if we have route data (first GPS point)
    let weatherData = null
    if (route_data && route_data.length > 0) {
      const { fetchWeather } = await import('@/lib/weather')
      weatherData = await fetchWeather(route_data[0].lat, route_data[0].lng, date)
    }

    // Insert run
    const { data: run, error } = await supabase
      .from('runs')
      .insert({
        user_id: user.id,
        date,
        distance,
        duration,
        shoes_id: shoes_id || null,
        notes,
        avg_heart_rate,
        max_heart_rate,
        elevation_gain,
        elevation_loss,
        avg_speed,
        route_data,
        weather_data: weatherData,
      })
      .select()
      .single()

    if (error) throw error

    // Update shoe mileage if shoes selected
    if (shoes_id) {
      const { error: shoeError } = await supabase.rpc('increment_shoe_distance', {
        shoe_id: shoes_id,
        distance_to_add: distance,
      })

      if (shoeError) console.error('Error updating shoe mileage:', shoeError)
    }

    // Detect personal records
    const { data: newPRs } = await supabase.rpc('detect_personal_records', {
      p_user_id: user.id,
      p_run_id: run.id,
      p_distance: parseFloat(distance),
      p_duration: duration,
      p_pace: run.pace,
      p_date: date,
    })

    // Update running streak
    await supabase.rpc('update_running_streak', {
      p_user_id: user.id,
      p_date: date,
    })

    return NextResponse.json({ 
      run,
      newPRs: newPRs || [],
      hasWeather: !!weatherData,
    })
  } catch (error) {
    console.error('Error creating run:', error)
    return NextResponse.json({ error: 'Failed to create run' }, { status: 500 })
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

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')

    let query = supabase
      .from('runs')
      .select(
        `
        *,
        shoes:shoes_id (
          id,
          brand,
          model,
          nickname
        )
      `
      )
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data: runs, error } = await query

    if (error) throw error

    return NextResponse.json({ runs })
  } catch (error) {
    console.error('Error fetching runs:', error)
    return NextResponse.json({ error: 'Failed to fetch runs' }, { status: 500 })
  }
}

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
    const runId = searchParams.get('id')

    if (!runId) {
      return NextResponse.json({ error: 'Run ID required' }, { status: 400 })
    }

    // Get run details before deleting (to update shoe mileage)
    const { data: run } = await supabase
      .from('runs')
      .select('shoes_id, distance')
      .eq('id', runId)
      .eq('user_id', user.id)
      .single()

    // Delete run
    const { error } = await supabase
      .from('runs')
      .delete()
      .eq('id', runId)
      .eq('user_id', user.id)

    if (error) throw error

    // Decrement shoe mileage
    if (run?.shoes_id) {
      await supabase.rpc('decrement_shoe_distance', {
        shoe_id: run.shoes_id,
        distance_to_subtract: run.distance,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting run:', error)
    return NextResponse.json({ error: 'Failed to delete run' }, { status: 500 })
  }
}

