// lib/strava/index.ts
import {
  STRAVA_API_BASE_URL,
  type StravaAthlete,
  type StravaConnectionResult,
} from './types'

/**
 * Tests the Strava API connection by making a request to the athlete endpoint
 * @param accessToken - The Strava OAuth access token
 * @returns Promise<StravaConnectionResult> - Result containing success status and athlete data or error
 */
export async function testConnection(
  accessToken: string
): Promise<StravaConnectionResult> {
  try {
    // Validate input
    if (!accessToken || typeof accessToken !== 'string') {
      return {
        success: false,
        error: 'Invalid access token provided',
      }
    }

    // Make request to Strava API to get athlete data
    const response = await fetch(`${STRAVA_API_BASE_URL}/athlete`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    })

    // Handle non-200 responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Provide more specific error messages based on status code
      let errorMessage = 'Failed to connect to Strava API'
      
      switch (response.status) {
        case 401:
          errorMessage = 'Invalid or expired access token'
          break
        case 403:
          errorMessage = 'Access forbidden - token may not have required permissions'
          break
        case 429:
          errorMessage = 'Rate limit exceeded - please try again later'
          break
        default:
          errorMessage = errorData.message || errorMessage
      }

      return {
        success: false,
        error: errorMessage,
      }
    }

    // Parse successful response
    const athlete: StravaAthlete = await response.json()

    return {
      success: true,
      athlete,
    }
  } catch (error) {
    // Handle network errors or unexpected issues
    console.error('Strava connection test error:', error)
    
    return {
      success: false,
      error: error instanceof Error 
        ? `Connection error: ${error.message}` 
        : 'An unexpected error occurred while testing Strava connection',
    }
  }
}

/**
 * Generates the Strava OAuth authorization URL
 * @param clientId - Strava application client ID
 * @param redirectUri - URI to redirect to after authorization
 * @param scope - OAuth scopes (default: 'read,activity:read_all')
 * @returns Authorization URL string
 */
export function getAuthorizationUrl(
  clientId: string,
  redirectUri: string,
  scope: string = 'read,activity:read_all'
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scope,
  })

  return `https://www.strava.com/oauth/authorize?${params.toString()}`
}

/**
 * Exchanges an authorization code for access and refresh tokens
 * @param code - Authorization code from Strava OAuth
 * @returns Promise with token response or error
 */
export async function exchangeCodeForToken(
  code: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const clientId = process.env.STRAVA_CLIENT_ID
    const clientSecret = process.env.STRAVA_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return {
        success: false,
        error: 'Strava client credentials not configured',
      }
    }

    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || 'Failed to exchange code for token',
      }
    }

    const data = await response.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('Strava token exchange error:', error)
    return {
      success: false,
      error: error instanceof Error 
        ? `Token exchange error: ${error.message}` 
        : 'An unexpected error occurred during token exchange',
    }
  }
}

/**
 * Refreshes an expired access token using the refresh token
 * @param refreshToken - The refresh token from Strava OAuth
 * @returns Promise with new token response or error
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const clientId = process.env.STRAVA_CLIENT_ID
    const clientSecret = process.env.STRAVA_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return {
        success: false,
        error: 'Strava client credentials not configured',
      }
    }

    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || 'Failed to refresh access token',
      }
    }

    const data = await response.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('Strava token refresh error:', error)
    return {
      success: false,
      error: error instanceof Error 
        ? `Token refresh error: ${error.message}` 
        : 'An unexpected error occurred during token refresh',
    }
  }
}

