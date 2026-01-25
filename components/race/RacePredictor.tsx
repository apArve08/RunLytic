// components/race/RacePredictor.tsx
'use client'

import { useEffect, useState } from 'react'
import { Trophy, TrendingUp, AlertCircle, Award } from 'lucide-react'
import { formatDuration, formatPace } from '@/lib/utils'

interface Prediction {
  distance: string
  predictedTime: number
  predictedPace: number
  confidence: 'low' | 'medium' | 'high'
  basedOn: string
}

export function RacePredictor() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [dataQuality, setDataQuality] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPredictions()
  }, [])

  const fetchPredictions = async () => {
    try {
      const response = await fetch('/api/race-predictor')
      const data = await response.json()

      if (response.ok) {
        setPredictions(data.predictions)
        setDataQuality(data.dataQuality)
      } else {
        setError(data.error || 'Failed to load predictions')
      }
    } catch (err) {
      setError('Failed to load predictions')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getConfidenceBadge = (confidence: string) => {
    const badges = {
      high: 'bg-green-100 text-green-700 border-green-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-red-100 text-red-700 border-red-200',
    }
    return badges[confidence as keyof typeof badges]
  }

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return '🎯'
      case 'medium':
        return '📊'
      case 'low':
        return '⚠️'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-900 mb-1">
              Unable to Generate Predictions
            </h3>
            <p className="text-sm text-yellow-700">{error}</p>
            <p className="text-sm text-yellow-600 mt-2">
              Keep logging runs to get accurate race time predictions!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Race Time Predictions</h3>
      </div>

      {/* Data Quality Info */}
      {dataQuality && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm">
          <p className="text-blue-800">
            Based on <strong>{dataQuality.totalRuns}</strong> runs (last 3 months) • 
            Avg pace: <strong>{formatPace(dataQuality.avgPace)}</strong> • 
            Avg distance: <strong>{dataQuality.avgDistance} km</strong>
          </p>
        </div>
      )}

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {predictions.map((pred) => (
          <div
            key={pred.distance}
            className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-2xl font-bold text-gray-900">{pred.distance}</h4>
                <p className="text-xs text-gray-500">{pred.basedOn}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getConfidenceBadge(pred.confidence)}`}>
                {getConfidenceIcon(pred.confidence)}
                {pred.confidence}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-600">
                  {formatDuration(pred.predictedTime)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="w-4 h-4" />
                <span>{formatPace(pred.predictedPace)} /km pace</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-4 bg-gray-50 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Award className="w-4 h-4 text-gray-600 mt-0.5" />
          <div className="text-sm text-gray-600">
            <strong>Tip:</strong> These are estimates based on your training. 
            Race day factors (weather, course, taper) will affect your actual time.
            {dataQuality && dataQuality.totalRuns < 10 && (
              <span className="block mt-1 text-yellow-700">
                ⚠️ Log more runs for more accurate predictions!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}