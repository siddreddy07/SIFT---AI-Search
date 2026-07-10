import {
  Play,
  Eye,
  Clock3,
  Share2,
  Heart,
  ExternalLink,
  ArrowUpRight,
  Bookmark,
} from "lucide-react";
import { YoutubeLogo } from "./YoutubeLogo"

const formatNumber = (n?: number) => {
  if (n == null) return ""
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n)
}

const formatDate = (date?: string) => {
  if (!date) return ""
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / 86400000)

  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export const VideoSheet = ({ results }: { results: any[] }) => (
   <div className="grid grid-cols-1 p-2 md:grid-cols-2 xl:grid-cols-3 gap-4">
  {results.map((video, index) => (
    <article
  key={index}
    className="
    group
    overflow-hidden
    rounded-2xl
    border
    border-zinc-200 dark:border-zinc-700
    bg-white dark:bg-zinc-900
    shadow-sm
    transition-all
    duration-300
    hover:shadow-lg
  "
>
  {/* THUMBNAIL ONLY CLICKABLE */}
  <a
    href={`https://youtube.com/watch?v=${video.videoId}`}
    target="_blank"
    rel="noopener noreferrer"
    className="relative block overflow-hidden"
  >
    <img
      src={
        video.thumbnail ??
        `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`
      }
      alt={video.title}
      className="
        aspect-video
        w-full
        object-cover
        transition-transform
        duration-500
        group-hover:scale-105
      "
    />

    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

    {/* Play Button */}
    <div
      className="
        absolute
        inset-0
        flex
        items-center
        justify-center
      "
    >
      <div
        className="
          h-11
          w-11
          rounded-full
          bg-white/95
          backdrop-blur
          flex
          items-center
          justify-center
          shadow-lg
          transition-transform
          duration-300
          group-hover:scale-110
        "
      >
        <Play
          size={16}
          className="fill-black text-black ml-0.5"
        />
      </div>
    </div>

    {/* Duration */}
    <div
      className="
        absolute
        bottom-2
        right-2
        rounded-md
        bg-black/80
        px-2
        py-1
        text-[11px]
        font-medium
        text-white
      "
    >
      {video.duration}
    </div>
  </a>

  {/* CONTENT */}
  <div className="p-3">
    
    {/* Title */}
    <h3
      className="
        line-clamp-2
        text-sm
        font-semibold
        leading-5
        text-zinc-900 dark:text-zinc-100
      "
    >
      {video.title}
    </h3>

    {/* Channel */}
    <div className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
      {video.channel}
    </div>

    {/* Stats */}
    <div
      className="
        mt-3
        flex
        flex-wrap
        items-center
        gap-3
        text-[11px]
        text-zinc-500
      "
    >
      <div className="flex items-center gap-1">
        <Eye size={12} />
        <span>{formatNumber(video.views)}</span>
      </div>

      <div className="flex items-center gap-1">
        <Heart size={12} />
        <span>{formatNumber(video.likes)}</span>
      </div>

      <div className="flex items-center gap-1">
        <Clock3 size={12} />
        <span>{formatDate(video.publishedAt)}</span>
      </div>
    </div>
  </div>
</article>
  ))}
</div>
)
