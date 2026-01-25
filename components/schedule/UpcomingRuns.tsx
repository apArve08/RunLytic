// components/schedule/UpcomingRuns.tsx
'use client'

import { useState } from 'react'
import { ScheduledRun } from '@/types/database'
import { format, isSameDay, isPast } from 'date-fns'
import { Calendar, CheckCircle, Circle, Clock, Footprints } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UpcomingRunsProps {
  scheduledRuns: ScheduledRun[]
  onUpdate: () => void
}

export function UpcomingRuns({ scheduledRuns, onUpdate }: UpcomingRunsProps) {
  const router = useRouter()
  const [completingRun, setCompletingRun] = useState<string | null>(null)

  const today = new Date()
  const todaysRuns = scheduledRuns.filter((run) =>
    isSameDay(new Date(run.scheduled_date), today)
  )
  const upcomingRuns = scheduledRuns.filter(
    (run) =>
      new Date(run.scheduled_date) > today && !run.completed
  )
  const overdueRuns = scheduledRuns.filter(
    (run) =>
      isPast(new Date(run.scheduled_date)) &&
      !isSameDay(new Date(run.scheduled_date), today) &&
      !run.completed
  )

  const handleMarkComplete = async (run: ScheduledRun) => {
    setCompletingRun(run.id)
    try {
      // For now, just mark as complete
      // In a full implementation, you'd create an actual run and link it
      await fetch(`/api/scheduled-runs?id=${run.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      })
      onUpdate()
    } catch (error) {
      console.error('Error marking run complete:', error)
    } finally {
      setCompletingRun(null)
    }
  }

  const handleLogRun = (run: ScheduledRun) => {
    // Pre-fill the run form with scheduled data
    const params = new URLSearchParams({
      date: run.scheduled_date,
      distance: run.target_distance?.toString() || '',
      notes: `Scheduled ${run.run_type} run`,
    })
    router.push(`/runs/new?${params.toString()}`)
  }

  const getRunTypeColor = (runType: string) => {
    const colors = {
      EASY: 'text-green-600 bg-green-50',
      TEMPO: 'text-orange-600 bg-orange-50',
      INTERVAL: 'text-red-600 bg-red-50',
      LONG: 'text-blue-600 bg-blue-50',
      RECOVERY: 'text-purple-600 bg-purple-50',
      REST: 'text-gray-600 bg-gray-50',
    }
    return colors[runType as keyof typeof colors] || colors.EASY
  }

  const RunCard = ({ run, isToday = false, isOverdue = false }: { run: ScheduledRun; isToday?: boolean; isOverdue?: boolean }) => (
    <div
      className={`
        p-4 rounded-lg border-2 transition
        ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
        ${isOverdue ? 'border-red-300 bg-red-50' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRunTypeColor(run.run_type)}`}>
            {run.run_type}
          </div>
          {isToday && (
            <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
              TODAY
            </span>
          )}
          {isOverdue && (
            <span className="bg-red-600 text-white text-xs font-medium px-2 py-1 rounded">
              OVERDUE
            </span>
          )}
        </div>
        <button
          onClick={() => handleMarkComplete(run)}
          disabled={completingRun === run.id || run.completed}
          className={`
            p-1 rounded hover:bg-gray-100 transition
            ${run.completed ? 'text-green-600' : 'text-gray-400'}
          `}
        >
          {run.completed ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          {format(new Date(run.scheduled_date), 'EEEE, MMM d')}
        </div>

        {run.target_distance && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Footprints className="w-4 h-4" />
            {run.target_distance} km
          </div>
        )}

        {run.notes && (
          <p className="text-sm text-gray-600 mt-2">{run.notes}</p>
        )}
      </div>

      {!run.completed && (
        <button
          onClick={() => handleLogRun(run)}
          className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          Log This Run
        </button>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Today's Runs */}
      {todaysRuns.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Today's Workout
          </h3>
          <div className="space-y-3">
            {todaysRuns.map((run) => (
              <RunCard key={run.id} run={run} isToday />
            ))}
          </div>
        </div>
      )}

      {/* Overdue Runs */}
      {overdueRuns.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-600" />
            Missed Workouts
          </h3>
          <div className="space-y-3">
            {overdueRuns.slice(0, 3).map((run) => (
              <RunCard key={run.id} run={run} isOverdue />
            ))}
          </div>
          {overdueRuns.length > 3 && (
            <p className="text-sm text-gray-500 mt-2">
              + {overdueRuns.length - 3} more missed
            </p>
          )}
        </div>
      )}

      {/* Upcoming Runs */}
      {upcomingRuns.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Next 7 Days
          </h3>
          <div className="space-y-3">
            {upcomingRuns.slice(0, 5).map((run) => (
              <RunCard key={run.id} run={run} />
            ))}
          </div>
        </div>
      )}

      {todaysRuns.length === 0 &&
        upcomingRuns.length === 0 &&
        overdueRuns.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No scheduled runs yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Generate a training schedule to get started!
            </p>
          </div>
        )}
    </div>
  )
}