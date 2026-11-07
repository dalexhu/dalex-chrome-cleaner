# Dalex: Chrome Cleaner

![License](https://img.shields.io/github/license/dalexhu/dalex-chrome-cleaner)
![No Tracking](https://img.shields.io/badge/privacy-no--tracking-green)
![Made with ❤️](https://img.shields.io/badge/made%20with-%E2%9D%A4-red)

Clean your Chrome browsing data — history, cookies, and cache — with one click. Lightweight, private, and open-source.

---

## 🔧 Features
- 🧹 One-click cleanup of **browsing history**, **cookies**, and **cache**
- 🧊 Cleanup runs in your browser — **no browsing data is sent to the developer**
- 🔐 Privacy-first: **no tracking**, **no analytics**, **no data collection**
- ⚙️ Configurable: Choose what to clean and a default time range
- 🕒 Clear the last hour, 24 hours, 7 days, 30 days, or all time
- 🌙 Accessible light and dark themes, with progress and error feedback
- 🪶 Lightweight: No background processes or performance overhead

---

## 📦 Installation

Download the installation ZIP from [GitHub Releases](https://github.com/dalexhu/dalex-chrome-cleaner/releases/latest), extract it, then load the extracted folder using the steps below. A Chrome Web Store release is not currently automated.

### Or install manually:
1. Clone this repo or download ZIP
2. Go to `chrome://extensions`
3. Enable “Developer mode”
4. Click “Load unpacked” and select the extension folder

---

## 🔒 Permissions
Only the minimal permissions are requested:
```json
{
  "browsingData": "Used to clear your history, cookies, and cache",
  "storage": "Saves your cleaning preferences (Chrome Sync, when enabled)"
}
```

---

## 📜 License

This project is licensed under the **MIT License** — see [`LICENSE`](./LICENSE) for details.

---

## 🧑‍💻 Author

Built by **[Dalexhu](https://github.com/dalexhu)** — follow for more open, privacy-first browser tools.

---

## 🛡️ Security & Privacy
- 🔍 100% open source, auditable
- 📡 No remote requests or telemetry
- 🤝 Contributions welcome

> If you find bugs or privacy concerns, please [open an issue](https://github.com/dalexhu/dalex-chrome-cleaner/issues)

---

## 🌱 Roadmap
- [ ] Scheduled auto-cleaning
- [ ] Per-site cleanup control
- [ ] Firefox version

---

Made with ☕ & ❤️ in Canada 🇨🇦

## Usage and development

Open the extension, review the selected data types, choose a time range, and click **Clean now**. The popup time range applies to that cleanup only; use **Settings** to save your default. Existing cleaning preferences are preserved.

Clearing cookies may sign you out of websites. Cleanup cannot be undone. Only history, cookies, and browser cache are selected for removal; passwords, bookmarks, downloaded files, and other site storage are not selected. Chrome may sync history deletion to other devices when history sync is enabled.

Requires Chrome 96 or later. Preferences use `chrome.storage.sync`, so Chrome may sync them across signed-in browsers. Browsing data is never sent to the extension developer.

Run the dependency-free regression tests with Node.js 18+:

```sh
node --test tests/*.test.cjs
```

For manual verification, load the folder unpacked in a **separate test Chrome profile**. Check time ranges, saved preferences, keyboard navigation, and light/dark themes. Use only disposable browsing data to test deletion.

## Releasing

Update `manifest.json` to a new version and optionally add `releases/vX.Y.Z.md` with release notes. Run the tests and `python3 scripts/package.py --tag vX.Y.Z` locally, then commit and push the changes. Create and push the matching tag:

```sh
git tag vX.Y.Z
git push origin vX.Y.Z
```

The tag workflow tests the extension, rejects mismatched versions, and builds a runtime-only ZIP plus SHA-256 checksums. It creates a draft Release, uploads and downloads the assets to verify their checksums, then publishes the Release. Failed runs can be rerun without creating a duplicate Release. Pushing `main` alone does not publish. GitHub provides source archives automatically; this workflow does not publish to Chrome Web Store.
