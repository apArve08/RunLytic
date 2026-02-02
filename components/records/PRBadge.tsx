// components/records/PRBadge.tsx
'use client'

import { Trophy, TrendingUp } from 'lucide-react'

interface PRBadgeProps {
  type: 'new' | 'current'
  recordType?: string
}

export function PRBadge({ type, recordType }: PRBadgeProps) {
  if (type === 'new') {
    return (
      <div className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
        <Trophy className="w-3 h-3" />
        NEW PR!
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
      <Trophy className="w-3 h-3" />
      {recordType}
    </div>
  )
}