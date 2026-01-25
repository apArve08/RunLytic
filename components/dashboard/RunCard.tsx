// components/dashboard/RunCard.tsx (UPDATED)
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Run } from '@/types/database'
import { formatPace, formatDuration, formatDistance } from '@/lib/utils'
import { Calendar, Clock, TrendingUp, Footprints, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

interface RunCardProps {
  run: Run
}

export function RunCard({ run }: RunCardProps) {
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent link navigation
    setIsAnalyzing(true)

    try {
      const pace = run.duration / 60 / run.distance

      await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runId: run.id,
          distance: run.distance,
          duration: run.duration,
          pace,
          notes: run.notes,
        }),
      })

      router.refresh()
    } catch (error) {
      console.error('Error analyzing run:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Link
      href={`/runs/${run.id}`}
      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition border border-gray-200 p-5"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(run.date), 'EEEE, MMM d, yyyy')}
          </p>
          {run.shoes && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Footprints className="w-3 h-3" />
              {run.shoes.nickname || `${run.shoes.brand} ${run.shoes.model}`}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            {formatDistance(run.distance)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{formatDuration(run.duration)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{formatPace(run.pace)} /km</span>
        </div>
      </div>

      {run.notes && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{run.notes}</p>
      )}

      {run.ai_analysis ? (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-xs text-blue-600 font-medium mb-1">AI Analysis</p>
          <p className="text-sm text-blue-800 line-clamp-2">{run.ai_analysis}</p>
        </div>
      ) : (
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full mt-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 py-2 px-4 rounded-lg text-sm font-medium hover:from-blue-100 hover:to-indigo-100 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Get AI Analysis
            </>
          )}
        </button>
      )}
    </Link>
  )
}