// components/streaks/StreakCalendar.tsx
'use client'

import { useMemo } from 'react'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, startOfWeek, endOfWeek } from 'date-fns'
import { Run } from '@/types/database'

interface StreakCalendarProps {
  runs: Run[]
  month: Date
}

export function StreakCalendar({ runs, month }: StreakCalendarProps) {
  const calendarData = useMemo(() => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }) // Sunday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    
    // Create run dates set for quick lookup
    const runDates = new Set(runs.map(run => run.date))
    
    // Calculate max distance for color intensity
    const maxDistance = Math.max(...runs.map(r => parseFloat(String(r.distance))), 1)
    
    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const hasRun = runDates.has(dateStr)
      const dayRuns = runs.filter(r => r.date === dateStr)
      const totalDistance = dayRuns.reduce((sum, r) => sum + parseFloat(String(r.distance)), 0)
      const intensity = hasRun ? Math.min(totalDistance / maxDistance, 1) : 0
      
      return {
        date: day,
        dateStr,
        hasRun,
        runCount: dayRuns.length,
        totalDistance,
        intensity,
        isCurrentMonth: day.getMonth() === month.getMonth(),
      }
    })
  }, [runs, month])

  const getColorClass = (intensity: number, hasRun: boolean) => {
    if (!hasRun) return 'bg-gray-100'
    if (intensity >= 0.8) return 'bg-green-600'
    if (intensity >= 0.6) return 'bg-green-500'
    if (intensity >= 0.4) return 'bg-green-400'
    if (intensity >= 0.2) return 'bg-green-300'
    return 'bg-green-200'
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Activity Heatmap - {format(month, 'MMMM yyyy')}
      </h3>

      {/* Week day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarData.map((day, index) => (
          <div
            key={index}
            className="relative group"
          >
            <div
              className={`
                aspect-square rounded-sm transition-all cursor-pointer
                ${getColorClass(day.intensity, day.hasRun)}
                ${!day.isCurrentMonth ? 'opacity-30' : ''}
                ${day.hasRun ? 'hover:ring-2 hover:ring-blue-500' : ''}
              `}
              title={day.hasRun ? `${day.totalDistance.toFixed(1)}km (${day.runCount} run${day.runCount > 1 ? 's' : ''})` : 'No runs'}
            >
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                {day.isCurrentMonth && format(day.date, 'd')}
              </div>
            </div>

            {/* Tooltip */}
            {day.hasRun && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                  {format(day.date, 'MMM d')}: {day.totalDistance.toFixed(1)}km
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-gray-600">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded-sm" />
          <div className="w-3 h-3 bg-green-200 rounded-sm" />
          <div className="w-3 h-3 bg-green-300 rounded-sm" />
          <div className="w-3 h-3 bg-green-400 rounded-sm" />
          <div className="w-3 h-3 bg-green-500 rounded-sm" />
          <div className="w-3 h-3 bg-green-600 rounded-sm" />
        </div>
        <span>More</span>
      </div>
    </div>
  )
}