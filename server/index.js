import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connectDb } from './src/config/db.js'
import { orchestrate } from './src/ai/orchestrator.js'
import {WebSocketServer} from 'ws'
import { z } from 'zod'
import { expressZodValidations } from 'express-zod-validations'
import authRoutes from './src/routes/auth.routes.js'
import chatRoutes from './src/routes/chat.routes.js'
import messageRoutes from './src/routes/message.routes.js'
import webhookRoutes from './src/routes/webhook.routes.js'
import homePillRoutes from './src/routes/homePill.routes.js'
import fileRoutes from './src/routes/file.routes.js'
import notificationRoutes from './src/routes/notification.routes.js'
import jobsRoutes from './src/routes/jobs.routes.js'
import discoverRoutes from './src/routes/discover.routes.js'
import userRoutes from './src/routes/user.routes.js'

const app = express()
const PORT = process.env.PORT || 8000

app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use(expressZodValidations({ overwriteRequest: true, throwErrors: true }))

app.use('/api/auth', authRoutes)
app.use('/api/chats', chatRoutes)
app.use('/api/messages', messageRoutes)
app.use('/webhooks', webhookRoutes)
app.use('/api/home-pills', homePillRoutes)
app.use('/api/file', fileRoutes)
app.use('/api/jobs', jobsRoutes)
app.use('/api/discover', discoverRoutes)
app.use('/api/user',userRoutes)

app.use((err, _req, res, _next) => {
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
    })
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.get("/", (req, res) => {
  res.send("<h1>Hello From Server</h1>")
})

app.use('/api',notificationRoutes)

connectDb()

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`))


const userWsMap = new Map()

const wss = new WebSocketServer({ server, path: '/ws' })

wss.on('connection', (ws, req) => {
  const userId = new URL(req.url, 'http://x').searchParams.get('userId')
  if (!userId) return ws.close(4001)

  ws.id = userId
  userWsMap.set(userId, ws)
  console.log('User connected:', userId)

  ws.send(JSON.stringify({ type: 'connected', id: ws.id }))

  const send = (data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data))
    }
  }

  ws.on('close', (code, reason) => {
    userWsMap.delete(userId)
    console.log('Client disconnected:', userId, 'code:', code, 'reason:', reason?.toString())
  })

  ws.on('error', (err) => console.error('WS error:', err.message))
  ws.on('message', async (data) => {
    try {
      const query = JSON.parse(data.toString())
      query.userId = query.userId || ws.id
      const result = await orchestrate(query, (event) => send(event))
      send({ type: 'done', data: result })
    } catch (error) {
      console.error('Handler error:', error)
      send({ type: 'error', data: error.message })
    }
  })
})