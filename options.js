// Save options to chrome.storage
function saveOptions() {
  const clearHistory = document.getElementById('clearHistory').checked;
  const clearCookies = document.getElementById('clearCookies').checked;
  const clearCache = document.getElementById('clearCache').checked;

  chrome.storage.sync.set({
    clearHistory: clearHistory,
    clearCookies: clearCookies,
    clearCache: clearCache
  }, function() {
    // Update status to let user know options were saved
    const status = document.getElementById('status');
    status.style.display = 'block';
    setTimeout(function() {
      status.style.display = 'none';
    }, 2000);
  });
}

// Restore options from chrome.storage
function restoreOptions() {
  chrome.storage.sync.get({
    clearHistory: true,
    clearCookies: true,
    clearCache: true
  }, function(items) {
    document.getElementById('clearHistory').checked = items.clearHistory;
    document.getElementById('clearCookies').checked = items.clearCookies;
    document.getElementById('clearCache').checked = items.clearCache;
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions); 