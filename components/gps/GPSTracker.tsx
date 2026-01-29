// components/gps/GPSTracker.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Play, Pause, Square, Navigation } from 'lucide-react'
import { RoutePoint } from '@/types/database'

interface GPSTrackerProps {
  onRouteUpdate: (route: RoutePoint[]) => void
}

export function GPSTracker({ onRouteUpdate }: GPSTrackerProps) {
  const [isTracking, setIsTracking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [route, setRoute] = useState<RoutePoint[]>([])
  const [currentPosition, setCurrentPosition] = useState<GeolocationPosition | null>(null)
  const watchIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (isTracking && !isPaused) {
      startTracking()
    } else {
      stopTracking()
    }

    return () => stopTracking()
  }, [isTracking, isPaused])

  const startTracking = () => {
    if (!navigator.geolocation) {
      alert('GPS not supported by your browser')
      return
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const point: RoutePoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          elevation: position.coords.altitude || undefined,
          timestamp: new Date().toISOString(),
        }

        setCurrentPosition(position)
        setRoute((prev) => {
          const newRoute = [...prev, point]
          onRouteUpdate(newRoute)
          return newRoute
        })
      },
      (error) => {
        console.error('GPS error:', error)
        alert('Failed to get GPS location. Please check permissions.')
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    )
  }

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }

  const handleStart = () => {
    setIsTracking(true)
    setIsPaused(false)
    setRoute([])
  }

  const handlePause = () => {
    setIsPaused(!isPaused)
  }

  const handleStop = () => {
    setIsTracking(false)
    setIsPaused(false)
    stopTracking()
  }

  const calculateDistance = () => {
    if (route.length < 2) return 0

    let total = 0
    for (let i = 1; i < route.length; i++) {
      total += getDistanceBetweenPoints(route[i - 1], route[i])
    }
    return total
  }

  const getDistanceBetweenPoints = (p1: RoutePoint, p2: RoutePoint): number => {
    const R = 6371 // Earth's radius in km
    const dLat = toRad(p2.lat - p1.lat)
    const dLon = toRad(p2.lng - p1.lng)
    const lat1 = toRad(p1.lat)
    const lat2 = toRad(p2.lat)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const toRad = (degrees: number) => (degrees * Math.PI) / 180

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Navigation className="w-5 h-5 text-blue-600" />
        <h4 className="font-semibold text-gray-900">GPS Tracking</h4>
      </div>

      {currentPosition && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm space-y-1">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>
              {currentPosition.coords.latitude.toFixed(6)},{' '}
              {currentPosition.coords.longitude.toFixed(6)}
            </span>
          </div>
          <div className="text-gray-600">
            Accuracy: {currentPosition.coords.accuracy.toFixed(0)}m
          </div>
          <div className="text-gray-600">
            Distance: {calculateDistance().toFixed(2)} km
          </div>
          <div className="text-gray-600">Points recorded: {route.length}</div>
        </div>
      )}

      <div className="flex gap-2">
        {!isTracking ? (
          <button
            onClick={handleStart}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Start GPS
          </button>
        ) : (
          <>
            <button
              onClick={handlePause}
              className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-700 transition flex items-center justify-center gap-2"
            >
              <Pause className="w-4 h-4" />
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={handleStop}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          </>
        )}
      </div>

      {!isTracking && route.length > 0 && (
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          ✓ Route captured with {route.length} GPS points ({calculateDistance().toFixed(2)} km)
        </div>
      )}
    </div>
  )
}