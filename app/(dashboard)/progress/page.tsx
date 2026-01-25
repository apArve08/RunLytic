// app/(dashboard)/progress/page.tsx (COMPLETE REPLACEMENT)
'use client'

import { useEffect, useState } from 'react'
import { ProgressAnalysis } from '@/components/progress/ProgressAnalysis'
import { ReportModal } from '@/components/progress/ReportModal'
import { ProgressReport } from '@/types/database'
import { format } from 'date-fns'
import { TrendingUp, Calendar, Eye, Trash2, TrendingDown, Minus } from 'lucide-react'
import { CompareReports } from '@/components/progress/CompareReports'
import { RacePredictor } from '@/components/race/RacePredictor'

export default function ProgressPage() {
  const [pastReports, setPastReports] = useState<ProgressReport[]>([])
  const [selectedReport, setSelectedReport] = useState<ProgressReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchPastReports()
  }, [])

  const fetchPastReports = async () => {
    try {
      const response = await fetch('/api/ai-progress')
      const data = await response.json()
      setPastReports(data.reports || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return

    setDeleting(reportId)
    try {
      const response = await fetch(`/api/ai-progress?id=${reportId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPastReports(pastReports.filter(r => r.id !== reportId))
      } else {
        alert('Failed to delete report')
      }
    } catch (error) {
      console.error('Error deleting report:', error)
      alert('Failed to delete report')
    } finally {
      setDeleting(null)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  const getTrendBadge = (trend: string) => {
    const badges = {
      improving: 'bg-green-100 text-green-700 border-green-200',
      declining: 'bg-red-100 text-red-700 border-red-200',
      stable: 'bg-gray-100 text-gray-700 border-gray-200',
    }
    return badges[trend as keyof typeof badges] || badges.stable
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Progress Tracking</h1>
        <p className="text-gray-600 mt-1">AI-powered insights on your running performance</p>
      </div>

      {/* Main Analysis */}
      <ProgressAnalysis onGenerate={fetchPastReports} />


      {/* Past Reports */}
      {pastReports.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Past Reports ({pastReports.length})
          </h3>
          <div className="space-y-3">
            {pastReports.map(report => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition group"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Icon */}
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="font-medium text-gray-900 capitalize">
                        {report.report_type} Report
                      </div>
                      {report.key_insights?.trend && (
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getTrendBadge(report.key_insights.trend)}`}>
                          {getTrendIcon(report.key_insights.trend)}
                          {report.key_insights.trend}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(report.report_date), 'MMMM d, yyyy')} •{' '}
                      {format(new Date(report.created_at), 'h:mm a')}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Report
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      disabled={deleting === report.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                      title="Delete report"
                    >
                      {deleting === report.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <RacePredictor />

      {/* Report Modal */}
      <ReportModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />


{pastReports.length >= 2 && (
  <CompareReports reports={pastReports} />
)}
    </div>
    
  )
}
