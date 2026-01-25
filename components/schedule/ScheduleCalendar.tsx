// components/schedule/ScheduleCalendar.tsx
'use client'

import { ScheduledRun } from '@/types/database'
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  startOfMonth,
  endOfMonth,
} from 'date-fns'
import { Check, Circle } from 'lucide-react'

interface ScheduleCalendarProps {
  scheduledRuns: ScheduledRun[]
  onRunClick: (run: ScheduledRun) => void
}

export function ScheduleCalendar({
  scheduledRuns,
  onRunClick,
}: ScheduleCalendarProps) {
  const today = new Date()
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const getRunsForDay = (day: Date) => {
    return scheduledRuns.filter((run) =>
      isSameDay(new Date(run.scheduled_date), day)
    )
  }

  const getRunTypeColor = (runType: string) => {
    const colors = {
      EASY: 'bg-green-100 text-green-700 border-green-200',
      TEMPO: 'bg-orange-100 text-orange-700 border-orange-200',
      INTERVAL: 'bg-red-100 text-red-700 border-red-200',
      LONG: 'bg-blue-100 text-blue-700 border-blue-200',
      RECOVERY: 'bg-purple-100 text-purple-700 border-purple-200',
      REST: 'bg-gray-100 text-gray-700 border-gray-200',
    }
    return colors[runType as keyof typeof colors] || colors.EASY
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {format(today, 'MMMM yyyy')}
      </h3>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayRuns = getRunsForDay(day)
          const isCurrentMonth = day.getMonth() === today.getMonth()
          const isToday = isSameDay(day, today)

          return (
            <div
              key={day.toISOString()}
              className={`
                min-h-[100px] p-2 border rounded-lg
                ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${isToday ? 'ring-2 ring-blue-500' : 'border-gray-200'}
              `}
            >
              <div
                className={`
                text-sm font-medium mb-2
                ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                ${isToday ? 'text-blue-600 font-bold' : ''}
              `}
              >
                {format(day, 'd')}
              </div>

              {dayRuns.length > 0 && (
                <div className="space-y-1">
                  {dayRuns.map((run) => (
                    <button
                      key={run.id}
                      onClick={() => onRunClick(run)}
                      className={`
                        w-full text-left px-2 py-1 rounded border text-xs
                        ${getRunTypeColor(run.run_type)}
                        hover:opacity-80 transition
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {run.run_type}
                        </span>
                        {run.completed && (
                          <Check className="w-3 h-3" />
                        )}
                      </div>
                      {run.target_distance && (
                        <div className="text-xs opacity-75">
                          {run.target_distance} km
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Run Types</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {['EASY', 'TEMPO', 'INTERVAL', 'LONG', 'RECOVERY', 'REST'].map(
            (type) => (
              <div key={type} className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded border ${getRunTypeColor(type)}`}
                />
                <span className="text-xs text-gray-600">{type}</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}