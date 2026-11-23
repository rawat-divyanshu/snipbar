# SnipBar Website

**Live site:** [https://rawat-divyanshu.github.io/snipbar/](https://rawat-divyanshu.github.io/snipbar/)

Product and download website for **[SnipBar](https://github.com/rawat-divyanshu/SnipBar-macOS)** — a native Swift menu bar snippet manager and 50-entry clipboard history utility for macOS 14+ (Sonoma and newer).

Built with React (JavaScript), Vite, and Tailwind CSS v4 following the *Machined Titanium & Obsidian Glass* design system.

## Highlights

- **Dark-first Obsidian + Champagne Titanium UI** with a full Alabaster Light Mode toggle (`@custom-variant dark`).
- **Interactive macOS Desktop Stage**: Live Menu Bar Popover (`Tab` to switch Snippets ↔ Clipboard, `#tag` fuzzy search, dynamic `{{date}}` / `{{time}}` / `{{clipboard}}` resolution, inline `⌘N` composer, `⌘L` 3-column Library) and a working **`⌘⇧V` 50-Entry Clipboard Overlay** (`⌘F` / `/` search preserving `#1`–`#50` badges, `S` to promote to snippet, release-to-paste into the live scratchpad).
- **Asymmetric Bento Demos**: Deep clipboard search, portable `.snipbar.json` selective export/import simulator matching the real `snipbar-export` v1 schema, Touch ID (`LAContext`) + `.currentHostOnly` / `ConcealedType` + 30s `changeCount`-verified auto-clear simulator, and non-activating `NSPanel` full-screen Spaces comparison.
- **Live GitHub Releases Download Panel**: Direct download and SHA-256 verification synced with [GitHub Releases](https://github.com/rawat-divyanshu/SnipBar-macOS/releases), plus one-click copyable XcodeGen build commands.

## Local Development

```bash
npm install
npm run dev
```

## Lint & Production Build

```bash
npm run lint
npm run build
npm run preview
```

## Deployment (GitHub Pages)

`.github/workflows/deploy.yml` runs `npm run lint` and `npm run build` on every pull request and automatically deploys `dist/` to **GitHub Pages** on pushes to `main`.

To enable deployment after pushing to GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**.

## License

[MIT](LICENSE)
