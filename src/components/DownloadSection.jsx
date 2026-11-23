import { useEffect, useState } from 'react'
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Terminal,
} from 'lucide-react'
import { GITHUB_REPO, RELEASE_METADATA } from '../data/snipbarData'
import { Keycap } from './Keycap'
import { SnipBarIcon } from './SnipBarIcon'

const getInstallSteps = (filename) => [
  {
    num: '01',
    title: 'Move to Applications',
    desc: `Unzip ${filename} and drag SnipBar.app into /Applications.`,
  },
  {
    num: '02',
    title: 'Approve Ad-Hoc Build Once',
    desc: 'Since SnipBar is ad-hoc signed ($0 open-source build), approve once in System Settings → Privacy & Security → Open Anyway (or run xattr -cr /Applications/SnipBar.app).',
  },
  {
    num: '03',
    title: 'Optional Release-to-Paste',
    desc: 'Carbon hotkeys (⌘⇧Space, ⌥S, ⌘⇧V) work with zero permissions. Grant Accessibility only if you enable Auto-Paste.',
  },
]

function formatBytesToMB(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return RELEASE_METADATA.size
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DownloadSection() {
  const [installTab, setInstallTab] = useState('direct') // 'direct' | 'source'
  const [checksumOpen, setChecksumOpen] = useState(false)
  const [copiedChecksum, setCopiedChecksum] = useState(false)
  const [copiedBuild, setCopiedBuild] = useState(false)
  const [release, setRelease] = useState(RELEASE_METADATA)

  // Hydrate latest release metadata from GitHub Releases API (with v1.0.0 baked in as instant fallback)
  useEffect(() => {
    const controller = new AbortController()
    fetch(GITHUB_REPO.latestApiUrl, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || !Array.isArray(data.assets)) return
        const zipAsset = data.assets.find((a) => a.name?.endsWith('.zip'))
        if (!zipAsset) return
        const tag = data.tag_name || RELEASE_METADATA.tag
        const version = tag.replace(/^v/, '')
        const digest = typeof zipAsset.digest === 'string'
          ? zipAsset.digest.replace(/^sha256:/, '')
          : RELEASE_METADATA.sha256
        setRelease((prev) => ({
          ...prev,
          version,
          tag,
          filename: zipAsset.name,
          downloadUrl: zipAsset.browser_download_url || prev.downloadUrl,
          releaseUrl: data.html_url || prev.releaseUrl,
          size: formatBytesToMB(zipAsset.size),
          sha256: digest || prev.sha256,
        }))
      })
      .catch(() => {})
    return () => controller.abort()
  }, [])

  const handleCopy = (text, setter) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {})
    }
    setter(true)
    setTimeout(() => setter(false), 1800)
  }

  return (
    <section
      id="download"
      className="border-t border-slate-900/[0.08] dark:border-white/[0.08] py-24 lg:py-32 scroll-mt-16"
    >
      <div className="mx-auto max-w-[820px] px-6 lg:px-10">
        <div className="surface-panel rounded-2xl p-6 sm:p-10">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <SnipBarIcon size={48} />
            <h2 className="section-heading mt-5 text-[#0B0E14] dark:text-[#F2EFE9]">
              Install SnipBar on your Mac
            </h2>
            <p className="mt-3 max-w-[54ch] text-[15.5px] leading-[1.65] text-[#475569] dark:text-[#9CA6B5]">
              Download the prebuilt Apple Silicon release from GitHub or build locally from Swift
              source on Apple Silicon &amp; Intel Macs with XcodeGen.
            </p>

            {/* Segmented Mode Tabs */}
            <div
              role="tablist"
              aria-label="Installation method"
              className="mt-7 inline-flex rounded-xl border border-slate-900/[0.09] dark:border-white/[0.09] bg-[#F7F8FA] dark:bg-[#090C11] p-1"
            >
              <button
                type="button"
                role="tab"
                id="download-tab-direct"
                aria-selected={installTab === 'direct'}
                onClick={() => setInstallTab('direct')}
                className={[
                  'rounded-lg px-4 py-2 text-[13.5px] font-medium transition-colors whitespace-nowrap cursor-pointer',
                  installTab === 'direct'
                    ? 'bg-white dark:bg-[#18202D] text-[#0B0E14] dark:text-[#F2EFE9] shadow-xs'
                    : 'text-[#475569] dark:text-[#9CA6B5] hover:text-[#0B0E14] dark:hover:text-[#F2EFE9]',
                ].join(' ')}
              >
                Direct Download
              </button>
              <button
                type="button"
                role="tab"
                id="download-tab-source"
                aria-selected={installTab === 'source'}
                onClick={() => setInstallTab('source')}
                className={[
                  'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13.5px] font-medium transition-colors whitespace-nowrap cursor-pointer',
                  installTab === 'source'
                    ? 'bg-white dark:bg-[#18202D] text-[#0B0E14] dark:text-[#F2EFE9] shadow-xs'
                    : 'text-[#475569] dark:text-[#9CA6B5] hover:text-[#0B0E14] dark:hover:text-[#F2EFE9]',
                ].join(' ')}
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>Build from Source</span>
              </button>
            </div>
          </div>

          {installTab === 'direct' ? (
            <div className="mt-8">
              <div className="flex flex-col items-center text-center">
                <a
                  href={release.downloadUrl}
                  download={release.filename}
                  id="download-zip-btn"
                  className="btn-titanium inline-flex items-center justify-center gap-2.5 rounded-lg px-7 py-3.5 text-[15px] font-semibold whitespace-nowrap cursor-pointer"
                >
                  <ArrowDownToLine className="h-4 w-4" strokeWidth={2} />
                  <span>Download {release.filename}</span>
                </a>

                {/* Zero-Pill Unboxed Metadata */}
                <p className="mt-4 font-mono text-[12px] tabular-nums text-[#64748B] dark:text-[#667182]">
                  v{release.version} · {release.osRequirement} · {release.architecture} ·{' '}
                  {release.size}
                </p>

                {/* Expandable SHA-256 Checksum + GitHub Releases Link */}
                <div className="mt-4 w-full max-w-[580px]">
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <button
                      type="button"
                      id="checksum-toggle-btn"
                      onClick={() => setChecksumOpen((prev) => !prev)}
                      aria-expanded={checksumOpen}
                      className="inline-flex items-center gap-1.5 font-mono text-[12px] text-[#475569] dark:text-[#9CA6B5] hover:text-[#0B0E14] dark:hover:text-[#F2EFE9] cursor-pointer"
                    >
                      <span>Verify SHA-256 checksum</span>
                      {checksumOpen ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <span className="text-slate-300 dark:text-white/15">·</span>

                    <a
                      href={release.releaseUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[12px] text-cobalt-600 dark:text-cobalt-400 hover:underline"
                    >
                      <span>GitHub Release</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  {checksumOpen && (
                    <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-slate-900/[0.09] dark:border-white/[0.09] bg-[#F7F8FA] dark:bg-[#090C11] px-3.5 py-2.5 text-left">
                      <code className="overflow-x-auto font-mono text-[11.5px] tabular-nums text-[#0B0E14] dark:text-[#C8C4BC]">
                        {release.sha256}
                      </code>
                      <button
                        type="button"
                        id="copy-checksum-btn"
                        onClick={() => handleCopy(release.sha256, setCopiedChecksum)}
                        className="inline-flex shrink-0 items-center gap-1 rounded px-2 py-1 font-mono text-[11px] text-cobalt-600 dark:text-cobalt-400 hover:bg-slate-900/[0.05] dark:hover:bg-white/[0.06] cursor-pointer"
                      >
                        {copiedChecksum ? (
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
                  )}
                </div>
              </div>

              {/* 3-Step First-Launch Guide */}
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-slate-900/[0.08] dark:border-white/[0.08] pt-8">
                {getInstallSteps(release.filename).map((step) => (
                  <div key={step.num}>
                    <span className="font-mono text-[11.5px] font-medium tabular-nums text-cobalt-600 dark:text-cobalt-400">
                      {step.num}
                    </span>
                    <h3 className="mt-1.5 font-display text-[14.5px] font-semibold text-[#0B0E14] dark:text-[#F2EFE9]">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-[13.5px] leading-[1.6] text-[#475569] dark:text-[#9CA6B5]">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Build from Source Tab */
            <div className="mt-8">
              <div className="overflow-hidden rounded-xl border border-slate-900/[0.1] dark:border-white/[0.1] bg-[#F7F8FA] dark:bg-[#090C11]">
                <div className="flex items-center justify-between border-b border-slate-900/[0.08] dark:border-white/[0.08] px-4 py-2.5">
                  <span className="font-mono text-[11.5px] text-[#64748B] dark:text-[#667182]">
                    zsh · Test, Build &amp; Package (Sign to Run Locally)
                  </span>
                  <button
                    type="button"
                    id="copy-build-script-btn"
                    onClick={() => handleCopy(RELEASE_METADATA.buildCommands, setCopiedBuild)}
                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[11.5px] font-medium text-cobalt-600 dark:text-cobalt-400 hover:bg-slate-900/[0.05] dark:hover:bg-white/[0.06] cursor-pointer"
                  >
                    {copiedBuild ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-secure-400" />
                        <span>Copied Build Script</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Build Script</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-[1.75] text-[#0B0E14] dark:text-[#F2EFE9]">
                  {RELEASE_METADATA.buildCommands}
                </pre>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-[13px] text-[#475569] dark:text-[#9CA6B5]">
                <span>
                  Requires Xcode 16+, Swift 5.10+, and{' '}
                  <code className="font-mono text-[12px] text-[#0B0E14] dark:text-[#F2EFE9]">
                    brew install xcodegen
                  </code>
                </span>
                <span className="font-mono text-[11.5px] text-[#64748B] dark:text-[#667182]">
                  Or run <Keycap className="mx-0.5">⌘R</Keycap> after <code className="font-mono">xcodegen generate</code>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
