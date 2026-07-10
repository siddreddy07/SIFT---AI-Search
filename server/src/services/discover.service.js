const NEWS_API_URL = 'https://ok.surf/api/v1/news-section'

const ALL_CATEGORIES = [
  'Business',
  'Sports',
  'Technology',
  'Entertainment',
  'Health',
  'Science',
  'World',
]

class DiscoverService {
  async fetchSingle(category) {
    const response = await fetch(NEWS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sections: [category] }),
    })

    if (!response.ok) {
      throw new Error(`News API responded with ${response.status}`)
    }

    const data = await response.json()
    return (data[category] || []).map(a => ({
      source: a.source,
      heading: a.title,
      content: a.title,
      image: a.og,
      url: a.link,
    }))
  }

  async fetchAllCategories() {
    const results = await Promise.all(
      ALL_CATEGORIES.map(cat => this.fetchSingle(cat))
    )
    const grouped = {}
    ALL_CATEGORIES.forEach((cat, i) => { grouped[cat] = results[i] })
    return grouped
  }
}

export const discoverService = new DiscoverService()
