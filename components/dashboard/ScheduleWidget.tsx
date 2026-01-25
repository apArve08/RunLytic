// components/dashboard/ScheduleWidget.tsx
'use client'

import { useEffect, useState } from 'react'
import { ScheduledRun } from '@/types/database'
import { Calendar, ArrowRight } from 'lucide-react'
import { format, isSameDay } from 'date-fns'
import Link from 'next/link'

export function ScheduleWidget() {
  const [todaysRuns, setTodaysRuns] = useState<ScheduledRun[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTodaysRuns()
  }, [])

  const fetchTodaysRuns = async () => {
    try {
      const response = await fetch('/api/scheduled-runs?upcoming=true')
      const data = await response.json()
      
      const today = new Date()
      const todayFiltered = data.scheduled_runs?.filter((run: ScheduledRun) =>
        isSameDay(new Date(run.scheduled_date), today)
      ) || []
      
      setTodaysRuns(todayFiltered)
    } catch (error) {
      console.error('Error fetching todays runs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return null
  if (todaysRuns.length === 0) return null

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Today's Workout</h3>
        </div>
        <Link
          href="/schedule"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          View Schedule
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {todaysRuns.map((run) => (
          <div key={run.id} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">{run.run_type}</span>
              {run.target_distance && (
                <span className="text-blue-600 font-medium">
                  {run.target_distance} km
                </span>
              )}
            </div>
            {run.notes && (
              <p className="text-sm text-gray-600">{run.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}