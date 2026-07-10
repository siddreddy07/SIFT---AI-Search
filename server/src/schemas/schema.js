import { ObjectId } from "mongodb"
import z from "zod"
import { DEFAULT_REASON_MODEL, DEFAULT_VISION_MODEL, REASON_MODELS, VISION_MODELS } from "../config/constants.js"

export const ChatSchema = z.object({
  _id: z.instanceof(ObjectId),
  userId: z.string(),
  title: z.string(),
  lastN: z.array(z.any()).optional(),
  lastSummarizedMessageId: z.instanceof(ObjectId).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const MessageSchema = z.object({
  _id: z.instanceof(ObjectId),
  chatId: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  sources: z.union([z.record(z.array(z.any())), z.array(z.any())]).optional(),
  fileIds: z.array(z.instanceof(ObjectId)).optional(),
  content: z.string(),
  createdAt: z.date(),
})

export const SummarySchema = z.object({
  _id: z.instanceof(ObjectId),
  chatId: z.instanceof(ObjectId),
  userId: z.instanceof(ObjectId),
  content: z.string(),
  fromId: z.instanceof(ObjectId),
  toId: z.instanceof(ObjectId),
  createdAt: z.date(),
})

export const IntegrationSchema = z.object({
  _id: z.instanceof(ObjectId),
  userId: z.string(),
  email: z.string(),
  provider: z.enum(["google"]),
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenExpiresAt: z.date(),
  scopes: z.array(z.string()),
  status: z.enum(["active", "revoked"]),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const SubscriptionSchema = z.object({
  _id: z.instanceof(ObjectId),
  integrationId: z.instanceof(ObjectId),
  service: z.enum(["gmail", "calendar"]),
  type: z.enum(["watch"]),
  resourceId: z.string().nullable(),
  channelId: z.string().nullable(),
  lastHistoryId: z.string().nullable(),
  syncToken: z.string().nullable(),
  expiresAt: z.date().nullable(),
  createdAt: z.date(),
})

export const SignalSchema = z.object({
  _id: z.instanceof(ObjectId),
  userId: z.string(),
  source: z.enum(["gmail", "calendar"]),
  entity: z.string(),
  type: z.enum(["project", "event", "learning", "travel"]),
  weight: z.number(),
  timestamp: z.date(),
  rawRefId: z.string().nullable(),
})

export const UniversalMessageSchema = z.object({
  _id: z.instanceof(ObjectId),
  userId: z.string(),
  integrationId: z.instanceof(ObjectId),
  source: z.enum(["gmail", "slack", "telegram", "youtube", "calendar"]),
  sourceId: z.string(),
  threadId: z.string().nullable(),
  from: z.string(),
  to: z.array(z.string()),
  subject: z.string().nullable(),
  body: z.string(),
  metadata: z.record(z.any()).optional(),
  timestamp: z.coerce.date(),
  createdAt: z.date(),
})

const apiKeySchema = z.object({
  type: z.enum(["default", "image"]),
  provider: z.string(),
  models:z.enum([]),
  key: z.string(),
});

export const UserSchema = z.object({
  _id: z.instanceof(ObjectId),
  name: z.string(),
  password: z.string(),
  email: z.string().optional(),
  avatar: z.string().optional(),
  role: z.enum(['user', 'admin']).default('user'),
  interests: z.array(z.string()).default(["entertainment", "sports", "world"]),
  apikeys: z.array(apiKeySchema).default([
    {
      type: "default",
      provider: "",
      models:z.enum(REASON_MODELS).default(DEFAULT_REASON_MODEL),
      key: "",
    },
    {
      type: "image",
      provider: "",
      models:z.enum(VISION_MODELS).default(DEFAULT_VISION_MODEL),
      key: "",
    },
  ]),
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const FileChunkSchema = z.object({
  _id: z.instanceof(ObjectId),
  fileId: z.instanceof(ObjectId),
  pageContent: z.string(),
  chunkIndex: z.number(),
  pageNumber: z.number().optional(),
  createdAt: z.date(),
})

export const FileSchema = z.object({
  _id: z.instanceof(ObjectId),
  userId: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  url: z.string(),
  createdAt: z.date(),
})
