import { useState } from 'react'
import { ArrowUpRight, X } from 'lucide-react'
import { GITHUB_REPO, RELEASE_METADATA } from '../data/snipbarData'
import { SnipBarIcon } from './SnipBarIcon'

const FOOTER_SHEETS = {
  releases: {
    title: `Release Notes — v${RELEASE_METADATA.version}`,
    linkLabel: 'View full release on GitHub',
    linkUrl: RELEASE_METADATA.releaseUrl,
    body: [
      'First public open-source release (~2.3 MB native Swift 5.10 / macOS 14+ menu bar utility, zero external dependencies).',
      'Dual-engine popover (Tab to switch Snippets ↔ Clipboard) with multi-token fuzzy + #tag search, inline ⌘N composer, and {{date}} / {{time}} / {{clipboard}} dynamic variables.',
      '50-entry Direct Clipboard Stack (⌘⇧V) with Hold-⌘ / Release-⌘ auto-paste, instant deep search (⌘F or /) down to #50, and S / ⌘S promotion into permanent Snippets.',
      'Masked secrets gated by LAContext (Touch ID, Apple Watch, or login password), .currentHostOnly Handoff blocking, ConcealedType markers, changeCount-verified auto-clear, and portable .snipbar.json sharing.',
    ],
  },
  security: {
    title: 'Security Architecture',
    linkLabel: 'Read SECURITY.md on GitHub',
    linkUrl: `${GITHUB_REPO.url}/blob/main/SECURITY.md`,
    body: [
      'Local-only SwiftData SQLite database (SnipBarStore.sqlite) and clipboard-history.json (chmod 0600) stored under ~/Library/Application Support/SnipBar (chmod 0700).',
      'Masked secrets are excluded from fuzzy body search and require LAContext verification (Touch ID, Apple Watch, or macOS login password) before reveal or copy.',
      'Global shortcuts use zero-permission Carbon RegisterEventHotKey and live CoreGraphics HID state checks. macOS Accessibility is requested only on demand for Auto-Paste.',
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    linkLabel: 'Inspect source code on GitHub',
    linkUrl: GITHUB_REPO.url,
    body: [
      'SnipBar collects zero telemetry, zero crash analytics, and zero usage diagnostics.',
      'SnipBar makes zero outbound network requests and requires no account or cloud sync service.',
      'Clipboard history skips concealed, transient, auto-generated, and 1Password pasteboard items—and nothing ever leaves your Mac unless you explicitly export a .snipbar.json file.',
    ],
  },
}

export function Footer() {
  const [activeSheet, setActiveSheet] = useState(null)

  return (
    <>
      <footer className="border-t border-slate-900/[0.08] dark:border-white/[0.08] py-10">
        <div className="mx-auto flex max-w-[1200px] flex-col sm:flex-row items-center justify-between gap-4 px-6 lg:px-10 text-[13px] text-[#64748B] dark:text-[#667182]">
          <div className="flex items-center gap-3">
            <SnipBarIcon size={20} />
            <span className="font-display font-semibold text-[#0B0E14] dark:text-[#F2EFE9]">
              SnipBar
            </span>
            <span>·</span>
            <span>MIT License</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <a
              href={GITHUB_REPO.url}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#0B0E14] dark:hover:text-[#F2EFE9] transition-colors"
            >
              GitHub
            </a>
            <button
              type="button"
              id="footer-releases-btn"
              onClick={() => setActiveSheet('releases')}
              className="hover:text-[#0B0E14] dark:hover:text-[#F2EFE9] transition-colors cursor-pointer"
            >
              Release Notes
            </button>
            <button
              type="button"
              id="footer-security-btn"
              onClick={() => setActiveSheet('security')}
              className="hover:text-[#0B0E14] dark:hover:text-[#F2EFE9] transition-colors cursor-pointer"
            >
              Security
            </button>
            <button
              type="button"
              id="footer-privacy-btn"
              onClick={() => setActiveSheet('privacy')}
              className="hover:text-[#0B0E14] dark:hover:text-[#F2EFE9] transition-colors cursor-pointer"
            >
              Privacy
            </button>
          </div>
        </div>
      </footer>

      {activeSheet && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={FOOTER_SHEETS[activeSheet].title}
          onClick={() => setActiveSheet(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="surface-hud animate-macos-settle w-full max-w-[520px] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-900/[0.08] dark:border-white/[0.08] pb-3.5">
              <h3 className="font-display text-[17px] font-semibold text-[#0B0E14] dark:text-[#F2EFE9]">
                {FOOTER_SHEETS[activeSheet].title}
              </h3>
              <button
                type="button"
                onClick={() => setActiveSheet(null)}
                aria-label="Close dialog"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] hover:bg-slate-900/[0.06] dark:hover:bg-white/[0.08] hover:text-[#0B0E14] dark:hover:text-[#F2EFE9] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="mt-4 space-y-3 text-[14px] leading-[1.65] text-[#475569] dark:text-[#9CA6B5]">
              {FOOTER_SHEETS[activeSheet].body.map((line, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cobalt-400" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            {FOOTER_SHEETS[activeSheet].linkUrl && (
              <div className="mt-5 border-t border-slate-900/[0.08] dark:border-white/[0.08] pt-3.5">
                <a
                  href={FOOTER_SHEETS[activeSheet].linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[12px] text-cobalt-600 dark:text-cobalt-400 hover:underline"
                >
                  <span>{FOOTER_SHEETS[activeSheet].linkLabel}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
