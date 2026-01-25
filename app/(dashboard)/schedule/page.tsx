// app/(dashboard)/schedule/page.tsx (UPDATE with delete feature)

'use client'

import { useEffect, useState } from 'react'
import { ScheduleGenerator } from '@/components/schedule/ScheduleGenerator'
import { ScheduleCalendar } from '@/components/schedule/ScheduleCalendar'
import { UpcomingRuns } from '@/components/schedule/UpcomingRuns'
import { WeeklyOverview } from '@/components/schedule/WeeklyOverview'
import { TrainingSchedule, ScheduledRun } from '@/types/database'
import { Calendar, Plus, List, Trash2, MoreVertical } from 'lucide-react'

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<TrainingSchedule[]>([])
  const [activeSchedule, setActiveSchedule] = useState<TrainingSchedule | null>(null)
  const [scheduledRuns, setScheduledRuns] = useState<ScheduledRun[]>([])
  const [loading, setLoading] = useState(true)
  const [showGenerator, setShowGenerator] = useState(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list')
  const [showMenu, setShowMenu] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchSchedules()
  }, [])

  useEffect(() => {
    if (activeSchedule) {
      fetchScheduledRuns(activeSchedule.id)
    }
  }, [activeSchedule])

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/schedules')
      const data = await response.json()
      setSchedules(data.schedules || [])
      
      const active = data.schedules?.find((s: TrainingSchedule) => s.is_active)
      setActiveSchedule(active || null)
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchScheduledRuns = async (scheduleId: string) => {
    try {
      const response = await fetch(
        `/api/scheduled-runs?schedule_id=${scheduleId}`
      )
      const data = await response.json()
      setScheduledRuns(data.scheduled_runs || [])
    } catch (error) {
      console.error('Error fetching scheduled runs:', error)
    }
  }

  const handleGenerate = () => {
    setShowGenerator(false)
    fetchSchedules()
  }

  const handleDeleteSchedule = async () => {
    if (!activeSchedule) return

    const confirmed = confirm(
      `Are you sure you want to delete "${activeSchedule.name}"?\n\nThis will permanently delete all ${scheduledRuns.length} scheduled runs. This action cannot be undone.`
    )

    if (!confirmed) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/schedules?id=${activeSchedule.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Schedule deleted successfully!')
        setActiveSchedule(null)
        setScheduledRuns([])
        fetchSchedules()
      } else {
        alert('Failed to delete schedule')
      }
    } catch (error) {
      console.error('Error deleting schedule:', error)
      alert('Failed to delete schedule')
    } finally {
      setDeleting(false)
      setShowMenu(false)
    }
  }

  const handleDeactivateSchedule = async () => {
    if (!activeSchedule) return

    try {
      const response = await fetch(`/api/schedules?id=${activeSchedule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: false }),
      })

      if (response.ok) {
        alert('Schedule deactivated')
        fetchSchedules()
      }
    } catch (error) {
      console.error('Error deactivating schedule:', error)
    } finally {
      setShowMenu(false)
    }
  }

  const handleRunClick = (run: ScheduledRun) => {
    console.log('Run clicked:', run)
  }

  const currentWeek = scheduledRuns.length > 0
    ? Math.max(...scheduledRuns.map(r => r.week_number).filter(w => {
        const weekRuns = scheduledRuns.filter(sr => sr.week_number === w)
        return weekRuns.some(wr => new Date(wr.scheduled_date) <= new Date())
      }))
    : 1

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Training Schedule</h1>
          <p className="text-gray-600 mt-1">
            {activeSchedule
              ? `${activeSchedule.name} - Week ${currentWeek} of ${activeSchedule.weeks}`
              : 'Plan your training with AI'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeSchedule && (
            <>
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    viewMode === 'calendar'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>

              {/* Schedule Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      onClick={handleDeactivateSchedule}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Pause Schedule
                    </button>
                    <button
                      onClick={handleDeleteSchedule}
                      disabled={deleting}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deleting ? 'Deleting...' : 'Delete Schedule'}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          <button
            onClick={() => setShowGenerator(!showGenerator)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {showGenerator ? 'Cancel' : 'New Schedule'}
          </button>
        </div>
      </div>

      {/* Schedule Selector */}
      {schedules.length > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Active Schedule
          </label>
          <select
            value={activeSchedule?.id || ''}
            onChange={(e) => {
              const schedule = schedules.find((s) => s.id === e.target.value)
              setActiveSchedule(schedule || null)
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            {schedules.map((schedule) => (
              <option key={schedule.id} value={schedule.id}>
                {schedule.name} ({schedule.weeks} weeks) - {schedule.is_active ? 'Active' : 'Paused'}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Generator */}
      {showGenerator && <ScheduleGenerator onGenerate={handleGenerate} />}

      {/* Main Content */}
      {activeSchedule ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upcoming Runs */}
          <div className="lg:col-span-1">
            <UpcomingRuns
              scheduledRuns={scheduledRuns}
              onUpdate={() => fetchScheduledRuns(activeSchedule.id)}
            />
          </div>

          {/* Right Column - Calendar/Overview */}
          <div className="lg:col-span-2 space-y-6">
            <WeeklyOverview
              scheduledRuns={scheduledRuns}
              currentWeek={currentWeek}
            />

            {viewMode === 'calendar' ? (
              <ScheduleCalendar
                scheduledRuns={scheduledRuns}
                onRunClick={handleRunClick}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  All Scheduled Runs
                </h3>
                <div className="space-y-2">
                  {scheduledRuns
                    .sort(
                      (a, b) =>
                        new Date(a.scheduled_date).getTime() -
                        new Date(b.scheduled_date).getTime()
                    )
                    .map((run) => (
                      <div
                        key={run.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            Week {run.week_number} - {run.run_type}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(run.scheduled_date).toLocaleDateString()} •{' '}
                            {run.target_distance} km
                          </div>
                        </div>
                        {run.completed && (
                          <span className="text-green-600 text-sm font-medium">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        !showGenerator && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-300 p-12 text-center">
            <Calendar className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Active Training Schedule
            </h3>
            <p className="text-gray-600 mb-6">
              Generate a personalized training plan with AI to get started
            </p>
            <button
              onClick={() => setShowGenerator(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Training Schedule
            </button>
          </div>
        )
      )}
    </div>
  )
}