# CodeNearby - Copilot Instructions

## Project Overview
CodeNearby is a **Next.js 14** social networking platform for developers featuring real-time chat, location-based discovery, AI-powered developer search, and GitHub integration. Think "Tinder for developers" with collaborative features.

## Architecture & Tech Stack

### Core Stack
- **Framework**: Next.js 14 with App Router
- **Database**: MongoDB (primary data) + Firebase Realtime Database (chat/gatherings)
- **Authentication**: NextAuth.js with GitHub OAuth
- **AI**: Google Gemini API for developer search and recommendations
- **Caching**: Upstash Redis for API responses and AI interactions
- **Styling**: Tailwind CSS with shadcn/ui components
- **Real-time**: Firebase Realtime Database for chat and gathering features

### Key External Services
- **Cloudinary**: Image uploads and transformations
- **GitHub API**: Profile sync, repository data, activity feeds
- **Upstash Redis**: Caching layer for performance optimization

## Critical Development Patterns

### 1. Authentication & Session Management
```typescript
// Always use getServerSession for server components
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/options";

// Extended session type includes GitHub data
interface Session {
  user: {
    id: string;
    githubUsername: string;
    githubId: string;
    // ... other fields
  }
}
```

### 2. Database Architecture - Hybrid Approach
- **MongoDB**: User profiles, posts, friendships, gatherings metadata
- **Firebase**: Real-time chat messages, gathering chat rooms, live updates
- **Pattern**: Use MongoDB for persistent data, Firebase for ephemeral real-time features

### 3. API Route Patterns
```typescript
// Standard API route structure
export async function GET/POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const client = await clientPromise;
  const db = client.db();
  // ... operations
}
```

### 4. Real-time Chat Implementation
- **Path**: `app/gathering/[slug]/chat/page.tsx` for gathering chats
- **Pattern**: Firebase `onChildAdded`/`onChildChanged` for real-time updates
- **Features**: Anonymous messaging, message pinning, polls, @mentions
```typescript
// Firebase real-time listener pattern
const messagesRef = ref(db, `messages/${gatheringSlug}`);
const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
  const message = snapshot.val();
  setMessages(prev => [...prev, { ...message, id: snapshot.key }]);
});
```

### 5. AI Chat Interface (`components/ai-chat-interface.tsx`)
- **Complex state management** for developer search results and repository data
- **Caching strategy** with Redis for API responses
- **Pattern matching** for different query types (developer search, repo search, profile lookup)
- **Location-based search** integration

## Component Architecture

### Layout Structure
- `app/layout.tsx`: Root layout with theme provider, auth provider
- `components/header.tsx`: Complex navigation with search, auth states
- `components/logged-in-view.tsx` vs `components/not-logged-in-view.tsx`: Conditional rendering

### Key Reusable Components
- `components/post-card.tsx`: Complex post rendering with polls, comments, sharing
- `components/developer-grid.tsx`: Animated grid for displaying developer profiles
- `components/chat-list.tsx`: Friend list with last message previews
- `components/search-overlay.tsx`: Global search functionality

### UI Components (shadcn/ui)
Located in `components/ui/` - customized versions of shadcn components with project-specific styling.

## Data Flow Patterns

### 1. Onboarding Flow
- **Path**: `app/onboarding/` with multi-step process
- **Pattern**: Server-side checks in layout, client-side step management
- **Key**: `onboardingCompleted` flag in user document

### 2. Location-Based Features
- **IP-based detection**: `lib/location.ts` for automatic location detection
- **User location storage**: MongoDB user documents
- **Search integration**: Location filters in developer discovery

### 3. GitHub Integration
- **Profile sync**: Automatic on auth, manual refresh available
- **Activity feeds**: `lib/github.ts` for fetching GitHub events
- **Repository search**: Integrated into AI chat interface

## Development Workflow

### Essential Commands
```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint checking
npm run generate-changelog  # Update changelog
```

### Environment Setup
- Copy `.env.example` to `.env.local`
- **Required**: GitHub OAuth, MongoDB, Firebase, Gemini API, Upstash Redis
- **Optional**: Cloudinary (for image uploads)

### Database Operations
- **No migrations**: MongoDB schema-less, handled in application code
- **Indexes**: Critical for user searches by location, skills, GitHub data
- **Connection**: Singleton pattern in `lib/mongodb.ts`

## Feature-Specific Guidance

### Adding New Chat Features
- Extend `Message` interface in gathering chat components
- Update Firebase message structure
- Consider anonymity and host-only permissions

### Developer Search/Discovery
- Modify `app/api/ai-chat/route.ts` for new search logic
- Update caching strategy in Redis integration
- Consider rate limiting for external API calls

### Real-time Features
- Use Firebase Realtime Database, not Firestore
- Implement proper cleanup in useEffect hooks
- Handle offline/connection states

### GitHub Integration
- Respect API rate limits (5000/hour authenticated)
- Cache responses in Redis when possible
- Handle missing/private profile data gracefully

## Testing & Debugging

### Common Issues
- **Firebase connection**: Check environment variables with `NEXT_PUBLIC_` prefix
- **MongoDB connection**: Verify TLS settings in production
- **GitHub API limits**: Monitor rate limit headers in responses
- **Chat not updating**: Verify Firebase rules and authentication

### Performance Considerations
- Use Redis caching for expensive GitHub API calls
- Implement proper image optimization with Cloudinary
- Lazy load components with dynamic imports for large pages
- Monitor Firebase real-time connection limits

## Deployment Notes
- **Platform**: Designed for Vercel deployment
- **Environment**: Production requires all external service credentials
- **Static assets**: Images configured for multiple CDN domains
- **Build**: Next.js static optimization enabled where possible
