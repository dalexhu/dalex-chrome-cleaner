const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup(values = {}, overrides = () => {}) {
  const elements = {};
  const events = {};
  const document = {
    getElementById(id) {
      return elements[id] ||= { textContent: '', value: 'all', disabled: ['cleanButton', 'save', 'fields'].includes(id), dataset: {}, addEventListener(type, fn) { this[type] = fn; } };
    },
    addEventListener(type, fn) { events[type] = fn; }
  };
  const calls = [];
  const chrome = {
    storage: { sync: { get: async defaults => ({ ...defaults, ...values }), set: async value => calls.push(['save', value]) } },
    browsingData: { remove: async (...args) => calls.push(['remove', ...args]) },
    runtime: { openOptionsPage: async () => calls.push(['options']) }
  };
  overrides(chrome);
  const context = vm.createContext({ document, chrome });
  vm.runInContext(fs.readFileSync('settings.js', 'utf8'), context);
  return { context, elements, calls, chrome, settings: context.CleanerSettings, async start(file) { vm.runInContext(fs.readFileSync(file, 'utf8'), context); await events.DOMContentLoaded(); } };
}
const plain = value => JSON.parse(JSON.stringify(value));

test('legacy preferences retain defaults and malformed values are normalized', () => {
  const { settings } = setup({}, () => {});
  assert.deepEqual(plain(settings.normalize({ clearCookies: false })), { clearHistory: true, clearCookies: false, clearCache: true, timeRange: 'all' });
  assert.equal(settings.normalize({ timeRange: 'toString', clearCache: 'false' }).timeRange, 'all');
  assert.equal(settings.normalize({ clearCache: 'false' }).clearCache, true);
});
test('single removal request includes only selected types and correct time cutoff', () => {
  const { settings } = setup({}, () => {});
  for (const [range, duration] of Object.entries({ hour: 3600000, day: 86400000, week: 604800000, month: 2592000000, all: 0 })) {
    const result = plain(settings.removal({ clearHistory: false, clearCookies: false, timeRange: range }, 3000000000));
    assert.deepEqual(result.data, { cache: true });
    assert.equal(result.options.since, range === 'all' ? 0 : 3000000000 - duration);
  }
  assert.throws(() => settings.removal({ clearHistory: false, clearCookies: false, clearCache: false }));
});
test('popup prevents duplicate requests while cleanup is pending', async () => {
  let complete;
  const app = setup({}, chrome => { chrome.browsingData.remove = (...args) => { app.calls.push(args); return new Promise(resolve => { complete = resolve; }); }; });
  await app.start('popup.js');
  app.elements.timeRange.value = 'hour';
  const first = app.elements.cleanButton.click();
  await Promise.resolve(); await Promise.resolve();
  await app.elements.cleanButton.click();
  assert.equal(app.calls.length, 1);
  assert.equal(app.elements.cleanButton.disabled, true);
  complete(); await first;
  assert.equal(app.elements.cleanButton.disabled, false);
  assert.equal(app.elements.status.dataset.state, 'success');
});
test('popup recovers from removal failure and supports retry', async () => {
  const app = setup({}, chrome => { chrome.browsingData.remove = async () => { throw Error('failure'); }; });
  await app.start('popup.js'); await app.elements.cleanButton.click();
  assert.equal(app.elements.status.dataset.state, 'error');
  assert.equal(app.elements.cleanButton.disabled, false);
  app.chrome.browsingData.remove = async () => {};
  await app.elements.cleanButton.click();
  assert.equal(app.elements.status.dataset.state, 'success');
});
test('empty selection and failed preference loading never trigger deletion', async () => {
  const app = setup({ clearHistory: false, clearCookies: false, clearCache: false }, () => {});
  await app.start('popup.js'); await app.elements.cleanButton.click();
  assert.equal(app.calls.length, 0);
  const broken = setup({}, chrome => { chrome.storage.sync.get = async () => { throw Error('offline'); }; });
  await broken.start('popup.js'); await broken.elements.cleanButton.click();
  assert.equal(broken.elements.cleanButton.disabled, true);
  assert.equal(broken.calls.length, 0);
});
test('settings reject empty selection and report persistence failure', async () => {
  const app = setup({}, chrome => { chrome.storage.sync.set = async () => { throw Error('quota'); }; });
  await app.start('options.js');
  for (const key of app.settings.keys) app.elements[key].checked = false;
  await app.elements.settingsForm.submit({ preventDefault() {} });
  assert.equal(app.elements.status.textContent, 'Choose at least one data type.');
  app.elements.clearCache.checked = true;
  await app.elements.settingsForm.submit({ preventDefault() {} });
  assert.match(app.elements.status.textContent, /Could not save/);
  assert.equal(app.elements.save.disabled, false);
  app.chrome.storage.sync.set = async value => app.calls.push(value);
  await app.elements.settingsForm.submit({ preventDefault() {} });
  assert.equal(app.elements.status.dataset.state, 'success');
  assert.equal(app.calls[0].clearCookies, false);
});
