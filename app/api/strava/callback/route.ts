// app/api/strava/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/settings?error=${error}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/settings?error=no_code', request.url)
    )
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      throw new Error(tokenData.message || 'Failed to exchange code')
    }

    // Save to database
    const { error: dbError } = await supabase.from('strava_connections').upsert(
      {
        user_id: user.id,
        athlete_id: tokenData.athlete.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
        athlete_data: {
          firstname: tokenData.athlete.firstname,
          lastname: tokenData.athlete.lastname,
          profile: tokenData.athlete.profile,
          city: tokenData.athlete.city,
          country: tokenData.athlete.country,
        },
        connected_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

    if (dbError) throw dbError

    return NextResponse.redirect(
      new URL('/settings?strava=connected', request.url)
    )
  } catch (error: any) {
    console.error('Strava callback error:', error)
    return NextResponse.redirect(
      new URL(`/settings?error=${error.message}`, request.url)
    )
  }
}