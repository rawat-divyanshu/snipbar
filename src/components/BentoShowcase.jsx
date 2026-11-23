import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileJson,
  Fingerprint,
  Lock,
  RotateCcw,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { EXPORT_BUNDLE_SAMPLES } from '../data/snipbarData'
import { Keycap } from './Keycap'

export function BentoShowcase({ clipboard }) {
  // Module 1: Slot #50 Mini Search
  const [slotQuery, setSlotQuery] = useState('analytics')
  const [copiedClipId, setCopiedClipId] = useState(null)

  const filteredSlots = useMemo(() => {
    const q = slotQuery.trim().toLowerCase()
    if (!q) return clipboard.slice(0, 5)
    return clipboard.filter((item) => {
      if (q.startsWith('#')) {
        const num = q.slice(1)
        return String(item.rank) === num || String(item.rank).startsWith(num)
      }
      return (
        item.content.toLowerCase().includes(q) ||
        item.app.toLowerCase().includes(q) ||
        `#${item.rank}`.includes(q)
      )
    })
  }, [clipboard, slotQuery])

  const handleCopySlot = (item) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(item.content).catch(() => {})
    }
    setCopiedClipId(item.id)
    setTimeout(() => setCopiedClipId(null), 1600)
  }

  // Module 2: Portable .snipbar.json Export / Import Simulator
  const [selectedExportIds, setSelectedExportIds] = useState(() =>
    EXPORT_BUNDLE_SAMPLES.filter((s) => s.defaultSelected).map((s) => s.id)
  )
  const [skipDuplicates, setSkipDuplicates] = useState(true)
  const [showJsonPreview, setShowJsonPreview] = useState(false)
  const [exportStatus, setExportStatus] = useState(null)

  const toggleExportItem = (id) => {
    setSelectedExportIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const selectedExportItems = EXPORT_BUNDLE_SAMPLES.filter((s) =>
    selectedExportIds.includes(s.id)
  )
  const includesSecret = selectedExportItems.some((s) => s.isSecret)
  const skippedDuplicateCount = skipDuplicates
    ? selectedExportItems.filter((s) => s.isDuplicateOnTarget).length
    : 0
  const importedCount = Math.max(selectedExportItems.length - skippedDuplicateCount, 0)

  const exportPayload = useMemo(() => {
    const tagColorMap = new Map()
    selectedExportItems.forEach((s) => {
      s.tags.forEach((t) => {
        if (!tagColorMap.has(t.name)) {
          tagColorMap.set(t.name, t.schemaColor || 'blue')
        }
      })
    })
    const exportedTags = Array.from(tagColorMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, color]) => ({ color, name }))

    return JSON.stringify(
      {
        exportedAt: '2026-11-23T15:22:38Z',
        format: 'snipbar-export',
        snippets: selectedExportItems.map((s) => ({
          autoClearSeconds: s.autoClearSeconds ?? 30,
          content: s.body,
          isPinned: Boolean(s.isPinned),
          isSecret: Boolean(s.isSecret),
          requireBiometrics: Boolean(s.isSecret && s.requireBiometrics),
          tags: s.tags.map((t) => t.name),
          title: s.title,
        })),
        tags: exportedTags,
        version: 1,
      },
      null,
      2
    )
  }, [selectedExportItems])

  const handleDownloadSampleJson = () => {
    const blob = new Blob([exportPayload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'team-onboarding.snipbar.json'
    a.click()
    URL.revokeObjectURL(url)
    setExportStatus('Saved team-onboarding.snipbar.json')
    setTimeout(() => setExportStatus(null), 2400)
  }

  // Module 3: Touch ID & Concealed Clipboard 30s Auto-Clear Simulator
  const [secretState, setSecretState] = useState('locked') // 'locked' | 'verifying' | 'revealed' | 'cleared' | 'cancelled'
  const [secondsLeft, setSecondsLeft] = useState(30)
  const [changeCount, setChangeCount] = useState(418)
  const [expectedChangeCount, setExpectedChangeCount] = useState(null)

  useEffect(() => {
    if (secretState !== 'revealed') return
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setSecretState('cleared')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [secretState])

  const handleTouchIdReveal = () => {
    if (secretState === 'revealed') {
      setSecretState('locked')
      setSecondsLeft(30)
      return
    }
    setSecretState('verifying')
    setTimeout(() => {
      const nextCount = changeCount + 1
      setChangeCount(nextCount)
      setExpectedChangeCount(nextCount)
      setSecondsLeft(30)
      setSecretState('revealed')
    }, 320)
  }

  const handleSimulateExternalCopy = () => {
    if (secretState !== 'revealed') return
    setChangeCount((c) => c + 1)
    setSecretState('cancelled')
  }

  // Module 4: Full-Screen Spaces Non-Activating NSPanel Diagram
  const [windowMode, setWindowMode] = useState('nspanel') // 'nspanel' | 'standard'

  return (
    <section className="border-t border-slate-900/[0.08] dark:border-white/[0.08] py-24 lg:py-32">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
        <div className="max-w-[660px]">
          <h2 className="section-heading text-[#0B0E14] dark:text-[#F2EFE9]">
            Engineered for speed when your clipboard runs deep.
          </h2>
          <p className="mt-4 text-[16px] leading-[1.65] text-[#475569] dark:text-[#9CA6B5]">
            Every capability is designed around real keyboard ergonomics, local-only privacy, and
            native AppKit window behavior.
          </p>
        </div>

        {/* Asymmetric 12-Column Bento Grid: Row 1 (7 + 5), Row 2 (5 + 7) */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Card 1 (col-span-7): Deep Clipboard Search */}
          <article className="surface-panel lg:col-span-7 flex flex-col justify-between rounded-2xl p-6 sm:p-7">
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-[18px] font-semibold tracking-[-0.015em] text-[#0B0E14] dark:text-[#F2EFE9]">
                  Search deep clipboard history in milliseconds
                </h3>
                <span className="font-mono text-[11.5px] tabular-nums text-[#64748B] dark:text-[#667182]">
                  {filteredSlots.length} of 50 matched
                </span>
              </div>
              <p className="mt-2 text-[14.5px] leading-[1.6] text-[#475569] dark:text-[#9CA6B5]">
                Inside <Keycap className="mx-0.5 align-baseline">⌘⇧V</Keycap>, press{' '}
                <Keycap className="mx-0.5 align-baseline">⌘F</Keycap> or{' '}
                <Keycap className="mx-0.5 align-baseline">/</Keycap> to filter by partial text,
                source app, or slot rank while keeping each item’s original{' '}
                <code className="font-mono text-[12.5px] text-[#0B0E14] dark:text-[#F2EFE9]">#1–#50</code>{' '}
                badge intact.
              </p>

              {/* Working Mini Search Widget */}
              <div className="mt-5 overflow-hidden rounded-xl border border-slate-900/[0.08] dark:border-white/[0.08] bg-[#F7F8FA] dark:bg-[#090C11]">
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-900/[0.08] dark:border-white/[0.08] px-3.5 py-2.5">
                  <Search className="h-3.5 w-3.5 shrink-0 text-cobalt-600 dark:text-cobalt-400" />
                  <input
                    id="bento-slot50-search"
                    type="text"
                    value={slotQuery}
                    onChange={(e) => setSlotQuery(e.target.value)}
                    placeholder="Try analytics, TablePlus, Terminal, or #50…"
                    aria-label="Filter 50-entry clipboard stack"
                    className="min-w-[160px] flex-1 bg-transparent font-mono text-[12.5px] text-[#0B0E14] dark:text-[#F2EFE9] placeholder:text-[#64748B] focus:outline-none"
                  />
                  <div className="flex items-center gap-1.5">
                    {['#50', 'analytics', 'TablePlus', 'Slack'].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setSlotQuery(chip)}
                        className={[
                          'rounded px-2 py-0.5 font-mono text-[11px] transition-colors cursor-pointer',
                          slotQuery.toLowerCase() === chip.toLowerCase()
                            ? 'bg-cobalt-600/15 dark:bg-cobalt-400/15 text-cobalt-600 dark:text-cobalt-400'
                            : 'text-[#64748B] dark:text-[#667182] hover:bg-slate-900/[0.06] dark:hover:bg-white/[0.06]',
                        ].join(' ')}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="macos-scroll max-h-[224px] overflow-y-auto divide-y divide-slate-900/[0.06] dark:divide-white/[0.06]">
                  {filteredSlots.length === 0 ? (
                    <div className="px-4 py-8 text-center font-mono text-[12px] text-[#64748B]">
                      No cached entries match “{slotQuery}”
                    </div>
                  ) : (
                    filteredSlots.slice(0, 6).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-3 px-3.5 py-2.5 hover:bg-slate-900/[0.025] dark:hover:bg-white/[0.025] transition-colors"
                      >
                        <span className="mt-0.5 w-9 shrink-0 font-mono text-[11.5px] font-semibold tabular-nums text-cobalt-600 dark:text-cobalt-400">
                          #{item.rank}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-mono text-[12px] text-[#0B0E14] dark:text-[#F2EFE9]">
                            {item.content}
                          </p>
                          <p className="mt-0.5 font-mono text-[10.5px] text-[#64748B] dark:text-[#667182]">
                            {item.app} · {item.timeAgo}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopySlot(item)}
                          className="inline-flex shrink-0 items-center gap-1 rounded px-2 py-1 font-mono text-[11px] text-[#475569] dark:text-[#9CA6B5] hover:bg-slate-900/[0.06] dark:hover:bg-white/[0.08] hover:text-[#0B0E14] dark:hover:text-[#F2EFE9] cursor-pointer"
                        >
                          {copiedClipId === item.id ? (
                            <>
                              <Check className="h-3 w-3 text-secure-400" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </article>

          {/* Card 2 (col-span-5): Portable .snipbar.json Sharing */}
          <article className="surface-panel lg:col-span-5 flex flex-col justify-between rounded-2xl p-6 sm:p-7">
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-display text-[18px] font-semibold tracking-[-0.015em] text-[#0B0E14] dark:text-[#F2EFE9]">
                  Portable <code className="font-mono text-[15px]">.snipbar.json</code> sharing
                </h3>
                <button
                  type="button"
                  id="bento-json-preview-toggle"
                  onClick={() => setShowJsonPreview((p) => !p)}
                  className="inline-flex items-center gap-1 font-mono text-[11px] text-cobalt-600 dark:text-cobalt-400 hover:underline cursor-pointer"
                >
                  <FileJson className="h-3.5 w-3.5" />
                  <span>{showJsonPreview ? 'Checklist' : 'View JSON'}</span>
                </button>
              </div>
              <p className="mt-2 text-[14.5px] leading-[1.6] text-[#475569] dark:text-[#9CA6B5]">
                Export selective snippets with tag color preservation and duplicate detection.
                Masked secrets stay unchecked by default.
              </p>

              {showJsonPreview ? (
                <pre className="macos-scroll mt-5 max-h-[214px] overflow-auto rounded-xl border border-slate-900/[0.08] dark:border-white/[0.08] bg-[#F7F8FA] dark:bg-[#090C11] p-3.5 font-mono text-[11px] leading-[1.55] text-[#0B0E14] dark:text-[#C8C4BC]">
                  {exportPayload}
                </pre>
              ) : (
                <div className="mt-5 divide-y divide-slate-900/[0.07] dark:divide-white/[0.07] border-t border-b border-slate-900/[0.07] dark:border-white/[0.07]">
                  {EXPORT_BUNDLE_SAMPLES.map((item) => {
                    const checked = selectedExportIds.includes(item.id)
                    return (
                      <label
                        key={item.id}
                        className="flex items-center justify-between gap-3 py-2.5 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleExportItem(item.id)}
                            className="h-3.5 w-3.5 rounded accent-cobalt-400 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              {item.isSecret && <Lock className="h-3 w-3 shrink-0 text-secret-400" />}
                              <span className="truncate text-[13px] font-medium text-[#0B0E14] dark:text-[#F2EFE9]">
                                {item.title}
                              </span>
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 font-mono text-[10.5px] text-[#64748B] dark:text-[#667182]">
                              {item.tags.map((t) => (
                                <span key={t.name} className="inline-flex items-center gap-1">
                                  <span
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ backgroundColor: t.color }}
                                  />
                                  #{t.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {item.isDuplicateOnTarget && skipDuplicates && checked && (
                          <span className="shrink-0 font-mono text-[10.5px] text-[#64748B] dark:text-[#9CA6B5]">
                            Skip duplicate
                          </span>
                        )}
                      </label>
                    )
                  })}
                </div>
              )}

              {/* Plain-text secret export warning */}
              {includesSecret && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-secret-400/35 bg-secret-400/[0.08] px-3 py-2 text-[12px] text-rose-700 dark:text-secret-400">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Plain-text warning: 1 masked secret is selected and will be written unencrypted
                    to <code className="font-mono">.snipbar.json</code>.
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-1">
              <label className="inline-flex items-center gap-2 text-[12px] text-[#475569] dark:text-[#9CA6B5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  className="h-3.5 w-3.5 rounded accent-cobalt-400"
                />
                <span>
                  Skip exact duplicates{' '}
                  <span className="font-mono tabular-nums text-[#64748B]">
                    ({importedCount} net)
                  </span>
                </span>
              </label>

              <button
                type="button"
                id="bento-download-json-btn"
                onClick={handleDownloadSampleJson}
                disabled={selectedExportItems.length === 0}
                className="inline-flex items-center gap-1.5 font-mono text-[11.5px] font-medium text-cobalt-600 dark:text-cobalt-400 hover:underline disabled:opacity-40 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{exportStatus || 'Export .snipbar.json'}</span>
              </button>
            </div>
          </article>

          {/* Card 3 (col-span-5): Touch ID & Concealed Clipboard */}
          <article className="surface-panel lg:col-span-5 flex flex-col justify-between rounded-2xl p-6 sm:p-7">
            <div>
              <h3 className="font-display text-[18px] font-semibold tracking-[-0.015em] text-[#0B0E14] dark:text-[#F2EFE9]">
                Touch ID &amp; concealed clipboard
              </h3>
              <p className="mt-2 text-[14.5px] leading-[1.6] text-[#475569] dark:text-[#9CA6B5]">
                Sensitive snippets remain masked behind{' '}
                <code className="font-mono text-[12.5px] text-[#0B0E14] dark:text-[#F2EFE9]">LAContext</code>,
                block Handoff via{' '}
                <code className="font-mono text-[12.5px] text-[#0B0E14] dark:text-[#F2EFE9]">.currentHostOnly</code>{' '}
                +{' '}
                <code className="font-mono text-[12.5px] text-[#0B0E14] dark:text-[#F2EFE9]">ConcealedType</code>,
                and auto-clear after 30s only if{' '}
                <code className="font-mono text-[12.5px] text-[#0B0E14] dark:text-[#F2EFE9]">changeCount</code>{' '}
                still matches.
              </p>

              {/* Interactive Secret Vault Surface */}
              <div className="mt-5 rounded-xl border border-slate-900/[0.08] dark:border-white/[0.08] bg-[#F7F8FA] dark:bg-[#090C11] p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0B0E14] dark:text-[#F2EFE9]">
                    <Lock className="h-3.5 w-3.5 text-secret-400" />
                    Staging Webhook Signing Secret
                  </span>
                  <span className="font-mono text-[11px] tabular-nums text-[#64748B] dark:text-[#667182]">
                    changeCount: {changeCount}
                  </span>
                </div>

                <div className="mt-3 rounded-lg border border-slate-900/[0.07] dark:border-white/[0.07] bg-white dark:bg-[#10151E] px-3 py-2.5 font-mono text-[12px] tracking-wide text-[#0B0E14] dark:text-[#F2EFE9] break-all">
                  {secretState === 'revealed'
                    ? 'whsec_demo_9f83b7c2e1409a8d6f5412e90c3b81a7'
                    : secretState === 'verifying'
                      ? 'Evaluating LAContext biometrics…'
                      : '••••••••••••••••••••••••••••••••••••'}
                </div>

                {/* Live Status Row */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                  {secretState === 'revealed' && (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-secure-400 tabular-nums">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Handoff blocked · Auto-clear in {secondsLeft}s
                    </span>
                  )}
                  {secretState === 'locked' && (
                    <span className="text-[#64748B] dark:text-[#667182]">
                      Masked in search, popover, and library
                    </span>
                  )}
                  {secretState === 'verifying' && (
                    <span className="text-cobalt-600 dark:text-cobalt-400">
                      Requesting Touch ID / macOS login…
                    </span>
                  )}
                  {secretState === 'cleared' && (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-secure-400">
                      <Check className="h-3.5 w-3.5" />
                      Pasteboard cleared (changeCount {expectedChangeCount} matched)
                    </span>
                  )}
                  {secretState === 'cancelled' && (
                    <span className="inline-flex items-center gap-1.5 text-cobalt-600 dark:text-cobalt-400">
                      <Check className="h-3.5 w-3.5" />
                      External copy detected ({changeCount}) · Auto-clear cancelled safely
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    id="bento-touchid-btn"
                    onClick={handleTouchIdReveal}
                    className="btn-titanium inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12.5px] font-semibold cursor-pointer"
                  >
                    {secretState === 'revealed' ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" />
                        <span>Re-mask Now</span>
                      </>
                    ) : (
                      <>
                        <Fingerprint className="h-3.5 w-3.5" />
                        <span>Unlock with Touch ID</span>
                      </>
                    )}
                  </button>

                  {secretState === 'revealed' && (
                    <button
                      type="button"
                      id="bento-external-copy-btn"
                      onClick={handleSimulateExternalCopy}
                      className="btn-ghost inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium cursor-pointer"
                    >
                      <span>Simulate Newer Copy</span>
                    </button>
                  )}

                  {(secretState === 'cleared' || secretState === 'cancelled') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSecretState('locked')
                        setSecondsLeft(30)
                      }}
                      className="btn-ghost inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-[12px] font-medium cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </article>

          {/* Card 4 (col-span-7): Native macOS Over Full-Screen Spaces */}
          <article className="surface-panel lg:col-span-7 flex flex-col justify-between rounded-2xl p-6 sm:p-7">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-[18px] font-semibold tracking-[-0.015em] text-[#0B0E14] dark:text-[#F2EFE9]">
                  Floats over full-screen Spaces without stealing focus
                </h3>

                {/* Interactive Architectural Comparison Toggle */}
                <div
                  role="tablist"
                  aria-label="Window architecture comparison"
                  className="inline-flex rounded-lg bg-slate-900/[0.06] dark:bg-white/[0.06] p-0.5 text-[12px]"
                >
                  <button
                    type="button"
                    role="tab"
                    id="spaces-mode-nspanel"
                    aria-selected={windowMode === 'nspanel'}
                    onClick={() => setWindowMode('nspanel')}
                    className={[
                      'rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer',
                      windowMode === 'nspanel'
                        ? 'bg-white dark:bg-[#1B2433] text-[#0B0E14] dark:text-[#F2EFE9]'
                        : 'text-[#64748B] dark:text-[#9CA6B5]',
                    ].join(' ')}
                  >
                    SnipBar NSPanel
                  </button>
                  <button
                    type="button"
                    role="tab"
                    id="spaces-mode-standard"
                    aria-selected={windowMode === 'standard'}
                    onClick={() => setWindowMode('standard')}
                    className={[
                      'rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer',
                      windowMode === 'standard'
                        ? 'bg-white dark:bg-[#1B2433] text-[#0B0E14] dark:text-[#F2EFE9]'
                        : 'text-[#64748B] dark:text-[#9CA6B5]',
                    ].join(' ')}
                  >
                    Standard App
                  </button>
                </div>
              </div>

              <p className="mt-2 text-[14.5px] leading-[1.6] text-[#475569] dark:text-[#9CA6B5]">
                Built with native AppKit{' '}
                <code className="font-mono text-[12.5px] text-[#0B0E14] dark:text-[#F2EFE9]">NSPanel</code>{' '}
                (<code className="font-mono text-[12px]">.nonactivatingPanel</code>,{' '}
                <code className="font-mono text-[12px]">.fullScreenAuxiliary</code>) and
                zero-permission Carbon hotkeys so full-screen Xcode or Terminal never jumps Spaces.
              </p>

              {/* Visual Architectural Schematic */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 rounded-xl border border-slate-900/[0.08] dark:border-white/[0.08] bg-[#F7F8FA] dark:bg-[#090C11] p-4">
                {/* Space 1: Desktop */}
                <div
                  className={[
                    'relative rounded-lg border p-3.5 transition-[border-color,opacity,transform] duration-150',
                    windowMode === 'standard'
                      ? 'border-secret-400/50 bg-white dark:bg-[#10151E] opacity-100'
                      : 'border-slate-900/[0.08] dark:border-white/[0.07] bg-white/50 dark:bg-[#10151E]/50 opacity-55',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between font-mono text-[10.5px] text-[#64748B] dark:text-[#667182]">
                    <span>Space 1 · Desktop</span>
                    {windowMode === 'standard' && (
                      <span className="text-rose-600 dark:text-secret-400">Forced switch</span>
                    )}
                  </div>
                  <div className="mt-3 h-24 rounded-md border border-dashed border-slate-900/12 dark:border-white/[0.1] p-2.5 flex flex-col justify-between">
                    <span className="font-mono text-[11px] text-[#475569] dark:text-[#9CA6B5]">
                      Finder &amp; background windows
                    </span>
                    {windowMode === 'standard' && (
                      <div className="rounded border border-secret-400/45 bg-secret-400/10 px-2.5 py-1.5 font-mono text-[10.5px] text-rose-700 dark:text-secret-400">
                        Regular NSWindow pulls focus back to Desktop Space
                      </div>
                    )}
                  </div>
                </div>

                {/* Space 2: Full-Screen Xcode / Terminal */}
                <div
                  className={[
                    'relative rounded-lg border p-3.5 transition-[border-color,opacity,transform] duration-150',
                    windowMode === 'nspanel'
                      ? 'border-cobalt-600/50 dark:border-cobalt-400/50 bg-white dark:bg-[#10151E] opacity-100'
                      : 'border-slate-900/[0.08] dark:border-white/[0.07] bg-white/50 dark:bg-[#10151E]/50 opacity-60',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between font-mono text-[10.5px] text-[#64748B] dark:text-[#667182]">
                    <span>Space 2 · Full-Screen Xcode</span>
                    {windowMode === 'nspanel' && (
                      <span className="text-emerald-600 dark:text-secure-400">Stays in Space</span>
                    )}
                  </div>

                  <div className="mt-3 relative h-24 rounded-md border border-slate-900/10 dark:border-white/[0.08] bg-slate-900/[0.03] dark:bg-[#0B0F16] p-2.5">
                    <span className="font-mono text-[10.5px] text-[#64748B] dark:text-[#667182]">
                      Full-screen editor keeps active caret
                    </span>

                    {windowMode === 'nspanel' && (
                      <div className="animate-macos-settle absolute right-2.5 bottom-2.5 left-2.5 rounded-md border border-cobalt-600/45 dark:border-cobalt-400/50 bg-white/95 dark:bg-[#151E2D]/95 px-2.5 py-2 shadow-md">
                        <div className="flex items-center justify-between font-mono text-[10.5px] text-[#0B0E14] dark:text-[#F2EFE9]">
                          <span>SnipBar NSPanel</span>
                          <span className="text-cobalt-600 dark:text-cobalt-400">
                            .fullScreenAuxiliary
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-[#64748B] dark:text-[#667182]">
              <span>Carbon RegisterEventHotKey · Zero Accessibility required to browse</span>
              <span className="inline-flex items-center gap-1 text-[#0B0E14] dark:text-[#C8C4BC]">
                <Eye className="h-3 w-3" />
                Swift 5.10 + AppKit
              </span>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
