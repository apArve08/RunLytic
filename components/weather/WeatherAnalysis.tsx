// components/weather/WeatherAnalysis.tsx
'use client'

import { useEffect, useState } from 'react'
import { Run } from '@/types/database'
import { TrendingDown, TrendingUp, Cloud } from 'lucide-react'

interface WeatherAnalysisProps {
  runs: Run[]
}

export function WeatherAnalysis({ runs }: WeatherAnalysisProps) {
  const [analysis, setAnalysis] = useState<any>(null)

  useEffect(() => {
    analyzeWeatherImpact()
  }, [runs])

  const analyzeWeatherImpact = () => {
    const runsWithWeather = runs.filter(r => r.weather_data)

    if (runsWithWeather.length < 2) {
      setAnalysis(null)
      return
    }

    // Group by temperature ranges
    const tempRanges = {
      cold: runsWithWeather.filter(r => r.weather_data!.temp < 15),
      moderate: runsWithWeather.filter(r => r.weather_data!.temp >= 15 && r.weather_data!.temp < 25),
      hot: runsWithWeather.filter(r => r.weather_data!.temp >= 25),
    }

    const calcAvgPace = (runs: Run[]) => {
      if (runs.length === 0) return 0
      return runs.reduce((sum, r) => sum + r.pace, 0) / runs.length
    }

    const coldAvgPace = calcAvgPace(tempRanges.cold)
    const moderateAvgPace = calcAvgPace(tempRanges.moderate)
    const hotAvgPace = calcAvgPace(tempRanges.hot)

    setAnalysis({
      cold: {
        count: tempRanges.cold.length,
        avgPace: coldAvgPace,
      },
      moderate: {
        count: tempRanges.moderate.length,
        avgPace: moderateAvgPace,
      },
      hot: {
        count: tempRanges.hot.length,
        avgPace: hotAvgPace,
      },
      bestCondition: coldAvgPace > 0 && coldAvgPace < moderateAvgPace && coldAvgPace < hotAvgPace
        ? 'cold'
        : hotAvgPace > 0 && hotAvgPace < moderateAvgPace && hotAvgPace < coldAvgPace
        ? 'hot'
        : 'moderate',
    })
  }

  const runsWithWeather = runs.filter(r => r.weather_data)

  if (!analysis) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center space-y-3">
        <Cloud className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto" />
        <p className="font-medium text-gray-700 dark:text-gray-300">No weather data yet</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          {runsWithWeather.length === 0
            ? 'Add weather to your runs — open any run, enter a city in the Weather section, and click Fetch.'
            : `${runsWithWeather.length} run${runsWithWeather.length === 1 ? '' : 's'} with weather data — need at least 2 to compare conditions.`}
        </p>
        {runsWithWeather.length === 0 && (
          <a href="/runs" className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
            Go to my runs →
          </a>
        )}
      </div>
    )
  }

  const getPerformanceChange = (pace1: number, pace2: number) => {
    if (pace1 === 0 || pace2 === 0) return 0
    return ((pace1 - pace2) / pace2) * 100
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Weather Impact Analysis
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Cold */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Cold (&lt;15°C)</div>
          <div className="text-2xl font-bold text-blue-700 mb-1">
            {analysis.cold.avgPace > 0 ? `${analysis.cold.avgPace.toFixed(2)} min/km` : 'N/A'}
          </div>
          <div className="text-xs text-gray-500">{analysis.cold.count} runs</div>
        </div>

        {/* Moderate */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Moderate (15-25°C)</div>
          <div className="text-2xl font-bold text-green-700 mb-1">
            {analysis.moderate.avgPace.toFixed(2)} min/km
          </div>
          <div className="text-xs text-gray-500">{analysis.moderate.count} runs</div>
        </div>

        {/* Hot */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Hot (&gt;25°C)</div>
          <div className="text-2xl font-bold text-orange-700 mb-1">
            {analysis.hot.avgPace > 0 ? `${analysis.hot.avgPace.toFixed(2)} min/km` : 'N/A'}
          </div>
          <div className="text-xs text-gray-500">{analysis.hot.count} runs</div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="font-medium text-gray-900 mb-2">💡 Insights</div>
        <div className="space-y-1 text-sm text-gray-700">
          {analysis.hot.avgPace > 0 && (
            <div className="flex items-start gap-2">
              {getPerformanceChange(analysis.hot.avgPace, analysis.moderate.avgPace) > 0 ? (
                <TrendingDown className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              ) : (
                <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              )}
              <span>
                You run {Math.abs(getPerformanceChange(analysis.hot.avgPace, analysis.moderate.avgPace)).toFixed(1)}%
                {getPerformanceChange(analysis.hot.avgPace, analysis.moderate.avgPace) > 0 ? ' slower' : ' faster'} when it's hot (25°C)
              </span>
            </div>
          )}

          {analysis.cold.avgPace > 0 && (
            <div className="flex items-start gap-2">
              {getPerformanceChange(analysis.cold.avgPace, analysis.moderate.avgPace) > 0 ? (
                <TrendingDown className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              ) : (
                <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              )}
              <span>
                You run {Math.abs(getPerformanceChange(analysis.cold.avgPace, analysis.moderate.avgPace)).toFixed(1)}%
                {getPerformanceChange(analysis.cold.avgPace, analysis.moderate.avgPace) > 0 ? ' slower' : ' faster'} in cold weather (&lt;15°C)
              </span>
            </div>
          )}

          <div>
            <strong>Best performance:</strong> {
              analysis.bestCondition === 'cold' ? 'Cold weather (<15°C)' :
              analysis.bestCondition === 'hot' ? 'Hot weather (>25°C)' :
              'Moderate conditions (15-25°C)'
            }
          </div>
        </div>
      </div>
    </div>
  )
}
