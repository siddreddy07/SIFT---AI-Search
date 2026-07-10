import { ChatGroq } from "@langchain/groq"
import { z } from "zod"
const model = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0.5,
})

const pillSchema = z.object({
  pills: z.array(z.object({
    id: z.string().describe("The _id of the message this pill relates to, or 'pill_N' if no messages"),
    text: z.string().max(60).describe("MUST follow format: 'Entity — what it helps with'. Entity name + dash + service description. Example: 'Google SWE — skill match'. Never just entity name alone."),
    prompt: z.string().max(220).describe("Insightful, natural question the user would ask any AI about this specific message. Shows deep understanding of the content."),
    provider: z.enum(["gmail", "slack", "telegram", "youtube", "calendar", ""]).describe("EXACTLY the source value from the message — never derived from sender name"),
  })).max(5).describe("0-5 high-value suggestion pills — quality over quantity"),
})

const structuredModel = model.withStructuredOutput(pillSchema)

function cleanBody(body) {
  return body
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<a[^>]*>(unsubscribe|click here|view in browser|manage preferences|update preferences)<\/a>/gi, "")
    .replace(/\[unsubscribe\].*$/gim, "")
    .replace(/\[click here\].*$/gim, "")
    .replace(/(unsubscribe|click here|view in browser)\s*\|?.{0,80}$/gim, "")
    .replace(/(if you\s+(can['\u2019]t|don['\u2019]t|wish to|no longer|prefer not to)).{0,200}$/gim, "")
    .replace(/follow\s+(@|us\s+on|me\s+on).{0,100}$/gim, "")
    .replace(/(copyright|©|all rights reserved).{0,100}$/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, "")
    .trim()
    .slice(0, 600)
}

function buildPrompt(messages) {
  let context = `Current time: ${new Date().toLocaleString("en-US", { weekday: "long", hour: "numeric", minute: "2-digit", timeZoneName: "short" })}`

  if (messages?.length) {
    console.log('Messages Length :',messages?.length)
    const formatted = messages.map((m, i) => {
      const body = cleanBody(m.body || "")
      if (!body) return null
      return `[${i + 1}] _id: ${m._id} (${m.source}) From: ${m.from} | To: ${(m.to || []).join(", ")}${m.subject ? ` | Subject: ${m.subject}` : ""}\nBody: ${body}`
    }).filter(Boolean).join("\n\n")

    if (formatted) {
      context += `\n\nLatest messages from the user's connected services:\n${formatted}`
    }
  }

  return context
}

const fallbackPills = [
  { id: "pill_1", text: "🔥 What's trending in tech today", prompt: "What's breaking in tech today?", provider: "" },
  { id: "pill_2", text: "📋 Plan your day ahead", prompt: "Help me plan my day efficiently", provider: "calendar" },
  { id: "pill_3", text: "🧠 Learn something cool", prompt: "Teach me something interesting and useful", provider: "" },
]

export const homepillService = async ({ messages } = {}) => {
  try {
    const context = buildPrompt(messages)
    const result = await structuredModel.invoke([
      ["system", `Generate 0-5 suggestion pills from messages that are directly about the user — jobs, interviews, offers, rejections, meetings, work docs, orders, receipts, events, travel.

SKIP everything else: spam, promos, social notifs, welcome emails, auto-replies, newsletters, explore/job-search type content.

For each:
- id = _id, provider = source (gmail/slack/etc)
- text = max 60 chars. Format: "Entity — what it helps with". NEVER entity alone.
- prompt = max 220 chars. An insightful question about the message.

Examples: "Google SWE — skill match" | "Amazon offer — comp breakdown" | "Flight BA-178 — change policy"

AI helps understand, analyze, prepare, compare, or summarize. Never suggest the user do actions (apply, send, accept, etc). No reminders.
`],
      ["human", context],
    ])

    const ids = result.pills.map(p => p.id)
    const dups = ids.filter((id, i) => ids.indexOf(id) !== i)
    if (dups.length) console.log('Duplicate pill IDs:', [...new Set(dups)])
    return result.pills
  } catch (error) {
    console.error("homepillService error:", error)
    return fallbackPills
  }
}
