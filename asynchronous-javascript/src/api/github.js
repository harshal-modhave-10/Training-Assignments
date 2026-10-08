const BASE_URL = "https://api.github.com/users";

/**
 * Fetches user profile and public repositories concurrently.
 * @param {string} username 
 * @returns {Promise<{ user: Object, repos: Array }>}
 */
export async function fetchGitHubData(username) {
  const [userResponse, reposResponse] = await Promise.all([
    fetch(`${BASE_URL}/${username}`),
    fetch(`${BASE_URL}/${username}/repos`)
  ]);

  // Part 4 - Error Handling: Invalid GitHub username
  if (userResponse.status === 404) {
    throw new Error(`User "${username}" not found.`);
  }

  // Part 4 - Error Handling: Network or API failures
  if (!userResponse.ok || !reposResponse.ok) {
    throw new Error("Failed to fetch data from GitHub API. Please try again later.");
  }

  const user = await userResponse.json();
  const repos = await reposResponse.json();

  return { user, repos };
}