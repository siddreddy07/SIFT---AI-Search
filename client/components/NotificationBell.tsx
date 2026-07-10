"use client"

import { useState, useRef, useEffect } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Bell as LucideBell } from "lucide-react"
import useUserStore from "@/store/useUserStore"
import { getProviderIcon } from "@/lib/provider-icons"
import { AnimatedList, AnimatedListItem } from "@/components/ui/animated-list"
import { AnimateIcon } from "@/components/animate-ui/icons/icon"
import { Bell } from "@/components/animate-ui/icons/bell"
import { cn } from "@/lib/utils"
import type { Notification } from "@/store/useUserStore"

const EMPTY_NOTIFICATIONS: Notification[] = []

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const notifications = useUserStore((s) => s.user?.notifications ?? EMPTY_NOTIFICATIONS)
  const totalCount = notifications.reduce((sum, n) => sum + n.length, 0)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative size-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        aria-label="Notifications"
      >
        <AnimateIcon animateOnHover>
          <Bell size={16} className="text-zinc-500 -z-10" />
        </AnimateIcon>
        {totalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center">
            {totalCount > 99 ? "99+" : totalCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute right-0 top-full mt-2",
              "w-72 sm:w-80",
              "rounded-xl border border-zinc-200 dark:border-zinc-800",
              "bg-white dark:bg-zinc-950 shadow-lg overflow-hidden",
            )}
          >
            <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Notifications
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {notifications.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-8">
                  No notifications
                </p>
              ) : (
                <AnimatedList delay={150}>
                  {notifications.map((notif) => (
                    <AnimatedListItem key={notif.type}>
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                        <div className="size-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 shrink-0">
                          {getProviderIcon(notif.type) ?? (
                            <LucideBell className="size-4 text-zinc-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 capitalize">
                            {notif.type}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {notif.length} new{" "}
                            {notif.length === 1
                              ? "notification"
                              : "notifications"}
                          </p>
                        </div>
                        <span className="size-2 rounded-full bg-blue-500 shrink-0" />
                      </div>
                    </AnimatedListItem>
                  ))}
                </AnimatedList>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
