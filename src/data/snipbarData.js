export const INITIAL_SNIPPETS = [
  {
    id: 'snip-1',
    title: 'Postgres Slow Queries',
    tags: ['sql', 'ops'],
    tagColors: { sql: '#38BDF8', ops: '#C8C4BC' },
    pinned: true,
    isSecret: false,
    updatedAt: 'Today, 09:42',
    body: `SELECT query, calls, round(mean_exec_time::numeric, 2) AS avg_ms
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 15;`,
  },
  {
    id: 'snip-2',
    title: 'Daily Release Log Header',
    tags: ['ops', 'notes'],
    tagColors: { ops: '#C8C4BC', notes: '#94A3B8' },
    pinned: true,
    isSecret: false,
    updatedAt: 'Yesterday',
    body: `## Release Check-in — {{date}} ({{time}})
- Build verified on macOS 14+ (Swift 5.10, zero deps)
- Active clipboard ref: {{clipboard}}`,
  },
  {
    id: 'snip-3',
    title: 'SQL Active Lock Inspector',
    tags: ['sql', 'debug'],
    tagColors: { sql: '#38BDF8', debug: '#F59E0B' },
    pinned: false,
    isSecret: false,
    updatedAt: '2d ago',
    body: `SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC;`,
  },
  {
    id: 'snip-4',
    title: 'Git Amend & Safe Push',
    tags: ['git'],
    tagColors: { git: '#34D399' },
    pinned: false,
    isSecret: false,
    updatedAt: '3d ago',
    body: `git commit --amend --no-edit && git push --force-with-lease`,
  },
  {
    id: 'snip-5',
    title: 'Non-Activating NSPanel Flags',
    tags: ['swift', 'macos'],
    tagColors: { swift: '#FB923C', macos: '#C8C4BC' },
    pinned: false,
    isSecret: false,
    updatedAt: '4d ago',
    body: `panel.level = .floating
panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]
panel.isFloatingPanel = true`,
  },
  {
    id: 'snip-6',
    title: 'Wrap Clipboard in SQL IN (...)',
    tags: ['sql', 'transform'],
    tagColors: { sql: '#38BDF8', transform: '#94A3B8' },
    pinned: false,
    isSecret: false,
    updatedAt: '5d ago',
    body: `WHERE workspace_id IN ({{clipboard}})`,
  },
  {
    id: 'snip-7',
    title: 'Staging Webhook Signing Secret',
    tags: ['secret', 'ops'],
    tagColors: { secret: '#FB7185', ops: '#C8C4BC' },
    pinned: false,
    isSecret: true,
    updatedAt: '6d ago',
    body: `whsec_demo_9f83b7c2e1409a8d6f5412e90c3b81a7`,
  },
  {
    id: 'snip-8',
    title: 'Local Release Package Script',
    tags: ['swift', 'release'],
    tagColors: { swift: '#FB923C', release: '#34D399' },
    pinned: false,
    isSecret: false,
    updatedAt: '1w ago',
    body: `./scripts/build-release.sh`,
  },
]

// Complete authentic 50-entry clipboard stack (#1 newest through #50 oldest cached copy)
const RAW_CLIPBOARD_ENTRIES = [
  ['TablePlus', '12s ago', `SELECT tenant_id, count(*) AS events_24h FROM audit_events WHERE created_at > now() - interval '24 hours' GROUP BY 1 ORDER BY 2 DESC;`],
  ['Terminal', '48s ago', `xcodebuild -project SnipBar.xcodeproj -scheme SnipBar -configuration Release CODE_SIGN_IDENTITY="-" build`],
  ['Slack', '2m ago', `Confirmed — the non-activating NSPanel stays on top of full-screen Xcode without shifting Spaces.`],
  ['Xcode', '4m ago', `NSPasteboard.general.setData(Data(), forType: NSPasteboard.PasteboardType("org.nspasteboard.ConcealedType"))`],
  ['Terminal', '6m ago', `chmod 0700 "$HOME/Library/Application Support/SnipBar"`],
  ['Safari', '9m ago', `https://developer.apple.com/documentation/localauthentication/lacontext`],
  ['TablePlus', '11m ago', `EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM snippets WHERE lower(title) LIKE '%sql%' LIMIT 20;`],
  ['Ghostty', '14m ago', `git log --oneline -n 12 --decorate`],
  ['Linear', '17m ago', `SNIP-214: Preserve original #1-#50 slot index badges when filtering inside ⌘⇧V overlay`],
  ['Xcode', '21m ago', `RegisterEventHotKey(UInt32(kVK_ANSI_V), UInt32(cmdKey | shiftKey), hotKeyID, GetApplicationEventTarget(), 0, &hotKeyRef)`],
  ['Terminal', '25m ago', `shasum -a 256 dist/SnipBar-macOS-v1.0.0.zip`],
  ['Slack', '29m ago', `Can you share the .snipbar.json bundle for the onboarding SQL queries? Make sure prod keys stay unchecked.`],
  ['Cursor', '33m ago', `const resolved = body.replaceAll('{{date}}', isoDate).replaceAll('{{time}}', localTime);`],
  ['Terminal', '38m ago', `swift test --parallel --filter ClipboardHistoryStoreTests`],
  ['TablePlus', '42m ago', `SELECT pg_size_pretty(pg_database_size(current_database())) AS db_size;`],
  ['Xcode', '47m ago', `if NSPasteboard.general.changeCount == expectedChangeCount { NSPasteboard.general.clearContents() }`],
  ['Mail', '52m ago', `Shipping SnipBar v1.0.0 — zero telemetry, local-only SwiftData, 2.3 MB native Swift binary.`],
  ['Terminal', '58m ago', `codesign --verify --deep --strict --verbose=2 /Applications/SnipBar.app`],
  ['Safari', '1h 03m ago', `http://nspasteboard.org/#concealedtype`],
  ['Ghostty', '1h 09m ago', `docker compose -f compose.local.yml up -d postgres redis`],
  ['Xcode', '1h 14m ago', `let context = LAContext(); context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: "Reveal masked snippet")`],
  ['Slack', '1h 19m ago', `Heads up: staging Redis flushed at 14:10 UTC, reconnect worker pools if needed.`],
  ['TablePlus', '1h 24m ago', `UPDATE feature_flags SET enabled = true WHERE key = 'portable_json_import' RETURNING key, updated_at;`],
  ['Terminal', '1h 29m ago', `lipo -info /Applications/SnipBar.app/Contents/MacOS/SnipBar`],
  ['Linear', '1h 35m ago', `SNIP-208: Skip exact duplicates automatically during .snipbar.json import while preserving tag colors`],
  ['Xcode', '1h 41m ago', `@Model public final class SnippetRecord { public var id: UUID; public var title: String; public var content: String; public var isSecret: Bool }`],
  ['Terminal', '1h 47m ago', `defaults read dev.snipbar.macos snipbar.hotkeyChoice`],
  ['Cursor', '1h 53m ago', `backdrop-filter: blur(24px); border: 1px solid rgba(240, 236, 228, 0.14);`],
  ['TablePlus', '2h 01m ago', `SELECT indexrelname, idx_scan FROM pg_stat_user_indexes ORDER BY idx_scan ASC LIMIT 10;`],
  ['Slack', '2h 08m ago', `Release checklist passed on M3 Max (macOS 15.1) and Intel MacBook Pro (macOS 14.6).`],
  ['Terminal', '2h 14m ago', `xcodegen generate --spec project.yml`],
  ['Finder', '2h 20m ago', `~/Library/Application Support/SnipBar/SnipBarStore.sqlite`],
  ['Xcode', '2h 26m ago', `CGEvent(keyboardEventSource: source, virtualKey: CGKeyCode(kVK_ANSI_V), keyDown: true)`],
  ['Ghostty', '2h 33m ago', `rg -n "fullScreenAuxiliary" Sources/SnipBar/`],
  ['Safari', '2h 39m ago', `https://swift.org/documentation/package-manager/`],
  ['TablePlus', '2h 46m ago', `SELECT usename, count(*) FROM pg_stat_activity GROUP BY 1;`],
  ['Terminal', '2h 52m ago', `xattr -cr /Applications/SnipBar.app`],
  ['Slack', '2h 59m ago', `Press S right inside ⌘⇧V to promote any ephemeral clipboard item into a permanent tagged snippet.`],
  ['Xcode', '3h 05m ago', `public nonisolated static let hardMaxEntries = 50`],
  ['Terminal', '3h 12m ago', `sqlite3 "$HOME/Library/Application Support/SnipBar/SnipBarStore.sqlite" "PRAGMA integrity_check;"`],
  ['Linear', '3h 19m ago', `SNIP-199: Keep keyboard focus responsive on Tab flip between Snippets and Clipboard`],
  ['Terminal', '3h 26m ago', `analytics_rollup_v3 --backfill --window=30d --dry-run`],
  ['Cursor', '3h 33m ago', `font-variant-numeric: tabular-nums;`],
  ['TablePlus', '3h 40m ago', `SELECT schemaname, relname, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 12;`],
  ['Slack', '3h 47m ago', `No accounts, no cloud sync daemon, no Electron renderer — pure native SwiftUI + AppKit.`],
  ['Terminal', '3h 54m ago', `git tag -a v1.0.0 -m "SnipBar v1.0.0"`],
  ['Xcode', '4h 01m ago', `NSEvent.addLocalMonitorForEvents(matching: [.flagsChanged, .keyDown]) { event in ... }`],
  ['Mail', '4h 07m ago', `SHA-256 verification hash attached for enterprise security review.`],
  ['Ghostty', '4h 12m ago', `ssh-keygen -lf ~/.ssh/id_ed25519.pub`],
  ['TablePlus', '4h 18m ago', `SELECT cohort_week, retention_d7, active_workspaces FROM analytics_retention_summary ORDER BY cohort_week DESC LIMIT 25;`],
]

export const INITIAL_CLIPBOARD = RAW_CLIPBOARD_ENTRIES.map(([app, timeAgo, content], idx) => ({
  id: `clip-${idx + 1}`,
  rank: idx + 1,
  app,
  timeAgo,
  content,
  charCount: content.length,
}))

export const EXPORT_BUNDLE_SAMPLES = [
  {
    id: 'exp-1',
    title: 'Postgres Slow Queries',
    tags: [
      { name: 'sql', color: '#38BDF8', schemaColor: 'blue' },
      { name: 'ops', color: '#C8C4BC', schemaColor: 'slate' },
    ],
    isPinned: true,
    isSecret: false,
    requireBiometrics: false,
    autoClearSeconds: 30,
    isDuplicateOnTarget: false,
    defaultSelected: true,
    body: 'SELECT query, calls, round(mean_exec_time::numeric, 2) FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 15;',
  },
  {
    id: 'exp-2',
    title: 'Git Amend & Safe Push',
    tags: [{ name: 'git', color: '#34D399', schemaColor: 'emerald' }],
    isPinned: false,
    isSecret: false,
    requireBiometrics: false,
    autoClearSeconds: 30,
    isDuplicateOnTarget: true,
    defaultSelected: true,
    body: 'git commit --amend --no-edit && git push --force-with-lease',
  },
  {
    id: 'exp-3',
    title: 'Daily Release Log Header',
    tags: [
      { name: 'ops', color: '#C8C4BC', schemaColor: 'slate' },
      { name: 'notes', color: '#94A3B8', schemaColor: 'slate' },
    ],
    isPinned: false,
    isSecret: false,
    requireBiometrics: false,
    autoClearSeconds: 30,
    isDuplicateOnTarget: false,
    defaultSelected: true,
    body: '## Release Check-in — {{date}} ({{time}})',
  },
  {
    id: 'exp-4',
    title: 'Staging Webhook Signing Secret',
    tags: [
      { name: 'secret', color: '#FB7185', schemaColor: 'rose' },
      { name: 'ops', color: '#C8C4BC', schemaColor: 'slate' },
    ],
    isPinned: false,
    isSecret: true,
    requireBiometrics: true,
    autoClearSeconds: 30,
    isDuplicateOnTarget: false,
    defaultSelected: false,
    body: 'whsec_demo_9f83b7c2e1409a8d6f5412e90c3b81a7',
  },
]

export const SECURITY_SPECS = [
  {
    category: 'Runtime & Footprint',
    spec: 'Native Swift 5.10, SwiftUI, AppKit, SwiftData (~2.3 MB)',
    detail: 'Zero Electron, zero Chromium renderer, and zero external package dependencies. Runs directly as a native macOS menu bar binary.',
  },
  {
    category: 'Local Storage',
    spec: '~/Library/Application Support/SnipBar (0700 / 0600)',
    detail: 'Local-only SwiftData SQLite store (SnipBarStore.sqlite) and clipboard-history.json (chmod 0600) inside an owner-only chmod 0700 directory. No cloud database or external sync.',
  },
  {
    category: 'Clipboard Privacy',
    spec: '.currentHostOnly + ConcealedType + changeCount auto-clear',
    detail: 'Secret writes block Universal Clipboard (Handoff) via .currentHostOnly, set org.nspasteboard.ConcealedType, TransientType, and AutoGeneratedType, and auto-clear (5–300s, default 30s) only if NSPasteboard.changeCount still matches.',
  },
  {
    category: 'Secret Authentication',
    spec: 'Masked UI (••••••••) + LAContext Touch ID / Watch / Login',
    detail: 'Secret snippets stay masked in UI previews, are excluded from fuzzy body search, require LAContext authentication before reveal or copy, and remain unchecked by default in .snipbar.json exports.',
  },
  {
    category: 'System Permissions',
    spec: 'Zero-permission Carbon hotkeys · On-demand Accessibility',
    detail: 'Global shortcuts (⌘⇧Space, ⌥S, ⌘⇧V) use Carbon RegisterEventHotKey and Release-⌘ detection uses live CoreGraphics HID flags with zero Input Monitoring permission. Accessibility is requested only when Auto-Paste is used.',
  },
  {
    category: 'Signing & Telemetry',
    spec: 'Sign to Run Locally (-) · Zero Telemetry',
    detail: 'Pre-configured with ad-hoc local signing (CODE_SIGN_IDENTITY="-") for $0 builds with no 7-day provisioning expiry. Zero accounts, zero analytics SDKs, and zero outbound network requests.',
  },
]

export const GITHUB_REPO = {
  owner: 'rawat-divyanshu',
  name: 'SnipBar-macOS',
  url: 'https://github.com/rawat-divyanshu/SnipBar-macOS',
  releasesUrl: 'https://github.com/rawat-divyanshu/SnipBar-macOS/releases',
  latestApiUrl: 'https://api.github.com/repos/rawat-divyanshu/SnipBar-macOS/releases/latest',
}

export const RELEASE_METADATA = {
  version: '1.0.0',
  tag: 'v1.0.0',
  filename: 'SnipBar-macOS-v1.0.0.zip',
  downloadUrl: 'https://github.com/rawat-divyanshu/SnipBar-macOS/releases/download/v1.0.0/SnipBar-macOS-v1.0.0.zip',
  releaseUrl: 'https://github.com/rawat-divyanshu/SnipBar-macOS/releases/tag/v1.0.0',
  architecture: 'Apple Silicon (arm64)',
  osRequirement: 'macOS 14 Sonoma & newer',
  size: '2.3 MB',
  sha256: 'e6e6b4abcc78fa4b7758c59cf43b5239c132d5c5944205cdbec7bc321579b5ac',
  buildCommands: `git clone https://github.com/rawat-divyanshu/SnipBar-macOS.git
cd SnipBar-macOS
brew install xcodegen
./scripts/build-release.sh`,
}

export function resolveSnippetVariables(body, clipboardTop = '') {
  const now = new Date()
  const formattedDate = now.toLocaleDateString([], { dateStyle: 'medium' })
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const clipPreview = clipboardTop.length > 48 ? `${clipboardTop.slice(0, 48)}…` : clipboardTop
  return body
    .replaceAll('{{date}}', formattedDate)
    .replaceAll('{{time}}', timeStr)
    .replaceAll('{{clipboard}}', clipPreview || 'ws_01J9A8K2, ws_01J9B4M9')
}
