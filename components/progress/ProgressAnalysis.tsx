// components/progress/ProgressAnalysis.tsx
'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Sparkles, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface TrendData {
  month: string
  distance: string
  runs: number
  avgPace: string
}

interface ProgressAnalysisProps {
  onGenerate?: () => void
}

export function ProgressAnalysis({ onGenerate }: ProgressAnalysisProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [report, setReport] = useState<any>(null)
  const [trends, setTrends] = useState<TrendData[]>([])
  const [stats, setStats] = useState<any>(null)
  const [months, setMonths] = useState(3)

  const generateReport = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ months }),
      })

      const data = await response.json()

      if (response.ok) {
        setReport(data.report)
        setTrends(data.trends)
        setStats(data.stats)
        onGenerate?.()
      } else {
        alert(data.error || 'Failed to generate report')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate progress report')
    } finally {
      setIsGenerating(false)
    }
  }

  const getTrendIcon = () => {
    if (!report?.key_insights?.trend) return <Minus className="w-5 h-5" />
    
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
    if (!report?.key_insights?.trend) return 'gray'
    
    switch (report.key_insights.trend) {
      case 'improving':
        return 'green'
      case 'declining':
        return 'red'
      default:
        return 'gray'
    }
  }

  // Format trends for chart
  const chartData = trends.map(t => ({
    month: t.month,
    distance: parseFloat(t.distance),
    runs: t.runs,
    pace: parseFloat(t.avgPace),
  }))

  return (
    <div className="space-y-6">
      {/* Generate Button */}
      {!report && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-8 text-center">
          <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Generate AI Progress Report
          </h3>
          <p className="text-gray-600 mb-6">
            Get personalized insights on your running performance over time
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Analyze last
            </label>
            <select
              value={months}
              onChange={(e) => setMonths(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value={1}>1 month</option>
              <option value={2}>2 months</option>
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
            </select>
          </div>

          <button
            onClick={generateReport}
            disabled={isGenerating}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition inline-flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Report
              </>
            )}
          </button>
        </div>
      )}

      {/* Report Display */}
      {report && (
        <>
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
                <p className="text-sm text-gray-600">
                  Report generated on {format(new Date(report.created_at), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-2xl font-bold text-gray-900">{stats.totalDistance}</div>
                <div className="text-xs text-gray-500 mt-1">Total km</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-2xl font-bold text-gray-900">{stats.totalRuns}</div>
                <div className="text-xs text-gray-500 mt-1">Total Runs</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-2xl font-bold text-gray-900">{stats.avgDistance}</div>
                <div className="text-xs text-gray-500 mt-1">Avg km/Run</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-2xl font-bold text-gray-900">{stats.avgPace}</div>
                <div className="text-xs text-gray-500 mt-1">Avg Pace</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-2xl font-bold text-gray-900">{stats.bestPace}</div>
                <div className="text-xs text-gray-500 mt-1">Best Pace</div>
              </div>
            </div>
          )}

          {/* Trend Charts */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
              
              {/* Distance Chart */}
              <div className="mb-8">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Distance (km)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" style={{ fontSize: '12px' }} />
                    <YAxis style={{ fontSize: '12px' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="distance" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Pace Chart */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Average Pace (min/km)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" style={{ fontSize: '12px' }} />
                    <YAxis style={{ fontSize: '12px' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="pace" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* AI Analysis */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">AI Analysis</h3>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {report.analysis_text}
              </p>
            </div>
          </div>

          {/* Generate New Report */}
          <div className="text-center">
            <button
              onClick={generateReport}
              disabled={isGenerating}
              className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate New Report
            </button>
          </div>
        </>
      )}
    </div>
  )
}