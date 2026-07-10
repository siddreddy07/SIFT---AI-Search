import { randomUUID } from 'crypto'
import { getDb } from '../config/db.js'
import { redis, redisKeys } from '../config/redis.js'
import { ObjectId } from 'mongodb'
import { IntegrationSchema, SubscriptionSchema } from '../schemas/schema.js'
import {
  GOOGLE_TOKEN_URL,
  GOOGLE_REVOKE_URL,
  GOOGLE_AUTH_URL,
  GMAIL_WATCH_URL,
  CALENDAR_WATCH_URL,
  GMAIL_SCOPES,
  SKIP_LABELS,
} from '../config/google.config.js'
import {
  COLLECTION,
  SUB_COLLECTION,
  STATE_COLLECTION,
  CACHE_TTL,
} from '../config/constants.js'
import { storeMessages } from './message-store.service.js'
import { bulMessageQueue } from '../queues/bulkmessages.queue.js'
import sseManager from '../realtime/sse.manager.js'

export const initiateAuth = async (userId) => {
  const state = randomUUID()

  const col = getDb().collection(STATE_COLLECTION)

  await col.deleteMany({ userId })
  await col.insertOne({
    state,
    userId,
    createdAt: new Date(),
  })

  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    redirect_uri: process.env.REDIRECT_URI,
    response_type: 'code',
    scope: GMAIL_SCOPES.join(' '),
    state,
    access_type: 'offline',
    prompt: 'consent',
  })

  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

export const handleCallback = async (code, state) => {
  const stateDoc = await getDb().collection(STATE_COLLECTION).findOne({ state })
  if (!stateDoc) {
    throw new Error('Invalid or expired state parameter')
  }

  const { userId } = stateDoc
  await getDb().collection(STATE_COLLECTION).deleteOne({ _id: stateDoc._id })

  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenResponse.ok) {
    const errorBody = await tokenResponse.text()
    throw new Error(`Token exchange failed: ${tokenResponse.status} ${errorBody}`)
  }

  const tokens = await tokenResponse.json()

  const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const userInfo = userInfoRes.ok ? await userInfoRes.json() : { email: '' }

  const now = new Date()
  const integration = IntegrationSchema.parse({
    _id: new ObjectId(),
    userId,
    email: userInfo.email || '',
    provider: 'google',
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    tokenExpiresAt: new Date(now.getTime() + tokens.expires_in * 1000),
    scopes: tokens.scope ? tokens.scope.split(' ') : GMAIL_SCOPES,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  })

  await getDb().collection(COLLECTION).insertOne(integration)

  const cacheKey = redisKeys.integrations(userId)
  const cached = await redis.get(cacheKey)
  if (cached) {
    const list = JSON.parse(cached)
    list.unshift({ id: integration._id.toString(), email: integration.email, provider: integration.provider, status: integration.status })
    await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(list))
    console.log('Integration Saved Inside Cache Also',{integration : integration._id})
  }

  const subs = await setupSubscriptions(integration._id.toString(), userId)

  return { integrationId: integration._id.toString(), userId, subscriptions: subs }
}

export const refreshAccessToken = async (integrationId) => {
  const integration = await getDb().collection(COLLECTION).findOne({
    _id: new ObjectId(integrationId),
    status: 'active',
  })

  if (!integration) {
    throw new Error('Active integration not found')
  }

  if (!integration.refreshToken) {
    throw new Error('No refresh token available — user must re-authenticate')
  }

  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      refresh_token: integration.refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!tokenResponse.ok) {
    const errorBody = await tokenResponse.text()
    throw new Error(`Token refresh failed: ${tokenResponse.status} ${errorBody}`)
  }

  const tokens = await tokenResponse.json()

  const now = new Date()
  const updateFields = {
    accessToken: tokens.access_token,
    tokenExpiresAt: new Date(now.getTime() + tokens.expires_in * 1000),
    updatedAt: now,
  }

  await getDb().collection(COLLECTION).updateOne(
    { _id: new ObjectId(integrationId) },
    { $set: updateFields }
  )

  return { accessToken: tokens.access_token, tokenExpiresAt: updateFields.tokenExpiresAt }
}

const ensureValidAccessToken = async (integrationId) => {
  const integration = await getDb().collection(COLLECTION).findOne({
    _id: new ObjectId(integrationId),
    status: 'active',
  })
  if (!integration) throw new Error('Active integration not found')

  if (integration.tokenExpiresAt < new Date()) {
    const refreshed = await refreshAccessToken(integrationId)
    return refreshed.accessToken
  }

  return integration.accessToken
}

export const setupSubscriptions = async (integrationId, userId) => {
  const accessToken = await ensureValidAccessToken(integrationId)

  const results = []

  // Gmail watch
  try {
    const gmailRes = await fetch(GMAIL_WATCH_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topicName: process.env.GMAIL_TOPIC_NAME,
      }),
    })

    if (gmailRes.ok) {
      const data = await gmailRes.json()
      const sub = SubscriptionSchema.parse({
        _id: new ObjectId(),
        integrationId: new ObjectId(integrationId),
        service: 'gmail',
        type: 'watch',
        resourceId: null,
        channelId: null,
        lastHistoryId: data.historyId,
        syncToken: null,
        expiresAt: data.expiration ? new Date(parseInt(data.expiration)) : null,
        createdAt: new Date(),
      })
      await getDb().collection(SUB_COLLECTION).insertOne(sub)
      results.push({ service: 'gmail', status: 'active', subscriptionId: sub._id.toString() })
    } else {
      const err = await gmailRes.text()
      console.error('Gmail watch failed:', err)
      results.push({ service: 'gmail', status: 'failed', error: err })
    }
  } catch (error) {
    console.error('Gmail watch error:', error)
    results.push({ service: 'gmail', status: 'error', error: error.message })
  }

  // Calendar watch
  try {
    const channelId = randomUUID()
    const calRes = await fetch(CALENDAR_WATCH_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: channelId,
        type: 'web_hook',
        address: `${process.env.WEBHOOK_BASE_URL}/webhooks/calendar`,
      }),
    })

    if (calRes.ok) {
      const data = await calRes.json()
      const sub = SubscriptionSchema.parse({
        _id: new ObjectId(),
        integrationId: new ObjectId(integrationId),
        service: 'calendar',
        type: 'watch',
        resourceId: data.resourceId,
        channelId: data.id,
        lastHistoryId: null,
        syncToken: null,
        expiresAt: data.expiration ? new Date(parseInt(data.expiration)) : null,
        createdAt: new Date(),
      })
      await getDb().collection(SUB_COLLECTION).insertOne(sub)
      results.push({ service: 'calendar', status: 'active', subscriptionId: sub._id.toString() })
    } else {
      const err = await calRes.text()
      console.error('Calendar watch failed:', err)
      results.push({ service: 'calendar', status: 'failed', error: err })
    }
  } catch (error) {
    console.error('Calendar watch error:', error)
    results.push({ service: 'calendar', status: 'error', error: error.message })
  }

  return results
}

export const getIntegration = async (identifier) => {
  const query = {
    status: 'active',
    ...(identifier ? { $or: [{ userId: identifier }, { email: identifier }] } : {}),
  }

  const integration = await getDb().collection(COLLECTION).findOne(query)

  if (!integration) return null

  if (integration.tokenExpiresAt < new Date()) {
    try {
      const refreshed = await refreshAccessToken(integration._id.toString())
      integration.accessToken = refreshed.accessToken
      integration.tokenExpiresAt = refreshed.tokenExpiresAt
    } catch {
      return { ...integration, status: 'expired' }
    }
  }

  return integration
}

export const getAllIntegrations = async (userId) => {
  const cacheKey = redisKeys.integrations(userId)
  const cached = await redis.get(cacheKey)
  if (cached) {
    console.log('Cache Hit getAllIntegrations.')
    return JSON.parse(cached)
  }

    console.log('Cache Miss at getAllIntegrations')

  const integrations = await getDb().collection(COLLECTION)
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray()

  const data = integrations.map((i) => ({
    id: i._id.toString(),
    email: i.email,
    provider: i.provider,
    status: i.status,
  }))

  await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(data))

  return data
}

export const revokeIntegration = async (integrationId) => {
  const integration = await getDb().collection(COLLECTION).findOne({
    _id: new ObjectId(integrationId),
  })

  if (!integration) {
    throw new Error('Integration not found')
  }

  try {
    await fetch(GOOGLE_REVOKE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token: integration.accessToken }),
    })

    const updateintegration = await getDb().collection(COLLECTION).updateOne({
    _id: new ObjectId(integrationId), 
    },
      {
        $set :{
          status:"revoked",
        }
      }
)       
      console.log('Revoked Integration :',integrationId)

      return integrationId

  } catch {
    // revocation failure is non-fatal — we mark it revoked either way
  const updateintegration = await getDb().collection(COLLECTION).updateOne({
    _id: new ObjectId(integrationId), 
    },
      {
        $set :{
          status:"revoked",
        }
      }
)

  console.log('Revoked Integration :',integrationId)

        return integrationId
  }

  await getDb().collection(COLLECTION).updateOne(
    { _id: new ObjectId(integrationId) },
    { $set: { status: 'revoked', updatedAt: new Date() } }
  )

  const cacheKey = redisKeys.integrations(integration.userId)
  const cached = await redis.get(cacheKey)
  if (cached) {
    const list = JSON.parse(cached)
    const updated = list.map((i) =>
      i.id === integrationId ? { ...i, status: 'revoked' } : i
    )
    await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(updated))
  }

  return { success: true }
}

export const syncHistory = async (decode) => {
  try {
    const integration = await getIntegration(decode.emailAddress)

    if (!integration) {
      console.log('No Email Integration Found for the User :', decode.emailAddress)
      return false
    }

    console.log('New history notification for:', decode.emailAddress)

    await fetchAndLogGmailUpdates(integration._id,integration.userId)
    return true
  } catch (error) {
    console.log('Error :', error)
    return null
  }
}

export const fetchAndLogGmailUpdates = async (integrationId,userId) => {
  const accessToken = await ensureValidAccessToken(integrationId)

  const sub = await getDb().collection(SUB_COLLECTION).findOne({
    integrationId: integrationId,
    service: 'gmail',
  })
  if (!sub || !sub.lastHistoryId) {
    console.log('No Gmail subscription or lastHistoryId found')
    return
  }

  const historyRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/history?startHistoryId=${sub.lastHistoryId}&historyTypes=messageAdded&maxResults=2`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!historyRes.ok) {
    const errText = await historyRes.text()
    console.error('Gmail history list failed:', errText)
    return
  }

  const historyData = await historyRes.json()

  const messages = historyData.history?.flatMap((h) =>
    (h.messagesAdded || []).map((m) => m.message).filter(Boolean)
  ) || []

      sseManager.sendToUser(userId,{
      type:"gmail",
      length:messages.length,
    })

  if (messages.length === 0) {
    console.log('No new messages in history')
    await getDb().collection(SUB_COLLECTION).updateOne(
      { _id: sub._id },
      { $set: { lastHistoryId: historyData.historyId } }
    )
    return
  }

  const integration = await getDb().collection(COLLECTION).findOne({ _id: new ObjectId(integrationId) })
  if (!integration) {
    console.log('Integration not found')
    return
  }

  const contents = []

  for (const msg of messages) {
    if (msg.labelIds?.some((l) => SKIP_LABELS.includes(l))) continue

    const msgRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    if (!msgRes.ok) continue

    const full = await msgRes.json()
    const headers = (full.payload?.headers || []).reduce((acc, h) => {
      acc[h.name] = h.value
      return acc
    }, {})

    const to = headers.To ? headers.To.split(',').map((s) => s.trim()) : []
    const from = headers.From || ''
    const subject = headers.Subject || ''

    function getBody(payload) {
      if (payload.mimeType === "text/plain" && payload.body?.data) {
        return Buffer.from(payload.body.data, "base64").toString("utf-8")
      }
      if (payload.parts) {
        for (const part of payload.parts) {
          const result = getBody(part)
          if (result) return result
        }
      }
      if (payload.mimeType === "text/html" && payload.body?.data) {
        return Buffer.from(payload.body.data, "base64").toString("utf-8")
      }
      return ""
    }
    const body = getBody(full.payload) || full.snippet || ''

    contents.push({
      userId: integration.userId,
      sourceId: full.id,
      threadId: full.threadId || null,
      from,
      to,
      subject,
      body,
      metadata: { labelIds: full.labelIds },
      timestamp: headers.Date ? new Date(headers.Date) : new Date(),
    })
  }

  if (contents.length > 0) {

    await bulMessageQueue.add("emails-ingest",{ provider: 'gmail', integrationId, contents })

    console.log(`Added to BulkMessage Queue : ${contents.length} messages`)
  }

  await getDb().collection(SUB_COLLECTION).updateOne(
    { _id: sub._id },
    { $set: { lastHistoryId: historyData.historyId } }
  )
  console.log('Updated lastHistoryId to:', historyData.historyId)
}

