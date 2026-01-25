// app/api/runs/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'


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
    const { date, distance, duration, shoes_id, notes } = body

    console.log('Creating run:', { date, distance, duration, shoes_id }) // Debug log

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

    return NextResponse.json({ run })
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