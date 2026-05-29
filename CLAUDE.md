# recall-ui — Claude Code Instructions

See the root `../CLAUDE.md` for project-wide rules. This file adds service-specific constraints.

## What this service owns
- GitHub OAuth flow (full-page redirect → backend → `/auth/callback?token=`)
- Chat thread UI with SSE streaming (`POST /query/stream`)
- Zustand stores: `useAuthStore` (persisted as `recall-auth`), `useChatStore` (persisted as `recall-chat-v1`)
- Cmd+K command palette for quick semantic search (`POST /query` sync)
- Source pills, streaming cursor, markdown rendering

## Critical invariants — never break these
- SSE uses `fetch` + `ReadableStream` + `AbortController`, never `EventSource`. `EventSource` is GET-only and cannot send Authorization headers.
- `isStreaming` in `useChatStore` is intentionally NOT persisted. A reload would otherwise leave the UI stuck with a spinning cursor.
- Auth token lives in localStorage. Never move it to a cookie without addressing cross-domain CORS configuration.
- `appendToken` creates a new `threads` array reference on every call. Any `useEffect` depending on `[messages]` will fire on every token — use `[messages.length]` when smooth scroll or heavy re-computation is involved.

## Scroll behavior (ChatThread.tsx)
Two separate scroll effects — do not collapse them back into one:
1. `useEffect([messages.length])` → `scrollIntoView({ behavior: 'smooth' })` — fires only on new message
2. `useEffect([messages, isStreaming])` → `scrollIntoView({ behavior: 'instant' })` during streaming

Collapsing them causes jitter: smooth scroll restarts on every token append.

## Animation
`animate-fade-in` is defined in `tailwind.config.ts` with a `translateY(4px)` → `translateY(0)` transition. Do not apply it to elements that re-render on every streaming token — it will replay the animation on each render.

## Backend URLs
| Env var | Default | Points to |
|---|---|---|
| `NEXT_PUBLIC_INGEST_GATE_URL` | `http://localhost:8000` | ingest-gate |
| `NEXT_PUBLIC_QUERY_SERVICE_URL` | `http://localhost:8002` | query-service |
