# CodeNearby API Implementation

## Overview

This implementation adds a comprehensive API system to CodeNearby with token-based pricing, user tiers, and AI-powered developer search capabilities.

## Key Features Implemented

### 1. **User Migration** ✅
- **Script**: `scripts/migrate-users-for-api.js`
- **Status**: Successfully updated 448 users
- **New Fields Added**:
  - `tier`: User tier (free/premium)
  - `tokenBalance`: Daily and purchased token tracking
  - `usage`: Daily and total usage statistics
  - `apiKeyCount`: Number of API keys created
  - `billing`: Purchase history and preferences
  - `features`: Feature access based on tier
  - `verification`: Account verification status

### 2. **User Tier System** ✅
- **Library**: `lib/user-tiers.ts`
- **Features**:
  - FREE tier: 1,000 daily tokens, 1 API key
  - PREMIUM tier: 2,000 daily tokens, 10 API keys
  - Token packages with bonus tokens
  - Currency support (USD/INR)
  - Daily token reset functionality

### 3. **API Routes** ✅

#### Core API Endpoints:
- `POST /api/v1/developers` - AI-powered developer search
- `POST /api/v1/profile` - GitHub profile analysis  
- `POST /api/v1/repositories` - Repository search (Premium)
- `GET /api/v1/users/tier` - User tier and token information

#### Management Routes:
- `POST /api/v1/auth/keys` - Create API keys
- `GET /api/v1/auth/keys` - List user's API keys
- `DELETE /api/v1/auth/keys` - Delete API keys
- `POST /api/v1/billing/buy-tokens` - Purchase token packages
- `GET /api/v1/users/api-key-permission` - Check API key creation limits

### 4. **Components & UI** ✅
- **API Dashboard**: `components/token-api-dashboard.tsx`
- **Token Store**: `components/token-upgrade-page.tsx`
- **API Documentation**: `app/api-docs/page.tsx`
- **Currency Toggle**: `components/ui/currency-toggle.tsx`
- **Currency Hook**: `hooks/use-currency.tsx`

### 5. **Database Schema**

#### Users Collection Updates:
```javascript
{
  // Existing fields...
  tier: "free" | "premium",
  tokenBalance: {
    daily: number,
    purchased: number,
    total: number
  },
  usage: {
    today: {
      tokens: number,
      requests: number,
      date: string // YYYY-MM-DD
    },
    total: {
      tokens: number,
      requests: number
    }
  },
  apiKeyCount: number,
  maxApiKeys: number,
  billing: {
    currency: "USD" | "INR",
    totalSpent: number,
    purchases: Array<{
      packageId: string,
      tokens: number,
      amount: number,
      currency: string,
      date: Date,
      transactionId?: string
    }>
  },
  lastTokenReset: Date,
  features: {
    developerSearch: boolean,
    profileAnalysis: boolean,
    repositorySearch: boolean,
    analytics: boolean,
    prioritySupport: boolean
  },
  verification: {
    email: boolean,
    phone: boolean,
    github: boolean
  }
}
```

#### API Keys Collection:
```javascript
{
  _id: ObjectId,
  userId: string,
  name: string,
  keyHash: string, // SHA-256 hash
  keyPreview: string, // First 8 + last 4 chars
  tier: string,
  isActive: boolean,
  createdAt: Date,
  lastUsed: Date | null
}
```

## Token-Based Pricing

### Token Packages:
1. **BASIC**: $9 USD / ₹49 INR - 5,000 tokens
2. **STANDARD**: $25 USD / ₹149 INR - 17,000 tokens (15k + 2k bonus)
3. **PRO**: $79 USD / ₹499 INR - 60,000 tokens (50k + 10k bonus)
4. **ENTERPRISE**: $199 USD / ₹1,499 INR - 200,000 tokens (150k + 50k bonus)

### Token Consumption:
- **Developer Search**: 200-800 tokens (avg: 400)
- **Profile Analysis**: 300-2,000 tokens (avg: 1,000)
- **Repository Search**: 150-1,200 tokens (avg: 600)
- **User Tier Info**: 0 tokens (free)

## API Authentication

All API requests require an API key in the header:
```
x-api-key: your_api_key_here
```

API keys are:
- SHA-256 hashed for security
- Tied to user accounts and tiers
- Rate limited based on tier
- Trackable for usage analytics

## Testing the Implementation

### 1. Run Migration (Already Done)
```bash
node scripts/migrate-users-for-api.js
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Test Endpoints

#### Create API Key:
```bash
curl -X POST "http://localhost:3000/api/v1/auth/keys" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION" \
  -d '{"name": "Test API Key"}'
```

#### Test Developer Search:
```bash
curl -X POST "http://localhost:3000/api/v1/developers" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "Find React developers in New York"}'
```

#### Check User Tier:
```bash
curl -X GET "http://localhost:3000/api/v1/users/tier" \
  -H "x-api-key: YOUR_API_KEY"
```

## File Structure

```
app/
├── api/
│   └── v1/
│       ├── auth/
│       │   └── keys/route.ts
│       ├── billing/
│       │   └── buy-tokens/route.ts
│       ├── developers/route.ts
│       ├── profile/route.ts
│       ├── repositories/route.ts
│       └── users/
│           ├── tier/route.ts
│           └── api-key-permission/route.ts
├── api-dashboard/page.tsx
├── api-docs/page.tsx
└── upgrade/page.tsx

components/
├── token-api-dashboard.tsx
├── token-upgrade-page.tsx
├── token-store-page.tsx
└── ui/
    └── currency-toggle.tsx

hooks/
└── use-currency.tsx

lib/
├── user-tiers.ts
└── ai.ts

scripts/
└── migrate-users-for-api.js
```

## Next Steps

1. **Payment Integration**: Replace mock payment with real payment processors (Stripe, Razorpay)
2. **Rate Limiting**: Implement request rate limiting based on tiers
3. **Analytics Dashboard**: Build comprehensive usage analytics
4. **Webhooks**: Add webhook support for real-time integrations
5. **Mobile SDKs**: Create SDKs for mobile app integration
6. **GraphQL**: Consider GraphQL API endpoints
7. **Enterprise Features**: SSO, custom integrations, dedicated support

## Security Considerations

- API keys are SHA-256 hashed
- Session-based authentication for management endpoints
- Input validation on all endpoints
- MongoDB injection prevention
- Rate limiting (to be implemented)
- Token balance validation before API execution

## Performance Optimizations

- Database indexes on key fields
- Redis caching for AI responses (30 minutes)
- Efficient token consumption logic
- Optimized MongoDB queries
- Background token reset jobs

## Monitoring & Observability

- Request/response logging
- Token usage tracking
- Error monitoring
- Performance metrics
- User tier analytics
- Payment transaction logs
