"use client"

import * as React from "react"
import { useEffect, useState, useMemo, useRef } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MessageSquare, Trash2, Search, History, Cog, Palette, ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CirclePlus } from "./animate-ui/icons/circle-plus"
import { MessageCircleCode } from "./animate-ui/icons/message-circle-code"
import { Unplug } from "./animate-ui/icons/unplug"
import { User } from "./animate-ui/icons/user"
import { SunIcon } from "./animate-ui/icons/sun"
import { MoonStarIcon } from "./animate-ui/icons/moon-star"
import { BellRing } from "./animate-ui/icons/bell-ring"
import { Compass } from "./animate-ui/icons/compass"
import { AnimateIcon } from "./animate-ui/icons/icon"
import useMessageStore from "@/store/useMessageStore"
import useUserStore from "@/store/useUserStore"
import useWeatherStore from "@/store/useWeatherStore"
import { WeatherCollapsible } from "@/components/WeatherCollapsible"
import { Trash } from "./animate-ui/icons/trash"

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(ts).toLocaleDateString()
}

function getDateGroup(ts: number): string {
  const now = new Date()
  const date = new Date(ts)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekAgo = new Date(today.getTime() - 6 * 86400000)

  if (date >= today) return "Today"
  if (date >= yesterday) return "Yesterday"
  if (date >= weekAgo) return "Previous 7 Days"
  return "Older"
}

export function AppSidebar() {
  const pathname = usePathname()
  const activeChatId = pathname.startsWith("/chat/") ? pathname.split("/chat/")[1] : null

  const chats = useMessageStore((state) => state.chats)
  const setChat = useMessageStore((state) => state.setChat)
  const deleteChat = useMessageStore((state) => state.deleteChat)
  const setActiveChat = useMessageStore((state) => state.setActiveChat)
  const userId = useUserStore((s) => s.user?._id)
  const [search, setSearch] = useState("")
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const fetched = useRef(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"))
  }, [])

  useEffect(() => {
    if (fetched.current || !userId) return
    if (!pathname.startsWith("/chat")) return
    fetched.current = true
    fetch(`/api/chats/user/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`API ${res.status}`)
        return res.json()
      })
      .then((body) => {
        const list = Array.isArray(body) ? body : body.message
        if (!Array.isArray(list)) return
        list.forEach((c: any) => {
          const id = c._id || c.id
          if (!useMessageStore.getState().chats.some(ch => ch._id === id)) {
            const now = Date.now()
            setChat({
              _id: id,
              title: c.title || "",
              createdAt: new Date(c.createdAt).getTime() || now,
              updatedAt: new Date(c.updatedAt).getTime() || now,
              messages: [],
            })
          }
        })
      })
      .catch(() => {})
  }, [pathname, userId])


  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return q
      ? [...chats].filter((c) => c.title.toLowerCase().includes(q))
      : [...chats]
  }, [chats, search])

  const grouped = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => b.updatedAt - a.updatedAt)
    const groups: Record<string, typeof sorted> = {}
    for (const chat of sorted) {
      const group = getDateGroup(chat.updatedAt)
      if (!groups[group]) groups[group] = []
      groups[group].push(chat)
    }
    return groups
  }, [filtered])

  const { weather, fetchWeather } = useWeatherStore()

  useEffect(() => {
    fetchWeather()
  }, [fetchWeather])

  const isChatRoute = pathname.startsWith("/chat")
  const isIntegrationsRoute = pathname.startsWith("/integrations")
  const isDiscoverRoute = pathname.startsWith("/discover")

  const navClass = (active: boolean) =>
    `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
      active
        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40"
        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
    }`

  const groupOrder = ["Today", "Yesterday", "Previous 7 Days", "Older"]

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  return (
    <Sidebar>
      <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
        <span className="font-heading text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
          SIFT
        </span>

      </div>

      <div className="px-2">

          <Link className={`flex items-center gap-1.5 py-1 px-2 text-[12px] hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-700 rounded-md ${pathname === "/discover" ? "bg-zinc-200 text-zinc-600 dark:text-zinc-100 font-bold dark:bg-zinc-800" : " dark:hover:text-zinc-300 font-semibold text-zinc-500"}`} href="/discover">
                      <AnimateIcon animateOnHover>
                        <Compass size={14} />
                      </AnimateIcon>
                      <span className="hidden md:block">Discover</span>
                    </Link>

      </div>

      </div>
      {isChatRoute && (
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center justify-center">
              <SidebarMenuButton
                className="hover:shadow-md w-1/2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all ease-linear duration-300"
                asChild
              >
                <Link href="/chat/new" onClick={() => setActiveChat(null)}>
                  <AnimateIcon className="flex items-center justify-center gap-2 w-full" animateOnHover>
                    <CirclePlus />
                    <span>New Chat</span>
                  </AnimateIcon>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
            <SidebarInput
              placeholder="Search chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </SidebarHeader>
      )}
      {isChatRoute && (
        <SidebarContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
              <History className="size-8 text-zinc-300 dark:text-zinc-600" />
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                {search ? "No chats match your search" : "No conversations yet"}
              </p>
            </div>
          ) : (
            groupOrder.map((group) => {
              const items = grouped[group]
              if (!items) return null
              return (
                <SidebarGroup key={group}>
                  <SidebarGroupLabel className="px-3 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    {group}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu className="gap-0.5">
                      {items.map((chat) => {
                        const isActive = chat._id === activeChatId
                        const msgCount = chat.messages.length
                        const subtitle = msgCount > 0
                          ? `${msgCount} message${msgCount > 1 ? "s" : ""} · ${formatRelativeTime(chat.updatedAt)}`
                          : formatRelativeTime(chat.updatedAt)
                        return (
                          <SidebarMenuItem key={chat._id}>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive}
                              size="lg"
                              className={isActive
                                ? "bg-blue-50 dark:bg-blue-950/40 shadow-sm"
                                : "hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                              }
                            >
                              <Link
                                href={`/chat/${chat._id}`}
                                onClick={() => setActiveChat(chat._id)}
                              >
                                <MessageSquare
                                  className={isActive
                                    ? "text-blue-500 shrink-0"
                                    : "text-zinc-400 shrink-0"
                                  }
                                />
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span
                                    className={isActive
                                      ? "text-zinc-900 dark:text-zinc-100 font-medium truncate"
                                      : "text-zinc-700 dark:text-zinc-300 truncate"
                                    }
                                  >
                                    {chat?.title || "Untitled"}
                                  </span>
                                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
                                    {subtitle}
                                  </span>
                                </div>
                              </Link>
                            </SidebarMenuButton>
                            <SidebarMenuAction
                              showOnHover
                              onClick={() => deleteChat(chat._id)}
                              className="hover:text-red-500"
                            >
                              <Trash className={"cursor-pointer"} animateOnHover />
                            </SidebarMenuAction>
                          </SidebarMenuItem>
                        )
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )
            })
          )}
        </SidebarContent>
      )}

      {(isDiscoverRoute && weather) && (
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Weather
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem className="px-1">
                  <WeatherCollapsible {...weather} />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      )}
      {isIntegrationsRoute && (
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                <p className="text-sm text-zinc-400 dark:text-zinc-500">Nothing to see here</p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      )}
      {!isIntegrationsRoute && !isDiscoverRoute && !isChatRoute && <div className="flex-1" />}

      {/* Bottom nav */}
      <SidebarFooter>
        <div className="flex items-center justify-around px-1 py-1.5 border-t border-zinc-200 dark:border-zinc-800">
          <Link
            href="/chat/new"
            onClick={() => setActiveChat(null)}
            className={navClass(isChatRoute)}
          >
            <AnimateIcon animateOnHover>
              <MessageCircleCode size={16} />
            </AnimateIcon>
            <span className="text-[10px] font-medium">Chat</span>
          </Link>
          <Link
            href="/integrations"
            className={navClass(isIntegrationsRoute)}
          >
            <AnimateIcon animateOnHover>
              <Unplug size={16} />
            </AnimateIcon>
            <span className="text-[10px] font-medium">Connector</span>
          </Link>
          <Link
            href="/profile"
            className={navClass(pathname.startsWith("/profile"))}
          >
            <AnimateIcon animateOnHover>
              <User size={16} />
            </AnimateIcon>
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <button className={navClass(false) + " cursor-pointer"}>
                <Cog className="size-4" />
                <span className="text-[10px] font-medium">Settings</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Cog className="size-4" />
                  Settings
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                {/* Theme */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                      {dark ? (
                        <AnimateIcon animateOnHover>
                          <MoonStarIcon size={16} />
                        </AnimateIcon>
                      ) : (
                        <AnimateIcon animateOnHover>
                          <SunIcon size={16} />
                        </AnimateIcon>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Theme</p>
                      <p className="text-xs text-zinc-500">{dark ? "Dark mode" : "Light mode"}</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ${
                      dark ? "bg-blue-500" : "bg-zinc-300 dark:bg-zinc-600"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                      dark ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>

                {/* Language */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                      <AnimateIcon animateOnHover>
                        <Compass size={16} />
                      </AnimateIcon>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Language</p>
                      <p className="text-xs text-zinc-500">English</p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-zinc-400" />
                </div>

                {/* Notifications */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                      <AnimateIcon animateOnHover>
                        <BellRing size={16} />
                      </AnimateIcon>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Notifications</p>
                      <p className="text-xs text-zinc-500">Enabled</p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-zinc-400" />
                </div>

                {/* Appearance */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                      <Palette className="size-4 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Appearance</p>
                      <p className="text-xs text-zinc-500">Default</p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-zinc-400" />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
