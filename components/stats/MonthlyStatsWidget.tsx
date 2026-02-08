// components/stats/MonthlyStatsWidget.tsx
'use client'

import { useRef } from 'react'
import html2canvas from 'html2canvas'
import { Download, Share2, Trophy, TrendingUp, Calendar, Clock } from 'lucide-react'
import { formatDistance, formatDuration, formatPace } from '@/lib/utils'

interface MonthlyStats {
  distance: number
  runs: number
  avgPace: number
  longestRun: number
  totalDuration: number // seconds
  totalCalories: number
  elevationGain: number
}

interface MonthlyStatsWidgetProps {
  data: MonthlyStats
  month: string // e.g., "January 2025"
  userName?: string
}

export function MonthlyStatsWidget({ 
  data, 
  month, 
  userName = 'Runner' 
}: MonthlyStatsWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    if (!widgetRef.current) return

    try {
      const canvas = await html2canvas(widgetRef.current, {
        backgroundColor: null,
        scale: 2,
      })

      const link = document.createElement('a')
      link.download = `runtrack-${month.toLowerCase().replace(' ', '-')}.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error('Error generating image:', error)
      alert('Failed to generate image')
    }
  }

  const handleShare = async () => {
    if (!widgetRef.current) return

    try {
      const canvas = await html2canvas(widgetRef.current, {
        backgroundColor: null,
        scale: 2,
      })

      canvas.toBlob(async (blob) => {
        if (!blob) return

        const file = new File([blob], `runtrack-${month}.png`, { type: 'image/png' })

        if (navigator.share) {
          await navigator.share({
            files: [file],
            title: `My ${month} Running Stats`,
            text: `Check out my running stats for ${month}! 🏃`,
          })
        } else {
          handleDownload()
        }
      })
    } catch (error) {
      console.error('Error sharing:', error)
      alert('Sharing not supported, downloading instead')
      handleDownload()
    }
  }

  const totalHours = data.totalDuration / 3600

  return (
    <div className="space-y-4">
      {/* Widget Preview */}
      <div
        ref={widgetRef}
        className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl p-8 shadow-2xl"
        style={{ width: '800px', minHeight: '600px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-sm opacity-80 mb-1">RunTrack Monthly Summary</div>
            <div className="text-3xl font-bold">{month}</div>
            <div className="text-lg opacity-90 mt-1">{userName}</div>
          </div>
          <div className="text-6xl">🏃‍♂️</div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Total Distance */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="text-sm opacity-80">Total Distance</div>
            </div>
            <div className="text-5xl font-bold mb-2">{formatDistance(data.distance)}</div>
            <div className="text-sm opacity-90">{data.runs} runs completed</div>
          </div>

          {/* Time on Feet */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-sm opacity-80">Time on Feet</div>
            </div>
            <div className="text-5xl font-bold mb-2">{totalHours.toFixed(1)}h</div>
            <div className="text-sm opacity-90">{formatDuration(data.totalDuration)}</div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-lg p-4">
            <div className="text-xs opacity-80 mb-1">Avg Pace</div>
            <div className="text-2xl font-bold">{formatPace(data.avgPace)}</div>
            <div className="text-xs opacity-70">/km</div>
          </div>

          <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-lg p-4">
            <div className="text-xs opacity-80 mb-1">Longest Run</div>
            <div className="text-2xl font-bold">{formatDistance(data.longestRun)}</div>
            <div className="text-xs opacity-70">single run</div>
          </div>

          <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-lg p-4">
            <div className="text-xs opacity-80 mb-1">Calories</div>
            <div className="text-2xl font-bold">{(data.totalCalories / 1000).toFixed(1)}k</div>
            <div className="text-xs opacity-70">burned</div>
          </div>

          {data.elevationGain > 0 && (
            <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-lg p-4">
              <div className="text-xs opacity-80 mb-1">Elevation</div>
              <div className="text-2xl font-bold">{Math.round(data.elevationGain)}</div>
              <div className="text-xs opacity-70">meters</div>
            </div>
          )}
        </div>

        {/* Achievement Banner */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {data.distance > 100 
              ? '🏆 Century Club!' 
              : data.distance > 50 
              ? '⭐ Strong Month!' 
              : '💪 Keep Going!'}
          </div>
          <div className="text-sm text-gray-800">
            {data.distance > 100 
              ? `You crushed ${data.distance.toFixed(0)}km this month!`
              : data.distance > 50
              ? `${data.distance.toFixed(0)}km and counting!`
              : `${data.distance.toFixed(0)}km - building momentum!`}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs opacity-60">
          runtrack.app • {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Download Image
        </button>
        <button
          onClick={handleShare}
          className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          Share on Social
        </button>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <strong>💡 Pro tip:</strong> Share this on Instagram, Facebook, or Twitter to inspire your friends and track your progress!
      </div>
    </div>
  )
}