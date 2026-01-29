// components/forms/RunForm.tsx (ADD new fields)
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Footprints, Save, StickyNote, Heart, TrendingUp, Mountain, MapPin } from 'lucide-react'
import { Shoe } from '@/types/database'
import { GPSTracker } from '../gps/GPSTracker'
import { RoutePoint } from '@/types/database'

interface RunFormProps {
  shoes: Shoe[]
}

export function RunForm({ shoes }: RunFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  // Add to state
  const [routeData, setRouteData] = useState<RoutePoint[]>([])
  const [showGPS, setShowGPS] = useState(false)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    distance: '',
    duration: '', // in minutes
    shoes_id: '',
    notes: '',
    // Advanced fields
    avg_heart_rate: '',
    max_heart_rate: '',
    elevation_gain: '',
    elevation_loss: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const distance = parseFloat(formData.distance)
      const durationMinutes = parseFloat(formData.duration)
      const durationSeconds = durationMinutes * 60
      const avgSpeed = (distance / (durationSeconds / 3600)).toFixed(2) // km/h

      const response = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          distance,
          duration: durationSeconds,
          shoes_id: formData.shoes_id || null,
          notes: formData.notes,
          avg_heart_rate: formData.avg_heart_rate ? parseInt(formData.avg_heart_rate) : null,
          max_heart_rate: formData.max_heart_rate ? parseInt(formData.max_heart_rate) : null,
          elevation_gain: formData.elevation_gain ? parseFloat(formData.elevation_gain) : null,
          elevation_loss: formData.elevation_loss ? parseFloat(formData.elevation_loss) : null,
          avg_speed: parseFloat(avgSpeed),
          route_data: routeData.length > 0 ? routeData : null,

        }),
      })

      if (!response.ok) throw new Error('Failed to create run')

      const { run } = await response.json()
      router.push(`/runs/${run.id}`)
      router.refresh()
    } catch (err) {
      setError('Failed to save run. Please try again.')
      console.error('Error saving run:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Date */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4" />
          Date
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      {/* Distance & Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Footprints className="w-4 h-4" />
            Distance (km)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.distance}
            onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="5.00"
            required
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4" />
            Duration (minutes)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="30"
            required
          />
        </div>
      </div>

      {/* Pace Preview */}
      {formData.distance && formData.duration && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Pace:</strong>{' '}
              {((parseFloat(formData.duration) / parseFloat(formData.distance)) | 0)}:
              {String(
                Math.round(
                  ((parseFloat(formData.duration) / parseFloat(formData.distance)) % 1) * 60
                )
              ).padStart(2, '0')}{' '}
              min/km
            </div>
            <div>
              <strong>Avg Speed:</strong>{' '}
              {((parseFloat(formData.distance) / (parseFloat(formData.duration) / 60)).toFixed(2))} km/h
            </div>
          </div>
        </div>
      )}

      {/* Shoes */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Footprints className="w-4 h-4" />
          Shoes (optional)
        </label>
        <select
          value={formData.shoes_id}
          onChange={(e) => setFormData({ ...formData, shoes_id: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">No shoes tracked</option>
          {shoes
            .filter((shoe) => !shoe.retired)
            .map((shoe) => (
              <option key={shoe.id} value={shoe.id}>
                {shoe.nickname || `${shoe.brand} ${shoe.model}`} (
                {shoe.total_distance.toFixed(0)}km)
              </option>
            ))}
        </select>
      </div>

      {/* Advanced Fields Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          {showAdvanced ? 'Hide' : 'Show'} Advanced Data (Heart Rate, Elevation)
        </button>
      </div>

      {/* Advanced Fields */}
      {showAdvanced && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900 mb-3">Advanced Metrics</h4>

          {/* Heart Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Heart className="w-4 h-4" />
                Avg Heart Rate (bpm)
              </label>
              <input
                type="number"
                value={formData.avg_heart_rate}
                onChange={(e) => setFormData({ ...formData, avg_heart_rate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="140"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Heart className="w-4 h-4 text-red-500" />
                Max Heart Rate (bpm)
              </label>
              <input
                type="number"
                value={formData.max_heart_rate}
                onChange={(e) => setFormData({ ...formData, max_heart_rate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="175"
              />
            </div>
          </div>

          {/* Elevation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mountain className="w-4 h-4 text-green-600" />
                Elevation Gain (m)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.elevation_gain}
                onChange={(e) => setFormData({ ...formData, elevation_gain: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="50"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mountain className="w-4 h-4 text-red-600 rotate-180" />
                Elevation Loss (m)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.elevation_loss}
                onChange={(e) => setFormData({ ...formData, elevation_loss: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="45"
              />
            </div>
          </div>
        </div>
      )}
      {/* GPS Tracking */}
      <div>
        <button
          type="button"
          onClick={() => setShowGPS(!showGPS)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          {showGPS ? 'Hide' : 'Track'} GPS Route
        </button>
      </div>

      {showGPS && (
        <GPSTracker onRouteUpdate={setRouteData} />
      )}
      {/* Notes */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <StickyNote className="w-4 h-4" />
          Notes (optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="How did the run feel? Weather conditions? Any pain or discomfort?"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Save Run
          </>
        )}
      </button>
    </form>
  )
}