/* Shared defaults preserve existing preferences and validate stored values. */
globalThis.CleanerSettings = (() => {
  const defaults = Object.freeze({ clearHistory: true, clearCookies: true, clearCache: true, timeRange: 'all' });
  const ranges = Object.freeze({ hour: 3600000, day: 86400000, week: 604800000, month: 2592000000, all: 0 });
  const types = { clearHistory: 'history', clearCookies: 'cookies', clearCache: 'cache' };
  function normalize(values = {}) {
    const result = { ...defaults };
    for (const key of Object.keys(types)) {
      if (typeof values[key] === 'boolean') result[key] = values[key];
    }
    if (Object.hasOwn(ranges, values.timeRange)) result.timeRange = values.timeRange;
    return result;
  }
  function removal(values, now = Date.now()) {
    const settings = normalize(values);
    const data = {};
    for (const [key, type] of Object.entries(types)) if (settings[key]) data[type] = true;
    if (!Object.keys(data).length) throw new Error('Choose at least one data type in Settings.');
    return { options: { since: settings.timeRange === 'all' ? 0 : Math.max(0, now - ranges[settings.timeRange]) }, data };
  }
  return { defaults, normalize, removal, keys: Object.keys(types), load: async () => normalize(await chrome.storage.sync.get(defaults)) };
})();
