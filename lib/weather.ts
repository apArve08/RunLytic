// lib/weather.ts

function parseWeatherResponse(data: any) {
  return {
    temp: Math.round(data.main.temp),
    feels_like: Math.round(data.main.feels_like),
    conditions: data.weather[0].main,
    humidity: data.main.humidity,
    wind_speed: Math.round(data.wind.speed * 3.6), // m/s → km/h
    icon: data.weather[0].icon,
  }
}

// Fetch by GPS coordinates (lat/lng)
export async function fetchWeatherByCoords(lat: number, lng: number) {
  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
    )
    if (!res.ok) return null
    return parseWeatherResponse(await res.json())
  } catch {
    return null
  }
}

// Fetch by city name
export async function fetchWeatherByCity(city: string) {
  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    )
    if (!res.ok) return null
    return parseWeatherResponse(await res.json())
  } catch {
    return null
  }
}

// Legacy wrapper — kept for existing callers
export async function fetchWeather(lat: number, lng: number, _date?: string) {
  return fetchWeatherByCoords(lat, lng)
}

export function getWeatherIcon(icon: string) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`
}

export function getWeatherEmoji(conditions: string): string {
  const map: Record<string, string> = {
    Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
    Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Fog: '🌫️', Haze: '🌫️',
  }
  return map[conditions] || '🌤️'
}