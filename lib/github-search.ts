/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Developer } from "@/types"
import { cacheData, getCachedData } from "./redis"

// Cache expiration times (in seconds)
const CACHE_EXPIRY = {
    SEARCH_RESULTS: 60 * 10, // 10 minutes for search results
    USER_DETAILS: 60 * 60,   // 1 hour for user details
    BULK_SEARCH: 60 * 5      // 5 minutes for bulk searches
};

/**
 * Search for GitHub users with basic information only
 * @param location Location to search for
 * @param skills Skills to search for
 * @returns Array of developers with basic information
 */
export async function searchGitHubUsersBasic(location: string | null, skills: string[]): Promise<Developer[]> {
    try {
        // Build the search query
        let query = "type:user"

        if (location) {
            query += ` location:"${location}"`
        }

        // Add skills to the query - we'll search in bio and readme
        if (skills.length > 0) {
            const skillsQuery = skills.map((skill) => `${skill}`).join(" OR ")
            query += ` ${skillsQuery}`
        }

        // Generate cache key based on search parameters
        const cacheKey = `github:search:basic:${encodeURIComponent(query)}`

        // Try to get results from cache first
        const cachedResults = await getCachedData<Developer[]>(cacheKey)
        if (cachedResults) {
            console.log('Retrieved GitHub search results from cache')
            return cachedResults
        }

        // If not in cache, make the GitHub API request
        const response = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(query)}&per_page=10`, {
            headers: {
                Accept: "application/vnd.github.v3+json",
            },
        })

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`)
        }

        const data = await response.json()

        // Process results
        const results = data.items.map((user: any) => ({
            id: user.id.toString(),
            login: user.login,
            avatar_url: user.avatar_url,
            html_url: user.html_url,
            // Add a flag to indicate this is basic information
            isBasicInfo: true
        }));

        // Cache the results
        await cacheData(cacheKey, results, CACHE_EXPIRY.SEARCH_RESULTS)

        return results;
    } catch (error) {
        console.error("Error searching GitHub users:", error)
        return []
    }
}

/**
 * Get detailed information for a specific GitHub user
 * @param username GitHub username
 * @returns Detailed developer information
 */
export async function getGitHubUserDetails(username: string) {
    try {
        // Check cache first
        const cacheKey = `github:user:${username}`
        const cachedUser = await getCachedData(cacheKey)

        if (cachedUser) {
            console.log(`Retrieved GitHub user ${username} details from cache`)
            return cachedUser
        }

        // Fetch user data from GitHub if not in cache
        const userResponse = await fetch(`https://api.github.com/users/${username}`, {
            headers: {
                Accept: "application/vnd.github.v3+json",
            },
        });

        if (!userResponse.ok) {
            console.error(`Failed to fetch details for user ${username}`)
            return null
        }

        const userData = await userResponse.json()

        // Get additional profile data like repositories and followers
        const [reposData, followersData] = await Promise.all([
            fetch(`${userData.repos_url}?per_page=5&sort=updated`, {
                headers: { Accept: "application/vnd.github.v3+json" }
            }).then(res => res.ok ? res.json() : []),
            fetch(`${userData.followers_url}?per_page=5`, {
                headers: { Accept: "application/vnd.github.v3+json" }
            }).then(res => res.ok ? res.json() : [])
        ]);

        // Extract top repositories information
        const topRepos = reposData.map((repo: any) => ({
            name: repo.name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count,
            url: repo.html_url
        }));

        // Construct user details object
        const userDetails = {
            id: userData.id.toString(),
            login: userData.login,
            avatar_url: userData.avatar_url,
            html_url: userData.html_url,
            name: userData.name,
            bio: userData.bio,
            location: userData.location,
            email: userData.email,
            public_repos: userData.public_repos,
            followers: userData.followers,
            company: userData.company,
            blog: userData.blog,
            twitter_username: userData.twitter_username,
            topRepositories: topRepos,
            followersList: followersData.map((follower: any) => ({
                login: follower.login,
                avatar_url: follower.avatar_url,
                html_url: follower.html_url
            }))
        };

        // Cache the user details
        await cacheData(cacheKey, userDetails, CACHE_EXPIRY.USER_DETAILS)

        return userDetails;
    } catch (error) {
        console.error(`Error getting details for GitHub user ${username}:`, error)
        return null
    }
}

/**
 * Legacy function that fetches full details for all users (kept for backward compatibility)
 * This should be avoided for bulk searches as it can hit rate limits
 */
export async function searchGitHubUsers(location: string | null, skills: string[]): Promise<Developer[]> {
    try {
        // Build the search query
        let query = "type:user"

        if (location) {
            query += ` location:"${location}"`
        }

        // Add skills to the query - we'll search in bio and readme
        if (skills.length > 0) {
            const skillsQuery = skills.map((skill) => `${skill}`).join(" OR ")
            query += ` ${skillsQuery}`
        }

        // Generate cache key for this search
        const cacheKey = `github:search:full:${encodeURIComponent(query)}`

        // Try to get from cache first
        const cachedResults = await getCachedData<Developer[]>(cacheKey)
        if (cachedResults) {
            console.log('Retrieved full GitHub search results from cache')
            return cachedResults
        }

        // Make the GitHub API request if not in cache
        const response = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(query)}&per_page=10`, {
            headers: {
                Accept: "application/vnd.github.v3+json",
            },
        })

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`)
        }

        const data = await response.json()

        // Fetch detailed information for each user
        const detailedUsers = await Promise.all(
            data.items.map(async (user: any) => {
                // Check if we have this user in cache first
                const userCacheKey = `github:user:${user.login}`
                const cachedUser = await getCachedData(userCacheKey)

                if (cachedUser) {
                    return cachedUser
                }

                // If not in cache, fetch from API
                const userResponse = await fetch(user.url, {
                    headers: {
                        Accept: "application/vnd.github.v3+json",
                    },
                })

                if (!userResponse.ok) {
                    console.error(`Failed to fetch details for user ${user.login}`)
                    return null
                }

                const userData = await userResponse.json()

                // Filter users based on skills in their bio if skills were specified
                if (skills.length > 0) {
                    const userBio = (userData.bio || "").toLowerCase()
                    const hasSkill = skills.some((skill) => userBio.includes(skill.toLowerCase()))

                    if (!hasSkill) {
                        return null
                    }
                }

                const userDetails = {
                    id: userData.id.toString(),
                    login: userData.login,
                    avatar_url: userData.avatar_url,
                    html_url: userData.html_url,
                    name: userData.name,
                    bio: userData.bio,
                    location: userData.location,
                    email: userData.email,
                    public_repos: userData.public_repos,
                    followers: userData.followers,
                }

                // Cache individual user details
                await cacheData(userCacheKey, userDetails, CACHE_EXPIRY.USER_DETAILS)

                return userDetails
            }),
        )

        // Filter out null values
        const results = detailedUsers.filter(Boolean) as Developer[]

        // Cache the entire search results
        await cacheData(cacheKey, results, CACHE_EXPIRY.BULK_SEARCH)

        return results
    } catch (error) {
        console.error("Error searching GitHub users:", error)
        return []
    }
}

/**
 * Search for a specific GitHub user by name with basic information
 * @param name The name or username to search for
 * @returns Array of matching developers with basic information
 */
export async function searchGitHubUserByNameBasic(name: string): Promise<Developer[]> {
    try {
        if (!name || name.trim() === "") {
            return [];
        }

        // Build the search query for a specific person
        // Search in both the name and username fields
        const query = `${name} in:name OR ${name} in:login type:user`;

        // Generate cache key
        const cacheKey = `github:search:name:basic:${encodeURIComponent(name)}`

        // Try to get from cache first
        const cachedResults = await getCachedData<Developer[]>(cacheKey)
        if (cachedResults) {
            console.log(`Retrieved GitHub user search for "${name}" from cache`)
            return cachedResults
        }

        // Make the GitHub API request if not in cache
        const response = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(query)}&per_page=5`, {
            headers: {
                Accept: "application/vnd.github.v3+json",
            },
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`)
        }

        const data = await response.json()

        // Process results
        const results = data.items.map((user: any) => ({
            id: user.id.toString(),
            login: user.login,
            avatar_url: user.avatar_url,
            html_url: user.html_url,
            // Add a flag to indicate this is basic information
            isBasicInfo: true
        }));

        // Cache the results
        await cacheData(cacheKey, results, CACHE_EXPIRY.SEARCH_RESULTS)

        return results;
    } catch (error) {
        console.error("Error searching GitHub user by name:", error)
        return []
    }
}

/**
 * Search for a specific GitHub user by name
 * @param name The name or username to search for
 * @returns Array of matching developers with detailed information
 */
export async function searchGitHubUserByName(name: string): Promise<Developer[]> {
    try {
        if (!name || name.trim() === "") {
            return [];
        }

        // Build the search query for a specific person
        // Search in both the name and username fields
        const query = `${name} in:name OR ${name} in:login type:user`;

        // Generate cache key
        const cacheKey = `github:search:name:detailed:${encodeURIComponent(name)}`

        // Try to get from cache first
        const cachedResults = await getCachedData<Developer[]>(cacheKey)
        if (cachedResults) {
            console.log(`Retrieved detailed GitHub user search for "${name}" from cache`)
            return cachedResults
        }

        // Make the GitHub API request if not in cache
        const response = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(query)}&per_page=5`, {
            headers: {
                Accept: "application/vnd.github.v3+json",
            },
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`)
        }

        const data = await response.json()

        // Fetch detailed information for each user
        const detailedUsers = await Promise.all(
            data.items.map(async (user: any) => {
                // Check if we have this user in cache first
                const userCacheKey = `github:user:${user.login}`
                const cachedUser = await getCachedData(userCacheKey)

                if (cachedUser) {
                    return cachedUser
                }

                // If not in cache, fetch from GitHub API
                const userResponse = await fetch(user.url, {
                    headers: {
                        Accept: "application/vnd.github.v3+json",
                    },
                });

                if (!userResponse.ok) {
                    console.error(`Failed to fetch details for user ${user.login}`)
                    return null
                }

                const userData = await userResponse.json()

                // Get additional profile data like repositories and followers
                const [reposData, followersData] = await Promise.all([
                    fetch(`${userData.repos_url}?per_page=5&sort=updated`, {
                        headers: { Accept: "application/vnd.github.v3+json" }
                    }).then(res => res.ok ? res.json() : []),
                    fetch(`${userData.followers_url}?per_page=5`, {
                        headers: { Accept: "application/vnd.github.v3+json" }
                    }).then(res => res.ok ? res.json() : [])
                ]);

                // Extract top repositories information
                const topRepos = reposData.map((repo: any) => ({
                    name: repo.name,
                    description: repo.description,
                    language: repo.language,
                    stars: repo.stargazers_count,
                    url: repo.html_url
                }));

                // Construct user details
                const userDetails = {
                    id: userData.id.toString(),
                    login: userData.login,
                    avatar_url: userData.avatar_url,
                    html_url: userData.html_url,
                    name: userData.name,
                    bio: userData.bio,
                    location: userData.location,
                    email: userData.email,
                    public_repos: userData.public_repos,
                    followers: userData.followers,
                    company: userData.company,
                    blog: userData.blog,
                    twitter_username: userData.twitter_username,
                    topRepositories: topRepos,
                    followersList: followersData.map((follower: any) => ({
                        login: follower.login,
                        avatar_url: follower.avatar_url,
                        html_url: follower.html_url
                    }))
                }

                // Cache individual user details
                await cacheData(userCacheKey, userDetails, CACHE_EXPIRY.USER_DETAILS)

                return userDetails
            }),
        )

        // Filter out null values
        const results = detailedUsers.filter(Boolean) as Developer[]

        // Cache the entire search results
        await cacheData(cacheKey, results, CACHE_EXPIRY.SEARCH_RESULTS)

        return results
    } catch (error) {
        console.error("Error searching GitHub user by name:", error)
        return []
    }
}



