// components/monthly/MonthlyCalendar.tsx
'use client'

import { Run } from '@/types/database'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from 'date-fns'

interface MonthlyCalendarProps {
  runs: Run[]
  month: Date
}

export function MonthlyCalendar({ runs, month }: MonthlyCalendarProps) {
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const getRunsForDay = (day: Date) => {
    return runs.filter(run => isSameDay(new Date(run.date), day))
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {format(month, 'MMMM yyyy')}
      </h3>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dayRuns = getRunsForDay(day)
          const isCurrentMonth = day.getMonth() === month.getMonth()
          const totalDistance = dayRuns.reduce((sum, run) => sum + parseFloat(String(run.distance)), 0)

          return (
            <div
              key={day.toISOString()}
              className={`
                min-h-[80px] p-2 border rounded-lg
                ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${dayRuns.length > 0 ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}
              `}
            >
              <div className={`
                text-sm font-medium mb-1
                ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
              `}>
                {format(day, 'd')}
              </div>
              
              {dayRuns.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-blue-700">
                    {totalDistance.toFixed(1)} km
                  </div>
                  <div className="text-xs text-blue-600">
                    {dayRuns.length} run{dayRuns.length > 1 ? 's' : ''}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}