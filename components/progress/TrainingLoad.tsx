'use client'

import { useMemo } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts'
import { AlertTriangle, CheckCircle, Info, Flame, Zap, Moon, Shield } from 'lucide-react'
import { computeFatigue, FATIGUE_META, type FatigueStatus } from '@/lib/fatigue'

interface Props {
  runs: { date: string; distance: number }[]
}

// ─── ACWR zone bands for the chart tooltip ────────────────────────────────

function acwrColor(acwr: number | null): string {
  if (acwr === null) return '#9ca3af'
  if (acwr < 0.8)    return '#60a5fa'   // fresh / detraining
  if (acwr <= 1.3)   return '#22c55e'   // optimal
  if (acwr <= 1.5)   return '#facc15'   // caution
  return '#ef4444'                       // high risk
}

const CustomACWRDot = (props: any) => {
  const { cx, cy, payload } = props
  if (payload.acwr === null) return null
  return <circle cx={cx} cy={cy} r={4} fill={acwrColor(payload.acwr)} stroke="white" strokeWidth={1.5} />
}

// ─── Component ────────────────────────────────────────────────────────────

export function TrainingLoad({ runs }: Props) {
  const f = useMemo(() => computeFatigue(runs), [runs])
  const meta = FATIGUE_META[f.status]

  if (runs.length < 3) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
        <Shield className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="font-medium text-gray-700 dark:text-gray-300">Not enough data yet</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Log at least 3 runs to see training load analysis.</p>
      </div>
    )
  }

  const StatusIcon = { fresh: Zap, optimal: Flame, caution: AlertTriangle, 'high-risk': AlertTriangle, detraining: Moon }[f.status]

  return (
    <div className="space-y-5">

      {/* ── Status overview ─────────────────────────────────────────── */}
      <div className={`rounded-xl border p-5 ${meta.bg} ${meta.border}`}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          {/* Left: status */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/60 dark:bg-black/20 flex items-center justify-center">
              <StatusIcon className={`w-6 h-6 ${meta.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-xl font-bold ${meta.color}`}>{meta.label}</h3>
                <span className={`w-2.5 h-2.5 rounded-full ${meta.dot}`} />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{f.tip}</p>
            </div>
          </div>

          {/* Right: key metrics */}
          <div className="flex gap-4 text-center">
            <MetricPill label="ACWR" value={f.acwr !== null ? f.acwr.toFixed(2) : '—'} sub="ratio" />
            <MetricPill label="7-day" value={`${f.acuteLoad} km`} sub="acute load" />
            <MetricPill label="4-wk avg" value={`${f.chronicLoad} km`} sub="chronic load" />
            {f.weeklySpike !== 0 && (
              <MetricPill
                label="Spike"
                value={`${f.weeklySpike > 0 ? '+' : ''}${f.weeklySpike}%`}
                sub="vs avg week"
                highlight={Math.abs(f.weeklySpike) > 15}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Alerts ──────────────────────────────────────────────────── */}
      {f.alerts.length > 0 && (
        <div className="space-y-2">
          {f.alerts.map((a, i) => (
            <div key={i} className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800 dark:text-yellow-300">{a}</p>
            </div>
          ))}
        </div>
      )}
      {f.alerts.length === 0 && (
        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3">
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
          <p className="text-sm text-green-800 dark:text-green-300">No alerts — your training load looks balanced.</p>
        </div>
      )}

      {/* ── Weekly load chart ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-gray-900 dark:text-white">Weekly Load — last 16 weeks</h4>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Info className="w-3.5 h-3.5" />
            Bars = weekly km · Line = chronic avg
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Week starting date</p>

        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={f.weeklyLoads} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
            <XAxis dataKey="weekLabel" tick={{ fontSize: 10, fill: '#9ca3af' }} interval={1} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              formatter={(v: any, name) =>
                name === 'distance' ? [`${v} km`, 'Weekly km'] :
                name === 'chronic'  ? [`${Number(v).toFixed(1)} km`, '4-wk avg'] : [v, name]
              }
            />
            <Bar dataKey="distance" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={28} opacity={0.85} />
            <Line
              dataKey="chronic"
              data={f.weeklyLoads.map(w => ({ ...w, chronic: w.acwr !== null ? f.chronicLoad : null }))}
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 2"
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── ACWR chart ───────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-gray-900 dark:text-white">Acute:Chronic Workload Ratio</h4>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Info className="w-3.5 h-3.5" />
            Safe zone: 0.8 – 1.3
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Higher = more stress vs your baseline</p>

        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={f.weeklyLoads} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
            <XAxis dataKey="weekLabel" tick={{ fontSize: 10, fill: '#9ca3af' }} interval={1} />
            <YAxis domain={[0, 2.2]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              formatter={(v: any) => [v !== null ? v.toFixed(2) : '—', 'ACWR']}
            />
            {/* Zone bands as reference lines */}
            <ReferenceLine y={0.8} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: '0.8', position: 'insideTopLeft', fontSize: 10, fill: '#22c55e' }} />
            <ReferenceLine y={1.3} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: '1.3', position: 'insideTopLeft', fontSize: 10, fill: '#22c55e' }} />
            <ReferenceLine y={1.5} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: '1.5 ⚠', position: 'insideTopLeft', fontSize: 10, fill: '#ef4444' }} />
            <Line
              dataKey="acwr"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={<CustomACWRDot />}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
          {[
            { color: 'bg-sky-400',    label: '< 0.8 Fresh / Detraining' },
            { color: 'bg-green-500',  label: '0.8–1.3 Optimal zone' },
            { color: 'bg-yellow-400', label: '1.3–1.5 Caution' },
            { color: 'bg-red-500',    label: '> 1.5 High risk' },
          ].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── ACWR guide ───────────────────────────────────────────────── */}
      <details className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
        <summary className="px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
          What is ACWR?
        </summary>
        <div className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p>
            The <strong>Acute:Chronic Workload Ratio</strong> compares your recent training stress
            (last 7 days) to your long-term fitness base (28-day average weekly load).
          </p>
          <p>
            Research shows that staying between <strong>0.8 and 1.3</strong> minimises injury risk
            while still allowing fitness gains. Jumping above <strong>1.5</strong> is associated with
            a significantly higher chance of overuse injury.
          </p>
          <p>The 10% rule is also tracked — your weekly mileage should not increase more than ~10–15% per week.</p>
        </div>
      </details>
    </div>
  )
}

function MetricPill({ label, value, sub, highlight = false }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg px-3 py-2 text-center bg-white/70 dark:bg-black/20 ${highlight ? 'ring-1 ring-yellow-400' : ''}`}>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-base font-bold ${highlight ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-white'}`}>{value}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  )
}
