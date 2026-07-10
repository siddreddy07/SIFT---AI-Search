"use client"

import { useState, useRef, useMemo } from "react"
import { Key, Eye, EyeOff, TriangleAlert, LogOut, Trash2, Copy, Check, Camera } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import useUserStore from "@/store/useUserStore"
import api from "@/lib/axios"
import { Spinner } from "@/components/ui/spinner"

function nameToPokemonId(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return ((Math.abs(hash) % 898) + 1).toString()
}

const PLACEHOLDER_KEYS = {
  normal: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  image: "img-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
}

export default function ProfilePage() {
  const user = useUserStore((s) => s.user)
  const [showKeys, setShowKeys] = useState({ normal: false, image: false })
  const [copied, setCopied] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const pokemonId = useMemo(() => nameToPokemonId(user?.name || "user"), [user?.name])

  const toggleVisibility = (field: "normal" | "image") => {
    setShowKeys((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(field)
      setTimeout(() => setCopied(null), 2000)
    } catch {}
  }

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    console.log('Avatar selected:', file)
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  return (
    <div className="flex items-start justify-center min-h-0 flex-1 bg-gradient-to-b from-zinc-50/80 to-white dark:from-zinc-950 dark:to-zinc-900/80 p-4 md:p-6 overflow-y-auto">
      <div className="w-full max-w-lg mx-auto space-y-6 py-4 md:py-8">

        {/* Avatar & Name */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative size-20 md:size-24">
            <div className="size-full rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-zinc-800 overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="size-full object-cover" />
              ) : (
                <Image
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`}
                  alt="Pokemon avatar"
                  width={96}
                  height={96}
                  className="size-full object-cover"
                />
              )}
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-0.5 -right-0.5 size-7 rounded-full bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Camera size={13} className="text-zinc-500 dark:text-zinc-400" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarSelect}
            />
          </div>
          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-bold text-zinc-800 dark:text-zinc-100">{user?.name || "User"}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{user?.email || ""}</p>
          </div>
        </div>

        {/* API Keys */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
              <Key size={14} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">API Keys</h2>
          </div>

          <div className="space-y-2.5">
            {/* Normal Key */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Normal API Key</label>
                <button
                  onClick={() => toggleVisibility("normal")}
                  className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {showKeys.normal ? <EyeOff size={14} className="text-zinc-400" /> : <Eye size={14} className="text-zinc-400" />}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg px-3 py-2 border border-zinc-100 dark:border-zinc-700">
                  <code className="text-xs font-mono text-zinc-600 dark:text-zinc-300 break-all select-all">
                    {showKeys.normal ? PLACEHOLDER_KEYS.normal : "•".repeat(PLACEHOLDER_KEYS.normal.length)}
                  </code>
                </div>
                <button
                  onClick={() => copyToClipboard(PLACEHOLDER_KEYS.normal, "normal")}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0"
                >
                  {copied === "normal" ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-zinc-400" />}
                </button>
              </div>
            </div>

            {/* Image Key */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Image Generation API Key</label>
                <button
                  onClick={() => toggleVisibility("image")}
                  className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {showKeys.image ? <EyeOff size={14} className="text-zinc-400" /> : <Eye size={14} className="text-zinc-400" />}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg px-3 py-2 border border-zinc-100 dark:border-zinc-700">
                  <code className="text-xs font-mono text-zinc-600 dark:text-zinc-300 break-all select-all">
                    {showKeys.image ? PLACEHOLDER_KEYS.image : "•".repeat(PLACEHOLDER_KEYS.image.length)}
                  </code>
                </div>
                <button
                  onClick={() => copyToClipboard(PLACEHOLDER_KEYS.image, "image")}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0"
                >
                  {copied === "image" ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-zinc-400" />}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
              <TriangleAlert size={14} className="text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
          </div>

          <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Trash2 size={16} className="text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-red-700 dark:text-red-300">Delete Account</h3>
                <p className="text-xs text-red-500/80 dark:text-red-400/70 mt-0.5 leading-relaxed">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button className="mt-3 px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-sm shadow-red-600/20 transition-all duration-150 cursor-pointer">
                  Delete my account
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Logout */}
        <button
          onClick={async () => {
            setLoggingOut(true)
            try {
              const res = await api.post("/api/auth/logout")
              toast.success(res.data.message)
              router.push("/login")
            } catch (err: any) {
              toast.error(err?.response?.data?.message || "Something went wrong")
            } finally {
              setLoggingOut(false)
            }
          }}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 active:scale-[0.98] shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-50"
        >
          <LogOut size={16} />
          {loggingOut ? <Spinner className="size-4 text-zinc-400" /> : "Sign out"}
        </button>

      </div>
    </div>
  )
}
