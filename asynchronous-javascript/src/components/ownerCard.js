/**
 * Renders user details in the owner container.
 * @param {HTMLElement} container 
 * @param {Object} user 
 */
export function renderOwnerDetails(container, user) {
  container.innerHTML = `
    <img src="${user.avatar_url}" alt="${user.login}'s Avatar" />
    <div class="owner-info">
      <h2>${user.name || user.login} (@${user.login})</h2>
      <p>${user.bio || "No bio available."}</p>
      <div class="stats">
        <span>Public Repos: ${user.public_repos}</span> | 
        <span>Followers: ${user.followers}</span> | 
        <span>Following: ${user.following}</span>
      </div>
    </div>
  `;
  container.classList.remove("hidden");
}