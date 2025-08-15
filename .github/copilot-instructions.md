# CodeNearby – Copilot Playbook (for AI agents)

Purpose: Make changes fast and safely by following the repo’s real conventions. Keep edits small, reuse helpers, and prefer the existing data flow.

## Architecture in one glance

- Next.js 14 App Router. UI in `app/**` and `components/**`.
- Persistence: MongoDB via `lib/mongodb.ts` (singleton).
- Realtime/ephemeral: Firebase Realtime DB via `lib/firebase.ts` (chat, polls).
- Auth: NextAuth GitHub OAuth using `app/options.ts` (extended Session: id, githubUsername, etc.).
- AI: Google Gemini via `lib/ai.ts` (ai-sdk/google).
- Caching/limits: Upstash Redis via `lib/redis.ts` and helpers in `lib/utils.ts`.
- External: GitHub REST via `lib/github.ts` and `lib/github-search.ts`; Cloudinary uploads.

## Core patterns to copy

- Route handlers: `app/api/**/route.ts`
  - Validate session with `getServerSession(authOptions)` when user context is required.
  - For public API v1, validate `x-api-key` and tokens (see `app/api/v1/**`, `lib/user-tiers.ts`).
  - Always respond with `NextResponse.json({ ... }, { status })`.
- Mongo access: `const client = await clientPromise; const db = client.db();`
  - Collections seen: `users`, `apiKeys`, `gatherings`, `posts`.
- Caching: use `cacheData(key, data, seconds)` and `getCachedData<T>(key)`.
- Rate limits: use `rateLimit(req, identifier, { limit, windowMs, message })` + expose headers via `getRateLimitInfo` (see `app/api/ai-chat/route.ts`).

## API v1 (tokened) conventions

- Send `x-api-key` header. Validate via hashed key lookup in `apiKeys` (see `app/api/v1/developers/route.ts`).
- Track/charge tokens with `lib/user-tiers.ts` (`canConsumeTokens`, `consumeTokens`, daily reset helpers).
- AI calls via `generateMessage` return `{ aiResponse, tokensUsed }` – deduct before returning.

## Realtime chat/polls

- UI: `app/gathering/[slug]/chat/page.tsx`.
- Firebase paths:
  - Messages: `messages/${slug}` with `onChildAdded`/`onChildChanged`.
  - Polls: `polls/${slug}/${pollId}`.
- Features: anonymous messages, pin/unpin, host-only controls.

## GitHub integration

- Quick user/activity: `lib/github.ts`.
- Search and detail with caching: `lib/github-search.ts` (basic vs detailed search, repo info, similar repos).
- Respect rate limits; prefer caching keys like `github:search:*` and `github:user:*`.

## Auth lifecycle

- Provider setup and session shape: `app/options.ts`.
- On sign-in, user record is upserted and optionally added to default gathering via `ALL_GATHERING_ID`.

## Local dev workflow

- Commands: `npm run dev`, `npm run build`, `npm run lint`, `npm run generate-changelog`, `npm run test-api`.
- Env: copy `.env.example` → `.env.local` (GitHub OAuth, MongoDB, Firebase, Upstash Redis, Gemini, Cloudinary).
- API smoke tests: `scripts/test-api.js` (uses `BASE_URL` and `x-api-key`).

## UI conventions

- shadcn-based components in `components/ui/**`; theme/provider wiring in `app/layout.tsx` and `components/providers.tsx`.
- AI search UI logic: `components/ai-chat-interface.tsx` (intent detection for dev/person/repo queries).

## Where to look (by task)

- Add/modify API: start from a similar file in `app/api/**/route.ts`; reuse caching + rate limit helpers.
- Add AI usage: call `generateMessage` and budget tokens through `lib/user-tiers.ts`.
- Realtime features: follow Firebase patterns in gathering chat.

Notes/pitfalls

- Mongo client is TLS-enabled by default (`lib/mongodb.ts`); ensure valid `MONGODB_URI`.
- Many features require session; API v1 requires `x-api-key` even when signed in.
- Set `UPSTASH_REDIS_REST_*` for caching/limits; missing config degrades behavior.

That’s the essential map. If any area is unclear or missing (e.g., pricing, keys, or a new endpoint contract), tell me what to expand and I’ll refine this guide.
