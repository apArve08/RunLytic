// components/monthly/GoalProgress.tsx
'use client'

import { useState } from 'react'
import { Target, Edit2, Check, X } from 'lucide-react'
import { Goal } from '@/types/database'

interface GoalProgressProps {
  currentDistance: number
  currentRuns: number
  goal: Goal | null
  month: string
  onGoalUpdate: () => void
}

export function GoalProgress({ currentDistance, currentRuns, goal, month, onGoalUpdate }: GoalProgressProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [targetDistance, setTargetDistance] = useState(goal?.target_distance?.toString() || '')
  const [targetRuns, setTargetRuns] = useState(goal?.target_runs?.toString() || '')
  const [saving, setSaving] = useState(false)

  const distanceProgress = goal?.target_distance 
    ? Math.min((currentDistance / goal.target_distance) * 100, 100)
    : 0

  const runsProgress = goal?.target_runs
    ? Math.min((currentRuns / goal.target_runs) * 100, 100)
    : 0

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month,
          target_distance: targetDistance ? parseFloat(targetDistance) : null,
          target_runs: targetRuns ? parseInt(targetRuns) : null,
        }),
      })
      setIsEditing(false)
      onGoalUpdate()
    } catch (error) {
      console.error('Error saving goal:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Monthly Goals</h3>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Edit2 className="w-4 h-4" />
            {goal ? 'Edit' : 'Set Goals'}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Distance (km)
            </label>
            <input
              type="number"
              step="0.1"
              value={targetDistance}
              onChange={(e) => setTargetDistance(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., 100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Runs
            </label>
            <input
              type="number"
              value={targetRuns}
              onChange={(e) => setTargetRuns(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., 12"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {goal?.target_distance ? (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Distance</span>
                <span className="font-semibold text-gray-900">
                  {currentDistance.toFixed(1)} / {goal.target_distance} km
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${distanceProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {distanceProgress >= 100 ? '🎉 Goal achieved!' : `${(100 - distanceProgress).toFixed(0)}% to go`}
              </p>
            </div>
          ) : null}

          {goal?.target_runs ? (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Runs</span>
                <span className="font-semibold text-gray-900">
                  {currentRuns} / {goal.target_runs} runs
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all"
                  style={{ width: `${runsProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {runsProgress >= 100 ? '🎉 Goal achieved!' : `${goal.target_runs - currentRuns} more to go`}
              </p>
            </div>
          ) : null}

          {!goal && (
            <p className="text-gray-500 text-center py-4">
              No goals set for this month
            </p>
          )}
        </div>
      )}
    </div>
  )
}