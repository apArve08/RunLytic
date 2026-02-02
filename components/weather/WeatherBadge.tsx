// components/weather/WeatherBadge.tsx
'use client'

import { Cloud, Wind, Droplet } from 'lucide-react'
import { WeatherData } from '@/types/database'
import { getWeatherEmoji } from '@/lib/weather'

interface WeatherBadgeProps {
  weather: WeatherData
  compact?: boolean
}

export function WeatherBadge({ weather, compact = false }: WeatherBadgeProps) {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-sm">
        <span>{getWeatherEmoji(weather.conditions)}</span>
        <span className="font-medium text-blue-700">{weather.temp}°C</span>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-4xl">{getWeatherEmoji(weather.conditions)}</div>
        <div>
          <div className="text-3xl font-bold text-blue-700">{weather.temp}°C</div>
          <div className="text-sm text-gray-600">{weather.conditions}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="flex items-center gap-1 text-gray-600">
          <Cloud className="w-4 h-4" />
          <span>Feels {weather.feels_like}°C</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <Droplet className="w-4 h-4" />
          <span>{weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <Wind className="w-4 h-4" />
          <span>{weather.wind_speed} km/h</span>
        </div>
      </div>
    </div>
  )
}