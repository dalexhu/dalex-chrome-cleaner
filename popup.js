document.addEventListener('DOMContentLoaded', function() {
  const cleanButton = document.getElementById('cleanButton');

  cleanButton.addEventListener('click', async function() {
    try {
      // Get user preferences from storage
      const settings = await chrome.storage.sync.get({
        clearHistory: true,
        clearCookies: true,
        clearCache: true
      });

      const options = {
        since: 0 // Clear all data
      };

      // Clear browsing history if enabled
      if (settings.clearHistory) {
        await chrome.browsingData.removeHistory(options);
      }

      // Clear cookies if enabled
      if (settings.clearCookies) {
        await chrome.browsingData.removeCookies(options);
      }

      // Clear cache if enabled
      if (settings.clearCache) {
        await chrome.browsingData.removeCache(options);
      }

      // Show success message
      cleanButton.textContent = 'Cleaned!';
      cleanButton.style.backgroundColor = '#45a049';

      // Reset button after 2 seconds
      setTimeout(() => {
        cleanButton.textContent = 'Clean Now';
        cleanButton.style.backgroundColor = '#4CAF50';
      }, 2000);
    } catch (error) {
      // Show error message
      console.error('Error cleaning browsing data:', error);
      cleanButton.textContent = 'Error!';
      cleanButton.style.backgroundColor = '#f44336';

      // Reset button after 3 seconds
      setTimeout(() => {
        cleanButton.textContent = 'Clean Now';
        cleanButton.style.backgroundColor = '#4CAF50';
      }, 3000);
    }
  });
}); 