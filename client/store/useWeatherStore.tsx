import { create } from "zustand"

import type { WeatherData } from "@/components/WeatherCollapsible"

type WeatherStore = {
  weather: WeatherData | null
  loading: boolean
  error: string | null
  fetchWeather: () => Promise<void>
  clearWeather: () => void
}

const useWeatherStore = create<WeatherStore>((set) => ({
  weather: null,
  loading: false,
  error: null,
  fetchWeather: async () => {
    set({ loading: true, error: null })
    try {
      const permission = await navigator.permissions.query({ name: "geolocation" })
      if (permission.state === "denied") {
        set({ error: "Location access denied", loading: false })
        return
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })

      const { latitude, longitude } = position.coords
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        current: "temperature_2m,weather_code,apparent_temperature,relative_humidity_2m,wind_speed_10m,is_day",
        daily: "temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,sunrise,sunset",
        forecast_days: "2",
        timezone: "auto",
      })

      const res = await fetch(`${process.env.NEXT_PUBLIC_WEATHER_API}?${params}`)
      const data = await res.json()

      set({
        weather: {
          currentTemp: data.current.temperature_2m,
          feelsLike: data.current.apparent_temperature,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          isDay: data.current.is_day,
          currentCode: data.current.weather_code,
          todayMax: data.daily.temperature_2m_max[0],
          todayMin: data.daily.temperature_2m_min[0],
          todayCode: data.daily.weather_code[0],
          todayRainChance: data.daily.precipitation_probability_max[0],
          sunrise: data.daily.sunrise[0],
          sunset: data.daily.sunset[0],
          tomorrowMax: data.daily.temperature_2m_max[1],
          tomorrowMin: data.daily.temperature_2m_min[1],
          tomorrowCode: data.daily.weather_code[1],
          tomorrowRainChance: data.daily.precipitation_probability_max[1],
        },
        loading: false,
      })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch weather",
        loading: false,
      })
    }
  },
  clearWeather: () => set({ weather: null, error: null }),
}))

export default useWeatherStore
