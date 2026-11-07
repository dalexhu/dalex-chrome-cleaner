document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('settingsForm');
  const save = document.getElementById('save');
  const status = document.getElementById('status');
  const fields = document.getElementById('fields');
  try {
    const settings = await CleanerSettings.load();
    CleanerSettings.keys.forEach(key => { document.getElementById(key).checked = settings[key]; });
    document.getElementById('timeRange').value = settings.timeRange;
    fields.disabled = false;
    save.disabled = false;
  } catch {
    status.textContent = 'Could not load preferences. Reload this page to retry.';
    status.dataset.state = 'error';
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (save.disabled) return;
    const settings = { timeRange: document.getElementById('timeRange').value };
    CleanerSettings.keys.forEach(key => { settings[key] = document.getElementById(key).checked; });
    if (!CleanerSettings.keys.some(key => settings[key])) {
      status.textContent = 'Choose at least one data type.';
      status.dataset.state = 'error';
      return;
    }
    save.disabled = true;
    fields.disabled = true;
    status.textContent = 'Saving…';
    try {
      await chrome.storage.sync.set(CleanerSettings.normalize(settings));
      status.textContent = 'Settings saved.';
      status.dataset.state = 'success';
    } catch {
      status.textContent = 'Could not save settings. Please try again.';
      status.dataset.state = 'error';
    } finally {
      save.disabled = false;
      fields.disabled = false;
    }
  });
});
