// app/api/strava/activities/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  if (!response.ok) {
    throw new Error('Failed to refresh token')
  }
  return await response.json()
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Get Strava connection
    const { data: connection, error: connError } = await supabase
      .from('strava_connections')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (connError || !connection) {
      return NextResponse.json({ error: 'Strava not connected' }, { status: 400 })
    }

    let accessToken = connection.access_token
    const expiresAt = new Date(connection.expires_at)
    
    // 2. Refresh Token Logic
    if (expiresAt < new Date()) {
      console.log('DEBUG: Token expired, refreshing...')
      const tokenData = await refreshAccessToken(connection.refresh_token)
      accessToken = tokenData.access_token
      
      await supabase
        .from('strava_connections')
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
        })
        .eq('user_id', user.id)
    }

    // 3. Fetch from Strava
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const perPage = searchParams.get('per_page') || '3'

    const activitiesResponse = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )

    const rawActivities = await activitiesResponse.json()

    // ==========================================
    // DEEP DEBUG LOGGING - Check your Terminal!
    // ==========================================
    console.log('--- START STRAVA DEBUG ---')
    console.log('Status Code:', activitiesResponse.status)
    console.log('Total Raw Items Received:', Array.isArray(rawActivities) ? rawActivities.length : 'NOT AN ARRAY')
    
    if (Array.isArray(rawActivities) && rawActivities.length > 0) {
      const typesFound = [...new Set(rawActivities.map(a => a.type))]
      console.log('Activity Types found in your account:', typesFound)
      console.log('First Item Snippet:', {
        name: rawActivities[0].name,
        type: rawActivities[0].type,
        visibility: rawActivities[0].visibility
      })
    } else {
      console.log('Response body:', rawActivities)
    }
    console.log('--- END STRAVA DEBUG ---')
    // ==========================================

    if (!activitiesResponse.ok) {
      throw new Error(`Strava API Error: ${rawActivities.message || 'Unknown'}`)
    }

    // 4. Filter for runs
    // Note: If you have no runs, this makes the array empty!
    const runs = rawActivities.filter(
      (activity: any) => activity.type === 'Run' || activity.type === 'VirtualRun'
    )

    console.log(`DEBUG: Filtered ${rawActivities.length} total items down to ${runs.length} Runs.`)

    await supabase
      .from('strava_connections')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('user_id', user.id)

    return NextResponse.json({
      activities: runs,
      total: runs.length,
      debug_raw_count: rawActivities.length // Useful for frontend debugging
    })

  } catch (error: any) {
    console.error('CRITICAL API ERROR:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}