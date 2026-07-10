"use client"

import * as React from "react"
import {
  ChevronsUpDown,
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  Sunrise,
  Sunset,
  Umbrella,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

const weatherLabels: Record<number, string> = {
  0: "Clear",
  1: "Mainly Clear",
  2: "Partly Cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Rime Fog",
  51: "Light Drizzle",
  53: "Moderate Drizzle",
  55: "Dense Drizzle",
  56: "Freezing Drizzle",
  57: "Freezing Drizzle",
  61: "Slight Rain",
  63: "Moderate Rain",
  65: "Heavy Rain",
  66: "Freezing Rain",
  67: "Freezing Rain",
  71: "Slight Snow",
  73: "Moderate Snow",
  75: "Heavy Snow",
  77: "Snow Grains",
  80: "Rain Showers",
  81: "Rain Showers",
  82: "Rain Showers",
  85: "Snow Showers",
  86: "Snow Showers",
  95: "Thunderstorm",
  96: "Thunderstorm",
  99: "Thunderstorm",
}

function getWeatherIcon(code: number, isDay: number) {
  if (code === 0) return isDay ? Sun : Moon
  if (code === 1) return isDay ? CloudSun : CloudMoon
  if (code === 2 || code === 3) return Cloud
  if (code >= 45 && code <= 48) return CloudFog
  if ((code >= 51 && code <= 57) || (code >= 80 && code <= 82)) return CloudDrizzle
  if (code >= 61 && code <= 67) return CloudRain
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return CloudSnow
  if (code >= 95) return CloudLightning
  return isDay ? Sun : Moon
}

function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export type WeatherData = {
  currentTemp: number
  feelsLike: number
  humidity: number
  windSpeed: number
  isDay: number
  currentCode: number
  todayMax: number
  todayMin: number
  todayCode: number
  todayRainChance: number
  sunrise: string
  sunset: string
  tomorrowMax: number
  tomorrowMin: number
  tomorrowCode: number
  tomorrowRainChance: number
}

export function WeatherCollapsible(data: WeatherData) {
  const [isOpen, setIsOpen] = React.useState(false)
  const WeatherIcon = getWeatherIcon(data.currentCode, data.isDay)
  const label = weatherLabels[data.currentCode] ?? "Unknown"
  const isDay = data.isDay === 1

  const gradient = !isDay
    ? "from-slate-200 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
    : data.currentCode <= 1
      ? "from-amber-500/20 via-orange-500/10 to-yellow-500/20"
      : data.currentCode >= 45 && data.currentCode <= 48
        ? "from-gray-400/20 via-gray-300/10 to-gray-400/20"
        : (data.currentCode >= 61 && data.currentCode <= 67) ||
            (data.currentCode >= 80 && data.currentCode <= 82)
          ? "from-blue-600/20 via-blue-500/10 to-indigo-600/20"
          : data.currentCode >= 71 && data.currentCode <= 86
            ? "from-blue-200/30 via-blue-100/20 to-white/10"
            : data.currentCode >= 95
              ? "from-purple-800/20 via-gray-700/10 to-slate-800/20"
              : "from-blue-500/10 via-purple-500/10 to-pink-500/10"

  const iconColor = !isDay
    ? "text-indigo-700 dark:text-indigo-200"
    : data.currentCode <= 1
      ? "text-amber-600 dark:text-amber-500"
      : data.currentCode >= 45 && data.currentCode <= 48
        ? "text-gray-600 dark:text-gray-400"
        : (data.currentCode >= 61 && data.currentCode <= 67) ||
            (data.currentCode >= 80 && data.currentCode <= 82)
          ? "text-blue-600 dark:text-blue-400"
          : data.currentCode >= 71 && data.currentCode <= 86
            ? "text-blue-600 dark:text-blue-200"
            : data.currentCode >= 95
              ? "text-purple-600 dark:text-purple-400"
              : "text-blue-600 dark:text-blue-500"

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        "w-full overflow-hidden rounded-2xl border bg-gradient-to-br backdrop-blur-sm transition-shadow duration-300",
        gradient,
        isOpen ? "shadow-lg" : "shadow-md",
      )}
    >
      <div className="p-2 sm:p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <div
              className={cn(
                "rounded-lg bg-background/40 p-1 backdrop-blur-sm sm:rounded-xl sm:p-2",
                iconColor,
              )}
            >
              <WeatherIcon className="size-4 sm:size-5" />
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground sm:text-[10px]">
                Current Weather
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold tracking-tight sm:text-2xl">
                  {Math.round(data.currentTemp)}°
                </span>
                <span className="text-[10px] text-muted-foreground sm:text-xs">{label}</span>
              </div>
              <p className="text-[9px] leading-none text-muted-foreground sm:text-[10px]">
                Feels like {Math.round(data.feelsLike)}°
              </p>
            </div>
          </div>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-5 shrink-0 rounded-full hover:bg-background/30 sm:size-6"
            >
              <ChevronsUpDown
                className={cn(
                  "size-2.5 transition-transform duration-300 sm:size-3.5",
                  isOpen && "rotate-180",
                )}
              />
              <span className="sr-only">Toggle forecast</span>
            </Button>
          </CollapsibleTrigger>
        </div>

        <div className="mt-1.5 flex gap-1 sm:mt-2 sm:gap-1.5">
          <div className="flex items-center gap-0.5 rounded-full bg-background/40 px-1.5 py-0.5 text-[9px] backdrop-blur-sm sm:gap-1 sm:px-2.5 sm:py-1 sm:text-[10px]">
            <Droplets className="size-2.5 text-blue-500 sm:size-3" />
            <span className="font-medium">{data.humidity}%</span>
          </div>
          <div className="flex items-center gap-0.5 rounded-full bg-background/40 px-1.5 py-0.5 text-[9px] backdrop-blur-sm sm:gap-1 sm:px-2.5 sm:py-1 sm:text-[10px]">
            <Wind className="size-2.5 text-cyan-500 sm:size-3" />
            <span className="font-medium">{data.windSpeed} km/h</span>
          </div>
        </div>
      </div>

        <CollapsibleContent className="border-t border-gray-200 dark:border-white/10">
        <div className="divide-y divide-gray-200 dark:divide-white/10">
          <div className="px-2 py-2 sm:px-4 sm:py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sun className="size-3 text-amber-500 sm:size-3.5" />
                <span className="text-[10px] font-semibold sm:text-xs">Today</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
                <span className="font-semibold">
                  {Math.round(data.todayMax)}°
                </span>
                <span className="text-muted-foreground">
                  {Math.round(data.todayMin)}°
                </span>
              </div>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-muted-foreground sm:mt-1 sm:gap-2.5 sm:text-[10px]">
              <div className="flex items-center gap-0.5">
                <Sunrise className="size-2.5 sm:size-3" />
                <span>{formatTime(data.sunrise)}</span>
              </div>
              <div className="flex items-center gap-0.5">
                <Sunset className="size-2.5 sm:size-3" />
                <span>{formatTime(data.sunset)}</span>
              </div>
              {data.todayRainChance > 0 && (
                <div className="flex items-center gap-0.5">
                  <Umbrella className="size-2.5 sm:size-3" />
                  <span>{data.todayRainChance}%</span>
                </div>
              )}
            </div>
          </div>

          <div className="px-2 py-2 sm:px-4 sm:py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Cloud className="size-3 text-gray-400 sm:size-3.5" />
                <span className="text-[10px] font-semibold sm:text-xs">Tomorrow</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
                <span className="font-semibold">
                  {Math.round(data.tomorrowMax)}°
                </span>
                <span className="text-muted-foreground">
                  {Math.round(data.tomorrowMin)}°
                </span>
              </div>
            </div>
            {data.tomorrowRainChance > 0 && (
              <div className="mt-0.5 flex items-center gap-1 text-[9px] text-muted-foreground sm:mt-1 sm:gap-1.5 sm:text-[10px]">
                <Umbrella className="size-2.5 sm:size-3" />
                <span>{data.tomorrowRainChance}% chance of rain</span>
              </div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
