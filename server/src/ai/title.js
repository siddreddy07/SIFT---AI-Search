import { ChatOllama } from "@langchain/ollama"
import { z } from "zod"

const model = new ChatOllama({
  model: "qwen2.5:7b-instruct",
  temperature: 0.7,
})

const titleSchema = z.object({
  title: z.string().max(80).default("New Chat"),
  subtitle: z.string().max(120).default(""),
})

export async function generateTitle({query, chatId, userId, onEvent, sources}) {
  try {
    const birefAnswer = sources
    const prompt = birefAnswer
      ? `Query: ${query}\n\nBrief Answer: ${birefAnswer}`
      : query

    console.log('Title Generation hit')

    const stream = await model.stream([
      ["system", "Output ONLY this JSON format, nothing else. No markdown, no backticks, no explanation:\n{\"title\": \"short title\", \"subtitle\": \"short subtitle\"}"],
      ["human", prompt],
    ])

    let full = ""
    for await (const chunk of stream) {
      full += chunk.content
      onEvent?.({ type: "title_token", userId, chatId, data: chunk.content })
    }

    // Strip markdown code blocks if present
    const cleaned = full.replace(/```[\s\S]*?```/g, (m) => m.replace(/```json?\n?/g, "").replace(/```/g, "").trim()).trim()
    const parsed = JSON.parse(cleaned)
    const validated = titleSchema.parse(parsed)
    console.log('Title :', validated)
    onEvent?.({ type: "title_done", userId, chatId, data: validated })
    return validated
  } catch (error) {
    console.log('Error :', error)
    const fallback = { title: query.slice(0, 80), subtitle: "" }
    onEvent?.({ type: "title_done", userId, chatId, data: fallback })
    return fallback
  }
}
