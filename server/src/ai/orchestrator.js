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
  model: "llama-3.3-70b-versatile",
  temperature: 0.2,
})

const modelWithTools = model.bindTools(tools,{ parallel_tool_calls: true })

const toolsByName = Object.fromEntries(
  tools.map((t) => [t.name, t])
)

function emit(onEvent, userId, event) {
  onEvent?.({ userId, ...event })
}

async function executeTools(toolCalls, botId, onEvent, userId) {
  const sources = {}
  const contextParts = []

  await Promise.all(toolCalls.map(async (call) => {
    const t = toolsByName[call.name]
    if (!t) return

    emit(onEvent, userId, { type: "tool_start", botId, data: { tool: call.name, botId, args: call.args } })

    const raw = await t.invoke(call.args)
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
  const { lastN } = messages
  const lastUserMsg = [...lastN].reverse().find(m => (m.role || m.sender) === "user") ?? {}
  const query = selectedPillPrompt || (lastUserMsg.content ?? lastUserMsg.text ?? "")

  console.log('Query :', query)

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
      const cachedMessages = data.messages ?? []

      console.log('Cached Messages :', cachedMessages)

      messages.lastN = [...cachedMessages, ...messages.lastN]
    }
  }

  const { history, query, hasFileIds, mentionsUserContent } = buildHistory(messages, userId, selectedPillId, selectedPillProvider, selectedPillPrompt, selectedPillText)

  // Step 1: Model decides which tools to call (native tool calling)
  const firstResponse = await modelWithTools.invoke(history)

  console.log("Tool Calls :",firstResponse.tool_calls)

  console.log('Step 1 tool_calls:', firstResponse.tool_calls?.length ? firstResponse.tool_calls.map(tc => tc.name) : 'none')

  let toolCalls = []
  let contextParts = []
  let sources = {}

  if (firstResponse.tool_calls?.length) {
    // Step 2: Execute tool calls
    toolCalls = firstResponse.tool_calls.map(tc => ({ name: tc.name, args: tc.args }))
    const toolResults = await executeTools(toolCalls, botId, onEvent, userId)
    contextParts = toolResults.contextParts
    sources = toolResults.sources

    // Step 3: Send tool results back — simple follow-up, no full history
    const toolContext = toolResults.contextParts.join("\n\n")

    const followUp = [
      new SystemMessage("You are SIFT. Answer using the search results below. Keep it concise. No intros, no TL;DR."),
      new HumanMessage(`Question: ${query}\n\nSearch results:\n${toolContext}`),
    ]

    let finalAnswer = ""
    for await (const chunk of await model.stream(followUp)) {
      if (!chunk.content) continue
      finalAnswer += chunk.content
      emit(onEvent, userId, { type: "token", botId, data: chunk.content })
    }

    emit(onEvent, userId, { type: "done", botId, data: finalAnswer })

    // Step 4: Save to database
    let chatTitle = "New Chat"
    let chat = ''

    const isChat = await getDb().collection('chats').findOne({ _id: new ObjectId(chatId.toString()), userId })

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
  } else {
    // No tool calls — model answered directly
    const finalAnswer = firstResponse.content || ""

    emit(onEvent, userId, { type: "token", botId, data: finalAnswer })
    emit(onEvent, userId, { type: "done", botId, data: finalAnswer })

    // Save to database
    let chatTitle = "New Chat"
    let chat = ''

    const isChat = await getDb().collection('chats').findOne({ _id: new ObjectId(chatId.toString()), userId })

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
}
