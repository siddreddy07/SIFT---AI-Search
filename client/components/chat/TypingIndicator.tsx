"use client"

export function TypingIndicator() {
  return (
    <div className="flex items-start mt-2">
      <div className="max-w-[85%] rounded-2xl px-4 py-3.5 bg-white dark:bg-zinc-800/80 border border-zinc-100 dark:border-zinc-700/50 rounded-bl-sm shadow-sm">
        <div className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="size-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="size-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  )
}
