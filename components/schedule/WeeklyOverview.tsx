// components/schedule/WeeklyOverview.tsx
'use client'

import { ScheduledRun } from '@/types/database'
import { startOfWeek, addDays, format, isSameDay } from 'date-fns'
import { CheckCircle, Circle } from 'lucide-react'

interface WeeklyOverviewProps {
  scheduledRuns: ScheduledRun[]
  currentWeek: number
}

export function WeeklyOverview({ scheduledRuns, currentWeek }: WeeklyOverviewProps) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const weekRuns = scheduledRuns.filter((run) => run.week_number === currentWeek)
  const totalWeekDistance = weekRuns.reduce(
    (sum, run) => sum + (run.target_distance || 0),
    0
  )
  const completedRuns = weekRuns.filter((run) => run.completed).length

  const getRunForDay = (day: Date) => {
    return weekRuns.find((run) =>
      isSameDay(new Date(run.scheduled_date), day)
    )
  }

  const getRunTypeIcon = (runType: string) => {
    const icons = {
      EASY: '🟢',
      TEMPO: '🟠',
      INTERVAL: '🔴',
      LONG: '🔵',
      RECOVERY: '🟣',
      REST: '⚪',
    }
    return icons[runType as keyof typeof icons] || '🔵'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Week {currentWeek} Overview
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {totalWeekDistance.toFixed(1)} km
          </div>
          <div className="text-sm text-gray-500">
            {completedRuns}/{weekRuns.length} completed
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round((completedRuns / (weekRuns.length || 1)) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{
              width: `${(completedRuns / (weekRuns.length || 1)) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const run = getRunForDay(day)
          const isToday = isSameDay(day, new Date())

          return (
            <div
              key={day.toISOString()}
              className={`
                text-center p-3 rounded-lg border
                ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                ${!run && 'opacity-50'}
              `}
            >
              <div className={`text-xs font-medium mb-2 ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                {format(day, 'EEE')}
              </div>
              <div className="text-sm font-semibold text-gray-900 mb-2">
                {format(day, 'd')}
              </div>

              {run ? (
                <div className="space-y-1">
                  <div className="text-lg">
                    {getRunTypeIcon(run.run_type)}
                  </div>
                  {run.target_distance && (
                    <div className="text-xs font-medium text-gray-700">
                      {run.target_distance} km
                    </div>
                  )}
                  <div>
                    {run.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400 mx-auto" />
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-xs">Rest</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}