/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server"
import {
    searchGitHubUsersBasic,
    searchGitHubUserByNameBasic,
    getGitHubUserDetails
} from "@/lib/github-search"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/options"
import { rateLimit, getRateLimitInfo } from "@/lib/utils"
import { cacheData, getCachedData } from "@/lib/redis"
import { generateMessage } from "@/lib/ai"

type DeveloperType = {
    login: string;
    name: string | null;
    bio: string | null;
    location: string | null;
    company: string | null;
    public_repos: number;
    followers: number;
    topRepositories: Array<{
        name: string;
        description: string | null;
        language: string | null;
        stars: number;
        forks: number;
        createdAt: string;
        updatedAt: string;
    }>

    [key: string]: any;
}

// Rate limit configuration
const RATE_LIMIT_CONFIG = {
    limit: 100,                // 100 requests
    windowMs: 10 * 60 * 1000, // per 10 minutes
    message: "You've reached the AI-Connect request limit. Please try again in 10 minutes."
}

// Cache expiration times (in seconds)
const CACHE_EXPIRY = {
    AI_RESPONSE: 60 * 60,     // 1 hour for AI responses
    PROFILE_ANALYSIS: 60 * 30 // 30 minutes for profile analysis
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "You must be signed in to use this feature" }, { status: 401 })
        }

        // Apply rate limiting based on user ID
        const userId = session.user.id
        const rateLimited = await rateLimit(req, `ai-connect-${userId}`, RATE_LIMIT_CONFIG)

        // If rate limited, return the rate limit response
        if (rateLimited) {
            return rateLimited
        }

        // Get rate limit info for headers
        const rateLimitInfo = await getRateLimitInfo(`ai-connect-${userId}`, RATE_LIMIT_CONFIG.limit)
        console.log(rateLimitInfo)
        const {
            message,
            history,
            searchDevelopers = false,
            searchPerson = null,
            fetchDetailedProfile = null
        } = await req.json()

        // If we need to fetch detailed profile for a specific user
        if (fetchDetailedProfile) {
            const username = fetchDetailedProfile;
            console.log(`Fetching detailed profile for ${username}`)

            // Create a cache key for this profile analysis
            const cacheKey = `ai:profile-analysis:${username}`

            // Try to get from cache first
            const cachedResponse = await getCachedData<{ text: string, developers: any[] }>(cacheKey)
            if (cachedResponse) {
                console.log(`Retrieved profile analysis for ${username} from cache`)

                const response = NextResponse.json({
                    ...cachedResponse,
                    rateLimitInfo,
                    fromCache: true
                })

                // Add rate limit headers
                response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.limit.toString())
                response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString())
                response.headers.set('X-RateLimit-Reset', rateLimitInfo.resetAt)

                return response
            }

            const developerDetails = await getGitHubUserDetails(username) as DeveloperType | null;

            if (!developerDetails) {
                return NextResponse.json({
                    text: `I couldn't fetch detailed information for GitHub user @${username}. This might be due to API rate limits or the user doesn't exist.`,
                    developers: []
                })
            }


            // Generate a response about the detailed profile
            const aiResponse = await generateMessage(
                `
                You are an AI assistant helping users find developers on GitHub.
                The user asked for more details about GitHub user @${username}.
                
                Here's the detailed information I found:
                
                Full name: ${developerDetails.name || 'Not specified'}
                Username: @${developerDetails.login}
                Bio: ${developerDetails.bio || 'No bio provided'}
                Location: ${developerDetails.location || 'Not specified'}
                Company: ${developerDetails.company || 'Not specified'}
                Public Repositories: ${developerDetails.public_repos}
                Followers: ${developerDetails.followers}
                
                ${developerDetails.topRepositories && developerDetails.topRepositories.length > 0
                    ? `Top repositories: 
                    ${developerDetails.topRepositories.map((repo: any, i: number) =>
                        `${i + 1}. ${repo.name}${repo.description ? ` - ${repo.description}` : ''}${repo.language ? ` (${repo.language})` : ''} - ${repo.stars} stars`
                    ).join('\n')}`
                    : 'No repository information available.'}
                
                Provide a helpful, conversational response summarizing this user's GitHub profile. Mention their key projects, expertise areas (based on repositories), and any other interesting information. Keep your response friendly and helpful.
                `
            )

            // Prepare the response data
            const responseData = {
                text: aiResponse,
                developers: [developerDetails]
            }

            // Cache the AI response
            await cacheData(cacheKey, responseData, CACHE_EXPIRY.PROFILE_ANALYSIS)

            const response = NextResponse.json({
                ...responseData,
                rateLimitInfo
            })

            // Add rate limit headers
            response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.limit.toString())
            response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString())
            response.headers.set('X-RateLimit-Reset', rateLimitInfo.resetAt)

            return response
        }

        // Check if the message contains a direct @username mention
        const directUsernameMatch = message.match(/@([a-zA-Z0-9_-]+)/);
        if (directUsernameMatch && directUsernameMatch[1]) {
            const username = directUsernameMatch[1];
            console.log(`Direct username mention found: ${username}`);

            // Create a cache key for this profile mention
            const cacheKey = `ai:profile-mention:${username}`

            // Try to get from cache first
            const cachedResponse = await getCachedData<{ text: string, developers: any[] }>(cacheKey)
            if (cachedResponse) {
                console.log(`Retrieved profile mention response for ${username} from cache`)

                const response = NextResponse.json({
                    ...cachedResponse,
                    rateLimitInfo,
                    fromCache: true
                })

                // Add rate limit headers
                response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.limit.toString())
                response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString())
                response.headers.set('X-RateLimit-Reset', rateLimitInfo.resetAt)

                return response
            }

            const developerDetails = await getGitHubUserDetails(username) as DeveloperType | null;

            if (!developerDetails) {
                return NextResponse.json({
                    text: `I couldn't fetch information for GitHub user @${username}. This might be due to API rate limits or the user doesn't exist.`,
                    developers: []
                })
            }

            // Generate a response about the user
            const aiResponse = await generateMessage(
                `
                You are an AI assistant helping users find developers on GitHub.
                The user asked about GitHub user @${username}.
                
                Here's the information I found:
                
                Full name: ${developerDetails.name || 'Not specified'}
                Username: @${developerDetails.login}
                Bio: ${developerDetails.bio || 'No bio provided'}
                Location: ${developerDetails.location || 'Not specified'}
                Company: ${developerDetails.company || 'Not specified'}
                Public Repositories: ${developerDetails.public_repos}
                Followers: ${developerDetails.followers}
                
                ${developerDetails.topRepositories && developerDetails.topRepositories.length > 0
                    ? `Top repositories: 
                ${developerDetails.topRepositories.map((repo: any, i: number) =>
                        `${i + 1}. ${repo.name}${repo.description ? ` - ${repo.description}` : ''}${repo.language ? ` (${repo.language})` : ''} - ${repo.stars} stars`
                    ).join('\n')}`
                    : 'No repository information available.'}
                
                Provide a helpful, conversational response summarizing this user's GitHub profile. Mention their key projects, expertise areas (based on repositories), and any other interesting information. Keep your response friendly and helpful.
                `
            )

            // Prepare the response data
            const responseData = {
                text: aiResponse,
                developers: [developerDetails]
            }

            // Cache the AI response
            await cacheData(cacheKey, responseData, CACHE_EXPIRY.PROFILE_ANALYSIS)

            const response = NextResponse.json({
                ...responseData,
                rateLimitInfo
            })

            // Add rate limit headers
            response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.limit.toString())
            response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString())
            response.headers.set('X-RateLimit-Reset', rateLimitInfo.resetAt)

            return response
        }

        // If we're searching for a specific person by name
        if (searchPerson) {
            // Create a cache key for this person search
            const cacheKey = `ai:person-search:${searchPerson}`

            // Try to get from cache first
            const cachedResponse = await getCachedData<{ text: string, developers: any[] }>(cacheKey)
            if (cachedResponse) {
                console.log(`Retrieved person search for "${searchPerson}" from cache`)

                const response = NextResponse.json({
                    ...cachedResponse,
                    rateLimitInfo,
                    fromCache: true
                })

                // Add rate limit headers
                response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.limit.toString())
                response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString())
                response.headers.set('X-RateLimit-Reset', rateLimitInfo.resetAt)

                return response
            }

            // Search for GitHub users with basic information only
            const developers = await searchGitHubUserByNameBasic(searchPerson);

            // Generate a response based on the search results
            const aiResponse = await generateMessage(
                `
            You are an AI assistant helping users find developers on GitHub.
            Based on the user's query: "${message}"
            The user is looking for information about a person named "${searchPerson}".
            
            ${developers.length > 0
                    ? `I found ${developers.length} GitHub profiles that might match this person.`
                    : "I couldn't find any GitHub profiles matching this person's name."
                }
            
            ${developers.length > 0 ? "Here's a summary of the profiles I found:" : ""}
            
            ${developers.length > 0
                    ? developers
                        .map(
                            (dev: any, i: number) =>
                                `${i + 1}. ${dev.name || dev.login} (${dev.login})`
                        )
                        .join("\n")
                    : ""
                }
            
            Provide a helpful, conversational response to the user. If matching profiles were found, explain that you've found basic profile information and they can ask for more details about a specific profile by saying "Tell me more about @username" or "Show me details for the 3rd one". If no profiles were found, suggest they try a different name or spelling. Keep your response friendly and helpful.
            
            Include numbers before each profile (1., 2., etc.) so the user can ask for more details about a specific profile by referring to their number.
          `
            )

            // Prepare the response data
            const responseData = {
                text: aiResponse,
                developers: developers
            }

            // Cache the AI response
            await cacheData(cacheKey, responseData, CACHE_EXPIRY.AI_RESPONSE)

            const response = NextResponse.json({
                ...responseData,
                rateLimitInfo
            })

            // Add rate limit headers
            response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.limit.toString())
            response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString())
            response.headers.set('X-RateLimit-Reset', rateLimitInfo.resetAt)

            return response
        }
        // Use different prompt paths based on whether we need to search for developers
        else if (searchDevelopers) {
            // Create a cache key for this developer search query
            const cacheKey = `ai:dev-search:${encodeURIComponent(message)}`

            // Try to get from cache first
            const cachedResponse = await getCachedData<{ text: string, developers: any[] }>(cacheKey)
            if (cachedResponse) {
                console.log(`Retrieved developer search for "${message}" from cache`)

                const response = NextResponse.json({
                    ...cachedResponse,
                    rateLimitInfo,
                    fromCache: true
                })

                // Add rate limit headers
                response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.limit.toString())
                response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString())
                response.headers.set('X-RateLimit-Reset', rateLimitInfo.resetAt)

                return response
            }

            const aiAnalysis = await generateMessage(
                `
            You are an AI assistant helping users find developers on GitHub.
            Analyze this query and extract the following information:
            1. Skills or technologies mentioned (e.g., Android, React, Python)
            2. Location mentioned (e.g., Kolkata, New York)
            3. Any other specific requirements (e.g., experience level, interests)
            
            Format your response as JSON with the following structure:
            {
              "skills": ["skill1", "skill2"],
              "location": "location name or null if not specified",
              "otherRequirements": ["requirement1", "requirement2"],
              "searchQuery": "a GitHub search query string based on the extracted information"
            }
            
            User query: ${message}
          `,
            )

            if (!aiAnalysis) {
                console.error("Failed to parse AI analysis:", aiAnalysis)
                return NextResponse.json({ error: "Failed to parse AI analysis" }, { status: 500 })
            }
            // Parse the AI's analysis
            const analysisMatch = aiAnalysis.match(/```json\n([\s\S]*?)\n```/) || aiAnalysis.match(/{[\s\S]*?}/)
            let parsedAnalysis;
            try {
                parsedAnalysis = analysisMatch
                    ? JSON.parse(analysisMatch[1] || analysisMatch[0])
                    : { skills: [], location: null, otherRequirements: [], searchQuery: "" }
            } catch (e) {
                console.error("Failed to parse AI analysis:", e)
                parsedAnalysis = { skills: [], location: null, otherRequirements: [], searchQuery: "" }
            }

            // Search for GitHub users with basic information only
            const { location, skills } = parsedAnalysis
            let developers: any[] = []

            if (location || skills.length > 0) {
                developers = await searchGitHubUsersBasic(location, skills)
            }

            // Generate a response based on the search results
            const aiResponse = await generateMessage(
                `
            You are an AI assistant helping users find developers on GitHub.
            Based on the user's query: "${message}"
            
            ${developers.length > 0
                    ? `I found ${developers.length} developers that might match your criteria.`
                    : "I couldn't find any developers matching your specific criteria."
                }
            
            ${developers.length > 0 ? "Here's a summary of the developers I found:" : ""}
            
            ${developers.length > 0
                    ? developers
                        .slice(0, 5)
                        .map(
                            (dev: any, i: number) =>
                                `${i + 1}. ${dev.name || 'User'} (@${dev.login})`
                        )
                        .join("\n")
                    : ""
                }
            
            Provide a helpful, conversational response to the user. If developers were found, explain that these are basic profile results and the user can ask for more details about a specific developer by saying "Tell me more about @username" or "Show me details for the 3rd one". If no developers were found, suggest ways to broaden the search. Keep your response friendly and helpful.
            
            Include numbers before each developer (1., 2., etc.) so the user can ask for more details about a specific developer by referring to their number.
          `)

            // Prepare the response data
            const responseData = {
                text: aiResponse,
                developers: developers
            }

            // Cache the AI response
            await cacheData(cacheKey, responseData, CACHE_EXPIRY.AI_RESPONSE)

            const response = NextResponse.json({
                ...responseData,
                rateLimitInfo
            })

            // Add rate limit headers
            response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.limit.toString())
            response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString())
            response.headers.set('X-RateLimit-Reset', rateLimitInfo.resetAt)

            return response
        } else {
            // For conversational messages without developer search
            // Create a cache key based on the message content and history length
            // Note: For privacy reasons, we don't cache the entire conversation history
            const historyHash = history.length.toString();
            const messageHash = message.slice(0, 100); // Use first 100 chars to avoid too-long keys
            const cacheKey = `ai:conversation:${historyHash}:${encodeURIComponent(messageHash)}`;

            // Try to get from cache first (only for common/general questions)
            // For privacy, we don't cache very specific conversations
            if (history.length < 3 && message.length < 200) {
                const cachedResponse = await getCachedData<{ text: string }>(cacheKey)
                if (cachedResponse) {
                    console.log(`Retrieved conversation response from cache`)

                    const response = NextResponse.json({
                        ...cachedResponse,
                        developers: [],
                        rateLimitInfo,
                        fromCache: true
                    })

                    // Add rate limit headers
                    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.limit.toString())
                    response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString())
                    response.headers.set('X-RateLimit-Reset', rateLimitInfo.resetAt)

                    return response
                }
            }

            // Generate AI response if not in cache
            const aiResponse = await generateMessage(
                `
            You are an AI assistant helping users find developers on GitHub.
            
            Chat history:
            ${history.map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}
            
            User's latest message: "${message}"
            
            Provide a helpful, conversational response. If the user is asking about developers but not requesting a search, you can suggest they ask you to find developers with specific skills or in specific locations.
            
            If they want more specific information, remind them they can ask you to search for developers with phrases like "find React developers" or "search for programmers in London". They can also search for specific people by name using phrases like "Do you know John Smith?" or "Who is Jane Doe?".
            
            Keep your response friendly, helpful, and focused on helping the user find the right developers.
          `
            )

            // Prepare the response data
            const responseData = {
                text: aiResponse
            }

            // Cache the AI response (only for common/general questions to protect privacy)
            if (history.length < 3 && message.length < 200) {
                await cacheData(cacheKey, responseData, CACHE_EXPIRY.AI_RESPONSE)
            }

            const response = NextResponse.json({
                ...responseData,
                developers: [],
                rateLimitInfo
            })

            // Add rate limit headers
            response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.limit.toString())
            response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString())
            response.headers.set('X-RateLimit-Reset', rateLimitInfo.resetAt)

            return response
        }
    } catch (error) {
        console.error("Error in AI chat:", error)
        return NextResponse.json({ error: "Failed to process your request" }, { status: 500 })
    }
}
