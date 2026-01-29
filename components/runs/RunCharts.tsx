// components/runs/RunCharts.tsx
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

export function RunCharts({ data }: { data: any[] }) {
  // We format the data to show distance or index on the X-axis
  const chartData = data.map((point, index) => ({
    name: index,
    elevation: point.altitude || point.elevation,
    heartRate: point.heart_rate,
  }))

  return (
    <div className="space-y-8">
      {/* Elevation Profile */}
      <div className="h-48 w-full">
        <p className="text-xs font-medium text-gray-500 mb-2 uppercase">Elevation Profile (m)</p>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorElev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" hide />
            <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
            <Tooltip 
              labelStyle={{ display: 'none' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area type="monotone" dataKey="elevation" stroke="#10b981" fillOpacity={1} fill="url(#colorElev)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Heart Rate Chart */}
      {chartData[0].heartRate && (
        <div className="h-48 w-full">
          <p className="text-xs font-medium text-gray-500 mb-2 uppercase">Heart Rate (bpm)</p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" hide />
              <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
              <Tooltip 
                labelStyle={{ display: 'none' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}