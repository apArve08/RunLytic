// app/(dashboard)/stats-widget/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { StatsWidget } from '@/components/stats/StatsWidget'

export default function StatsWidgetPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/weekly-comparison')
      const data = await response.json()
      setData(data)
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
        <h1 className="text-3xl font-bold text-gray-900">Stats Widget</h1>
        <p className="text-gray-600 mt-1">
          Share your running stats on social media
        </p>
      </div>

      {data && (
        <div className="flex justify-center">
          <StatsWidget data={data} userName="Your Name" />
        </div>
      )}
    </div>
  )
}