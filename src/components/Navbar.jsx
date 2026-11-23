import { useState } from 'react'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { GITHUB_REPO } from '../data/snipbarData'
import { SnipBarIcon } from './SnipBarIcon'

function GitHubMark({ className = 'h-4 w-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  )
}

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Playground', href: '#playground' },
  { label: 'Security', href: '#security' },
  { label: 'Download', href: '#download' },
]

export function Navbar({ isDark, onToggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 h-16 bg-[#F7F8FA]/82 dark:bg-[#090C11]/80 backdrop-blur-xl border-b border-slate-900/[0.07] dark:border-white/[0.06] transition-colors duration-150">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-4 px-6 lg:px-10">
        {/* Zone 1: Brand Lockup */}
        <a
          href="#top"
          id="nav-brand-link"
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group"
          aria-label="SnipBar home"
        >
          <SnipBarIcon
            size={24}
            className="transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
          <span className="font-display text-[15px] font-semibold tracking-[-0.02em] text-[#0B0E14] dark:text-[#F2EFE9]">
            SnipBar
          </span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              id={`nav-link-${item.label.toLowerCase()}`}
              className="relative py-1 text-[14px] font-medium text-[#475569] dark:text-[#9CA6B5] hover:text-[#0B0E14] dark:hover:text-[#F2EFE9] whitespace-nowrap shrink-0 transition-colors duration-150 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#0B0E14] dark:after:bg-[#F2EFE9] after:transition-[width] after:duration-150 hover:after:w-full"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: GitHub Link + Theme Toggle + Single Primary CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={GITHUB_REPO.url}
            target="_blank"
            rel="noreferrer"
            id="nav-github-link"
            aria-label="Go to SnipBar on GitHub"
            title="View SnipBar on GitHub"
            className="btn-ghost hidden sm:inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13.5px] font-medium whitespace-nowrap shrink-0"
          >
            <GitHubMark className="h-4 w-4" />
            <span>GitHub</span>
          </a>

          <button
            type="button"
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#475569] dark:text-[#9CA6B5] hover:text-[#0B0E14] dark:hover:text-[#F2EFE9] hover:bg-slate-900/[0.05] dark:hover:bg-white/[0.06] transition-colors duration-150 cursor-pointer"
          >
            {isDark ? <Sun className="h-4 w-4" strokeWidth={1.75} /> : <Moon className="h-4 w-4" strokeWidth={1.75} />}
          </button>

          <a
            href="#download"
            id="nav-download-cta"
            className="btn-titanium hidden sm:inline-flex items-center justify-center rounded-lg px-4 py-2 text-[14px] font-semibold whitespace-nowrap shrink-0"
          >
            Download for macOS
          </a>

          <button
            type="button"
            id="mobile-menu-btn"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#475569] dark:text-[#9CA6B5] hover:bg-slate-900/[0.05] dark:hover:bg-white/[0.06] cursor-pointer"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-slate-900/[0.08] dark:border-white/[0.08] bg-[#F7F8FA] dark:bg-[#090C11] px-6 py-4">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="py-1.5 text-[15px] font-medium text-[#0B0E14] dark:text-[#F2EFE9]"
              >
                {item.label}
              </a>
            ))}
            <a
              href={GITHUB_REPO.url}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMobileOpen(false)}
              className="btn-ghost mt-2 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-medium whitespace-nowrap"
            >
              <GitHubMark className="h-4 w-4" />
              <span>Go to GitHub</span>
            </a>
            <a
              href="#download"
              onClick={() => setMobileOpen(false)}
              className="btn-titanium inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-[14px] font-semibold whitespace-nowrap"
            >
              Download for macOS
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
