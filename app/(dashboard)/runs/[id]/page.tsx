// app/(dashboard)/runs/[id]/page.tsx (UPDATED)
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Calendar, Clock, TrendingUp, Footprints, Sparkles, Trash2, RefreshCw, Mountain, Heart, Zap, Map, Activity } from 'lucide-react'
import { formatPace, formatDuration, formatDistance } from '@/lib/utils'
import { format } from 'date-fns'
import { Run } from '@/types/database'
import { RouteMap } from '@/components/maps/RouteMap'
import { ElevationProfile } from '@/components/maps/ElevationProfile'

export default function RunDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [run, setRun] = useState<Run | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRun()
  }, [params.id])

  const fetchRun = async () => {
    try {
      const response = await fetch(`/api/runs?limit=1000`)
      const data = await response.json()
      const foundRun = data.runs.find((r: Run) => r.id === params.id)
      setRun(foundRun || null)
    } catch (error) {
      console.error('Error fetching run:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!run) return
    setIsAnalyzing(true)

    try {
      const pace = run.duration / 60 / run.distance

      const response = await fetch('/api/ai-analyze', {
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

      const data = await response.json()
      
      if (data.analysis) {
        setRun({ ...run, ai_analysis: data.analysis })
      }
    } catch (error) {
      console.error('Error analyzing run:', error)
      alert('Failed to analyze run. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this run?')) return
    setIsDeleting(true)

    try {
      await fetch(`/api/runs?id=${params.id}`, { method: 'DELETE' })
      router.push('/runs')
      router.refresh()
    } catch (error) {
      console.error('Error deleting run:', error)
      alert('Failed to delete run')
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-500 mt-4">Loading run...</p>
      </div>
    )
  }

  if (!run) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-gray-500">Run not found</p>
        <Link href="/runs" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
          ← Back to runs
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        href="/runs"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to runs
      </Link>

      {/* Header & Primary Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {formatDistance(run.distance)}
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(new Date(run.date), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Duration</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatDuration(run.duration)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Pace</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatPace(run.pace)}
              <span className="text-sm text-gray-600 ml-1">/km</span>
            </p>
          </div>

          {run.shoes && (
            <div className="bg-gray-50 rounded-lg p-4 col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Footprints className="w-4 h-4" />
                <span className="text-sm font-medium">Shoes</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {run.shoes.nickname || `${run.shoes.brand} ${run.shoes.model}`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Stats */}
      {(run.avg_heart_rate || run.elevation_gain || run.avg_speed) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {run.avg_heart_rate && (
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm font-medium">Avg Heart Rate</span>
                </div>
                <p className="text-2xl font-bold text-red-700">{run.avg_heart_rate}</p>
                <p className="text-xs text-red-600 mt-1">bpm</p>
              </div>
            )}

            {run.max_heart_rate && (
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <Heart className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">Max Heart Rate</span>
                </div>
                <p className="text-2xl font-bold text-red-700">{run.max_heart_rate}</p>
                <p className="text-xs text-red-600 mt-1">bpm</p>
              </div>
            )}

            {run.avg_speed && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">Avg Speed</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">{run.avg_speed}</p>
                <p className="text-xs text-blue-600 mt-1">km/h</p>
              </div>
            )}

            {run.elevation_gain && (
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <Mountain className="w-4 h-4" />
                  <span className="text-sm font-medium">Elevation Gain</span>
                </div>
                <p className="text-2xl font-bold text-green-700">{run.elevation_gain}</p>
                <p className="text-xs text-green-600 mt-1">meters</p>
              </div>
            )}

            {run.elevation_loss && (
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-orange-600 mb-2">
                  <Mountain className="w-4 h-4 rotate-180" />
                  <span className="text-sm font-medium">Elevation Loss</span>
                </div>
                <p className="text-2xl font-bold text-orange-700">{run.elevation_loss}</p>
                <p className="text-xs text-orange-600 mt-1">meters</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {run.notes && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Notes</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{run.notes}</p>
        </div>
      )}

      {/* AI Analysis */}
      {run.ai_analysis ? (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">AI Analysis</h2>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              Re-analyze
            </button>
          </div>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {run.ai_analysis}
          </p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8 text-center">
          <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Get AI-Powered Insights
          </h3>
          <p className="text-gray-600 mb-6">
            Let AI analyze your performance and provide personalized feedback
          </p>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze This Run
              </>
            )}
          </button>
        </div>
      )}


    {/* Route & Elevation Section */}
    {run.route_data && run.route_data.length > 0 && (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Route & Terrain</h2>
          </div>
          {run.notes?.includes('Imported from Strava') && (
            <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
              <Activity className="w-4 h-4" />
              Strava Activity
            </div>
          )}
        </div>
        
        {/* Main Map */}
        <div className="mb-6">
          <RouteMap route={run.route_data} height="500px" showMarkers={true} />
        </div>

        {/* Elevation Profile Insertion */}
        {run.route_data.some(p => p.elevation) && (
          <div className="mb-6 border-t pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Mountain className="w-4 h-4 text-green-600" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Elevation Profile</h3>
            </div>
            <ElevationProfile route={run.route_data} />
          </div>
        )}
        
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-gray-600 mb-1">GPS Points</div>
            <div className="font-semibold text-gray-900">{run.route_data.length}</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-gray-600 mb-1">Start</div>
            <div className="font-mono text-xs text-gray-900">
              {run.route_data[0].lat.toFixed(4)}, {run.route_data[0].lng.toFixed(4)}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-gray-600 mb-1">Finish</div>
            <div className="font-mono text-xs text-gray-900">
              {run.route_data[run.route_data.length - 1].lat.toFixed(4)},{' '}
              {run.route_data[run.route_data.length - 1].lng.toFixed(4)}
            </div>
          </div>
          
          {run.elevation_gain && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-600 mb-1">Total Climb</div>
              <div className="font-semibold text-gray-900">{run.elevation_gain}m</div>
            </div>
          )}
        </div>
      </div>
      
    )}
   
    </div>
    
  )
}