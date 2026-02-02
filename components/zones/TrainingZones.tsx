// components/zones/TrainingZones.tsx
'use client'

import { useState, useMemo } from 'react'
import { Run } from '@/types/database'
import { Heart, TrendingUp, Award, Settings } from 'lucide-react'
import { getZoneBoundaries, calculate8020Compliance } from '@/lib/zones'

interface TrainingZonesProps {
  runs: Run[]
  userAge?: number
}

export function TrainingZones({ runs, userAge = 30 }: TrainingZonesProps) {
  const [maxHR, setMaxHR] = useState(220 - userAge)
  const [showSettings, setShowSettings] = useState(false)

  const runsWithHR = runs.filter(r => r.avg_heart_rate && r.avg_heart_rate > 0)

  const zoneAnalysis = useMemo(() => {
    if (runsWithHR.length === 0) return null

    const zones = getZoneBoundaries(maxHR)

    // Classify runs by zone based on average HR
    const zoneDistribution = {
      Z1: 0,
      Z2: 0,
      Z3: 0,
      Z4: 0,
      Z5: 0,
    }

    let totalDuration = 0

    runsWithHR.forEach(run => {
      const hr = run.avg_heart_rate!
      const duration = run.duration
      totalDuration += duration

      if (hr >= zones.Z5.min) {
        zoneDistribution.Z5 += duration
      } else if (hr >= zones.Z4.min) {
        zoneDistribution.Z4 += duration
      } else if (hr >= zones.Z3.min) {
        zoneDistribution.Z3 += duration
      } else if (hr >= zones.Z2.min) {
        zoneDistribution.Z2 += duration
      } else {
        zoneDistribution.Z1 += duration
      }
    })

    const zoneData = Object.entries(zones).map(([zone, data]) => ({
      zone: zone as any,
      ...data,
      duration: zoneDistribution[zone as keyof typeof zoneDistribution],
      percentage: totalDuration > 0 
        ? (zoneDistribution[zone as keyof typeof zoneDistribution] / totalDuration) * 100 
        : 0,
    }))

    const easyPercentage = totalDuration > 0
      ? ((zoneDistribution.Z1 + zoneDistribution.Z2) / totalDuration) * 100
      : 0
    const hardPercentage = 100 - easyPercentage

    return {
      zoneData,
      easyPercentage,
      hardPercentage,
      totalDuration,
      zones,
    }
  }, [runsWithHR, maxHR])

  if (runsWithHR.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <Heart className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
        <p className="text-gray-700 mb-2 font-medium">No heart rate data available</p>
        <p className="text-sm text-gray-600 mb-4">
          Add heart rate data to your runs to see training zone analysis
        </p>
        <div className="bg-white rounded-lg p-4 text-left max-w-md mx-auto">
          <p className="text-sm text-gray-700 mb-2">
            <strong>How to add heart rate data:</strong>
          </p>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>When logging a run, click "Show Advanced Data"</li>
            <li>Enter your average and max heart rate</li>
            <li>Or import runs from Strava with HR data</li>
          </ol>
        </div>
      </div>
    )
  }

  if (!zoneAnalysis) return null

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <div className="space-y-6">
      {/* Max HR Setting */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Training Zones</h3>
            <p className="text-sm text-gray-600 mt-1">
              Based on {runsWithHR.length} run{runsWithHR.length !== 1 ? 's' : ''} with heart rate data
            </p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-700 font-medium">Max Heart Rate:</label>
              <input
                type="number"
                value={maxHR}
                onChange={(e) => setMaxHR(parseInt(e.target.value) || 180)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                min="100"
                max="220"
              />
              <span className="text-sm text-gray-600">bpm</span>
              <button
                onClick={() => setMaxHR(220 - userAge)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Reset to default (220 - age)
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Adjust your max HR for more accurate zone calculations
            </p>
          </div>
        )}

        {/* Zone Bars */}
        <div className="space-y-3 mb-6">
          {zoneAnalysis.zoneData.map(zone => (
            <div key={zone.zone}>
              <div className="flex items-center justify-between mb-2 text-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded ${zone.color}`} />
                  <span className="font-semibold min-w-[40px]">{zone.zone}</span>
                  <span className="text-gray-700">{zone.name}</span>
                  <span className="text-gray-500">({zone.min}-{zone.max} bpm)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-xs">
                    {formatDuration(zone.duration)}
                  </span>
                  <span className="font-medium text-gray-700 min-w-[50px] text-right">
                    {zone.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                <div
                  className={`h-8 rounded-full ${zone.color} transition-all duration-500 flex items-center justify-center`}
                  style={{ width: `${zone.percentage}%` }}
                >
                  {zone.percentage > 5 && (
                    <span className="text-xs font-medium text-white">
                      {zone.percentage.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Easy (Z1-Z2)</div>
            <div className="text-2xl font-bold text-blue-700">
              {zoneAnalysis.easyPercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatDuration(
                zoneAnalysis.zoneData
                  .filter(z => z.zone === 'Z1' || z.zone === 'Z2')
                  .reduce((sum, z) => sum + z.duration, 0)
              )}
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Hard (Z3-Z5)</div>
            <div className="text-2xl font-bold text-red-700">
              {zoneAnalysis.hardPercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatDuration(
                zoneAnalysis.zoneData
                  .filter(z => z.zone === 'Z3' || z.zone === 'Z4' || z.zone === 'Z5')
                  .reduce((sum, z) => sum + z.duration, 0)
              )}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Total Time</div>
            <div className="text-2xl font-bold text-green-700">
              {formatDuration(zoneAnalysis.totalDuration)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {runsWithHR.length} runs
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Avg HR</div>
            <div className="text-2xl font-bold text-purple-700">
              {Math.round(
                runsWithHR.reduce((sum, r) => sum + r.avg_heart_rate!, 0) / runsWithHR.length
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">bpm</div>
          </div>
        </div>
      </div>

      {/* 80/20 Rule Compliance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-purple-600" />
          <h4 className="font-semibold text-gray-900">80/20 Rule Compliance</h4>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Target: 80% easy, 20% hard</span>
            <span className={`font-medium ${
              zoneAnalysis.easyPercentage >= 75 && zoneAnalysis.easyPercentage <= 85 
                ? 'text-green-600' 
                : 'text-orange-600'
            }`}>
              {zoneAnalysis.easyPercentage.toFixed(1)}% easy
            </span>
          </div>
          <div className="relative w-full bg-gray-200 rounded-full h-6">
            {/* Target zone indicator */}
            <div className="absolute top-0 left-[75%] w-[10%] h-6 bg-green-200 opacity-50 rounded-r-full" />
            <div className="absolute top-0 left-[75%] h-6 w-px bg-green-500" />
            
            {/* Actual percentage */}
            <div
              className={`h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2 ${
                zoneAnalysis.easyPercentage >= 75 && zoneAnalysis.easyPercentage <= 85 
                  ? 'bg-green-500' 
                  : 'bg-orange-500'
              }`}
              style={{ width: `${zoneAnalysis.easyPercentage}%` }}
            >
              <span className="text-xs font-bold text-white">
                {zoneAnalysis.easyPercentage.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className={`p-4 rounded-lg ${
          zoneAnalysis.easyPercentage >= 75 && zoneAnalysis.easyPercentage <= 85
            ? 'bg-green-50 border border-green-200'
            : 'bg-orange-50 border border-orange-200'
        }`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {zoneAnalysis.easyPercentage >= 75 && zoneAnalysis.easyPercentage <= 85 ? (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              ) : (
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">!</span>
                </div>
              )}
            </div>
            <div className={`text-sm ${
              zoneAnalysis.easyPercentage >= 75 && zoneAnalysis.easyPercentage <= 85 
                ? 'text-green-800' 
                : 'text-orange-800'
            }`}>
              {zoneAnalysis.easyPercentage >= 75 && zoneAnalysis.easyPercentage <= 85 ? (
                <>
                  <strong>Excellent balance!</strong> You're following the 80/20 rule well. 
                  This is optimal for building aerobic fitness while minimizing injury risk.
                </>
              ) : zoneAnalysis.easyPercentage < 75 ? (
                <>
                  <strong>Too much intensity.</strong> You're doing {(100 - zoneAnalysis.easyPercentage).toFixed(0)}% hard training. 
                  Add more easy Zone 2 runs to improve aerobic base and reduce injury risk.
                </>
              ) : (
                <>
                  <strong>Consider adding quality.</strong> You're at {zoneAnalysis.easyPercentage.toFixed(0)}% easy. 
                  Adding 1-2 hard sessions per week could improve your speed and race performance.
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-semibold text-blue-900 text-sm mb-2">💡 Training Tips</h5>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• <strong>Zone 2</strong> builds aerobic base (conversational pace)</li>
            <li>• <strong>Zone 4</strong> improves lactate threshold (tempo runs)</li>
            <li>• <strong>Zone 5</strong> boosts VO2 max (intervals)</li>
            <li>• Most runs should feel easy - save hard efforts for quality sessions</li>
          </ul>
        </div>
      </div>

      {/* Zone Reference Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Zone Reference Guide</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-medium text-gray-700">Zone</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">HR Range</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Name</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Purpose</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Feel</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(zoneAnalysis.zones).map(([zone, data]) => (
                <tr key={zone} className="border-b border-gray-100">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${data.color}`} />
                      <span className="font-semibold">{zone}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-gray-600">
                    {data.min}-{data.max} bpm
                  </td>
                  <td className="py-3 px-3 font-medium text-gray-900">{data.name}</td>
                  <td className="py-3 px-3 text-gray-600">
                    {zone === 'Z1' && 'Active recovery'}
                    {zone === 'Z2' && 'Aerobic base building'}
                    {zone === 'Z3' && 'Tempo/threshold training'}
                    {zone === 'Z4' && 'Lactate threshold'}
                    {zone === 'Z5' && 'VO2 max development'}
                  </td>
                  <td className="py-3 px-3 text-gray-600">
                    {zone === 'Z1' && 'Very easy'}
                    {zone === 'Z2' && 'Conversational'}
                    {zone === 'Z3' && 'Comfortable hard'}
                    {zone === 'Z4' && 'Hard'}
                    {zone === 'Z5' && 'Very hard'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}