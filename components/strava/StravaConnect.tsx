'use client'

import { useEffect, useState } from 'react'
import { Activity, CheckCircle, Download, XCircle, Zap, MapPin, Check, Hash, Calendar } from 'lucide-react'
import { StravaActivityCard } from './StravaActivityCard'

type FetchMode = 'count' | 'daterange'

const COUNT_PRESETS = [10, 25, 50, 100, 200]

const DATE_PRESETS = [
  { label: 'Last 7 days',    days: 7 },
  { label: 'Last 30 days',   days: 30 },
  { label: 'Last 3 months',  days: 90 },
  { label: 'Last 6 months',  days: 180 },
  { label: 'This year',      days: -1 },  // special
]

function daysAgoTimestamp(days: number): number {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(0, 0, 0, 0)
  return Math.floor(d.getTime() / 1000)
}

function thisYearStartTimestamp(): number {
  const d = new Date(new Date().getFullYear(), 0, 1)
  return Math.floor(d.getTime() / 1000)
}

export function StravaConnect() {
  const [connection, setConnection] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<any[]>([])
  const [selectedActivities, setSelectedActivities] = useState<Set<number>>(new Set())
  const [loadingActivities, setLoadingActivities] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ imported: number; skipped: number } | null>(null)

  // Fetch options
  const [fetchMode, setFetchMode] = useState<FetchMode>('count')
  const [selectedCount, setSelectedCount] = useState(25)
  const [selectedPreset, setSelectedPreset] = useState<number | null>(30)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  useEffect(() => { checkConnection() }, [])

  const checkConnection = async () => {
    try {
      const res = await fetch('/api/strava/connection')
      const data = await res.json()
      setConnection(data.connected ? data.connection : null)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect    = () => { window.location.href = '/api/strava/auth' }

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Strava?')) return
    await fetch('/api/strava/connection', { method: 'DELETE' })
    setConnection(null)
    setActivities([])
    setSelectedActivities(new Set())
  }

  // Build the query string from current fetch options
  const buildFetchParams = (): string => {
    const p = new URLSearchParams()
    if (fetchMode === 'count') {
      p.set('per_page', String(selectedCount))
    } else {
      // date range → always fetch up to 200 and let after/before filter
      p.set('per_page', '200')
      if (selectedPreset !== null) {
        const after = selectedPreset === -1
          ? thisYearStartTimestamp()
          : daysAgoTimestamp(selectedPreset)
        p.set('after', String(after))
      } else {
        if (customFrom) p.set('after',  String(Math.floor(new Date(customFrom).getTime() / 1000)))
        if (customTo)   p.set('before', String(Math.floor(new Date(customTo).getTime()   / 1000)))
      }
    }
    return p.toString()
  }

  const handleFetchActivities = async () => {
    setLoadingActivities(true)
    setActivities([])
    setSelectedActivities(new Set())
    setSyncResult(null)
    try {
      const res = await fetch(`/api/strava/activities?${buildFetchParams()}`)
      const data = await res.json()
      if (res.ok) {
        setActivities(data.activities)
        setSelectedActivities(new Set(data.activities.map((a: any) => a.id)))
      } else {
        alert(data.error || 'Failed to fetch activities')
      }
    } catch (e) {
      console.error(e)
      alert('Failed to fetch activities')
    } finally {
      setLoadingActivities(false)
    }
  }

  const handleToggleActivity = (id: number) => {
    setSelectedActivities(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  const handleSyncActivities = async () => {
    if (selectedActivities.size === 0) return
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch('/api/strava/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activities: activities.filter(a => selectedActivities.has(a.id)),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setSyncResult({ imported: data.imported, skipped: data.skipped })
        setActivities([])
        setSelectedActivities(new Set())
      } else {
        alert(data.error || 'Failed to sync')
      }
    } catch (e) {
      console.error(e)
      alert('Failed to sync activities')
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading Strava connection...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Connection card ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Strava Integration</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {connection
                  ? `Connected as ${connection.athlete_data?.firstname} ${connection.athlete_data?.lastname}`
                  : 'Connect your Strava account'}
              </p>
            </div>
          </div>
          {connection
            ? <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium"><CheckCircle className="w-4 h-4" /> Connected</div>
            : <XCircle className="w-5 h-5 text-gray-400" />}
        </div>

        {connection ? (
          <div className="space-y-5">
            {/* Meta */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500 dark:text-gray-400">Athlete ID</span><p className="font-medium text-gray-900 dark:text-white mt-0.5">{connection.athlete_id}</p></div>
              <div><span className="text-gray-500 dark:text-gray-400">Connected</span><p className="font-medium text-gray-900 dark:text-white mt-0.5">{new Date(connection.connected_at).toLocaleDateString()}</p></div>
              {connection.last_sync_at && (
                <div className="col-span-2"><span className="text-gray-500 dark:text-gray-400">Last Sync</span><p className="font-medium text-gray-900 dark:text-white mt-0.5">{new Date(connection.last_sync_at).toLocaleString()}</p></div>
              )}
            </div>

            {/* ── Fetch options ── */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Fetch options</p>

              {/* Mode toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 w-fit gap-1">
                {(['count', 'daterange'] as FetchMode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setFetchMode(m)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition ${
                      fetchMode === m
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {m === 'count' ? <Hash className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                    {m === 'count' ? 'By count' : 'By date'}
                  </button>
                ))}
              </div>

              {fetchMode === 'count' ? (
                /* ── Count mode ── */
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Number of most recent runs</p>
                  <div className="flex flex-wrap gap-2">
                    {COUNT_PRESETS.map(n => (
                      <button
                        key={n}
                        onClick={() => setSelectedCount(n)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition ${
                          selectedCount === n
                            ? 'bg-orange-600 border-orange-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* ── Date range mode ── */
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {DATE_PRESETS.map(p => (
                      <button
                        key={p.days}
                        onClick={() => { setSelectedPreset(p.days); setCustomFrom(''); setCustomTo('') }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                          selectedPreset === p.days
                            ? 'bg-orange-600 border-orange-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectedPreset(null)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                        selectedPreset === null
                          ? 'bg-orange-600 border-orange-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400'
                      }`}
                    >
                      Custom
                    </button>
                  </div>

                  {selectedPreset === null && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From</label>
                        <input
                          type="date"
                          value={customFrom}
                          onChange={e => setCustomFrom(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">To</label>
                        <input
                          type="date"
                          value={customTo}
                          onChange={e => setCustomTo(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* GPS info */}
            <div className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              <span><strong>GPS Route Import:</strong> Activities with GPS data will include interactive maps on run detail pages.</span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleFetchActivities}
                disabled={loadingActivities}
                className="flex-1 bg-orange-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingActivities ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Fetching...</>
                ) : (
                  <><Download className="w-4 h-4" /> Fetch Strava Data</>
                )}
              </button>
              <button
                onClick={handleDisconnect}
                className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm"
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

      {/* ── Sync result banner ────────────────────────────────────── */}
      {syncResult && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-sm text-green-800 dark:text-green-300">
          <p className="font-semibold mb-1">Import complete!</p>
          <p>{syncResult.imported} runs imported · {syncResult.skipped} duplicates skipped</p>
        </div>
      )}

      {/* ── Activities list ───────────────────────────────────────── */}
      {activities.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Strava Activities ({activities.length})
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedActivities.size} selected · {activities.filter(a => a.map?.summary_polyline).length} with GPS
              </p>
            </div>
            <div className="flex gap-2 text-sm font-medium">
              <button onClick={() => setSelectedActivities(new Set(activities.map(a => a.id)))} className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20">
                All
              </button>
              <button onClick={() => setSelectedActivities(new Set())} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                None
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {activities.map(activity => (
              <div
                key={activity.id}
                onClick={() => handleToggleActivity(activity.id)}
                className={`relative border-2 rounded-lg cursor-pointer transition ${
                  selectedActivities.has(activity.id)
                    ? 'border-blue-500 dark:border-blue-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {/* Checkbox */}
                <div className={`absolute top-4 right-4 z-10 w-5 h-5 border-2 rounded flex items-center justify-center transition ${
                  selectedActivities.has(activity.id)
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                }`}>
                  {selectedActivities.has(activity.id) && <Check className="w-3 h-3 text-white" />}
                </div>

                <StravaActivityCard activity={activity} selected={selectedActivities.has(activity.id)} />
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedActivities.size} of {activities.length} selected
            </p>
            <button
              onClick={handleSyncActivities}
              disabled={syncing || selectedActivities.size === 0}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {syncing ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Importing...</>
              ) : (
                <><Zap className="w-4 h-4" /> Import {selectedActivities.size} Selected</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
