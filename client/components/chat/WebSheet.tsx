import { SiteFavicon } from "./SiteFavicon"

export const WebSheet = ({ results }: { results: any[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-2 mt-3">
    {results.map((r, i) => {
      const domain = (() => {
        try {
          return new URL(r.url).hostname.replace("www.", "")
        } catch {
          return r.url
        }
      })()

      return (
        <a
          key={i}
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex gap-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-700/50 bg-white dark:bg-zinc-900/80 px-4 py-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-zinc-300 dark:hover:border-zinc-600"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-800/50">
            <SiteFavicon url={r.url} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium tracking-wide uppercase text-zinc-400 dark:text-zinc-500 truncate">
                {domain}
              </span>
            </div>

            <h3 className="mt-1 text-sm font-semibold leading-5 text-zinc-800 dark:text-zinc-200 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {r.title}
            </h3>

            {r.snippet && (
              <p className="mt-1.5 text-xs leading-5 text-zinc-500 dark:text-zinc-400 line-clamp-2">
                {r.snippet}
              </p>
            )}
          </div>

          <div className="absolute top-3 right-3 flex items-center justify-center rounded-full size-6 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 scale-75">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 7h10v10"/>
              <path d="M7 17 17 7"/>
            </svg>
          </div>
        </a>
      )
    })}
  </div>
)
