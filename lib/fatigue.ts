// lib/fatigue.ts — Training load & fatigue calculations

export type FatigueStatus = 'fresh' | 'optimal' | 'caution' | 'high-risk' | 'detraining'

export interface WeeklyLoad {
  weekLabel: string      // "Apr 14"
  weekStart: string      // ISO date
  distance: number       // km
  runs: number
  acwr: number | null    // ratio for that week end
}

export interface FatigueResult {
  status: FatigueStatus
  acwr: number | null           // current ratio
  acuteLoad: number             // last 7 days km
  chronicLoad: number           // 28-day avg weekly km
  consecutiveDays: number       // streak of run days
  daysSinceLastRun: number
  weeklySpike: number           // % vs 4-week avg (+ = increase)
  alerts: string[]
  tip: string
  weeklyLoads: WeeklyLoad[]     // last 16 weeks for chart
}

// ─── helpers ────────────────────────────────────────────────────────────────

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

// ─── main export ─────────────────────────────────────────────────────────────

export function computeFatigue(runs: { date: string; distance: number }[]): FatigueResult {
  const today = startOfDay(new Date())
  const sorted = [...runs].sort((a, b) => a.date.localeCompare(b.date))

  // ── Acute load: last 7 days ──────────────────────────────────────────────
  const day7ago = addDays(today, -7)
  const acuteLoad = sorted
    .filter(r => r.date >= isoDate(day7ago))
    .reduce((s, r) => s + r.distance, 0)

  // ── Chronic load: average weekly km over last 28 days ────────────────────
  const day28ago = addDays(today, -28)
  const chronicTotal = sorted
    .filter(r => r.date >= isoDate(day28ago))
    .reduce((s, r) => s + r.distance, 0)
  const chronicLoad = chronicTotal / 4  // 4-week average

  // ── ACWR ─────────────────────────────────────────────────────────────────
  const acwr = chronicLoad > 0 ? acuteLoad / chronicLoad : null

  // ── Consecutive run days ─────────────────────────────────────────────────
  const runDates = new Set(sorted.map(r => r.date))
  let consecutiveDays = 0
  let cursor = new Date(today)
  while (runDates.has(isoDate(cursor))) {
    consecutiveDays++
    cursor = addDays(cursor, -1)
  }

  // ── Days since last run ──────────────────────────────────────────────────
  let daysSinceLastRun = 0
  if (sorted.length > 0) {
    const last = sorted[sorted.length - 1].date
    const diff = today.getTime() - new Date(last).getTime()
    daysSinceLastRun = Math.floor(diff / 86400000)
  } else {
    daysSinceLastRun = 999
  }

  // ── Weekly spike vs 4-week avg ───────────────────────────────────────────
  const thisWeekLoad = acuteLoad
  const prevWeeksAvg = chronicLoad > 0
    ? sorted.filter(r => r.date >= isoDate(day28ago) && r.date < isoDate(day7ago))
            .reduce((s, r) => s + r.distance, 0) / 3
    : 0
  const weeklySpike = prevWeeksAvg > 0
    ? ((thisWeekLoad - prevWeeksAvg) / prevWeeksAvg) * 100
    : 0

  // ── Status ───────────────────────────────────────────────────────────────
  let status: FatigueStatus
  if (daysSinceLastRun >= 7) {
    status = 'detraining'
  } else if (acwr === null || acwr < 0.8) {
    status = acuteLoad === 0 ? 'detraining' : 'fresh'
  } else if (acwr <= 1.3 && consecutiveDays <= 5 && weeklySpike <= 15) {
    status = 'optimal'
  } else if (acwr <= 1.5 && consecutiveDays <= 6 && weeklySpike <= 25) {
    status = 'caution'
  } else {
    status = 'high-risk'
  }

  // ── Alerts ───────────────────────────────────────────────────────────────
  const alerts: string[] = []

  if (daysSinceLastRun >= 7) {
    alerts.push(`${daysSinceLastRun} days since your last run — easy miles recommended to get back in rhythm`)
  }
  if (consecutiveDays >= 6) {
    alerts.push(`${consecutiveDays} days running in a row — schedule a rest day soon`)
  } else if (consecutiveDays >= 5) {
    alerts.push(`${consecutiveDays} consecutive days — consider an easy or rest day tomorrow`)
  }
  if (weeklySpike > 25) {
    alerts.push(`This week's mileage is ${Math.round(weeklySpike)}% above your 4-week average — high injury risk`)
  } else if (weeklySpike > 15) {
    alerts.push(`Mileage up ${Math.round(weeklySpike)}% this week — keep the effort easy`)
  }
  if (acwr !== null && acwr > 1.5) {
    alerts.push(`ACWR is ${acwr.toFixed(2)} — well above the safe zone (0.8–1.3)`)
  }

  // ── Tip ──────────────────────────────────────────────────────────────────
  const tips: Record<FatigueStatus, string> = {
    fresh:       'Good time to add a quality session or long run',
    optimal:     'You\'re in the sweet spot — keep building steadily',
    caution:     'Stick to easy paces today; prioritise sleep and nutrition',
    'high-risk': 'Take a rest or recovery day — your body needs it',
    detraining:  'Start back with short, easy runs to rebuild your base',
  }
  const tip = tips[status]

  // ── 16-week load history for chart ───────────────────────────────────────
  const weeklyLoads: WeeklyLoad[] = []
  for (let i = 15; i >= 0; i--) {
    const weekEnd   = addDays(today, -i * 7)
    const weekStart = addDays(weekEnd, -6)
    const ws = isoDate(weekStart)
    const we = isoDate(weekEnd)

    const weekDist = sorted
      .filter(r => r.date >= ws && r.date <= we)
      .reduce((s, r) => s + r.distance, 0)

    // Chronic at week end = avg of the 4 weeks before it
    const chronicAtPoint = (() => {
      const from = isoDate(addDays(weekEnd, -28))
      const total = sorted.filter(r => r.date >= from && r.date <= we)
                          .reduce((s, r) => s + r.distance, 0)
      return total / 4
    })()

    const acuteAtPoint = sorted
      .filter(r => r.date >= isoDate(addDays(weekEnd, -7)) && r.date <= we)
      .reduce((s, r) => s + r.distance, 0)

    weeklyLoads.push({
      weekLabel: ws.slice(5).replace('-', '/'),
      weekStart: ws,
      distance: parseFloat(weekDist.toFixed(1)),
      runs: sorted.filter(r => r.date >= ws && r.date <= we).length,
      acwr: chronicAtPoint > 0 ? parseFloat((acuteAtPoint / chronicAtPoint).toFixed(2)) : null,
    })
  }

  return {
    status, acwr: acwr ? parseFloat(acwr.toFixed(2)) : null,
    acuteLoad: parseFloat(acuteLoad.toFixed(1)),
    chronicLoad: parseFloat(chronicLoad.toFixed(1)),
    consecutiveDays, daysSinceLastRun,
    weeklySpike: parseFloat(weeklySpike.toFixed(1)),
    alerts, tip, weeklyLoads,
  }
}

// ─── UI helpers ──────────────────────────────────────────────────────────────

export const FATIGUE_META: Record<FatigueStatus, {
  label: string
  color: string
  bg: string
  border: string
  dot: string
}> = {
  fresh:       { label: 'Fresh',      color: 'text-sky-700 dark:text-sky-400',    bg: 'bg-sky-50 dark:bg-sky-900/20',     border: 'border-sky-200 dark:border-sky-800',   dot: 'bg-sky-400' },
  optimal:     { label: 'Optimal',    color: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', dot: 'bg-green-500' },
  caution:     { label: 'Caution',    color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', dot: 'bg-yellow-400' },
  'high-risk': { label: 'High Risk',  color: 'text-red-700 dark:text-red-400',    bg: 'bg-red-50 dark:bg-red-900/20',     border: 'border-red-200 dark:border-red-800',   dot: 'bg-red-500' },
  detraining:  { label: 'Detraining', color: 'text-gray-600 dark:text-gray-400',  bg: 'bg-gray-50 dark:bg-gray-800',      border: 'border-gray-200 dark:border-gray-700', dot: 'bg-gray-400' },
}
