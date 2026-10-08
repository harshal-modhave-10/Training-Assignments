let refreshIntervalId = null;

/**
 * Starts a 60-second periodic refresh interval.
 * @param {Function} callback 
 * @param {number} delayMs 
 */
export function startAutoRefresh(callback, delayMs = 60000) {
  stopAutoRefresh(); // Clear any existing interval before starting a new one

  refreshIntervalId = setInterval(() => {
    callback();
  }, delayMs);
}

/**
 * Stops the active refresh interval.
 */
export function stopAutoRefresh() {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }
}