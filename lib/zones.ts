// lib/zones.ts
import { TrainingZone, ZoneData } from '@/types/database'

export function calculateMaxHR(age: number): number {
  // Simple formula: 220 - age
  return 220 - age
}

export function getZoneBoundaries(maxHR: number) {
  return {
    Z1: { min: Math.round(maxHR * 0.5), max: Math.round(maxHR * 0.6), name: 'Recovery', color: 'bg-gray-400' },
    Z2: { min: Math.round(maxHR * 0.6), max: Math.round(maxHR * 0.7), name: 'Aerobic', color: 'bg-blue-400' },
    Z3: { min: Math.round(maxHR * 0.7), max: Math.round(maxHR * 0.8), name: 'Tempo', color: 'bg-green-400' },
    Z4: { min: Math.round(maxHR * 0.8), max: Math.round(maxHR * 0.9), name: 'Threshold', color: 'bg-orange-400' },
    Z5: { min: Math.round(maxHR * 0.9), max: Math.round(maxHR), name: 'VO2 Max', color: 'bg-red-400' },
  }
}

export function classifyHRZone(heartRate: number, maxHR: number): TrainingZone {
  const zones = getZoneBoundaries(maxHR)
  
  if (heartRate >= zones.Z5.min) return 'Z5'
  if (heartRate >= zones.Z4.min) return 'Z4'
  if (heartRate >= zones.Z3.min) return 'Z3'
  if (heartRate >= zones.Z2.min) return 'Z2'
  return 'Z1'
}

export function calculate8020Compliance(zoneData: ZoneData[]): number {
  const totalDuration = zoneData.reduce((sum, z) => sum + z.duration, 0)
  if (totalDuration === 0) return 0
  
  // Z1 and Z2 are "easy", Z3-Z5 are "hard"
  const easyDuration = zoneData
    .filter(z => z.zone === 'Z1' || z.zone === 'Z2')
    .reduce((sum, z) => sum + z.duration, 0)
  
  return (easyDuration / totalDuration) * 100
}