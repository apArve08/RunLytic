// app/api/strava/activities/route.ts (UPDATE the GET method)
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
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Strava connection
    const { data: connection, error: connError } = await supabase
      .from('strava_connections')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (connError || !connection) {
      return NextResponse.json(
        { error: 'Strava not connected' },
        { status: 400 }
      )
    }

    // Check if token expired
    let accessToken = connection.access_token
    const expiresAt = new Date(connection.expires_at)
    
    if (expiresAt < new Date()) {
      console.log('Token expired, refreshing...')
      const tokenData = await refreshAccessToken(connection.refresh_token)
      
      accessToken = tokenData.access_token
      
      // Update tokens in database
      await supabase
        .from('strava_connections')
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
        })
        .eq('user_id', user.id)
    }

    // Fetch activities from Strava
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const perPage = searchParams.get('per_page') || '30'

    const activitiesResponse = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!activitiesResponse.ok) {
      throw new Error('Failed to fetch activities from Strava')
    }

    const activities = await activitiesResponse.json()

    // Filter for runs only and fetch detailed data with polyline
    const runs = []
    for (const activity of activities) {
      if (activity.type === 'Run' || activity.type === 'VirtualRun') {
        // Fetch detailed activity to get full polyline
        const detailResponse = await fetch(
          `https://www.strava.com/api/v3/activities/${activity.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )

        if (detailResponse.ok) {
          const detailedActivity = await detailResponse.json()
          runs.push(detailedActivity)
        } else {
          // Fallback to summary data if detail fetch fails
          runs.push(activity)
        }
      }
    }

    // Update last sync time
    await supabase
      .from('strava_connections')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('user_id', user.id)

    return NextResponse.json({
      activities: runs,
      total: runs.length,
    })
  } catch (error: any) {
    console.error('Error fetching Strava activities:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}