// components/schedule/ScheduleGenerator.tsx
'use client'

import { useState } from 'react'
import { Calendar, Target, Zap, Clock } from 'lucide-react'
import { addWeeks, format } from 'date-fns'

interface ScheduleGeneratorProps {
  onGenerate: () => void
}

export function ScheduleGenerator({ onGenerate }: ScheduleGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    goal_type: '5K',
    weeks: 8,
    target_date: '',
    current_weekly_km: 20,
    running_days_per_week: 4,
    experience_level: 'intermediate',
  })

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    try {
      const response = await fetch('/api/schedule-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Schedule generated! ${data.scheduled_runs} runs planned.`)
        onGenerate()
      } else {
        alert(data.error || 'Failed to generate schedule')
      }
    } catch (error) {
      console.error('Error generating schedule:', error)
      alert('Failed to generate schedule')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">
          AI Schedule Generator
        </h2>
      </div>

      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Goal Type */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Target className="w-4 h-4" />
            Training Goal
          </label>
          <select
            value={formData.goal_type}
            onChange={(e) => setFormData({ ...formData, goal_type: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="5K">5K Race</option>
            <option value="10K">10K Race</option>
            <option value="HALF">Half Marathon</option>
            <option value="FULL">Full Marathon</option>
            <option value="BASE_BUILDING">Base Building</option>
            <option value="CUSTOM">Custom Plan</option>
          </select>
        </div>

        {/* Weeks & Target Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4" />
              Training Duration (weeks)
            </label>
            <input
              type="number"
              min="4"
              max="24"
              value={formData.weeks}
              onChange={(e) =>
                setFormData({ ...formData, weeks: parseInt(e.target.value) })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              Target Date (optional)
            </label>
            <input
              type="date"
              value={formData.target_date}
              onChange={(e) =>
                setFormData({ ...formData, target_date: e.target.value })
              }
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Current Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Weekly Distance (km)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.current_weekly_km}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  current_weekly_km: parseFloat(e.target.value),
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Running Days per Week
            </label>
            <select
              value={formData.running_days_per_week}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  running_days_per_week: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={3}>3 days</option>
              <option value={4}>4 days</option>
              <option value={5}>5 days</option>
              <option value={6}>6 days</option>
            </select>
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['beginner', 'intermediate', 'advanced'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, experience_level: level })
                }
                className={`
                  px-4 py-3 rounded-lg border-2 font-medium transition
                  ${
                    formData.experience_level === level
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 The AI will analyze your running history and generate a
            personalized {formData.weeks}-week plan starting from next Monday (
            {format(
              addWeeks(new Date(), 0).setDate(
                new Date().getDate() + ((8 - new Date().getDay()) % 7 || 7)
              ),
              'MMM d, yyyy'
            )}
            ).
          </p>
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={isGenerating}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating Your Plan...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Generate Training Schedule
            </>
          )}
        </button>
      </form>
    </div>
  )
}