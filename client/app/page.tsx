"use client"

import { useState, useEffect, type ReactNode } from "react"
import Navbar from "@/components/home/Navbar"
import { TextAnimate } from "@/components/ui/text-animate"
import { getProviderIcon } from "@/lib/provider-icons"
import { getFileTypeIcon } from "@/lib/provider-icons"
import { Globe, ArrowUp, FileText } from "lucide-react"
import { VideoText } from "@/components/ui/video-text"

const images = ["/Login.png", "/Signup.png"]

type SourceType = "web" | "youtube" | "rag"

interface SourceInfo {
  type: SourceType
  label: string
  icon: ReactNode
}

const demos = [
  { query: "New Xbox CEO announced today", source: { type: "web" as SourceType, label: "Web Search", icon: <Globe className="size-4" /> } },
  { query: "Help me understand this financial report", source: { type: "rag" as SourceType, label: "RAG Search", icon: getFileTypeIcon("application/pdf") ?? <FileText className="size-4" /> } },
  { query: "Championship match highlights today", source: { type: "youtube" as SourceType, label: "YouTube Search", icon: getProviderIcon("youtube") } },
]

export default function Home() {
  const [bgIndex, setBgIndex] = useState(0)
  const [demoIndex, setDemoIndex] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % images.length)
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const currentDemo = demos[demoIndex]

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    if (!isDeleting && displayText === currentDemo.query) {
      timeout = setTimeout(() => setIsDeleting(true), 2000)
      return () => clearTimeout(timeout)
    }

    if (isDeleting && displayText === "") {
      setDemoIndex((prev) => (prev + 1) % demos.length)
      setIsDeleting(false)
      return
    }

    timeout = setTimeout(
      () => {
        if (isDeleting) {
          setDisplayText(currentDemo.query.slice(0, displayText.length - 1))
        } else {
          setDisplayText(currentDemo.query.slice(0, displayText.length + 1))
        }
      },
      isDeleting ? 25 : 50
    )

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, currentDemo])

  const source = currentDemo.source

  return (
    <div className="relative min-h-screen overflow-hidden">
      {images.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1500"
          style={{
            backgroundImage: `url(${src})`,
            opacity: i === bgIndex ? 1 : 0,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-black/40" />
      <Navbar />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-4xl mb-12">
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight text-white mb-3 leading-[1.1]">
            Search
            <br />
            <div className="h-16 sm:h-16 lg:h-24 flex justify-center mt-1">
              <VideoText
                src="https://cdn.magicui.design/ocean-small.webm"
                fontSize={22}
                className="h-full"
                fontWeight="bold"
              >
                anything.
              </VideoText>
            </div>
          </h1>
          <p className="text-base sm:text-lg text-white/50 max-w-xl mx-auto">
            One input. Every source. Instant answers.
          </p>
        </div>

        <div className="w-full max-w-2xl space-y-3">
          <div className="flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 w-fit">
            <span className="text-white/80">{source.icon}</span>
            <TextAnimate
              animation="blurIn"
              by="text"
              className="text-[11px] sm:text-sm font-medium text-white/70"
              key={source.label}
            >
              {source.label}
            </TextAnimate>
            <span className="flex gap-1 ml-1">
              <span className="size-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] text-green-400/60 font-mono">ACTIVE</span>
            </span>
          </div>

          <div className="rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 px-4 sm:px-6 py-3 sm:py-4 shadow-xl">
            <div className="flex items-end gap-2 sm:gap-3">
              <div className="flex-1 min-w-0 h-8 sm:h-9 flex items-center">
                <span className="text-white/90 text-sm sm:text-lg font-light tracking-wide truncate">
                  {displayText}
                  <span className="inline-block w-0.5 h-5 bg-white/40 animate-pulse ml-0.5 align-middle" />
                </span>
              </div>
              <button className="flex-shrink-0 rounded-full bg-white/10 p-2 sm:p-3 text-white/60 hover:text-white hover:bg-white/20 transition-all duration-200">
                <ArrowUp className="size-4 sm:size-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-white/30 text-xs justify-center pt-2">
            <span>Web</span>
            <span className="size-1 rounded-full bg-white/20" />
            <span>YouTube</span>
            <span className="size-1 rounded-full bg-white/20" />
            <span>Docs</span>
            <span className="size-1 rounded-full bg-white/20" />
            <span>RAG</span>
            <span className="size-1 rounded-full bg-white/20" />
            <span>Everything</span>
          </div>
        </div>
      </div>
    </div>
  )
}
