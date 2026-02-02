// components/strava/StravaActivityCard.tsx (COMPLETE REPLACEMENT)
'use client'

import { useState } from 'react'
import { RouteMap } from '@/components/maps/RouteMap'
import { Calendar, MapPin, Heart, Mountain, ChevronDown, ChevronUp } from 'lucide-react'
import polyline from '@mapbox/polyline'
import { RoutePoint } from '@/types/database'

interface StravaActivityCardProps {
  activity: any
  selected?: boolean
}

export function StravaActivityCard({ activity, selected = false }: StravaActivityCardProps) {
  const [showMap, setShowMap] = useState(false)

  // Decode polyline
  let routeData: RoutePoint[] = []
  if (activity.map?.summary_polyline) {
    try {
      const coordinates = polyline.decode(activity.map.summary_polyline)
      routeData = coordinates.map(([lat, lng]: [number, number]) => ({
        lat,
        lng,
      }))
    } catch (error) {
      console.error('Error decoding polyline:', error)
    }
  }

  const hasRoute = routeData && routeData.length > 0

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden transition ${
      selected ? 'ring-2 ring-blue-500' : ''
    }`}>
      {/* Activity Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">{activity.name}</h4>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(activity.start_date).toLocaleDateString()}
              </span>
              {hasRoute && (
                <span className="flex items-center gap-1 text-blue-600">
                  <MapPin className="w-3 h-3" />
                  Route available
                </span>
              )}
            </div>
          </div>
          {hasRoute && (
            <button
              onClick={(e) => {
                e.stopPropagation() // Prevent triggering checkbox
                setShowMap(!showMap)
              }}
              className="text-blue-600 hover:text-blue-700 p-1"
            >
              {showMap ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-xs text-gray-500 mb-1">Distance</div>
            <div className="font-semibold text-gray-900">
              {(activity.distance / 1000).toFixed(2)} km
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-xs text-gray-500 mb-1">Duration</div>
            <div className="font-semibold text-gray-900">
              {Math.floor(activity.moving_time / 60)} min
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-xs text-gray-500 mb-1">Pace</div>
            <div className="font-semibold text-gray-900">
              {((activity.moving_time / 60) / (activity.distance / 1000)).toFixed(2)} min/km
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        {(activity.average_heartrate || activity.total_elevation_gain) && (
          <div className="flex gap-3 text-sm">
            {activity.average_heartrate && (
              <div className="flex items-center gap-1 text-red-600">
                <Heart className="w-4 h-4" />
                <span>{Math.round(activity.average_heartrate)} bpm</span>
              </div>
            )}
            {activity.total_elevation_gain && (
              <div className="flex items-center gap-1 text-green-600">
                <Mountain className="w-4 h-4" />
                <span>{Math.round(activity.total_elevation_gain)}m</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Preview */}
      {showMap && hasRoute && (
        <div className="border-t border-gray-200">
          <RouteMap route={routeData} height="250px" showMarkers={true} />
        </div>
      )}
    </div>
  )
}