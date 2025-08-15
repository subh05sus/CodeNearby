# API Usage Guide

This guide shows how to authenticate and call the public API.

## Authentication
Include your API key in the request header:

```
x-api-key: YOUR_API_KEY
```

## Endpoints
- POST `/api/v1/developers` – AI-powered developer search
- POST `/api/v1/profile/analyze` – GitHub profile analysis
- POST `/api/v1/repositories` – Repository search (premium)
- GET `/api/v1/users/tier` – User tier and token info
- GET `/api/v1/pricing` – Pricing and token packages

## Example
```bash
curl -X POST "http://localhost:3000/api/v1/developers" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"Find React developers in New York"}'
```

## Errors
- 401 Unauthorized – Missing/invalid API key
- 402 Payment Required – Insufficient tokens
- 403 Forbidden – Tier limits exceeded
- 429 Too Many Requests – Rate-limited (planned)
- 5xx – Server errors

See `API_IMPLEMENTATION.md` and `API_ROUTES_SUMMARY.md` for details.
