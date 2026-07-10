export const SiteFavicon = ({ url }: { url: string }) => {
  const domain = (() => { try { return new URL(url).hostname } catch { return url } })()

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
      className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
      onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
      alt=""
    />
  )
}
