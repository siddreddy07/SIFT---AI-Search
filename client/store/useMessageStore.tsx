import { create } from 'zustand'

export type FileInfo = {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
};

export type Message = {
  _id: string;
  chatId?: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
  sources?: any[];
  files?: FileInfo[];
};

type Chat = {
  _id: string;
  userId?: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
};

type ChatStore = {
  chats: Chat[];
  activeChatId: string | null;
  addChat: (chat: Chat) => void;
  setChat: (chat: Chat) => void;
  deleteChat: (id: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (chatId: string, messageId: string, content: string) => void;
  addSourceToMessage: (chatId: string, messageId: string, source: any) => void;
  setActiveChat: (chatId: string | null) => void;
};

const useMessageStore = create<ChatStore>((set) => ({
  chats: [],
  activeChatId: null,

  addChat: (chat) =>
    set((state) => ({
      chats: [...state.chats, chat]
    })),

  setChat: (chat) =>
    set((state) => ({
      chats: state.chats.some(c => c._id === chat._id)
        ? state.chats.map(c => c._id === chat._id ? chat : c)
        : [...state.chats, chat]
    })),

  deleteChat: (id) =>
    set((state) => ({
      chats: state.chats.filter((c) => c._id !== id)
    })),

  addMessage: (chatId, message) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c._id === chatId
          ? { ...c, messages: [...c.messages, message], updatedAt: Date.now() }
          : c
      )
    })),

  updateMessage: (chatId, messageId, content) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c._id === chatId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m._id === messageId ? { ...m, content } : m
              ),
              updatedAt: Date.now()
            }
          : c
      )
    })),

  addSourceToMessage: (chatId, messageId, source) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c._id === chatId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m._id === messageId
                  ? { ...m, sources: [...(m.sources || []), source] }
                  : m
              ),
              updatedAt: Date.now()
            }
          : c
      )
    })),

  setActiveChat: (chatId) => set({ activeChatId: chatId })
}))

export default useMessageStore
