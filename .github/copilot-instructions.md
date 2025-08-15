# CodeNearby – Copilot Playbook (for AI agents)

Purpose: Move fast, stay safe. Copy existing patterns, keep edits small, and reuse helpers.

## Architecture quick map

- Next.js 14 App Router. UI in `app/**` and `components/**`.
- Data: MongoDB via `lib/mongodb.ts` (singleton clientPromise).
- Realtime: Firebase Realtime DB via `lib/firebase.ts` (chat, polls).
- Auth: NextAuth (GitHub OAuth) in `app/options.ts` (Session has id/github fields; adds user to `ALL_GATHERING_ID` on first sign-in).
- AI: Google Gemini via `lib/ai.ts` (ai-sdk/google, model `gemini-2.0-flash-exp`).
- Cache + limits: Upstash Redis via `lib/redis.ts`; helpers in `lib/utils.ts` (rateLimit + headers).
- GitHub: `lib/github.ts`, `lib/github-search.ts` (search, repo info, similar repos).

## API route conventions

- Handlers live in `app/api/**/route.ts`; always return `NextResponse.json({...}, { status })`.
- Web app routes use `getServerSession(authOptions)`; public API v1 uses API Key auth only.
- API Key format: `cn_...`; store SHA-256 `hashedKey` in `apiKeys` (see `lib/api-auth.ts`). Reuse `requireApiKey()` instead of re-implementing.
- Mongo: `const client = await clientPromise; const db = client.db();` Use `ObjectId` for ids. Collections: `users`, `apiKeys`, `gatherings`, `posts`.

## Token budgeting pattern (v1)

- Estimate first via `getEstimatedTokenCost(endpoint)` from `consts/pricing.ts`.
- Call AI with `generateMessage(prompt[, maxTokens])`; it returns `{ aiResponse, tokensUsed }`.
- Use actual `tokensUsed` when available; otherwise fall back to the estimate.
- Check/charge with `canConsumeTokens`, `consumeTokens`, and persist updated `tokenBalance` + `usage` in `users`.
- Reset daily tokens with `shouldResetDailyTokens`/`resetDailyTokens` before charging. Gate features via `user.features.*` (e.g., `developerSearch`).

## Caching and rate limits

- Cache via `cacheData/getCachedData` (Upstash). Common keys:
  - `ai:repo-search:${encodeURIComponent(q)}`
  - `ai:similar-repos:${repo}`, `ai:repo-analysis:${repo}`
  - `github:search:*`, `github:user:*`
- Typical TTLs: AI responses ~3600s, profile analysis ~1800s (see usages in `app/api/ai-chat/route.ts`).
- Rate limit with `rateLimit(req, id, { limit, windowMs, message })` and expose `X-RateLimit-*` via `getRateLimitInfo`.

## Files that show the patterns

- API v1 token workflow: `app/api/v1/developers/route.ts` (estimate → AI → actual usage → consume → persist).
- Rate limiting + headers: `app/api/ai-chat/route.ts`.
- API key auth helpers: `lib/api-auth.ts`.
- Pricing/tokens: `consts/pricing.ts`; per-endpoint `API_TOKEN_COSTS`.
- Redis helpers: `lib/redis.ts`; rate-limit helpers: `lib/utils.ts`.

## Dev workflow

- Commands: `npm run dev`, `npm run build`, `npm run lint`, `npm run generate-changelog`, `npm run test-api`.
- Build runs `prebuild` to generate changelog (`generate-changelog.js`).
- Env: copy `.env.example` → `.env.local` (GitHub, MongoDB, Firebase, Upstash, Gemini, Cloudinary).
- API smoke test: edit `TEST_API_KEY` in `scripts/test-api.js`, start dev server, then `npm run test-api`.

## Realtime chat/polls (UI example)

- `app/gathering/[slug]/chat/page.tsx`; Firebase paths:
  - Messages: `messages/${slug}` (child add/change listeners)
  - Polls: `polls/${slug}/${pollId}`

## Gotchas

- Mongo client uses TLS (`lib/mongodb.ts`); ensure `MONGODB_URI` is valid.
- Many app routes require session; API v1 must use `x-api-key` even if signed in.
- Set `UPSTASH_REDIS_REST_*`; if missing, rate limiting gracefully degrades.

If you add new endpoints, mirror an existing one under `app/api/v1/**`, reuse `requireApiKey`, token budgeting, and caching/limits.
