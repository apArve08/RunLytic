// components/streaks/StreakBadge.tsx
'use client'

import { Flame, Award } from 'lucide-react'

interface StreakBadgeProps {
  currentStreak: number
  longestStreak: number
}

export function StreakBadge({ currentStreak, longestStreak }: StreakBadgeProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Current Streak */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-sm text-gray-600 font-medium">Current Streak</div>
            <div className="text-3xl font-bold text-orange-600">{currentStreak}</div>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {currentStreak === 0 && "Start your streak today!"}
          {currentStreak === 1 && "Keep it going! 🔥"}
          {currentStreak >= 2 && currentStreak < 7 && "You're on fire! 🔥"}
          {currentStreak >= 7 && currentStreak < 30 && "Incredible consistency! 🔥🔥"}
          {currentStreak >= 30 && "Legendary streak! 🔥🔥🔥"}
        </div>
      </div>

      {/* Longest Streak */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-sm text-gray-600 font-medium">Longest Streak</div>
            <div className="text-3xl font-bold text-purple-600">{longestStreak}</div>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {currentStreak === longestStreak && currentStreak > 0 && "New personal best! 🏆"}
          {currentStreak < longestStreak && `${longestStreak - currentStreak} days to beat your record`}
          {longestStreak === 0 && "Start building your streak!"}
        </div>
      </div>
    </div>
  )
}