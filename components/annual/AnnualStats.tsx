// components/annual/AnnualStats.tsx
'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Trophy, Zap, TrendingUp, Award, Calendar, Flame } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { formatPace, formatDuration } from '@/lib/utils'

export function AnnualStats() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [stats, setStats] = useState<any>(null)
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnnualStats()
  }, [year])

  const fetchAnnualStats = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/annual-stats?year=${year}`)
      const data = await response.json()
      setStats(data.stats)
      setMonthlyData(data.monthlyData)
    } catch (error) {
      console.error('Error fetching annual stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrevYear = () => setYear(year - 1)
  const handleNextYear = () => setYear(year + 1)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Year Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{year} Year in Review</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevYear}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-4 py-2 font-medium text-gray-700">{year}</span>
          <button
            onClick={handleNextYear}
            disabled={year >= new Date().getFullYear()}
            className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Total Distance</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">{stats.totalDistance}</div>
          <div className="text-xs text-gray-600 mt-1">kilometers</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Total Runs</span>
          </div>
          <div className="text-3xl font-bold text-green-600">{stats.totalRuns}</div>
          <div className="text-xs text-gray-600 mt-1">activities</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Total Time</span>
          </div>
          <div className="text-3xl font-bold text-purple-600">{stats.totalHours}h</div>
          <div className="text-xs text-gray-600 mt-1">running time</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">Calories</span>
          </div>
          <div className="text-3xl font-bold text-orange-600">
            {(stats.totalCalories / 1000).toFixed(1)}k
          </div>
          <div className="text-xs text-gray-600 mt-1">burned</div>
        </div>
      </div>

      {/* Achievement Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Longest Run</div>
          <div className="text-2xl font-bold text-gray-900">{stats.longestRun} km</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Fastest Pace</div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.fastestPace ? formatPace(stats.fastestPace) : '--:--'}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Longest Streak</div>
          <div className="text-2xl font-bold text-gray-900">{stats.maxStreak} days</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Favorite Day</div>
          <div className="text-xl font-bold text-gray-900">{stats.mostActiveDay}</div>
        </div>
      </div>

      {/* Monthly Distance Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Distance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" style={{ fontSize: '12px' }} />
            <YAxis style={{ fontSize: '12px' }} label={{ value: 'km', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="distance" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Pace Trend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Pace Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" style={{ fontSize: '12px' }} />
            <YAxis style={{ fontSize: '12px' }} label={{ value: 'min/km', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line type="monotone" dataKey="avgPace" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Fun Facts */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-600" />
          {year} Achievements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🏃</div>
            <div>
              <div className="font-semibold text-gray-900">
                You ran {stats.totalDistance} km this year!
              </div>
              <div className="text-sm text-gray-600">
                That's like running from Kuala Lumpur to{' '}
                {stats.totalDistance > 400 ? 'Penang' : 'Ipoh'}!
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-2xl">⏱️</div>
            <div>
              <div className="font-semibold text-gray-900">
                {stats.totalHours} hours of running
              </div>
              <div className="text-sm text-gray-600">
                That's {Math.floor(stats.totalHours / 24)} full days on your feet!
              </div>
            </div>
          </div>

          {stats.totalElevationGain > 0 && (
            <div className="flex items-start gap-3">
              <div className="text-2xl">⛰️</div>
              <div>
                <div className="font-semibold text-gray-900">
                  {stats.totalElevationGain}m elevation climbed
                </div>
                <div className="text-sm text-gray-600">
                  {stats.totalElevationGain > 8848
                    ? 'You climbed higher than Mount Everest!'
                    : `${Math.floor(stats.totalElevationGain / 100)} football fields of stairs!`}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <div className="text-2xl">🔥</div>
            <div>
              <div className="font-semibold text-gray-900">
                Best streak: {stats.maxStreak} days
              </div>
              <div className="text-sm text-gray-600">
                You're crushing it! Keep the momentum going.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}