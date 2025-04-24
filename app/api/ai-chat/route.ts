/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server"
import {
    searchGitHubUsersBasic,
    searchGitHubUserByNameBasic,
    getGitHubUserDetails
} from "@/lib/github-search"
import { generateText } from "ai"
import { google } from '@ai-sdk/google';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/options"

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "You must be signed in to use this feature" }, { status: 401 })
        }

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

            const developerDetails = await getGitHubUserDetails(username);

            if (!developerDetails) {
                return NextResponse.json({
                    text: `I couldn't fetch detailed information for GitHub user @${username}. This might be due to API rate limits or the user doesn't exist.`,
                    developers: []
                })
            }

            // Generate a response about the detailed profile
            const { text: aiResponse } = await generateText({
                model: google("models/gemini-2.0-flash-exp"),
                prompt: `
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
                `,
            })

            return NextResponse.json({
                text: aiResponse,
                developers: [developerDetails],
            })
        }

        // Check if the message contains a direct @username mention
        const directUsernameMatch = message.match(/@([a-zA-Z0-9_-]+)/);
        if (directUsernameMatch && directUsernameMatch[1]) {
            const username = directUsernameMatch[1];
            console.log(`Direct username mention found: ${username}`);

            const developerDetails = await getGitHubUserDetails(username);

            if (!developerDetails) {
                return NextResponse.json({
                    text: `I couldn't fetch information for GitHub user @${username}. This might be due to API rate limits or the user doesn't exist.`,
                    developers: []
                })
            }

            // Generate a response about the user
            const { text: aiResponse } = await generateText({
                model: google("models/gemini-2.0-flash-exp"),
                prompt: `
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
                `,
            })

            return NextResponse.json({
                text: aiResponse,
                developers: [developerDetails],
            })
        }

        // If we're searching for a specific person by name
        if (searchPerson) {
            // Search for GitHub users with basic information only
            const developers = await searchGitHubUserByNameBasic(searchPerson);

            // Generate a response based on the search results
            const { text: aiResponse } = await generateText({
                model: google("models/gemini-2.0-flash-exp"),
                prompt: `
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
          `,
            })

            return NextResponse.json({
                text: aiResponse,
                developers: developers,
            })
        }
        // Use different prompt paths based on whether we need to search for developers
        else if (searchDevelopers) {
            // First, use Gemini to understand the user's query
            const { text: aiAnalysis } = await generateText({
                model: google("models/gemini-2.0-flash-exp"),
                prompt: `
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
            })

            // Parse the AI's analysis
            const analysisMatch = aiAnalysis.match(/```json\n([\s\S]*?)\n```/) || aiAnalysis.match(/{[\s\S]*?}/)

            let parsedAnalysis
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
            const { text: aiResponse } = await generateText({
                model: google("models/gemini-2.0-flash-exp"),
                prompt: `
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
          `,
            })

            return NextResponse.json({
                text: aiResponse,
                developers: developers,
            })
        } else {
            // For conversational messages without developer search
            const { text: aiResponse } = await generateText({
                model: google("models/gemini-2.0-flash-exp"),
                prompt: `
            You are an AI assistant helping users find developers on GitHub.
            
            Chat history:
            ${history.map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}
            
            User's latest message: "${message}"
            
            Provide a helpful, conversational response. If the user is asking about developers but not requesting a search, you can suggest they ask you to find developers with specific skills or in specific locations.
            
            If they want more specific information, remind them they can ask you to search for developers with phrases like "find React developers" or "search for programmers in London". They can also search for specific people by name using phrases like "Do you know John Smith?" or "Who is Jane Doe?".
            
            Keep your response friendly, helpful, and focused on helping the user find the right developers.
          `,
            })

            return NextResponse.json({
                text: aiResponse,
                developers: [],
            })
        }
    } catch (error) {
        console.error("Error in AI chat:", error)
        return NextResponse.json({ error: "Failed to process your request" }, { status: 500 })
    }
}
