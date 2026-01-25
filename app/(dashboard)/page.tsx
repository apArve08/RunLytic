// app/(dashboard)/page.tsx (ADD annual stats tab)

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StatsOverview } from '@/components/dashboard/StatsOverview'
import { WeeklyChart } from '@/components/dashboard/WeeklyChart'
import { MonthlyStats } from '@/components/dashboard/MonthlyStats'
import { AnnualStats } from '@/components/annual/AnnualStats'
import { RunCard } from '@/components/dashboard/RunCard'
import { ScheduleWidget } from '@/components/dashboard/ScheduleWidget'
import { RacePredictor } from '@/components/race/RacePredictor'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useEffect } from 'react'

export default function DashboardPage() {
  const [runs, setRuns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('all')

  useEffect(() => {
    fetchRuns()
  }, [])

  const fetchRuns = async () => {
    try {
      const response = await fetch('/api/runs')
      const data = await response.json()
      setRuns(data.runs || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const recentRuns = runs.slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your running progress</p>
        </div>
        <Link
          href="/runs/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Log Run</span>
        </Link>
      </div>

      {/* Time Range Selector */}
      <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
        {(['week', 'month', 'year', 'all'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
              timeRange === range
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {range === 'all' ? 'All Time' : range}
          </button>
        ))}
      </div>

      {/* Conditional Stats Display */}
      {timeRange === 'year' ? (
        <AnnualStats />
      ) : (
        <>
          {/* Stats Overview */}
          <StatsOverview runs={runs} />

          {/* Race Predictor */}
          <RacePredictor />

          {/* Schedule Widget */}
          <ScheduleWidget />

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeeklyChart runs={runs} />
            <MonthlyStats runs={runs} />
          </div>

          {/* Recent Runs */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Runs</h2>
              <Link
                href="/runs"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all →
              </Link>
            </div>

            {recentRuns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentRuns.map((run) => (
                  <RunCard key={run.id} run={run} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-500 mb-4">No runs logged yet</p>
                <Link
                  href="/runs/new"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  <Plus className="w-5 h-5" />
                  Log Your First Run
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}