// app/(dashboard)/monthly/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, Zap, Award } from 'lucide-react'
import { format, startOfMonth, addMonths, subMonths } from 'date-fns'
import { MonthlyCalendar } from '@/components/monthly/MonthlyCalendar'
import { GoalProgress } from '@/components/monthly/GoalProgress'
import { formatPace, formatDuration } from '@/lib/utils'

export default function MonthlyDashboard() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMonthlyStats()
  }, [currentMonth])

  const fetchMonthlyStats = async () => {
    setLoading(true)
    try {
      const monthStr = format(currentMonth, 'yyyy-MM')
      const response = await fetch(`/api/monthly-stats?month=${monthStr}`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching monthly stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const handleToday = () => setCurrentMonth(new Date())

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monthly Dashboard</h1>
          <p className="text-gray-600 mt-1">{format(currentMonth, 'MMMM yyyy')}</p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleToday}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-3xl font-bold text-gray-900">{stats?.totalDistance?.toFixed(1) || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Total km</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-3xl font-bold text-gray-900">{stats?.totalRuns || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Total Runs</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-3xl font-bold text-gray-900">
            {stats?.avgPace ? formatPace(stats.avgPace) : '--:--'}
          </div>
          <div className="text-sm text-gray-500 mt-1">Avg Pace /km</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-3xl font-bold text-gray-900">{stats?.longestRun?.toFixed(1) || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Longest Run km</div>
        </div>
      </div>

      {/* Goal Progress */}
      <GoalProgress
        currentDistance={stats?.totalDistance || 0}
        currentRuns={stats?.totalRuns || 0}
        goal={stats?.goal}
        month={format(startOfMonth(currentMonth), 'yyyy-MM-dd')}
        onGoalUpdate={fetchMonthlyStats}
      />

      {/* Calendar View */}
      <MonthlyCalendar runs={stats?.runs || []} month={currentMonth} />

      {/* Weekly Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Breakdown</h3>
        <div className="space-y-3">
          {stats?.weeklyData?.map((week: any) => (
            <div key={week.weekNumber} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Week {week.weekNumber}</div>
                <div className="text-sm text-gray-500">{week.weekStart} - {week.weekEnd}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{week.distance} km</div>
                <div className="text-sm text-gray-500">{week.runs} runs</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Fastest Pace</h4>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {stats?.fastestPace ? formatPace(stats.fastestPace) : '--:--'} /km
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">Avg Distance</h4>
          </div>
          <div className="text-2xl font-bold text-green-700">
            {stats?.avgDistance?.toFixed(2) || 0} km
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-gray-900">Calories</h4>
          </div>
          <div className="text-2xl font-bold text-purple-700">
            {stats?.totalCalories?.toLocaleString() || 0}
          </div>
        </div>
      </div>
    </div>
  )
}