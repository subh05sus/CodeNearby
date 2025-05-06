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

/**
 * Search for GitHub repositories with basic information
 * @param query The search query for repositories
 * @returns Array of repositories with basic information
 */
export async function searchGitHubReposBasic(query: string): Promise<any[]> {
    try {
        if (!query || query.trim() === "") {
            return [];
        }

        // Build the search query for repositories
        const searchQuery = `${query} in:name,description,readme`;

        // Generate cache key
        const cacheKey = `github:search:repos:basic:${encodeURIComponent(searchQuery)}`

        // Try to get from cache first
        const cachedResults = await getCachedData<any[]>(cacheKey)
        if (cachedResults) {
            console.log(`Retrieved GitHub repo search for "${query}" from cache`)
            return cachedResults
        }

        // Make the GitHub API request if not in cache
        const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}&per_page=10&sort=stars&order=desc`, {
            headers: {
                Accept: "application/vnd.github.v3+json",
            },
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`)
        }

        const data = await response.json()

        // Process results
        const results = data.items.map((repo: any) => ({
            id: repo.id.toString(),
            name: repo.name,
            full_name: repo.full_name,
            html_url: repo.html_url,
            description: repo.description,
            language: repo.language,
            stargazers_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            watchers_count: repo.watchers_count,
            owner: {
                login: repo.owner.login,
                avatar_url: repo.owner.avatar_url,
                html_url: repo.owner.html_url,
            },
            created_at: repo.created_at,
            updated_at: repo.updated_at,
            topics: repo.topics || [],
            is_template: repo.is_template,
            license: repo.license ? repo.license.name : null,
        }));

        // Cache the results
        await cacheData(cacheKey, results, CACHE_EXPIRY.SEARCH_RESULTS)

        return results;
    } catch (error) {
        console.error("Error searching GitHub repositories:", error)
        return []
    }
}

/**
 * Search for similar repositories based on a reference repository
 * @param repoName The name of the repository to find similar ones for
 * @returns Array of similar repositories
 */
export async function searchSimilarRepositories(repoName: string): Promise<any[]> {
    try {
        if (!repoName || repoName.trim() === "") {
            return [];
        }

        // First, try to get some information about the repository
        const baseRepoInfo = await getRepositoryInfo(repoName);
        
        if (!baseRepoInfo) {
            // If we couldn't find the repository, just do a basic search with the name
            return searchGitHubReposBasic(repoName);
        }

        // Build a search query based on the repository's topics, language, and description
        const searchTerms = [];
        
        // Add topics from the base repository
        if (baseRepoInfo.topics && baseRepoInfo.topics.length > 0) {
            searchTerms.push(...baseRepoInfo.topics.slice(0, 3));
        }
        
        // Add language if available
        if (baseRepoInfo.language) {
            searchTerms.push(`language:${baseRepoInfo.language}`);
        }
        
        // Extract keywords from description
        if (baseRepoInfo.description) {
            const descriptionWords = baseRepoInfo.description
                .split(/\s+/)
                .filter((word: string) => word.length > 4)
                .slice(0, 3);
            searchTerms.push(...descriptionWords);
        }
        
        // If we still don't have enough search terms, use the repository name
        if (searchTerms.length < 2) {
            searchTerms.push(repoName.replace(/[-_]/g, ' '));
        }
        
        // Join terms and exclude the original repository
        const searchQuery = `${searchTerms.join(' ')} -repo:${baseRepoInfo.full_name}`;
        
        // Generate cache key
        const cacheKey = `github:search:repos:similar:${encodeURIComponent(repoName)}`

        // Try to get from cache first
        const cachedResults = await getCachedData<any[]>(cacheKey)
        if (cachedResults) {
            console.log(`Retrieved similar repos for "${repoName}" from cache`)
            return cachedResults
        }

        // Make the GitHub API request if not in cache
        const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(searchQuery)}&per_page=10&sort=stars&order=desc`, {
            headers: {
                Accept: "application/vnd.github.v3+json",
            },
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`)
        }

        const data = await response.json()

        // Process results
        const results = data.items.map((repo: any) => ({
            id: repo.id.toString(),
            name: repo.name,
            full_name: repo.full_name,
            html_url: repo.html_url,
            description: repo.description,
            language: repo.language,
            stargazers_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            watchers_count: repo.watchers_count,
            owner: {
                login: repo.owner.login,
                avatar_url: repo.owner.avatar_url,
                html_url: repo.owner.html_url,
            },
            created_at: repo.created_at,
            updated_at: repo.updated_at,
            topics: repo.topics || [],
            is_template: repo.is_template,
            license: repo.license ? repo.license.name : null,
        }));

        // Cache the results
        await cacheData(cacheKey, results, CACHE_EXPIRY.SEARCH_RESULTS)

        return results;
    } catch (error) {
        console.error("Error searching similar GitHub repositories:", error)
        return []
    }
}

/**
 * Get detailed information about a GitHub repository
 * @param repoName Repository name (owner/repo format)
 * @returns Detailed repository information
 */
export async function getRepositoryInfo(repoName: string): Promise<any | null> {
    try {
        if (!repoName || repoName.trim() === "") {
            return null;
        }

        // Support both formats: "owner/repo" or just "repo"
        let fullRepoName = repoName;
        if (!repoName.includes('/')) {
            // This is just a repo name without owner, we can't fetch it directly
            // We'll try to search for it instead
            const searchResults = await searchGitHubReposBasic(repoName);
            if (searchResults.length === 0) {
                return null;
            }
            // Use the first result that exactly matches the name
            const exactMatch = searchResults.find(repo => 
                repo.name.toLowerCase() === repoName.toLowerCase()
            );
            fullRepoName = exactMatch ? exactMatch.full_name : searchResults[0].full_name;
        }

        // Generate cache key
        const cacheKey = `github:repo:${encodeURIComponent(fullRepoName)}`

        // Try to get from cache first
        const cachedRepo = await getCachedData(cacheKey)
        if (cachedRepo) {
            console.log(`Retrieved repository info for "${fullRepoName}" from cache`)
            return cachedRepo
        }

        // Make the GitHub API request if not in cache
        const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(fullRepoName)}`, {
            headers: {
                Accept: "application/vnd.github.v3+json",
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                console.error(`Repository ${fullRepoName} not found`)
                return null;
            }
            throw new Error(`GitHub API error: ${response.status}`)
        }

        const data = await response.json()

        // Get additional data: contributors and languages
        const [contributorsData, languagesData, readmeData] = await Promise.all([
            fetch(`${data.contributors_url}?per_page=5`, {
                headers: { Accept: "application/vnd.github.v3+json" }
            }).then(res => res.ok ? res.json() : []),
            fetch(`${data.languages_url}`, {
                headers: { Accept: "application/vnd.github.v3+json" }
            }).then(res => res.ok ? res.json() : {}),
            fetch(`https://api.github.com/repos/${encodeURIComponent(fullRepoName)}/readme`, {
                headers: { Accept: "application/vnd.github.v3+json" }
            }).then(res => res.ok ? res.json() : null).catch(() => null)
        ]);

        // Process language data
        const languages = Object.keys(languagesData);
        const totalBytes = Object.values(languagesData).reduce((sum: number, bytes: any) => sum + bytes, 0) as number;
        const languagePercentages = Object.entries(languagesData).map(([lang, bytes]: [string, any]) => ({
            language: lang,
            percentage: Math.round((bytes / totalBytes) * 100)
        }));

        // Process contributors data
        const contributors = contributorsData.map((contributor: any) => ({
            login: contributor.login,
            avatar_url: contributor.avatar_url,
            html_url: contributor.html_url,
            contributions: contributor.contributions
        }));

        // Process readme data
        const readme = readmeData ? {
            content: readmeData.content ? 
                Buffer.from(readmeData.content, 'base64').toString('utf-8').substring(0, 1000) : 
                null,
            html_url: readmeData.html_url
        } : null;

        // Construct repository details
        const repoDetails = {
            id: data.id.toString(),
            name: data.name,
            full_name: data.full_name,
            html_url: data.html_url,
            description: data.description,
            owner: {
                login: data.owner.login,
                avatar_url: data.owner.avatar_url,
                html_url: data.owner.html_url,
            },
            created_at: data.created_at,
            updated_at: data.updated_at,
            pushed_at: data.pushed_at,
            stargazers_count: data.stargazers_count,
            watchers_count: data.watchers_count,
            forks_count: data.forks_count,
            open_issues_count: data.open_issues_count,
            license: data.license ? data.license.name : null,
            language: data.language,
            languages: languages,
            language_percentages: languagePercentages,
            topics: data.topics || [],
            default_branch: data.default_branch,
            contributors: contributors,
            readme: readme,
            is_template: data.is_template,
            has_wiki: data.has_wiki,
            has_pages: data.has_pages,
            has_projects: data.has_projects,
            has_discussions: data.has_discussions,
            archived: data.archived,
            disabled: data.disabled,
        };

        // Cache the repository details
        await cacheData(cacheKey, repoDetails, CACHE_EXPIRY.USER_DETAILS)

        return repoDetails;
    } catch (error) {
        console.error(`Error getting details for repository ${repoName}:`, error)
        return null
    }
}



