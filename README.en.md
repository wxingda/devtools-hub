<div align="center">

# 🚀 DevTools Hub

### ⚡ All‑in‑One Developer Toolbox | Pure Frontend | Offline Ready | Open Source

*Fast. Lightweight. Privacy‑friendly.*

[![GitHub stars](https://img.shields.io/github/stars/wxingda/devtools-hub?style=for-the-badge&logo=github&color=ffca28)](https://github.com/wxingda/devtools-hub/stargazers)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Website](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](https://wxingda.github.io/devtools-hub)
[![PWA](https://img.shields.io/badge/PWA-Ready-orange?style=for-the-badge&logo=googlechrome)](https://wxingda.github.io/devtools-hub)
[![i18n](https://img.shields.io/badge/i18n-ZH|EN-informational?style=for-the-badge)](#internationalization)

**English** | [中文说明](./README.md)
</div>

---
## ✨ TL;DR
Visit directly (no install required): https://wxingda.github.io/devtools-hub
> 10+ everyday dev utilities in one place: Passwords · Color · Regex · JSON · URL · Base64 · Hash · Timestamp · QR · Diff · CSS Units. Works offline (PWA). Zero dependencies.

---
<p align="center">
	<a href="https://github.com/wxingda/devtools-hub" target="_blank" rel="noopener">
		<img alt="Star GitHub" src="https://img.shields.io/github/stars/wxingda/devtools-hub?style=social" />
	</a>
	<br/>
	<sub>If this helps you, a Star ⭐ really helps others discover it. Thanks!</sub>
	<br/>
	<sub>PWA, offline, zero‑dependency — handy to keep bookmarked.</sub>
</p>
## 🎯 Why DevTools Hub?
- ✅ Offline first (privacy & reliability)
- ⚡ Zero dependencies (pure vanilla JS / HTML / CSS)
- 🌓 Built‑in dark mode
- 🌐 Multi‑language (EN / ZH)
- 📱 Responsive across devices
- ⌨️ Keyboard shortcuts (Alt + 1..0)
- 📦 Lightweight (<100KB core)
- 🔁 Fast context switching between tools
- ⭐ Share + Star CTA integrated

## 🧰 Included Tools
| Tool | Description | Highlights |
|------|-------------|------------|
| Password Generator | Secure random passwords | Custom length, strength meter, copy |
| Color Palette | Color picker & format conversions | HEX / RGB / HSL, palette generation |
| Regex Tester | Live regex evaluation | Match listing, group insight |
| JSON Formatter | Beautify & minify | Validation status, (Tree view incoming) |
| URL Encoder | Encode / decode | One‑click actions |
| Base64 Encoder | Base64 encode / decode | Unicode safe |
| Hash Calculator | MD5 / SHA1 / SHA256 | Web Crypto + fallback |
| Timestamp Converter | Unix ↔ Date | ISO / UTC / Local formats |
| QR Generator | Text / URL → QR | (Offline generation planned) |
| Text Diff | Compare two text blocks | Add / remove / modify stats |
| CSS Unit Converter | px/rem/em/vw/vh/% | Batch output |

## 🚀 Quick Start
### Online (Recommended)
Just open: https://wxingda.github.io/devtools-hub

### Local
```bash
git clone https://github.com/wxingda/devtools-hub.git
cd devtools-hub
# Open directly
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```
Or via a tiny static server:
```bash
python -m http.server 8000

# To reduce log output (Linux/macOS)
python -m http.server 8000 > /dev/null 2>&1

# Or show only errors
python -m http.server 8000 > /dev/null

# or
npx serve .
```

> 💡 **Note**: The `python -q` flag suppresses version/copyright messages in Python's interactive mode, but doesn't work with `http.server`. To suppress server logs, use output redirection like `> /dev/null`.

### Install as PWA
1. Open the live site
2. Click browser install / add to home screen
3. Launch like a native app

## ⌨️ Shortcuts
| Action | Keys |
|--------|------|
| Switch Tool 1..10 | Alt + (1..0) |
| Toggle Theme | Ctrl/Cmd + D |
| Clear Current Tool | Ctrl/Cmd + K |
| Blur / escape | Esc |

## Internationalization
- Current: English / Simplified Chinese
- Planned: ES, JA, KO
- Contributions welcome: see `I18N_DICTIONARY` in `script.js`.

## Development
No build step. Open and hack.
```bash
# Start editing
$EDITOR index.html script.js styles.css
```

## Architecture Notes
- Single‑page multi‑tool layout
- Each tool grouped in a `.tool` container
- Basic namespace: `window.DevToolsHub` (extensibility hooks incoming)
- Service Worker: split core/runtime caches + offline fallback page

## Roadmap (Next Phase)
- [ ] JSON Tree View UI
- [ ] Offline QR generation (remove external dependency)
- [ ] Plugin registration API (`registerTool({id,title,icon, mount, unmount})`)
- [ ] Local usage analytics panel (private, localStorage only)
- [ ] Color contrast checker & export palette
- [ ] File hashing + large file streaming
- [ ] Diff: word/char granular highlighting
- [ ] Additional language packs

## Contributing
1. Fork → feature branch → commit → PR
2. Keep PR focused (one feature)
3. Add a short English summary
4. Screenshots appreciated for UI changes

```bash
git checkout -b feat/awesome-tool
git commit -m "feat: add awesome tool"
git push origin feat/awesome-tool
```
> Want to help with English docs / i18n? Open an issue first if adding a new language.

## Support
If this project helped you:
- ⭐ Star the repo
- 🐛 Report an issue
- 💡 Suggest a feature
- 🔄 Share it with teammates

## License
MIT © DevTools Hub / wxingda

---
<div align="center">
If you like it, a Star means a lot ⭐

[Live Demo](https://wxingda.github.io/devtools-hub) · [Issues](https://github.com/wxingda/devtools-hub/issues) · [Discussions](https://github.com/wxingda/devtools-hub/discussions)
</div>
