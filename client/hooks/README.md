# useWebSocket Hook

A hook that connects your app to a server using WebSocket — a live, two-way connection.

Only **one** WebSocket connection is shared across your whole app. If you use this hook in 5 different components, they all talk through the same socket.

---

## How to use it

```ts
const { sendMessage } = useWebSocket("ws://localhost:8080", (data) => {
  console.log("Server sent:", data);
});

sendMessage({ type: "chat", text: "Hello!" });
```

That's it. Pass a URL and a callback. You get back `sendMessage` to send data.

---

## What the code does — super simple

### The 4 things stored outside React (globals)

```ts
let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let hasSubscriber = false;
let onData: ((data: any) => void) | null = null;
```

These live **outside** any component so they don't disappear on re-render.

- **`ws`** — the actual WebSocket connection. One for the whole app.
- **`reconnectTimer`** — a timer that waits 3 seconds then reconnects if the connection died.
- **`hasSubscriber`** — is ANY component currently using this socket? If no, stop trying to reconnect.
- **`onData`** — the callback function that runs when a message arrives.

### `connect(url)` — makes the WebSocket

```ts
function connect(url: string) {
  if (ws?.readyState === WebSocket.OPEN || ws?.readyState === WebSocket.CONNECTING) return;
  if (!hasSubscriber) return;

  ws = new WebSocket(url);
  ws.onmessage = (event) => onData?.(JSON.parse(event.data));
  ws.onclose = () => {
    ws = null;
    if (hasSubscriber)
      reconnectTimer = setTimeout(() => connect(url), 3000);
  };
  ws.onerror = () => ws?.close();
}
```

What happens:

1. If there's already a working connection — skip, don't make a new one.
2. If no component is using this — skip, don't connect at all.
3. Create the WebSocket.
4. **`ws.onmessage`** — when the server sends a message, call `onData` (which calls your callback).
5. **`ws.onclose`** — connection lost. Clear the old socket. If someone is still listening, try again in 3 seconds.
6. **`ws.onerror`** — something went wrong. Close the socket (which triggers `onclose` and the reconnect).

### The `useWebSocket` hook

```ts
export function useWebSocket(url: string, onMessage?: (data: any) => void) {
  const ref = useRef(onMessage);
  ref.current = onMessage;

  useEffect(() => {
    hasSubscriber = true;
    onData = (data) => ref.current?.(data);
    connect(url);

    return () => {
      hasSubscriber = false;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };
  }, []);

  const sendMessage = useCallback((data: unknown) => {
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data));
  }, []);

  return { sendMessage };
}
```

#### `const ref = useRef(onMessage); ref.current = onMessage;`

React components re-render a lot. Your `onMessage` callback might change on every render.

But the `connect()` function was created once and still has the **old** version of `onMessage`. That's called a "stale closure" — using old data when new data exists.

The `ref` is a box that survives re-renders. We store the latest `onMessage` in `ref.current` every time the component renders. Then `onData` (set up in the effect) calls `ref.current`, which always has the latest version of your callback.

**Short version:** The ref makes sure we always call your most recent `onMessage`, not an old one from a previous render.

#### `useEffect` — runs when component first appears

- Sets `hasSubscriber = true` — hey, someone is using the socket!
- Sets `onData` — when a message arrives, call `ref.current` (your latest callback)
- Calls `connect(url)` — create the WebSocket

#### Cleanup (return inside useEffect) — runs when component disappears

- Sets `hasSubscriber = false` — no one is using the socket anymore
- Cancels the reconnect timer if one was waiting
- Does **NOT** close the WebSocket — it stays open for the next component that mounts

#### `sendMessage`

Checks if the socket is open. If yes, sends your data as JSON.

### `ws.onmessage = (event) => onData?.(JSON.parse(event.data));` — why like this?

Three steps in one line:

1. **`event.data`** — the server sends data as a text string
2. **`JSON.parse(...)`** — turns that text string into a real JavaScript object. The server sends `'{"text":"hi"}'` and we turn it into `{ text: "hi" }`
3. **`onData?.(...)`** — runs your callback with that object. The `?.` means "only run this if `onData` isn't null" (safety check)

So the message goes: **server text → JavaScript object → your function**

---

## The full flow

```
Component appears on screen
  ↓
hasSubscriber = true
  ↓
connect(url) → new WebSocket(url) → connected!
  ↓
Server sends: '{"text":"hi"}'  →  ws.onmessage fires
  ↓
JSON.parse turns it into { text: "hi" }
  ↓
onData calls ref.current (your onMessage function)
  ↓
You call sendMessage({ text: "yo" })
  ↓
ws.send turns it into '{"text":"yo"}' and sends it
  ↓
Connection dies → ws.onclose fires
  ↓
If someone is still listening → reconnect in 3 seconds
  ↓
All components leave → hasSubscriber = false → stop reconnecting
  ↓
New component appears → hasSubscriber = true → reconnects
```

---

## What changed (cleanup)

- Renamed `globalWs` → `ws`, `globalOnMessage` → `onData`, `globalReconnectTimer` → `reconnectTimer`, `globalMounted` → `hasSubscriber`
- Removed empty `ws.onopen = () => {}` (did nothing)
- Removed `console.warn` in `sendMessage` (unnecessary noise)
- Merged `connectSingleton` into simpler `connect`
- Cleaned up formatting
