// lib/weather.ts
export async function fetchWeather(lat: number, lng: number, date: string) {
    try {
      const apiKey = process.env.OPENWEATHER_API_KEY
      
      if (!apiKey) {
        console.warn('OpenWeather API key not configured')
        return null
      }
  
      // Check if date is in the past (use historical data) or future (use forecast)
      const runDate = new Date(date)
      const now = new Date()
      const isHistorical = runDate < now
  
      let url: string
  
      if (isHistorical) {
        // Historical weather (requires Time Machine API - paid)
        // For free tier, we can only get current weather
        // So we'll just return null for past dates
        console.log('Historical weather not available on free tier')
        return null
      } else {
        // Current or future weather
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
      }
  
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Weather API request failed')
      }
  
      const data = await response.json()
  
      return {
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        conditions: data.weather[0].main,
        humidity: data.main.humidity,
        wind_speed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        icon: data.weather[0].icon,
      }
    } catch (error) {
      console.error('Error fetching weather:', error)
      return null
    }
  }
  
  export function getWeatherIcon(icon: string) {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`
  }
  
  export function getWeatherEmoji(conditions: string): string {
    const emojiMap: { [key: string]: string } = {
      Clear: '☀️',
      Clouds: '☁️',
      Rain: '🌧️',
      Drizzle: '🌦️',
      Thunderstorm: '⛈️',
      Snow: '❄️',
      Mist: '🌫️',
      Fog: '🌫️',
      Haze: '🌫️',
    }
    return emojiMap[conditions] || '🌤️'
  }