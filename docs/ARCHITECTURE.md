# Architecture Overview

CodeNearby is a Next.js 14 App Router application with API endpoints, token-based pricing, and AI-assisted developer discovery.

## High-Level Components
- Web App UI (Next.js App Router, RSC + Client Components)
- API v1 (`app/api/v1/**`)
- Authentication (NextAuth.js with GitHub)
- Database (MongoDB)
- Cache (Upstash Redis)
- AI Services (Gemini / Llama abstractions in `lib/ai.ts`)
- Payments (Razorpay)

## Data Flow (Developer Search)
1. Client calls `POST /api/v1/developers` with x-api-key.
2. API validates key, checks tokens and tier.
3. AI extracts intent and search facets; GitHub search executes with caching.
4. Results summarized by AI; tokens deducted based on usage.

## Key Design Choices
- Token-based metering with daily resets for free tier
- Hashed API keys with usage analytics
- Caching to limit GitHub rate use and speed responses
- Modular libs for tiers, auth, AI, and pricing

See ADRs for decisions and tradeoffs.
