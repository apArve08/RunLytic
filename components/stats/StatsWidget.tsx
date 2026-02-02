// components/stats/StatsWidget.tsx
'use client'

import { useRef } from 'react'
import html2canvas from 'html2canvas'
import { Download, Share2, TrendingUp, TrendingDown } from 'lucide-react'
import { formatDistance, formatDuration, formatPace } from '@/lib/utils'

interface WeeklyComparison {
  thisWeek: {
    distance: number
    runs: number
    avgPace: number
  }
  lastWeek: {
    distance: number
    runs: number
    avgPace: number
  }
}

interface StatsWidgetProps {
  data: WeeklyComparison
  userName?: string
}

export function StatsWidget({ data, userName = 'Runner' }: StatsWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    if (!widgetRef.current) return

    try {
      const canvas = await html2canvas(widgetRef.current, {
        backgroundColor: null,
        scale: 2,
      })

      const link = document.createElement('a')
      link.download = `runtrack-stats-${Date.now()}.png`
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

        const file = new File([blob], 'runtrack-stats.png', { type: 'image/png' })

        if (navigator.share) {
          await navigator.share({
            files: [file],
            title: 'My Running Stats',
            text: 'Check out my running stats! 🏃',
          })
        } else {
          // Fallback to download
          handleDownload()
        }
      })
    } catch (error) {
      console.error('Error sharing:', error)
      alert('Sharing not supported, downloading instead')
      handleDownload()
    }
  }

  const distanceChange = ((data.thisWeek.distance - data.lastWeek.distance) / data.lastWeek.distance) * 100
  const paceChange = ((data.lastWeek.avgPace - data.thisWeek.avgPace) / data.lastWeek.avgPace) * 100

  return (
    <div className="space-y-4">
      {/* Widget Preview */}
      <div
        ref={widgetRef}
        className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-8 shadow-2xl"
        style={{ width: '600px', height: '400px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm opacity-80">RunTrack Stats</div>
            <div className="text-2xl font-bold">{userName}</div>
          </div>
          <div className="text-5xl">🏃</div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <div className="text-sm opacity-80 mb-1">This Week</div>
            <div className="text-4xl font-bold mb-2">{formatDistance(data.thisWeek.distance)}</div>
            <div className="text-sm opacity-90">{data.thisWeek.runs} runs</div>
          </div>

          <div>
            <div className="text-sm opacity-80 mb-1">Avg Pace</div>
            <div className="text-4xl font-bold mb-2">{formatPace(data.thisWeek.avgPace)}</div>
            <div className="text-sm opacity-90">per kilometer</div>
          </div>
        </div>

        {/* Comparison */}
        <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
          <div className="text-sm font-medium mb-3">vs. Last Week</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              {distanceChange >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-300" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-300" />
              )}
              <div>
                <div className="text-xs opacity-80">Distance</div>
                <div className={`font-bold ${distanceChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {distanceChange >= 0 ? '+' : ''}{distanceChange.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {paceChange >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-300" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-300" />
              )}
              <div>
                <div className="text-xs opacity-80">Pace</div>
                <div className={`font-bold ${paceChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {paceChange >= 0 ? '+' : ''}{paceChange.toFixed(1)}% faster
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs opacity-60">
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
          Share
        </button>
      </div>
    </div>
  )
}