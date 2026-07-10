"use client"

import { useState } from "react"
import { Volume2 } from "@/components/animate-ui/icons/volume-2"
import { AnimateIcon } from "@/components/animate-ui/icons/icon"

function stripHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html")
  return doc.body.textContent || ""
}

export function MessageActions({ content, messageId }: { content: string; messageId: string }) {
  const [copied, setCopied] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  const plain = stripHtml(content)
  if (!plain) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(plain)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleSpeak = () => {
    if (speaking) {
      speechSynthesis.cancel()
      setSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(plain)
    utterance.lang = "en-US"
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  return (
    <div className="flex items-center gap-1 mt-1.5 ml-1">
      <button
        onClick={handleCopy}
        className="size-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all"
        aria-label="Copy text"
      >
        {copied ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        )}
      </button>

      <button
        onClick={handleSpeak}
        className={`size-7 rounded-full flex items-center justify-center transition-all ${
          speaking
            ? "text-blue-500 bg-blue-50 dark:bg-blue-500/20"
            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
        }`}
        aria-label={speaking ? "Stop" : "Read aloud"}
      >
        {speaking ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
          </svg>
        ) : (
          <AnimateIcon animateOnHover>
            <Volume2 size={13} />
          </AnimateIcon>
        )}
      </button>
    </div>
  )
}
