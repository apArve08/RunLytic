// types/database.ts
export interface Run {
  id: string
  user_id: string
  date: string
  distance: number
  duration: number
  pace: number
  shoes_id: string | null
  notes: string | null
  ai_analysis: string | null
  created_at: string
  updated_at: string
  shoes?: Shoe


  // New fields
  avg_heart_rate: number | null
  max_heart_rate: number | null
  elevation_gain: number | null
  elevation_loss: number | null
  avg_speed: number | null // km/h
  route_data: RoutePoint[] | null
}

export interface Shoe {
  id: string
  user_id: string
  brand: string
  model: string
  nickname: string | null
  total_distance: number
  purchase_date: string | null
  retired: boolean
  created_at: string
  updated_at: string
}

export interface RunFormData {
  date: string
  distance: number
  duration: number // in minutes (will convert to seconds)
  shoes_id?: string
  notes?: string
}

export interface ShoeFormData {
  brand: string
  model: string
  nickname?: string
  purchase_date?: string
}
// types/database.ts (ADD these to existing file)

export interface Goal {
  id: string
  user_id: string
  month: string // YYYY-MM-DD (first day of month)
  target_distance: number | null
  target_runs: number | null
  created_at: string
  updated_at: string
}

export interface PersonalRecord {
  id: string
  user_id: string
  distance_type: '5K' | '10K' | 'HALF' | 'FULL'
  best_time: number // seconds
  run_id: string | null
  achieved_date: string
  created_at: string
  updated_at: string
}

export interface MonthlyStats {
  totalDistance: number
  totalRuns: number
  totalDuration: number
  avgPace: number
  avgDistance: number
  longestRun: number
  fastestPace: number
  totalCalories: number // estimate
}

export interface WeeklyComparison {
  weekNumber: number
  distance: number
  runs: number
  avgPace: number
}
// types/database.ts (ADD to existing file)

export interface ProgressReport {
  id: string
  user_id: string
  report_date: string
  report_type: 'monthly' | 'quarterly' | 'custom'
  analysis_text: string
  key_insights: {
    improvement_areas: string[]
    strengths: string[]
    recommendations: string[]
    trend: 'improving' | 'declining' | 'stable'
  } | null
  created_at: string
}

export interface TrendData {
  month: string
  distance: number
  runs: number
  avgPace: number
}

// types/database.ts (ADD to existing file)

export type RunType = 'EASY' | 'TEMPO' | 'INTERVAL' | 'LONG' | 'RECOVERY' | 'REST'
export type GoalType = '5K' | '10K' | 'HALF' | 'FULL' | 'BASE_BUILDING' | 'CUSTOM'

export interface TrainingSchedule {
  id: string
  user_id: string
  name: string
  goal_type: GoalType
  target_date: string | null
  weeks: number
  is_active: boolean
  ai_generated: boolean
  description: string | null
  created_at: string
  updated_at: string
}

export interface ScheduledRun {
  id: string
  schedule_id: string
  week_number: number
  day_of_week: number
  scheduled_date: string
  run_type: RunType
  target_distance: number | null
  target_duration: number | null
  notes: string | null
  completed: boolean
  completed_run_id: string | null
  created_at: string
}


// types/database.ts (ADD to existing file)

export interface StravaConnection {
  id: string
  user_id: string
  athlete_id: number
  access_token: string
  refresh_token: string
  expires_at: string
  athlete_data: {
    firstname: string
    lastname: string
    profile: string
    city: string
    country: string
  } | null
  connected_at: string
  last_sync_at: string | null
  created_at: string
  updated_at: string
}

export interface StravaActivity {
  id: number
  name: string
  distance: number // meters
  moving_time: number // seconds
  elapsed_time: number // seconds
  type: string
  start_date: string
  average_speed: number // m/s
  max_speed: number // m/s
  average_heartrate?: number
  max_heartrate?: number
}


export interface RoutePoint {
  lat: number
  lng: number
  elevation?: number
  timestamp?: string
}

export interface RacePrediction {
  distance: '5K' | '10K' | 'HALF' | 'FULL'
  predictedTime: number // seconds
  predictedPace: number // min/km
  confidence: 'low' | 'medium' | 'high'
  basedOn: string
}

// types/database.ts (ADD to existing file)

export type RecordType = '5K' | '10K' | 'HALF' | 'FULL' | 'LONGEST' | 'FASTEST_PACE'

export interface PersonalRecord {
  id: string
  user_id: string
  record_type: RecordType
  value: number // seconds for time, km for distance
  run_id: string | null
  achieved_at: string
  previous_record: number | null
  created_at: string
  updated_at: string
}

export interface RunningStreak {
  id: string
  user_id: string
  start_date: string
  end_date: string | null
  length: number
  is_active: boolean
  created_at: string
}

export interface WeatherData {
  temp: number // Celsius
  feels_like: number
  conditions: string // "Clear", "Clouds", "Rain"
  humidity: number // percentage
  wind_speed: number // m/s
  icon: string // weather icon code
}

export type TrainingZone = 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5'

export interface ZoneData {
  zone: TrainingZone
  min_hr: number
  max_hr: number
  duration: number // seconds in this zone
  percentage: number
}