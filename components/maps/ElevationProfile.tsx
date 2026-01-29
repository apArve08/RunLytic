// components/maps/ElevationProfile.tsx (REPLACE ENTIRE FILE)
'use client'

import { RoutePoint } from '@/types/database'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ElevationProfileProps {
  route: RoutePoint[]
}

export function ElevationProfile({ route }: ElevationProfileProps) {
  // Only show if we have elevation data
  const hasElevation = route.some((point) => point.elevation !== undefined)

  if (!hasElevation) return null

  // Calculate distance at each point
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Calculate elevation data with proper distance calculation
  const elevationData = route.reduce((acc: Array<{distance: number; elevation: number}>, point, index) => {
    const previousPoint = index > 0 ? route[index - 1] : null
    
    const cumulativeDistance = previousPoint 
      ? acc[index - 1].distance + getDistance(
          previousPoint.lat,
          previousPoint.lng,
          point.lat,
          point.lng
        )
      : 0

    acc.push({
      distance: parseFloat(cumulativeDistance.toFixed(2)),
      elevation: point.elevation || 0,
    })

    return acc
  }, [])

  // Custom tooltip formatter with proper typing
  const customTooltipFormatter = (value: number | string | Array<number | string> | undefined) => {
    if (typeof value === 'number') {
      return [`${value.toFixed(0)}m`, 'Elevation']
    }
    return ['', '']
  }

  const customLabelFormatter = (value: number | string) => {
    if (typeof value === 'number') {
      return `${value.toFixed(2)} km`
    }
    return String(value)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Elevation Profile</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={elevationData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="distance"
            label={{ value: 'Distance (km)', position: 'insideBottom', offset: -5 }}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            label={{ value: 'Elevation (m)', angle: -90, position: 'insideLeft' }}
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            formatter={customTooltipFormatter}
            labelFormatter={customLabelFormatter}
          />
          <Area type="monotone" dataKey="elevation" stroke="#10b981" fill="#10b98144" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}