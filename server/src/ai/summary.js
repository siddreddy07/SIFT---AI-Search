import { ChatOllama } from "@langchain/ollama"
import { z } from "zod"

const model = new ChatOllama({
  model: "qwen2.5:7b-instruct",
  temperature: 0.3,
})

const summarySchema = z.object({
  topicsDiscussed: z.array(z.string()),
  keyDetails: z.array(z.string()),
  currentContext: z.string(),
})

const structuredModel = model.withStructuredOutput(summarySchema)

export async function summarizeMessages(messages) {
  const history = messages.map(m =>
    `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
  ).join("\n---\n")

  const result = await structuredModel.invoke([
    ["system", `You are an expert conversation memory extractor. Summarize the conversation into durable long-term memory.

Return ONLY valid JSON:

{
"topicsDiscussed": [],
"keyDetails": [],
"currentContext": ""
}

Rules:

* Preserve facts exactly. Never invent information.
* Capture BOTH: what the user said/asked and what the AI answered/recommended.
* Ignore greetings, filler, and acknowledgements unless they contain important information.
* Be specific; avoid vague summaries.

topicsDiscussed:

* One entry per distinct topic.
* Each entry: 2-3 sentences describing:

  1. What the user asked/shared.
  2. What the AI explained/recommended.
  3. Any decisions, conclusions, or outcomes.

keyDetails:

* Atomic, self-contained facts only.
* Include: preferences, names, projects, technologies, decisions, code concepts, numbers, constraints, and important recommendations.
* Prefer many small facts over large paragraphs.

currentContext:

* 3-5 sentence handoff for another AI.
* Include: who the user is, what was discussed most recently, what the AI last answered, and any pending questions or next steps.

The summary must allow another AI to continue the conversation without seeing the original messages.
Return ONLY JSON.
`],
    ["human", `Conversation:\n${history}`],
  ])

  return result
}
