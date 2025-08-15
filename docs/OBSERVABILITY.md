# Observability

## Logging
- Structured logs in API routes (status, latency, token usage)
- Avoid logging secrets; redact API keys

## Metrics (suggested)
- Requests by route and status code
- Token consumption per route
- Cache hit/miss (Redis)

## Alerts (suggested)
- Sudden spike in 5xx errors
- Unusual token burn rate
- GitHub rate-limit near exhaustion

## Tracing (optional)
- Add request IDs and propagate via headers
