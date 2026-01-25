// app/api/goals/route.ts
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
    const month = searchParams.get('month') // YYYY-MM-DD

    let query = supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)

    if (month) {
      query = query.eq('month', month)
    }

    const { data: goals, error } = await query.order('month', { ascending: false })

    if (error) throw error

    return NextResponse.json({ goals: goals || [] })
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 })
  }
}

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
    const { month, target_distance, target_runs } = body

    const { data: goal, error } = await supabase
      .from('goals')
      .upsert(
        {
          user_id: user.id,
          month,
          target_distance,
          target_runs,
        },
        { onConflict: 'user_id,month' }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ goal })
  } catch (error) {
    console.error('Error saving goal:', error)
    return NextResponse.json({ error: 'Failed to save goal' }, { status: 500 })
  }
}