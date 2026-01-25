# Strava Integration

This module provides utilities for integrating with the Strava API.

## Setup

1. Create a Strava API application at https://www.strava.com/settings/api
2. Add your credentials to `.env.local`:
   ```
   STRAVA_CLIENT_ID=your_client_id
   STRAVA_CLIENT_SECRET=your_client_secret
   STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback
   ```

## Usage

### Test Connection

Test if your Strava access token is valid:

```typescript
import { testConnection } from '@/lib/strava'

const result = await testConnection('your-access-token')

if (result.success) {
  console.log('Connected:', result.athlete?.firstname, result.athlete?.lastname)
} else {
  console.error('Connection failed:', result.error)
}
```

### API Endpoint

You can also test the connection via the API:

```bash
curl -X POST http://localhost:3000/api/strava/test-connection \
  -H "Content-Type: application/json" \
  -d '{"accessToken": "your-strava-access-token"}'
```

Response on success:
```json
{
  "success": true,
  "athlete": {
    "id": 12345,
    "name": "John Doe",
    "username": "johndoe",
    "city": "San Francisco",
    "country": "United States",
    "profile": "https://strava-avatars.s3.amazonaws.com/..."
  },
  "message": "Successfully connected to Strava"
}
```

Response on error:
```json
{
  "success": false,
  "error": "Invalid or expired access token"
}
```

## Files

- `lib/strava/types.ts` - TypeScript interfaces for Strava API responses
- `lib/strava/index.ts` - Utility functions for Strava API
- `app/api/strava/test-connection/route.ts` - API endpoint for testing connection

## Error Codes

| Status | Error Message |
|--------|--------------|
| 401 | Invalid or expired access token |
| 403 | Access forbidden - token may not have required permissions |
| 429 | Rate limit exceeded - please try again later |

