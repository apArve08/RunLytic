// app/api/personal-records/route.ts
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

    const { data: records, error } = await supabase
      .from('personal_records')
      .select(`
        *,
        run:runs(*)
      `)
      .eq('user_id', user.id)
      .order('achieved_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ records: records || [] })
  } catch (error) {
    console.error('Error fetching personal records:', error)
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 })
  }
}