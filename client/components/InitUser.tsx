"use client"

import { useEffect } from "react"
import api from "@/lib/axios"
import useUserStore from "@/store/useUserStore"

const LOGIN_PATH = "/login"

export default function InitUser() {
  const setUser = useUserStore((s) => s.setUser)
  const user = useUserStore((s) => s.user)
  const updateNotification = useUserStore((s) => s.updateNotification)

  useEffect(() => {
    if (!user) return

    const es = new EventSource('/api/notification/stream', {
      withCredentials: true,
    })

    es.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type && data.length != null) {
        updateNotification(data.type, data.length)
      }
    }

    return () => es.close()
  }, [user?._id])

  useEffect(() => {
    if (window.location.pathname === "/login") return

    async function checkAuth() {
      try {
        const res = await api.get("/api/auth/me")
        setUser(res.data.user)
        document.cookie = "isLoggedIn=true; path=/; max-age=86400"
      } catch (err: any) {
        const code = err?.response?.data?.code

        if (code === "TOKEN_EXPIRED") {
          try {
            const refreshRes = await fetch("/api/auth/refresh-token", { method: "POST", credentials: "include" })
            if (refreshRes.ok) {
              const res = await api.get("/api/auth/me")
              setUser(res.data.user)
              document.cookie = "isLoggedIn=true; path=/; max-age=86400"
              return
            }
          } catch {}
        }

        document.cookie = "isLoggedIn=; path=/; max-age=0"
      }
    }

    checkAuth()
  }, [setUser])

  return null
}
