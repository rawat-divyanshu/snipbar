import { SECURITY_SPECS } from '../data/snipbarData'

export function SecuritySpecsSection() {
  return (
    <section
      id="security"
      className="border-t border-slate-900/[0.08] dark:border-white/[0.08] py-24 lg:py-32 scroll-mt-16"
    >
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Left Editorial Column */}
          <div className="lg:col-span-4">
            <h2 className="section-heading text-[#0B0E14] dark:text-[#F2EFE9]">
              Local-first by construction, not by policy.
            </h2>
            <p className="mt-4 text-[15.5px] leading-[1.65] text-[#475569] dark:text-[#9CA6B5]">
              SnipBar has no cloud backend, no account creation flow, and no telemetry pipeline.
              Everything lives inside your macOS user directory with strict file permissions and
              native OS security boundaries.
            </p>
            <p className="mt-6 font-mono text-[12px] text-[#64748B] dark:text-[#667182]">
              Swift 5.10 · SwiftUI · AppKit · SwiftData · LocalAuthentication
            </p>
          </div>

          {/* Right Hairline-Divided Specification Table */}
          <div className="lg:col-span-8">
            <div className="border-t border-slate-900/[0.1] dark:border-white/[0.1] divide-y divide-slate-900/[0.08] dark:divide-white/[0.08]">
              {SECURITY_SPECS.map((row) => (
                <div
                  key={row.category}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6 py-5"
                >
                  <div className="md:col-span-4">
                    <h3 className="font-display text-[14.5px] font-semibold text-[#0B0E14] dark:text-[#F2EFE9]">
                      {row.category}
                    </h3>
                  </div>
                  <div className="md:col-span-8">
                    <p className="font-mono text-[12.5px] font-medium tabular-nums text-cobalt-600 dark:text-cobalt-400">
                      {row.spec}
                    </p>
                    <p className="mt-1.5 text-[14px] leading-[1.6] text-[#475569] dark:text-[#9CA6B5]">
                      {row.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
