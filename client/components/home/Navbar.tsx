"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Search, Zap, Puzzle, HelpCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import useUserStore from "@/store/useUserStore"

const navLinks = [
  { href: "#features", label: "Features", icon: Search },
  { href: "#how-it-works", label: "How It Works", icon: Zap },
  { href: "#integrations", label: "Integrations", icon: Puzzle },
  { href: "#faq", label: "FAQ", icon: HelpCircle },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const user = useUserStore((s) => s.user)

  return (
    <header className="fixed top-6 inset-x-0 z-50 flex justify-center px-4">
      <div className="w-full max-w-6xl bg-black/20 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl shadow-black/10">
        <div className="flex items-center justify-between px-5 sm:px-7 h-16">
          <Link href="/" className="flex items-center group">
            <img src="/logo.png" alt="Logo" className="h-16 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <link.icon className="size-3.5" />
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild className="hidden md:inline-flex h-9 rounded-xl px-5 text-sm gap-1.5 bg-blue-600 hover:bg-blue-500 text-white">
              <Link href={user ? "/chat/new" : "/login"}>
                Get Started
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden size-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-white/10">
            <div className="px-5 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <link.icon className="size-4" />
                  {link.label}
                </Link>
              ))}
              <Button asChild className="w-full mt-2 rounded-xl gap-1.5 bg-blue-600 hover:bg-blue-500 text-white">
                <Link href={user ? "/chat/new" : "/login"} onClick={() => setMobileOpen(false)}>
                  Get Started
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
