// components/dashboard/StatsOverview.tsx
import { Run } from '@/types/database'
import { Footprints, Clock, TrendingUp, Calendar } from 'lucide-react'
import { formatDistance, formatDuration, formatPace } from '@/lib/utils'

interface StatsOverviewProps {
  runs: Run[]
}

export function StatsOverview({ runs }: StatsOverviewProps) {
  // Calculate stats
  const totalDistance = runs.reduce((sum, run) => sum + parseFloat(String(run.distance)), 0)
  const totalDuration = runs.reduce((sum, run) => sum + run.duration, 0)
  const totalRuns = runs.length
  const avgPace = totalDistance > 0 ? totalDuration / 60 / totalDistance : 0

  // This week stats
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thisWeekRuns = runs.filter((run) => new Date(run.date) >= weekAgo)
  const thisWeekDistance = thisWeekRuns.reduce(
    (sum, run) => sum + parseFloat(String(run.distance)),
    0
  )

  // This month stats
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisMonthRuns = runs.filter((run) => new Date(run.date) >= monthStart)
  const thisMonthDistance = thisMonthRuns.reduce(
    (sum, run) => sum + parseFloat(String(run.distance)),
    0
  )

  const stats = [
    {
      label: 'Total Distance',
      value: formatDistance(totalDistance),
      icon: Footprints,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Runs',
      value: totalRuns.toString(),
      icon: Calendar,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Total Time',
      value: formatDuration(totalDuration),
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Avg Pace',
      value: avgPace > 0 ? `${formatPace(avgPace)} /km` : 'N/A',
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ]

  return (
    <div className="space-y-6">
      {/* All-time stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All-Time Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">This Week</h3>
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatDistance(thisWeekDistance)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {thisWeekRuns.length} run{thisWeekRuns.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">This Month</h3>
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatDistance(thisMonthDistance)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {thisMonthRuns.length} run{thisMonthRuns.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}