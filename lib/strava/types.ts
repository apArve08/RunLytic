// lib/strava/types.ts

export interface StravaAthlete {
  id: number
  username: string | null
  firstname: string
  lastname: string
  bio: string | null
  city: string | null
  state: string | null
  country: string | null
  sex: 'M' | 'F' | 'N'
  weight: number
  profile_medium: string
  profile: string
  friend: number | null
  follower: number | null
  created_at: string
  updated_at: string
}

export interface StravaActivity {
  id: number
  name: string
  type: string
  sport_type: string
  start_date: string
  start_date_local: string
  timezone: string
  elapsed_time: number
  moving_time: number
  distance: number
  total_elevation_gain: number
  average_speed: number
  max_speed: number
  average_heartrate: number | null
  max_heartrate: number | null
  start_latitude: number | null
  start_longitude: number | null
}

export interface StravaTokenResponse {
  access_token: string
  refresh_token: string
  expires_at: number
  token_type: string
  athlete: StravaAthlete
}

export interface StravaConnectionResult {
  success: boolean
  athlete?: StravaAthlete
  error?: string
}

export interface StravaConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

export const STRAVA_API_BASE_URL = 'https://www.strava.com/api/v3'
export const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize'
export const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token'

