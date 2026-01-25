'use client'

import { useEffect, useState } from 'react'
import { Activity, CheckCircle, Download, XCircle, Zap } from 'lucide-react'

export function StravaConnect() {
  const [connection, setConnection] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<any[]>([])
  const [loadingActivities, setLoadingActivities] = useState(false)
  const [syncing, setSyncing] = useState(false)
  
  // New state for selected activities
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

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
      setSelectedIds(new Set())
    } catch (error) {
      console.error('Error disconnecting:', error)
      alert('Failed to disconnect')
    }
  }

  const handleFetchActivities = async () => {
    setLoadingActivities(true)
    try {
      const response = await fetch('/api/strava/activities?per_page=50')
      const data = await response.json()
      
      if (response.ok) {
        setActivities(data.activities || [])
        // Automatically select all when fetched
        setSelectedIds(new Set((data.activities || []).map((a: any) => a.id)))
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

  // Selection Logic
  const toggleActivity = (id: number) => {
    const newSelection = new Set(selectedIds)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedIds(newSelection)
  }

  const toggleAll = () => {
    if (selectedIds.size === activities.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(activities.map((a) => a.id)))
    }
  }

  const handleSyncActivities = async () => {
    const activitiesToSync = activities.filter(a => selectedIds.has(a.id))
    
    if (activitiesToSync.length === 0) {
      alert('Please select at least one activity to sync')
      return
    }

    setSyncing(true)
    try {
      const response = await fetch('/api/strava/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities: activitiesToSync }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(
          `Sync complete!\n\nImported: ${data.imported}\nSkipped (duplicates): ${data.skipped}\nTotal: ${data.total}`
        )
        setActivities([])
        setSelectedIds(new Set())
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
      {/* Connection Status Section - Unchanged */}
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
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleFetchActivities}
                disabled={loadingActivities}
                className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingActivities ? 'Loading...' : 'Fetch Activities'}
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
          <button onClick={handleConnect} className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-700 transition flex items-center justify-center gap-2">
            <Activity className="w-5 h-5" />
            Connect with Strava
          </button>
        )}
      </div>

      {/* NEW: Updated Activities List with Selection */}
      {activities?.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                checked={selectedIds.size === activities.length}
                onChange={toggleAll}
              />
              <h4 className="text-lg font-semibold text-gray-900">
                Selected ({selectedIds.size} / {activities.length})
              </h4>
            </div>
            
            <button
              onClick={handleSyncActivities}
              disabled={syncing || selectedIds.size === 0}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {syncing ? 'Importing...' : 'Import Selected'}
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-center gap-4 p-3 rounded-lg border transition ${
                  selectedIds.has(activity.id) 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-gray-50 border-transparent hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                  checked={selectedIds.has(activity.id)}
                  onChange={() => toggleActivity(activity.id)}
                />
                
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {activity.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(activity.start_date).toLocaleDateString()} •{' '}
                    {(activity.distance / 1000).toFixed(2)} km •{' '}
                    {Math.floor(activity.moving_time / 60)} min
                  </div>
                </div>
                
                <div className="text-right text-sm font-medium text-gray-900">
                  {((activity.moving_time / 60) / (activity.distance / 1000)).toFixed(2)} min/km
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}