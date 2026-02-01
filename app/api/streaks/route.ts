// app/api/streaks/route.ts
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

    // Get current active streak
    const { data: currentStreak } = await supabase
      .from('running_streaks')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('start_date', { ascending: false })
      .limit(1)
      .single()

    // Get longest streak ever
    const { data: longestStreak } = await supabase
      .from('running_streaks')
      .select('*')
      .eq('user_id', user.id)
      .order('length', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      currentStreak: currentStreak?.length || 0,
      longestStreak: longestStreak?.length || 0,
      currentStreakData: currentStreak,
      longestStreakData: longestStreak,
    })
  } catch (error) {
    console.error('Error fetching streaks:', error)
    return NextResponse.json({ error: 'Failed to fetch streaks' }, { status: 500 })
  }
}