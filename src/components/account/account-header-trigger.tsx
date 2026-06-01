'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAppState } from '../app-state/app-state-provider'
import { HeaderPopover } from '../layout/header-popover'
import { AccountDropdown } from './account-dropdown'

function AccountIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? 'h-5 w-5'}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" strokeLinecap="round" />
    </svg>
  )
}

type Props = {
  isDark?: boolean
}

export function AccountHeaderTrigger({ isDark = false }: Props) {
  const { profile } = useAppState()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const accountActive =
    pathname === '/ingresar' ||
    pathname === '/registrarse' ||
    !!profile

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (window.matchMedia('(min-width: 1024px)').matches) {
        if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const btnClass =
    'relative inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition sm:h-10 sm:w-10 ' +
    (isDark
      ? 'text-white hover:bg-white/10'
      : 'text-neutral-900 hover:bg-neutral-100') +
    (accountActive
      ? isDark
        ? ' bg-white/15 ring-2 ring-white/30'
        : ' bg-neutral-100 ring-2 ring-neutral-300'
      : '')

  return (
    <div ref={rootRef} className="relative">
      <button
        id="site-account-trigger"
        type="button"
        aria-label={
          profile
            ? `Cuenta de ${profile.name || profile.email}`
            : 'Mi cuenta'
        }
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((o) => !o)}
        className={btnClass}
      >
        <AccountIcon />
        {profile ? (
          <span
            className={
              'absolute right-0.5 bottom-0.5 h-2 w-2 rounded-full ' +
              (isDark ? 'bg-emerald-400' : 'bg-emerald-500')
            }
            aria-hidden
          />
        ) : null}
      </button>

      <HeaderPopover open={open} onClose={() => setOpen(false)} zIndex={70}>
        <AccountDropdown onClose={() => setOpen(false)} />
      </HeaderPopover>
    </div>
  )
}
