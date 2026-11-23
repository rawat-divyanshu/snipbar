import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import {
  ArrowDownToLine,
  BatteryMedium,
  BookmarkPlus,
  Check,
  Copy,
  Eye,
  EyeOff,
  Fingerprint,
  Folder,
  Lock,
  PanelLeft,
  Pin,
  Plus,
  Search,
  Sparkles,
  Wifi,
  X,
} from 'lucide-react'
import { resolveSnippetVariables } from '../data/snipbarData'
import { Keycap } from './Keycap'
import { SnipBarMenuIcon } from './SnipBarIcon'

function formatClock() {
  const now = new Date()
  return now.toLocaleTimeString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' })
}

export function HeroStage({
  snippets,
  setSnippets,
  clipboard,
  setClipboard,
  stageApiRef,
}) {
  // Stage surface states
  const [popoverOpen, setPopoverOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('snippets') // 'snippets' | 'clipboard'
  const [popoverQuery, setPopoverQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [composerOpen, setComposerOpen] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)

  // Composer form
  const [newTitle, setNewTitle] = useState('')
  const [newTags, setNewTags] = useState('#sql, #ops')
  const [newBody, setNewBody] = useState('')
  const [newSecret, setNewSecret] = useState(false)

  // Secret reveal state inside popover
  const [revealedIds, setRevealedIds] = useState({})

  // ⌘⇧V Overlay Bezel states
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [overlayQuery, setOverlayQuery] = useState('')
  const [overlaySearchActive, setOverlaySearchActive] = useState(false)
  const [overlaySelectedIdx, setOverlaySelectedIdx] = useState(0)
  const [holdingModifier, setHoldingModifier] = useState(false)

  // Library 3-column states
  const [libraryFilter, setLibraryFilter] = useState('all')
  const [librarySelectedId, setLibrarySelectedId] = useState(snippets[0]?.id ?? null)

  // Target editor scratchpad
  const [scratchpad, setScratchpad] = useState(
    `# ReleaseNotes.md — Target Editor\n\nPaste a snippet from the menu bar popover, or launch ⌘⇧V to release-paste any of your last 50 copies directly here.\n`
  )
  const [pasteFlash, setPasteFlash] = useState(false)
  const [toast, setToast] = useState(null)
  const [pressedKeys, setPressedKeys] = useState({})
  const [clock, setClock] = useState(formatClock)

  const stageRef = useRef(null)
  const popoverSearchRef = useRef(null)
  const overlaySearchRef = useRef(null)
  const toastTimerRef = useRef(null)

  const showToast = useCallback((message, tone = 'default') => {
    setToast({ message, tone })
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 2600)
  }, [])

  const flashKey = useCallback((keyId) => {
    setPressedKeys((prev) => ({ ...prev, [keyId]: true }))
    setTimeout(() => {
      setPressedKeys((prev) => ({ ...prev, [keyId]: false }))
    }, 240)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setClock(formatClock()), 30000)
    return () => clearInterval(interval)
  }, [])

  useImperativeHandle(stageApiRef, () => ({
    launch(mode, query = '') {
      if (mode === 'snippets') {
        setOverlayOpen(false)
        setLibraryOpen(false)
        setComposerOpen(false)
        setPopoverOpen(true)
        setActiveTab('snippets')
        setPopoverQuery(query)
        setSelectedIndex(0)
        setTimeout(() => popoverSearchRef.current?.focus(), 140)
      } else if (mode === 'overlay') {
        setLibraryOpen(false)
        setOverlayOpen(true)
        setOverlayQuery(query)
        setOverlaySearchActive(Boolean(query))
        setOverlaySelectedIdx(0)
        if (query) {
          setTimeout(() => overlaySearchRef.current?.focus(), 140)
        }
      }
    },
  }))

  // Filter snippets with fuzzy + #tag support
  const filteredSnippets = useMemo(() => {
    const q = popoverQuery.trim().toLowerCase()
    const sorted = [...snippets].sort((a, b) => Number(b.pinned) - Number(a.pinned))
    if (!q) return sorted

    const tokens = q.split(/\s+/).filter(Boolean)
    return sorted.filter((snip) => {
      return tokens.every((tok) => {
        if (tok.startsWith('#')) {
          const tagQuery = tok.slice(1)
          return snip.tags.some((t) => t.toLowerCase().includes(tagQuery))
        }
        const hay = `${snip.title} ${snip.tags.join(' ')} ${snip.isSecret ? '' : snip.body}`.toLowerCase()
        return hay.includes(tok)
      })
    })
  }, [snippets, popoverQuery])

  // Filter clipboard inside popover
  const filteredPopoverClipboard = useMemo(() => {
    const q = popoverQuery.trim().toLowerCase()
    if (!q) return clipboard
    return clipboard.filter((item) => {
      if (q.startsWith('#')) {
        return `#${item.rank}`.includes(q)
      }
      return (
        item.content.toLowerCase().includes(q) ||
        item.app.toLowerCase().includes(q) ||
        `#${item.rank}`.includes(q)
      )
    })
  }, [clipboard, popoverQuery])

  // Filter 50-entry clipboard inside ⌘⇧V Overlay (preserving original #1-#50 rank)
  const filteredOverlayItems = useMemo(() => {
    const q = overlayQuery.trim().toLowerCase()
    if (!q) return clipboard
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
  }, [clipboard, overlayQuery])

  // Keep indices safely clamped
  const activePopoverList = activeTab === 'snippets' ? filteredSnippets : filteredPopoverClipboard
  const safePopoverIndex = Math.min(selectedIndex, Math.max(activePopoverList.length - 1, 0))
  const safeOverlayIndex = Math.min(overlaySelectedIdx, Math.max(filteredOverlayItems.length - 1, 0))
  const activeOverlayItem = filteredOverlayItems[safeOverlayIndex] || null

  const pasteIntoScratchpad = useCallback(
    (text, label) => {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {})
      }
      setScratchpad((prev) => {
        const separator = prev.endsWith('\n') || prev.length === 0 ? '' : '\n'
        return `${prev}${separator}${text}\n`
      })
      setPasteFlash(true)
      setTimeout(() => setPasteFlash(false), 550)
      showToast(label, 'secure')
    },
    [showToast]
  )

  const handleActivateSnippet = useCallback(
    (snip) => {
      if (snip.isSecret) {
        pasteIntoScratchpad(
          snip.body,
          `Touch ID verified via LAContext · Copied "${snip.title}" concealed (30s auto-clear)`
        )
        return
      }
      const resolved = resolveSnippetVariables(snip.body, clipboard[0]?.content || '')
      pasteIntoScratchpad(resolved, `Copied & pasted "${snip.title}"`)
    },
    [clipboard, pasteIntoScratchpad]
  )

  const handleReleasePasteOverlay = useCallback(
    (item = activeOverlayItem) => {
      if (!item) return
      setOverlayOpen(false)
      setHoldingModifier(false)
      setOverlaySearchActive(false)
      pasteIntoScratchpad(item.content, `Auto-pasted clipboard #${item.rank} (${item.app})`)
    },
    [activeOverlayItem, pasteIntoScratchpad]
  )

  const handlePromoteClipboardToSnippet = useCallback(
    (item = activeOverlayItem) => {
      if (!item) return
      const existing = snippets.find((s) => s.body.trim() === item.content.trim())
      if (existing) {
        showToast(`Already saved as "${existing.title}"`, 'default')
        return
      }
      const cleanPreview = item.content.replace(/\s+/g, ' ').trim()
      const derivedTitle =
        cleanPreview.length > 34 ? `${cleanPreview.slice(0, 34)}…` : cleanPreview
      const appTag = item.app.toLowerCase().replace(/[^a-z0-9]/g, '') || 'clip'
      const created = {
        id: `snip-${Date.now()}`,
        title: derivedTitle,
        tags: [appTag, 'saved'],
        tagColors: { [appTag]: '#38BDF8', saved: '#C8C4BC' },
        pinned: false,
        isSecret: false,
        updatedAt: 'Just now',
        body: item.content,
      }
      setSnippets((prev) => [created, ...prev])
      flashKey('s')
      showToast(`Saved #${item.rank} as permanent snippet (#${appTag})`, 'secure')
    },
    [activeOverlayItem, flashKey, setSnippets, showToast, snippets]
  )

  const handleCreateSnippet = (e) => {
    e.preventDefault()
    if (!newTitle.trim() || !newBody.trim()) return
    const parsedTags = newTags
      .split(/[,\s]+/)
      .map((t) => t.replace(/^#/, '').trim().toLowerCase())
      .filter(Boolean)
    const finalTags = parsedTags.length > 0 ? parsedTags : ['general']
    const tagColors = {}
    finalTags.forEach((t, idx) => {
      tagColors[t] = idx === 0 ? '#38BDF8' : '#C8C4BC'
    })
    const created = {
      id: `snip-${Date.now()}`,
      title: newTitle.trim(),
      tags: finalTags,
      tagColors,
      pinned: false,
      isSecret: newSecret,
      updatedAt: 'Just now',
      body: newBody.trim(),
    }
    setSnippets((prev) => [created, ...prev])
    setNewTitle('')
    setNewBody('')
    setNewSecret(false)
    setComposerOpen(false)
    setActiveTab('snippets')
    setPopoverQuery('')
    setSelectedIndex(0)
    showToast(`Created snippet "${created.title}"`, 'secure')
  }

  const handleCopyScratchpadToClipboard = () => {
    const trimmed = scratchpad.trim().split('\n').pop()?.trim()
    if (!trimmed) return
    setClipboard((prev) => {
      const next = [
        {
          id: `clip-${Date.now()}`,
          rank: 1,
          app: 'Scratchpad',
          timeAgo: 'Just now',
          content: trimmed,
          charCount: trimmed.length,
        },
        ...prev.slice(0, 49),
      ].map((entry, idx) => ({ ...entry, rank: idx + 1 }))
      return next
    })
    showToast('Pushed last line to clipboard slot #1 (50-item cap preserved)', 'secure')
  }

  // Real keyboard shortcuts when interacting with the stage or using global ⌘⇧V
  useEffect(() => {
    const onKeyDown = (e) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey
      const targetTag = e.target?.tagName?.toLowerCase()
      const isTypingInExternalInput =
        (targetTag === 'input' || targetTag === 'textarea') &&
        !stageRef.current?.contains(e.target)

      if (isTypingInExternalInput) return

      // ⌘⇧V or Ctrl+Shift+V toggles/cycles Clipboard History Overlay
      if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'v') {
        e.preventDefault()
        flashKey('cmdShiftV')
        setLibraryOpen(false)
        setHoldingModifier(true)
        if (!overlayOpen) {
          setOverlayOpen(true)
          setOverlaySearchActive(false)
          setOverlayQuery('')
          setOverlaySelectedIdx(0)
        } else {
          setOverlaySelectedIdx((prev) =>
            filteredOverlayItems.length > 0 ? (prev + 1) % filteredOverlayItems.length : 0
          )
        }
        return
      }

      // While ⌘⇧V overlay is open
      if (overlayOpen) {
        if (e.key === 'Escape') {
          e.preventDefault()
          flashKey('esc')
          if (overlaySearchActive && overlayQuery) {
            setOverlayQuery('')
          } else {
            setOverlayOpen(false)
            setOverlaySearchActive(false)
            setHoldingModifier(false)
          }
          return
        }

        if ((isCmdOrCtrl && e.key.toLowerCase() === 'f') || (e.key === '/' && document.activeElement !== overlaySearchRef.current)) {
          e.preventDefault()
          flashKey('cmdF')
          setOverlaySearchActive(true)
          setHoldingModifier(false)
          setTimeout(() => overlaySearchRef.current?.focus(), 20)
          return
        }

        if (isCmdOrCtrl && e.key.toLowerCase() === 'v' && !e.shiftKey) {
          e.preventDefault()
          setHoldingModifier(true)
          setOverlaySelectedIdx((prev) =>
            filteredOverlayItems.length > 0 ? (prev + 1) % filteredOverlayItems.length : 0
          )
          return
        }

        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setOverlaySelectedIdx((prev) =>
            filteredOverlayItems.length > 0 ? (prev + 1) % filteredOverlayItems.length : 0
          )
          return
        }

        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setOverlaySelectedIdx((prev) =>
            filteredOverlayItems.length > 0
              ? (prev - 1 + filteredOverlayItems.length) % filteredOverlayItems.length
              : 0
          )
          return
        }

        if (e.key === 'Enter') {
          e.preventDefault()
          handleReleasePasteOverlay()
          return
        }

        if (
          (e.key.toLowerCase() === 's' && document.activeElement !== overlaySearchRef.current) ||
          (isCmdOrCtrl && e.key.toLowerCase() === 's')
        ) {
          e.preventDefault()
          handlePromoteClipboardToSnippet()
          return
        }
        return
      }

      // Shortcuts scoped to when user is inside the macOS Stage
      const insideStage = stageRef.current?.contains(document.activeElement)
      if (!insideStage) return

      const inScratchpad = e.target?.id === 'sandbox-scratchpad'
      if (inScratchpad) return

      if (e.key === 'Tab' && !composerOpen && !libraryOpen) {
        e.preventDefault()
        flashKey('tab')
        setActiveTab((prev) => (prev === 'snippets' ? 'clipboard' : 'snippets'))
        setSelectedIndex(0)
        return
      }

      if (isCmdOrCtrl && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        flashKey('cmdN')
        setPopoverOpen(true)
        setLibraryOpen(false)
        setComposerOpen((prev) => !prev)
        return
      }

      if (isCmdOrCtrl && (e.key.toLowerCase() === 'l' || e.key === ',')) {
        e.preventDefault()
        flashKey('cmdL')
        setLibraryOpen((prev) => !prev)
        return
      }

      if (e.key === 'Escape') {
        flashKey('esc')
        if (composerOpen) setComposerOpen(false)
        else if (libraryOpen) setLibraryOpen(false)
        else if (popoverQuery) setPopoverQuery('')
        return
      }

      if (popoverOpen && !composerOpen && !libraryOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex((prev) =>
            activePopoverList.length > 0 ? (prev + 1) % activePopoverList.length : 0
          )
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex((prev) =>
            activePopoverList.length > 0
              ? (prev - 1 + activePopoverList.length) % activePopoverList.length
              : 0
          )
        } else if (e.key === 'Enter' && activePopoverList[safePopoverIndex]) {
          e.preventDefault()
          const item = activePopoverList[safePopoverIndex]
          if (activeTab === 'snippets') {
            handleActivateSnippet(item)
          } else {
            pasteIntoScratchpad(item.content, `Pasted clipboard #${item.rank} (${item.app})`)
          }
        }
      }
    }

    const onKeyUp = (e) => {
      if (
        overlayOpen &&
        holdingModifier &&
        !overlaySearchActive &&
        (e.key === 'Meta' || e.key === 'Control')
      ) {
        handleReleasePasteOverlay()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [
    activePopoverList,
    activeTab,
    composerOpen,
    filteredOverlayItems.length,
    flashKey,
    handleActivateSnippet,
    handlePromoteClipboardToSnippet,
    handleReleasePasteOverlay,
    holdingModifier,
    libraryOpen,
    overlayOpen,
    overlayQuery,
    overlaySearchActive,
    pasteIntoScratchpad,
    popoverOpen,
    popoverQuery,
    safePopoverIndex,
  ])

  const allLibraryTags = useMemo(() => {
    const counts = {}
    snippets.forEach((s) => {
      s.tags.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1
      })
    })
    return Object.entries(counts)
  }, [snippets])

  const libraryFilteredSnippets = useMemo(() => {
    if (libraryFilter === 'all') return snippets
    if (libraryFilter === 'pinned') return snippets.filter((s) => s.pinned)
    if (libraryFilter === 'secrets') return snippets.filter((s) => s.isSecret)
    return snippets.filter((s) => s.tags.includes(libraryFilter))
  }, [libraryFilter, snippets])

  const selectedLibrarySnippet =
    snippets.find((s) => s.id === librarySelectedId) || libraryFilteredSnippets[0] || null

  const handleLibraryEdit = (field, value) => {
    if (!selectedLibrarySnippet) return
    setSnippets((prev) =>
      prev.map((s) => (s.id === selectedLibrarySnippet.id ? { ...s, [field]: value } : s))
    )
  }

  const handleFocusSandbox = () => {
    stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setPopoverOpen(true)
    setOverlayOpen(false)
    setLibraryOpen(false)
    setTimeout(() => popoverSearchRef.current?.focus(), 220)
  }

  return (
    <section id="top" className="relative pt-14 pb-20 lg:pt-20 lg:pb-28">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
        {/* Centered Editorial Hero Copy */}
        <div className="mx-auto max-w-[780px] text-center">
          <h1 className="hero-headline text-[#0B0E14] dark:text-[#F2EFE9]">
            <span className="block">Snippets by heart.</span>
            <span className="block text-[#475569] dark:text-titanium-300">
              Clipboard by reflex.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-[60ch] text-[16px] sm:text-[17px] leading-[1.65] text-[#475569] dark:text-[#9CA6B5]">
            A native Swift menu bar utility for macOS. Search curated snippets with{' '}
            <Keycap size="sm" className="mx-0.5 align-baseline">
              ⌘⇧Space
            </Keycap>{' '}
            or cycle, search, and release-paste your clipboard stack with{' '}
            <Keycap size="sm" className="mx-0.5 align-baseline">
              ⌘⇧V
            </Keycap>
            .
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <a
              href="#download"
              id="hero-download-cta"
              className="btn-titanium inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-[15px] font-semibold whitespace-nowrap shrink-0"
            >
              <ArrowDownToLine className="h-4 w-4" strokeWidth={2} />
              Download for macOS
            </a>
            <button
              type="button"
              id="hero-sandbox-cta"
              onClick={handleFocusSandbox}
              className="btn-ghost inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-[15px] font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              Try Live Sandbox
            </button>
          </div>

          {/* Zero-Pill Metadata Line */}
          <p className="mt-6 text-[13px] font-medium text-[#64748B] dark:text-[#667182]">
            macOS 14 Sonoma &amp; newer · Native SwiftUI &amp; AppKit · Zero Telemetry · Free &amp; Open Source
          </p>
        </div>

        {/* Dominant Focal Anchor: Authentic Interactive macOS Desktop Stage */}
        <div
          id="playground"
          ref={stageRef}
          className="mt-14 lg:mt-16 scroll-mt-24"
          aria-label="Interactive SnipBar macOS Desktop Simulator"
        >
          {/* Interactive Keyboard & Trigger Strip */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#475569] dark:text-[#9CA6B5]">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                id="trigger-overlay-btn"
                onClick={() => {
                  flashKey('cmdShiftV')
                  setLibraryOpen(false)
                  setOverlayOpen((prev) => !prev)
                  setOverlaySearchActive(false)
                  setOverlayQuery('')
                  setOverlaySelectedIdx(0)
                }}
                className="inline-flex items-center gap-2 rounded-md border border-slate-900/12 dark:border-white/[0.12] bg-white dark:bg-[#10151E] px-2.5 py-1.5 text-[12px] font-medium text-[#0B0E14] dark:text-[#F2EFE9] hover:border-cobalt-600/50 dark:hover:border-cobalt-400/50 transition-colors cursor-pointer"
              >
                <Keycap active={pressedKeys.cmdShiftV || overlayOpen}>⌘⇧V</Keycap>
                <span>{overlayOpen ? 'Close Clipboard Overlay' : 'Try ⌘⇧V Overlay'}</span>
              </button>

              <button
                type="button"
                id="trigger-tab-btn"
                onClick={() => {
                  flashKey('tab')
                  setOverlayOpen(false)
                  setLibraryOpen(false)
                  setPopoverOpen(true)
                  setActiveTab((prev) => (prev === 'snippets' ? 'clipboard' : 'snippets'))
                  setSelectedIndex(0)
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-900/10 dark:border-white/[0.08] bg-white/70 dark:bg-[#10151E]/80 px-2.5 py-1.5 hover:border-slate-900/20 dark:hover:border-white/[0.16] transition-colors cursor-pointer"
              >
                <Keycap active={pressedKeys.tab}>Tab</Keycap>
                <span>Flip Mode</span>
              </button>

              <button
                type="button"
                id="trigger-search50-btn"
                onClick={() => {
                  flashKey('cmdF')
                  setLibraryOpen(false)
                  setOverlayOpen(true)
                  setOverlaySearchActive(true)
                  setOverlayQuery('#50')
                  setOverlaySelectedIdx(0)
                  setTimeout(() => overlaySearchRef.current?.focus(), 40)
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-900/10 dark:border-white/[0.08] bg-white/70 dark:bg-[#10151E]/80 px-2.5 py-1.5 hover:border-slate-900/20 dark:hover:border-white/[0.16] transition-colors cursor-pointer"
              >
                <Keycap active={pressedKeys.cmdF || overlaySearchActive}>⌘F</Keycap>
                <span>Find #50</span>
              </button>

              <button
                type="button"
                id="trigger-new-snippet-btn"
                onClick={() => {
                  flashKey('cmdN')
                  setOverlayOpen(false)
                  setLibraryOpen(false)
                  setPopoverOpen(true)
                  setComposerOpen((prev) => !prev)
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-900/10 dark:border-white/[0.08] bg-white/70 dark:bg-[#10151E]/80 px-2.5 py-1.5 hover:border-slate-900/20 dark:hover:border-white/[0.16] transition-colors cursor-pointer"
              >
                <Keycap active={pressedKeys.cmdN || composerOpen}>⌘N</Keycap>
                <span>New Snippet</span>
              </button>

              <button
                type="button"
                id="trigger-library-btn"
                onClick={() => {
                  flashKey('cmdL')
                  setOverlayOpen(false)
                  setLibraryOpen((prev) => !prev)
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-900/10 dark:border-white/[0.08] bg-white/70 dark:bg-[#10151E]/80 px-2.5 py-1.5 hover:border-slate-900/20 dark:hover:border-white/[0.16] transition-colors cursor-pointer"
              >
                <Keycap active={pressedKeys.cmdL || libraryOpen}>⌘L</Keycap>
                <span>Library</span>
              </button>
            </div>

            <span className="hidden lg:inline font-mono text-[11px] text-[#64748B] dark:text-[#667182]">
              Live interactive simulator · Press real keys or click controls
            </span>
          </div>

          {/* macOS Stage Chassis (r_outer = 16px, single elevation layer) */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-900/12 dark:border-white/[0.10] bg-[#E8ECF2] dark:bg-[#0D1118] shadow-[0_32px_90px_-24px_rgba(0,0,0,0.24)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
            {/* Subtle brushed studio lighting inside desktop backdrop */}
            <div
              className="pointer-events-none absolute inset-0 opacity-90 dark:opacity-100"
              style={{
                background:
                  'radial-gradient(80% 60% at 22% 14%, rgba(242, 239, 233, 0.06) 0%, transparent 62%), radial-gradient(60% 50% at 84% 80%, rgba(56, 189, 248, 0.05) 0%, transparent 65%)',
              }}
            />

            {/* Authentic macOS Menu Bar */}
            <div className="relative z-20 flex h-8 items-center justify-between border-b border-slate-900/[0.08] dark:border-white/[0.08] bg-white/75 dark:bg-[#0B0F16]/85 px-4 text-[12px] backdrop-blur-md select-none">
              <div className="flex items-center gap-4 text-[#0B0E14] dark:text-[#F2EFE9]">
                <span className="font-display font-bold tracking-tight"></span>
                <span className="font-semibold">Xcode</span>
                <span className="hidden sm:inline text-[#475569] dark:text-[#9CA6B5]">File</span>
                <span className="hidden sm:inline text-[#475569] dark:text-[#9CA6B5]">Edit</span>
                <span className="hidden sm:inline text-[#475569] dark:text-[#9CA6B5]">View</span>
                <span className="hidden md:inline text-[#475569] dark:text-[#9CA6B5]">Product</span>
              </div>

              <div className="flex items-center gap-3 text-[#0B0E14] dark:text-[#F2EFE9]">
                <button
                  type="button"
                  id="menubar-snipbar-btn"
                  onClick={() => {
                    setOverlayOpen(false)
                    setPopoverOpen((prev) => !prev)
                  }}
                  title="Toggle SnipBar Menu Bar Popover (⌘⇧Space)"
                  className={[
                    'inline-flex h-6 items-center gap-1.5 rounded px-2 transition-colors cursor-pointer',
                    popoverOpen
                      ? 'bg-cobalt-600/15 dark:bg-cobalt-400/20 text-cobalt-600 dark:text-cobalt-400'
                      : 'hover:bg-slate-900/10 dark:hover:bg-white/10',
                  ].join(' ')}
                >
                  <SnipBarMenuIcon size={13} />
                  <span className="hidden sm:inline font-mono text-[10px] font-medium">SnipBar</span>
                </button>
                <Wifi className="h-3.5 w-3.5 text-[#475569] dark:text-[#9CA6B5]" />
                <BatteryMedium className="h-4 w-4 text-[#475569] dark:text-[#9CA6B5]" />
                <span className="font-mono text-[11px] tabular-nums text-[#475569] dark:text-[#9CA6B5]">
                  {clock}
                </span>
              </div>
            </div>

            {/* Desktop Canvas Body */}
            <div className="relative z-10 grid min-h-[540px] lg:min-h-[560px] grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-6">
              {/* Left Background App Window: Target Document Scratchpad */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div
                  className={[
                    'flex h-full flex-col overflow-hidden rounded-xl border transition-colors duration-150',
                    'bg-white/90 dark:bg-[#10151E]/95',
                    pasteFlash
                      ? 'border-cobalt-600/70 dark:border-cobalt-400/70'
                      : 'border-slate-900/10 dark:border-white/[0.08]',
                  ].join(' ')}
                >
                  {/* macOS Window Titlebar */}
                  <div className="flex items-center justify-between border-b border-slate-900/[0.07] dark:border-white/[0.06] px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-white/15" />
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-white/15" />
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-white/15" />
                      <span className="ml-2 font-mono text-[11px] font-medium text-[#475569] dark:text-[#9CA6B5]">
                        ReleaseNotes.md — Target Scratchpad
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        id="push-to-clipboard-btn"
                        onClick={handleCopyScratchpadToClipboard}
                        className="font-mono text-[11px] text-cobalt-600 dark:text-cobalt-400 hover:underline cursor-pointer"
                        title="Push the last line of this editor onto slot #1 of the 50-entry clipboard stack"
                      >
                        + Copy to #1
                      </button>
                      <span className="text-slate-300 dark:text-white/15">·</span>
                      <button
                        type="button"
                        id="clear-scratchpad-btn"
                        onClick={() => setScratchpad('')}
                        className="font-mono text-[11px] text-[#64748B] dark:text-[#667182] hover:text-[#0B0E14] dark:hover:text-[#F2EFE9] cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Editable Scratchpad Area */}
                  <textarea
                    id="sandbox-scratchpad"
                    value={scratchpad}
                    onChange={(e) => setScratchpad(e.target.value)}
                    spellCheck={false}
                    aria-label="Target document scratchpad for testing SnipBar paste"
                    className="macos-scroll flex-1 min-h-[220px] lg:min-h-[380px] w-full resize-none bg-transparent p-4 font-mono text-[12.5px] leading-[1.7] text-[#0B0E14] dark:text-[#E2E6ED] placeholder:text-[#64748B] focus:outline-none"
                    placeholder="Select a snippet or release-paste from ⌘⇧V to insert text here…"
                  />

                  {/* Subtle Status Footer */}
                  <div className="flex items-center justify-between border-t border-slate-900/[0.07] dark:border-white/[0.06] px-4 py-2 font-mono text-[11px] tabular-nums text-[#64748B] dark:text-[#667182]">
                    <span>
                      {pasteFlash ? (
                        <span className="text-cobalt-600 dark:text-cobalt-400">
                          Inserted via SnipBar Auto-Paste
                        </span>
                      ) : (
                        'Focused target app · Ready to receive paste'
                      )}
                    </span>
                    <span>{scratchpad.split('\n').length} lines</span>
                  </div>
                </div>
              </div>

              {/* Right Anchored Floating SnipBar Menu Bar Popover */}
              <div className="lg:col-span-6 flex flex-col items-stretch lg:items-end">
                {popoverOpen ? (
                  <div
                    id="snipbar-popover"
                    className="surface-hud animate-macos-settle flex w-full max-w-[490px] flex-col overflow-hidden rounded-xl"
                  >
                    {/* Popover Mode Tabs (Snippets <-> Clipboard) */}
                    <div className="flex items-center justify-between border-b border-slate-900/[0.08] dark:border-white/[0.08] px-3 py-2.5">
                      <div
                        role="tablist"
                        aria-label="SnipBar Popover Modes"
                        className="inline-flex rounded-lg bg-slate-900/[0.05] dark:bg-white/[0.05] p-0.5"
                      >
                        <button
                          type="button"
                          role="tab"
                          id="popover-tab-snippets"
                          aria-selected={activeTab === 'snippets'}
                          onClick={() => {
                            setActiveTab('snippets')
                            setComposerOpen(false)
                            setSelectedIndex(0)
                          }}
                          className={[
                            'rounded-md px-3 py-1 text-[12.5px] font-medium transition-colors cursor-pointer',
                            activeTab === 'snippets'
                              ? 'bg-white dark:bg-[#1B2433] text-[#0B0E14] dark:text-[#F2EFE9] shadow-xs'
                              : 'text-[#475569] dark:text-[#9CA6B5] hover:text-[#0B0E14] dark:hover:text-[#F2EFE9]',
                          ].join(' ')}
                        >
                          Snippets{' '}
                          <span className="ml-1 font-mono text-[11px] tabular-nums opacity-65">
                            {snippets.length}
                          </span>
                        </button>
                        <button
                          type="button"
                          role="tab"
                          id="popover-tab-clipboard"
                          aria-selected={activeTab === 'clipboard'}
                          onClick={() => {
                            setActiveTab('clipboard')
                            setComposerOpen(false)
                            setSelectedIndex(0)
                          }}
                          className={[
                            'rounded-md px-3 py-1 text-[12.5px] font-medium transition-colors cursor-pointer',
                            activeTab === 'clipboard'
                              ? 'bg-white dark:bg-[#1B2433] text-[#0B0E14] dark:text-[#F2EFE9] shadow-xs'
                              : 'text-[#475569] dark:text-[#9CA6B5] hover:text-[#0B0E14] dark:hover:text-[#F2EFE9]',
                          ].join(' ')}
                        >
                          Clipboard{' '}
                          <span className="ml-1 font-mono text-[11px] tabular-nums opacity-65">
                            {clipboard.length}
                          </span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          id="popover-new-btn"
                          onClick={() => setComposerOpen((prev) => !prev)}
                          title="New Snippet (⌘N)"
                          className={[
                            'inline-flex h-7 items-center gap-1 rounded-md px-2 text-[12px] font-medium transition-colors cursor-pointer',
                            composerOpen
                              ? 'bg-cobalt-600/15 dark:bg-cobalt-400/20 text-cobalt-600 dark:text-cobalt-400'
                              : 'text-[#475569] dark:text-[#9CA6B5] hover:bg-slate-900/[0.06] dark:hover:bg-white/[0.07] hover:text-[#0B0E14] dark:hover:text-[#F2EFE9]',
                          ].join(' ')}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>New</span>
                        </button>
                        <button
                          type="button"
                          id="popover-library-btn"
                          onClick={() => setLibraryOpen(true)}
                          title="Open 3-Column Library (⌘L)"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#475569] dark:text-[#9CA6B5] hover:bg-slate-900/[0.06] dark:hover:bg-white/[0.07] hover:text-[#0B0E14] dark:hover:text-[#F2EFE9] cursor-pointer"
                        >
                          <PanelLeft className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {composerOpen ? (
                      /* Inline ⌘N New Snippet Composer */
                      <form onSubmit={handleCreateSnippet} className="flex flex-col gap-3 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-semibold text-[#0B0E14] dark:text-[#F2EFE9]">
                            New Snippet
                          </span>
                          <button
                            type="button"
                            onClick={() => setComposerOpen(false)}
                            className="text-[11px] font-mono text-[#64748B] dark:text-[#667182] hover:text-[#0B0E14] dark:hover:text-[#F2EFE9] cursor-pointer"
                          >
                            Esc to cancel
                          </button>
                        </div>

                        <input
                          type="text"
                          id="composer-title-input"
                          required
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="Snippet title (e.g. Deploy Canary)"
                          className="w-full rounded-lg border border-slate-900/12 dark:border-white/[0.10] bg-white/80 dark:bg-[#090C11]/70 px-3 py-2 text-[13px] text-[#0B0E14] dark:text-[#F2EFE9] placeholder:text-[#64748B] focus:border-cobalt-400 focus:outline-none"
                        />

                        <input
                          type="text"
                          id="composer-tags-input"
                          value={newTags}
                          onChange={(e) => setNewTags(e.target.value)}
                          placeholder="#sql, #ops"
                          className="w-full rounded-lg border border-slate-900/12 dark:border-white/[0.10] bg-white/80 dark:bg-[#090C11]/70 px-3 py-1.5 font-mono text-[12px] text-[#0B0E14] dark:text-[#F2EFE9] placeholder:text-[#64748B] focus:border-cobalt-400 focus:outline-none"
                        />

                        <textarea
                          id="composer-body-input"
                          required
                          rows={4}
                          value={newBody}
                          onChange={(e) => setNewBody(e.target.value)}
                          placeholder="Body text… supports {{date}}, {{time}}, and {{clipboard}}"
                          className="w-full resize-none rounded-lg border border-slate-900/12 dark:border-white/[0.10] bg-white/80 dark:bg-[#090C11]/70 px-3 py-2 font-mono text-[12px] text-[#0B0E14] dark:text-[#F2EFE9] placeholder:text-[#64748B] focus:border-cobalt-400 focus:outline-none"
                        />

                        <div className="flex items-center justify-between pt-1">
                          <label className="inline-flex items-center gap-2 text-[12px] text-[#475569] dark:text-[#9CA6B5] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newSecret}
                              onChange={(e) => setNewSecret(e.target.checked)}
                              className="h-3.5 w-3.5 rounded accent-cobalt-400"
                            />
                            <span>Mask as Secret (Touch ID)</span>
                          </label>

                          <button
                            type="submit"
                            id="composer-save-btn"
                            className="btn-titanium rounded-md px-3.5 py-1.5 text-[12px] font-semibold cursor-pointer"
                          >
                            Save Snippet
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        {/* Search Input */}
                        <div className="flex items-center gap-2 border-b border-slate-900/[0.07] dark:border-white/[0.06] px-3.5 py-2.5">
                          <Search className="h-3.5 w-3.5 shrink-0 text-[#64748B] dark:text-[#667182]" />
                          <input
                            ref={popoverSearchRef}
                            id="popover-search-input"
                            type="text"
                            value={popoverQuery}
                            onChange={(e) => {
                              setPopoverQuery(e.target.value)
                              setSelectedIndex(0)
                            }}
                            placeholder={
                              activeTab === 'snippets'
                                ? 'Search snippets or type #sql, #git, #swift…'
                                : 'Filter recent clipboard entries by text or app…'
                            }
                            className="w-full bg-transparent text-[13px] text-[#0B0E14] dark:text-[#F2EFE9] placeholder:text-[#64748B] dark:placeholder:text-[#667182] focus:outline-none"
                          />
                          {popoverQuery ? (
                            <button
                              type="button"
                              onClick={() => setPopoverQuery('')}
                              aria-label="Clear search"
                              className="text-[#64748B] hover:text-[#0B0E14] dark:hover:text-[#F2EFE9] cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          ) : activeTab === 'snippets' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setPopoverQuery('#sql')
                                setSelectedIndex(0)
                                popoverSearchRef.current?.focus()
                              }}
                              className="font-mono text-[11px] text-cobalt-600 dark:text-cobalt-400 hover:underline whitespace-nowrap cursor-pointer"
                            >
                              Try #sql
                            </button>
                          ) : (
                            <span className="font-mono text-[11px] tabular-nums text-[#64748B] dark:text-[#667182] whitespace-nowrap">
                              {filteredPopoverClipboard.length}/50
                            </span>
                          )}
                        </div>

                        {/* List View */}
                        <div className="macos-scroll max-h-[348px] overflow-y-auto divide-y divide-slate-900/[0.05] dark:divide-white/[0.05]">
                          {activePopoverList.length === 0 ? (
                            <div className="px-4 py-10 text-center text-[13px] text-[#64748B] dark:text-[#667182]">
                              No matching entries for <span className="font-mono">“{popoverQuery}”</span>
                            </div>
                          ) : activeTab === 'snippets' ? (
                            filteredSnippets.map((snip, idx) => {
                              const isSelected = idx === safePopoverIndex
                              const hasVars = /\{\{(date|time|clipboard)\}\}/.test(snip.body)
                              return (
                                <div
                                  key={snip.id}
                                  onMouseEnter={() => setSelectedIndex(idx)}
                                  onClick={() => handleActivateSnippet(snip)}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault()
                                      handleActivateSnippet(snip)
                                    }
                                  }}
                                  className={[
                                    'group flex items-start justify-between gap-3 px-3.5 py-2.5 text-left transition-colors duration-150 cursor-pointer',
                                    isSelected
                                      ? 'bg-cobalt-600/[0.08] dark:bg-cobalt-400/[0.11]'
                                      : 'hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.03]',
                                  ].join(' ')}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      {snip.pinned && (
                                        <Pin className="h-3 w-3 shrink-0 text-cobalt-600 dark:text-cobalt-400" />
                                      )}
                                      {snip.isSecret && (
                                        <Lock className="h-3 w-3 shrink-0 text-secret-400" />
                                      )}
                                      <span className="truncate text-[13px] font-medium text-[#0B0E14] dark:text-[#F2EFE9]">
                                        {snip.title}
                                      </span>
                                      {hasVars && (
                                        <span className="font-mono text-[10px] text-cobalt-600 dark:text-cobalt-400 shrink-0">
                                          {'{{var}}'}
                                        </span>
                                      )}
                                    </div>
                                    <p className="mt-0.5 truncate font-mono text-[11.5px] text-[#475569] dark:text-[#9CA6B5]">
                                      {snip.isSecret
                                        ? '••••••••••••••••••••••••••••'
                                        : snip.body.replace(/\n/g, ' ')}
                                    </p>
                                    <div className="mt-1 flex items-center gap-2 font-mono text-[10.5px] text-[#64748B] dark:text-[#667182]">
                                      {snip.tags.map((tag) => (
                                        <span key={tag}>#{tag}</span>
                                      ))}
                                      <span>·</span>
                                      <span>{snip.updatedAt}</span>
                                    </div>
                                  </div>

                                  <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
                                    {snip.isSecret ? (
                                      <span className="inline-flex items-center gap-1 font-mono text-[10.5px] text-secret-400">
                                        <Fingerprint className="h-3.5 w-3.5" />
                                        Touch ID
                                      </span>
                                    ) : (
                                      <span
                                        className={[
                                          'inline-flex items-center gap-1 font-mono text-[10.5px]',
                                          isSelected
                                            ? 'text-cobalt-600 dark:text-cobalt-400'
                                            : 'text-[#64748B] dark:text-[#667182] opacity-0 group-hover:opacity-100',
                                        ].join(' ')}
                                      >
                                        <Copy className="h-3 w-3" />
                                        Paste
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )
                            })
                          ) : (
                            filteredPopoverClipboard.map((item, idx) => {
                              const isSelected = idx === safePopoverIndex
                              return (
                                <div
                                  key={item.id}
                                  onMouseEnter={() => setSelectedIndex(idx)}
                                  onClick={() =>
                                    pasteIntoScratchpad(
                                      item.content,
                                      `Pasted clipboard #${item.rank} (${item.app})`
                                    )
                                  }
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault()
                                      pasteIntoScratchpad(
                                        item.content,
                                        `Pasted clipboard #${item.rank} (${item.app})`
                                      )
                                    }
                                  }}
                                  className={[
                                    'group flex items-start justify-between gap-3 px-3.5 py-2.5 text-left transition-colors duration-150 cursor-pointer',
                                    isSelected
                                      ? 'bg-cobalt-600/[0.08] dark:bg-cobalt-400/[0.11]'
                                      : 'hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.03]',
                                  ].join(' ')}
                                >
                                  <span className="mt-0.5 w-8 shrink-0 font-mono text-[11px] font-medium tabular-nums text-cobalt-600 dark:text-cobalt-400">
                                    #{item.rank}
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate font-mono text-[12px] text-[#0B0E14] dark:text-[#F2EFE9]">
                                      {item.content}
                                    </p>
                                    <p className="mt-0.5 font-mono text-[10.5px] text-[#64748B] dark:text-[#667182]">
                                      {item.app} · {item.timeAgo} · {item.charCount} chars
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handlePromoteClipboardToSnippet(item)
                                    }}
                                    title="Save as Snippet"
                                    className="shrink-0 rounded p-1 text-[#64748B] hover:bg-slate-900/10 dark:hover:bg-white/10 hover:text-[#0B0E14] dark:hover:text-[#F2EFE9] cursor-pointer"
                                  >
                                    <BookmarkPlus className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )
                            })
                          )}
                        </div>

                        {/* Popover Footer Hints */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-900/[0.07] dark:border-white/[0.06] bg-slate-900/[0.02] dark:bg-black/20 px-3.5 py-2 font-mono text-[10.5px] text-[#64748B] dark:text-[#667182]">
                          <span>Tab Switch · ↑↓ Select · ↵ Paste</span>
                          <button
                            type="button"
                            onClick={() => {
                              setOverlayOpen(true)
                              setOverlaySearchActive(false)
                              setOverlayQuery('')
                            }}
                            className="text-cobalt-600 dark:text-cobalt-400 hover:underline cursor-pointer"
                          >
                            Open ⌘⇧V Stack →
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex h-full min-h-[240px] w-full max-w-[490px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-900/15 dark:border-white/[0.12] p-8 text-center">
                    <p className="text-[14px] font-medium text-[#0B0E14] dark:text-[#F2EFE9]">
                      SnipBar is tucked quietly in the menu bar.
                    </p>
                    <p className="mt-1 text-[13px] text-[#475569] dark:text-[#9CA6B5]">
                      Click the SnipBar icon in the menu bar above or open the popover.
                    </p>
                    <button
                      type="button"
                      onClick={() => setPopoverOpen(true)}
                      className="btn-ghost mt-4 rounded-lg px-4 py-2 text-[13px] font-medium cursor-pointer"
                    >
                      Open Popover (⌘⇧Space)
                    </button>
                  </div>
                )}
              </div>

              {/* ⌘⇧V Direct Clipboard History Overlay (HUD Bezel) */}
              {overlayOpen && (
                <div
                  id="cmd-shift-v-overlay"
                  role="dialog"
                  aria-label="SnipBar ⌘⇧V 50-Entry Clipboard Overlay"
                  className="absolute inset-0 z-30 flex items-center justify-center bg-black/35 dark:bg-black/55 p-3 sm:p-6 backdrop-blur-[2px]"
                >
                  <div className="surface-hud animate-macos-settle flex w-full max-w-[780px] flex-col overflow-hidden rounded-2xl">
                    {/* Overlay Top Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/[0.08] dark:border-white/[0.08] px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Keycap active>⌘⇧V</Keycap>
                        <span className="font-display text-[13.5px] font-semibold text-[#0B0E14] dark:text-[#F2EFE9]">
                          Direct Clipboard Stack
                        </span>
                        <span className="font-mono text-[11px] tabular-nums text-[#64748B] dark:text-[#667182]">
                          {filteredOverlayItems.length} / 50 entries
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          id="overlay-search-toggle-btn"
                          onClick={() => {
                            setOverlaySearchActive(true)
                            setHoldingModifier(false)
                            setTimeout(() => overlaySearchRef.current?.focus(), 20)
                          }}
                          className="inline-flex items-center gap-1.5 rounded-md border border-slate-900/12 dark:border-white/[0.12] px-2.5 py-1 text-[12px] font-medium text-[#0B0E14] dark:text-[#F2EFE9] hover:border-cobalt-400/60 cursor-pointer"
                        >
                          <Search className="h-3 w-3" />
                          <span>Search</span>
                          <Keycap size="sm">⌘F</Keycap>
                        </button>
                        <button
                          type="button"
                          id="overlay-close-btn"
                          onClick={() => {
                            setOverlayOpen(false)
                            setHoldingModifier(false)
                          }}
                          aria-label="Close clipboard overlay"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#64748B] hover:bg-slate-900/10 dark:hover:bg-white/10 hover:text-[#0B0E14] dark:hover:text-[#F2EFE9] cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Inline Deep Search Bar (⌘F or /) */}
                    {overlaySearchActive && (
                      <div className="flex items-center gap-2.5 border-b border-slate-900/[0.08] dark:border-white/[0.08] bg-slate-900/[0.03] dark:bg-white/[0.03] px-4 py-2.5">
                        <Search className="h-3.5 w-3.5 shrink-0 text-cobalt-600 dark:text-cobalt-400" />
                        <input
                          ref={overlaySearchRef}
                          id="overlay-search-input"
                          type="text"
                          value={overlayQuery}
                          onChange={(e) => {
                            setOverlayQuery(e.target.value)
                            setOverlaySelectedIdx(0)
                          }}
                          placeholder="Search by text, source app (TablePlus, Terminal, Slack), or slot (#50)…"
                          className="w-full bg-transparent font-mono text-[12.5px] text-[#0B0E14] dark:text-[#F2EFE9] placeholder:text-[#64748B] focus:outline-none"
                        />
                        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                          {['#50', 'analytics', 'TablePlus'].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                setOverlayQuery(preset)
                                setOverlaySelectedIdx(0)
                              }}
                              className="rounded border border-slate-900/10 dark:border-white/[0.1] px-1.5 py-0.5 font-mono text-[10.5px] text-[#475569] dark:text-[#9CA6B5] hover:border-cobalt-400/60 hover:text-cobalt-600 dark:hover:text-cobalt-400 cursor-pointer"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2-Column Split: Entry Stack + Live Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-12 max-h-[340px]">
                      <div className="macos-scroll md:col-span-6 max-h-[300px] md:max-h-[340px] overflow-y-auto border-b md:border-b-0 md:border-r border-slate-900/[0.08] dark:border-white/[0.08] divide-y divide-slate-900/[0.05] dark:divide-white/[0.05]">
                        {filteredOverlayItems.length === 0 ? (
                          <div className="p-8 text-center text-[13px] text-[#64748B] dark:text-[#667182]">
                            No clipboard entry matches <span className="font-mono">“{overlayQuery}”</span>
                          </div>
                        ) : (
                          filteredOverlayItems.map((item, idx) => {
                            const isSelected = idx === safeOverlayIndex
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onMouseEnter={() => setOverlaySelectedIdx(idx)}
                                onClick={() => setOverlaySelectedIdx(idx)}
                                onDoubleClick={() => handleReleasePasteOverlay(item)}
                                className={[
                                  'flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left transition-colors cursor-pointer',
                                  isSelected
                                    ? 'bg-cobalt-600/[0.1] dark:bg-cobalt-400/[0.14]'
                                    : 'hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.03]',
                                ].join(' ')}
                              >
                                <span
                                  className={[
                                    'mt-0.5 w-8 shrink-0 font-mono text-[11px] font-semibold tabular-nums',
                                    isSelected
                                      ? 'text-cobalt-600 dark:text-cobalt-400'
                                      : 'text-[#64748B] dark:text-[#667182]',
                                  ].join(' ')}
                                >
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
                              </button>
                            )
                          })
                        )}
                      </div>

                      {/* Right Preview Pane */}
                      <div className="md:col-span-6 flex flex-col justify-between p-4 bg-slate-900/[0.02] dark:bg-black/20">
                        {activeOverlayItem ? (
                          <>
                            <div>
                              <div className="flex items-center justify-between font-mono text-[11px] text-[#64748B] dark:text-[#667182]">
                                <span>
                                  Slot <strong className="text-cobalt-600 dark:text-cobalt-400">#{activeOverlayItem.rank}</strong> · {activeOverlayItem.app}
                                </span>
                                <span className="tabular-nums">
                                  {activeOverlayItem.timeAgo} · {activeOverlayItem.charCount} chars
                                </span>
                              </div>
                              <pre className="macos-scroll mt-3 max-h-[180px] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-slate-900/[0.08] dark:border-white/[0.08] bg-white/80 dark:bg-[#090C11]/75 p-3 font-mono text-[12px] leading-[1.6] text-[#0B0E14] dark:text-[#F2EFE9]">
                                {activeOverlayItem.content}
                              </pre>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                id="overlay-release-paste-btn"
                                onClick={() => handleReleasePasteOverlay(activeOverlayItem)}
                                className="btn-titanium inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12.5px] font-semibold cursor-pointer"
                              >
                                <span>Release ⌘ to Auto-Paste</span>
                              </button>
                              <button
                                type="button"
                                id="overlay-promote-btn"
                                onClick={() => handlePromoteClipboardToSnippet(activeOverlayItem)}
                                className="btn-ghost inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium cursor-pointer"
                              >
                                <BookmarkPlus className="h-3.5 w-3.5" />
                                <span>Save as Snippet</span>
                                <Keycap size="sm" active={pressedKeys.s}>
                                  S
                                </Keycap>
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex h-full items-center justify-center text-[13px] text-[#64748B]">
                            Select an entry to preview
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Overlay Footer Instructions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-900/[0.08] dark:border-white/[0.08] px-4 py-2.5 font-mono text-[11px] text-[#64748B] dark:text-[#667182]">
                      <div className="flex flex-wrap items-center gap-3">
                        <span>Hold ⌘ + V cycle</span>
                        <span>Release ⌘ auto-paste</span>
                        <span>⌘F / filter</span>
                        <span>S promote to snippet</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setOverlaySelectedIdx((prev) =>
                            filteredOverlayItems.length > 0
                              ? (prev + 1) % filteredOverlayItems.length
                              : 0
                          )
                        }
                        className="text-cobalt-600 dark:text-cobalt-400 hover:underline cursor-pointer"
                      >
                        Cycle Next →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 3-Column Library Preview Modal (⌘L / ⌘,) */}
              {libraryOpen && (
                <div
                  id="library-window-modal"
                  role="dialog"
                  aria-label="SnipBar 3-Column Library"
                  className="absolute inset-0 z-30 flex items-center justify-center bg-black/35 dark:bg-black/55 p-3 sm:p-6 backdrop-blur-[2px]"
                >
                  <div className="surface-hud animate-macos-settle flex w-full max-w-[840px] flex-col overflow-hidden rounded-2xl">
                    <div className="flex items-center justify-between border-b border-slate-900/[0.08] dark:border-white/[0.08] px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-white/15" />
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-white/15" />
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-white/15" />
                        <span className="ml-2 font-display text-[13px] font-semibold text-[#0B0E14] dark:text-[#F2EFE9]">
                          SnipBar Library
                        </span>
                        <Keycap size="sm">⌘L</Keycap>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLibraryOpen(false)}
                        aria-label="Close Library"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#64748B] hover:bg-slate-900/10 dark:hover:bg-white/10 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 min-h-[340px]">
                      {/* Column 1: Collections & Tags */}
                      <div className="md:col-span-3 border-b md:border-b-0 md:border-r border-slate-900/[0.08] dark:border-white/[0.08] p-3 text-[12.5px]">
                        <div className="space-y-0.5">
                          {[
                            { id: 'all', label: 'All Snippets', count: snippets.length },
                            {
                              id: 'pinned',
                              label: 'Pinned',
                              count: snippets.filter((s) => s.pinned).length,
                            },
                            {
                              id: 'secrets',
                              label: 'Masked Secrets',
                              count: snippets.filter((s) => s.isSecret).length,
                            },
                          ].map((group) => (
                            <button
                              key={group.id}
                              type="button"
                              onClick={() => setLibraryFilter(group.id)}
                              className={[
                                'flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition-colors cursor-pointer',
                                libraryFilter === group.id
                                  ? 'bg-cobalt-600/12 dark:bg-cobalt-400/15 text-cobalt-600 dark:text-cobalt-400 font-medium'
                                  : 'text-[#475569] dark:text-[#9CA6B5] hover:bg-slate-900/[0.04] dark:hover:bg-white/[0.04]',
                              ].join(' ')}
                            >
                              <span className="inline-flex items-center gap-1.5">
                                <Folder className="h-3.5 w-3.5" />
                                {group.label}
                              </span>
                              <span className="font-mono text-[11px] tabular-nums opacity-70">
                                {group.count}
                              </span>
                            </button>
                          ))}
                        </div>

                        <div className="mt-4 border-t border-slate-900/[0.07] dark:border-white/[0.07] pt-3">
                          <p className="px-2.5 font-mono text-[10.5px] text-[#64748B] dark:text-[#667182]">
                            Tags
                          </p>
                          <div className="mt-1.5 space-y-0.5">
                            {allLibraryTags.map(([tag, count]) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => setLibraryFilter(tag)}
                                className={[
                                  'flex w-full items-center justify-between rounded-md px-2.5 py-1 font-mono text-[11.5px] cursor-pointer',
                                  libraryFilter === tag
                                    ? 'bg-cobalt-600/12 dark:bg-cobalt-400/15 text-cobalt-600 dark:text-cobalt-400'
                                    : 'text-[#475569] dark:text-[#9CA6B5] hover:bg-slate-900/[0.04] dark:hover:bg-white/[0.04]',
                                ].join(' ')}
                              >
                                <span>#{tag}</span>
                                <span className="tabular-nums opacity-70">{count}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Column 2: Snippet List */}
                      <div className="macos-scroll md:col-span-4 max-h-[340px] overflow-y-auto border-b md:border-b-0 md:border-r border-slate-900/[0.08] dark:border-white/[0.08] divide-y divide-slate-900/[0.05] dark:divide-white/[0.05]">
                        {libraryFilteredSnippets.map((snip) => {
                          const isSelected = selectedLibrarySnippet?.id === snip.id
                          return (
                            <button
                              key={snip.id}
                              type="button"
                              onClick={() => setLibrarySelectedId(snip.id)}
                              className={[
                                'w-full px-3.5 py-2.5 text-left transition-colors cursor-pointer',
                                isSelected
                                  ? 'bg-cobalt-600/10 dark:bg-cobalt-400/12'
                                  : 'hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.03]',
                              ].join(' ')}
                            >
                              <div className="flex items-center gap-1.5">
                                {snip.isSecret && <Lock className="h-3 w-3 text-secret-400" />}
                                <span className="truncate text-[12.5px] font-medium text-[#0B0E14] dark:text-[#F2EFE9]">
                                  {snip.title}
                                </span>
                              </div>
                              <p className="mt-0.5 truncate font-mono text-[11px] text-[#64748B] dark:text-[#667182]">
                                {snip.tags.map((t) => `#${t}`).join(' ')}
                              </p>
                            </button>
                          )
                        })}
                      </div>

                      {/* Column 3: Live Editor */}
                      <div className="md:col-span-5 flex flex-col p-4">
                        {selectedLibrarySnippet ? (
                          <>
                            <input
                              type="text"
                              value={selectedLibrarySnippet.title}
                              onChange={(e) => handleLibraryEdit('title', e.target.value)}
                              aria-label="Edit snippet title"
                              className="w-full border-b border-slate-900/[0.08] dark:border-white/[0.08] bg-transparent pb-2 font-display text-[15px] font-semibold text-[#0B0E14] dark:text-[#F2EFE9] focus:border-cobalt-400 focus:outline-none"
                            />
                            <textarea
                              value={
                                selectedLibrarySnippet.isSecret &&
                                !revealedIds[selectedLibrarySnippet.id]
                                  ? '••••••••••••••••••••••••••••••••'
                                  : selectedLibrarySnippet.body
                              }
                              readOnly={
                                selectedLibrarySnippet.isSecret &&
                                !revealedIds[selectedLibrarySnippet.id]
                              }
                              onChange={(e) => handleLibraryEdit('body', e.target.value)}
                              rows={7}
                              aria-label="Edit snippet body"
                              className="macos-scroll mt-3 flex-1 resize-none rounded-lg border border-slate-900/[0.08] dark:border-white/[0.08] bg-white/75 dark:bg-[#090C11]/70 p-3 font-mono text-[12px] leading-[1.6] text-[#0B0E14] dark:text-[#F2EFE9] focus:border-cobalt-400 focus:outline-none"
                            />
                            <div className="mt-3 flex items-center justify-between text-[11.5px]">
                              {selectedLibrarySnippet.isSecret ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRevealedIds((prev) => ({
                                      ...prev,
                                      [selectedLibrarySnippet.id]:
                                        !prev[selectedLibrarySnippet.id],
                                    }))
                                  }
                                  className="inline-flex items-center gap-1.5 font-mono text-secret-400 hover:underline cursor-pointer"
                                >
                                  {revealedIds[selectedLibrarySnippet.id] ? (
                                    <>
                                      <EyeOff className="h-3.5 w-3.5" /> Mask secret
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-3.5 w-3.5" /> Reveal via Touch ID
                                    </>
                                  )}
                                </button>
                              ) : (
                                <span className="inline-flex items-center gap-1 font-mono text-[#64748B] dark:text-[#667182]">
                                  <Sparkles className="h-3 w-3" />
                                  Changes sync to popover instantly
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setLibraryOpen(false)
                                  handleActivateSnippet(selectedLibrarySnippet)
                                }}
                                className="btn-titanium rounded-md px-3 py-1.5 text-[12px] font-semibold cursor-pointer"
                              >
                                Copy &amp; Paste
                              </button>
                            </div>
                          </>
                        ) : (
                          <p className="text-[13px] text-[#64748B]">Select a snippet to edit.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Crisp macOS Feedback Toast inside Stage */}
              {toast && (
                <div
                  role="status"
                  aria-live="polite"
                  className="pointer-events-none absolute bottom-4 left-1/2 z-40 -translate-x-1/2 animate-macos-settle"
                >
                  <div className="inline-flex items-center gap-2 rounded-lg border border-slate-900/12 dark:border-white/[0.14] bg-[#0B0E14] dark:bg-[#18202D] px-3.5 py-2 text-[12.5px] font-medium text-[#F2EFE9] shadow-lg">
                    <Check
                      className={
                        toast.tone === 'secure'
                          ? 'h-3.5 w-3.5 text-secure-400 shrink-0'
                          : 'h-3.5 w-3.5 text-cobalt-400 shrink-0'
                      }
                    />
                    <span className="whitespace-nowrap">{toast.message}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
