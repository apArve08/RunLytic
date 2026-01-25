// app/api/schedules/route.ts
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
    const activeOnly = searchParams.get('active') === 'true'

    let query = supabase
      .from('training_schedules')
      .select('*')
      .eq('user_id', user.id)

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data: schedules, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ schedules: schedules || [] })
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 })
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
    const scheduleId = searchParams.get('id')
    const body = await request.json()

    const { error } = await supabase
      .from('training_schedules')
      .update(body)
      .eq('id', scheduleId)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating schedule:', error)
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 })
  }
}

// app/api/schedules/route.ts (ADD DELETE method to existing file)

// ... existing GET and PATCH methods ...

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
      const scheduleId = searchParams.get('id')
  
      if (!scheduleId) {
        return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 })
      }
  
      // Delete schedule (cascade will delete scheduled_runs)
      const { error } = await supabase
        .from('training_schedules')
        .delete()
        .eq('id', scheduleId)
        .eq('user_id', user.id)
  
      if (error) throw error
  
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error deleting schedule:', error)
      return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 })
    }
  }