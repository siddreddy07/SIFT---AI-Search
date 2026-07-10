"use client";

import useMessageStore, { type Message } from "@/store/useMessageStore";
import useUserStore from "@/store/useUserStore";
import { useRef, useState, useEffect, useLayoutEffect, useCallback } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { AnimateIcon } from "./animate-ui/icons/icon";
import { ArrowUp } from "./animate-ui/icons/arrow-up";
import { ObjectId } from "bson";
import api, { getWsUrl } from "@/lib/axios";
import { useRouter, usePathname } from "next/navigation";
import FileUpload, { type FileData, getFileTypeLabel, formatFileSize } from "./chat/FileUpload";
import { ShineBorder } from "@/components/ui/shine-border";
import { getFileTypeIcon } from "@/lib/provider-icons";
import { toast } from "sonner";
import { GlareHover } from "@/components/ui/glare-hover";
import { X, Check, Loader2, CircleAlert } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import type { HomePill } from "@/store/useHomePillStore";

const CONTEXT_WINDOW = 2;
const MAX_HEIGHT = 200;

export default function ChatInput({ fixed = false, provider, prefillMessage, selectedPill }: { 
  fixed?: boolean; 
  prefillMessage?: string;
  provider?: string | null;
  selectedPill?: HomePill;
}) {
  const [message, setMessage] = useState("");
  const [confirmedFiles, setConfirmedFiles] = useState<FileData[]>([]);
  const [mounted, setMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const botReplyRef = useRef("");
  const titleRef = useRef("");
  const eventSourcesRef = useRef<Map<string, EventSource>>(new Map());
  const router = useRouter();
  const pathname = usePathname();
  const { open: sidebarOpen, isMobile } = useSidebar();

  const updateMessage = useMessageStore((state) => state.updateMessage);
  const addMessage = useMessageStore((state) => state.addMessage);
  const addSourceToMessage = useMessageStore((state) => state.addSourceToMessage);
  const addChat = useMessageStore((state) => state.addChat);
  const setChat = useMessageStore((state) => state.setChat);
  const setActiveChat = useMessageStore((state) => state.setActiveChat);
  const activeChatId = useMessageStore((state) => state.activeChatId);
  const chats = useMessageStore((state) => state.chats);
  const userId = useUserStore((s) => s.user?._id);

  console.log('UserId: ',userId)

  
  const { sendMessage } = useWebSocket(userId ? getWsUrl(`/ws?userId=${userId}`) : '', (data) => {
    const chatId = useMessageStore.getState().activeChatId;
    if (!chatId) return;

    if (data.type === "token") {
      botReplyRef.current += data.data;
      updateMessage(chatId, data.botId, botReplyRef.current);
    } else if (data.type === "tool_result") {
      const result = typeof data.data.result === "string" ? (() => { try { return JSON.parse(data.data.result); } catch { return data.data.result; } })() : data.data.result;
      addSourceToMessage(chatId, data.botId, { tool: data.data.tool, result });
    } else if (data.type === "done") {
      botReplyRef.current = "";
    } else if (data.type === "title_token") {
      console.log(`[title_token] ${data.data}`);
      titleRef.current += data.data;
      const chat = useMessageStore.getState().chats.find(c => c._id === chatId);
      if (chat) setChat({ ...chat, title: titleRef.current });
    } else if (data.type === "title_done") {
      console.log(`[title_done]`, data.data);
      const chat = useMessageStore.getState().chats.find(c => c._id === chatId);
      if (chat) setChat({ ...chat, title: data.data.title });
      titleRef.current = "";
    }
  });

  // ROBUST RESIZE FUNCTION
  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // 1. Reset height to auto to get the real scrollHeight
    textarea.style.height = "auto";
    
    // 2. Capture the scrollHeight
    const scrollHeight = textarea.scrollHeight;
    
    // 3. Apply the height with constraints
    if (scrollHeight > 0) {
      const newHeight = Math.min(scrollHeight, MAX_HEIGHT);
      textarea.style.height = `${newHeight}px`;
    }

    // 4. Handle scrolling
    textarea.style.overflowY = scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
  };

  useEffect(() => {
    return () => {
      eventSourcesRef.current.forEach((es) => es.close());
      eventSourcesRef.current.clear();
    };
  }, []);

  useEffect(() => { setMounted(true); }, []);

  // Prefill message from parent (e.g. pill click on /chat/new)
  useEffect(() => {
    setMessage(prefillMessage ?? "");
  }, [prefillMessage]);

  // Trigger resize every time message changes
  useLayoutEffect(() => {
    resizeTextarea();
  }, [message]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSend = async() => {
    const fullMessage = provider ? `${provider.toLowerCase()}: ${message.trim()}` : message.trim();
    if (!fullMessage) return;

    let chatId = useMessageStore.getState().activeChatId;

    if (pathname === '/chat/new') {
      chatId = new ObjectId().toString();
      const now = Date.now();
      const newChat = {
        _id: chatId,
        title: fullMessage.length > 50 ? fullMessage.substring(0, 50) + '...' : fullMessage,
        createdAt: now,
        updatedAt: now,
        messages: []
      };
      addChat(newChat);
      setActiveChat(chatId);
      router.push(`/chat/${chatId}`);
    }


    const files = confirmedFiles
      .filter(f => !f.uploading && f.fileId)
      .map(f => ({ _id: f.fileId!, originalName: f.name, mimeType: f.mimeType, size: f.size, url: f.url! }));

    const msgId = new ObjectId().toString()
    const now = Date.now();
    const userMessage: Message = {
      _id: msgId,
      content: fullMessage,
      role: "user",
      createdAt: now,
      ...(files.length && { files }),
    };

    const botId = new ObjectId().toString();

    if (chatId) {
      addMessage(chatId, userMessage);
      addMessage(chatId, { _id: botId, content: "", role: "assistant", createdAt: now });
    }

    const activeChat = useMessageStore.getState().chats.find(c => c._id === chatId);
    const chatMessages = activeChat?.messages || [];

    console.log('Chat Messages :',chatMessages)
    const lastN = chatMessages.slice(-2).map(m => ({
      _id: m._id,
      content: m.content,
      role: m.role,
      createdAt: new Date(m.createdAt).toISOString(),
      ...(m.files?.length && { fileIds: m.files.map(f => f._id) }),
    }));

    console.log('Last N Messages :',lastN)

    sendMessage({lastN,userId,chatId,botId, ...(selectedPill && { selectedPill })});

    setMessage("");
    setConfirmedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
  };

  const centered = fixed && pathname === '/chat/new';

  const isActive = message.trim().length > 0 || !!provider;
  const isSingleLine = !message.includes('\n');

  const handleFileConfirm = useCallback(async (fileData: FileData) => {
    if (fileData.size > 5 * 1024 * 1024) {
      toast.error("File exceeds 5MB limit")
      return;
    }

    const fileId = new ObjectId().toString();
    const formData = new FormData();
    formData.append('file', fileData.file);
    if (userId) formData.append('userId', userId);
    formData.append('fileId', fileId);

    const pendingFile = { ...fileData, fileId, uploading: true };
    setConfirmedFiles((prev) => [...prev, pendingFile]);

    try {
      const res = await fetch('/api/file/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();

      setConfirmedFiles((prev) =>
        prev.map((f) =>
          f.fileId === fileId ? { ...f, uploading: false, url: data.url, jobId: data.jobId, jobStatus: data.jobId ? "active" : undefined } : f
        )
      );

      if (data.jobId) {
        const es = new EventSource(`/api/jobs/${data.jobId}/events`);

        console.log('Event SOurce for File Upload :',es)

        eventSourcesRef.current.set(fileId, es);

        es.addEventListener("active", () => {
          setConfirmedFiles((prev) =>
            prev.map((f) =>
              f.fileId === fileId ? { ...f, jobStatus: "active" } : f
            )
          );
        });

        es.addEventListener("completed", () => {
          setConfirmedFiles((prev) =>
            prev.map((f) =>
              f.fileId === fileId ? { ...f, jobStatus: "completed" } : f
            )
          );
          es.close();
          eventSourcesRef.current.delete(fileId);
        });

        es.addEventListener("failed", () => {
          setConfirmedFiles((prev) =>
            prev.map((f) =>
              f.fileId === fileId ? { ...f, jobStatus: "failed" } : f
            )
          );
          es.close();
          eventSourcesRef.current.delete(fileId);
        });

        es.onerror = () => {
          es.close();
          eventSourcesRef.current.delete(fileId);
        };
      }
    } catch (error) {
      console.error('File upload failed:', error);
      setConfirmedFiles((prev) => prev.filter((f) => f.fileId !== fileId));
    }
  }, [userId]);

  const removeFile = useCallback((index: number) => {
    setConfirmedFiles((prev) => {
      const file = prev[index];
      if (file?.fileId) {
        eventSourcesRef.current.get(file.fileId)?.close();
        eventSourcesRef.current.delete(file.fileId);
        fetch(`/api/file/${file.fileId}?userId=${userId}`, { method: 'DELETE' }).catch(() => {});
      }
      return prev.filter((_, i) => i !== index);
    });
  }, [userId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
  className={`
    ${centered
      ? "fixed top-0 right-0 bottom-0 left-0 flex items-center justify-center"
      : fixed
        ? "fixed left-0 flex items-center justify-center right-0 bottom-0 px-0 md:px-3 pt-4 bg-gradient-to-t from-[#F8F8F8]/95 via-[#F8F8F8]/80 to-transparent dark:from-zinc-950/95 dark:via-zinc-950/80 dark:to-transparent"
        : "px-0 md:px-3 flex items-center justify-center pt-4 bg-gradient-to-t from-[#F8F8F8]/95 via-[#F8F8F8]/80 to-transparent dark:from-zinc-950/95 dark:via-zinc-950/80 dark:to-transparent"
    }
  `}
  style={fixed && !centered && !isMobile && sidebarOpen ? { left: "var(--sidebar-width)" } : undefined}
>
    <div className={`${centered ? "w-full max-w-[90vw] md:max-w-[60vw] min-w-[20vw]" : "w-full px-2 md:w-[60vw]"} pb-[env(safe-area-inset-bottom,12px)]`}>
    
      {confirmedFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5 sm:gap-2">
          {confirmedFiles.map((f, i) => (
            <GlareHover
              key={i}
              opacity={0.12}
              background="transparent"
              className={`!flex items-center gap-1.5 sm:gap-2 rounded-lg border border-zinc-200 bg-white px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 ${f.uploading || f.jobStatus === "active" ? "opacity-60" : ""}`}
            >
              <span className="flex-shrink-0">
                {getFileTypeIcon(f.mimeType)}
              </span>
              <span className="max-w-[80px] sm:max-w-[130px] truncate font-medium text-zinc-800 dark:text-zinc-100">
                {f.name}
              </span>
              <span className="hidden sm:inline text-zinc-300 dark:text-zinc-600">•</span>
              <span className="text-zinc-500 dark:text-zinc-400 truncate max-w-[60px] sm:max-w-none">
                {f.mimeType || "unknown"}
              </span>
              <span className="text-zinc-300 dark:text-zinc-600">•</span>
              <span className="text-zinc-400 font-bold dark:text-zinc-500 whitespace-nowrap">
                {formatFileSize(f.size)}
              </span>
              {(f.uploading || f.jobStatus === "active") && (
                <Loader2 size={12} className="animate-spin text-zinc-400" />
              )}
              {f.jobStatus === "completed" && (
                <Check size={12} className="text-green-500" />
              )}
              {f.jobStatus === "failed" && (
                <CircleAlert size={12} className="text-red-500" />
              )}
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="-mr-0.5 cursor-pointer ml-0.5 flex items-center justify-center rounded-full p-0.5 text-zinc-400 opacity-60 transition-all hover:bg-red-100 hover:text-red-500 hover:opacity-100 dark:hover:bg-red-900/30"
              >
                <X size={13} />
              </button>
            </GlareHover>
          ))}
        </div>
      )}
    <div className="relative overflow-hidden flex items-end gap-3 rounded-3xl bg-white/95 backdrop-blur-md px-5 py-2 shadow-lg shadow-zinc-200/30 dark:bg-zinc-900/95 dark:shadow-black/20">

      <ShineBorder shineColor="#3b82f6" borderWidth={1} duration={14} />

      <FileUpload onFileSelect={handleFileConfirm} isSingleLine={isSingleLine} />

      {/* Input */}
      <div className="flex-1 min-w-0">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Message..."
        rows={1}
        className="
          w-full
          resize-none
          bg-transparent
          py-3
          text-[15px]
          leading-normal
          outline-none
          placeholder:text-zinc-400
          dark:text-zinc-100
          max-h-[200px]
          min-h-[44px]
        "
      />
      </div>

      {/* Send */}
      <button
  onClick={handleSend}
  disabled={mounted && !isActive}
  className={`
    flex-shrink-0
    rounded-full
    font-bold
    p-2
    transition-all
    duration-150
    ease-linear
    ${isSingleLine ? "mb-1" : ""}
    ${
      isActive || !mounted
        ? "bg-blue-500 text-white cursor-pointer hover:scale-105 active:scale-95"
        : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
    }
  `}
>
  <AnimateIcon animateOnHover={mounted && isActive}>
    <ArrowUp size={22} />
  </AnimateIcon>
</button>

    </div>
      <div className="text-center pt-3 pb-1">
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
          SIFT is an AI and can make mistakes.
        </p>
      </div>
  </div>
</div>
  );
}
