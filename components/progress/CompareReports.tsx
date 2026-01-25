// components/progress/CompareReports.tsx
'use client'

import { useState } from 'react'
import { ProgressReport } from '@/types/database'
import { ArrowRight, X } from 'lucide-react'
import { format } from 'date-fns'

interface CompareReportsProps {
  reports: ProgressReport[]
}

export function CompareReports({ reports }: CompareReportsProps) {
  const [report1, setReport1] = useState<string>('')
  const [report2, setReport2] = useState<string>('')

  const selectedReport1 = reports.find(r => r.id === report1)
  const selectedReport2 = reports.find(r => r.id === report2)

  if (reports.length < 2) return null

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Compare Reports</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Report
          </label>
          <select
            value={report1}
            onChange={(e) => setReport1(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select a report...</option>
            {reports.map(report => (
              <option key={report.id} value={report.id}>
                {format(new Date(report.report_date), 'MMM d, yyyy')} - {report.report_type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Second Report
          </label>
          <select
            value={report2}
            onChange={(e) => setReport2(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select a report...</option>
            {reports.filter(r => r.id !== report1).map(report => (
              <option key={report.id} value={report.id}>
                {format(new Date(report.report_date), 'MMM d, yyyy')} - {report.report_type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedReport1 && selectedReport2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Report 1 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              {format(new Date(selectedReport1.report_date), 'MMMM d, yyyy')}
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Trend:</span>
                <span className="ml-2 font-medium capitalize">
                  {selectedReport1.key_insights?.trend || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-gray-400" />
          </div>

          {/* Report 2 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              {format(new Date(selectedReport2.report_date), 'MMMM d, yyyy')}
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Trend:</span>
                <span className="ml-2 font-medium capitalize">
                  {selectedReport2.key_insights?.trend || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}