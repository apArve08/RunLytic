// app/api/strava/sync/route.ts (COMPLETE REPLACEMENT)
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { format } from 'date-fns'
import polyline from '@mapbox/polyline'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { activities } = await request.json()

    if (!activities || !Array.isArray(activities)) {
      return NextResponse.json(
        { error: 'Invalid activities data' },
        { status: 400 }
      )
    }

    let imported = 0
    let skipped = 0
    let errors = 0
    const errorDetails: string[] = []

    for (const activity of activities) {
      try {
        // Check if activity already exists
        const { data: existingRun } = await supabase
          .from('runs')
          .select('id')
          .eq('user_id', user.id)
          .eq('date', format(new Date(activity.start_date), 'yyyy-MM-dd'))
          .eq('distance', (activity.distance / 1000).toFixed(2))
          .maybeSingle()

        if (existingRun) {
          skipped++
          continue
        }

        // Convert Strava activity to run with proper type conversions
        const distance = activity.distance / 1000 // meters to km
        const duration = activity.moving_time // already in seconds
        const avgSpeed = (distance / (duration / 3600)).toFixed(2) // km/h

        // Decode polyline if available
        let routeData = null
        if (activity.map && activity.map.summary_polyline) {
          try {
            const coordinates = polyline.decode(activity.map.summary_polyline)
            routeData = coordinates.map(([lat, lng]: [number, number]) => ({
              lat,
              lng,
            }))
          } catch (polylineError) {
            console.error('Error decoding polyline:', polylineError)
          }
        }

        // Helper function to safely convert to integer
        const toInt = (value: any): number | null => {
          if (value === null || value === undefined) return null
          const num = typeof value === 'string' ? parseFloat(value) : value
          return isNaN(num) ? null : Math.round(num)
        }

        // Helper function to safely convert to float
        const toFloat = (value: any): number | null => {
          if (value === null || value === undefined) return null
          const num = typeof value === 'string' ? parseFloat(value) : value
          return isNaN(num) ? null : num
        }

        const runData = {
          user_id: user.id,
          date: format(new Date(activity.start_date), 'yyyy-MM-dd'),
          distance: parseFloat(distance.toFixed(2)),
          duration: Math.round(duration), // Ensure integer
          avg_speed: parseFloat(avgSpeed),
          avg_heart_rate: toInt(activity.average_heartrate),
          max_heart_rate: toInt(activity.max_heartrate),
          elevation_gain: toFloat(activity.total_elevation_gain),
          elevation_loss: null, // Strava doesn't provide this directly
          route_data: routeData,
          notes: `Imported from Strava: ${activity.name}${
            activity.description ? '\n\n' + activity.description : ''
          }`,
        }

        console.log('Importing activity:', {
          name: activity.name,
          date: runData.date,
          distance: runData.distance,
          avg_hr: runData.avg_heart_rate,
          max_hr: runData.max_heart_rate,
        })

        const { error } = await supabase.from('runs').insert(runData)

        if (error) {
          console.error('Error importing activity:', error)
          errorDetails.push(`${activity.name}: ${error.message}`)
          errors++
        } else {
          imported++
        }
      } catch (activityError: any) {
        console.error('Error processing activity:', activityError)
        errorDetails.push(`${activity.name}: ${activityError.message}`)
        errors++
      }
    }

    const response: any = {
      success: true,
      imported,
      skipped,
      errors,
      total: activities.length,
    }

    if (errorDetails.length > 0) {
      response.errorDetails = errorDetails
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error syncing Strava activities:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync activities' },
      { status: 500 }
    )
  }
}