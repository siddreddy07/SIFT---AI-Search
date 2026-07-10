"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import ChatInput from "@/components/ChatInput"
import useMessageStore from "@/store/useMessageStore"
import useUserStore from "@/store/useUserStore"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { YoutubeLogo } from "@/components/chat/YoutubeLogo"
import { VideoSheet } from "@/components/chat/VideoSheet"
import { WebSheet } from "@/components/chat/WebSheet"
import { MessageBubble } from "@/components/chat/MessageBubble"
import { ChatSkeleton } from "@/components/chat/ChatSkeleton"
import { toast } from "sonner"
import { TypingIndicator } from "@/components/chat/TypingIndicator"

function convertSources(sources: any): any[] {
  if (!sources) return []
  if (Array.isArray(sources)) return sources
  if (typeof sources === 'object') {
    return Object.entries(sources)
      .filter(([, v]) => Array.isArray(v) && v.length > 0)
      .map(([tool, result]) => ({ tool, result }))
  }
  return []
}

export default function ChatPage() {
  const params = useParams<{ chatId: string }>()
  const chatId = params.chatId

  const chats = useMessageStore((s) => s.chats)
  const setActiveChat = useMessageStore((s) => s.setActiveChat)
  const setChat = useMessageStore((s) => s.setChat)
  const userId = useUserStore((s) => s.user?._id)
  const [openSheet, setOpenSheet] = useState<{ msgId: string; sourceIdx: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    if (!userId) return
    setActiveChat(chatId)

    const localChat = useMessageStore.getState().chats.find(c => c._id === chatId)
    if (localChat?.messages?.length) {
      setLoading(false)
      return
    }

    setLoading(true)

    const fetchChat = async () => {
      try {
        const res = await fetch(`/api/chats/${chatId}?userId=${userId}`)
        if (!res.ok) {
          console.warn(`Chat ${chatId} not found on server (${res.status}), using local data`)
          return
        }
        const body = await res.json()
        let msgWrapper = body.messages || body.message || body
        if (msgWrapper?.messages && typeof msgWrapper.messages === 'object' && 'chat' in msgWrapper.messages) {
          msgWrapper = msgWrapper.messages
        }
        const chatInfo = msgWrapper.chat || msgWrapper
        const msgArray = msgWrapper.messages || (Array.isArray(msgWrapper) ? msgWrapper : [])
        if (!Array.isArray(msgArray)) {
          console.warn('msgArray is not an array:', typeof msgArray, msgArray)
          return
        }
        const mapped = msgArray
          .map((m: any) => ({
            _id: m._id || m.id,
            content: m.content || m.text || '',
            role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
            createdAt: new Date(m.createdAt || m.timestamp).getTime(),
            sources: convertSources(m.sources),
            files: m.files?.map((f: any) => ({
              _id: f._id,
              originalName: f.originalName,
              mimeType: f.mimeType,
              size: f.size,
              url: f.url,
            })) || undefined
          }))
          .sort((a: any, b: any) => a.createdAt - b.createdAt)
        const existing = useMessageStore.getState().chats.find(c => c._id === chatId)
        setChat({
          _id: chatId,
          title: chatInfo.title || existing?.title || '',
          createdAt: new Date(chatInfo.createdAt).getTime() || existing?.createdAt || Date.now(),
          updatedAt: existing?.updatedAt || new Date(chatInfo.updatedAt).getTime() || Date.now(),
          messages: mapped
        })
      } catch (err) {
        toast.error("Failed to load chat from server")
      } finally {
        setLoading(false)
      }
    }

    fetchChat()
  }, [chatId, setActiveChat, setChat, userId])

  const chat = chats.find(c => c._id === chatId)
  const messages = chat?.messages || []

  console.log('Chat Messages in Page:', messages)

  useEffect(() => {
    scrollToBottom()
  }, [loading, messages, scrollToBottom])

  const activeSource = openSheet
    ? messages.find(m => m._id === openSheet.msgId)?.sources?.[openSheet.sourceIdx]
    : null

  return (
    <div className="flex flex-col items-center flex-1 min-h-0 bg-gradient-to-b from-zinc-50/80 to-white dark:from-zinc-950 dark:to-zinc-900/80">
      <div className="max-w-[90vw] w-[95vw] sm:w-[60vw] xl:w-[50vw] flex flex-1 min-h-0 py-10 flex-col pb-28 md:pb-26">
        <div ref={scrollRef} className="flex-1 overflow-y-auto md:p-4 min-h-0">
          {loading ? <ChatSkeleton /> : messages.length === 0 ? null : (
            <div className="space-y-1">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg._id}
                  msg={msg}
                  onSourceClick={(sourceIdx) => setOpenSheet({ msgId: msg._id, sourceIdx })}
                />
              ))}
              {messages[messages.length - 1].role === "assistant" && !messages[messages.length - 1].content && (
                <TypingIndicator />
              )}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <ChatInput fixed />

      <Sheet open={!!openSheet} onOpenChange={(o) => { if (!o) setOpenSheet(null) }}>
        <SheetContent side="bottom" style={{height:'55vh'}} className="rounded-t-2xl h-full w-full bg-zinc-100/80 dark:bg-zinc-900/90 backdrop-blur-xl overflow-y-auto border-t border-zinc-200/50 dark:border-zinc-700/50">
          <SheetHeader className="pb-2">
            <SheetTitle className="flex items-center gap-2 text-base">
              {activeSource?.tool === "videoSearch" && <><YoutubeLogo /> YouTube Results</>}
              {activeSource?.tool === "webSearch" && <><span>🔍</span> Web Results</>}
              {activeSource && !["videoSearch", "webSearch"].includes(activeSource.tool) && (
                <><span>🔧</span> {activeSource.tool}</>
              )}
            </SheetTitle>
          </SheetHeader>

          {activeSource?.tool === "videoSearch" && Array.isArray(activeSource.result) && (
            <VideoSheet results={activeSource.result} />
          )}
          {activeSource?.tool === "webSearch" && Array.isArray(activeSource.result) && (
            <WebSheet results={activeSource.result} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
