// components/dashboard/MonthlyStats.tsx
'use client'

import { Run } from '@/types/database'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { startOfMonth, endOfMonth, eachWeekOfInterval, format, isWithinInterval } from 'date-fns'

interface MonthlyStatsProps {
  runs: Run[]
}

export function MonthlyStats({ runs }: MonthlyStatsProps) {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  // Get all weeks in current month
  const weeks = eachWeekOfInterval(
    { start: monthStart, end: monthEnd },
    { weekStartsOn: 1 }
  )

  const weeklyData = weeks.map((weekStart, index) => {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const weekRuns = runs.filter((run) => {
      const runDate = new Date(run.date)
      return isWithinInterval(runDate, { start: weekStart, end: weekEnd })
    })

    const totalDistance = weekRuns.reduce(
      (sum, run) => sum + parseFloat(String(run.distance)),
      0
    )

    return {
      week: `Week ${index + 1}`,
      distance: parseFloat(totalDistance.toFixed(2)),
      runs: weekRuns.length,
    }
  })

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        {format(now, 'MMMM yyyy')} - Weekly Breakdown
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={weeklyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="week" stroke="#6b7280" style={{ fontSize: '12px' }} />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{ value: 'km', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'distance') {
                return [`${value} km`, 'Distance']
              }
              return [value, name]
            }}
          />
          <Bar dataKey="distance" fill="#3b82f6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}