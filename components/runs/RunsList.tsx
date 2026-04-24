'use client'

import { useState, useMemo } from 'react'
import { Run, Shoe } from '@/types/database'
import { RunCard } from '@/components/dashboard/RunCard'
import Link from 'next/link'
import { Plus, Search, SlidersHorizontal, X } from 'lucide-react'

interface RunsListProps {
  runs: Run[]
  shoes: Shoe[]
}

type SortOption = 'date_desc' | 'date_asc' | 'distance_desc' | 'distance_asc' | 'pace_asc' | 'pace_desc'

interface Filters {
  search: string
  shoeId: string
  dateFrom: string
  dateTo: string
  distanceMin: string
  distanceMax: string
  sort: SortOption
}

const defaultFilters: Filters = {
  search: '',
  shoeId: '',
  dateFrom: '',
  dateTo: '',
  distanceMin: '',
  distanceMax: '',
  sort: 'date_desc',
}

export function RunsList({ runs, shoes }: RunsListProps) {
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)

  const set = (key: keyof Filters, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }))

  const activeFilterCount = [
    filters.shoeId,
    filters.dateFrom,
    filters.dateTo,
    filters.distanceMin,
    filters.distanceMax,
  ].filter(Boolean).length

  const filteredRuns = useMemo(() => {
    let result = [...runs]

    // Text search — notes
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (r) =>
          r.notes?.toLowerCase().includes(q) ||
          r.date.includes(q) ||
          r.shoes?.brand?.toLowerCase().includes(q) ||
          r.shoes?.model?.toLowerCase().includes(q) ||
          r.shoes?.nickname?.toLowerCase().includes(q)
      )
    }

    // Shoe filter
    if (filters.shoeId) {
      result = result.filter((r) => r.shoes_id === filters.shoeId)
    }

    // Date range
    if (filters.dateFrom) {
      result = result.filter((r) => r.date >= filters.dateFrom)
    }
    if (filters.dateTo) {
      result = result.filter((r) => r.date <= filters.dateTo)
    }

    // Distance range
    if (filters.distanceMin) {
      result = result.filter((r) => r.distance >= parseFloat(filters.distanceMin))
    }
    if (filters.distanceMax) {
      result = result.filter((r) => r.distance <= parseFloat(filters.distanceMax))
    }

    // Sort
    result.sort((a, b) => {
      switch (filters.sort) {
        case 'date_desc':   return b.date.localeCompare(a.date)
        case 'date_asc':    return a.date.localeCompare(b.date)
        case 'distance_desc': return b.distance - a.distance
        case 'distance_asc':  return a.distance - b.distance
        case 'pace_asc':   return a.pace - b.pace
        case 'pace_desc':  return b.pace - a.pace
        default:            return 0
      }
    })

    return result
  }, [runs, filters])

  const clearFilters = () => setFilters(defaultFilters)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Runs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {filteredRuns.length === runs.length
              ? `${runs.length} total runs`
              : `${filteredRuns.length} of ${runs.length} runs`}
          </p>
        </div>
        <Link
          href="/runs/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Log Run
        </Link>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by notes, shoe, date…"
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {filters.search && (
            <button
              onClick={() => set('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={(e) => set('sort', e.target.value as SortOption)}
          className="py-2.5 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
          <option value="distance_desc">Longest first</option>
          <option value="distance_asc">Shortest first</option>
          <option value="pace_asc">Fastest pace</option>
          <option value="pace_desc">Slowest pace</option>
        </select>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters((v) => !v)}
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

      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Shoe */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Shoe
              </label>
              <select
                value={filters.shoeId}
                onChange={(e) => set('shoeId', e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All shoes</option>
                {shoes.map((shoe) => (
                  <option key={shoe.id} value={shoe.id}>
                    {shoe.nickname || `${shoe.brand} ${shoe.model}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Date from
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => set('dateFrom', e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Date to
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => set('dateTo', e.target.value)}
                className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Distance range */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Distance (km)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  step="0.1"
                  value={filters.distanceMin}
                  onChange={(e) => set('distanceMin', e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400 text-sm">–</span>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  step="0.1"
                  value={filters.distanceMax}
                  onChange={(e) => set('distanceMax', e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Clear */}
          {activeFilterCount > 0 && (
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {filteredRuns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRuns.map((run) => (
            <RunCard key={run.id} run={run} />
          ))}
        </div>
      ) : runs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No runs logged yet</p>
          <Link
            href="/runs/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Log Your First Run
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-3">No runs match your filters</p>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
