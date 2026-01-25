// app/api/shoes/route.ts
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

    const { data: shoes, error } = await supabase
      .from('shoes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ shoes })
  } catch (error) {
    console.error('Error fetching shoes:', error)
    return NextResponse.json({ error: 'Failed to fetch shoes' }, { status: 500 })
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
    const { brand, model, nickname, purchase_date } = body

    const { data: shoe, error } = await supabase
      .from('shoes')
      .insert({
        user_id: user.id,
        brand,
        model,
        nickname: nickname || null,
        purchase_date: purchase_date || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ shoe })
  } catch (error) {
    console.error('Error creating shoe:', error)
    return NextResponse.json({ error: 'Failed to create shoe' }, { status: 500 })
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
    const shoeId = searchParams.get('id')

    if (!shoeId) {
      return NextResponse.json({ error: 'Shoe ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('shoes')
      .delete()
      .eq('id', shoeId)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting shoe:', error)
    return NextResponse.json({ error: 'Failed to delete shoe' }, { status: 500 })
  }
}