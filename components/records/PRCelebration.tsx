// components/records/PRCelebration.tsx
'use client'

import { useEffect, useState } from 'react'
import { Trophy, X, TrendingUp } from 'lucide-react'
import { formatDuration, formatPace } from '@/lib/utils'
import confetti from 'canvas-confetti'

interface PR {
  type: string
  value: number
  previous: number | null
}

interface PRCelebrationProps {
  prs: PR[]
  onClose: () => void
}

export function PRCelebration({ prs, onClose }: PRCelebrationProps) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    if (prs.length > 0) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [prs])

  if (!show || prs.length === 0) return null

  const handleClose = () => {
    setShow(false)
    onClose()
  }

  const formatValue = (type: string, value: number) => {
    if (type === 'FASTEST_PACE') {
      return formatPace(value) + ' /km'
    } else if (type === 'LONGEST') {
      return value.toFixed(2) + ' km'
    } else {
      return formatDuration(value)
    }
  }

  const getRecordLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      '5K': 'Fastest 5K',
      '10K': 'Fastest 10K',
      'HALF': 'Fastest Half Marathon',
      'FULL': 'Fastest Marathon',
      'LONGEST': 'Longest Run',
      'FASTEST_PACE': 'Fastest Pace',
    }
    return labels[type] || type
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            New Personal Record{prs.length > 1 ? 's' : ''}! 🎉
          </h2>
          <p className="text-gray-600">
            You just crushed {prs.length} PR{prs.length > 1 ? 's' : ''}!
          </p>
        </div>

        <div className="space-y-4">
          {prs.map((pr, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">
                  {getRecordLabel(pr.type)}
                </span>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-blue-600">
                  {formatValue(pr.type, pr.value)}
                </span>
                {pr.previous && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatValue(pr.type, pr.previous)}
                  </span>
                )}
              </div>
              {pr.previous && (
                <div className="text-sm text-green-600 font-medium mt-1">
                  {pr.type === 'LONGEST'
                    ? `+${(pr.value - pr.previous).toFixed(2)} km further!`
                    : `${((pr.previous - pr.value) / pr.previous * 100).toFixed(1)}% faster!`}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleClose}
          className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition"
        >
          Awesome! 🚀
        </button>
      </div>
    </div>
  )
}