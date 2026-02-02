// app/(dashboard)/zones/page.tsx
'use client'

import { TrainingZones } from '@/components/zones/TrainingZones'
import { useEffect, useState } from 'react'

export default function ZonesPage() {
  const [runs, setRuns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRuns()
  }, [])

  const fetchRuns = async () => {
    try {
      const response = await fetch('/api/runs')
      const data = await response.json()
      setRuns(data.runs || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Training Zones</h1>
        <p className="text-gray-600 mt-1">
          Analyze your heart rate zones and training distribution
        </p>
      </div>

      <TrainingZones runs={runs} userAge={30} />
    </div>
  )
}