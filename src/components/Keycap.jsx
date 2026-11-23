export function Keycap({ children, active = false, size = 'sm', className = '' }) {
  const sizeClasses =
    size === 'md'
      ? 'text-[12px] px-2 py-0.5 rounded-[6px] min-w-[26px]'
      : 'text-[11px] px-1.5 py-0.5 rounded-[5px] min-w-[22px]'

  return (
    <kbd
      className={[
        'inline-flex items-center justify-center font-mono font-medium leading-tight tabular-nums select-none whitespace-nowrap',
        'transition-[transform,border-color,color,background-color] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]',
        sizeClasses,
        active
          ? 'translate-y-[1px] bg-cobalt-600/15 dark:bg-cobalt-400/15 border border-cobalt-600/70 dark:border-cobalt-400/70 text-cobalt-600 dark:text-cobalt-400 shadow-[0_0.5px_0_rgba(0,0,0,0.45),inset_0_1px_0_rgba(56,189,248,0.2)]'
          : 'bg-[#ECEFF4] dark:bg-[#18202D] text-[#0B0E14] dark:text-[#F2EFE9] border border-slate-900/15 dark:border-white/[0.14] shadow-[0_1.5px_0_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.85)] dark:shadow-[0_1.5px_0_rgba(0,0,0,0.68),inset_0_1px_0_rgba(255,255,255,0.12)]',
        className,
      ].join(' ')}
    >
      {children}
    </kbd>
  )
}
