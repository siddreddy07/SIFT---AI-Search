import { ChatOpenRouter } from "@langchain/openrouter"
import { z } from "zod"

const model = new ChatOpenRouter("nex-agi/nex-n2-pro:free", {
  temperature: 0.7,
})

const titleSchema = z.object({
  title: z.string().max(80).default("New Chat"),
  subtitle: z.string().max(120).default(""),
})

export async function generateTitle({query, chatId, userId, onEvent, sources}) {
  try {
    const  birefAnswer = sources
    const prompt = birefAnswer
      ? `Query: ${query}\n\nBrief Answer: ${birefAnswer}`
      : query

    const stream = await model.stream([
      ["system", "You are a professional title-crafter. Given a user query and optional search results produce:\n- \"title\": compelling, click-worthy title (max 80 chars)\n- \"subtitle\": short tagline (max 120 chars)\nRules:\n- Output ONLY valid JSON, no markdown\n- Content may have Chinese, Japanese, URLs — only use English content\n- No clickbait, match the topic's tone"],
      ["human", prompt],
    ])

    let full = ""
    for await (const chunk of stream) {
      full += chunk.content
      onEvent?.({ type: "title_token", userId, chatId, data: chunk.content })
    }

    const parsed = JSON.parse(full)
    const validated = titleSchema.parse(parsed)
    onEvent?.({ type: "title_done", userId, chatId, data: validated })
    return validated
  } catch {
    const fallback = { title: query.slice(0, 80), subtitle: "" }
    onEvent?.({ type: "title_done", userId, chatId, data: fallback })
    return fallback
  }
}
