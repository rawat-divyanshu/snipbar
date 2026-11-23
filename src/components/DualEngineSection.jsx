import { ArrowUpRight } from 'lucide-react'
import { Keycap } from './Keycap'

const SNIPPET_SHORTCUTS = [
  { keys: '⌘⇧Space', alt: '⌥S', action: 'Open menu bar popover in Curated Snippets' },
  { keys: '#tag', alt: null, action: 'Fuzzy search titles, bodies, and #tags instantly' },
  { keys: 'Tab', alt: null, action: 'Flip smoothly between Snippets and Clipboard' },
  { keys: '⌘N', alt: null, action: 'Create a new snippet inline without leaving popover' },
  { keys: '⌘L', alt: '⌘,', action: 'Open the full 3-column Library & Settings window' },
]

const CLIPBOARD_SHORTCUTS = [
  { keys: '⌘⇧V', alt: null, action: 'Summon the 50-entry Direct Clipboard overlay' },
  { keys: 'Hold ⌘ + V', alt: '↑ / ↓', action: 'Cycle through recent copies without leaving your app' },
  { keys: 'Release ⌘', alt: null, action: 'Auto-paste selected entry immediately (no Enter)' },
  { keys: '⌘F', alt: '/', action: 'Filter by text, source app, or slot rank (#50)' },
  { keys: 'S', alt: '⌘S', action: 'Promote any clipboard entry into a permanent Snippet' },
]

export function DualEngineSection({ onLaunchPlayground }) {
  return (
    <section
      id="features"
      className="border-t border-slate-900/[0.08] dark:border-white/[0.08] py-24 lg:py-32 scroll-mt-16"
    >
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
        <div className="max-w-[660px]">
          <h2 className="section-heading text-[#0B0E14] dark:text-[#F2EFE9]">
            Two interlocking workflows. Zero clutter between them.
          </h2>
          <p className="mt-4 text-[16px] leading-[1.65] text-[#475569] dark:text-[#9CA6B5]">
            Just like the two halves of the SnipBar icon, permanent snippets and ephemeral clipboard
            history stay cleanly separated until you choose to bridge them with a single keystroke.
          </p>
        </div>

        {/* Clean 2-Column Split (Single-level elevation, hairline dividers) */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* 01. Curated Snippets */}
          <article className="surface-panel flex flex-col justify-between rounded-2xl p-6 sm:p-8">
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-mono text-[12px] font-medium tabular-nums text-cobalt-600 dark:text-cobalt-400">
                  01
                </span>
                <span className="font-mono text-[11.5px] text-[#64748B] dark:text-[#667182]">
                  Permanent · Tagged · Variable-aware
                </span>
              </div>

              <h3 className="mt-3 font-display text-[22px] font-semibold tracking-[-0.02em] text-[#0B0E14] dark:text-[#F2EFE9]">
                Curated Snippets
              </h3>

              <p className="mt-3 text-[15px] leading-[1.65] text-[#475569] dark:text-[#9CA6B5]">
                Keep SQL diagnostics, release checklists, shell one-liners, and masked secrets one
                hotkey away. Filter by <code className="font-mono text-[13px] text-[#0B0E14] dark:text-[#F2EFE9]">#tag</code>,
                pin frequent items, and expand dynamic{' '}
                <code className="font-mono text-[13px] text-[#0B0E14] dark:text-[#F2EFE9]">{'{{date}}'}</code>,{' '}
                <code className="font-mono text-[13px] text-[#0B0E14] dark:text-[#F2EFE9]">{'{{time}}'}</code>, and{' '}
                <code className="font-mono text-[13px] text-[#0B0E14] dark:text-[#F2EFE9]">{'{{clipboard}}'}</code>{' '}
                placeholders on copy.
              </p>

              {/* Hairline-divided Shortcut Table */}
              <div className="mt-7 divide-y divide-slate-900/[0.07] dark:divide-white/[0.07] border-t border-b border-slate-900/[0.07] dark:border-white/[0.07]">
                {SNIPPET_SHORTCUTS.map((row) => (
                  <div
                    key={row.keys}
                    className="flex items-center justify-between gap-4 py-3 text-[13.5px]"
                  >
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Keycap>{row.keys}</Keycap>
                      {row.alt && (
                        <>
                          <span className="text-[11px] text-[#64748B] dark:text-[#667182]">or</span>
                          <Keycap>{row.alt}</Keycap>
                        </>
                      )}
                    </div>
                    <span className="text-right text-[#475569] dark:text-[#9CA6B5]">
                      {row.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between pt-1">
              <span className="font-mono text-[11.5px] text-[#64748B] dark:text-[#667182]">
                Backed by local SwiftData SQLite
              </span>
              <button
                type="button"
                id="engine-try-snippets-btn"
                onClick={() => onLaunchPlayground('snippets', '#sql')}
                className="inline-flex items-center gap-1 text-[13.5px] font-medium text-cobalt-600 dark:text-cobalt-400 hover:underline cursor-pointer"
              >
                <span>Test #sql search</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </article>

          {/* 02. 50-Entry Direct Clipboard Stack */}
          <article className="surface-panel flex flex-col justify-between rounded-2xl p-6 sm:p-8">
            <div>
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-mono text-[12px] font-medium tabular-nums text-cobalt-600 dark:text-cobalt-400">
                  02
                </span>
                <span className="font-mono text-[11.5px] text-[#64748B] dark:text-[#667182]">
                  Ephemeral · 50 Slots · Release-to-Paste
                </span>
              </div>

              <h3 className="mt-3 font-display text-[22px] font-semibold tracking-[-0.02em] text-[#0B0E14] dark:text-[#F2EFE9]">
                Direct Clipboard Stack
              </h3>

              <p className="mt-3 text-[15px] leading-[1.65] text-[#475569] dark:text-[#9CA6B5]">
                Captures up to 50 recent copies in the background without polluting your curated
                library. Hold <Keycap className="mx-0.5 align-baseline">⌘</Keycap> to step through
                recent items and release to paste immediately—or hit{' '}
                <Keycap className="mx-0.5 align-baseline">⌘F</Keycap> to jump directly to slot{' '}
                <code className="font-mono text-[13px] tabular-nums text-[#0B0E14] dark:text-[#F2EFE9]">#50</code>.
              </p>

              {/* Hairline-divided Shortcut Table */}
              <div className="mt-7 divide-y divide-slate-900/[0.07] dark:divide-white/[0.07] border-t border-b border-slate-900/[0.07] dark:border-white/[0.07]">
                {CLIPBOARD_SHORTCUTS.map((row) => (
                  <div
                    key={row.keys}
                    className="flex items-center justify-between gap-4 py-3 text-[13.5px]"
                  >
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Keycap>{row.keys}</Keycap>
                      {row.alt && (
                        <>
                          <span className="text-[11px] text-[#64748B] dark:text-[#667182]">or</span>
                          <Keycap>{row.alt}</Keycap>
                        </>
                      )}
                    </div>
                    <span className="text-right text-[#475569] dark:text-[#9CA6B5]">
                      {row.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between pt-1">
              <span className="font-mono text-[11.5px] text-[#64748B] dark:text-[#667182]">
                Original #1–#50 rank badges preserved on filter
              </span>
              <button
                type="button"
                id="engine-try-overlay-btn"
                onClick={() => onLaunchPlayground('overlay', '')}
                className="inline-flex items-center gap-1 text-[13.5px] font-medium text-cobalt-600 dark:text-cobalt-400 hover:underline cursor-pointer"
              >
                <span>Launch ⌘⇧V overlay</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
