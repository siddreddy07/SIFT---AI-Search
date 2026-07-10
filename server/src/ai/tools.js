import { ytSearch, webSearchService, imageSearchService } from "../services/search.service.js"
import { search } from "../services/pinecone.service.js"
import { getUniversalMessages } from "../services/message-store.service.js"

export const tools = [
  {
    name: "searchKnowledge",
    description: `Semantic search over the user's personal knowledge base (Pinecone vector store). Embeds queries via Cohere and retrieves similar chunks.

USE THIS FOR:
- Questions about user's uploaded files, docs, PDFs, images ("what did I upload", "according to the file", "yesterday's doc")
- Personal data (emails, messages, calendar events, notes)
- Referencing past conversations or previously shared information
- When fileIds are present in the user message — always use this to search file contents
- Any query referencing "my", "mine", "my file", "uploaded", "attached"

HOW TO USE:
- queries (string[]): 1-3 search queries covering different angles
- metadata.namespace (string, REQUIRED): userId — scopes to that user's vectors
- metadata.provider (string, optional): filter by source (gmail, calendar, telegram, slack, file)
- metadata.chatId (string, optional): filter by chat session
- metadata.content_id (string, optional): filter by specific content ID
- metadata.fileId (string, optional): filter by specific file ID — omit for a general knowledge search

IMPORTANT: Works WITHOUT fileId too — omitting fileId searches ALL user content. Always call this for personal/document queries.`,
    schema: {
      type: "object",
      properties: {
        query: {
          type: "array",
          items: { type: "string" },
          description: "Search queries to embed and search against the knowledge base",
        },
        metadata: {
          type: "object",
          properties: {
            namespace: { type: "string", description: "User ID — used as the Pinecone namespace to scope the search" },
            chatId: { type: "string", description: "Filter by chat session ID" },
            provider: { type: "string", description: "Filter by content provider (e.g. youtube, wikipedia)" },
            content_id: { type: "string", description: "Filter by specific content ID" },
            fileId: { type: "string", description: "Filter by specific file ID — use when user asks about an attached/uploaded file" },
          },
          description: "Optional metadata filters to narrow the search scope",
        },
      },
      required: ["query"],
    },
    func: async ({ query, metadata }) => {
      try {
        const { namespace, ...filters } = metadata || {}
        const matches = await search(query, filters, namespace)
        return JSON.stringify(matches)
      } catch (error) {
        console.error('searchKnowledge failed:', error)
        return JSON.stringify({ error: error.message })
      }
    },
  },
  {
    name: "calculate",
    description: "Evaluate a pure math expression (numbers and operators only, no variables)",
    schema: {
      type: "object",
      properties: {
        expression: { type: "string" },
      },
      required: ["expression"],
    },
    func: async ({ expression }) => {
      const sanitized = expression.replace(/,/g, "").replace(/[^0-9+\-*/.() ]/g, "")
      if (!sanitized) return JSON.stringify({ error: "invalid expression" })
      try {
        const fn = new Function(`return (${sanitized})`)
        return JSON.stringify({ result: fn() })
      } catch {
        return JSON.stringify({ error: `could not evaluate "${expression}"` })
      }
    },
  },
  {
    name: "videoSearch",
    description: "Search for YouTube videos. ALWAYS use for sports highlights, match recaps, tutorials, how-to guides, reviews, movie trailers, music videos, gameplay, event recaps, interviews, demos, walkthroughs. Call alongside webSearch + imageSearch for comprehensive answers. Query = specific subject + type (highlights, recap, review, tutorial).",
    schema: {
      type: "object",
      properties: {
        query: { type: "string" },
      },
      required: ["query"],
    },
    func: async ({ query }) => {
      try {
        return JSON.stringify(await ytSearch(query))
      } catch (error) {
        return error.message
      }
    },
  },
  {
    name: "webSearch",
    description: "Search the web for current information. Call for news, scores, updates, facts, reviews, comparisons, research. Call alongside imageSearch for visual topics and videoSearch for sports, tutorials, reviews, events.",
    schema: {
      type: "object",
      properties: {
        query: { type: "string" },
        count: { type: "number" },
      },
      required: ["query", "count"],
    },
    func: async ({ query, count = 5 }) => {
      try {
        return JSON.stringify(await webSearchService({ query, count }))
      } catch (error) {
        return error.message
      }
    },
  },
  {
    name: "imageSearch",
    description: "Search for images. Call alongside webSearch for products, games, movies, people, places, events, sports, comparisons, reviews. Users expect visuals. For sports/matches/highlights, call alongside videoSearch too. IMPORTANT: query = exact subject name only — no modifiers, no questions.",
    schema: {
      type: "object",
      properties: {
        query: { type: "string" },
        count: { type: "number" },
      },
      required: ["query", "count"],
    },
    func: async ({ query, count = 3 }) => {
      try {
        return JSON.stringify(await imageSearchService({ query, count }));
      } catch (error) {
        return error.message;
      }
    },
  },
  {
    name: "getProviderMessages",
    description: "Get messages from a specific provider (gmail, slack, telegram, youtube, calendar). Use for provider-specific queries.",
    schema: {
      type: "object",
      properties: {
        userId: { type: "string" },
        messageId: { type: "string" },
        provider: { type: "string" },
      },
      required: ["userId", "provider","messageId"],
    },
    func: async ({ userId, provider, messageId }) => {
      try {
        return JSON.stringify(await getUniversalMessages({ userId,messageId, provider, limit: 50, skip: 0 }))
        
      } catch (error) {
        console.log('Error inside Toll call (getProviderMessages) :',error)
        return error.message
      }
    },
  },
]
