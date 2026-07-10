"use client"

import { useState, useEffect } from "react"
import { Plug, Check, ShieldCheck, ArrowUpRight } from "lucide-react"
import useUserStore from "@/store/useUserStore"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import useIntegrationStore from "@/store/useIntegrationStore"
import api from "@/lib/axios"
import { Button } from "@/components/ui/button"

const apps = [
  {
    id: "google",
    name: "Google",
    desc: "Gmail, YouTube, and Calendar",
    color: "from-yellow-500 to-red-500",
    services: [
      { name: "Gmail", desc: "Read and search your emails" },
      { name: "YouTube", desc: "Search and analyze video content" },
      { name: "Google Calendar", desc: "Manage your events and schedules" },
    ],
    icon: (
      <svg viewBox="0 0 16 16" className="size-6">
        <g fill="none" fillRule="evenodd" clipRule="evenodd">
          <path fill="#F44336" d="M7.209 1.061c.725-.081 1.154-.081 1.933 0a6.57 6.57 0 0 1 3.65 1.82a100 100 0 0 0-1.986 1.93q-1.876-1.59-4.188-.734q-1.696.78-2.362 2.528a78 78 0 0 1-2.148-1.658a.26.26 0 0 0-.16-.027q1.683-3.245 5.26-3.86" opacity=".987" />
          <path fill="#FFC107" d="M1.946 4.92q.085-.013.161.027a78 78 0 0 0 2.148 1.658A7.6 7.6 0 0 0 4.04 7.99q.037.678.215 1.331L2 11.116Q.527 8.038 1.946 4.92" opacity=".997" />
          <path fill="#448AFF" d="M12.685 13.29a26 26 0 0 0-2.202-1.74q1.15-.812 1.396-2.228H8.122V6.713q3.25-.027 6.497.055q.616 3.345-1.423 6.032a7 7 0 0 1-.51.49" opacity=".999" />
          <path fill="#43A047" d="M4.255 9.322q1.23 3.057 4.51 2.854a3.94 3.94 0 0 0 1.718-.626q1.148.812 2.202 1.74a6.62 6.62 0 0 1-4.027 1.684a6.4 6.4 0 0 1-1.02 0Q3.82 14.524 2 11.116z" opacity=".993" />
        </g>
      </svg>
    ),
  },
  {
    id: "slack",
    name: "Slack",
    desc: "Channels and messages",
    color: "from-purple-500 to-pink-500",
    icon: (
      <svg viewBox="0 0 128 128" className="size-6">
        <path fill="#de1c59" d="M27.255 80.719c0 7.33-5.978 13.317-13.309 13.317C6.616 94.036.63 88.049.63 80.719s5.987-13.317 13.317-13.317h13.309zm6.709 0c0-7.33 5.987-13.317 13.317-13.317s13.317 5.986 13.317 13.317v33.335c0 7.33-5.986 13.317-13.317 13.317c-7.33 0-13.317-5.987-13.317-13.317zm0 0" />
        <path fill="#35c5f0" d="M47.281 27.255c-7.33 0-13.317-5.978-13.317-13.309C33.964 6.616 39.951.63 47.281.63s13.317 5.987 13.317 13.317v13.309zm0 6.709c7.33 0 13.317 5.987 13.317 13.317s-5.986 13.317-13.317 13.317H13.946C6.616 60.598.63 54.612.63 47.281c0-7.33 5.987-13.317 13.317-13.317zm0 0" />
        <path fill="#2eb57d" d="M100.745 47.281c0-7.33 5.978-13.317 13.309-13.317c7.33 0 13.317 5.987 13.317 13.317s-5.987 13.317-13.317 13.317h-13.309zm-6.709 0c0 7.33-5.987 13.317-13.317 13.317s-13.317-5.986-13.317-13.317V13.946C67.402 6.616 73.388.63 80.719.63c7.33 0 13.317 5.987 13.317 13.317zm0 0" />
        <path fill="#ebb02e" d="M80.719 100.745c7.33 0 13.317 5.978 13.317 13.309c0 7.33-5.987 13.317-13.317 13.317s-13.317-5.987-13.317-13.317v-13.309zm0-6.709c-7.33 0-13.317-5.987-13.317-13.317s5.986-13.317 13.317-13.317h33.335c7.30 0 13.317 5.986 13.317 13.317c0 7.33-5.987 13.317-13.317 13.317zm0 0" />
      </svg>
    ),
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    desc: "Send and receive messages",
    color: "from-emerald-500 to-green-600",
    icon: (
      <svg viewBox="0 0 256 258" className="size-6">
        <defs>
          <linearGradient id="wa0" x1="50%" x2="50%" y1="100%" y2="0%">
            <stop offset="0%" stopColor="#1FAF38" />
            <stop offset="100%" stopColor="#60D669" />
          </linearGradient>
          <linearGradient id="wa1" x1="50%" x2="50%" y1="100%" y2="0%">
            <stop offset="0%" stopColor="#F9F9F9" />
            <stop offset="100%" stopColor="#FFF" />
          </linearGradient>
        </defs>
        <path fill="url(#wa0)" d="M5.463 127.456c-.006 21.677 5.658 42.843 16.428 61.499L4.433 252.697l65.232-17.104a122.994 122.994 0 0 0 58.8 14.97h.054c67.815 0 123.018-55.183 123.047-123.01c.013-32.867-12.775-63.773-36.009-87.025c-23.23-23.25-54.125-36.061-87.043-36.076c-67.823 0-123.022 55.18-123.05 123.004" />
        <path fill="url(#wa1)" d="M1.07 127.416c-.007 22.457 5.86 44.38 17.014 63.704L0 257.147l67.571-17.717c18.618 10.151 39.58 15.503 60.91 15.511h.055c70.248 0 127.434-57.168 127.464-127.423c.012-34.048-13.236-66.065-37.3-90.15C194.633 13.286 162.633.014 128.536 0C58.276 0 1.099 57.16 1.071 127.416Zm40.24 60.376l-2.523-4.005c-10.606-16.864-16.204-36.352-16.196-56.363C22.614 69.029 70.138 21.52 128.576 21.52c28.3.012 54.896 11.044 74.9 31.06c20.003 20.018 31.01 46.628 31.003 74.93c-.026 58.395-47.551 105.91-105.943 105.91h-.042c-19.013-.01-37.66-5.116-53.922-14.765l-3.87-2.295l-40.098 10.513l10.706-39.082Z" />
        <path fill="#ffffff" d="M96.678 74.148c-2.386-5.303-4.897-5.41-7.166-5.503c-1.858-.08-3.982-.074-6.104-.074c-2.124 0-5.575.799-8.492 3.984c-2.92 3.188-11.148 10.892-11.148 26.561c0 15.67 11.413 30.813 13.004 32.94c1.593 2.123 22.033 35.307 54.405 48.073c26.904 10.609 32.379 8.499 38.218 7.967c5.84-.53 18.844-7.702 21.497-15.139c2.655-7.436 2.655-13.81 1.859-15.142c-.796-1.327-2.92-2.124-6.105-3.716c-3.186-1.593-18.844-9.298-21.763-10.361c-2.92-1.062-5.043-1.592-7.167 1.597c-2.124 3.184-8.223 10.356-10.082 12.48c-1.857 2.129-3.716 2.394-6.9.801c-3.187-1.598-13.444-4.957-25.613-15.806c-9.468-8.442-15.86-18.867-17.718-22.056c-1.858-3.184-.199-4.91 1.398-6.497c1.431-1.427 3.186-3.719 4.78-5.578c1.588-1.86 2.118-3.187 3.18-5.311c1.063-2.126.531-3.986-.264-5.579c-.798-1.593-6.987-17.343-9.819-23.64" />
      </svg>
    ),
  },
  {
    id: "telegram",
    name: "Telegram",
    desc: "Chat and search conversations",
    color: "from-blue-500 to-cyan-500",
    icon: (
      <svg viewBox="0 0 256 256" className="size-6">
        <defs>
          <linearGradient id="tg" x1="50%" x2="50%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#2AABEE" />
            <stop offset="100%" stopColor="#229ED9" />
          </linearGradient>
        </defs>
        <path fill="url(#tg)" d="M128 0C94.06 0 61.48 13.494 37.5 37.49A128.038 128.038 0 0 0 0 128c0 33.934 13.5 66.514 37.5 90.51C61.48 242.506 94.06 256 128 256s66.52-13.494 90.5-37.49c24-23.996 37.5-56.576 37.5-90.51c0-33.934-13.5-66.514-37.5-90.51C194.52 13.494 161.94 0 128 0Z" />
        <path fill="#ffffff" d="M57.94 126.648c37.32-16.256 62.2-26.974 74.64-32.152c35.56-14.786 42.94-17.354 47.76-17.441c1.06-.017 3.42.245 4.96 1.49c1.28 1.05 1.64 2.47 1.82 3.467c.16.996.38 3.266.2 5.038c-1.92 20.24-10.26 69.356-14.5 92.026c-1.78 9.592-5.32 12.808-8.74 13.122c-7.44.684-13.08-4.912-20.28-9.63c-11.26-7.386-17.62-11.982-28.56-19.188c-12.64-8.328-4.44-12.906 2.76-20.386c1.88-1.958 34.64-31.748 35.26-34.45c.08-.338.16-1.598-.6-2.262c-.74-.666-1.84-.438-2.64-.258c-1.14.256-19.12 12.152-54 35.686c-5.1 3.508-9.72 5.218-13.88 5.128c-4.56-.098-13.36-2.584-19.9-4.708c-8-2.606-14.38-3.984-13.82-8.41c.28-2.304 3.46-4.662 9.52-7.072Z" />
      </svg>
    ),
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    desc: "Professional network access",
    color: "from-blue-600 to-blue-800",
    icon: (
      <svg viewBox="0 0 256 256" className="size-6">
        <g fill="none">
          <rect width="256" height="256" fill="#0A66C2" rx="60" />
          <path fill="#fff" d="M184.715 217.685h29.27a4 4 0 0 0 4-3.999l.015-61.842c0-32.323-6.965-57.168-44.738-57.168c-14.359-.534-27.9 6.868-35.207 19.228a.32.32 0 0 1-.595-.161V101.66a4 4 0 0 0-4-4h-27.777a4 4 0 0 0-4 4v112.02a4 4 0 0 0 4 4h29.268a4 4 0 0 0 4-4v-55.373c0-15.657 2.97-30.82 22.381-30.82c19.135 0 19.383 17.916 19.383 31.834v54.364a4 4 0 0 0 4 4ZM38 59.627c0 11.865 9.767 21.627 21.632 21.627c11.862-.001 21.623-9.769 21.623-21.631C81.253 47.761 71.491 38 59.628 38C47.762 38 38 47.763 38 59.627Zm6.959 158.058h29.307a4 4 0 0 0 4-4V101.66a4 4 0 0 0-4-4H44.959a4 4 0 0 0-4 4v112.025a4 4 0 0 0 4 4Z" />
        </g>
      </svg>
    ),
  },
]

export default function IntegrationsPage() {
  const integrations = useIntegrationStore((s) => s.integrations)
  const setIntegrations = useIntegrationStore((s) => s.setIntegrations)
  const addIntegration = useIntegrationStore((s) => s.addIntegration)
  const [pendingApp, setPendingApp] = useState<typeof apps[number] | null>(null)
  const userId = useUserStore((s) => s.user?._id)

  const isConnected = (id: string) => integrations.some((i) => i.provider === id)
  const totalConnected = integrations.length

  useEffect(() => {
    if (!userId) return
    const params = new URLSearchParams(window.location.search)
    if (params.get("success") === "true" && params.get("provider")) {
      addIntegration({ id: "", provider: params.get("provider")! })
      window.history.replaceState({}, "", "/integrations")
    }

    api.get(`/api/auth/integrations/${userId}`).then((res) => {
      setIntegrations(res.data.data ?? [])
    }).catch((err) => console.error("integrations error:", err))
  }, [setIntegrations, addIntegration, userId])

  const confirmConnect = async () => {
    if (!pendingApp || pendingApp.id !== "google") return
    const appId = pendingApp.id
    setPendingApp(null)
    try {
      const { data } = await api.get(`/api/auth/${appId}`, { params: { userId } })
      window.location.href = data.url
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggle = (app: typeof apps[number]) => {
    if (app.id !== "google") return
    if (isConnected(app.id)) {
      useIntegrationStore.getState().removeIntegration(app.id)
    } else {
      setPendingApp(app)
    }
  }

  return (
    <div className="flex flex-col items-center flex-1 min-h-0">
      <div className="w-full max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 dark:shadow-blue-500/15 ring-1 ring-white/20">
                <Plug className="size-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Integrations</h1>
                <p className="text-sm text-muted-foreground/80">
                  Connect your tools to SIFT
                </p>
              </div>
            </div>
            {totalConnected > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {totalConnected} active
                </span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground/60 max-w-lg">
            Sync your accounts to search across emails, messages, files, and more — all from one place.
          </p>
        </div>

        {/* Integration grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {apps.map((app) => {
            const isOn = isConnected(app.id)
            return (
              <button
                key={app.id}
                onClick={() => handleToggle(app)}
                disabled={app.id !== "google"}
                className={`group relative w-full text-left rounded-2xl border p-5 transition-all duration-200 ${
                  app.id !== "google"
                    ? "opacity-40 cursor-not-allowed"
                    : "cursor-pointer"
                } ${
                  isOn
                    ? "bg-card border-emerald-500/30 dark:border-emerald-500/25 shadow-sm shadow-emerald-500/5"
                    : "bg-card/30 dark:bg-card/50 border-border/60 dark:border-border/60 hover:bg-card hover:border-border hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="size-12 rounded-xl bg-muted/60 dark:bg-muted/30 flex items-center justify-center shrink-0 ring-1 ring-border/40 dark:ring-white/5">
                      {app.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        {app.name}
                        {isOn && (
                          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 px-1.5 py-0.5 rounded-full">
                            Connected
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        {isOn ? "Search across your data" : app.desc}
                      </p>
                    </div>
                  </div>

                  <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-300 ${
                    isOn
                      ? "bg-blue-500"
                      : "bg-muted-foreground/15 dark:bg-muted-foreground/20 group-hover:bg-muted-foreground/25"
                  }`}>
                    <span className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                      isOn ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </div>
                </div>

                {isOn && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-500/8 dark:bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/15">
                      <Check className="size-2.5" />
                      Active
                    </span>
                  </div>
                )}

                {!isOn && (
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground/40 transition-colors">
                    {app.id === "google" ? (
                      <>
                        <ArrowUpRight className="size-3" />
                        Click to connect
                      </>
                    ) : (
                      "Coming soon"
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <Dialog open={!!pendingApp} onOpenChange={(o) => { if (!o) setPendingApp(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="size-10 rounded-lg bg-muted/60 flex items-center justify-center">
                {pendingApp?.icon}
              </div>
              <div>
                <DialogTitle className="text-base">Connect {pendingApp?.name}</DialogTitle>
                <p className="text-xs text-muted-foreground/70 mt-0.5">Authorize access to your account</p>
              </div>
            </div>
            {pendingApp?.services ? (
              <DialogDescription className="pt-3">
                This will give SIFT read access to the following Google services:
              </DialogDescription>
            ) : (
              <DialogDescription className="pt-3">
                You&apos;ll be redirected to {pendingApp?.name} to authorize access. We only request read permissions.
              </DialogDescription>
            )}
          </DialogHeader>
          {pendingApp?.services && (
            <div className="space-y-2 py-1">
              {pendingApp.services.map((svc, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                  <div className="size-2 rounded-full bg-blue-500/60 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{svc.name}</p>
                    <p className="text-xs text-muted-foreground/70">{svc.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <DialogFooter className="gap-2 pt-1">
            <Button variant="outline" onClick={() => setPendingApp(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={confirmConnect} className="rounded-xl">
              <ShieldCheck className="size-4" />
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
