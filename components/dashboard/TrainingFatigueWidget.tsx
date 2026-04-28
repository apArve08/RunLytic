'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { AlertTriangle, Flame, TrendingUp, Zap, Moon, ChevronRight } from 'lucide-react'
import { computeFatigue, FATIGUE_META } from '@/lib/fatigue'

interface Props {
  runs: { date: string; distance: number }[]
}

export function TrainingFatigueWidget({ runs }: Props) {
  const f = useMemo(() => computeFatigue(runs), [runs])
  const meta = FATIGUE_META[f.status]

  const StatusIcon = {
    fresh: Zap,
    optimal: Flame,
    caution: AlertTriangle,
    'high-risk': AlertTriangle,
    detraining: Moon,
  }[f.status]

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${meta.bg} ${meta.border}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Training Load</span>
        </div>
        <Link
          href="/progress"
          className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
        >
          Details <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Status row */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/60 dark:bg-black/20`}>
          <StatusIcon className={`w-5 h-5 ${meta.color}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${meta.color}`}>{meta.label}</span>
            <span className={`w-2.5 h-2.5 rounded-full ${meta.dot}`} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{f.tip}</p>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white/60 dark:bg-black/20 rounded-lg py-2">
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {f.acwr !== null ? f.acwr.toFixed(2) : '—'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">ACWR</p>
        </div>
        <div className="bg-white/60 dark:bg-black/20 rounded-lg py-2">
          <p className="text-sm font-bold text-gray-900 dark:text-white">{f.acuteLoad} km</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">7-day</p>
        </div>
        <div className="bg-white/60 dark:bg-black/20 rounded-lg py-2">
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {f.consecutiveDays > 0 ? `${f.consecutiveDays}d` : f.daysSinceLastRun > 0 ? `+${f.daysSinceLastRun}d` : '—'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {f.consecutiveDays > 0 ? 'streak' : 'rest'}
          </p>
        </div>
      </div>

      {/* Top alert */}
      {f.alerts.length > 0 && (
        <div className="flex items-start gap-2 bg-white/60 dark:bg-black/20 rounded-lg px-3 py-2">
          <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${meta.color}`} />
          <p className="text-xs text-gray-700 dark:text-gray-300">{f.alerts[0]}</p>
        </div>
      )}
    </div>
  )
}
