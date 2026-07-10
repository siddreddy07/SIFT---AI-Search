"use client"

import { useEffect, useState } from "react"
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import api from "@/lib/axios"
import { DiaTextReveal } from "@/components/ui/dia-text-reveal"
import { Spinner } from "@/components/ui/spinner"
import useUserStore from "@/store/useUserStore"

export default function LoginPage() {
  const router = useRouter()
  const setUser = useUserStore((s) => s.setUser)
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    api.get("/api/auth/me").then((res) => {
      setUser(res.data.user)
      router.push("/chat/new")
    }).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup"
      const payload =
        mode === "login" ? { email, password } : { name, email, password }

      const res = await api.post(endpoint, payload)
      const user = res.data.user

      setUser(user)
      document.cookie = "isLoggedIn=true; path=/; max-age=86400"
      toast.success(mode === "login" ? "Signed in successfully" : "Account created successfully")
      router.push("/chat/new")
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response: { data: { message: string } } }).response.data.message
          : "Something went wrong"
      toast.error(message)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left - Branding / Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 dark:from-blue-950 dark:via-purple-950 dark:to-indigo-950 flex-col items-center justify-center p-12 overflow-hidden">
        <Image
          src={mode === "login" ? "/Login.png" : "/Signup.png"}
          alt={mode === "login" ? "Login illustration" : "Signup illustration"}
          fill
          className="object-cover"
          priority
        />

        <div className="relative z-10 max-w-md text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-1.5 text-xs font-medium tracking-wide text-white/70 backdrop-blur-sm ring-1 ring-white/20">
            Experience the future of search
          </div>

        <div className="flex items-center justify-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-18 w-auto" />
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight">
            SIFT
          </h1>
        </div>

          <p className="mt-4 text-lg md:text-xl font-light text-white/60">
            <DiaTextReveal
              text="Intelligent search, powered by AI"
              colors={["#60a5fa", "#a78bfa", "#f472b6", "#34d399"]}
              duration={2}
              repeat
              repeatDelay={4}
              className="text-lg md:text-xl"
            />
          </p>

          <div className="mt-12 space-y-3">
            {[
              "Semantic search across all your data",
              "AI-powered answers with source citations",
              "Web, video, and image search in one place",
            ].map((item, i) => (
              <div key={i} className="text-sm font-light text-white/60">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          {/* Mobile banner */}
          <div className="lg:hidden mb-8 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-800 px-4 py-1 text-xs font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
              Experience the future of search
            </div>
              <div className="flex items-center justify-center gap-2">
                        <img src="/logo.png" alt="Logo" className="h-16 w-auto" />
            <h1 className="text-2xl font-bold">
              <DiaTextReveal text="SIFT" duration={2} className="text-2xl font-bold" />
            </h1>
              </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              <DiaTextReveal
                text={mode === "login" ? "Sign in to your account" : "Create your account"}
                colors={["#3b82f6", "#8b5cf6", "#ec4899"]}
                duration={1.8}
                repeat
                repeatDelay={3}
                className="text-sm"
              />
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mb-8">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                mode === "login"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                mode === "signup"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all"
                  />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-2.5 pl-10 pr-10 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all"
                  />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === "login" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-500 dark:text-red-400 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] text-white text-sm font-semibold shadow-lg shadow-blue-600/20 dark:shadow-blue-500/10 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Spinner className="size-4 text-white" />
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button onClick={() => setMode("signup")} className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => setMode("login")} className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
