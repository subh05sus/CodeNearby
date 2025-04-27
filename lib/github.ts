export async function fetchGitHubData(username: string) {
  const response = await fetch(`https://api.github.com/users/${username}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch GitHub data");
  }

  return response.json();
}

export async function fetchGitHubActivities(username: string) {
  const response = await fetch(
    `https://api.github.com/users/${username}/events/public`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch GitHub activities");
  }

  const data = await response.json();
  return data.slice(0, 10);
}


// fetch github user by login id (ex. 32738809) and return the user data
export async function fetchGitHubUserById(id: number) {
  const response = await fetch(`https://api.github.com/user/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch GitHub user data");
  }

  const userData = await response.json();
  return userData;
}

// Fetch public repositories for a GitHub user
export async function fetchUserRepositories(username: string) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch GitHub repositories");
    }

    const repos = await response.json();

    // Filter out forks and sort by stars
    const filteredRepos = repos
      .filter((repo: any) => !repo.fork)
      .sort((a: any, b: any) => b.stargazers_count - a.stargazers_count);

    return filteredRepos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      html_url: repo.html_url,
      description: repo.description || "",
      language: repo.language || "Unknown",
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count
    }));
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return [];
  }
}