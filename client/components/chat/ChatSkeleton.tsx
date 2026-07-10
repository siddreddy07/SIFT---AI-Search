"use client"

export function ChatSkeleton() {
  return (
    <div className="space-y-4 py-2">
      {/* User */}
      <div className="flex flex-col items-end">
        <div className="max-w-[75%] w-[50%] rounded-2xl px-4 py-3 bg-blue-500 rounded-br-sm">
          <div className="space-y-2.5">
            <div className="h-3.5 rounded-full w-full shimmer-white" />
            <div className="h-3.5 rounded-full w-[55%] shimmer-white" />
          </div>
        </div>
      </div>

      {/* Assistant with pills */}
      <div className="flex flex-col items-start">
        <div className="max-w-[85%] w-[50%] rounded-2xl px-4 py-3 bg-white dark:bg-zinc-800/80 border border-zinc-100 dark:border-zinc-700/50 rounded-bl-sm shadow-sm">
          <div className="flex gap-1.5 mb-3">
            <div className="h-5 w-16 rounded-full shimmer" />
            <div className="h-5 w-20 rounded-full shimmer" />
          </div>
          <div className="space-y-2.5">
            <div className="h-3.5 rounded-full w-full shimmer" />
            <div className="h-3.5 rounded-full w-full shimmer" />
            <div className="h-3.5 rounded-full w-[91%] shimmer" />
            <div className="h-3.5 rounded-full w-[62%] shimmer" />
          </div>
        </div>
        <div className="flex gap-1.5 mt-1.5 ml-1">
          <div className="size-7 rounded-full shimmer" />
          <div className="size-7 rounded-full shimmer" />
        </div>
      </div>

      {/* Assistant with images */}
      <div className="flex flex-col items-start">
        <div className="max-w-[85%] w-[50%] rounded-2xl px-4 py-3 bg-white dark:bg-zinc-800/80 border border-zinc-100 dark:border-zinc-700/50 rounded-bl-sm shadow-sm">
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            <div className="shimmer col-span-2 row-span-2 aspect-square rounded-lg" />
            <div className="shimmer col-span-1 row-span-1 aspect-square rounded-lg" />
            <div className="shimmer col-span-1 row-span-1 aspect-square rounded-lg" />
          </div>
          <div className="space-y-2.5">
            <div className="h-3.5 rounded-full w-full shimmer" />
            <div className="h-3.5 rounded-full w-[85%] shimmer" />
          </div>
        </div>
        <div className="flex gap-1.5 mt-1.5 ml-1">
          <div className="size-7 rounded-full shimmer" />
          <div className="size-7 rounded-full shimmer" />
        </div>
      </div>

      {/* User */}
      <div className="flex flex-col items-end">
        <div className="max-w-[70%] w-[45%] rounded-2xl px-4 py-3 bg-blue-500 rounded-br-sm">
          <div className="space-y-2.5">
            <div className="h-3.5 rounded-full w-full shimmer-white" />
            <div className="h-3.5 rounded-full w-[82%] shimmer-white" />
            <div className="h-3.5 rounded-full w-[48%] shimmer-white" />
          </div>
        </div>
      </div>
    </div>
  )
}
