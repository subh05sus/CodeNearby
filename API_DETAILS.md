# CodeNearby API Details and Pricing

This document consolidates API features, endpoints, authentication, pricing, and token usage. All prices, tiers, token packages, and token usage estimates are centralized in `consts/pricing.ts`.

## Authentication
- Use x-api-key in headers for API v1: `x-api-key: <your_key>`
- Session-based routes (dashboard/web) use NextAuth sessions.

## Endpoints
- POST /api/v1/developers
  - Description: AI-powered developer search.
  - Token cost estimate: 200-800 (avg 400) from consts/pricing.ts.
  - Behavior: Pre-check estimate; after AI call, deduct actual tokensUsed when available; else fallback to estimate.
- POST /api/v1/profile
  - Description: AI-powered profile analysis.
  - Token cost estimate: 300-2000 (avg 1000) from consts/pricing.ts.
  - Behavior: Same pre-check and actual usage deduction.
- POST /api/v1/profile/analyze
  - Description: GitHub profile analysis (non-AI path in repo), consumes estimate.
  - Token cost estimate: 300-2000 (avg 1000).
- POST /api/v1/repositories
  - Description: AI-powered repository search.
  - Token cost estimate: 150-1200 (avg 600) from consts/pricing.ts.
  - Behavior: Same pre-check and actual usage deduction.
- GET /api/v1/pricing (free)
  - Returns tiers, token packages, and endpoint cost ranges from consts/pricing.ts.

## Pricing & Tiers (consts/pricing.ts)
- USER_TIERS: free, premium (dailyTokens, maxApiKeys, features).
- TOKEN_PACKAGES: basic, standard, pro, enterprise (USD/INR), never expire.
- API_TOKEN_COSTS: per-endpoint min/max/average used for pre-checks and docs.

## Token Usage Rules
- Pre-check: verify available balance >= estimate before expensive work.
- Charge: use AI `tokensUsed` when provided; fallback to estimate otherwise.
- Daily tokens reset automatically; purchased tokens never expire.

## UI/Docs
- `/api-docs` reads cost ranges from consts/pricing.ts.
- Dashboard and Token Store use shared pricing helpers for display.

## Source of Truth
- All numbers (tiers, packages, estimates) live in `consts/pricing.ts`.
- Libraries re-export or reference these constants to avoid duplication.
