// components/progress/ReportModal.tsx
'use client'

import { ProgressReport } from '@/types/database'
import { X, TrendingUp, TrendingDown, Minus, Calendar, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ReportModalProps {
  report: ProgressReport | null
  onClose: () => void
}

export function ReportModal({ report, onClose }: ReportModalProps) {
  if (!report) return null

  const getTrendIcon = () => {
    if (!report.key_insights?.trend) return <Minus className="w-5 h-5" />
    
    switch (report.key_insights.trend) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-600" />
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-600" />
      default:
        return <Minus className="w-5 h-5 text-gray-600" />
    }
  }

  const getTrendColor = () => {
    if (!report.key_insights?.trend) return 'gray'
    
    switch (report.key_insights.trend) {
      case 'improving':
        return 'green'
      case 'declining':
        return 'red'
      default:
        return 'gray'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Progress Report</h2>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(new Date(report.report_date), 'MMMM d, yyyy')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Trend Summary */}
          <div className={`bg-${getTrendColor()}-50 border border-${getTrendColor()}-200 rounded-lg p-6`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 bg-${getTrendColor()}-100 rounded-full flex items-center justify-center flex-shrink-0`}>
                {getTrendIcon()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Overall Trend: {report.key_insights?.trend || 'Stable'}
                </h3>
                <p className="text-sm text-gray-600 capitalize">
                  {report.report_type} Report
                </p>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          {report.key_insights && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Strengths */}
              {report.key_insights.strengths && report.key_insights.strengths.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">💪 Strengths</h4>
                  <ul className="space-y-1 text-sm text-green-800">
                    {report.key_insights.strengths.map((strength, idx) => (
                      <li key={idx}>• {strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas for Improvement */}
              {report.key_insights.improvement_areas && report.key_insights.improvement_areas.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-2">🎯 Focus Areas</h4>
                  <ul className="space-y-1 text-sm text-orange-800">
                    {report.key_insights.improvement_areas.map((area, idx) => (
                      <li key={idx}>• {area}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {report.key_insights.recommendations && report.key_insights.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Recommendations</h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    {report.key_insights.recommendations.map((rec, idx) => (
                      <li key={idx}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* AI Analysis */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Detailed Analysis</h3>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {report.analysis_text}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}