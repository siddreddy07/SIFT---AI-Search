"use client"

import { useEffect, useState } from "react"
import { AnimateIcon } from "@/components/animate-ui/icons/icon"
import { SunIcon } from "@/components/animate-ui/icons/sun"
import { MoonStarIcon } from "@/components/animate-ui/icons/moon-star"

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"))
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  return (
    <button
      onClick={toggle}
      className="relative size-9 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95"
      aria-label="Toggle theme"
    >
      <span className="absolute transition-all duration-300 rotate-0 scale-100 dark:-rotate-90 dark:scale-0">
        <AnimateIcon animateOnHover>
          <SunIcon size={16} />
        </AnimateIcon>
      </span>
      <span className="absolute transition-all duration-300 rotate-90 scale-0 dark:rotate-0 dark:scale-100">
        <AnimateIcon animateOnHover>
          <MoonStarIcon size={16} />
        </AnimateIcon>
      </span>
    </button>
  )
}


