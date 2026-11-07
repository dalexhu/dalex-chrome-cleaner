document.addEventListener('DOMContentLoaded', async () => {
  const button = document.getElementById('cleanButton');
  const status = document.getElementById('status');
  const summary = document.getElementById('summary');
  const warning = document.getElementById('cookieWarning');
  let busy = false;
  let ready = false;
  let hasSelection = false;
  const labels = { clearHistory: 'History', clearCookies: 'Cookies', clearCache: 'Cache' };
  function showSettings(settings) {
    const selected = CleanerSettings.keys.filter(key => settings[key]);
    hasSelection = selected.length > 0;
    summary.textContent = selected.length ? selected.map(key => labels[key]).join(' · ') : 'No data types selected';
    document.getElementById('timeRange').value = settings.timeRange;
    warning.hidden = !settings.clearCookies;
    button.disabled = busy || !selected.length;
    if (!selected.length) status.textContent = 'Choose at least one data type in Settings.';
  }
  document.getElementById('settings').addEventListener('click', async () => {
    try { await chrome.runtime.openOptionsPage(); }
    catch { status.textContent = 'Could not open Settings. Please try again.'; }
  });
  try {
    showSettings(await CleanerSettings.load());
    ready = true;
    status.textContent = button.disabled ? 'Choose at least one data type in Settings.' : 'Ready when you are.';
  } catch {
    status.textContent = 'Could not load preferences. Reopen this popup to retry.';
  }
  button.addEventListener('click', async () => {
    if (busy || !ready) return;
    busy = true;
    button.disabled = true;
    document.getElementById('timeRange').disabled = true;
    button.textContent = 'Cleaning…';
    status.textContent = 'Cleaning selected data. This may take a moment.';
    status.dataset.state = '';
    try {
      const settings = await CleanerSettings.load();
      settings.timeRange = document.getElementById('timeRange').value;
      showSettings(settings);
      const { options, data } = CleanerSettings.removal(settings);
      await chrome.browsingData.remove(options, data);
      status.textContent = 'Selected browsing data cleared.';
      status.dataset.state = 'success';
    } catch (error) {
      status.textContent = error.message === 'Choose at least one data type in Settings.' ? error.message : 'Cleanup could not complete. Some data may have been cleared. Please try again.';
      status.dataset.state = 'error';
    } finally {
      busy = false;
      button.textContent = 'Clean now';
      button.disabled = !hasSelection;
      document.getElementById('timeRange').disabled = false;
    }
  });
});
