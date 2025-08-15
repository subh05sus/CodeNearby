---
name: API Endpoint Issue
about: Report a problem or request for an API endpoint
title: "[API] <endpoint or short description>"
labels: [api, backend]
assignees: ''

---

### 🔌 Endpoint details
- Path: `/api/v1/...`
- Method: GET | POST | PUT | DELETE
- Auth type: Session | API Key (`x-api-key`)

### 🐛 Problem or 💡 Request
Describe the bug or the feature you want for this endpoint.

### 🔁 Repro steps (curl or code)
1. ...
2. ...

### ✅ Expected vs. 🧪 Actual
- Expected:
- Actual:

### 🔒 Token budgeting (if AI)
- Estimated tokens (from `consts/pricing.ts`):
- Actual `tokensUsed` (if available):

### 🚦 Rate limiting / Caching
- Rate-limit headers observed (`X-RateLimit-*`):
- Cache key(s) affected (e.g., `ai:*`, `github:*`):

### 📎 Logs / Screenshots
Attach server logs or screenshots.
