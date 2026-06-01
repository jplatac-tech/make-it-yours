export function IconChevronDown({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconChevronUp({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Transparencia — gota, no cuadrícula (evita confusión con galería) */
export function IconOpacity({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        d="M12 2.5c-3.5 4-6 7.5-6 11a6 6 0 1012 0c0-3.5-2.5-7-6-11z"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconCorners({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path d="M5 9V5h4M15 5h4v4M19 15v4h-4M9 19H5v-4" strokeLinecap="round" />
    </svg>
  )
}

export function IconTextColor({ color }: { color: string }) {
  return (
    <span className="relative flex flex-col items-center leading-none" aria-hidden>
      <span className="text-base font-bold" style={{ color }}>
        A
      </span>
      <span
        className="mt-0.5 h-1 w-5 rounded-full"
        style={{ backgroundColor: color }}
      />
    </span>
  )
}

/** Editar texto (lápiz) */
export function IconEditText({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path d="M4 20h4l10-10-4-4L4 16v4z" strokeLinejoin="round" />
      <path d="M14 6l4 4" strokeLinecap="round" />
    </svg>
  )
}

export function IconCrop({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path d="M6 3v3M3 6h3M18 21v-3M21 18h-3M21 6h-3M18 3v3M6 21v-3M3 18h3" strokeLinecap="round" />
    </svg>
  )
}

export function IconFlip({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path d="M12 3v18M8 7l-4 4 4 4M16 7l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconRemoveBg({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path d="M4 16l4-4 4 4 8-8 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7" cy="7" r="2" />
    </svg>
  )
}

export function IconDuplicate({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <rect x="8" y="8" width="12" height="12" rx="1.5" />
      <path d="M4 16V6a2 2 0 012-2h10" strokeLinecap="round" />
    </svg>
  )
}

export function IconTrash({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path d="M4 7h16M9 7V5h6v2M10 11v6M14 11v6M6 7l1 12h10l1-12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconLayerUp({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path d="M12 19V5M7 10l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconLayerDown({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path d="M12 5v14M7 14l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconLayerFront({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="1" />
      <path d="M8 11V8a4 4 0 118 0v3" strokeLinecap="round" />
    </svg>
  )
}

export function IconLayerBack({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <rect x="5" y="3" width="14" height="10" rx="1" opacity={0.45} />
      <rect x="5" y="11" width="14" height="10" rx="1" />
    </svg>
  )
}

export function ToolbarDivider() {
  return <span className="mx-0.5 h-7 w-px shrink-0 bg-neutral-200" aria-hidden />
}
