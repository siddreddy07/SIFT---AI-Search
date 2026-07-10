"use client"

import { useState } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Check, Copy } from "lucide-react"

export function CodeBlock({ children, className, ...props }: { children?: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false)
  const match = /language-(\w+)/.exec(className || "")
  const language = match ? match[1] : ""
  const code = String(children).replace(/\n$/, "")

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!language) {
    return (
      <code className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-sm font-mono">
        {children}
      </code>
    )
  }

  return (
    <div className="relative group my-4">
      <div className="flex items-center justify-between rounded-t-lg bg-zinc-800 px-4 py-1.5 text-xs !text-zinc-400">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 !text-zinc-400 transition-colors hover:!text-white cursor-pointer"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
