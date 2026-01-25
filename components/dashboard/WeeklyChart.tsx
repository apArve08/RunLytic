// components/dashboard/WeeklyChart.tsx
'use client'

import { Run } from '@/types/database'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, startOfWeek, addDays } from 'date-fns'

interface WeeklyChartProps {
  runs: Run[]
}

export function WeeklyChart({ runs }: WeeklyChartProps) {
  // Generate data for the current week
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i)
    const dateStr = format(date, 'yyyy-MM-dd')

    const dayRuns = runs.filter((run) => run.date === dateStr)
    const totalDistance = dayRuns.reduce(
      (sum, run) => sum + parseFloat(String(run.distance)),
      0
    )

    return {
      day: format(date, 'EEE'),
      distance: parseFloat(totalDistance.toFixed(2)),
      date: dateStr,
      fullDate: format(date, 'MMM d'),
    }
  })

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">This Week's Activity</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={weekData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="day"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
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
            labelFormatter={(label, payload) => {
              if (payload && payload.length > 0) {
                return payload[0].payload.fullDate
              }
              return label
            }}
          />
          <Line
            type="monotone"
            dataKey="distance"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}