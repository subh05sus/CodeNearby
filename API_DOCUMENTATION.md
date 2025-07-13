# CodeNearby API Documentation

## Overview

CodeNearby provides powerful APIs to access developer data, AI-powered search, and social features programmatically. Our APIs are designed to help you build applications that connect with the developer community.

## Quick Start

1. **Sign up and log in** to CodeNearby at `http://localhost:3000`
2. **Navigate to API Dashboard** at `http://localhost:3000/api-dashboard`
3. **Generate an API key** with your desired tier
4. **Start making requests** to our endpoints

## Authentication

All API requests require authentication using an API key. Include your API key in the request headers:

```bash
x-api-key: your_api_key_here
```

## Base URL

```
Development: http://localhost:3000/api/v1
Production: https://codenearby.com/api/v1
```

## Rate Limits

| Tier | Requests/Hour | Requests/Month | Price |
|------|---------------|----------------|-------|
| Free | 100 | 1,000 | $0 |
| Developer | 1,000 | 50,000 | $29 |
| Business | 5,000 | 500,000 | $99 |

## Endpoints

### 1. AI-Connect Developer Search

**POST** `/ai-connect/developers`

Find developers using natural language queries powered by AI.

#### Request Body

```json
{
  "query": "Find React Native developers in New York",
  "options": {
    "limit": 10
  }
}
```

#### Parameters

- `query` (string, required): Natural language description of developers you're looking for
- `options.limit` (number, optional): Maximum number of results to return (default: 10, max: 50)

#### Example Queries

- `"Find senior Python developers who work with machine learning"`
- `"Looking for JavaScript developers interested in blockchain"`
- `"Find full-stack developers in San Francisco"`
- `"React Native developers with 5+ years experience"`

#### Response

```json
{
  "message": "Found 5 React Native developers in New York. Consider checking their GitHub profiles for more details.",
  "developers": [
    {
      "id": "12345",
      "login": "johndoe",
      "name": "John Doe",
      "bio": "React Native developer passionate about mobile apps",
      "location": "New York, NY",
      "public_repos": 42,
      "followers": 150,
      "avatar_url": "https://github.com/johndoe.avatar",
      "html_url": "https://github.com/johndoe"
    }
  ],
  "query_analysis": {
    "skills": ["React Native"],
    "location": "New York",
    "search_intent": "Find React Native developers"
  },
  "metadata": {
    "total_results": 5,
    "search_query": "Find React Native developers in New York",
    "timestamp": "2025-07-12T15:30:00.000Z"
  },
  "usage": {
    "requests_remaining": 990,
    "tier": "free"
  }
}
```

### 2. AI-Connect Repository Search

**POST** `/ai-connect/repositories`

Find GitHub repositories using natural language queries powered by AI.

#### Request Body

```json
{
  "query": "Find React UI component libraries",
  "options": {
    "limit": 10,
    "language": "JavaScript",
    "sort": "stars"
  }
}
```

#### Parameters

- `query` (string, required): Natural language description of repositories you're looking for
- `options.limit` (number, optional): Maximum number of results to return (default: 20, max varies by tier)
- `options.language` (string, optional): Filter by programming language
- `options.sort` (string, optional): Sort by 'stars', 'forks', 'updated' (default: 'stars')

#### Example Queries

- `"Find React UI component libraries"`
- `"Looking for Python machine learning frameworks"`
- `"Find JavaScript testing tools"`
- `"Search for Go microservice frameworks"`

#### Response

```json
{
  "message": "Found 15 React UI component libraries with high star counts.",
  "repositories": [
    {
      "id": 123456,
      "name": "react-bootstrap",
      "full_name": "react-bootstrap/react-bootstrap",
      "description": "Bootstrap components built for React",
      "html_url": "https://github.com/react-bootstrap/react-bootstrap",
      "stargazers_count": 22500,
      "forks_count": 3700,
      "language": "JavaScript",
      "topics": ["react", "bootstrap", "ui-components"]
    }
  ],
  "query_analysis": {
    "technologies": ["React", "JavaScript"],
    "project_type": "library",
    "search_intent": "Looking for React UI component libraries"
  },
  "metadata": {
    "total_results": 15,
    "search_query": "Find React UI component libraries",
    "language_filter": "JavaScript",
    "sort_by": "stars",
    "timestamp": "2025-07-12T15:30:00.000Z"
  },
  "usage": {
    "requests_remaining": 985,
    "tier": "free"
  }
}
```

### 3. AI-Connect Profile Analysis

**POST** `/ai-connect/profile`

Get AI-powered analysis of a developer's GitHub profile with insights about skills, activity, and expertise.

#### Request Body

```json
{
  "username": "octocat"
}
```

#### Parameters

- `username` (string, required): GitHub username to analyze (with or without @ symbol)

#### Response

```json
{
  "analysis": "This developer shows strong expertise in JavaScript and React with consistent contribution patterns. High follower count suggests community recognition and thought leadership.",
  "profile_data": {
    "profile": {
      "login": "octocat",
      "name": "The Octocat",
      "bio": "How people build software",
      "public_repos": 8,
      "followers": 4000,
      "following": 9
    }
  },
  "insights": {
    "primary_languages": [
      { "language": "JavaScript", "repositories": 5 }
    ],
    "total_stars": 12500,
    "activity_level": "Active",
    "account_age_years": 14
  },
  "usage": {
    "requests_remaining": 980,
    "tier": "free"
  }
}
}
```

#### Error Responses

```json
{
  "error": "Invalid API key",
  "status": 401
}
```

```json
{
  "error": "Rate limit exceeded. Please try again later.",
  "rateLimitReset": "2025-07-12T15:30:00.000Z",
  "status": 429
}
```

## Code Examples

### JavaScript/Node.js

#### Developer Search
```javascript
const response = await fetch('http://localhost:3000/api/v1/ai-connect/developers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your_api_key_here'
  },
  body: JSON.stringify({
    query: 'Find React developers in San Francisco',
    options: { limit: 5 }
  })
});

const data = await response.json();
console.log(data);
```

#### Repository Search
```javascript
const response = await fetch('http://localhost:3000/api/v1/ai-connect/repositories', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your_api_key_here'
  },
  body: JSON.stringify({
    query: 'Find React UI component libraries',
    options: { 
      limit: 10,
      language: 'JavaScript',
      sort: 'stars'
    }
  })
});

const repos = await response.json();
console.log(repos);
```

#### Profile Analysis
```javascript
const response = await fetch('http://localhost:3000/api/v1/ai-connect/profile', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your_api_key_here'
  },
  body: JSON.stringify({
    username: 'octocat'
  })
});

const profile = await response.json();
console.log(profile);
```

### Python

```python
import requests

url = 'http://localhost:3000/api/v1/ai-connect/developers'
headers = {
    'Content-Type': 'application/json',
    'x-api-key': 'your_api_key_here'
}
data = {
    'query': 'Find Python developers who work with machine learning',
    'options': {
        'limit': 10
    }
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
print(result)
```

### cURL

```bash
curl -X POST http://localhost:3000/api/v1/ai-connect/developers \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key_here" \
  -d '{
    "query": "Find JavaScript developers interested in blockchain",
    "options": {
      "limit": 5
    }
  }'
```

## Testing Your Integration

Use our test script to verify your API integration:

```bash
npm run test-api
```

This will prompt you for your API key and run comprehensive tests including:

- ✅ API key authentication
- ✅ AI-Connect developer search
- ✅ Rate limiting behavior
- ✅ Error handling

## API Management

### Creating API Keys

1. Visit the [API Dashboard](http://localhost:3000/api-dashboard)
2. Click "Create New Key"
3. Enter a descriptive name
4. Select your desired tier
5. Save your API key securely (you won't see it again)

### Monitoring Usage

- View real-time usage statistics in your dashboard
- Track requests per hour/month
- Monitor rate limit status
- See historical usage patterns

### Key Security

- Keep your API keys secure and never expose them in client-side code
- Use environment variables to store API keys
- Regenerate keys if compromised
- Delete unused keys regularly

## Upcoming Features

Based on our comprehensive use case analysis, we're planning to add:

- **Developer Profiles API**: Get detailed developer information
- **GitHub Integration API**: Advanced repository and contribution data
- **Social Features API**: Posts, comments, and social interactions
- **Analytics API**: Platform insights and metrics
- **Webhook Support**: Real-time notifications
- **Bulk Operations**: Process multiple requests efficiently

## Support

- **Documentation**: Visit our [API Dashboard](http://localhost:3000/api-dashboard) for interactive docs
- **Rate Limits**: Contact us for custom enterprise plans
- **Issues**: Report bugs or request features through our support system

## Changelog

### v1.0.0 (Current)
- ✅ AI-Connect Developer Search API
- ✅ API key management system
- ✅ Rate limiting with multiple tiers
- ✅ Comprehensive error handling
- ✅ Redis caching with fallback support

---

**Ready to get started?** [Create your first API key →](http://localhost:3000/api-dashboard)
