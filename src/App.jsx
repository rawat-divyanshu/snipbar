import { useEffect, useRef, useState } from 'react'
import { BentoShowcase } from './components/BentoShowcase'
import { DownloadSection } from './components/DownloadSection'
import { DualEngineSection } from './components/DualEngineSection'
import { Footer } from './components/Footer'
import { HeroStage } from './components/HeroStage'
import { Navbar } from './components/Navbar'
import { SecuritySpecsSection } from './components/SecuritySpecsSection'
import { INITIAL_CLIPBOARD, INITIAL_SNIPPETS } from './data/snipbarData'

export default function App() {
  const [isDark, setIsDark] = useState(true)
  const [snippets, setSnippets] = useState(INITIAL_SNIPPETS)
  const [clipboard, setClipboard] = useState(INITIAL_CLIPBOARD)
  const stageApiRef = useRef(null)

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) {
      metaTheme.setAttribute('content', isDark ? '#090C11' : '#F7F8FA')
    }
  }, [isDark])

  const handleLaunchPlayground = (mode, query = '') => {
    const el = document.getElementById('playground')
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    stageApiRef.current?.launch(mode, query)
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#090C11] text-[#0B0E14] dark:text-[#F2EFE9] transition-colors duration-150">
      <Navbar isDark={isDark} onToggleTheme={() => setIsDark((prev) => !prev)} />
      <main>
        <HeroStage
          snippets={snippets}
          setSnippets={setSnippets}
          clipboard={clipboard}
          setClipboard={setClipboard}
          stageApiRef={stageApiRef}
        />
        <DualEngineSection onLaunchPlayground={handleLaunchPlayground} />
        <BentoShowcase clipboard={clipboard} />
        <SecuritySpecsSection />
        <DownloadSection />
      </main>
      <Footer />
    </div>
  )
}
