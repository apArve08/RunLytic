// app/(dashboard)/records/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Trophy, TrendingUp, Calendar, ExternalLink } from 'lucide-react'
import { formatDuration, formatPace, formatDistance } from '@/lib/utils'
import Link from 'next/link'

export default function RecordsPage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/personal-records')
      const data = await response.json()
      setRecords(data.records || [])
    } catch (error) {
      console.error('Error fetching records:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRecordLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      '5K': 'Fastest 5K',
      '10K': 'Fastest 10K',
      'HALF': 'Fastest Half Marathon',
      'FULL': 'Fastest Marathon',
      'LONGEST': 'Longest Run',
      'FASTEST_PACE': 'Fastest Pace',
    }
    return labels[type] || type
  }

  const formatValue = (type: string, value: number) => {
    if (type === 'FASTEST_PACE') {
      return formatPace(value)
    } else if (type === 'LONGEST') {
      return formatDistance(value)
    } else {
      return formatDuration(value)
    }
  }

  const getIcon = (type: string) => {
    if (type === 'LONGEST') return '📏'
    if (type === 'FASTEST_PACE') return '⚡'
    return '🏆'
  }

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Personal Records</h1>
        <p className="text-gray-600 mt-1">Your best performances across all distances</p>
      </div>

      {records.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No personal records yet</p>
          <p className="text-sm text-gray-400">
            Keep running to set your first PRs!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record) => (
            <div
              key={record.id}
              className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{getIcon(record.record_type)}</div>
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {getRecordLabel(record.record_type)}
              </h3>

              <div className="text-3xl font-bold text-yellow-700 mb-3">
                {formatValue(record.record_type, record.value)}
              </div>

              {record.previous_record && (
                <div className="flex items-center gap-2 text-sm text-green-600 mb-3">
                  <TrendingUp className="w-4 h-4" />
                  <span>
                    {record.record_type === 'LONGEST'
                      ? `+${(record.value - record.previous_record).toFixed(2)} km`
                      : `${((record.previous_record - record.value) / record.previous_record * 100).toFixed(1)}% faster`}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(record.achieved_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {record.run && (
                <Link
                  href={`/runs/${record.run.id}`}
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View run
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}