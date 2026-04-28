'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPin, RefreshCw, X, Check, Wind, Droplets, Thermometer, Navigation } from 'lucide-react'
import { getWeatherEmoji } from '@/lib/weather'

interface WeatherData {
  temp: number
  feels_like: number
  conditions: string
  humidity: number
  wind_speed: number
  icon: string
}

type RunVerdict = 'great' | 'good' | 'fair' | 'avoid'

const STORAGE_KEY = 'runtrack_weather_location'

// ─── Running suitability logic ──────────────────────────────────────────────

function getRunVerdict(w: WeatherData): {
  verdict: RunVerdict
  label: string
  reason: string
  color: string
  bg: string
} {
  const badConditions = ['Thunderstorm', 'Tornado', 'Hurricane']
  const poorConditions = ['Rain', 'Snow', 'Sleet']
  const okConditions   = ['Drizzle', 'Mist', 'Fog', 'Haze']

  if (badConditions.includes(w.conditions) || w.wind_speed > 60) {
    return { verdict: 'avoid', label: 'Avoid', reason: `${w.conditions} — unsafe conditions`, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' }
  }

  const score = [
    w.temp >= 5  && w.temp <= 25   ? 2 : w.temp > 25 && w.temp <= 30 ? 1 : w.temp > 0 && w.temp < 5 ? 1 : 0,
    w.humidity < 75                 ? 2 : w.humidity < 85 ? 1 : 0,
    w.wind_speed < 25               ? 2 : w.wind_speed < 40 ? 1 : 0,
    poorConditions.includes(w.conditions) ? 0 : okConditions.includes(w.conditions) ? 1 : 2,
  ].reduce((a, b) => a + b, 0)

  if (score >= 7) return { verdict: 'great', label: 'Great day to run!',  reason: 'Perfect running conditions',  color: 'text-green-700 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' }
  if (score >= 5) return { verdict: 'good',  label: 'Good to run',        reason: 'Decent conditions',            color: 'text-blue-700 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' }
  if (score >= 3) return { verdict: 'fair',  label: 'Fair — dress right', reason: reasonFor(w),                  color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' }
  return             { verdict: 'avoid', label: 'Skip today',             reason: reasonFor(w),                  color: 'text-red-600 dark:text-red-400',       bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' }
}

function reasonFor(w: WeatherData): string {
  if (w.temp > 30)   return 'Very hot — risk of heat exhaustion'
  if (w.temp < 0)    return 'Below freezing — icy conditions likely'
  if (w.humidity > 85) return 'High humidity — feels much hotter'
  if (w.wind_speed > 40) return 'Strong winds — tough going'
  if (['Rain', 'Snow'].includes(w.conditions)) return `${w.conditions} — wear waterproofs`
  return 'Challenging conditions'
}

// ─── Component ───────────────────────────────────────────────────────────────

export function RunningWeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [locationLabel, setLocationLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [inputCity, setInputCity] = useState('')

  // Load saved location on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const { city } = JSON.parse(saved)
      fetchByCity(city, false)
    } else {
      detectLocation()
    }
  }, [])

  const fetchByCity = useCallback(async (city: string, save = true) => {
    if (!city.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city.trim())}`)
      const data = await res.json()
      if (res.ok) {
        setWeather(data.weather)
        setLocationLabel(city.trim())
        if (save) localStorage.setItem(STORAGE_KEY, JSON.stringify({ city: city.trim() }))
      } else {
        setError('City not found. Try a different name.')
      }
    } catch {
      setError('Could not fetch weather.')
    } finally {
      setLoading(false)
    }
  }, [])

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported. Enter a city below.')
      setEditing(true)
      return
    }
    setLoading(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        try {
          const res = await fetch(`/api/weather?lat=${lat}&lng=${lng}`)
          const data = await res.json()
          if (res.ok) {
            setWeather(data.weather)
            setLocationLabel('Current location')
            // Don't save GPS to localStorage — re-detect next time
          } else {
            setError('Could not fetch weather for your location.')
          }
        } catch {
          setError('Could not fetch weather.')
        } finally {
          setLoading(false)
        }
      },
      () => {
        setLoading(false)
        setError('Location access denied. Enter a city below.')
        setEditing(true)
      }
    )
  }, [])

  const handleSaveCity = () => {
    if (!inputCity.trim()) return
    fetchByCity(inputCity)
    setEditing(false)
    setInputCity('')
  }

  const handleClearDefault = () => {
    localStorage.removeItem(STORAGE_KEY)
    setWeather(null)
    setLocationLabel('')
    setEditing(true)
  }

  const verdict = weather ? getRunVerdict(weather) : null

  // ── Skeleton while loading ──
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="space-y-2">
            <div className="w-20 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    )
  }

  // ── Location edit / first-time ──
  if (editing || (!weather && !loading)) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <MapPin className="w-4 h-4 text-blue-500" />
            Weather for running
          </div>
          {editing && weather && (
            <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-2">
          <input
            type="text"
            value={inputCity}
            onChange={e => setInputCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSaveCity()}
            placeholder="Enter city (e.g. Kuala Lumpur)"
            autoFocus
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSaveCity}
            disabled={!inputCity.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={detectLocation}
          className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          <Navigation className="w-3.5 h-3.5" />
          Use my current location
        </button>
      </div>
    )
  }

  if (!weather || !verdict) return null

  // ── Main weather card ──
  return (
    <div className={`rounded-xl border p-4 space-y-3 ${verdict.bg}`}>
      {/* Top row: location + actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
        >
          <MapPin className="w-3.5 h-3.5" />
          {locationLabel}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => locationLabel === 'Current location' ? detectLocation() : fetchByCity(locationLabel, false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {locationLabel !== 'Current location' && (
            <button
              onClick={handleClearDefault}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
              title="Change location"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main weather row */}
      <div className="flex items-center gap-4">
        <div className="text-4xl leading-none">{getWeatherEmoji(weather.conditions)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{weather.temp}°C</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">feels {weather.feels_like}°C</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{weather.conditions}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <Droplets className="w-3.5 h-3.5" />
          {weather.humidity}%
        </span>
        <span className="flex items-center gap-1">
          <Wind className="w-3.5 h-3.5" />
          {weather.wind_speed} km/h
        </span>
      </div>

      {/* Verdict banner */}
      <div className={`flex items-center justify-between rounded-lg px-3 py-2 bg-white/60 dark:bg-black/20`}>
        <div>
          <p className={`text-sm font-semibold ${verdict.color}`}>{verdict.label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{verdict.reason}</p>
        </div>
        <VerdictDot verdict={verdict.verdict} />
      </div>
    </div>
  )
}

function VerdictDot({ verdict }: { verdict: RunVerdict }) {
  const colors = {
    great: 'bg-green-500',
    good:  'bg-blue-500',
    fair:  'bg-yellow-400',
    avoid: 'bg-red-500',
  }
  return (
    <div className={`w-3 h-3 rounded-full ${colors[verdict]} ring-2 ring-white dark:ring-gray-800 shrink-0`} />
  )
}
