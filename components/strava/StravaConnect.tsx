// components/strava/StravaConnect.tsx (REPLACE ENTIRE FILE)
'use client'

import { useEffect, useState } from 'react'
import { Activity, CheckCircle, Download, XCircle, Zap, MapPin, Check } from 'lucide-react'
import { StravaActivityCard } from './StravaActivityCard'

export function StravaConnect() {
  const [connection, setConnection] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<any[]>([])
  const [selectedActivities, setSelectedActivities] = useState<Set<number>>(new Set())
  const [loadingActivities, setLoadingActivities] = useState(false)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/strava/connection')
      const data = await response.json()
      setConnection(data.connected ? data.connection : null)
    } catch (error) {
      console.error('Error checking connection:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = () => {
    window.location.href = '/api/strava/auth'
  }

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Strava?')) return

    try {
      await fetch('/api/strava/connection', { method: 'DELETE' })
      setConnection(null)
      setActivities([])
      setSelectedActivities(new Set())
    } catch (error) {
      console.error('Error disconnecting:', error)
      alert('Failed to disconnect')
    }
  }

  const handleFetchActivities = async () => {
    setLoadingActivities(true)
    try {
      const response = await fetch('/api/strava/activities?per_page=10')
      const data = await response.json()
      
      if (response.ok) {
        setActivities(data.activities)
        // Auto-select all by default
        setSelectedActivities(new Set(data.activities.map((a: any) => a.id)))
        
        // Count how many have routes
        const withRoutes = data.activities.filter(
          (a: any) => a.map?.summary_polyline
        ).length
        
        if (withRoutes > 0) {
          alert(
            `Loaded ${data.activities.length} activities.\n${withRoutes} have GPS route data! 🗺️`
          )
        }
      } else {
        alert(data.error || 'Failed to fetch activities')
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
      alert('Failed to fetch activities')
    } finally {
      setLoadingActivities(false)
    }
  }

  const handleToggleActivity = (activityId: number) => {
    setSelectedActivities((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(activityId)) {
        newSet.delete(activityId)
      } else {
        newSet.add(activityId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    setSelectedActivities(new Set(activities.map((a) => a.id)))
  }

  const handleDeselectAll = () => {
    setSelectedActivities(new Set())
  }

  const handleSyncActivities = async () => {
    if (selectedActivities.size === 0) {
      alert('Please select at least one activity to import')
      return
    }

    const selectedActivityData = activities.filter((a) =>
      selectedActivities.has(a.id)
    )

    const withRoutes = selectedActivityData.filter(
      (a) => a.map?.summary_polyline
    ).length

    const confirmed = confirm(
      `Import ${selectedActivities.size} selected activities to RunTrack?\n\n` +
        `${withRoutes} activities include GPS route data that will be displayed on maps.`
    )

    if (!confirmed) return

    setSyncing(true)
    try {
      const response = await fetch('/api/strava/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities: selectedActivityData }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(
          `Sync complete! ✓\n\n` +
            `Imported: ${data.imported}\n` +
            `Skipped (duplicates): ${data.skipped}\n` +
            `Errors: ${data.errors || 0}\n` +
            `Total processed: ${data.total}\n\n` +
            `Routes with GPS data are now viewable on run detail pages! 🗺️`
        )
        // Clear activities after successful sync
        setActivities([])
        setSelectedActivities(new Set())
      } else {
        alert(data.error || 'Failed to sync')
      }
    } catch (error) {
      console.error('Error syncing:', error)
      alert('Failed to sync activities')
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">Loading Strava connection...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Strava Integration
              </h3>
              <p className="text-sm text-gray-500">
                {connection
                  ? `Connected as ${connection.athlete_data?.firstname} ${connection.athlete_data?.lastname}`
                  : 'Connect your Strava account'}
              </p>
            </div>
          </div>

          {connection ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                Connected
              </span>
            </div>
          ) : (
            <XCircle className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {connection ? (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Athlete ID:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {connection.athlete_id}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Connected:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {new Date(connection.connected_at).toLocaleDateString()}
                  </span>
                </div>
                {connection.last_sync_at && (
                  <div>
                    <span className="text-gray-600">Last Sync:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {new Date(connection.last_sync_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>GPS Route Import:</strong> Activities with GPS data will include
                  interactive maps showing your exact running route!
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleFetchActivities}
                disabled={loadingActivities}
                className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingActivities ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Fetch Activities
                  </>
                )}
              </button>

              <button
                onClick={handleDisconnect}
                className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-700 transition flex items-center justify-center gap-2"
          >
            <Activity className="w-5 h-5" />
            Connect with Strava
          </button>
        )}
      </div>

      {/* Activities List */}
      {activities.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                Strava Activities ({activities.length})
              </h4>
              <p className="text-sm text-gray-500">
                {selectedActivities.size} selected •{' '}
                {activities.filter((a) => a.map?.summary_polyline).length} with GPS routes
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-50"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="text-sm text-gray-600 hover:text-gray-700 font-medium px-3 py-1 rounded hover:bg-gray-100"
              >
                Deselect All
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`relative border-2 rounded-lg transition ${
                  selectedActivities.has(activity.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {/* Checkbox */}
                <label className="absolute top-4 right-4 z-10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedActivities.has(activity.id)}
                    onChange={() => handleToggleActivity(activity.id)}
                    className="sr-only peer"
                  />
                  <div
                    className={`w-6 h-6 border-2 rounded flex items-center justify-center transition ${
                      selectedActivities.has(activity.id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {selectedActivities.has(activity.id) && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                </label>

                {/* Activity Card */}
                <div onClick={() => handleToggleActivity(activity.id)} className="cursor-pointer">
                <StravaActivityCard 
          activity={activity} 
          selected={selectedActivities.has(activity.id)}  // <-- THIS IS THE LINE
        />
                </div>
              </div>
            ))}
          </div>

          {/* Import Button */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedActivities.size} of {activities.length} activities selected
            </div>
            <button
              onClick={handleSyncActivities}
              disabled={syncing || selectedActivities.size === 0}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {syncing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Importing {selectedActivities.size} activities...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Import {selectedActivities.size} Selected
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}