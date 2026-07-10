import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import * as chatService from "../services/chat.service.js"
import * as messageService from "../services/message.service.js"
import { tools } from "./tools.js"
import { generateTitle } from "./title.js"
import { toolSelectionPrompt, finalAnswerPrompt } from "./prompts.js"
import { redis, redisKeys } from "../config/redis.js"
import { getDb } from "../config/db.js";
import { ObjectId } from "mongodb";

const model = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0.7,
})

const toolsByName = Object.fromEntries(
  tools.map((tool) => [tool.name, tool])
)

function emit(onEvent, userId, event) {
  onEvent?.({ userId, ...event })
}

function parseToolCalls(content) {
  const regex = /<function=(\w+)>([\s\S]*?)<\/function>/g
  const calls = []
  let match
  while ((match = regex.exec(content)) !== null) {
    try {
      const args = JSON.parse(match[2].trim())
      calls.push({ name: match[1], args })
    } catch {
      calls.push({ name: match[1], args: { query: match[2] } })
    }
  }
  return calls
}

async function executeTools(toolCalls, botId, onEvent, userId) {
  const sources = {}
  const contextParts = []

  await Promise.all(toolCalls.map(async (call) => {
    const tool = toolsByName[call.name]
    if (!tool) return

    emit(onEvent, userId, { type: "tool_start", botId, data: { tool: call.name, botId, args: call.args } })

    const raw = await tool.func(call.args)
    let parsed = raw
    if (typeof raw === "string") {
      try { parsed = JSON.parse(raw) } catch { parsed = raw }
    }

    emit(onEvent, userId, { type: "tool_result", botId, data: { tool: call.name, result: parsed } })

    sources[call.name] = Array.isArray(parsed) ? parsed : [parsed]
    contextParts.push(`${call.name}:\n${JSON.stringify(parsed, null, 2)}`)
  }))

  return { sources, contextParts }
}

function buildHistory(messages, userId, selectedPillId, selectedPillProvider, selectedPillPrompt, selectedPillText) {
  const { lastN, chatId } = messages
  const lastUserMsg = [...lastN].reverse().find(m => (m.role || m.sender) === "user") ?? {}
  const query = selectedPillPrompt || (lastUserMsg.content ?? lastUserMsg.text ?? "")

  console.log('Query :',query)

  const hasFileIds = lastN?.some(m => m.fileIds?.length)
  const fileIds = [...new Set(lastN?.flatMap(m => m.fileIds ?? []))]
  const mentionsUserContent = /(upload|doc|file|pdf|image|provided|shared|sent|gave|my file|my doc|my pdf|my image|my upload|according to|that (file|doc|pdf|image|upload)|yesterday.*(file|doc|pdf|image|upload)|(last time|earlier|previously).*(file|doc|pdf|image|upload))/i.test(query)

  const history = [
    new SystemMessage(toolSelectionPrompt({ userId, hasFileIds, mentionsUserContent, fileIds, selectedPillId, selectedPillProvider, selectedPillText })),
    ...lastN.map((m) => {
      let content = m.content ?? m.text ?? ""
      if (m.fileIds?.length) {
        content += `\n\n[Attached fileIds: ${m.fileIds.join(", ")}]`
      }
      return (m.role || m.sender) === "user" ? new HumanMessage(content) : new AIMessage(content)
    }),
  ]

  return { history, query, fileIds, hasFileIds, mentionsUserContent }
}

function buildFinalPrompt({ query, isIdentityQuestion, hasFileIds, mentionsUserContent, toolCalls, contextParts, lastN, pillProvider }) {
  const system = new SystemMessage(finalAnswerPrompt({ isIdentityQuestion, query, hasFileIds, mentionsUserContent, toolCalls, contextParts, pillProvider }))
  const context = toolCalls.length > 0
    ? `Tool results:\n${contextParts.join("\n")}`
    : `User query: "${query}"\nNo tools needed — answer directly.`

  return [
    system,
    ...lastN.map((m) => {
      let content = m.content ?? m.text ?? ""
      if (m.fileIds?.length) {
        content += `\n\n[Attached fileIds: ${m.fileIds.join(", ")}]`
      }
      return (m.role || m.sender) === "user" ? new HumanMessage(content) : new AIMessage(content)
    }),
    new HumanMessage(context),
  ]
}

export async function orchestrate(messages, onEvent) {
  const { botId, chatId, userId, selectedPill } = messages
  const selectedPillId = selectedPill?.id
  const selectedPillProvider = selectedPill?.provider
  const selectedPillPrompt = selectedPill?.prompt
  const selectedPillText = selectedPill?.text

  console.log('lastN Messages :', messages.lastN)

  if (chatId && userId) {
    const cached = await redis.get(redisKeys.chat(userId, chatId))
    if (cached) {
      const data = JSON.parse(cached)
      const chat = data.chat || data
      const cachedMessages = data.messages ?? []

      console.log('Cached Messages :', cachedMessages)

      messages.lastN = [...cachedMessages, ...messages.lastN]
    }
  }

  const { history, query, hasFileIds, mentionsUserContent } = buildHistory(messages, userId, selectedPillId, selectedPillProvider, selectedPillPrompt, selectedPillText)

  // Step 1: LLM decides which tools to call
  let fullContent = ""
  for await (const chunk of await model.stream(history)) {
    fullContent += chunk.content
  }
  // Step 2: Parse and execute tool calls
  const toolCalls = parseToolCalls(fullContent)
  const { sources, contextParts } = await executeTools(toolCalls, botId, onEvent, userId)

  // Step 3: Generate final answer with tool results
  const isIdentityQuestion = /who are you|what are you|what can you do|what model|how are you (so )?good|tell me about yourself|introduce yourself/i.test(query)
  const finalHistory = buildFinalPrompt({
    query,
    isIdentityQuestion,
    hasFileIds,
    mentionsUserContent,
    toolCalls,
    contextParts,
    lastN: messages.lastN,
    pillProvider: selectedPillProvider,
  })

  let finalAnswer = ""
  for await (const chunk of await model.stream(finalHistory)) {
    if (!chunk.content) continue
    finalAnswer += chunk.content
    emit(onEvent, userId, { type: "token", botId, data: chunk.content })
  }

  emit(onEvent, userId, { type: "done", botId, data: finalAnswer })

  // Step 4: Save to database
  let chatTitle = "New Chat"
  let chat=''

  const isChat = await getDb().collection('chats').findOne({_id:new ObjectId(chatId.toString()),userId})

  if (!isChat) {
    const generated = await generateTitle({ query, chatId, userId, onEvent, sources: finalAnswer })
    chatTitle = generated.title || "New Chat"
    chat = await chatService.createChat({ chatId, userId, title: chatTitle })
  }

  const lastUserMsg = [...messages.lastN].reverse().find(m => (m.role || m.sender) === "user") ?? {}
  const userMsg = await messageService.createMessage({
    msgId: lastUserMsg._id ?? lastUserMsg.id,
    chatId, role: 'user', content: query, userId,
    fileIds: lastUserMsg.fileIds,
  })
  const botMessage = await messageService.createMessage({
    msgId: botId, chatId, role: 'assistant', content: finalAnswer, sources, userId,
  })

  console.log('Saved:', { userMsgId: userMsg._id, botMsgId: botMessage._id, chatId })

  return { answer: finalAnswer }
}
