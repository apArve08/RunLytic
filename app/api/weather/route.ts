import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { fetchWeatherByCity, fetchWeatherByCoords } from '@/lib/weather'

// GET /api/weather?city=KL  or  ?lat=3.1&lng=101.6
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city')
  const lat  = searchParams.get('lat')
  const lng  = searchParams.get('lng')

  let weather = null
  if (lat && lng) {
    weather = await fetchWeatherByCoords(parseFloat(lat), parseFloat(lng))
  } else if (city) {
    weather = await fetchWeatherByCity(city)
  } else {
    return NextResponse.json({ error: 'Provide city or lat/lng' }, { status: 400 })
  }

  if (!weather) {
    return NextResponse.json({ error: 'Could not fetch weather' }, { status: 422 })
  }
  return NextResponse.json({ weather })
}

// POST /api/weather — fetch weather and save it to an existing run
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { runId, city, lat, lng } = await request.json()
    if (!runId) return NextResponse.json({ error: 'runId required' }, { status: 400 })

    let weather = null
    if (lat != null && lng != null) {
      weather = await fetchWeatherByCoords(lat, lng)
    } else if (city?.trim()) {
      weather = await fetchWeatherByCity(city.trim())
    } else {
      return NextResponse.json({ error: 'Provide city or lat/lng' }, { status: 400 })
    }

    if (!weather) {
      return NextResponse.json({ error: 'Could not fetch weather. Check the city name or API key.' }, { status: 422 })
    }

    const { error } = await supabase
      .from('runs')
      .update({ weather_data: weather })
      .eq('id', runId)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ weather })
  } catch (err) {
    console.error('Weather route error:', err)
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 })
  }
}
