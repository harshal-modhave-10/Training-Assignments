import { fetchGitHubData } from "./api/github.js";
import { renderOwnerDetails } from "./components/ownerCard.js";
import { renderRepositories } from "./components/repoCard.js";
import { startAutoRefresh, stopAutoRefresh } from "./utils/timer.js";

// DOM Elements
const searchForm = document.getElementById("search-form");
const usernameInput = document.getElementById("username-input");
const ownerContainer = document.getElementById("owner-container");
const reposContainer = document.getElementById("repos-container");
const reposGrid = document.getElementById("repos-grid");
const messageContainer = document.getElementById("message-container");
const refreshStatus = document.getElementById("refresh-status");

let currentUsername = "";

// Event Listener
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  if (username) {
    currentUsername = username;
    initiateTracking(username);
  }
});

/**
 * Initiates tracking and sets up auto-refresh
 */
async function initiateTracking(username) {
  await loadTrackerData(username, false);

  // Part 3 - Refresh Data Automatically every 60 seconds
  startAutoRefresh(() => {
    console.log(`[Auto-Refresh] Updating data for: ${username}`);
    loadTrackerData(username, true);
  }, 60000);
}

/**
 * Executes API fetch and renders UI elements
 */
async function loadTrackerData(username, isRefresh = false) {
  if (!isRefresh) {
    showMessage("Loading data...", "info");
    resetView();
  }

  try {
    const { user, repos } = await fetchGitHubData(username);

    hideMessage();
    renderOwnerDetails(ownerContainer, user);
    renderRepositories(reposGrid, reposContainer, repos, showMessage);

    const now = new Date().toLocaleTimeString();
    refreshStatus.textContent = `Auto-refresh active (60s). Last updated at ${now}`;
    refreshStatus.classList.remove("hidden");

  } catch (error) {
    console.error("Tracker Error:", error);
    stopAutoRefresh();
    refreshStatus.classList.add("hidden");
    showMessage(error.message || "An unexpected error occurred.", "error");
  }
}

function showMessage(text, type) {
  messageContainer.textContent = text;
  messageContainer.className = `message ${type}`;
  messageContainer.classList.remove("hidden");
}

function hideMessage() {
  messageContainer.classList.add("hidden");
}

function resetView() {
  ownerContainer.classList.add("hidden");
  reposContainer.classList.add("hidden");
  refreshStatus.classList.add("hidden");
}