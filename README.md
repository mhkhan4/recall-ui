# recall-ui

The developer-facing web client for **Recall** — an AI Second Brain that answers natural-language questions about your GitHub repositories.

Built with Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, and Zustand.

---

## How it works

```
GitHub OAuth → JWT → chat UI
                          │
                          ├─ POST /query/stream  (SSE — main chat thread)
                          │  query-service :8002
                          │
                          └─ POST /query         (sync — Cmd+K palette)
                             query-service :8002
```

The UI connects to two backend services:

| Service | Default port | Used for |
|---------|-------------|---------|
| `ingest-gate` | 8000 | GitHub OAuth flow, auto-sync |
| `query-service` | 8002 | RAG queries (sync + SSE streaming) |

---

## Prerequisites

- Node.js 20+
- `ingest-gate` running on port 8000
- `query-service` running on port 8002

---

## Running locally

```bash
cd recall-ui
npm install
cp .env.local.example .env.local   # or create .env.local manually
npm run dev
```

Open `http://localhost:3000`.

---

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_INGEST_GATE_URL` | `http://localhost:8000` | Base URL the **browser** uses to reach ingest-gate. On Vercel, set to `/api/ingest-gate` to route through the server-side rewrite proxy. |
| `NEXT_PUBLIC_QUERY_SERVICE_URL` | `http://localhost:8002` | Base URL the **browser** uses to reach query-service. On Vercel, set to `/api/query-service`. |
| `INGEST_GATE_URL` | *(none)* | **Server-side only** — actual EC2 URL (e.g. `http://18.225.118.80:8000`). Used by `next.config.ts` rewrites to proxy `/api/ingest-gate/*` requests. Set in Vercel project settings, not in `.env.local`. |
| `QUERY_SERVICE_URL` | *(none)* | **Server-side only** — actual EC2 URL (e.g. `http://18.225.118.80:8002`). Used by `next.config.ts` rewrites to proxy `/api/query-service/*` requests. Set in Vercel project settings, not in `.env.local`. |

---

## User flow

### 1. Login

Navigate to `/login` and click **Continue with GitHub**. The app redirects to ingest-gate's OAuth flow:

```
/login → GET /auth/github (ingest-gate) → GitHub consent → /auth/callback?token=&username=&avatar_url=
```

The `/auth/callback` page persists the JWT to localStorage (`recall-auth`) and redirects to `/chat`.

### 2. Chat

Ask questions in the chat thread. The UI sends a `POST /query/stream` request with the JWT in the `Authorization` header and renders results as they stream:

1. **Source pills** appear above the answer once the `sources` SSE event arrives
2. **Answer text** streams token by token
3. The streaming cursor disappears when the `done` event arrives

Switch between **Standard** (fast, GPT-4.1-mini) and **Complex** (deep reasoning, Claude Sonnet) modes via the mode toggle in the chat input.

### 3. Cmd+K

Press `Cmd+K` (or `Ctrl+K`) to open the command palette for quick semantic search using the synchronous `POST /query` endpoint.

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/chat` if authenticated, else `/login` |
| `/login` | GitHub OAuth button + manual JWT paste fallback |
| `/auth/callback` | Reads `?token=&username=&avatar_url=` from URL, persists auth, redirects to `/chat` |
| `/chat` | Main chat interface — thread list, active thread, streaming responses |
| `/settings` | Account info, JWT preview, thread count, danger zone (wipe local data) |

---

## Key components

| Component | File | Role |
|-----------|------|------|
| `ChatThread` | `components/chat/ChatThread.tsx` | Message list + input; handles scroll behavior |
| `MessageBubble` | `components/chat/MessageBubble.tsx` | User and assistant message variants |
| `SourcePill` | `components/chat/SourcePill.tsx` | `[owner/repo: file.py]` citation badge |
| `ChatInput` | `components/chat/ChatInput.tsx` | Textarea, mode toggle, submit |
| `CommandMenu` | `components/command/CommandMenu.tsx` | Cmd+K palette — quick search |
| `AppSidebar` | `components/layout/AppSidebar.tsx` | Sidebar: logo, threads, sources, user footer |
| `AuthBoundary` | `components/layout/AuthBoundary.tsx` | Redirects to `/login` if unauthenticated |
| `Markdown` | `components/markdown/Markdown.tsx` | `react-markdown` + GFM |
| `CodeBlock` | `components/markdown/CodeBlock.tsx` | Syntax highlight + copy button |

---

## State management

Two Zustand stores, both with `persist` middleware:

**`useAuthStore`** — persisted as `recall-auth`
- Stores `token`, `username`, `avatarUrl`
- `clearAuth()` called on 401 responses (redirects to `/login`)

**`useChatStore`** — persisted as `recall-chat-v1`
- Stores threads, active thread ID, query mode, filters
- `isStreaming` is intentionally **not** persisted — a reload should not leave the UI stuck with a spinning cursor

---

## SSE implementation

The streaming chat uses `fetch` + `ReadableStream`, not `EventSource`. `EventSource` cannot send `Authorization` headers and is GET-only. `streamQuery()` in `lib/api/sse.ts` posts to `/query/stream`, reads the response body as a byte stream, and parses `event:` / `data:` pairs line by line.

---

## Project structure

```
recall-ui/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout: dark theme, CommandMenu mount
│   │   ├── page.tsx                # / → redirect
│   │   ├── login/page.tsx          # OAuth button + manual paste
│   │   ├── auth/callback/page.tsx  # Reads token from URL, stores auth
│   │   ├── chat/
│   │   │   ├── layout.tsx          # AuthBoundary + AppSidebar
│   │   │   └── page.tsx            # ChatThread
│   │   └── settings/page.tsx
│   ├── components/
│   │   ├── chat/                   # ChatThread, MessageBubble, SourcePill, ChatInput, …
│   │   ├── command/                # CommandMenu (Cmd+K)
│   │   ├── layout/                 # AppSidebar, AuthBoundary, SidebarSources, SidebarThreads
│   │   ├── markdown/               # Markdown, CodeBlock
│   │   └── ui/                     # Radix UI primitives (button, tooltip, scroll-area, …)
│   ├── lib/
│   │   ├── api/
│   │   │   ├── types.ts            # QueryRequest, QueryResponse, SourceChunk, SSEEvent
│   │   │   ├── queryService.ts     # queryOnce() — sync /query for CommandMenu
│   │   │   └── sse.ts              # streamQuery() — fetch + ReadableStream SSE parser
│   │   └── auth/
│   │       ├── token.ts            # Thin helpers: read/write/clear from authStore
│   │       └── oauth.ts            # buildGitHubLoginUrl()
│   └── store/
│       ├── auth.ts                 # useAuthStore
│       └── chat.ts                 # useChatStore
├── public/
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── .env.local.example
```
