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