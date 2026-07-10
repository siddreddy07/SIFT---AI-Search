"use client"

import { useEffect, useState } from "react"
import ChatInput from "@/components/ChatInput"
import useMessageStore from "@/store/useMessageStore"
import useHomePillStore, { type HomePill } from "@/store/useHomePillStore"
import useUserStore from "@/store/useUserStore"
import { getProviderIcon } from "@/lib/provider-icons"
import { DiaTextReveal } from "@/components/ui/dia-text-reveal"

export default function NewChatPage() {
  const setActiveChat = useMessageStore((s) => s.setActiveChat)
  const { pills, loading, setPills, setLoading, setError } = useHomePillStore()
  const [pillPrompt, setPillPrompt] = useState("")
  const [greet,SetGreet] = useState("")
  const [selectedPillId, setSelectedPillId] = useState<string | null>(null)
  const [selectedprovider , setSelectedProvider] = useState<string | null>(null)
  const [selectedPill, setSelectedPill] = useState<HomePill | null>(null)
  const userId = useUserStore((s) => s.user?._id)
  const userName = useUserStore((s) => s.user?.name)

  const handleRemoveProvider = () => {
    setSelectedPillId(null);
    setPillPrompt("");
    setSelectedProvider(null);
    setSelectedPill(null);
  };

  useEffect(() => {
    setActiveChat(null)
  }, [setActiveChat])

  useEffect(()=>{
    if(selectedPillId){
      const pill = pills.find(item=> item.id.toString() === selectedPillId.toString())
      setSelectedProvider(pill?.provider ?? null)
      setSelectedPill(pill ?? null)
    }
  },[selectedPillId])

  function getGreeting(): string {
    
    const hour = new Date().getHours()

     if (hour >= 5 && hour < 12) {
    return "Morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Afternoon";
  }

  if (hour >= 17 && hour < 21) {
    return "Evening";
  }

  return "Night";

  }


  console.log('Selected Pill :',selectedPill)

  useEffect(() => {
    if (!userId) return
    const fetchPills = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/home-pills?userId=${userId}`)
        if (!res.ok) throw new Error("Failed to fetch pills")
        const data = await res.json()
        setPills(data.data || data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load suggestions")
        setPills([])
      } finally {
        setLoading(false)
      }
    }
    fetchPills()
    SetGreet(getGreeting())
  }, [setPills, setLoading, setError, userId])

  return (
    <div className="flex-1 flex items-center justify-center md:p-4">
      <div className="w-[90vw] md:w-[70vw] min-w-[20vw]">
        <div className="text-center w-full mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-800 dark:text-zinc-100">
            {greet} {userName}
          </h1>
          <p className="mt-2 text-base md:text-lg font-light text-zinc-500 dark:text-zinc-400">
            <DiaTextReveal
              text={["What can I help with?", "Ask me anything", "Let's have search", "Your AI awaits"]}
              colors={["#3b82f6", "#8b5cf6", "#ec4899"]}
              duration={2}
              repeat
              repeatDelay={3}
              className="text-base md:text-lg"
            />
          </p>
        </div>
        {!loading && pills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {pills.map((pill) =>
              selectedPillId === pill.id ? (
                <div
                  key={pill.id}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium border border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 transition-all duration-200"
                >
                  {getProviderIcon(pill.provider)}
                  <span>{pill.text}</span>
                  <button
                    onClick={handleRemoveProvider}
                    className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 dark:hover:bg-blue-700/50 transition-colors flex-shrink-0"
                    type="button"
                    aria-label="Remove"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  key={pill.id}
                  onClick={() => {
                    setSelectedPillId(pill.id)
                    setPillPrompt(pill.prompt)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  {getProviderIcon(pill.provider)}
                  <span>{pill.text}</span>
                </button>
              )
            )}
          </div>
        )}
        <ChatInput provider={selectedprovider} prefillMessage={pillPrompt} selectedPill={selectedPill ?? undefined} />
      </div>
    </div>
  )
}
