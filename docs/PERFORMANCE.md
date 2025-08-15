# Performance Guide

## Frontend
- Prefer RSC; keep client components lean
- Use Suspense boundaries for slow data
- Avoid heavy work on the client

## API
- Leverage Redis cache for GitHub searches
- Batch and debounce outbound calls where possible
- Measure and cap AI token usage

## Assets
- Optimize images; use Next/Image when possible

## Monitoring
- Track latency percentiles and cache hit ratio
