# Development Guide

## Prerequisites
- Node.js 18+
- npm (or pnpm/yarn)
- MongoDB (local or Atlas)

## Setup
1. Clone and install dependencies.
2. Create `.env.local` at repo root. See `docs/ENVIRONMENT.md`.
3. Start dev server:

```bash
npm run dev
```

## Useful Scripts
- `dev` – Start Next.js in dev mode
- `build` – Production build
- `start` – Start production server
- `lint` – Run linters

## Code Conventions
- TypeScript throughout
- Use React Server Components when possible; add `"use client"` when needed
- API handlers live in `app/api/**/route.ts`
- Keep components small and colocate UI in `components/`

## Git Hygiene
- Branches: `feature/<name>`, `fix/<name>`, `docs/<name>`
- Conventional Commits preferred (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`)
- Keep PRs small and well-described

## Data & Local Services
- MongoDB: set `MONGODB_URI` in env
- Redis (Upstash) optional locally; features degrade gracefully

## Troubleshooting
See `TROUBLESHOOTING.md` for common issues.
