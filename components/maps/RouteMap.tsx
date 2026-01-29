// components/maps/RouteMap.tsx
'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { RoutePoint } from '@/types/database'

// Fix default marker icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface RouteMapProps {
  route: RoutePoint[]
  height?: string
  showMarkers?: boolean
}

export function RouteMap({ route, height = '400px', showMarkers = true }: RouteMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapContainerRef.current || route.length === 0) return

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(
        [route[0].lat, route[0].lng],
        13
      )

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current)
    }

    const map = mapRef.current

    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline || layer instanceof L.Marker) {
        map.removeLayer(layer)
      }
    })

    // Draw route
    const coordinates: [number, number][] = route.map((point) => [point.lat, point.lng])
    
    const polyline = L.polyline(coordinates, {
      color: '#3b82f6',
      weight: 4,
      opacity: 0.8,
    }).addTo(map)

    // Add markers
    if (showMarkers) {
      // Start marker
      const startIcon = L.divIcon({
        html: '<div style="background-color: #22c55e; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>',
        className: '',
        iconSize: [20, 20],
      })

      L.marker([route[0].lat, route[0].lng], { icon: startIcon })
        .addTo(map)
        .bindPopup('Start')

      // End marker
      const endIcon = L.divIcon({
        html: '<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>',
        className: '',
        iconSize: [20, 20],
      })

      L.marker([route[route.length - 1].lat, route[route.length - 1].lng], {
        icon: endIcon,
      })
        .addTo(map)
        .bindPopup('Finish')
    }

    // Fit bounds to route
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [route, showMarkers])

  if (route.length === 0) {
    return (
      <div
        className="bg-gray-100 rounded-lg flex items-center justify-center text-gray-500"
        style={{ height }}
      >
        No route data available
      </div>
    )
  }

  return <div ref={mapContainerRef} style={{ height, width: '100%' }} className="rounded-lg" />
}