const YOUTUBE_SEARCH_API = process.env.YOUTUBE_SEARCH_API
const YOUTUBE_VIDEOS_API = process.env.YOUTUBE_VIDEOS_API

export const ytSearch = async (query) => {
  try {
    const searchUrl = `${YOUTUBE_SEARCH_API}?part=snippet&q=${encodeURIComponent(query)}&key=${process.env.YOUTUBE_API_KEY}&maxResults=5&type=video`

    const searchRes = await fetch(searchUrl)
    const searchData = await searchRes.json()
    if (!searchRes.ok) throw new Error(searchData.error?.message || "YouTube API error")

    const videoIds = searchData.items.map((item) => item.id.videoId).join(",")

    const statsUrl = `${YOUTUBE_VIDEOS_API}?part=statistics&id=${videoIds}&key=${process.env.YOUTUBE_API_KEY}`
    const statsRes = await fetch(statsUrl)
    const statsData = await statsRes.json()

    const statsMap = {}
    statsData.items?.forEach((item) => {
      statsMap[item.id] = item.statistics
    })

    return searchData.items.map((item) => {
      const stats = statsMap[item.id.videoId] || {}
      return {
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        description: item.snippet.description,
        videoId: item.id.videoId,
        url: `https://youtube.com/watch?v=${item.id.videoId}`,
        publishedAt: item.snippet.publishedAt,
        views: parseInt(stats.viewCount || 0),
        likes: parseInt(stats.likeCount || 0),
        comments: parseInt(stats.commentCount || 0),
      }
    })
  } catch (error) {
    console.log("Error inside ytSearch :", error)
    throw error
  }
}


const DDG_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json, text/javascript, */*; q=0.01",
  Referer: "https://duckduckgo.com/",
};

export const imageSearchService = async ({ query, count = 5 }) => {
  const html = await (await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`, { headers: DDG_HEADERS })).text();
  const vqd = html.match(/vqd\s*=\s*['"](\d+(?:-\d+)+)['"]/)?.[1];
  if (!vqd) throw new Error("Failed to get search token");

  const params = new URLSearchParams({ l: "us-en", o: "json", q: query, vqd, p: "-1", f: ",,,", s: "0" });
  const data = await (await fetch(`https://duckduckgo.com/i.js?${params}`, { headers: DDG_HEADERS })).json();

  return (data.results || []).slice(0, count).map((img) => ({
    title: img.title,
    image: img.image,
    thumbnail: img.thumbnail,
    url: img.url,
  }));
};

export const webSearchService = async ({ query, count = 5 }) => {
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: DDG_HEADERS,
    })

    const html = await res.text()
    const results = []
    const blocks = html.split('<div class="result results_links results_links_deep')

    for (const block of blocks) {
      if (results.length >= count) break
      const linkMatch = block.match(/uddg=([^&]+)/)
      const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/)
      if (!linkMatch) continue
      results.push({
        url: decodeURIComponent(linkMatch[1]),
        displayUrl: decodeURIComponent(linkMatch[1]),
        snippet: snippetMatch ? snippetMatch[1].replace(/<[^>]*>/g, '').trim() : '',
      })
    }

    return results
  } catch (error) {
    console.log('Web Search Service Error :', error)
    throw error
  }
}