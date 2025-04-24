/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Developer } from "@/types"

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

        // Make the GitHub API request
        const response = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(query)}&per_page=10`, {
            headers: {
                Accept: "application/vnd.github.v3+json",
            },
        })

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`)
        }

        const data = await response.json()

        // Return basic user information without fetching detailed profiles
        return data.items.map((user: any) => ({
            id: user.id.toString(),
            login: user.login,
            avatar_url: user.avatar_url,
            html_url: user.html_url,
            // Add a flag to indicate this is basic information
            isBasicInfo: true
        }));
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
        // Fetch user data
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

        return {
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

        // Make the GitHub API request
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

                return {
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
            }),
        )

        // Filter out null values and return the results
        return detailedUsers.filter(Boolean) as Developer[]
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

        // Make the GitHub API request
        const response = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(query)}&per_page=5`, {
            headers: {
                Accept: "application/vnd.github.v3+json",
            },
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`)
        }

        const data = await response.json()

        // Return basic information without fetching details
        return data.items.map((user: any) => ({
            id: user.id.toString(),
            login: user.login,
            avatar_url: user.avatar_url,
            html_url: user.html_url,
            // Add a flag to indicate this is basic information
            isBasicInfo: true
        }));

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

        // Make the GitHub API request
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

                return {
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
            }),
        )

        // Filter out null values and return the results
        return detailedUsers.filter(Boolean) as Developer[]
    } catch (error) {
        console.error("Error searching GitHub user by name:", error)
        return []
    }
}



