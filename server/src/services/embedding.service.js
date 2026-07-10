const COHERE_API_URL = "https://api.cohere.com/v2/embed"

export const embed = async (texts, inputType = "search_document") => {
  const res = await fetch(COHERE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "embed-english-v3.0",
      input_type: inputType,
      texts,
      embedding_types: ["float"],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Cohere API error: ${res.status}`)
  }

  const data = await res.json()
  return data.embeddings.float
}

export const embedQuery = (text) => embed([text], "search_query")
export const embedDocuments = (texts) => embed(texts, "search_document")
