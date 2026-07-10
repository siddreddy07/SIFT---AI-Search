import { useEffect, useRef, useCallback } from "react";

let wsInstance: WebSocket | null = null;
let wsUrl = "";
let wsListeners = new Set<(data: any) => void>();
let wsReconnectTimer: ReturnType<typeof setTimeout> | null = null;
let wsStopped = false;

function wsConnect(url: string) {
  if (wsStopped) return;
  wsInstance = new WebSocket(url);
  wsInstance.onmessage = (e) => {
    const data = JSON.parse(e.data);
    wsListeners.forEach((fn) => fn(data));
  };
  wsInstance.onerror = () => wsInstance?.close();
  wsInstance.onclose = () => {
    if (!wsStopped) wsReconnectTimer = setTimeout(() => wsConnect(url), 3000);
  };
}

function wsInit(url: string) {
  if (wsUrl === url && wsInstance?.readyState === WebSocket.OPEN) return;
  if (wsUrl !== url) {
    wsStopped = true;
    if (wsReconnectTimer) clearTimeout(wsReconnectTimer);
    wsInstance?.close();
    wsInstance = null;
    wsUrl = url;
    wsStopped = false;
    wsConnect(url);
  }
}

export function useWebSocket(url: string, onMessage?: (data: any) => void) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!url) return;
    wsInit(url);
    const handler = (data: any) => onMessageRef.current?.(data);
    wsListeners.add(handler);
    return () => {
      wsListeners.delete(handler);
    };
  }, [url]);

  const sendMessage = useCallback((data: unknown) => {
    if (wsInstance?.readyState === WebSocket.OPEN) {
      wsInstance.send(JSON.stringify(data));
    }
  }, []);

  return { sendMessage };
}
