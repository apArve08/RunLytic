// app/api/race-predictor/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { subMonths } from 'date-fns'

// Race distance in km
const RACE_DISTANCES = {
  '5K': 5,
  '10K': 10,
  'HALF': 21.0975,
  'FULL': 42.195,
}

// Riegel formula: T2 = T1 × (D2/D1)^1.06
function riegelFormula(time1: number, dist1: number, dist2: number): number {
  return time1 * Math.pow(dist2 / dist1, 1.06)
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

    // Get runs from last 3 months for better accuracy
    const threeMonthsAgo = subMonths(new Date(), 3)

    const { data: runs, error } = await supabase
      .from('runs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', threeMonthsAgo.toISOString().split('T')[0])
      .order('date', { ascending: false })

    if (error) throw error

    if (!runs || runs.length < 3) {
      return NextResponse.json({
        error: 'Need at least 3 runs in the last 3 months for predictions',
      }, { status: 400 })
    }

    // Calculate average pace from recent runs
    const recentRuns = runs.slice(0, 10) // Last 10 runs
    const avgPace = recentRuns.reduce((sum, run) => sum + run.pace, 0) / recentRuns.length
    const avgDistance = recentRuns.reduce((sum, run) => sum + parseFloat(run.distance), 0) / recentRuns.length

    // Find best performances for different distances
    const bestPaces: { [key: string]: { pace: number; distance: number; time: number } } = {}
    
    runs.forEach(run => {
      const dist = parseFloat(run.distance)
      const distKey = dist < 7 ? 'short' : dist < 15 ? 'medium' : 'long'
      
      if (!bestPaces[distKey] || run.pace < bestPaces[distKey].pace) {
        bestPaces[distKey] = {
          pace: run.pace,
          distance: dist,
          time: run.duration,
        }
      }
    })

    // Generate predictions
    const predictions = []

    for (const [raceName, raceDistance] of Object.entries(RACE_DISTANCES)) {
      let predictedTime: number
      let confidence: 'low' | 'medium' | 'high'
      let basedOn: string

      // Use best matching distance
      if (raceDistance <= 10) {
        const base = bestPaces.short || bestPaces.medium
        if (base) {
          predictedTime = riegelFormula(base.time, base.distance, raceDistance)
          confidence = avgDistance >= 5 ? 'high' : 'medium'
          basedOn = `${base.distance.toFixed(1)}km best performance`
        } else {
          // Fallback to average pace
          predictedTime = (avgPace * 60) * raceDistance
          confidence = 'low'
          basedOn = 'average training pace'
        }
      } else if (raceDistance <= 21) {
        const base = bestPaces.medium || bestPaces.long
        if (base) {
          predictedTime = riegelFormula(base.time, base.distance, raceDistance)
          confidence = avgDistance >= 10 ? 'high' : 'medium'
          basedOn = `${base.distance.toFixed(1)}km best performance`
        } else {
          predictedTime = (avgPace * 60) * raceDistance
          confidence = 'low'
          basedOn = 'average training pace'
        }
      } else {
        // Marathon
        const base = bestPaces.long || bestPaces.medium
        if (base) {
          predictedTime = riegelFormula(base.time, base.distance, raceDistance)
          confidence = avgDistance >= 15 ? 'medium' : 'low'
          basedOn = `${base.distance.toFixed(1)}km best performance`
        } else {
          predictedTime = (avgPace * 60 * 1.05) * raceDistance // Add 5% for marathon
          confidence = 'low'
          basedOn = 'average training pace (adjusted)'
        }
      }

      predictions.push({
        distance: raceName,
        predictedTime: Math.round(predictedTime),
        predictedPace: parseFloat((predictedTime / 60 / raceDistance).toFixed(2)),
        confidence,
        basedOn,
      })
    }

    return NextResponse.json({
      predictions,
      dataQuality: {
        totalRuns: runs.length,
        recentRuns: recentRuns.length,
        avgDistance: parseFloat(avgDistance.toFixed(2)),
        avgPace: parseFloat(avgPace.toFixed(2)),
      },
    })
  } catch (error: any) {
    console.error('Race predictor error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate predictions' },
      { status: 500 }
    )
  }
}