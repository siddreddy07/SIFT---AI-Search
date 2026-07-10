import { tool } from "@langchain/core/tools"
import { z } from "zod"
import { ytSearch, webSearchService, imageSearchService } from "../services/search.service.js"
import { search } from "../services/pinecone.service.js"
import { getUniversalMessages } from "../services/message-store.service.js"

export const tools = [
  tool(
    async ({ query, metadata }) => {
      try {
        const { namespace, ...filters } = metadata || {}
        const matches = await search(query, filters, namespace)
        return JSON.stringify(matches)
      } catch (error) {
        console.error('searchKnowledge failed:', error)
        return JSON.stringify({ error: error.message })
      }
    },
    {
      name: "searchKnowledge",
      description: `Semantic search over the user's personal knowledge base (Pinecone vector store). Use for questions about user's uploaded files, docs, PDFs, images, personal data (emails, messages, calendar events, notes), referencing past conversations or previously shared information. When fileIds are present — always use this. Any query referencing "my", "mine", "my file", "uploaded", "attached".`,
      schema: z.object({
        query: z.array(z.string()).describe("1-3 search queries covering different angles"),
        metadata: z.object({
          namespace: z.string().describe("User ID — Pinecone namespace to scope the search"),
          chatId: z.string().optional().describe("Filter by chat session ID"),
          provider: z.string().optional().describe("Filter by content provider (e.g. youtube, gmail)"),
          content_id: z.string().optional().describe("Filter by specific content ID"),
          fileId: z.string().optional().describe("Filter by specific file ID — use when user asks about an attached file"),
        }).describe("Optional metadata filters to narrow the search scope").optional(),
      }),
    }
  ),
  tool(
    async ({ query }) => {
      try {
        return JSON.stringify(await ytSearch(query))
      } catch (error) {
        return error.message
      }
    },
    {
      name: "videoSearch",
      description: "Search for YouTube videos. Use for sports highlights, match recaps, tutorials, how-to guides, reviews, movie trailers, music videos, gameplay, event recaps, interviews, demos, walkthroughs.",
      schema: z.object({
        query: z.string().describe("Specific subject + type (highlights, recap, review, tutorial)"),
      }),
    }
  ),
  tool(
    async ({ query, count = 5 }) => {
      try {
        return JSON.stringify(await webSearchService({ query, count }))
      } catch (error) {
        return error.message
      }
    },
    {
      name: "webSearch",
      description: "Search the web for current information. Use for news, scores, updates, facts, release dates, reviews, comparisons, research, current events, people, companies, products. HARD RULE: If this call is about a person, movie, product, game, show, brand, place, or event — you MUST also call imageSearch tool in the same turn. Example: webSearch('Christopher Nolan Odyssey release') must be paired with imageSearch('Christopher Nolan Odyssey'). This is mandatory.",
      schema: z.object({
        query: z.string().describe("Search query"),
        count: z.number().default(5).describe("Number of results"),
      }),
    }
  ),
  tool(
    async ({ query, count = 3 }) => {
      try {
        return JSON.stringify(await imageSearchService({ query, count }))
      } catch (error) {
        return error.message
      }
    },
    {
      name: "imageSearch",
      description: "Search for images. HARD RULE: You MUST call this together with webSearch whenever the query is about a person, movie, product, game, show, brand, place, or event. If you call webSearch for any of those categories you MUST also call this tool. Example: for 'When is the new Spider-Man movie releasing?' → call this with query 'Spider-Man'. Query = exact subject name only, no modifiers or questions.",
      schema: z.object({
        query: z.string().describe("Exact subject name — no modifiers, no questions"),
        count: z.number().default(3).describe("Number of results"),
      }),
    }
  ),
  tool(
    async ({ userId, provider, messageId }) => {
      try {
        return JSON.stringify(await getUniversalMessages({ userId, messageId, provider, limit: 50, skip: 0 }))
      } catch (error) {
        console.log('Error inside getProviderMessages:', error)
        return error.message
      }
    },
    {
      name: "getProviderMessages",
      description: "Get messages from a specific provider (gmail, slack, telegram, youtube, calendar). Use for provider-specific queries.",
      schema: z.object({
        userId: z.string(),
        provider: z.string(),
        messageId: z.string(),
      }),
    }
  ),
]
