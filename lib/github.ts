export async function fetchGitHubData(username: string) {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    })
  
    if (!response.ok) {
      throw new Error("Failed to fetch GitHub data")
    }
  
    return response.json()
  }
  
  