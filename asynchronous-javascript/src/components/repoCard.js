/**
 * Renders the list of repository cards or displays an info message if empty.
 * @param {HTMLElement} gridContainer 
 * @param {HTMLElement} sectionContainer 
 * @param {Array} repos 
 * @param {Function} showMessageCallback 
 */
export function renderRepositories(gridContainer, sectionContainer, repos, showMessageCallback) {
  gridContainer.innerHTML = "";

  // Part 4 - Error Handling: User with no public repositories
  if (repos.length === 0) {
    sectionContainer.classList.add("hidden");
    showMessageCallback("This user has no public repositories.", "info");
    return;
  }

  repos.forEach((repo) => {
    const card = document.createElement("div");
    card.className = "repo-card";
    card.innerHTML = `
      <div>
        <h3><a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a></h3>
        <p>${repo.description || "No description provided."}</p>
      </div>
      <div class="repo-meta">
        <span>⭐ ${repo.stargazers_count}</span>
        <span>🍴 ${repo.forks_count}</span>
        <span>${repo.language || "N/A"}</span>
      </div>
    `;
    gridContainer.appendChild(card);
  });

  sectionContainer.classList.remove("hidden");
}