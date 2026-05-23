'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Run, Shoe } from '@/types/database'
import { formatPace, formatDuration } from '@/lib/utils'
import {
  Plus, Search, SlidersHorizontal, X, Download,
  ChevronUp, ChevronDown, ChevronsUpDown,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type SortKey =
  | 'date' | 'distance' | 'duration' | 'pace'
  | 'avg_heart_rate' | 'max_heart_rate'
  | 'elevation_gain' | 'avg_speed'

type SortDir = 'asc' | 'desc'

interface Filters {
  search: string
  shoeId: string
  dateFrom: string
  dateTo: string
  distanceMin: string
  distanceMax: string
  hrMin: string
  hrMax: string
}

const defaultFilters: Filters = {
  search: '',
  shoeId: '',
  dateFrom: '',
  dateTo: '',
  distanceMin: '',
  distanceMax: '',
  hrMin: '',
  hrMax: '',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined, digits = 1) {
  return n != null ? n.toFixed(digits) : '—'
}

function fmtPace(p: number | null | undefined) {
  if (p == null || p <= 0) return '—'
  return formatPace(p)
}

function fmtHr(hr: number | null | undefined) {
  return hr != null ? `${hr} bpm` : '—'
}

function fmtElev(m: number | null | undefined) {
  return m != null ? `${m.toFixed(0)} m` : '—'
}

// ─── SortIcon ────────────────────────────────────────────────────────────────

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />
  return sortDir === 'asc'
    ? <ChevronUp className="w-3.5 h-3.5" />
    : <ChevronDown className="w-3.5 h-3.5" />
}

// ─── Main component ──────────────────────────────────────────────────────────

export function ActivitiesTable({ runs, shoes }: { runs: Run[]; shoes: Shoe[] }) {
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const set = (key: keyof Filters, value: string) =>
    setFilters(prev => ({ ...prev, [key]: value }))

  const activeFilterCount = [
    filters.shoeId, filters.dateFrom, filters.dateTo,
    filters.distanceMin, filters.distanceMax,
    filters.hrMin, filters.hrMax,
  ].filter(Boolean).length

  const clearFilters = () => setFilters(defaultFilters)

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filtered = useMemo(() => {
    let r = [...runs]

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      r = r.filter(run =>
        run.notes?.toLowerCase().includes(q) ||
        run.date.includes(q) ||
        run.shoes?.brand?.toLowerCase().includes(q) ||
        run.shoes?.model?.toLowerCase().includes(q) ||
        run.shoes?.nickname?.toLowerCase().includes(q)
      )
    }
    if (filters.shoeId)      r = r.filter(run => run.shoes_id === filters.shoeId)
    if (filters.dateFrom)    r = r.filter(run => run.date >= filters.dateFrom)
    if (filters.dateTo)      r = r.filter(run => run.date <= filters.dateTo)
    if (filters.distanceMin) r = r.filter(run => run.distance >= parseFloat(filters.distanceMin))
    if (filters.distanceMax) r = r.filter(run => run.distance <= parseFloat(filters.distanceMax))
    if (filters.hrMin)       r = r.filter(run => run.avg_heart_rate != null && run.avg_heart_rate >= parseInt(filters.hrMin))
    if (filters.hrMax)       r = r.filter(run => run.avg_heart_rate != null && run.avg_heart_rate <= parseInt(filters.hrMax))

    r.sort((a, b) => {
      let av: number, bv: number
      switch (sortKey) {
        case 'date':          av = a.date.localeCompare(b.date); bv = 0; break
        case 'distance':      av = a.distance; bv = b.distance; break
        case 'duration':      av = a.duration; bv = b.duration; break
        case 'pace':          av = a.pace ?? 0; bv = b.pace ?? 0; break
        case 'avg_heart_rate': av = a.avg_heart_rate ?? 0; bv = b.avg_heart_rate ?? 0; break
        case 'max_heart_rate': av = a.max_heart_rate ?? 0; bv = b.max_heart_rate ?? 0; break
        case 'elevation_gain': av = a.elevation_gain ?? 0; bv = b.elevation_gain ?? 0; break
        case 'avg_speed':     av = a.avg_speed ?? 0; bv = b.avg_speed ?? 0; break
        default:              return 0
      }
      if (sortKey === 'date') return sortDir === 'asc' ? av : -av
      return sortDir === 'asc' ? av - bv : bv - av
    })

    return r
  }, [runs, filters, sortKey, sortDir])

  // ── Summary stats for filtered set ─────────────────────────────────────────
  const summary = useMemo(() => {
    if (filtered.length === 0) return null
    const totalDist = filtered.reduce((s, r) => s + r.distance, 0)
    const totalDur  = filtered.reduce((s, r) => s + r.duration, 0)
    const avgPace   = filtered.reduce((s, r) => s + (r.pace ?? 0), 0) / filtered.length
    const avgHr     = filtered.filter(r => r.avg_heart_rate).length
      ? filtered.filter(r => r.avg_heart_rate).reduce((s, r) => s + (r.avg_heart_rate ?? 0), 0) /
        filtered.filter(r => r.avg_heart_rate).length
      : null
    const totalElev = filtered.reduce((s, r) => s + (r.elevation_gain ?? 0), 0)
    return { totalDist, totalDur, avgPace, avgHr, totalElev }
  }, [filtered])

  // ── Excel export ───────────────────────────────────────────────────────────
  async function exportExcel() {
    const XLSX = await import('xlsx')
    const rows = filtered.map(r => ({
      Date: r.date,
      'Distance (km)': r.distance,
      'Duration': formatDuration(r.duration),
      'Duration (min)': +(r.duration / 60).toFixed(1),
      'Pace (min/km)': r.pace ? fmtPace(r.pace) : '',
      'Avg HR (bpm)': r.avg_heart_rate ?? '',
      'Max HR (bpm)': r.max_heart_rate ?? '',
      'Elevation Gain (m)': r.elevation_gain ?? '',
      'Elevation Loss (m)': r.elevation_loss ?? '',
      'Avg Speed (km/h)': r.avg_speed ?? '',
      'Shoe': r.shoes ? (r.shoes.nickname || `${r.shoes.brand} ${r.shoes.model}`) : '',
      'Notes': r.notes ?? '',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Activities')

    // column widths
    ws['!cols'] = [
      { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 14 },
      { wch: 13 }, { wch: 13 }, { wch: 20 }, { wch: 20 }, { wch: 18 },
      { wch: 20 }, { wch: 40 },
    ]

    const date = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(wb, `runtrack-activities-${date}.xlsx`)
  }

  // ── Column header helper ────────────────────────────────────────────────────
  const Th = ({ col, label, className = '' }: { col: SortKey; label: string; className?: string }) => (
    <th
      className={`px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide cursor-pointer select-none hover:text-gray-900 dark:hover:text-white whitespace-nowrap ${className}`}
      onClick={() => handleSort(col)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
      </span>
    </th>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activities</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            {filtered.length === runs.length
              ? `${runs.length} total runs`
              : `${filtered.length} of ${runs.length} runs`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportExcel}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
          <Link
            href="/runs/new"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Log Run
          </Link>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes, shoe, date…"
            value={filters.search}
            onChange={e => set('search', e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {filters.search && (
            <button onClick={() => set('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`relative flex items-center gap-2 py-2.5 px-4 rounded-lg border text-sm font-medium transition ${
            showFilters || activeFilterCount > 0
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Shoe</label>
              <select
                value={filters.shoeId}
                onChange={e => set('shoeId', e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All shoes</option>
                {shoes.map(s => (
                  <option key={s.id} value={s.id}>{s.nickname || `${s.brand} ${s.model}`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date from</label>
              <input type="date" value={filters.dateFrom} onChange={e => set('dateFrom', e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date to</label>
              <input type="date" value={filters.dateTo} onChange={e => set('dateTo', e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Distance (km)</label>
              <div className="flex gap-2 items-center">
                <input type="number" placeholder="Min" min="0" step="0.1" value={filters.distanceMin}
                  onChange={e => set('distanceMin', e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <span className="text-gray-400 text-sm shrink-0">–</span>
                <input type="number" placeholder="Max" min="0" step="0.1" value={filters.distanceMax}
                  onChange={e => set('distanceMax', e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Avg HR (bpm)</label>
              <div className="flex gap-2 items-center">
                <input type="number" placeholder="Min" min="0" value={filters.hrMin}
                  onChange={e => set('hrMin', e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <span className="text-gray-400 text-sm shrink-0">–</span>
                <input type="number" placeholder="Max" min="0" value={filters.hrMax}
                  onChange={e => set('hrMax', e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
          {activeFilterCount > 0 && (
            <div className="flex justify-end">
              <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                <X className="w-3.5 h-3.5" />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Summary stats bar */}
      {summary && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'Total Distance', value: `${summary.totalDist.toFixed(1)} km` },
            { label: 'Total Time', value: formatDuration(summary.totalDur) },
            { label: 'Avg Pace', value: fmtPace(summary.avgPace) },
            { label: 'Avg Heart Rate', value: summary.avgHr ? `${Math.round(summary.avgHr)} bpm` : '—' },
            { label: 'Total Elevation', value: `${summary.totalElev.toFixed(0)} m` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <Th col="date"          label="Date" />
                  <Th col="distance"      label="Distance" />
                  <Th col="duration"      label="Duration" />
                  <Th col="pace"          label="Pace" />
                  <Th col="avg_heart_rate" label="Avg HR" />
                  <Th col="max_heart_rate" label="Max HR" />
                  <Th col="elevation_gain" label="Elev ↑" />
                  <Th col="avg_speed"     label="Speed" />
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Shoe</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {filtered.map(run => (
                  <tr
                    key={run.id}
                    className="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors"
                  >
                    <td className="px-3 py-3 whitespace-nowrap">
                      <Link href={`/runs/${run.id}`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                        {run.date}
                      </Link>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-gray-900 dark:text-white font-medium">
                      {run.distance.toFixed(2)} km
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {formatDuration(run.duration)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {fmtPace(run.pace)}<span className="text-gray-400 text-xs ml-1">/km</span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {fmtHr(run.avg_heart_rate)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {fmtHr(run.max_heart_rate)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {fmtElev(run.elevation_gain)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {run.avg_speed != null ? `${run.avg_speed.toFixed(1)} km/h` : '—'}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-gray-600 dark:text-gray-400 text-xs">
                      {run.shoes
                        ? run.shoes.nickname || `${run.shoes.brand} ${run.shoes.model}`
                        : '—'}
                    </td>
                    <td className="px-3 py-3 max-w-xs text-gray-500 dark:text-gray-400 text-xs truncate">
                      {run.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : runs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No runs logged yet.</p>
          <Link href="/runs/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
            <Plus className="w-5 h-5" />
            Log Your First Run
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-3">No runs match your filters.</p>
          <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Clear filters</button>
        </div>
      )}
    </div>
  )
}
