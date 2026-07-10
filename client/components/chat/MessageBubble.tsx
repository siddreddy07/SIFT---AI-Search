"use client"

import { useState } from "react"
import { YoutubeLogo } from "./YoutubeLogo"
import { SiteFavicon } from "./SiteFavicon"
import { ImageCarousel } from "./ImageCarousel"
import { MessageActions } from "./MessageActions"
import { type FileInfo } from "@/store/useMessageStore"
import { getFileTypeIcon } from "@/lib/provider-icons"
import { formatFileSize } from "./FileUpload"

interface Source {
  tool: string
  result: any
}

interface Message {
  _id: string
  role: string
  content: string
  sources?: Source[]
  files?: FileInfo[]
}

const sizeClasses = [
  "col-span-2 row-span-2 aspect-square",
  "col-span-1 row-span-1 aspect-square",
  "col-span-1 row-span-1 aspect-square",
  "col-span-2 row-span-1 aspect-video",
  "col-span-1 row-span-2 aspect-[3/4]",
]

const ImageGrid = ({ images }: { images: any[] }) => {
  const [carouselOpen, setCarouselOpen] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)

  return (
    <>
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {images.slice(0, 5).map((img, i) => (
          <button
            key={i}
            onClick={() => {
              setCarouselIndex(i)
              setCarouselOpen(true)
            }}
            className={`group relative overflow-hidden rounded-lg border border-zinc-200/60 bg-white/50 shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer ${sizeClasses[i] || "col-span-1 row-span-1 aspect-square"}`}
          >
            <img
              src={img.thumbnail || img.image}
              alt={img.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <ImageCarousel
        images={images}
        initialIndex={carouselIndex}
        open={carouselOpen}
        onOpenChange={setCarouselOpen}
      />
    </>
  )
}

export const MessageBubble = ({
  msg,
  onSourceClick,
}: {
  msg: Message
  onSourceClick: (sourceIdx: number) => void
}) => {
  const images = msg.sources?.find((s) => s.tool === "imageSearch")?.result
  const pillSources = msg.sources?.filter((s) => s.tool === "webSearch" || s.tool === "videoSearch")

  return (
    <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
      <div className={`max-w-[85%] rounded-2xl mt-2 px-2 md:px-4 py-2.5 ${
        msg.role === "user"
          ? "bg-blue-500/90 text-white rounded-br-sm shadow-sm"
          : "bg-white dark:bg-zinc-800/80 border border-zinc-100 dark:border-zinc-700/50 rounded-bl-sm shadow-sm"
      }`}>
        {Array.isArray(images) && images.length > 0 && (
          <ImageGrid images={images} />
        )}

        {pillSources && pillSources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {pillSources.map((s, i) => {
              const sourceIdx = msg.sources?.indexOf(s) ?? i
              const isYT  = s.tool === "videoSearch"
              const isWeb = s.tool === "webSearch"
              const count = Array.isArray(s.result) ? s.result.length : 0
              const firstUrl = isWeb && Array.isArray(s.result) && s.result.length > 0
                ? s.result[0].url : null

              return (
                <button
                  key={i}
                  onClick={() => onSourceClick(sourceIdx)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${
                    msg.role === "user"
                      ? "border-white/30 bg-white/15 text-white"
                      : "border-zinc-200 dark:border-zinc-600 bg-zinc-100/70 dark:bg-zinc-700/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-600/50"
                  }`}
                >
                  {isYT && <YoutubeLogo />}
                  {isWeb && firstUrl && <SiteFavicon url={firstUrl} />}
                  <span>{isYT ? "YouTube" : "Web"}</span>
                  {count > 0 && <span className="opacity-50">· {count}</span>}
                </button>
              )
            })}
          </div>
        )}

        {msg.files && msg.files.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {msg.files.map((f, i) => (
              <div
                key={i}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium border ${
                  msg.role === "user"
                    ? "border-white/30 bg-white/15 text-white"
                    : "border-zinc-200 dark:border-zinc-600 bg-zinc-100/70 dark:bg-zinc-700/50 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {getFileTypeIcon(f.mimeType)}
                <span className="max-w-[100px] truncate">{f.originalName}</span>
                <span className="opacity-50">· {formatFileSize(f.size)}</span>
              </div>
            ))}
          </div>
        )}

        <div
          className={`max-w-none ${
            msg.role === "user"
              ? "prose text-white [&_*]:text-inherit"
              : "prose text-foreground dark:text-zinc-200 [&_*]:text-inherit"
          }`}
          dangerouslySetInnerHTML={{ __html: msg.content }}
/>
      </div>
      {msg.role === "assistant" && (
        <MessageActions content={msg.content} messageId={msg._id} />
      )}
    </div>
  )
}
