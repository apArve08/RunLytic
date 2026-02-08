// components/calendar/MonthlyCalendar.tsx
'use client'

import { Run } from '@/types/database'
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  startOfMonth,
  endOfMonth,
  differenceInDays,
  subDays,
} from 'date-fns'
import { Flame } from 'lucide-react'

interface MonthlyCalendarProps {
  runs: Run[]
  month: Date
}

// Calculate current running streak
function calculateStreak(runs: Run[]): { current: number; longest: number } {
  if (runs.length === 0) return { current: 0, longest: 0 }

  const sortedRuns = [...runs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const uniqueDays = new Set(
    sortedRuns.map(run => format(new Date(run.date), 'yyyy-MM-dd'))
  )
  const sortedDays = Array.from(uniqueDays).sort((a, b) => b.localeCompare(a))

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  let checkDate = new Date()

  // Calculate current streak
  for (const dayStr of sortedDays) {
    const runDate = new Date(dayStr)
    const expectedDate = subDays(checkDate, currentStreak)

    if (isSameDay(runDate, expectedDate) || isSameDay(runDate, subDays(expectedDate, 0))) {
      currentStreak++
      checkDate = runDate
    } else if (differenceInDays(checkDate, runDate) > currentStreak + 1) {
      break
    }
  }

  // Calculate longest streak
  for (let i = 0; i < sortedDays.length; i++) {
    tempStreak = 1
    let currentDay = new Date(sortedDays[i])

    for (let j = i + 1; j < sortedDays.length; j++) {
      const nextDay = new Date(sortedDays[j])
      if (differenceInDays(currentDay, nextDay) === 1) {
        tempStreak++
        currentDay = nextDay
      } else {
        break
      }
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak
    }
  }

  return { current: currentStreak, longest: Math.max(longestStreak, currentStreak) }
}

export function MonthlyCalendar({ runs, month }: MonthlyCalendarProps) {
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const streak = calculateStreak(runs)

  const getRunsForDay = (day: Date) => {
    return runs.filter(run => isSameDay(new Date(run.date), day))
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header with streak info */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {format(month, 'MMMM yyyy')}
        </h3>
        
        <div className="flex items-center gap-4">
          {/* Current Streak */}
          <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
            <Flame className="w-4 h-4 text-orange-500" />
            <div className="text-sm">
              <span className="font-bold text-orange-700">{streak.current}</span>
              <span className="text-orange-600 ml-1">day streak</span>
            </div>
          </div>

          {/* Longest Streak */}
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
            <Flame className="w-4 h-4 text-blue-500" />
            <div className="text-sm">
              <span className="font-bold text-blue-700">{streak.longest}</span>
              <span className="text-blue-600 ml-1">best</span>
            </div>
          </div>
        </div>
      </div>

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
          const hasRun = dayRuns.length > 0

          return (
            <div
              key={day.toISOString()}
              className={`
                min-h-[80px] p-2 border rounded-lg transition-all
                ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${hasRun ? 'border-blue-200 bg-blue-50 ring-2 ring-blue-100' : 'border-gray-200'}
                hover:shadow-md
              `}
            >
              <div className={`
                text-sm font-medium mb-1 flex items-center justify-between
                ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
              `}>
                <span>{format(day, 'd')}</span>
                {hasRun && (
                  <Flame className="w-3 h-3 text-orange-500" />
                )}
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

      {/* Streak Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Flame className="w-4 h-4 text-orange-500" />
          <span>Days with runs contribute to your streak</span>
        </div>
      </div>
    </div>
  )
}