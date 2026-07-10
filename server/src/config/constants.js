export const COLLECTION = 'integrations'
export const SUB_COLLECTION = 'subscriptions'
export const CHAT_COLLECTION = 'chats'
export const STATE_COLLECTION = 'oauth_states'
export const CACHE_TTL = 86400
export const FILE_CHUNKS_COLLECTION = 'file_chunks'
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
export const MAX_FILE_SIZE = 5 * 1024 * 1024

export const REAS_MODELS = [
  "openai/gpt-oss-120b",
  "tencent/hy3",
  "qwen/qwen3-next-80b-a3b-instruct"
]

export const VISION_MODELS = [
  "nvidia/nemotron-nano-12b-2-vl",
  "nvidia/nemotron-3-nano-omni",
]